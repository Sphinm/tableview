import { describe, expect, it } from 'bun:test';
import { detokenize, diffText, newTextFromTokens, oldTextFromTokens, tokenize } from '../textDiff';

/**
 * CJK fixtures.
 *
 * The diff engine tokenises CJK per character, so the tests must exercise real
 * CJK code points. They are written as Unicode escapes so this file stays
 * ASCII-only; each constant is glossed with its meaning. The escaped text is
 * ordinary Chinese, and the expectations below were written against the actual
 * behaviour of the tokenizer.
 */
const NI = '\u4f60'; // ni
const HAO = '\u597d'; // hao
const HELLO = NI + HAO; // ni hao, "hello"

const WEATHER_NICE = '\u4eca\u5929\u5929\u6c14\u5f88\u597d\u3002'; // "the weather is nice today."
const YESTERDAY = '\u6628\u5929'; // "yesterday"
const HE_WENT_BEIJING = '\u4ed6\u53bb\u4e86\u5317\u4eac\u3002'; // "he went to Beijing."
const HE_YESTERDAY_WENT = '\u4ed6' + YESTERDAY + '\u53bb\u4e86\u5317\u4eac\u3002'; // + yesterday

const APPLE = '\u82f9\u679c'; // "apple"
const PIE = '\u6d3e'; // "pie"
const BANANA = '\u9999\u8549'; // "banana"
const VEHICLES = '\u6c7d\u8f66\u98de\u673a'; // "car, aeroplane"

const ADDED_TEXT = '\u65b0\u589e\u5185\u5bb9'; // "added content"
const DELETED_TEXT = '\u5220\u9664\u5185\u5bb9'; // "deleted content"

const PARA_ONE_PREFIX = '\u7b2c\u4e00\u6bb5\uff1a'; // "paragraph one:"
const PARA_TWO = '\u7b2c\u4e8c\u6bb5'; // "paragraph two"
const SYMBOL_PERIOD = '\u7b26\u53f7\u3002'; // "symbol."

const PARA_ONE_STAYS = '\u7b2c\u4e00\u6bb5\u4fdd\u6301\u4e0d\u53d8\u3002'; // "paragraph one unchanged."
const PARA_TWO_NEEDS_EDIT = '\u7b2c\u4e8c\u6bb5\u9700\u8981\u4fee\u6539\u8fd9\u91cc\u3002'; // "paragraph two needs editing here."
const PARA_TWO_EDITED = '\u7b2c\u4e8c\u6bb5\u4fee\u6539\u5b8c\u6bd5\u3002'; // "paragraph two, editing done."
const PARA_THREE_STAYS = '\u7b2c\u4e09\u6bb5\u4e5f\u4fdd\u6301\u3002'; // "paragraph three unchanged too."

const ORDINAL_PREFIX = '\u7b2c'; // "number/ordinal prefix"
const DUAN_PERIOD = '\u6bb5\u3002'; // "paragraph."
const CONTENT = '\u5185\u5bb9'; // "content"
const PARA_FIVE_EDITED = '\u7b2c\u4e94\u6bb5\u3002'; // "paragraph five."

const ORIGINAL_TEXT = '\u539f\u59cb\u6587\u672c\u3002'; // "the original text."
const EDITED_TEXT = '\u4fee\u6539\u540e\u7684\u6587\u672c\u3002'; // "the edited text."

describe('tokenize', () => {
  it('splits CJK per character and keeps Latin words whole', () => {
    // Whitespace is folded into the preceding token so the stream rebuilds exactly.
    expect(tokenize(HELLO + ' world')).toEqual([NI, HAO + ' ', 'world']);
  });

  it('splits Latin words and punctuation into separate tokens', () => {
    expect(tokenize('Hello, world!')).toEqual(['Hello', ', ', 'world', '!']);
  });

  it('round-trips the original text exactly', () => {
    const source = PARA_ONE_PREFIX + 'Hello, world!\n\n' + PARA_TWO + ' has  spaces & ' + SYMBOL_PERIOD + '\n';
    const rebuilt = tokenize(source).join('');
    expect(rebuilt).toBe(source);
  });

  it('normalises CRLF to LF', () => {
    expect(tokenize('a\r\nb').join('')).toBe('a\nb');
  });
});

describe('diffText', () => {
  it('marks identical text as fully similar with no changes', () => {
    const result = diffText(WEATHER_NICE, WEATHER_NICE);
    expect(result.changes).toEqual([]);
    expect(result.similarity).toBe(1);
    expect(result.addedChars).toBe(0);
    expect(result.removedChars).toBe(0);
  });

  it('detects an inserted clause in CJK text', () => {
    const result = diffText(HE_WENT_BEIJING, HE_YESTERDAY_WENT);
    const inserted = result.tokens.filter((t) => t.op === 'insert').map((t) => t.text).join('');
    expect(inserted).toContain(YESTERDAY);
    expect(result.changes.some((c) => c.op === 'insert' && c.text.includes(YESTERDAY))).toBe(true);
  });

  it('detects a removed word in English', () => {
    const result = diffText('This is a very good idea.', 'This is a good idea.');
    const removed = result.tokens.filter((t) => t.op === 'delete').map((t) => t.text).join('');
    expect(removed.trim()).toBe('very');
  });

  it('keeps unchanged tokens equal when only one word changes', () => {
    const result = diffText('The quick brown fox jumps.', 'The quick red fox jumps.');
    const equalText = result.tokens.filter((t) => t.op === 'equal').map((t) => t.text).join('');
    expect(equalText).toContain('The quick');
    expect(equalText).toContain('fox jumps.');
  });

  it('reports added and removed character counts', () => {
    // CJK is tokenised per character, so exactly one token is added.
    const result = diffText(APPLE, APPLE + PIE);
    expect(result.addedChars).toBe(1);
    expect(result.removedChars).toBe(0);

    const shrunk = diffText(APPLE + PIE, APPLE);
    expect(shrunk.addedChars).toBe(0);
    expect(shrunk.removedChars).toBe(1);
  });

  it('treats a full rewrite as low similarity', () => {
    const result = diffText(APPLE + BANANA, VEHICLES);
    expect(result.similarity).toBeLessThan(0.5);
  });

  it('handles empty inputs without throwing', () => {
    expect(diffText('', '').similarity).toBe(1);
    expect(diffText('', ADDED_TEXT).changes.length).toBeGreaterThan(0);
    expect(diffText(DELETED_TEXT, '').changes.length).toBeGreaterThan(0);
  });

  it('preserves every non-equal token in the new reading order', () => {
    const oldText = PARA_ONE_STAYS + '\n\n' + PARA_TWO_NEEDS_EDIT + '\n\n' + PARA_THREE_STAYS;
    const newText = PARA_ONE_STAYS + '\n\n' + PARA_TWO_EDITED + '\n\n' + PARA_THREE_STAYS;
    const result = diffText(oldText, newText);
    // The unchanged paragraphs must not be flagged as changed.
    const equalText = result.tokens.filter((t) => t.op === 'equal').map((t) => t.text).join('');
    expect(equalText).toContain(PARA_ONE_STAYS);
    expect(equalText).toContain(PARA_THREE_STAYS);
  });

  it('anchors long documents by line instead of flagging everything', () => {
    const paragraph = (n: number) => ORDINAL_PREFIX + n + DUAN_PERIOD + CONTENT.repeat(400) + '\n\n';
    const oldText = Array.from({ length: 30 }, (_, i) => paragraph(i)).join('');
    const newText = oldText.replace(ORDINAL_PREFIX + '5' + DUAN_PERIOD, PARA_FIVE_EDITED);
    const result = diffText(oldText, newText);
    expect(result.similarity).toBeGreaterThan(0.9);
  });

  it('rebuilds both sides from the token stream', () => {
    const result = diffText(ORIGINAL_TEXT, EDITED_TEXT);
    expect(newTextFromTokens(result.tokens)).toBe(EDITED_TEXT);
    expect(oldTextFromTokens(result.tokens)).toBe(ORIGINAL_TEXT);
  });

  it('detokenize keeps deletions inline for round-trip inspection', () => {
    const result = diffText('ab', 'ac');
    expect(detokenize(result.tokens)).toContain('b');
    expect(detokenize(result.tokens)).toContain('c');
  });
});
