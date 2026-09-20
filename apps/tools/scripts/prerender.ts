import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOOLS_CONFIG, type ToolConfig } from '../src/data/tools';
import { guidesData, type GuideItem } from '../src/data/guides';
import { TOOL_ALIASES } from '../src/lib/resolveRoute';
import { getCalculatorFaqs } from '../src/data/calculatorFaqs';
import { toIsoDate } from '../src/lib/isoDate';
import {
  DATA_TOOLS_META,
  GUIDES_HUB_META,
  CALCULATOR_META,
  STATIC_PAGE_META,
  type PageMeta,
} from '../src/data/routeMeta';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const distDir = path.join(rootDir, 'dist');
const SITE = 'https://tools.tableview.dev';

interface FaqItem {
  q: string;
  a: string;
}

interface ResolvedPage {
  title: string;
  description: string;
  canonical: string;
  route: string;
  h1: string;
  intro: string;
  faqs: FaqItem[];
  articleHtml: string;
  jsonLd: Record<string, any>[];
}

/** Data-tools guides only; the nine finance/underwriting guides belong to tableview.dev. */
const DATA_GUIDE_SLUGS = new Set<string>([
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
]);

const dataGuides = guidesData.filter((g) => DATA_GUIDE_SLUGS.has(g.slug));

const DATA_TOOL_SLUGS = new Set<string>(
  Object.values(TOOLS_CONFIG)
    .filter(
      (t) =>
        ['viewer', 'converter', 'sql', 'analysis'].includes(t.category) &&
        t.slug !== 'json-formatter' &&
        t.slug !== 'sql-formatter'
    )
    .map((t) => t.slug)
);

const DATA_TOOLS_BY_PATH = new Map(
  Object.values(TOOLS_CONFIG)
    .filter((t) => DATA_TOOL_SLUGS.has(t.slug))
    .map((t) => [t.path, t])
);

const TOOLS_CALCULATORS = new Set<string>([
  '/parquet-storage-calculator',
  '/snowflake-cost-calculator',
  '/json-formatter',
  '/sql-formatter',
]);

const GUIDES_BY_SLUG = new Map(
  dataGuides.map((guide) => {
    const isoDate = toIsoDate(guide.date);
    if (!isoDate) throw new Error(`Guide "${guide.slug}" has an unparseable date: ${JSON.stringify(guide.date)}`);
    return [guide.slug, { ...guide, isoDate }];
  })
);

const DATA_TOOLS_HOME_META = {
  title: 'TableView Data Tools — In-Browser Parquet Viewer & DuckDB SQL Workbench',
  description:
    '100% private in-browser Parquet viewer, DuckDB-Wasm SQL console, CSV/JSON/Excel converters, Snowflake/S3 savings estimators, and website uptime checker. Zero server uploads.',
  canonical: '/',
};


function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}



function publisherNodes() {
  return [
    {
      '@type': 'Organization',
      name: 'TableView.dev',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` },
    },
    {
      '@type': 'WebSite',
      name: 'TableView Data Tools',
      url: SITE,
    },
  ];
}


function breadcrumb(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE}${item.url}`,
    })),
  };
}



/** Render universal semantic header (data tools). */
function generateHeaderHtml(): string {
  return `
    <header style="background: #0f172a; padding: 1rem 1.5rem;">
      <nav style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 1.25rem; align-items: center; font-size: 0.9rem; font-weight: 600;">
        <a href="/" style="color: #ffffff; text-decoration: none; font-weight: 800;">TableView Data Tools</a>
        <a href="/data-tools" style="color: #cbd5e1; text-decoration: none;">Data Workbench</a>
        <a href="/parquet-viewer" style="color: #cbd5e1; text-decoration: none;">Parquet Viewer</a>
        <a href="/data-converter" style="color: #cbd5e1; text-decoration: none;">Converter</a>
        <a href="/snowflake-cost-calculator" style="color: #cbd5e1; text-decoration: none;">FinOps</a>
        <a href="/is-it-down" style="color: #cbd5e1; text-decoration: none;">Uptime Check</a>
        <a href="/guides" style="color: #cbd5e1; text-decoration: none;">Guides</a>
        <span style="flex: 1;"></span>
        <a href="https://tableview.dev" style="color: #cbd5e1; text-decoration: none;">Financial Suite</a>
        <a href="https://compress.tableview.dev" style="color: #cbd5e1; text-decoration: none;">Media Compressor</a>
      </nav>
    </header>
  `;
}


/** Render universal semantic footer (data tools). */
function generateFooterHtml(): string {
  const guideLinks = dataGuides
    .map((guide) => `<a href="/guides/${guide.slug}" style="color: #64748b; text-decoration: none; display: block; margin-bottom: 0.5rem;">${escapeHtml(guide.title)}</a>`)
    .join('');

  return `
    <footer style="background: #0f172a; color: #cbd5e1; padding: 3rem 1.5rem; margin-top: 3rem;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; font-size: 0.88rem;">
        <div>
          <h4 style="color: #fff; margin-bottom: 0.75rem;">Data Tools</h4>
          <a href="/parquet-viewer" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Apache Parquet Viewer</a>
          <a href="/sql-workbench" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">DuckDB SQL Console</a>
          <a href="/data-converter" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Universal Converter</a>
          <a href="/json-formatter" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">JSON Formatter</a>
          <a href="/sql-formatter" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">SQL Formatter</a>
        </div>
        <div>
          <h4 style="color: #fff; margin-bottom: 0.75rem;">FinOps</h4>
          <a href="/snowflake-cost-calculator" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Snowflake Cost</a>
          <a href="/parquet-storage-calculator" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Parquet Savings</a>
          <a href="/is-it-down" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Uptime Checker</a>
        </div>
        <div>
          <h4 style="color: #fff; margin-bottom: 0.75rem;">Guides</h4>
          ${guideLinks}
        </div>
        <div>
          <h4 style="color: #fff; margin-bottom: 0.75rem;">TableView</h4>
          <a href="https://tableview.dev" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Financial Suite</a>
          <a href="https://compress.tableview.dev" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Media Compressor</a>
          <a href="/about" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">About</a>
          <a href="/contact" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Contact</a>
          <a href="/privacy" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Privacy</a>
        </div>
      </div>
      <p style="max-width: 1200px; margin: 2rem auto 0; color: #64748b; font-size: 0.8rem; border-top: 1px solid #1e293b; padding-top: 1.5rem;">
        TableView Data Tools runs 100% client-side. Your files are processed in DuckDB-Wasm inside your browser and are never uploaded to a server.
      </p>
    </footer>
  `;
}


function generateGuideArticleHtml(guide: GuideItem): string {
  const sectionsHtml = guide.sections
    .map((sec) => {
      let secBody = `<h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem; margin-bottom: 1rem;">${escapeHtml(sec.heading)}</h2>`;
      secBody += sec.paragraphs
        .map((p) => `<p style="margin-bottom: 1.15rem; line-height: 1.8; color: #334155;">${escapeHtml(p)}</p>`)
        .join('\n');

      if (sec.table) {
        const thead = sec.table.headers
          .map((h) => `<th style="border: 1px solid #e2e8f0; padding: 0.75rem; background: #f8fafc; text-align: left; color: #0f172a; font-weight: 600;">${escapeHtml(h)}</th>`)
          .join('');
        const tbody = sec.table.rows
          .map((row) => `<tr>${row.map((c) => `<td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #334155;">${escapeHtml(c)}</td>`).join('')}</tr>`)
          .join('');
        secBody += `<div style="overflow-x: auto; margin: 1.5rem 0;"><table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
      }

      if (sec.code) {
        secBody += `<pre style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; overflow-x: auto; font-family: monospace; font-size: 0.85rem; color: #0f172a; margin: 1.5rem 0;"><code>${escapeHtml(sec.code.code)}</code></pre>`;
      }

      return `<section id="${escapeHtml(sec.id)}">${secBody}</section>`;
    })
    .join('\n');

  const faqsHtml = guide.faqs?.length
    ? `
      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${guide.faqs
          .map(
            (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
          )
          .join('')}
      </section>
    `
    : '';

  return `
    <article style="max-width: 860px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #334155;">
      <nav style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">
        <a href="/" style="color: #0284c7; text-decoration: none;">Home</a> / 
        <a href="/guides" style="color: #0284c7; text-decoration: none;">Guides</a> / 
        <span>${escapeHtml(guide.title)}</span>
      </nav>
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.75rem;">
        <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;">
          <span style="background: #eef2ff; color: #3730a3; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #c7d2fe;">${escapeHtml(guide.category)}</span>
          <span style="color: #64748b; font-size: 0.8rem;">${escapeHtml(guide.date)} · ${escapeHtml(guide.readTime)} · By ${escapeHtml(guide.author)}</span>
        </div>
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; line-height: 1.3; margin-bottom: 1rem;">${escapeHtml(guide.title)}</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">${escapeHtml(guide.excerpt)}</p>
      </header>
      <div class="guide-content">
        ${sectionsHtml}
        ${faqsHtml}
      </div>
    </article>
  `;
}





function generateGuidesHubHtml(): string {
  const cards = dataGuides
    .map(
      (g) => `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="background: #ecfdf5; color: #065f46; font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 9999px; border: 1px solid #a7f3d0;">${escapeHtml(g.category)}</span>
            <span style="color: #64748b; font-size: 0.75rem;">${escapeHtml(g.readTime)}</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; line-height: 1.4;">
            <a href="/guides/${g.slug}" style="color: inherit; text-decoration: none;">${escapeHtml(g.title)}</a>
          </h3>
          <p style="font-size: 0.85rem; color: #64748b; line-height: 1.6; margin-bottom: 1rem;">${escapeHtml(g.excerpt)}</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b;">
          <span>${escapeHtml(g.author)}</span>
          <a href="/guides/${g.slug}" style="color: #0284c7; text-decoration: none; font-weight: 600;">Read Guide →</a>
        </div>
      </div>
    `
    )
    .join('');

  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem;">
      <header style="text-align: center; margin-bottom: 3rem;">
        <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 0.75rem;">Finance &amp; Underwriting Research Desk</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Commercial Real Estate &amp; Lending Guides</h1>
        <p style="font-size: 1.1rem; color: #64748b; max-width: 760px; margin: 0 auto; line-height: 1.7;">Comprehensive research papers, debt underwriting frameworks, IRS tax rules, and loan amortization math authored by our quantitative modeling team.</p>
      </header>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${cards}
      </div>
    </div>
  `;
}



function generateDataToolsHtml(): string {
  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 3.5rem 1.5rem;">
      <header style="text-align: center; margin-bottom: 3.5rem;">
        <span style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 1rem;">100% Local WebAssembly Engine</span>
        <h1 style="font-size: 2.75rem; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 1rem;">In-Browser Data Workbench &amp; Developer Tools</h1>
        <p style="font-size: 1.2rem; color: #64748b; max-width: 820px; margin: 0 auto; line-height: 1.7;">Inspect, convert, and query CSV, Excel, Apache Parquet, TSV, and JSON with DuckDB-Wasm and SheetJS. Plus client-side video and image compressors. Zero server uploads.</p>
      </header>

      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Spreadsheet Viewers &amp; Data Converters</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/data-converter" style="color: #0f172a; text-decoration: none;">Universal Data Converter</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Convert between CSV, Excel, Apache Parquet, and JSON with ZSTD compression.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/csv-viewer" style="color: #0f172a; text-decoration: none;">CSV Spreadsheet Viewer</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Open, search, sort, and filter large CSV files in browser memory.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/excel-viewer" style="color: #0f172a; text-decoration: none;">Excel (.xlsx) Viewer</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Preview multi-sheet Excel workbooks without Microsoft Office or 365.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/json-to-csv" style="color: #0f172a; text-decoration: none;">JSON to CSV Converter</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Convert nested JSON records and API responses into flat CSV tables.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/json-to-excel" style="color: #0f172a; text-decoration: none;">JSON to Excel (.xlsx)</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Export JSON data to styled multi-column Excel workbooks instantly.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/excel-to-json" style="color: #0f172a; text-decoration: none;">Excel to JSON Converter</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Extract sheets from Excel files into formatted JSON datasets.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/tsv-viewer" style="color: #0f172a; text-decoration: none;">TSV Tab-Separated Viewer</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Inspect bioinformatics and raw server log TSV files with auto-detection.</p>
          </div>
        </div>
      </section>

      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Big Data Analytics &amp; SQL Engines</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/parquet-viewer" style="color: #0f172a; text-decoration: none;">Apache Parquet Viewer</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Inspect columnar Parquet schemas, row groups, and metadata directly.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/geoparquet-viewer" style="color: #0f172a; text-decoration: none;">GeoParquet GIS Viewer</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Preview geospatial Parquet layers and geometries in the browser.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/sql-workbench" style="color: #0f172a; text-decoration: none;">DuckDB SQL Console</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Execute analytical SQL queries directly against local files with zero latency.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/json-formatter" style="color: #0f172a; text-decoration: none;">JSON Formatter &amp; Prettifier</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Format, validate, minify, and clean nested JSON data structures.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/sql-formatter" style="color: #0f172a; text-decoration: none;">SQL Query Formatter</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Beautify and standardize complex SQL dialects cleanly.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}


/** Render a data-tool landing page body. */
function generateToolContentHtml(tool: ToolConfig): string {
  const faqs = tool.faqs ?? [];
  return `
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px;">${escapeHtml(tool.badge)}</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">${escapeHtml(tool.h1)} ${escapeHtml(tool.h1Highlight)}</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">${escapeHtml(tool.subtitle)}</p>
      </header>
      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Key Features &amp; Client-Side Capabilities</h2>
        <ul style="line-height: 2; color: #334155;">
          ${tool.features.map((f) => `<li><strong>${escapeHtml(f.title)}:</strong> ${escapeHtml(f.description)}</li>`).join('\n')}
        </ul>
      </section>
      ${faqs.length ? `
      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${faqs.map((f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `).join('')}
      </section>
      ` : ''}
    </article>
  `;
}


function generateIsItDownContentHtml(meta: PageMeta): string {
  const faqs = [
    { q: 'How does TableView test whether a website is down?', a: 'Cloudflare Workers edge nodes dispatch a live HTTP probe directly to the remote server using standard browser headers — testing network connectivity, DNS resolution, TLS/SSL, HTTP status codes, and latency without browser CORS restrictions.' },
    { q: 'Down for everyone vs. just you?', a: 'Down for everyone means the remote server or DNS returned a 5xx error or timeout from our global edge nodes. Just you means the site is online publicly, but your local network, DNS, firewall, or ISP routing is blocking your device.' },
    { q: 'How do I fix a website that is up but unreachable for me?', a: 'Flush your local DNS cache, hard-refresh the browser, try an incognito window, disconnect VPN/proxies, and switch to a public DNS resolver such as Cloudflare 1.1.1.1 or Google 8.8.8.8.' },
    { q: 'What causes website outages?', a: 'DDoS attacks, DNS misconfigurations, expired TLS certificates, cloud provider incidents, application errors, and database connection pool exhaustion.' },
    { q: 'What do HTTP 502 and 503 mean?', a: '502 Bad Gateway means an edge proxy received an invalid response from the origin; 503 Service Unavailable typically means the server is overloaded or under maintenance.' },
  ];
  return `
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px;">Cloudflare Edge Probing · Real-Time</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">Is It Down Right Now? Website Status &amp; Uptime Checker</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">${escapeHtml(meta.description)}</p>
      </header>
      <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 2rem; margin-bottom: 2.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0284c7; margin-bottom: 0.75rem;">Global Edge Availability Diagnostics</h2>
        <p style="color: #334155; margin-bottom: 1rem;">Check if any website, API endpoint, or service is down. Tests run across Cloudflare's worldwide edge network to eliminate false alarms from local connection drops, bad Wi-Fi, or ISP routing glitches.</p>
        <p style="color: #64748b; font-size: 0.9rem; margin: 0;">Diagnose HTTP status codes (200, 301, 403, 500, 502, 503, 504), round-trip latency in milliseconds, redirect hops, and reverse-proxy server software.</p>
      </section>
      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${faqs.map((f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `).join('')}
      </section>
    </article>
  `;
}


/** Render static legal & E-E-A-T pages (data-tools flavor). */
function generateStaticPageContentHtml(canonical: string): string {
  if (canonical === '/about') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">About TableView Data Tools</h1>
        <p>TableView Data Tools (tools.tableview.dev) is the data-processing wing of TableView.dev. Every viewer, converter, SQL console, and FinOps estimator runs entirely inside your browser tab powered by DuckDB-Wasm and SheetJS — no file you open is ever uploaded to a server.</p>
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">Why client-side matters</h2>
        <p>CSV, Parquet, and Excel files frequently contain business data that should not leave a device. By executing analysis locally, TableView Data Tools eliminates the exfiltration, logging, and sub-processor risk inherent in server-side conversion SaaS.</p>
      </article>
    `;
  }
  if (canonical === '/contact') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Contact TableView Data Tools</h1>
        <p>Questions, feature requests, or technical support for the data workbench: <a href="mailto:feedback@tableview.dev" style="color: #0284c7;">feedback@tableview.dev</a>. We respond within 24–48 business hours.</p>
      </article>
    `;
  }
  if (canonical === '/privacy') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Privacy Policy</h1>
        <p>TableView Data Tools processes all data locally in your browser via WebAssembly. We never view, store, or transmit the contents of your files. Standard hosting metadata (IP, user-agent, timestamps) is logged for security, and advertising uses Google Consent Mode v2 with a denied-by-default posture — see the cookie banner for opt-out.</p>
      </article>
    `;
  }
  if (canonical === '/terms') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Terms of Service</h1>
        <p>By using TableView Data Tools you agree to these terms. The tools are provided "as is" without warranty. You are solely responsible for ensuring you have the right to process any data you open.</p>
      </article>
    `;
  }
  if (canonical === '/disclaimer') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Disclaimer</h1>
        <p>FinOps estimates (Snowflake, Parquet storage/savings) are educational approximations based on published list pricing and should not be treated as a binding quote from any cloud provider.</p>
      </article>
    `;
  }
  return '';
}


function generateCalculatorContentHtml(canonical: string, calc: PageMeta, faqs: { q: string; a: string }[]): string {
  const label = calc.title.split('|')[0].trim();
  const faqsHtml = faqs.length
    ? `
      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${faqs
          .map(
            (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
          )
          .join('')}
      </section>
    `
    : '';

  return `
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px;">100% In-Browser Financial Model</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">${escapeHtml(label)}</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">${escapeHtml(calc.description)}</p>
      </header>

      <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 2rem; margin-bottom: 2.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0284c7; margin-bottom: 0.75rem;">Interactive WebAssembly Calculation Engine</h2>
        <p style="color: #334155; margin-bottom: 1rem;">This tool runs 100% in your local web browser tab. All amortization schedules, debt yield calculations, and tax deferral projections are computed client-side in WebAssembly. Zero bytes are uploaded to remote servers.</p>
        <p style="color: #64748b; font-size: 0.9rem; margin: 0;">Use the interactive form above to adjust parameters, toggle extra principal schedules, stress-test interest rates, and export full reports to Excel (.xlsx) or CSV.</p>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Underwriting Methodology &amp; Mathematical Formulation</h2>
        <p>Our calculation algorithms strictly adhere to institutional lending conventions, CFPB disclosure rules, and statutory IRS definitions:</p>
        <ul style="line-height: 2;">
          <li><strong>Standard Annuity Formula:</strong> Monthly payment M = P * [r(1+r)^n] / [(1+r)^n - 1], calculating exact interest and principal allocations down to the penny.</li>
          <li><strong>Zero-Roundoff Double Precision:</strong> Computations execute using standard IEEE 754 floating-point and integer math to match commercial bank loan documents.</li>
          <li><strong>Sensitivity Analysis:</strong> Real-time stress testing against interest rate fluctuations, vacancy rate increases, and balloon maturity horizons.</li>
        </ul>
      </section>

      ${faqsHtml}
    </article>
  `;
}



/** Map one prerender target to its route-specific page model (data tools only). */
function resolvePage(url: string, canonical: string): ResolvedPage {
  const route = url;

  if (canonical === '/') {
    return {
      title: DATA_TOOLS_HOME_META.title,
      description: DATA_TOOLS_HOME_META.description,
      canonical: '/',
      route,
      h1: 'In-Browser Data Workbench & DuckDB SQL',
      intro: DATA_TOOLS_HOME_META.description,
      faqs: [],
      articleHtml: generateDataToolsHtml(),
      jsonLd: [breadcrumb([{ name: 'Home', url: '/' }])],
    };
  }

  if (canonical === '/data-tools') {
    return {
      title: DATA_TOOLS_META.title,
      description: DATA_TOOLS_META.description,
      canonical: DATA_TOOLS_META.canonical,
      route,
      h1: DATA_TOOLS_META.title,
      intro: DATA_TOOLS_META.description,
      faqs: [],
      articleHtml: generateDataToolsHtml(),
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: DATA_TOOLS_META.title,
          description: DATA_TOOLS_META.description,
          url: `${SITE}/data-tools`,
        },
        breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Data Tools', url: '/data-tools' },
        ]),
      ],
    };
  }

  const tool = DATA_TOOLS_BY_PATH.get(canonical);
  if (tool) {
    const faqs = tool.faqs ?? [];
    return {
      title: tool.metaTitle,
      description: tool.metaDescription,
      canonical: tool.path,
      route,
      h1: `${tool.h1} ${tool.h1Highlight}`.trim(),
      intro: tool.subtitle,
      faqs,
      articleHtml: generateToolContentHtml(tool),
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: tool.title,
          url: `${SITE}${tool.path}`,
          description: tool.metaDescription,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'All',
          browserRequirements: 'Requires WebAssembly support.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        ...(faqs.length
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: faqs.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              },
            ]
          : []),
        breadcrumb([
          { name: 'Home', url: '/' },
          { name: tool.title, url: tool.path },
        ]),
      ],
    };
  }

  if (canonical === '/guides') {
    return {
      title: GUIDES_HUB_META.title,
      description: GUIDES_HUB_META.description,
      canonical: '/guides',
      route,
      h1: GUIDES_HUB_META.title,
      intro: GUIDES_HUB_META.description,
      faqs: [],
      articleHtml: generateGuidesHubHtml(),
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: GUIDES_HUB_META.title,
          description: GUIDES_HUB_META.description,
          url: `${SITE}/guides`,
        },
        breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Guides', url: '/guides' },
        ]),
      ],
    };
  }

  if (canonical.startsWith('/guides/')) {
    const slug = canonical.replace('/guides/', '');
    const guide = GUIDES_BY_SLUG.get(slug);
    if (guide) {
      return {
        title: guide.metaTitle || `${guide.title} | TableView Data Tools`,
        description: guide.excerpt,
        canonical,
        route,
        h1: guide.title,
        intro: guide.excerpt,
        faqs: guide.faqs ?? [],
        articleHtml: generateGuideArticleHtml(guide),
        jsonLd: [
          {
            '@type': ['TechArticle', 'Article'],
            headline: guide.title,
            description: guide.excerpt,
            articleSection: guide.category,
            datePublished: guide.isoDate,
            dateModified: guide.isoDate,
            author: { '@type': 'Organization', name: guide.author, url: SITE },
            publisher: {
              '@type': 'Organization',
              name: 'TableView.dev',
              url: SITE,
              logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` },
            },
            image: [`${SITE}/og-image.png`],
            mainEntityOfPage: `${SITE}${canonical}`,
            url: `${SITE}${canonical}`,
          },
          ...(guide.faqs?.length
            ? [
                {
                  '@type': 'FAQPage',
                  mainEntity: guide.faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                  })),
                },
              ]
            : []),
          breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Guides', url: '/guides' },
            { name: guide.title, url: canonical },
          ]),
        ],
      };
    }
  }

  if (TOOLS_CALCULATORS.has(canonical)) {
    const calc = CALCULATOR_META[canonical];
    if (calc) {
      const faqs = getCalculatorFaqs(calc.canonical) ?? [];
      const label = calc.title.split('|')[0].trim();
      return {
        ...calc,
        route,
        h1: label,
        intro: calc.description,
        faqs,
        articleHtml: generateCalculatorContentHtml(canonical, calc, faqs),
        jsonLd: [
          {
            '@type': 'WebApplication',
            name: label,
            url: `${SITE}${calc.canonical}`,
            description: calc.description,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'All',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          ...(faqs.length
            ? [
                {
                  '@type': 'FAQPage',
                  mainEntity: faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                  })),
                },
              ]
            : []),
          breadcrumb([
            { name: 'Home', url: '/' },
            { name: label, url: calc.canonical },
          ]),
        ],
      };
    }
  }

  if (canonical === '/is-it-down') {
    const meta = STATIC_PAGE_META['/is-it-down']!;
    const faqs = [
      { q: 'How does TableView test whether a website is down?', a: 'Cloudflare Workers edge nodes dispatch a live HTTP probe to the remote server using standard browser headers — testing connectivity, DNS, TLS/SSL, status codes, and latency.' },
      { q: 'Down for everyone vs. just you?', a: 'Down for everyone means the server returned a 5xx or timed out globally. Just you means the site is up publicly but your local network, DNS, firewall, or ISP is blocking it.' },
      { q: 'How do I fix an unreachable-but-up site?', a: 'Flush local DNS, hard-refresh, use incognito, disable VPN, or switch to public DNS such as Cloudflare 1.1.1.1 or Google 8.8.8.8.' },
      { q: 'What causes outages?', a: 'DDoS attacks, DNS misconfigurations, expired TLS certificates, cloud provider incidents, app errors, and database pool exhaustion.' },
      { q: 'What do HTTP 502 and 503 mean?', a: '502 Bad Gateway = an edge proxy got an invalid origin response; 503 = the server is overloaded or under maintenance.' },
    ];
    return {
      ...meta,
      route,
      faqs,
      h1: 'Is It Down Right Now? Website Status & Uptime Checker',
      intro: meta.description,
      articleHtml: generateIsItDownContentHtml(meta),
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: 'Website Uptime Checker',
          url: `${SITE}/is-it-down`,
          description: meta.description,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
        breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Website Status Checker', url: '/is-it-down' },
        ]),
      ],
    };
  }

  const staticMeta = STATIC_PAGE_META[canonical];
  if (staticMeta) {
    return {
      ...staticMeta,
      route,
      faqs: [],
      h1: staticMeta.title,
      intro: staticMeta.description,
      articleHtml: generateStaticPageContentHtml(canonical),
      jsonLd: [
        {
          '@type': 'WebPage',
          name: staticMeta.title,
          description: staticMeta.description,
          url: `${SITE}${staticMeta.canonical}`,
        },
        breadcrumb([
          { name: 'Home', url: '/' },
          { name: staticMeta.title, url: staticMeta.canonical },
        ]),
      ],
    };
  }

  throw new Error(`No metadata defined for canonical route "${canonical}" (from ${url})`);
}


/** Scoped prerender targets for this app (data tools + FinOps + guides + legal). */
function listPrerenderTargets(): { url: string; canonical: string }[] {
  const targets = new Map<string, string>();
  const add = (url: string, canonical: string) => {
    if (!targets.has(url)) targets.set(url, canonical);
  };

  add('/', '/');
  add('/data-tools', '/data-tools');
  add('/workbench', '/data-tools');
  add('/tools', '/data-tools');
  add('/viewers', '/data-tools');

  for (const slug of DATA_TOOL_SLUGS) add(`/${slug}`, `/${slug}`);

  for (const [alias, slug] of Object.entries(TOOL_ALIASES)) {
    if (DATA_TOOL_SLUGS.has(slug)) add(`/${alias}`, `/${slug}`);
  }

  const calcAliases: Record<string, string[]> = {
    '/parquet-storage-calculator': ['/parquet-savings-calculator', '/parquet-cost-calculator'],
    '/snowflake-cost-calculator': ['/snowflake-calculator', '/snowflake-warehouse-calculator'],
    '/json-formatter': ['/json-beautifier', '/json-validator', '/json-viewer-online', '/format-json'],
    '/sql-formatter': ['/sql-beautifier', '/sql-minify', '/format-sql'],
  };
  for (const [canonical, aliases] of Object.entries(calcAliases)) {
    add(canonical, canonical);
    for (const a of aliases) add(a, canonical);
  }

  add('/is-it-down', '/is-it-down');

  add('/guides', '/guides');
  for (const guide of dataGuides) {
    add(`/guides/${guide.slug}`, `/guides/${guide.slug}`);
    add(`/${guide.slug}`, `/guides/${guide.slug}`);
  }

  add('/about', '/about');
  add('/about-us', '/about');
  add('/contact', '/contact');
  add('/contact-us', '/contact');
  add('/support', '/contact');
  add('/privacy', '/privacy');
  add('/privacy-policy', '/privacy');
  add('/terms', '/terms');
  add('/terms-of-service', '/terms');
  add('/tos', '/terms');
  add('/disclaimer', '/disclaimer');

  return [...targets.entries()].map(([url, canonical]) => ({ url, canonical }));
}


function renderHtml(template: string, page: ResolvedPage): string {
  const url = `${SITE}${page.canonical}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);

  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /<meta name="title" content="[^"]*" \/>/,
    `<meta name="title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${description}" />`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`
  );

  // Open Graph
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${description}" />`
  );

  // Twitter
  html = html.replace(/<meta property="twitter:url" content="[^"]*" \/>/, `<meta property="twitter:url" content="${url}" />`);
  html = html.replace(/<meta property="twitter:title" content="[^"]*" \/>/, `<meta property="twitter:title" content="${title}" />`);
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:description" content="${description}" />`
  );

  // Swap the homepage WebApplication JSON-LD for route-specific structured data.
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(
      { '@context': 'https://schema.org', '@graph': [...publisherNodes(), ...page.jsonLd] },
      null,
      2
    )}\n    </script>`
  );

  // Social preview image.
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    (match) =>
      `${match}\n    <meta property="og:image" content="${SITE}/og-image.png" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="TableView.dev — private in-browser data tools" />`
  );

  html = html.replace(
    /<meta property="twitter:url" content="[^"]*" \/>/,
    (match) => `${match}\n    <meta property="twitter:image" content="${SITE}/og-image.png" />`
  );

  // Construct full semantic HTML content
  const pageMainContent = page.articleHtml || `
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem;">
      <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">${page.h1 ? escapeHtml(page.h1) : ''}</h1>
      <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7; margin-bottom: 2rem;">${page.intro ? escapeHtml(page.intro) : ''}</p>
      ${
        page.faqs.length
          ? `<h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem; margin-bottom: 1rem;">Frequently asked questions</h2>${page.faqs
              .map((f) => `<h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3><p style="color: #64748b; line-height: 1.7; margin-bottom: 1.5rem;">${escapeHtml(f.a)}</p>`)
              .join('')}`
          : ''
      }
    </article>
  `;

  const fullSemanticHtml = `
    <div class="tableview-static-shell" style="background: #f8fafc; color: #1e293b; min-height: 100vh; display: flex; flex-direction: column;">
      ${generateHeaderHtml()}
      <main style="flex: 1;">
        ${pageMainContent}
      </main>
      ${generateFooterHtml()}
    </div>
  `;

  // Inject into BOTH <div id="root"> and <noscript>
  // When JS is disabled or during bot crawls, the full rich content is immediately visible.
  // When React boots, createRoot overwrites #root with the interactive SPA cleanly.
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${fullSemanticHtml}</div>\n    <noscript>${fullSemanticHtml}</noscript>`
  );

  return html;
}

function writePage(outPath: string, html: string, written: Set<string>) {
  const normalised = path.normalize(outPath);
  if (written.has(normalised)) return;
  written.add(normalised);
  fs.mkdirSync(path.dirname(normalised), { recursive: true });
  fs.writeFileSync(normalised, html);
}

function priorityFor(canonical: string): { priority: string; changefreq: string } {
  if (canonical === '/') return { priority: '1.0', changefreq: 'daily' };
  if (canonical.startsWith('/guides')) return { priority: '0.85', changefreq: 'monthly' };
  if (['/about', '/contact', '/privacy', '/terms', '/disclaimer'].includes(canonical)) {
    return { priority: '0.5', changefreq: 'yearly' };
  }
  if (canonical.endsWith('-calculator')) return { priority: '0.95', changefreq: 'weekly' };
  return { priority: '0.90', changefreq: 'weekly' };
}

function writeSitemap(canonicals: string[]) {
  const unique = [...new Set(canonicals)].sort((a, b) => {
    const pa = Number(priorityFor(a).priority);
    const pb = Number(priorityFor(b).priority);
    return pb - pa || a.localeCompare(b);
  });

  const today = new Date().toISOString().slice(0, 10);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map((canonical) => {
    const { priority, changefreq } = priorityFor(canonical);
    return `  <url>
    <loc>${SITE}${canonical}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml);
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    for (const f of ['llms.txt', 'llms-full.txt', 'robots.txt']) {
      const src = path.join(publicDir, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(distDir, f));
      }
    }
  }
  console.log(`[prerender] sitemap.xml regenerated with ${unique.length} canonical URLs`);
}

function main() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found — run `vite build` first.');
  }
  let template = fs.readFileSync(templatePath, 'utf8');

  const assetsDir = path.join(distDir, 'assets');
  const interFont = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir).find((f) => f.startsWith('inter-latin-var-') && f.endsWith('.woff2'))
    : undefined;

  if (interFont) {
    template = template.replace(
      '<link rel="stylesheet"',
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${interFont}" />\n    <link rel="stylesheet"`
    );
  }

  const targets = listPrerenderTargets();
  const written = new Set<string>();

  const titleByCanonical = new Map<string, string>();
  const duplicates: string[] = [];

  for (const { url, canonical } of targets) {
    const page = resolvePage(url, canonical);
    const html = renderHtml(template, page);

    if (url === '/') {
      writePage(templatePath, html, written);
    } else {
      writePage(path.join(distDir, url, 'index.html'), html, written);
      writePage(path.join(distDir, `${url}.html`), html, written);
    }

    const owner = titleByCanonical.get(page.title);
    if (owner && owner !== page.canonical) {
      duplicates.push(`${owner} and ${page.canonical} share the title "${page.title}"`);
    } else {
      titleByCanonical.set(page.title, page.canonical);
    }
  }

  writeSitemap(targets.map((t) => resolvePage(t.url, t.canonical).canonical));

  console.log(`[prerender] wrote ${written.size} files for ${targets.length} URLs`);
  if (duplicates.length) {
    console.warn(`[prerender] ${duplicates.length} duplicate <title> value(s):`);
    for (const d of duplicates) console.warn(`  - ${d}`);
  }
}

main();
