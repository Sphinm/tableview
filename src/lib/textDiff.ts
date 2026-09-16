/**
 * Word-level diff for prose (Chinese + English).
 *
 * The right pane of the article polisher renders model output with insertions
 * highlighted, so the diff has to be token-accurate but must not blow up on a
 * 5,000-character article. Strategy:
 *
 *   1. Trim the common prefix/suffix (edits are usually local).
 *   2. Tokenise Chinese per character, Latin per word, punctuation per glyph.
 *   3. Run a full LCS when the DP table fits in a bounded budget
 *      (`MAX_DP_CELLS`); otherwise fall back to a line-anchored diff so
 *      untouched paragraphs stay "equal" instead of being flagged as rewritten.
 *
 * Whitespace is folded into the preceding token so the token stream rebuilds the
 * source text exactly.
 */

export type DiffOp = 'equal' | 'insert' | 'delete';

export interface DiffToken {
  text: string;
  op: DiffOp;
}

export interface DiffChange {
  /** 'insert' = text the model added, 'delete' = text it removed. */
  op: 'insert' | 'delete';
  text: string;
}

export interface DiffResult {
  /** Tokens covering the NEW text order, with deletions interleaved. */
  tokens: DiffToken[];
  /** Coarse change list, used when the model returns no rationale. */
  changes: DiffChange[];
  /** 0..1, share of tokens that survived unchanged. */
  similarity: number;
  addedChars: number;
  removedChars: number;
}

/** Keeps the LCS DP table around a few MB even for long articles. */
const MAX_DP_CELLS = 1_500_000;

const TOKEN_PATTERN = /[A-Za-z0-9_]+|[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]|[^\sA-Za-z0-9_\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]|\s+/g;

/**
 * Splits text into diff tokens.
 *
 * Each CJK ideograph is its own token (Chinese has no word delimiters), a run of
 * Latin letters/digits is one token, punctuation is one token, and any
 * whitespace is appended to the token before it so concatenating every token
 * reproduces the input byte-for-byte.
 */
export function tokenize(text: string): string[] {
  const normalised = text.replace(/\r\n?/g, '\n');
  const parts = normalised.match(TOKEN_PATTERN) ?? [];
  const tokens: string[] = [];

  for (const part of parts) {
    const isSpace = /^\s+$/.test(part);
    if (isSpace) {
      if (tokens.length > 0) {
        tokens[tokens.length - 1] += part;
      } else {
        tokens.push(part);
      }
    } else {
      tokens.push(part);
    }
  }

  return tokens;
}

/** True when the token contains a newline (i.e. ends a visual line). */
function endsLine(token: string): boolean {
  return token.includes('\n');
}

/**
 * Splits a token array into line groups. Each group is the tokens belonging to
 * one source line, including its trailing newline token.
 */
function groupByLine(tokens: string[]): string[][] {
  const lines: string[][] = [];
  let current: string[] = [];

  for (const token of tokens) {
    current.push(token);
    if (endsLine(token)) {
      lines.push(current);
      current = [];
    }
  }

  if (current.length > 0) lines.push(current);

  return lines;
}

function asTokens(tokens: string[], op: DiffOp): DiffToken[] {
  return tokens.map((text) => ({ text, op }));
}

/** Classic LCS backtrack over two token arrays. Caller must bound the size. */
function lcsTokens(a: string[], b: string[]): DiffToken[] {
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  const dp = new Int32Array((n + 1) * width);

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        a[i] === b[j]
          ? dp[(i + 1) * width + (j + 1)] + 1
          : Math.max(dp[(i + 1) * width + j], dp[i * width + (j + 1)]);
    }
  }

  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ text: a[i], op: 'equal' });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + (j + 1)]) {
      out.push({ text: a[i], op: 'delete' });
      i++;
    } else {
      out.push({ text: b[j], op: 'insert' });
      j++;
    }
  }

  while (i < n) out.push({ text: a[i++], op: 'delete' });
  while (j < m) out.push({ text: b[j++], op: 'insert' });

  return out;
}

function fitsInBudget(aLength: number, bLength: number): boolean {
  return (aLength + 1) * (bLength + 1) <= MAX_DP_CELLS;
}

/**
 * Diffs the region between the common prefix and suffix.
 *
 * When the region is too large for an exact LCS, it is diffed line-by-line
 * first: unchanged paragraphs then stay "equal", and only the line groups that
 * actually changed get a (budgeted) token-level diff.
 */
function diffMiddle(a: string[], b: string[]): DiffToken[] {
  if (a.length === 0) return asTokens(b, 'insert');
  if (b.length === 0) return asTokens(a, 'delete');

  if (fitsInBudget(a.length, b.length)) {
    return lcsTokens(a, b);
  }

  const aLines = groupByLine(a);
  const bLines = groupByLine(b);

  // A single enormous line (no newline to anchor on) cannot be split further.
  if (aLines.length < 2 && bLines.length < 2) {
    return [...asTokens(a, 'delete'), ...asTokens(b, 'insert')];
  }

  const lineDiff = lcsTokens(
    aLines.map((line) => line.join('')),
    bLines.map((line) => line.join(''))
  );

  const out: DiffToken[] = [];
  let pendingDelete: string[] = [];
  let pendingInsert: string[] = [];

  const flush = () => {
    if (pendingDelete.length === 0 && pendingInsert.length === 0) return;
    out.push(...diffMiddle(pendingDelete, pendingInsert));
    pendingDelete = [];
    pendingInsert = [];
  };

  for (const token of lineDiff) {
    if (token.op === 'equal') {
      flush();
      for (const group of groupByLine(tokenize(token.text))) {
        for (const t of group) out.push({ text: t, op: 'equal' });
      }
    } else if (token.op === 'delete') {
      pendingDelete.push(...tokenize(token.text));
    } else {
      pendingInsert.push(...tokenize(token.text));
    }
  }

  flush();
  return out;
}

/** Groups consecutive same-op runs into a coarse change list. */
export function buildChangeList(tokens: DiffToken[]): DiffChange[] {
  const changes: DiffChange[] = [];
  let currentOp: DiffOp | null = null;
  let buffer = '';

  const flush = () => {
    const text = buffer.trim();
    if (currentOp && currentOp !== 'equal' && text) {
      changes.push({ op: currentOp, text });
    }
    buffer = '';
  };

  for (const token of tokens) {
    if (token.op !== currentOp) {
      flush();
      currentOp = token.op;
    }
    buffer += token.text;
  }
  flush();

  return changes;
}

/**
 * Diffs two texts into a render-ready token stream plus a coarse change list.
 *
 * Insertions/deletions are returned in the NEW text's reading order so the
 * right-hand pane can render the polished article with inline highlights.
 */
export function diffText(oldText: string, newText: string): DiffResult {
  const a = tokenize(oldText);
  const b = tokenize(newText);

  const tokens = diffMiddle(a, b);

  let matched = 0;
  let addedChars = 0;
  let removedChars = 0;

  for (const token of tokens) {
    if (token.op === 'equal') {
      matched++;
    } else if (token.op === 'insert') {
      addedChars += token.text.length;
    } else {
      removedChars += token.text.length;
    }
  }

  const total = tokens.length;
  const similarity = total === 0 ? 1 : matched / total;

  return {
    tokens,
    changes: buildChangeList(tokens),
    similarity,
    addedChars,
    removedChars,
  };
}

/** Joins every token, including deletions. Rebuilds the NEW order with edits inline. */
export function detokenize(tokens: DiffToken[]): string {
  return tokens.map((t) => t.text).join('');
}

/**
 * Rebuilds the polished (new) text by dropping deleted tokens.
 * This is what "Copy" and "Export" hand to the user.
 */
export function newTextFromTokens(tokens: DiffToken[]): string {
  return tokens
    .filter((token) => token.op !== 'delete')
    .map((token) => token.text)
    .join('');
}

/** Rebuilds the original (old) text by dropping inserted tokens. */
export function oldTextFromTokens(tokens: DiffToken[]): string {
  return tokens
    .filter((token) => token.op !== 'insert')
    .map((token) => token.text)
    .join('');
}
