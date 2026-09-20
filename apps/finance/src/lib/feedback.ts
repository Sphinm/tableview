export const FEEDBACK_EMAIL = 'feedback@tableview.dev';

export interface BugReportContext {
  calculatorName?: string;
  inputsSummary?: string;
  errorMessage?: string;
}

export function getBugReportTemplate(ctx?: BugReportContext): string {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://tableview.dev';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

  return `Hi TableView Underwriting Team,

[Discrepancy / Bug Summary]
Please describe the calculation discrepancy or issue you encountered:


[Steps to Reproduce]
1. Open calculator: ${ctx?.calculatorName || '[e.g. DSCR / Cap Rate / Mortgage]'}
2. Enter values: ${ctx?.inputsSummary || '[e.g. Property Value: $500,000, Down: 20%, Rate: 7.25%]'}
3. Observed result: 
4. Expected result: 

[Calculation Context]
- Calculator: ${ctx?.calculatorName || '[e.g. DSCR Loan Calculator]'}
- Scenario Description: 
- Discrepancy Details: ${ctx?.errorMessage || '[Describe difference vs lender quote or expected bank output]'}

---
Diagnostic Info:
- App URL: ${currentUrl}
- Browser: ${userAgent}
- Execution: 100% In-Browser Client-Side Underwriting Sandbox`;
}

export function getBugReportMailto(ctx?: BugReportContext): string {
  const subject = encodeURIComponent('[TableView Underwriting] Calculation Issue / Feedback');
  const body = encodeURIComponent(getBugReportTemplate(ctx));
  return `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
}

export function getBugReportGmailUrl(ctx?: BugReportContext): string {
  const subject = encodeURIComponent('[TableView Underwriting] Calculation Issue / Feedback');
  const body = encodeURIComponent(getBugReportTemplate(ctx));
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${FEEDBACK_EMAIL}&su=${subject}&body=${body}`;
}

export function openBugReportEmail(ctx?: BugReportContext) {
  if (typeof window !== 'undefined') {
    window.location.href = getBugReportMailto(ctx);
  }
}
