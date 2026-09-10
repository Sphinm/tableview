export const FEEDBACK_EMAIL = 'feedback@tableview.dev';

export interface BugReportContext {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  errorMessage?: string;
}

export function getBugReportTemplate(ctx?: BugReportContext): string {
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

export function getBugReportMailto(ctx?: BugReportContext): string {
  const subject = encodeURIComponent('[TableView Bug Report] Issue Description');
  const body = encodeURIComponent(getBugReportTemplate(ctx));
  return `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
}

export function getBugReportGmailUrl(ctx?: BugReportContext): string {
  const subject = encodeURIComponent('[TableView Bug Report] Issue Description');
  const body = encodeURIComponent(getBugReportTemplate(ctx));
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${FEEDBACK_EMAIL}&su=${subject}&body=${body}`;
}

export function openBugReportEmail(ctx?: BugReportContext) {
  if (typeof window !== 'undefined') {
    window.location.href = getBugReportMailto(ctx);
  }
}
