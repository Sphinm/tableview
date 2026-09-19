export type SuiteType = 'finance' | 'tools' | 'compressor';

export const SUITE_ORIGINS: Record<SuiteType, string> = {
  finance: 'https://tableview.dev',
  tools: 'https://tools.tableview.dev',
  compressor: 'https://compress.tableview.dev',
};

export const FINANCE_PATHS = new Set([
  '/',
  '/calculators',
  '/finance-calculator',
  '/mortgage-calculator',
  '/amortization-schedule-calculator',
  '/mortgage-payoff-calculator',
  '/refinance-calculator',
  '/cash-out-refinance-calculator',
  '/dscr-loan-calculator',
  '/cap-rate-calculator',
  '/rental-property-calculator',
  '/rental-cash-flow-calculator',
  '/hard-money-calculator',
  '/section-1031-exchange-calculator',
  '/1031-exchange-timeline-calculator',
  '/commercial-loan-calculator',
  '/commercial-real-estate-loan-calculator',
  '/balloon-payment-calculator',
  '/loan-comparison-calculator',
  '/salary-calculator',
  '/salary-to-hourly-calculator',
  '/guides',
  '/about',
  '/contact',
  '/privacy',
  '/privacy-policy',
  '/terms',
  '/terms-of-service',
  '/disclaimer',
]);

const TOOLS_PATHS = new Set([
  '/data-tools',
  '/data-converter',
  '/parquet-viewer',
  '/csv-viewer',
  '/parquet-to-excel',
  '/csv-to-parquet',
  '/parquet-to-csv',
  '/json-to-parquet',
  '/parquet-schema-inspector',
  '/parquet-storage-calculator',
  '/snowflake-cost-calculator',
  '/json-formatter',
  '/sql-formatter',
  '/is-it-down',
  '/website-status-checker',
]);

const COMPRESSOR_PATHS = new Set([
  '/media-tools',
  '/video-compressor',
  '/compress-mp4',
  '/compress-video',
  '/compress-video-for-discord',
  '/image-compressor',
  '/compress-png',
  '/compress-jpg',
  '/compress-webp',
  '/compress-image',
]);

/**
 * Identify which application a route path belongs to.
 */
export function resolveSuiteForPath(path: string): SuiteType {
  const cleanPath = path.split('?')[0].split('#')[0];
  if (TOOLS_PATHS.has(cleanPath) || cleanPath.startsWith('/data-converter/')) {
    return 'tools';
  }
  if (COMPRESSOR_PATHS.has(cleanPath)) {
    return 'compressor';
  }
  return 'finance';
}

/**
 * Returns a relative path if the target route belongs to currentSuite,
 * or an absolute URL (e.g. https://tools.tableview.dev/parquet-viewer) if it belongs to another sub-domain.
 * This completely eliminates 404 errors across cross-promoted tools.
 */
export function getCrossSuiteUrl(targetPath: string, currentSuite: SuiteType): string {
  const targetSuite = resolveSuiteForPath(targetPath);
  if (targetSuite === currentSuite) {
    return targetPath;
  }
  const targetOrigin = SUITE_ORIGINS[targetSuite];
  const normalizedPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  return `${targetOrigin}${normalizedPath}`;
}
