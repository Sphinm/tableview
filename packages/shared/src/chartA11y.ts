/**
 * Accessible descriptions for data visualisations.
 *
 * Every chart in the suite is a single inline <svg>. Without a role and a name
 * the accessibility tree exposes only an unlabelled graphic, so a screen reader
 * announces "graphic" and nothing else — the numbers the chart encodes are
 * unreachable. WCAG treats a chart as a complex image and expects it to carry a
 * text alternative.
 *
 * These helpers build that text alternative from the same data the chart is
 * drawn from, so the description can never drift from the picture. They are
 * pure functions precisely so that promise is testable.
 */

export interface ChartDatum {
  /** Series or category name, e.g. "Principal & Interest". */
  label: string;
  /** Pre-formatted value, e.g. "$2,302". */
  value: string;
  /** Optional pre-formatted share, e.g. "63.8%". */
  share?: string;
}

export interface ChartSeriesTrend {
  /** Series name, e.g. "Ending balance". */
  name: string;
  /** Pre-formatted value at the first point. */
  from: string;
  /** Pre-formatted value at the last point. */
  to: string;
}

/**
 * Describe a part-to-whole or categorical chart.
 *
 * The list is bounded so a 20-category chart does not produce a paragraph; the
 * omitted count is stated explicitly rather than silently dropped.
 */
export function chartAriaLabel(title: string, data: ChartDatum[], limit = 6): string {
  if (data.length === 0) return title;
  const shown = data.slice(0, limit);
  const parts = shown.map((d) => {
    const share = d.share ? ` (${d.share})` : '';
    return `${d.label} ${d.value}${share}`;
  });
  const omitted = data.length - shown.length;
  const tail = omitted > 0 ? `; ${omitted} further series omitted` : '';
  return `${title}. ${parts.join('; ')}${tail}.`;
}

/**
 * Describe a trend over time. Time-series charts are too dense to enumerate, so
 * the endpoints and direction of travel are the meaningful summary.
 */
export function chartTrendAriaLabel(title: string, series: ChartSeriesTrend[]): string {
  if (series.length === 0) return title;
  const parts = series.map((s) => `${s.name} from ${s.from} to ${s.to}`);
  return `${title}. ${parts.join('; ')}.`;
}
