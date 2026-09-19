import { describe, expect, it } from 'bun:test';
import { buildPolishPrompt, CHANGES_DELIMITER, parsePolishOutput } from '../aiPolishPrompt';

describe('buildPolishPrompt rule coverage', () => {
  it('includes the humanizer staging tells', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('Not X but Y');
    expect(systemInstruction).toContain('One-line closers and dramatic fragments');
    expect(systemInstruction).toContain('Sayings that sound deep');
    expect(systemInstruction).toContain('Arguing with no one');
  });

  it('includes the humanizer rhythm, inflation and formatting tells', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('Forced triads');
    expect(systemInstruction).toContain('Stacked qualifiers');
    expect(systemInstruction).toContain('Inflated significance');
    expect(systemInstruction).toContain('Borrowed authority');
    expect(systemInstruction).toContain('Bold as decoration');
    expect(systemInstruction).toContain('Curly quotation marks');
  });

  it('includes the chat leftovers section', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('Chatbot residue');
    expect(systemInstruction).toContain('Knowledge-limit disclaimers');
    expect(systemInstruction).toContain('Writing about the previous version');
  });

  it('includes the humanizer vocabulary list', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('Vocabulary that models overuse');
    expect(systemInstruction).toContain('testament');
    expect(systemInstruction).toContain('delve');
    expect(systemInstruction).toContain('tapestry');
  });

  it('carries the corpus-study patterns and their measured ratios', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('Paragraph-initial commentary with no referring expression');
    expect(systemInstruction).toContain('4.4x');
    expect(systemInstruction).toContain('3.4x');
    expect(systemInstruction).toContain('7.3x');
    expect(systemInstruction).toContain('Translationese');
    expect(systemInstruction).toContain('Colon abuse');
    expect(systemInstruction).toContain('Abstract summary replacing existing specifics');
  });

  it('forbids the disproven advice', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('Do NOT delete metaphors or similes');
    expect(systemInstruction).toContain('Do NOT delete rhetorical questions');
    expect(systemInstruction).toContain('Do NOT flatten sentence-length variation');
    expect(systemInstruction).toContain('Do NOT invent any fact');
  });

  it('scopes the straight-quote rule away from CJK text', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('Do NOT apply this to CJK text');
  });

  it('includes the when-not-to-act guardrail', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('WHEN NOT TO ACT');
    expect(systemInstruction).toContain('only when several tells share a passage');
  });

  it('asks for both AI-tone removal and copy-editing in one pass', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('TWO JOBS, ONE PASS');
    expect(systemInstruction).toContain('reduce the tells above');
    expect(systemInstruction).toContain('copy-edit properly');
  });

  it('requires the output language to match the input', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'Some article text.' });
    expect(systemInstruction).toContain('SAME LANGUAGE as the input');
    expect(systemInstruction).toContain('Never translate');
  });

  it('embeds the delimiter contract with tell references', () => {
    const { systemInstruction } = buildPolishPrompt({ text: 'x' });
    expect(systemInstruction).toContain(CHANGES_DELIMITER);
    expect(systemInstruction).toContain('<tell number and name>');
  });

  it('does not ask the model for a mode or a language choice', () => {
    const { systemInstruction, prompt } = buildPolishPrompt({ text: 'Body.' });
    expect(prompt).not.toContain('mode');
    expect(systemInstruction).not.toContain('de-ai');
    expect(systemInstruction).not.toContain('concise');
  });

  it('still delivers real CJK pattern examples to the model', () => {
    // The Chinese glosses are escaped as \uXXXX so the source stays ASCII-only.
    // They must still decode to real characters, or the model loses the concrete
    // examples it is meant to match.
    const { systemInstruction } = buildPolishPrompt({ text: 'sample' });
    const cjkCount = (systemInstruction.match(/[\u4e00-\u9fff]/g) || []).length;
    expect(cjkCount).toBeGreaterThan(30);

    const examples = [
      '\u503c\u5f97\u6ce8\u610f\u7684\u662f',
      '\u4e0d\u662fA\u800c\u662fB',
      '\u8bf4\u767d\u4e86',
      '\u539f\u56e0\u6709\u4e09\uff1a',
      '\u50cf\u4e00\u4f4d\u667a\u6167\u7684\u5bfc\u5e08',
      '\u5927\u5e45\u63d0\u5347',
    ];
    for (const example of examples) {
      expect(systemInstruction).toContain(example);
    }
  });
});

describe('buildPolishPrompt user input', () => {
  it('places the article text in the user prompt', () => {
    const { prompt } = buildPolishPrompt({ text: 'The original article body.' });
    expect(prompt).toContain('The original article body.');
  });

  it('appends a custom instruction when provided', () => {
    const { prompt } = buildPolishPrompt({
      text: 'Body.',
      customInstruction: 'Keep the first person plural.',
    });
    expect(prompt).toContain('Keep the first person plural.');
  });

  it('trims surrounding whitespace from the article', () => {
    const { prompt } = buildPolishPrompt({ text: '   Body text.   ' });
    expect(prompt).toContain('Body text.');
    expect(prompt).not.toContain('   Body text.   ');
  });

  it('embeds a voice sample and tells the model to match it', () => {
    const { prompt } = buildPolishPrompt({
      text: 'Body.',
      voiceSample: 'My own sentences are short. They use dashes - like this - often.',
    });
    expect(prompt).toContain('Match its voice, rhythm and word choice');
    expect(prompt).toContain('My own sentences are short.');
    expect(prompt).toContain('end of voice sample');
  });

  it('omits the voice sample block when none is supplied', () => {
    const { prompt } = buildPolishPrompt({ text: 'Body.' });
    expect(prompt).not.toContain('voice sample');
    expect(prompt).not.toContain('end of voice sample');
  });
});

describe('parsePolishOutput', () => {
  it('separates the article from the change list', () => {
    const raw = [
      'The rewritten article.',
      '',
      CHANGES_DELIMITER,
      '- 1. Not X but Y | it is not X but Y -> X matters | contrast adds no claim',
      '- 11. Dashes | clause - dash - clause | rewrote as separate sentences',
    ].join('\n');

    const parsed = parsePolishOutput(raw);
    expect(parsed.hadDelimiter).toBe(true);
    expect(parsed.article).toBe('The rewritten article.');
    expect(parsed.changes).toHaveLength(2);
    expect(parsed.changes[0]).toContain('Not X but Y');
  });

  it('treats output without a delimiter as a pure article', () => {
    const parsed = parsePolishOutput('Only the article, no change list.');
    expect(parsed.hadDelimiter).toBe(false);
    expect(parsed.article).toBe('Only the article, no change list.');
    expect(parsed.changes).toEqual([]);
  });

  it('handles a delimiter with an empty rationale', () => {
    const parsed = parsePolishOutput('Article.\n' + CHANGES_DELIMITER + '\n');
    expect(parsed.article).toBe('Article.');
    expect(parsed.changes).toEqual([]);
  });

  it('accepts bullet and asterisk markers', () => {
    const raw = ['Article.', CHANGES_DELIMITER, '* Colon abuse | lead-in | empty', '- Dashes | dash | too dense'].join('\n');
    const parsed = parsePolishOutput(raw);
    expect(parsed.changes).toEqual(['Colon abuse | lead-in | empty', 'Dashes | dash | too dense']);
  });

  it('does not mistake delimiter-like prose for the delimiter', () => {
    const parsed = parsePolishOutput('The text mentions === as a symbol but not the marker.');
    expect(parsed.hadDelimiter).toBe(false);
  });

  it('parses a CJK article body with English change notes', () => {
    // The article stays in its source language; the rationale is English.
    const cjkArticle = '\u8fd9\u662f\u6539\u5199\u540e\u7684\u6b63\u6587\u3002';
    const raw = [cjkArticle, CHANGES_DELIMITER, '- 2. Dangling opener | named the referent'].join('\n');
    const parsed = parsePolishOutput(raw);
    expect(parsed.article).toBe(cjkArticle);
    expect(parsed.changes).toHaveLength(1);
  });
});
