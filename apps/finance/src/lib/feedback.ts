import { FEEDBACK_EMAIL, buildGmailUrl, buildMailto } from '@tableview/shared';

export { FEEDBACK_EMAIL };

export interface BugReportContext {
  calculatorName?: string;
  inputsSummary?: string;
  errorMessage?: string;
}

const SUBJECT = '[TableView Underwriting] Calculation Issue / Feedback';

export function getBugReportTemplate(ctx?: BugReportContext): string {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://tableview.dev';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

  return `Hi Team,

[Issue / Feedback Summary]
Please describe the issue, calculation discrepancy, or improvement you have in mind:


[Steps to Reproduce]
1. Open calculator: ${ctx?.calculatorName || '[e.g. DSCR / Cap Rate / Mortgage]'}
2. Enter values: ${ctx?.inputsSummary || '[e.g. Property Value: $500,000, Down: 20%, Rate: 7.25%]'}
3. Observed result: ${ctx?.errorMessage || ''}
4. Expected result: 

[Context]
- Calculator: ${ctx?.calculatorName || '[e.g. DSCR Loan Calculator]'}
- Scenario Description: 

---
Diagnostic Info:
- App URL: ${currentUrl}
- Browser: ${userAgent}
- Execution: 100% In-Browser Client-Side Underwriting Sandbox`;
}

export function getBugReportMailto(ctx?: BugReportContext): string {
  return buildMailto(FEEDBACK_EMAIL, SUBJECT, getBugReportTemplate(ctx));
}

export function getBugReportGmailUrl(ctx?: BugReportContext): string {
  return buildGmailUrl(FEEDBACK_EMAIL, SUBJECT, getBugReportTemplate(ctx));
}

export function openBugReportEmail(ctx?: BugReportContext) {
  if (typeof window !== 'undefined') {
    window.location.href = getBugReportMailto(ctx);
  }
}
