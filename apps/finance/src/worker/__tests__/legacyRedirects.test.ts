import { describe, it, expect } from 'bun:test';
import { getLegacyCrossDomainRedirect } from '../../lib/legacyRedirects';

describe('Legacy cross-domain 301 redirects', () => {
  it('redirects /data-tools and aliases to tools.tableview.dev', () => {
    expect(getLegacyCrossDomainRedirect('/data-tools')).toBe('https://tools.tableview.dev/data-tools');
    expect(getLegacyCrossDomainRedirect('/data-workbench/')).toBe('https://tools.tableview.dev/data-tools');
    expect(getLegacyCrossDomainRedirect('/workbench')).toBe('https://tools.tableview.dev/data-tools');
  });

  it('redirects /csv-viewer and viewer aliases to tools.tableview.dev', () => {
    expect(getLegacyCrossDomainRedirect('/csv-viewer')).toBe('https://tools.tableview.dev/csv-viewer');
    expect(getLegacyCrossDomainRedirect('/open-csv')).toBe('https://tools.tableview.dev/csv-viewer');
    expect(getLegacyCrossDomainRedirect('/parquet-viewer')).toBe('https://tools.tableview.dev/parquet-viewer');
    expect(getLegacyCrossDomainRedirect('/sql-workbench')).toBe('https://tools.tableview.dev/sql-workbench');
    expect(getLegacyCrossDomainRedirect('/duckdb')).toBe('https://tools.tableview.dev/sql-workbench');
  });

  it('redirects data guides to tools.tableview.dev/guides/:slug', () => {
    expect(getLegacyCrossDomainRedirect('/what-is-apache-parquet')).toBe(
      'https://tools.tableview.dev/guides/what-is-apache-parquet'
    );
    expect(getLegacyCrossDomainRedirect('/guides/duckdb-wasm-in-browser-olap')).toBe(
      'https://tools.tableview.dev/guides/duckdb-wasm-in-browser-olap'
    );
  });

  it('redirects image/video compressor routes to compress.tableview.dev', () => {
    expect(getLegacyCrossDomainRedirect('/image-compressor')).toBe(
      'https://compress.tableview.dev/image-compressor'
    );
    expect(getLegacyCrossDomainRedirect('/video-compressor')).toBe(
      'https://compress.tableview.dev/video-compressor'
    );
    expect(getLegacyCrossDomainRedirect('/compress-mp4')).toBe(
      'https://compress.tableview.dev/compress-mp4'
    );
  });

  it('returns null for finance calculators, guides, and home', () => {
    expect(getLegacyCrossDomainRedirect('/')).toBeNull();
    expect(getLegacyCrossDomainRedirect('/mortgage-calculator')).toBeNull();
    expect(getLegacyCrossDomainRedirect('/dscr-loan-calculator')).toBeNull();
    expect(getLegacyCrossDomainRedirect('/hard-money-calculator')).toBeNull();
    expect(getLegacyCrossDomainRedirect('/guides')).toBeNull();
    expect(getLegacyCrossDomainRedirect('/guides/dscr-loans-complete-investor-guide')).toBeNull();
  });
});
