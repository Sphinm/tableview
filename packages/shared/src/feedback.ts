/**
 * The single address every TableView suite sends user feedback to.
 *
 * Kept here (not per-app) so changing it is a one-line edit rather than a
 * three-file sweep across finance / tools / compressor.
 */
export const FEEDBACK_EMAIL = 'feedback@tableview.dev';

/**
 * Build a `mailto:` URL.
 *
 * The recipient is deliberately left unencoded so the link stays legible in
 * the browser status bar; subject and body are percent-encoded because they
 * routinely contain spaces, newlines and `&` (all of which would otherwise
 * truncate or corrupt the query string).
 */
export function buildMailto(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Build a Gmail web-compose URL.
 *
 * This exists because `mailto:` is a silent no-op when the visitor has no mail
 * handler registered — common on Windows/Chrome without Outlook. The button
 * offers this as an explicit fallback rather than leaving the click looking
 * broken.
 */
export function buildGmailUrl(to: string, subject: string, body: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Details a visitor can attach to a file-oriented bug report. */
export interface FileBugReportContext {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  errorMessage?: string;
}

export const FILE_BUG_REPORT_SUBJECT = '[TableView Bug Report] Issue Description';

/**
 * The bug-report body used by the file-processing suites (Data Tools, Media
 * Compressor).
 *
 * The Underwriting suite keeps its own wording — it asks about a calculation
 * discrepancy rather than a file — so only this one is shared. Both apps used to
 * carry a byte-identical copy of it.
 */
export function buildFileBugReportTemplate(ctx?: FileBugReportContext): string {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://tableview.dev';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

  return `Hi TableView Team,

[Bug Summary]
Please describe the issue you encountered:


[Steps to Reproduce]
1. 
2. 
3. 

[Expected Behavior]
What should have happened instead:


[File & Data Information]
- File Name: ${ctx?.fileName || '[e.g. data.parquet]'}
- File Format: ${ctx?.fileType || '[Parquet / CSV / Excel / JSON]'}
- File Size: ${ctx?.fileSize ? `${Math.round(ctx.fileSize / 1024)} KB` : '[e.g. 5 MB]'}
- Error Message: ${ctx?.errorMessage || '[Paste any error message or screenshot description here]'}

---
Diagnostic Info:
- App URL: ${currentUrl}
- Browser: ${userAgent}
- Execution: 100% In-Browser DuckDB WebAssembly`;
}

