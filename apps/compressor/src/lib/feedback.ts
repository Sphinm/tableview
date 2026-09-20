/**
 * Media Compressor feedback entry points.
 *
 * Thin adapter over `@tableview/shared`: the report body and the URL builders live
 * there, so this file only keeps the names the rest of the app already imports.
 * It used to carry a full copy of the template, duplicated byte-for-byte with the
 * Media Compressor's copy.
 */
import {
  FEEDBACK_EMAIL,
  FILE_BUG_REPORT_SUBJECT,
  buildFileBugReportTemplate,
  buildGmailUrl,
  buildMailto,
  type FileBugReportContext,
} from '@tableview/shared';

export { FEEDBACK_EMAIL };

export type BugReportContext = FileBugReportContext;

export function getBugReportTemplate(ctx?: BugReportContext): string {
  return buildFileBugReportTemplate(ctx);
}

export function getBugReportMailto(ctx?: BugReportContext): string {
  return buildMailto(FEEDBACK_EMAIL, FILE_BUG_REPORT_SUBJECT, getBugReportTemplate(ctx));
}

export function getBugReportGmailUrl(ctx?: BugReportContext): string {
  return buildGmailUrl(FEEDBACK_EMAIL, FILE_BUG_REPORT_SUBJECT, getBugReportTemplate(ctx));
}

export function openBugReportEmail(ctx?: BugReportContext) {
  if (typeof window !== 'undefined') {
    window.location.href = getBugReportMailto(ctx);
  }
}
