import { describe, it, expect } from 'bun:test';
import { getBugReportMailto, getBugReportTemplate } from '../feedback';

/**
 * The Underwriting suite's mail is a general feedback note, not a calculation
 * dispute: the body opens with "Hi Team" and asks for an "Issue / Feedback
 * Summary". The subject has to agree with that, or the author receives a
 * message headed "Calculation Issue" that talks about something else.
 */
describe('Underwriting feedback mail', () => {
  it('heads the mail as feedback rather than a calculation dispute', () => {
    const url = getBugReportMailto();
    const subject = decodeURIComponent(url.split('subject=')[1].split('&')[0]);
    expect(subject).toBe('[TableView] Feedback');
  });

  it('keeps the subject in step with the general-purpose body', () => {
    const template = getBugReportTemplate();
    // The body addresses a general audience…
    expect(template.startsWith('Hi Team,')).toBe(true);
    expect(template).toContain('[Issue / Feedback Summary]');
    // …so no calculation-specific heading survives, on the body or the subject.
    const subject = decodeURIComponent(getBugReportMailto().split('subject=')[1].split('&')[0]);
    expect(subject).not.toContain('Calculation');
    expect(template).not.toContain('[Discrepancy');
  });
});
