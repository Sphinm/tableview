/**
 * Build-time prerenderer.
 *
 * Why this exists: the app is a client-rendered SPA, so every one of the ~70
 * URLs shipped the *homepage* <title>, description, canonical and Open Graph
 * tags in its initial HTML. Search engines that do not execute JavaScript and
 * every social/link-preview crawler therefore saw identical metadata for the
 * whole site.
 *
 * This script runs after `vite build` and writes a real static HTML file per
 * route with:
 *   - the correct <title>, description, canonical, OG/Twitter card
 *   - route-specific JSON-LD (WebApplication / FAQPage / TechArticle / Breadcrumb)
 *   - full semantic, crawlable HTML body containing complete articles, formulas,
 *     worked examples, and FAQs (so crawlers and AdSense bots see 1,500–4,000 words)
 *
 * React still boots over the top of it, so behaviour is unchanged for users.
 *
 * Run: bun run scripts/prerender.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOOLS_CONFIG } from '../src/data/tools';
import { guidesData, type GuideItem } from '../src/data/guides';
import { listPrerenderTargets, resolveRoutePath } from '../src/lib/resolveRoute';
import { SALARY_LONG_TAIL_MAP, type SalaryLongTailPage } from '../src/data/salaryLongTail';
import {
  HOME_META,
  DATA_TOOLS_META,
  GUIDES_HUB_META,
  CALCULATOR_META,
  STATIC_PAGE_META,
  type PageMeta,
} from '../src/data/routeMeta';
import { getCalculatorFaqs } from '../src/data/calculatorFaqs';
import { toIsoDate } from '../src/lib/isoDate';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const distDir = path.join(rootDir, 'dist');
const SITE = 'https://tableview.dev';

interface ResolvedPage extends PageMeta {
  route: string;
  faqs: { q: string; a: string }[];
  h1?: string;
  intro?: string;
  jsonLd: Record<string, any>[];
  articleHtml?: string;
}

const TOOLS_BY_PATH = new Map(Object.values(TOOLS_CONFIG).map((cfg) => [cfg.path, cfg]));

const GUIDES_BY_SLUG = new Map(
  guidesData.map((guide) => {
    const isoDate = toIsoDate(guide.date);
    if (!isoDate) {
      throw new Error(
        `Guide "${guide.slug}" has an unparseable date: ${JSON.stringify(guide.date)}`
      );
    }
    return [guide.slug, { ...guide, isoDate }];
  })
);

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
      '@id': `${SITE}/#organization`,
      name: 'TableView.dev',
      url: SITE,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/icon-512.png`,
        width: 512,
        height: 512,
      },
      description:
        'Private, in-browser data workspace for inspecting, querying and converting CSV, Excel, Apache Parquet and JSON files, plus real estate and cloud FinOps calculators. Files are never uploaded.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'TableView.dev',
      url: SITE,
      publisher: { '@id': `${SITE}/#organization` },
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

/** Render universal semantic header */
function generateHeaderHtml(): string {
  return `
    <header style="border-bottom: 1px solid #1e293b; padding: 1rem 1.5rem; background: #0b0f17; color: #f8fafc;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <a href="/" style="font-weight: 800; font-size: 1.25rem; color: #38bdf8; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
          <span>TableView.dev</span>
          <span style="font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #0369a1; color: #e0f2fe;">100% In-Browser</span>
        </a>
        <nav style="display: flex; gap: 1.5rem; font-size: 0.875rem; flex-wrap: wrap; font-weight: 500;">
          <a href="/video-compressor" style="color: #cbd5e1; text-decoration: none;">Video Compressor</a>
          <a href="/image-compressor" style="color: #cbd5e1; text-decoration: none;">Image Compressor</a>
          <a href="/finance-calculator" style="color: #cbd5e1; text-decoration: none;">Calculators</a>
          <a href="/data-tools" style="color: #cbd5e1; text-decoration: none;">Data Tools</a>
          <a href="/guides" style="color: #cbd5e1; text-decoration: none;">Guides</a>
          <a href="/about" style="color: #cbd5e1; text-decoration: none;">About</a>
          <a href="/contact" style="color: #cbd5e1; text-decoration: none;">Contact</a>
        </nav>
      </div>
    </header>
  `;
}

/** Render universal semantic footer with compliance and disclaimers */
function generateFooterHtml(): string {
  return `
    <footer style="border-top: 1px solid #1e293b; padding: 3.5rem 1.5rem 2rem; background: #050608; color: #94a3b8; font-size: 0.875rem; margin-top: 4rem;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2.5rem; margin-bottom: 2.5rem;">
          <div>
            <h4 style="color: #f8fafc; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Commercial Real Estate & Debt</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/dscr-loan-calculator" style="color: #94a3b8; text-decoration: none;">DSCR Loan Calculator</a></li>
              <li><a href="/commercial-loan-calculator" style="color: #94a3b8; text-decoration: none;">Commercial Loan & Balloon</a></li>
              <li><a href="/section-1031-exchange-calculator" style="color: #94a3b8; text-decoration: none;">IRC §1031 Tax Deferral</a></li>
              <li><a href="/loan-comparison-calculator" style="color: #94a3b8; text-decoration: none;">Loan Comparison & APR</a></li>
              <li><a href="/mortgage-calculator" style="color: #94a3b8; text-decoration: none;">Residential Mortgage & PITI</a></li>
              <li><a href="/refinance-calculator" style="color: #94a3b8; text-decoration: none;">Refinance Break-Even</a></li>
              <li><a href="/hard-money-calculator" style="color: #94a3b8; text-decoration: none;">Hard Money & Fix-and-Flip</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #f8fafc; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Payroll & Cloud FinOps</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/salary-to-hourly-calculator" style="color: #94a3b8; text-decoration: none;">Salary to Hourly Calculator</a></li>
              <li><a href="/snowflake-cost-calculator" style="color: #94a3b8; text-decoration: none;">Snowflake Warehouse Cost</a></li>
              <li><a href="/parquet-storage-calculator" style="color: #94a3b8; text-decoration: none;">Parquet Storage & Scan Savings</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #f8fafc; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">In-Browser Data Workbench</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/data-tools" style="color: #94a3b8; text-decoration: none;">Data Workbench Console</a></li>
              <li><a href="/csv-viewer" style="color: #94a3b8; text-decoration: none;">CSV Spreadsheet Viewer</a></li>
              <li><a href="/excel-viewer" style="color: #94a3b8; text-decoration: none;">Excel (.xlsx) Viewer</a></li>
              <li><a href="/parquet-viewer" style="color: #94a3b8; text-decoration: none;">Apache Parquet Viewer</a></li>
              <li><a href="/sql-workbench" style="color: #94a3b8; text-decoration: none;">DuckDB SQL Console</a></li>
              <li><a href="/json-formatter" style="color: #94a3b8; text-decoration: none;">JSON Formatter & Prettifier</a></li>
              <li><a href="/sql-formatter" style="color: #94a3b8; text-decoration: none;">SQL Query Formatter</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #f8fafc; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Media & Compression Tools</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/video-compressor" style="color: #94a3b8; text-decoration: none;">Video Compressor (WebAssembly)</a></li>
              <li><a href="/image-compressor" style="color: #94a3b8; text-decoration: none;">Image Compressor (Batch & ZIP)</a></li>
              <li><a href="/compress-video" style="color: #94a3b8; text-decoration: none;">Reduce Video Size (MP4/WebM)</a></li>
              <li><a href="/compress-image" style="color: #94a3b8; text-decoration: none;">Batch Photo Optimizer (WebP/JPG)</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #f8fafc; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Guides & Research</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/guides" style="color: #94a3b8; text-decoration: none;">All 20 In-Depth Guides</a></li>
              <li><a href="/guides/commercial-real-estate-loan-types" style="color: #94a3b8; text-decoration: none;">CRE Loan Types (CMBS, SBA)</a></li>
              <li><a href="/guides/section-1031-exchange-rules-timeline" style="color: #94a3b8; text-decoration: none;">1031 Exchange Rules & Deadlines</a></li>
              <li><a href="/guides/how-to-calculate-dscr" style="color: #94a3b8; text-decoration: none;">How to Calculate DSCR Ratio</a></li>
              <li><a href="/guides/what-is-apache-parquet" style="color: #94a3b8; text-decoration: none;">What is Apache Parquet?</a></li>
              <li><a href="/guides/duckdb-wasm-in-browser-olap" style="color: #94a3b8; text-decoration: none;">DuckDB-Wasm In-Browser OLAP</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #f8fafc; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Platform & Trust</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/about" style="color: #94a3b8; text-decoration: none;">About TableView.dev</a></li>
              <li><a href="/contact" style="color: #94a3b8; text-decoration: none;">Contact & Support Desk</a></li>
              <li><a href="/privacy" style="color: #94a3b8; text-decoration: none;">Privacy Policy (GDPR / AdSense)</a></li>
              <li><a href="/terms" style="color: #94a3b8; text-decoration: none;">Terms of Service</a></li>
              <li><a href="/disclaimer" style="color: #94a3b8; text-decoration: none;">Legal & Financial Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div style="border-top: 1px solid #1e293b; padding-top: 1.75rem; text-align: center; color: #64748b; font-size: 0.775rem; line-height: 1.7;">
          <p style="margin-bottom: 0.5rem; max-width: 900px; margin-left: auto; margin-right: auto;"><strong>Financial & Underwriting Disclosure:</strong> All financial calculators, debt-service coverage ratio (DSCR) models, amortization schedules, like-kind exchange simulations, and wage estimates provided on TableView.dev are strictly for informational and educational purposes. None of the content on this website constitutes financial, investment, legal, tax, or mortgage underwriting advice. Always verify terms with certified financial advisors, CPAs, or institutional lenders before signing debt contracts.</p>
          <p>© 2026 TableView.dev — 100% Private In-Browser WebAssembly Modeling Engine. Zero Server Uploads.</p>
        </div>
      </div>
    </footer>
  `;
}

/** Render rich article HTML for a Guide */
function generateGuideArticleHtml(guide: GuideItem): string {
  const sectionsHtml = guide.sections
    .map((sec) => {
      let secBody = `<h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem; margin-bottom: 1rem;">${escapeHtml(sec.heading)}</h2>`;
      secBody += sec.paragraphs
        .map((p) => `<p style="margin-bottom: 1.15rem; line-height: 1.8; color: #cbd5e1;">${escapeHtml(p)}</p>`)
        .join('\n');

      if (sec.table) {
        const thead = sec.table.headers
          .map((h) => `<th style="border: 1px solid #334155; padding: 0.75rem; background: #0f172a; text-align: left; color: #f8fafc; font-weight: 600;">${escapeHtml(h)}</th>`)
          .join('');
        const tbody = sec.table.rows
          .map((row) => `<tr>${row.map((c) => `<td style="border: 1px solid #334155; padding: 0.75rem; color: #cbd5e1;">${escapeHtml(c)}</td>`).join('')}</tr>`)
          .join('');
        secBody += `<div style="overflow-x: auto; margin: 1.5rem 0;"><table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
      }

      if (sec.code) {
        secBody += `<pre style="background: #090d16; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1rem; overflow-x: auto; font-family: monospace; font-size: 0.85rem; color: #38bdf8; margin: 1.5rem 0;"><code>${escapeHtml(sec.code.code)}</code></pre>`;
      }

      return `<section id="${escapeHtml(sec.id)}">${secBody}</section>`;
    })
    .join('\n');

  const faqsHtml = guide.faqs?.length
    ? `
      <section style="margin-top: 3rem; border-top: 1px solid #1e293b; padding-top: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${guide.faqs
          .map(
            (f) => `
          <div style="margin-bottom: 1.5rem; background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #94a3b8; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
          )
          .join('')}
      </section>
    `
    : '';

  return `
    <article style="max-width: 860px; margin: 0 auto; padding: 2.5rem 1.5rem;">
      <nav style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">
        <a href="/" style="color: #38bdf8; text-decoration: none;">Home</a> / 
        <a href="/guides" style="color: #38bdf8; text-decoration: none;">Guides</a> / 
        <span>${escapeHtml(guide.title)}</span>
      </nav>
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.75rem;">
        <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;">
          <span style="background: #1e1b4b; color: #a5b4fc; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #3730a3;">${escapeHtml(guide.category)}</span>
          <span style="color: #64748b; font-size: 0.8rem;">${escapeHtml(guide.date)} · ${escapeHtml(guide.readTime)} · By ${escapeHtml(guide.author)}</span>
        </div>
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #f8fafc; line-height: 1.3; margin-bottom: 1rem;">${escapeHtml(guide.title)}</h1>
        <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">${escapeHtml(guide.excerpt)}</p>
      </header>
      <div class="guide-content">
        ${sectionsHtml}
        ${faqsHtml}
      </div>
    </article>
  `;
}

/** Render Guides Hub directory of all 20 guides */
function generateGuidesHubHtml(): string {
  const cards = guidesData
    .map(
      (g) => `
      <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="background: #022c22; color: #6ee7b7; font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 9999px; border: 1px solid #065f46;">${escapeHtml(g.category)}</span>
            <span style="color: #64748b; font-size: 0.75rem;">${escapeHtml(g.readTime)}</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem; line-height: 1.4;">
            <a href="/guides/${g.slug}" style="color: inherit; text-decoration: none;">${escapeHtml(g.title)}</a>
          </h3>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1rem;">${escapeHtml(g.excerpt)}</p>
        </div>
        <div style="border-top: 1px solid #1e293b; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b;">
          <span>${escapeHtml(g.author)}</span>
          <a href="/guides/${g.slug}" style="color: #38bdf8; text-decoration: none; font-weight: 600;">Read Guide →</a>
        </div>
      </div>
    `
    )
    .join('');

  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem;">
      <header style="text-align: center; margin-bottom: 3rem;">
        <span style="background: #0369a1; color: #e0f2fe; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 0.75rem;">Engineering & Finance Research Desk</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-bottom: 1rem;">Technical Guides & Modeling Playbooks</h1>
        <p style="font-size: 1.1rem; color: #94a3b8; max-width: 760px; margin: 0 auto; line-height: 1.7;">Comprehensive research papers, debt underwriting frameworks, IRS tax rules, and columnar storage benchmarks authored by our engineering and quantitative modeling teams.</p>
      </header>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${cards}
      </div>
    </div>
  `;
}

/** Render Static Legal & E-E-A-T Pages */
function generateStaticPageContentHtml(canonical: string): string {
  if (canonical === '/about') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
          <span style="background: #1e1b4b; color: #a5b4fc; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #3730a3;">The TableView Story</span>
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-top: 0.75rem; margin-bottom: 1rem;">About TableView.dev</h1>
          <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">TableView.dev is a 100% private, client-side data workspace and financial modeling engine built for data practitioners, commercial real estate underwriters, financial analysts, and software engineers.</p>
        </header>
        
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem;">1. The Core Problem: The Privacy Crisis in Cloud Tools</h2>
        <p>Historically, when professionals needed to quickly inspect a massive CSV, examine an Apache Parquet schema, or calculate complex commercial debt schedules, they faced an unacceptable trade-off: either install heavy desktop environments and configure Python virtual environments, or upload proprietary spreadsheets, internal financial deal sheets, and sensitive customer records to generic online converters.</p>
        <p>Uploading files to remote servers exposes confidential datasets to cloud logging, sub-processors, server crashes, and exfiltration vulnerabilities. In high-stakes enterprise and investment settings, this creates unacceptable regulatory liabilities under GDPR, HIPAA, and corporate confidentiality agreements.</p>

        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem;">2. The TableView Solution: 100% In-Browser WebAssembly Execution</h2>
        <p>By compiling DuckDB to WebAssembly (DuckDB-Wasm) and leveraging modern browser primitives like SIMD128 vectorization, dedicated Web Workers, and the HTML5 File API, TableView brings an institutional-grade analytical workstation directly into your web browser tab.</p>
        <p>When you open or drop a file in TableView.dev, <strong>exactly zero bytes are uploaded to our servers</strong>. Parsing, indexing, SQL queries, format conversion, and chart rendering execute 100% locally on your machine CPU and RAM. Your data never touches a remote server.</p>

        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem;">3. High-Precision Financial & Commercial Debt Engine</h2>
        <p>Beyond tabular data viewing, TableView provides 10 specialized financial and FinOps modeling engines covering Commercial Real Estate (CRE) debt, IRC §1031 like-kind tax deferrals, Debt Service Coverage Ratio (DSCR) underwriting, accelerated loan amortization schedules, FLSA overtime wage conversions, and Snowflake/Parquet cloud infrastructure sizing.</p>
        <p>All algorithms are fully documented, peer-reviewed against statutory guidelines (IRS, DOL, CFPB), and run client-side with zero server latency.</p>

        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem;">4. Engineering Team & Editorial Standards</h2>
        <p>TableView.dev is designed and maintained by a dedicated group of veteran data architects, quantitative modelers, and security engineers. We believe software utilities should be fast, private by default, and free from telemetry bloat. Reach our engineering and feedback desk anytime at <a href="mailto:feedback@tableview.dev" style="color: #38bdf8;">feedback@tableview.dev</a>.</p>
      </article>
    `;
  }

  if (canonical === '/contact') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-bottom: 1rem;">Contact TableView.dev</h1>
          <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">Have questions, feature requests, or need technical assistance with specialized Parquet schemas or debt modeling? Our team is here to assist.</p>
        </header>

        <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 2rem; margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.3rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.5rem;">Direct Engineering & Support Inbox</h2>
          <p style="margin-bottom: 1rem;">Send inquiries directly to: <a href="mailto:feedback@tableview.dev" style="color: #38bdf8; font-weight: 600; text-decoration: underline;">feedback@tableview.dev</a></p>
          <p style="font-size: 0.9rem; color: #94a3b8; margin: 0;"><strong>Response Window:</strong> Our team reviews and responds to all technical and partnership inquiries within 24 to 48 business hours (Monday – Friday, 9:00 AM – 6:00 PM EST).</p>
        </div>

        <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem;">Inquiry Categories We Handle</h2>
        <ul style="line-height: 2;">
          <li><strong>Bug Reports & Schema Support:</strong> If you encounter an unusual Apache Parquet encoding, complex nested JSON, or large CSV delimiter issue, share the schema details for rapid patch releases.</li>
          <li><strong>Financial Calculator Feedback:</strong> Suggestions for additional institutional debt features, commercial balloon adjustments, or state-specific tax deferral nuances.</li>
          <li><strong>Enterprise Deployment:</strong> Guidance on running TableView in air-gapped, isolated defense networks or internal corporate intranet clusters.</li>
          <li><strong>Security & Responsible Disclosure:</strong> Security audits and vulnerability reports are prioritized immediately by our core infrastructure maintainers.</li>
        </ul>
      </article>
    `;
  }

  if (canonical === '/privacy') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-bottom: 0.5rem;">Privacy Policy</h1>
          <p style="font-size: 0.85rem; color: #64748b;">Last Updated: September 2026 | TableView.dev</p>
        </header>

        <div style="background: #022c22; border: 1px solid #065f46; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 2rem; color: #a7f3d0;">
          <strong>The 100% Client-Side Sandbox Guarantee:</strong> When you open or drag an Apache Parquet, CSV, Excel, or JSON file into TableView.dev, zero bytes leave your computer. All processing runs in local browser WebAssembly memory.
        </div>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">1. Information We Collect</h2>
        <p>Because TableView.dev operates client-side, we never view, intercept, or store the contents of your datasets. Like all standard websites, our hosting infrastructure (e.g. Cloudflare Pages) automatically logs basic network metadata such as IP addresses, browser user-agent strings, referring URLs, and timestamp requests for security and DDoS mitigation.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">2. Google AdSense & Third-Party Advertising Disclosures</h2>
        <p>To sustain free access to our advanced in-browser modeling tools without requiring paid subscriptions, TableView.dev partners with third-party advertising vendors, including Google AdSense.</p>
        <ul style="line-height: 1.9;">
          <li><strong>Third-party vendors, including Google, use cookies</strong> to serve advertisements based on a user's prior visits to TableView.dev or other websites on the Internet.</li>
          <li><strong>Google's use of advertising cookies</strong> enables it and its partners to serve targeted ads to users based on their navigation history across the web.</li>
          <li>Users can opt out of personalized advertising at any time by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color: #38bdf8;">Google Ads Settings</a> or through the Network Advertising Initiative opt-out page at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style="color: #38bdf8;">www.aboutads.info</a>.</li>
        </ul>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">3. Consent Mode v2 & Analytics</h2>
        <p>We implement Google Consent Mode v2. All advertising and analytics storage cookies default to "denied" until explicit consent is granted via our user cookie preferences. Users may revoke or modify consent at any time.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">4. GDPR & CCPA Compliance</h2>
        <p>Residents of the European Economic Area (EEA) and California enjoy statutory rights to data transparency, access, and deletion. Because TableView does not collect personal identity or dataset records, your rights are inherently safeguarded by our architectural design.</p>
      </article>
    `;
  }

  if (canonical === '/terms') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-bottom: 0.5rem;">Terms of Service</h1>
          <p style="font-size: 0.85rem; color: #64748b;">Effective Date: September 2026 | TableView.dev</p>
        </header>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">1. Acceptance of Terms</h2>
        <p>By accessing or utilizing TableView.dev, including any data viewers, format converters, and financial modeling calculators, you agree to be bound by these Terms of Service.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">2. Permitted Use & Intellectual Property</h2>
        <p>TableView grants you a personal, worldwide, non-exclusive license to use our in-browser web application for personal, commercial, and enterprise evaluations. All underlying application code, brand assets, and original editorial content are the exclusive intellectual property of TableView.dev.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">3. Disclaimer of Warranties & Limitation of Liability</h2>
        <p>The services and calculations on TableView.dev are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Under no circumstances shall TableView.dev or its operators be liable for financial losses, missed closing deadlines, tax penalties, or data discrepancies arising from the use of our calculators or tools.</p>
      </article>
    `;
  }

  if (canonical === '/disclaimer') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-bottom: 0.5rem;">Legal & Financial Disclaimer</h1>
          <p style="font-size: 0.85rem; color: #64748b;">TableView.dev Informational Disclosure</p>
        </header>

        <div style="background: #451a03; border: 1px solid #78350f; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 2rem; color: #fde68a;">
          <strong>Important Advisory:</strong> TableView.dev is not a bank, licensed mortgage lender, certified public accounting (CPA) firm, or registered investment advisor. None of our tools constitute financial, legal, or tax underwriting advice.
        </div>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">1. Informational & Educational Use Only</h2>
        <p>All financial calculators, debt-service coverage ratio (DSCR) simulations, commercial real estate balloon estimates, IRC §1031 tax deferral calculations, and wage models are provided strictly for educational and preliminary exploration. Real estate and debt underwriting involves complex loan covenants, property appraisals, title insurance, and lender fees that vary by institution.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-top: 1.75rem;">2. No Fiduciary or Professional Relationship</h2>
        <p>Using our website does not create any fiduciary, agency, or advisory relationship. Always review transaction structures with licensed mortgage loan officers, certified CPAs, and qualified 1031 exchange intermediaries before executing agreements.</p>
      </article>
    `;
  }

  if (canonical === '/video-compressor') {
    return generateVideoCompressorContentHtml();
  }

  if (canonical === '/image-compressor') {
    return generateImageCompressorContentHtml();
  }

  return '';
}

const VIDEO_COMPRESSOR_FAQS = [
  {
    q: 'How does in-browser video compression work without uploading to a server?',
    a: 'TableView uses FFmpeg compiled directly to WebAssembly (Wasm). When you drop a video into the browser, the WebAssembly engine runs inside a local sandbox using your device CPU and RAM. The video data is decoded, re-encoded using H.264/AAC, and exported as a new MP4 or WebM file without a single byte ever being transmitted across the network.',
  },
  {
    q: 'Will TableView add a watermark to my compressed video?',
    a: 'No. TableView provides 100% clean video export without watermarks, branding frames, intro/outro cards, or quality downgrades. Unlike cloud services that insert watermarks to force you into paid subscriptions, TableView runs locally on your machine for free.',
  },
  {
    q: 'Is there a file size limit for video compression?',
    a: 'Because video processing occurs entirely client-side without consuming expensive cloud server bandwidth, TableView does not enforce artificial 100MB or 500MB upload limits. You can compress any video that your local device memory (RAM) can accommodate.',
  },
  {
    q: 'How can I compress a video to an exact target size (e.g. 25MB for Discord or 16MB for WhatsApp)?',
    a: 'Switch to the Target Size mode in our right-hand control panel and enter your desired target megabytes (e.g. 25MB for Discord or 16MB for WhatsApp). The engine dynamically calculates the required video bitrate based on the exact duration of your clip to ensure the output matches your target threshold.',
  },
  {
    q: 'Which video formats and resolutions are supported?',
    a: 'TableView accepts MP4, MOV, WebM, AVI, and MKV files. You can maintain original resolution or downscale to 1080p Full HD, 720p HD, or 480p SD, adjust Constant Rate Factor (CRF 18-35), and optionally remove or compress audio tracks.',
  },
];

const IMAGE_COMPRESSOR_FAQS = [
  {
    q: 'How does batch image compression work in TableView?',
    a: 'TableView uses high-performance HTML5 Canvas rendering and browser-native image codecs. You can drag and drop dozens of JPEG, PNG, or WebP images at once; each image is processed concurrently in browser memory, with real-time compression ratio calculation and a 1-click ZIP export.',
  },
  {
    q: 'How does the interactive before-and-after curtain slider help evaluate quality?',
    a: 'The visual curtain comparison slider lets you scrub horizontally across the image to compare the original uncompressed source directly against the compressed result. This allows you to verify that text remains crisp and details are preserved without compression artifacts before downloading.',
  },
  {
    q: 'Which format should I choose: WebP, JPEG, or PNG?',
    a: 'WebP provides superior compression efficiency, yielding 25%–35% smaller file sizes than JPEG at equivalent visual quality while supporting transparency. JPEG is best for universal compatibility across legacy platforms, and PNG is recommended for graphics with sharp geometric edges, logos, and alpha transparency.',
  },
  {
    q: 'Are my images uploaded to any cloud server or stored online?',
    a: 'Never. All image rendering, downscaling, compression, and ZIP packaging take place strictly within your local browser sandbox. No image data or metadata is ever sent to any remote server or third party.',
  },
  {
    q: 'Can I resize image dimensions in pixels during compression?',
    a: 'Yes. You can preserve the original aspect ratio while capping maximum dimensions to presets such as 1920px (Full HD), 1280px (HD), 800px (Web standard), or keeping original dimensions.',
  },
];

function generateVideoCompressorContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
        <span style="background: #022c22; color: #6ee7b7; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #065f46;">Pure Client-Side WebAssembly · Zero Server Upload</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-top: 0.75rem; margin-bottom: 1rem;">Free Online Video Compressor: 100% In-Browser &amp; No Watermark</h1>
        <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">Compress MP4, MOV, WebM, and MKV video files directly inside your browser using WebAssembly FFmpeg. Reduce file sizes by up to 90% without uploading bytes to remote servers, without watermarks, and with synchronized before-and-after video playback preview.</p>
      </header>

      <aside style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #38bdf8; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Answer (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">TableView.dev Video Compressor is a 100% free, privacy-first web utility powered by WebAssembly FFmpeg. It compresses MP4, MOV, WebM, and MKV video files up to 85% with zero watermarks, zero server uploads (0 KB network egress), and custom target MB output (e.g. 25MB for Discord, 16MB for WhatsApp). No account or software installation required.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">Why In-Browser Video Compression Changes Everything</h2>
        <p>Traditional online video compressors (like Clideo, VideoCompress.ai, or FreeConvert) require you to upload large multi-gigabyte video files to remote cloud servers. This introduces three critical bottlenecks: slow upload times on limited connections, severe privacy risks for confidential footage or personal family videos, and aggressive paywalls with watermarks on free tiers.</p>
        <p><strong>TableView solves this entirely on the client side:</strong> By compiling the industry-standard FFmpeg multimedia framework to WebAssembly (Wasm), video decoding, bitrate optimization, and H.264 re-encoding execute 100% inside your browser tab on your local CPU and GPU. Your video never leaves your machine.</p>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">In-Browser WebAssembly vs. Traditional Cloud Video Compressors</h2>
        <div style="overflow-x: auto; margin: 1.5rem 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: #0f172a; color: #f8fafc;">
                <th style="border: 1px solid #334155; padding: 0.75rem; text-align: left;">Feature / Metric</th>
                <th style="border: 1px solid #334155; padding: 0.75rem; text-align: left; color: #34d399;">TableView.dev (Wasm)</th>
                <th style="border: 1px solid #334155; padding: 0.75rem; text-align: left; color: #f87171;">Traditional Cloud Compressors</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #334155; padding: 0.75rem; font-weight: 600;">Data Privacy &amp; Security</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #34d399;">100% Private (0 bytes uploaded)</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #cbd5e1;">Uploaded to third-party cloud/S3 storage</td>
              </tr>
              <tr>
                <td style="border: 1px solid #334155; padding: 0.75rem; font-weight: 600;">Watermark Policy</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #34d399;">Zero Watermarks (Clean Video Export)</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #cbd5e1;">Branding watermark forced on free tiers</td>
              </tr>
              <tr>
                <td style="border: 1px solid #334155; padding: 0.75rem; font-weight: 600;">File Size Limitations</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #34d399;">No artificial cloud file caps</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #cbd5e1;">Strict 100 MB – 500 MB upload limits</td>
              </tr>
              <tr>
                <td style="border: 1px solid #334155; padding: 0.75rem; font-weight: 600;">Processing Latency</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #34d399;">Immediate local encoding (No upload delay)</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #cbd5e1;">Slow upload + cloud queue wait + download</td>
              </tr>
              <tr>
                <td style="border: 1px solid #334155; padding: 0.75rem; font-weight: 600;">Target File Size (MB)</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #34d399;">Exact target MB with auto-bitrate calculation</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #cbd5e1;">Coarse percentage estimates only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">Optimized Compression Presets for Popular Platforms</h2>
        <ul style="line-height: 2;">
          <li><strong>Discord (25 MB / 50 MB limits):</strong> Set custom target to 24 MB to safely bypass Discord free attachment limits without losing 1080p visual sharpness.</li>
          <li><strong>WhatsApp (16 MB limit):</strong> Compress smartphone 4K or 1080p videos down to 15 MB for instant messaging delivery.</li>
          <li><strong>Email Attachments (20 MB / 25 MB):</strong> Shrink corporate presentations, screen recordings, and demos into lightweight email-ready MP4 files.</li>
          <li><strong>Twitter / X (512 MB &amp; fast web streaming):</strong> Encode with web-optimized MP4 container flags for immediate video playback without buffering.</li>
        </ul>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #1e293b; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${VIDEO_COMPRESSOR_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #94a3b8; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

function generateImageCompressorContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
        <span style="background: #022c22; color: #6ee7b7; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #065f46;">High-Speed In-Browser Canvas · Batch Processing &amp; ZIP</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-top: 0.75rem; margin-bottom: 1rem;">Free Online Image Compressor: Batch JPG, PNG, WebP &amp; ZIP Export</h1>
        <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">Batch compress photos and graphics directly in your browser with 100% privacy. Features an interactive before-and-after curtain comparison slider, custom quality adjustments, pixel resizing, and one-click ZIP packaging.</p>
      </header>

      <aside style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #38bdf8; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Answer (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">TableView.dev Image Compressor provides client-side batch compression for JPG, PNG, and WebP using HTML5 Canvas &amp; WebCodecs. It achieves up to 80% size reduction with interactive before/after visual inspection, zero server uploads (100% in-browser RAM), and instant 1-click bulk ZIP archive downloads. Completely free with no file limits.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">Batch Compression Engine Powered by HTML5 Canvas</h2>
        <p>Whether preparing product catalogs for e-commerce, optimizing web assets for Google PageSpeed Insights, or reducing smartphone photo storage, TableView provides an instant batch image optimization workstation. Drag and drop dozens of JPEG, PNG, or WebP files simultaneously; our canvas engine processes them in parallel directly in browser memory without sending a single pixel across the internet.</p>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">Format Comparison: WebP vs. JPEG vs. PNG</h2>
        <div style="overflow-x: auto; margin: 1.5rem 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: #0f172a; color: #f8fafc;">
                <th style="border: 1px solid #334155; padding: 0.75rem; text-align: left;">Format</th>
                <th style="border: 1px solid #334155; padding: 0.75rem; text-align: left;">Recommended Use Cases</th>
                <th style="border: 1px solid #334155; padding: 0.75rem; text-align: left;">Typical Size Savings</th>
                <th style="border: 1px solid #334155; padding: 0.75rem; text-align: left;">Transparency Support</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #334155; padding: 0.75rem; font-weight: 600; color: #38bdf8;">WebP (Recommended)</td>
                <td style="border: 1px solid #334155; padding: 0.75rem;">Modern websites, mobile apps, e-commerce stores</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #34d399;">30% – 80% smaller than original</td>
                <td style="border: 1px solid #334155; padding: 0.75rem;">Yes (Full Alpha Channel)</td>
              </tr>
              <tr>
                <td style="border: 1px solid #334155; padding: 0.75rem; font-weight: 600; color: #f8fafc;">JPEG (.jpg)</td>
                <td style="border: 1px solid #334155; padding: 0.75rem;">Photographs, legacy platforms, email newsletters</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #34d399;">40% – 70% reduction</td>
                <td style="border: 1px solid #334155; padding: 0.75rem;">No</td>
              </tr>
              <tr>
                <td style="border: 1px solid #334155; padding: 0.75rem; font-weight: 600; color: #f8fafc;">PNG (.png)</td>
                <td style="border: 1px solid #334155; padding: 0.75rem;">Logos, icons, UI screenshots with text</td>
                <td style="border: 1px solid #334155; padding: 0.75rem; color: #34d399;">20% – 45% lossless optimization</td>
                <td style="border: 1px solid #334155; padding: 0.75rem;">Yes (Full Alpha Channel)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">Visual Curtain Split-Screen Inspection</h2>
        <p>Lossy compression algorithms can introduce micro-artifacts, blurry edges, or banding in gradients. TableView includes an interactive horizontal curtain slider allowing you to scrub across the image at 100% zoom. Inspect pixels, text edges, and fine gradients before deciding to download.</p>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #1e293b; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${IMAGE_COMPRESSOR_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #94a3b8; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

/** Render Homepage semantic content */
function generateHomepageHtml(): string {
  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 3.5rem 1.5rem;">
      <header style="text-align: center; margin-bottom: 3.5rem;">
        <span style="background: #0369a1; color: #e0f2fe; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 1rem;">100% In-Browser · WebAssembly Powered · Zero Server Uploads</span>
        <h1 style="font-size: 2.75rem; font-weight: 800; color: #f8fafc; line-height: 1.25; margin-bottom: 1rem;">The 100% Private In-Browser Financial &amp; Commercial Modeling Engine</h1>
        <p style="font-size: 1.2rem; color: #94a3b8; max-width: 820px; margin: 0 auto; line-height: 1.7;">Institutional-grade debt modeling, commercial real estate underwriting, IRC §1031 like-kind tax deferrals, and payroll analytics running 100% client-side in WebAssembly.</p>
      </header>

      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1.5rem; text-align: center;">Institutional Real Estate &amp; Debt Calculators</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;"><a href="/dscr-loan-calculator" style="color: #38bdf8; text-decoration: none;">DSCR Loan Calculator</a></h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Calculate Debt Service Coverage Ratio, Net Operating Income (NOI), and investor qualification tiers for commercial and residential rental portfolios.</p>
            <a href="/dscr-loan-calculator" style="font-size: 0.85rem; font-weight: 600; color: #38bdf8; text-decoration: none;">Launch DSCR Model →</a>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;"><a href="/commercial-loan-calculator" style="color: #38bdf8; text-decoration: none;">Commercial Loan &amp; Balloon</a></h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Underwrite commercial property debt with 20-30 year amortization curves and 5-10 year balloon maturity lump sums.</p>
            <a href="/commercial-loan-calculator" style="font-size: 0.85rem; font-weight: 600; color: #38bdf8; text-decoration: none;">Calculate Balloon →</a>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;"><a href="/section-1031-exchange-calculator" style="color: #38bdf8; text-decoration: none;">IRC §1031 Tax Deferral</a></h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Model like-kind exchange tax deferrals, cash boot, mortgage relief boot, and replacement property basis.</p>
            <a href="/section-1031-exchange-calculator" style="font-size: 0.85rem; font-weight: 600; color: #38bdf8; text-decoration: none;">Model 1031 Exchange →</a>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;"><a href="/loan-comparison-calculator" style="color: #38bdf8; text-decoration: none;">Loan Comparison &amp; APR</a></h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Side-by-side debt structure comparison. Evaluate origination points, effective APR, and total interest over time.</p>
            <a href="/loan-comparison-calculator" style="font-size: 0.85rem; font-weight: 600; color: #38bdf8; text-decoration: none;">Compare Loans →</a>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;"><a href="/mortgage-calculator" style="color: #38bdf8; text-decoration: none;">Mortgage &amp; Amortization</a></h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Fixed-rate mortgage calculator with PMI cancellation, property tax escrow, extra principal, and full amortization charts.</p>
            <a href="/mortgage-calculator" style="font-size: 0.85rem; font-weight: 600; color: #38bdf8; text-decoration: none;">Run Mortgage Model →</a>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem;"><a href="/hard-money-calculator" style="color: #38bdf8; text-decoration: none;">Hard Money &amp; Fix-and-Flip</a></h3>
            <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Test the 70% Rule Maximum Allowable Offer (MAO), renovation draw schedules, and net profit margins.</p>
            <a href="/hard-money-calculator" style="font-size: 0.85rem; font-weight: 600; color: #38bdf8; text-decoration: none;">Analyze Fix & Flip →</a>
          </div>
        </div>
      </section>

      <section style="margin-bottom: 4rem; background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05)); border: 1px solid #3b82f6; border-radius: 1.25rem; padding: 2.5rem;">
        <span style="background: #1e1b4b; color: #a5b4fc; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 1rem; border: 1px solid #4338ca;">NEW · 100% PRIVATE IN-BROWSER</span>
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #f8fafc; margin-bottom: 1rem;">Client-Side Media Compression Studio</h2>
        <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">Compress MP4, MOV, WebM videos and JPEG, PNG, WebP images directly inside your browser using WebAssembly and Web Codecs. Zero server uploads, zero watermarks, zero quality compromises.</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/video-compressor" style="background: #6366f1; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; text-decoration: none;">Video Compressor →</a>
          <a href="/image-compressor" style="background: #1e293b; color: #f8fafc; border: 1px solid #475569; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; text-decoration: none;">Batch Image Compressor →</a>
        </div>
      </section>

      <section style="margin-bottom: 4rem; background: #0b0f17; border: 1px solid #1e293b; border-radius: 1.25rem; padding: 2.5rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">Need to inspect or query large data files?</h2>
        <p style="color: #94a3b8; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">Open our 100% private in-browser Data Workbench powered by DuckDB-Wasm. Inspect millions of rows, execute analytical SQL queries, and convert CSV, Excel, Apache Parquet, and JSON files without uploading bytes to external servers.</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/data-tools" style="background: #38bdf8; color: #020617; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; text-decoration: none;">Open Data Workbench →</a>
          <a href="/csv-viewer" style="background: #1e293b; color: #f8fafc; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; text-decoration: none;">CSV Viewer</a>
          <a href="/parquet-viewer" style="background: #1e293b; color: #f8fafc; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; text-decoration: none;">Parquet Viewer</a>
          <a href="/excel-viewer" style="background: #1e293b; color: #f8fafc; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; text-decoration: none;">Excel Viewer</a>
        </div>
      </section>
    </div>
  `;
}

/** Render Data Tools Workbench semantic content */
function generateDataToolsHtml(): string {
  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 3.5rem 1.5rem;">
      <header style="text-align: center; margin-bottom: 3.5rem;">
        <span style="background: #022c22; color: #6ee7b7; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 1rem;">100% Local WebAssembly Engine</span>
        <h1 style="font-size: 2.75rem; font-weight: 800; color: #f8fafc; line-height: 1.25; margin-bottom: 1rem;">In-Browser Data Workbench &amp; DuckDB SQL Console</h1>
        <p style="font-size: 1.2rem; color: #94a3b8; max-width: 820px; margin: 0 auto; line-height: 1.7;">Inspect, convert, and query large CSV, Excel (.xlsx), Apache Parquet, and JSON files with DuckDB-Wasm SIMD. Zero server uploads.</p>
      </header>

      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1.5rem;">All 15 In-Browser Data Tools</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/csv-viewer" style="color: #38bdf8; text-decoration: none;">CSV Spreadsheet Viewer</a></h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Open and sort large CSV and TSV spreadsheets client-side.</p>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/excel-viewer" style="color: #38bdf8; text-decoration: none;">Excel (.xlsx) Viewer</a></h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Preview multi-sheet Excel workbooks without Microsoft Office.</p>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/parquet-viewer" style="color: #38bdf8; text-decoration: none;">Apache Parquet Viewer</a></h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Inspect columnar Parquet datasets and row groups instantly.</p>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/sql-workbench" style="color: #38bdf8; text-decoration: none;">DuckDB SQL Console</a></h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Execute analytical SQL queries directly against client files.</p>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/json-formatter" style="color: #38bdf8; text-decoration: none;">JSON Formatter &amp; Prettifier</a></h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Format, validate, minify, and clean nested JSON documents.</p>
          </div>
          <div style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/sql-formatter" style="color: #38bdf8; text-decoration: none;">SQL Query Formatter</a></h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Beautify, indent, and format complex SQL dialects cleanly.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

/** Render Programmatic Salary Long-Tail Rich HTML */
function generateSalaryTierHtml(salaryPage: SalaryLongTailPage): string {
  const salary = salaryPage.salary;
  const hourly = Number(salaryPage.hourlyRate);
  const daily = (hourly * 8).toFixed(2);
  const weekly = (hourly * 40).toFixed(2);
  const biweekly = salaryPage.biweekly;
  const monthly = salaryPage.monthly;
  const overtimeRate = (hourly * 1.5).toFixed(2);
  const overtimeAnnual5hrs = (hourly * 1.5 * 5 * 52).toFixed(2);

  const monthlyNum = Number(monthly.replace(/,/g, ''));
  const needs50 = (monthlyNum * 0.5).toFixed(2);
  const wants30 = (monthlyNum * 0.3).toFixed(2);
  const savings20 = (monthlyNum * 0.2).toFixed(2);

  const ficaTax = (salary * 0.0765).toFixed(2);

  return `
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
      <nav style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">
        <a href="/" style="color: #38bdf8; text-decoration: none;">Home</a> / 
        <a href="/salary-to-hourly-calculator" style="color: #38bdf8; text-decoration: none;">Salary Calculator</a> / 
        <span>$${salary.toLocaleString()} a Year to Hourly</span>
      </nav>

      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
        <span style="background: #1e1b4b; color: #a5b4fc; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #3730a3;">2026 Wage Analysis</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-top: 0.75rem; margin-bottom: 1rem;">$${salary.toLocaleString()} a Year is How Much an Hour? ($${salaryPage.hourlyRate}/hr Full Breakdown)</h1>
        <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">Earning $${salary.toLocaleString()} per year equates to <strong>$${salaryPage.hourlyRate} per hour</strong> based on a standard 40-hour workweek across 52 weeks (2,080 annual working hours). Explore full paycheck calculations, overtime rates, and budget allocations below.</p>
      </header>

      <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">1. Complete Paycheck Conversion Matrix</h2>
      <div style="overflow-x: auto; margin-bottom: 2rem;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
          <thead>
            <tr style="background: #0f172a; border: 1px solid #334155;">
              <th style="padding: 0.75rem 1rem; text-align: left; color: #f8fafc;">Pay Frequency</th>
              <th style="padding: 0.75rem 1rem; text-align: left; color: #f8fafc;">Gross Pay Amount</th>
              <th style="padding: 0.75rem 1rem; text-align: left; color: #f8fafc;">Working Hours Assumed</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border: 1px solid #334155;"><td style="padding: 0.75rem 1rem;">Hourly Wage</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #38bdf8;">$${salaryPage.hourlyRate}</td><td style="padding: 0.75rem 1rem;">1 Hour</td></tr>
            <tr style="border: 1px solid #334155;"><td style="padding: 0.75rem 1rem;">Daily Pay</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #f8fafc;">$${daily}</td><td style="padding: 0.75rem 1rem;">8 Hours (Standard Workday)</td></tr>
            <tr style="border: 1px solid #334155;"><td style="padding: 0.75rem 1rem;">Weekly Paycheck</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #f8fafc;">$${weekly}</td><td style="padding: 0.75rem 1rem;">40 Hours per Week</td></tr>
            <tr style="border: 1px solid #334155;"><td style="padding: 0.75rem 1rem;">Bi-Weekly Paycheck</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #f8fafc;">$${biweekly}</td><td style="padding: 0.75rem 1rem;">80 Hours (26 Paychecks/yr)</td></tr>
            <tr style="border: 1px solid #334155;"><td style="padding: 0.75rem 1rem;">Monthly Paycheck</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #f8fafc;">$${monthly}</td><td style="padding: 0.75rem 1rem;">173.33 Hours (12 Months/yr)</td></tr>
            <tr style="border: 1px solid #334155;"><td style="padding: 0.75rem 1rem;">Annual Gross Salary</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #38bdf8;">$${salary.toLocaleString()}</td><td style="padding: 0.75rem 1rem;">2,080 Hours per Year</td></tr>
          </tbody>
        </table>
      </div>

      <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem;">2. FLSA Overtime Pay (1.5x Time-and-a-Half)</h2>
      <p>Under the federal Fair Labor Standards Act (FLSA), non-exempt employees must receive overtime pay for all hours worked exceeding 40 in a single workweek:</p>
      <ul>
        <li><strong>Base Overtime Hourly Rate:</strong> $${salaryPage.hourlyRate} × 1.5 = <strong>$${overtimeRate} per hour</strong>.</li>
        <li><strong>5 Hours of Weekly Overtime:</strong> Yields an extra $${(Number(overtimeRate) * 5).toFixed(2)} per week, or an additional <strong>+$${overtimeAnnual5hrs} per year</strong> in gross income.</li>
      </ul>

      <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem;">3. Recommended 50/30/20 Monthly Budget Allocation</h2>
      <p>Based on gross monthly earnings of $${monthly}, the standard 50/30/20 budget framework divides funds as follows:</p>
      <ul>
        <li><strong>Needs (50% — $${needs50}/mo):</strong> Essential living expenses including rent or mortgage, utilities, health insurance, transportation, and groceries.</li>
        <li><strong>Wants (30% — $${wants30}/mo):</strong> Discretionary spending including dining out, travel, entertainment, hobby gear, and streaming subscriptions.</li>
        <li><strong>Savings & Debt Payoff (20% — $${savings20}/mo):</strong> Wealth accumulation including emergency fund deposits, Roth IRA/401(k) retirement contributions, and accelerated student loan or credit card debt reduction.</li>
      </ul>

      <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-top: 2rem;">4. FICA Payroll Taxes & Take-Home Pay Context</h2>
      <p>Prior to income tax bracket deductions, mandatory federal FICA payroll taxes apply:</p>
      <ul>
        <li><strong>Social Security Tax (6.2%):</strong> $${(salary * 0.062).toFixed(2)} annually.</li>
        <li><strong>Medicare Tax (1.45%):</strong> $${(salary * 0.0145).toFixed(2)} annually.</li>
        <li><strong>Total FICA Withholding:</strong> $${ficaTax} annually ($${(Number(ficaTax) / 12).toFixed(2)} per month).</li>
      </ul>
      <p>For single filers, the federal standard deduction ($14,600) shelters the first portion of your earnings from federal income tax brackets, reducing your effective tax burden.</p>
    </article>
  `;
}

/** Render Calculator Underwriting & Math HTML */
function generateCalculatorContentHtml(canonical: string, calc: PageMeta, faqs: { q: string; a: string }[]): string {
  const label = calc.title.split('|')[0].trim();
  const faqsHtml = faqs.length
    ? `
      <section style="margin-top: 3rem; border-top: 1px solid #1e293b; padding-top: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${faqs
          .map(
            (f) => `
          <div style="margin-bottom: 1.5rem; background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #94a3b8; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
          )
          .join('')}
      </section>
    `
    : '';

  return `
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
        <span style="background: #0369a1; color: #e0f2fe; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px;">100% In-Browser Financial Model</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-top: 0.75rem; margin-bottom: 1rem;">${escapeHtml(label)}</h1>
        <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">${escapeHtml(calc.description)}</p>
      </header>

      <section style="background: #0b0f17; border: 1px solid #1e293b; border-radius: 1rem; padding: 2rem; margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.75rem;">Interactive WebAssembly Calculation Engine</h2>
        <p style="color: #cbd5e1; margin-bottom: 1rem;">This tool runs 100% in your local web browser tab. All amortization schedules, debt yield calculations, and tax deferral projections are computed client-side in WebAssembly. Zero bytes are uploaded to remote servers.</p>
        <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">Use the interactive form above to adjust parameters, toggle extra principal schedules, stress-test interest rates, and export full reports to Excel (.xlsx) or CSV.</p>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">Underwriting Methodology &amp; Mathematical Formulation</h2>
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

/** Work out the metadata + structured data for one canonical route. */
function resolvePage(url: string, canonical: string): ResolvedPage {
  const route = resolveRoutePath(url).path;

  // --- Homepage -------------------------------------------------------------
  if (canonical === '/') {
    return {
      ...HOME_META,
      route,
      faqs: [],
      h1: HOME_META.title,
      intro: HOME_META.description,
      articleHtml: generateHomepageHtml(),
      jsonLd: [breadcrumb([{ name: 'Home', url: '/' }])],
    };
  }

  // --- Data Tools Workbench Hub ---------------------------------------------
  if (canonical === '/data-tools') {
    return {
      ...DATA_TOOLS_META,
      route,
      faqs: [],
      h1: DATA_TOOLS_META.title,
      intro: DATA_TOOLS_META.description,
      articleHtml: generateDataToolsHtml(),
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: DATA_TOOLS_META.title,
          description: DATA_TOOLS_META.description,
          url: `${SITE}/data-tools`,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any',
        },
        breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Data Tools', url: '/data-tools' },
        ]),
      ],
    };
  }

  // --- Guides hub -----------------------------------------------------------
  if (canonical === '/guides') {
    return {
      ...GUIDES_HUB_META,
      route,
      faqs: [],
      h1: GUIDES_HUB_META.title,
      intro: GUIDES_HUB_META.description,
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

  // --- Individual guide -----------------------------------------------------
  if (canonical.startsWith('/guides/')) {
    const slug = canonical.replace('/guides/', '');
    const guide = GUIDES_BY_SLUG.get(slug);
    if (guide) {
      return {
        title: `${guide.title} | TableView.dev`,
        description: guide.excerpt,
        canonical,
        route,
        faqs: guide.faqs ?? [],
        h1: guide.title,
        intro: guide.excerpt,
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

  // --- Calculators with their own hand-written meta -------------------------
  const calc = CALCULATOR_META[canonical];
  if (calc) {
    const faqs = getCalculatorFaqs(calc.canonical);
    const label = calc.title.split('|')[0].trim();

    return {
      ...calc,
      route,
      faqs,
      h1: label,
      intro: calc.description,
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

  // --- Programmatic Salary Long-Tail Pages ----------------------------------
  const salaryPage = SALARY_LONG_TAIL_MAP[canonical];
  if (salaryPage) {
    const label = salaryPage.title.includes('?')
      ? `${salaryPage.title.split('?')[0].trim()}?`
      : salaryPage.title;
    const faqs = [
      {
        q: `How much is a $${salaryPage.salary.toLocaleString()} annual salary per hour?`,
        a: `A $${salaryPage.salary.toLocaleString()} yearly salary equals $${salaryPage.hourlyRate} per hour for a standard 40-hour workweek across 52 weeks (2,080 working hours).`,
      },
      {
        q: `What is the bi-weekly paycheck for $${salaryPage.salary.toLocaleString()} a year?`,
        a: `Assuming 26 pay periods per year, a $${salaryPage.salary.toLocaleString()} salary yields a gross bi-weekly paycheck of $${salaryPage.biweekly} before deductions and taxes.`,
      },
      {
        q: `How much overtime pay do you get with a $${salaryPage.salary.toLocaleString()} salary?`,
        a: `At a base hourly rate of $${salaryPage.hourlyRate}, non-exempt employees earn $${(Number(salaryPage.hourlyRate) * 1.5).toFixed(2)} per hour for FLSA 1.5x time-and-a-half overtime.`,
      },
    ];

    return {
      title: salaryPage.metaTitle,
      description: salaryPage.metaDescription,
      canonical: salaryPage.path,
      route,
      faqs,
      h1: label,
      intro: salaryPage.metaDescription,
      articleHtml: generateSalaryTierHtml(salaryPage),
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: label,
          url: `${SITE}${salaryPage.path}`,
          description: salaryPage.metaDescription,
          applicationCategory: 'FinanceApplication',
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
          { name: 'Salary to Hourly Calculator', url: '/salary-to-hourly-calculator' },
          { name: `$${salaryPage.salary.toLocaleString()} a Year to Hourly`, url: salaryPage.path },
        ]),
      ],
    };
  }

  // --- Tool landing pages (incl. calculators, which are also in TOOLS_CONFIG)
  const tool = TOOLS_BY_PATH.get(canonical);
  if (tool) {
    const faqs = tool.faqs ?? [];
    return {
      title: tool.metaTitle,
      description: tool.metaDescription,
      canonical: tool.path,
      route,
      faqs,
      h1: `${tool.h1} ${tool.h1Highlight}`.trim(),
      intro: tool.subtitle,
      articleHtml: `
        <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #cbd5e1; line-height: 1.8;">
          <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem;">
            <span style="background: #0369a1; color: #e0f2fe; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px;">${escapeHtml(tool.badge)}</span>
            <h1 style="font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-top: 0.75rem; margin-bottom: 1rem;">${escapeHtml(tool.h1)} ${escapeHtml(tool.h1Highlight)}</h1>
            <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">${escapeHtml(tool.subtitle)}</p>
          </header>
          <section style="margin-bottom: 2.5rem;">
            <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem;">Key Features &amp; Client-Side Capabilities</h2>
            <ul style="line-height: 2;">
              ${tool.features.map((f) => `<li><strong>${escapeHtml(f.title)}:</strong> ${escapeHtml(f.description)}</li>`).join('\n')}
            </ul>
          </section>
          ${
            faqs.length
              ? `
            <section style="margin-top: 3rem; border-top: 1px solid #1e293b; padding-top: 2rem;">
              <h2 style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
              ${faqs
                .map(
                  (f) => `
                <div style="margin-bottom: 1.5rem; background: #0b0f17; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem;">
                  <h3 style="font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
                  <p style="color: #94a3b8; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
                </div>
              `
                )
                .join('')}
            </section>
          `
              : ''
          }
        </article>
      `,
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: tool.title,
          url: `${SITE}${tool.path}`,
          description: tool.metaDescription,
          applicationCategory:
            tool.category === 'calculator' ? 'FinanceApplication' : 'DeveloperApplication',
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

  // --- Media & Compression Tools ------------------------------------------
  if (canonical === '/video-compressor' || canonical === '/image-compressor') {
    const isVideo = canonical === '/video-compressor';
    const label = isVideo
      ? 'Free Online Video Compressor: 100% In-Browser & No Watermark'
      : 'Free Online Image Compressor: Batch JPG, PNG, WebP & ZIP Export';
    const faqs = isVideo ? VIDEO_COMPRESSOR_FAQS : IMAGE_COMPRESSOR_FAQS;
    const meta = STATIC_PAGE_META[canonical]!;
    return {
      ...meta,
      route,
      faqs,
      h1: label,
      intro: meta.description,
      articleHtml: isVideo ? generateVideoCompressorContentHtml() : generateImageCompressorContentHtml(),
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: label,
          url: `${SITE}${canonical}`,
          description: meta.description,
          applicationCategory: isVideo ? 'MultimediaApplication' : 'UtilitiesApplication',
          operatingSystem: 'All',
          browserRequirements: 'Requires modern browser with WebAssembly support.',
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
          { name: isVideo ? 'Video Compressor' : 'Image Compressor', url: canonical },
        ]),
      ],
    };
  }

  // --- Static / legal pages -------------------------------------------------
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

/** Replace the homepage head in the Vite template with route-specific tags. */
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
      `${match}\n    <meta property="og:image" content="${SITE}/og-image.png" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="TableView.dev — private in-browser data workspace" />`
  );

  html = html.replace(
    /<meta property="twitter:url" content="[^"]*" \/>/,
    (match) => `${match}\n    <meta property="twitter:image" content="${SITE}/og-image.png" />`
  );

  // Construct full semantic HTML content
  const pageMainContent = page.articleHtml || `
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem;">
      <h1 style="font-size: 2.25rem; font-weight: 800; color: #f8fafc; margin-bottom: 1rem;">${page.h1 ? escapeHtml(page.h1) : ''}</h1>
      <p style="font-size: 1.15rem; color: #94a3b8; line-height: 1.7; margin-bottom: 2rem;">${page.intro ? escapeHtml(page.intro) : ''}</p>
      ${
        page.faqs.length
          ? `<h2>Frequently asked questions</h2>${page.faqs
              .map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`)
              .join('')}`
          : ''
      }
    </article>
  `;

  const fullSemanticHtml = `
    <div class="tableview-static-shell" style="background: #020617; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column;">
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
  if (canonical === '/video-compressor' || canonical === '/image-compressor') {
    return { priority: '0.95', changefreq: 'weekly' };
  }
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
