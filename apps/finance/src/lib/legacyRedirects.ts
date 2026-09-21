/**
 * Legacy cross-subdomain 301 redirects.
 *
 * When the TableView monorepo was split into apps/{finance,tools,compressor},
 * previously indexed URLs on tableview.dev for Data Workbench and Media Compressor
 * started returning 404s.
 *
 * This module maps those legacy routes to their permanent new homes on
 * tools.tableview.dev and compress.tableview.dev.
 */

export const TOOLS_BASE = 'https://tools.tableview.dev';
export const COMPRESS_BASE = 'https://compress.tableview.dev';

// Data Tools routes & aliases
export const TOOLS_REDIRECT_MAP: Record<string, string> = {
  // Workbench & hubs
  '/data-tools': '/data-tools',
  '/data-workbench': '/data-tools',
  '/workbench': '/data-tools',
  '/tools': '/data-tools',
  '/viewers': '/data-tools',

  // Viewers
  '/csv-viewer': '/csv-viewer',
  '/open-csv': '/csv-viewer',
  '/csv': '/csv-viewer',
  '/view-csv': '/csv-viewer',
  '/csv-reader': '/csv-viewer',
  '/excel-viewer': '/excel-viewer',
  '/open-excel': '/excel-viewer',
  '/xlsx-viewer': '/excel-viewer',
  '/xls-viewer': '/excel-viewer',
  '/excel': '/excel-viewer',
  '/parquet-viewer': '/parquet-viewer',
  '/open-parquet': '/parquet-viewer',
  '/parquet-reader': '/parquet-viewer',
  '/geoparquet-viewer': '/geoparquet-viewer',
  '/geoparquet': '/geoparquet-viewer',
  '/tsv-viewer': '/tsv-viewer',
  '/tsv': '/tsv-viewer',
  '/view-tsv': '/tsv-viewer',
  '/tsv-reader': '/tsv-viewer',
  '/json-viewer': '/json-viewer',
  '/ndjson-viewer': '/json-viewer',
  '/jsonl-viewer': '/json-viewer',

  // SQL Workbench & DuckDB
  '/sql-workbench': '/sql-workbench',
  '/sql': '/sql-workbench',
  '/sql-on-csv': '/sql-workbench',
  '/sql-on-parquet': '/sql-workbench',
  '/query-csv': '/sql-workbench',
  '/query-parquet': '/sql-workbench',
  '/csv-sql': '/sql-workbench',
  '/sql-runner': '/sql-workbench',
  '/sql-on-csv-parquet': '/sql-workbench',
  '/duckdb': '/sql-workbench',
  '/sql-console': '/sql-workbench',

  // Converters
  '/data-converter': '/data-converter',
  '/converter': '/data-converter',
  '/converters': '/data-converter',
  '/format-converter': '/data-converter',
  '/parquet-to-csv': '/parquet-to-csv',
  '/convert-parquet-to-csv': '/parquet-to-csv',
  '/csv-to-parquet': '/csv-to-parquet',
  '/convert-csv-to-parquet': '/csv-to-parquet',
  '/csv-to-excel': '/csv-to-excel',
  '/convert-csv-to-excel': '/csv-to-excel',
  '/excel-to-csv': '/excel-to-csv',
  '/convert-excel-to-csv': '/excel-to-csv',
  '/json-to-csv': '/json-to-csv',
  '/convert-json-to-csv': '/json-to-csv',
  '/json-to-excel': '/json-to-excel',
  '/convert-json-to-excel': '/json-to-excel',
  '/excel-to-json': '/excel-to-json',
  '/convert-excel-to-json': '/excel-to-json',
  '/convert-tsv-to-csv': '/tsv-viewer',

  // Calculators & Formatters
  '/snowflake-cost-calculator': '/snowflake-cost-calculator',
  '/snowflake-calculator': '/snowflake-cost-calculator',
  '/snowflake-warehouse-calculator': '/snowflake-cost-calculator',
  '/parquet-storage-calculator': '/parquet-storage-calculator',
  '/parquet-savings-calculator': '/parquet-storage-calculator',
  '/parquet-cost-calculator': '/parquet-storage-calculator',
  '/json-formatter': '/json-formatter',
  '/json-beautifier': '/json-formatter',
  '/json-validator': '/json-formatter',
  '/json-viewer-online': '/json-formatter',
  '/format-json': '/json-formatter',
  '/sql-formatter': '/sql-formatter',
  '/sql-beautifier': '/sql-formatter',
  '/sql-minify': '/sql-formatter',
  '/format-sql': '/sql-formatter',
  '/is-it-down': '/is-it-down',
};

// Data guides moved to tools.tableview.dev
export const DATA_GUIDE_SLUGS: readonly string[] = [
  'what-is-apache-parquet',
  'convert-parquet-to-excel',
  'duckdb-wasm-in-browser-olap',
  'inspect-parquet-metadata-and-schema',
  'parquet-vs-csv-vs-json-benchmark',
  'troubleshooting-corrupted-parquet-files',
  'cloud-data-lake-storage-economics',
  'duckdb-wasm-memory-and-performance',
  'apache-parquet-encodings-deep-dive',
  'cloud-finops-snowflake-storage-optimization',
  'zero-server-data-processing-security',
];

// Media Compressor routes & aliases
export const COMPRESS_REDIRECT_MAP: Record<string, string> = {
  '/media-tools': '/media-tools',
  '/media': '/media-tools',
  '/compression-tools': '/media-tools',
  '/video-compressor': '/video-compressor',
  '/compress-video': '/video-compressor',
  '/video-compress': '/video-compressor',
  '/reduce-video-size': '/video-compressor',
  '/compress-mp4': '/compress-mp4',
  '/mp4-compressor': '/compress-mp4',
  '/mp4-compress': '/compress-mp4',
  '/compress-video-for-discord': '/compress-video-for-discord',
  '/discord-video-compressor': '/compress-video-for-discord',
  '/image-compressor': '/image-compressor',
  '/compress-image': '/image-compressor',
  '/image-compress': '/image-compressor',
  '/photo-compressor': '/image-compressor',
  '/reduce-image-size': '/image-compressor',
  '/compress-png': '/compress-png',
  '/png-compressor': '/compress-png',
  '/png-compress': '/compress-png',
  '/compress-jpg': '/compress-jpg',
  '/compress-jpeg': '/compress-jpg',
  '/jpeg-compressor': '/compress-jpg',
  '/jpg-compressor': '/compress-jpg',
  '/compress-webp': '/compress-webp',
  '/webp-compressor': '/compress-webp',
  '/webp-compress': '/compress-webp',
};

/**
 * Returns a full destination URL if the requested path belongs to
 * tools.tableview.dev or compress.tableview.dev, or null if it belongs to finance.
 */
export function getLegacyCrossDomainRedirect(rawPathname: string): string | null {
  if (!rawPathname) return null;
  const clean = rawPathname.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  // Check direct tool routes
  if (TOOLS_REDIRECT_MAP[clean]) {
    return `${TOOLS_BASE}${TOOLS_REDIRECT_MAP[clean]}`;
  }

  // Check data guide slugs (both /slug and /guides/slug)
  const bareSlug = clean.startsWith('/guides/') ? clean.slice('/guides/'.length) : clean.slice(1);
  if (DATA_GUIDE_SLUGS.includes(bareSlug)) {
    return `${TOOLS_BASE}/guides/${bareSlug}`;
  }

  // Check compressor routes
  if (COMPRESS_REDIRECT_MAP[clean]) {
    return `${COMPRESS_BASE}${COMPRESS_REDIRECT_MAP[clean]}`;
  }

  return null;
}
