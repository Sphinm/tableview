/**
 * Lightweight index of guide slugs.
 *
 * Why this file exists: the router must recognise a bare slug such as
 * /what-is-apache-parquet, but importing data/guides.ts from the router would
 * pull ~50 kB of article content into the initial bundle for every visitor.
 * Only the slugs live here; the article bodies stay in guides.ts, which is
 * loaded solely by the (lazy) guide routes.
 *
 * A unit test asserts this list stays in sync with guidesData.
 */
export const GUIDE_SLUGS: readonly string[] = [
  'what-is-apache-parquet',
  'convert-parquet-to-excel',
  'duckdb-wasm-in-browser-olap',
  'inspect-parquet-metadata-and-schema',
  'parquet-vs-csv-vs-json-benchmark',
  'troubleshooting-corrupted-parquet-files',
  'dscr-loans-complete-investor-guide',
  'mortgage-refinance-break-even-guide',
  'cloud-data-lake-storage-economics',
];

const GUIDE_SLUG_SET = new Set<string>(GUIDE_SLUGS);

export function isGuideSlug(slug: string): boolean {
  return GUIDE_SLUG_SET.has(slug);
}
