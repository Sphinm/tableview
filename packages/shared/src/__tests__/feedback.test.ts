import { describe, it, expect } from 'bun:test';
import { buildMailto, buildGmailUrl } from '../feedback';

describe('Feedback email links', () => {
  it('builds a mailto link carrying the recipient, subject and body', () => {
    const url = buildMailto('feedback@tableview.dev', 'Hi', 'body');
    expect(url).toBe('mailto:feedback@tableview.dev?subject=Hi&body=body');
  });

  it('percent-encodes reserved characters and newlines so the query string survives', () => {
    const url = buildMailto('a@b.co', 'A & B', 'line1\nline2');
    expect(url).toBe('mailto:a@b.co?subject=A%20%26%20B&body=line1%0Aline2');
  });

  it('encodes separators that would otherwise split the query string', () => {
    const url = buildMailto('a@b.co', 'Q?', 'p#1');
    expect(url).toBe('mailto:a@b.co?subject=Q%3F&body=p%231');
  });

  it('encodes non-ASCII so clients that reject raw UTF-8 still open the draft', () => {
    const url = buildMailto('a@b.co', '\u53cd\u9988', 'x');
    expect(url).toBe('mailto:a@b.co?subject=%E5%8F%8D%E9%A6%88&body=x');
  });
});

describe('Gmail fallback link', () => {
  it('builds a Gmail compose URL for visitors with no desktop mail client', () => {
    const url = buildGmailUrl('feedback@tableview.dev', 'Hi', 'body');
    expect(url).toBe(
      'https://mail.google.com/mail/?view=cm&fs=1&to=feedback@tableview.dev&su=Hi&body=body',
    );
  });

  it('percent-encodes subject and body the same way the mailto link does', () => {
    const url = buildGmailUrl('a@b.co', 'A & B', 'line1\nline2');
    expect(url).toBe('https://mail.google.com/mail/?view=cm&fs=1&to=a@b.co&su=A%20%26%20B&body=line1%0Aline2');
  });
});

