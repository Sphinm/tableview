/**
 * Build-time prerenderer for the TableView finance suite (tableview.dev).
 *
 * Why this exists: the app is a client-rendered SPA, so every URL shipped the
 * homepage <title>, description, canonical and Open Graph tags in its initial
 * HTML. Search engines that do not execute JavaScript and every social/link
 * preview crawler therefore saw identical metadata for the whole site.
 *
 * This script runs after `vite build` and writes a real static HTML file per
 * route with:
 *   - the correct <title>, description, canonical, OG/Twitter card
 *   - route-specific JSON-LD (WebApplication / FAQPage / TechArticle / Breadcrumb)
 *   - full semantic, crawlable HTML body containing articles, formulas, worked
 *     examples, and FAQs (so crawlers and AdSense bots see 1,500–4,000 words)
 *
 * React still boots over the top of it, so behaviour is unchanged for users.
 *
 * Run: bun run prerender
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { guidesData, type GuideItem } from '../src/data/guides';
import { listPrerenderTargets, resolveRoutePath } from '../src/lib/resolveRoute';
import { SALARY_LONG_TAIL_PAGES, type SalaryLongTailPage } from '../src/data/salaryLongTail';
import {
  HOME_META,
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

const SALARY_BY_PATH = new Map(
  SALARY_LONG_TAIL_PAGES.map((page) => [page.path, page])
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
        'Private, in-browser underwriting suite for DSCR loans, commercial real estate debt, IRC §1031 tax deferrals and payroll analytics. Every calculation runs client-side; no files are uploaded.',
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
    <header style="border-bottom: 1px solid #e2e8f0; padding: 1rem 1.5rem; background: #ffffff; color: #0f172a;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <a href="/" style="font-weight: 800; font-size: 1.25rem; color: #0f172a; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
          <span>TableView<span style="color: #0284c7;">.dev</span></span>
          <span style="font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;">100% In-Browser</span>
        </a>
        <nav style="display: flex; gap: 1.5rem; font-size: 0.875rem; flex-wrap: wrap; font-weight: 600;">
          <a href="/finance-calculator" style="color: #0f172a; text-decoration: none;">Calculators</a>
          <a href="/guides" style="color: #0f172a; text-decoration: none;">Guides</a>
          <a href="/about" style="color: #0f172a; text-decoration: none;">About</a>
          <a href="/contact" style="color: #0f172a; text-decoration: none;">Contact</a>
        </nav>
      </div>
    </header>
  `;
}

/** Render universal semantic footer with compliance and disclaimers */
function generateFooterHtml(): string {
  const guideLinks = guidesData
    .slice(0, 6)
    .map(
      (g) => `<li><a href="/guides/${g.slug}" style="color: #1e293b; text-decoration: none; font-weight: 500;">${g.title}</a></li>`
    )
    .join('\n');

  return `
    <footer style="border-top: 1px solid #e2e8f0; padding: 3.5rem 1.5rem 2rem; background: #f8fafc; color: #64748b; font-size: 0.875rem; margin-top: 4rem;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2.5rem; margin-bottom: 2.5rem;">
          <div>
            <h4 style="color: #0f172a; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Lending &amp; Debt Calculators</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/dscr-loan-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">DSCR Loan Calculator</a></li>
              <li><a href="/commercial-loan-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Commercial Loan &amp; Balloon</a></li>
              <li><a href="/balloon-payment-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Balloon Payment Calculator</a></li>
              <li><a href="/section-1031-exchange-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">IRC §1031 Tax Deferral</a></li>
              <li><a href="/1031-exchange-timeline-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">1031 Exchange Timeline</a></li>
              <li><a href="/loan-comparison-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Loan Comparison &amp; APR</a></li>
              <li><a href="/mortgage-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Residential Mortgage &amp; PITI</a></li>
              <li><a href="/amortization-schedule-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Amortization Schedule</a></li>
              <li><a href="/mortgage-payoff-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Mortgage Payoff Calculator</a></li>
              <li><a href="/refinance-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Refinance Break-Even</a></li>
              <li><a href="/cash-out-refinance-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Cash-Out Refinance</a></li>
              <li><a href="/hard-money-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Hard Money &amp; Fix-and-Flip</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #0f172a; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Payroll &amp; Compensation</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/salary-to-hourly-calculator" style="color: #1e293b; text-decoration: none; font-weight: 500;">Salary to Hourly Calculator</a></li>
              <li><a href="/30000-a-year-is-how-much-an-hour" style="color: #1e293b; text-decoration: none; font-weight: 500;">$30k a Year to Hourly</a></li>
              <li><a href="/60000-a-year-is-how-much-an-hour" style="color: #1e293b; text-decoration: none; font-weight: 500;">$60k a Year to Hourly</a></li>
              <li><a href="/100000-a-year-is-how-much-an-hour" style="color: #1e293b; text-decoration: none; font-weight: 500;">$100k a Year to Hourly</a></li>
            </ul>
          </div>
          <div>
            <h4 style="color: #0f172a; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Guides &amp; Research</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/guides" style="color: #1e293b; text-decoration: none; font-weight: 500;">All ${guidesData.length} In-Depth Guides</a></li>
              ${guideLinks}
            </ul>
          </div>
          <div>
            <h4 style="color: #0f172a; font-weight: 700; margin-bottom: 0.85rem; font-size: 0.95rem;">Platform &amp; Trust</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.1;">
              <li><a href="/about" style="color: #1e293b; text-decoration: none; font-weight: 500;">About TableView.dev</a></li>
              <li><a href="/contact" style="color: #1e293b; text-decoration: none; font-weight: 500;">Contact &amp; Support Desk</a></li>
              <li><a href="/privacy" style="color: #1e293b; text-decoration: none; font-weight: 500;">Privacy Policy (GDPR / AdSense)</a></li>
              <li><a href="/terms" style="color: #1e293b; text-decoration: none; font-weight: 500;">Terms of Service</a></li>
              <li><a href="/disclaimer" style="color: #1e293b; text-decoration: none; font-weight: 500;">Legal &amp; Financial Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 1.75rem; text-align: center; color: #64748b; font-size: 0.775rem; line-height: 1.7;">
          <p style="margin-bottom: 0.5rem; max-width: 900px; margin-left: auto; margin-right: auto;"><strong>Financial &amp; Underwriting Disclosure:</strong> All financial calculators, debt-service coverage ratio (DSCR) models, amortization schedules, like-kind exchange simulations, and wage estimates provided on TableView.dev are strictly for informational and educational purposes. None of the content on this website constitutes financial, investment, legal, tax, or mortgage underwriting advice. Always verify terms with certified financial advisors, CPAs, or institutional lenders before signing debt contracts.</p>
          <p>© 2026 TableView.dev — 100% Private In-Browser Financial Modeling Engine. Zero Server Uploads.</p>
        </div>
      </div>
    </footer>
  `;
}

/** Render rich article HTML for a Guide */
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



/** Render Guides Hub directory of all guides */
function generateGuidesHubHtml(): string {
  const cards = guidesData
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

/** Render Static Legal & E-E-A-T Pages */
function generateStaticPageContentHtml(canonical: string): string {
  if (canonical === '/about') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
          <span style="background: #eef2ff; color: #3730a3; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #c7d2fe;">The TableView Story</span>
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">About TableView.dev</h1>
          <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">TableView.dev is a 100% private, client-side financial underwriting suite built for commercial real estate sponsors, mortgage brokers, fix-and-flip investors, and financial analysts.</p>
        </header>

        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">1. The Core Problem: Privacy in Financial Modeling</h2>
        <p>Deal sheets, rent rolls, and borrower financing packages are among the most sensitive documents a professional touches. Yet most online underwriting calculators require uploading these files to cloud servers — exposing proprietary deal terms and client data to logging, sub-processors, and exfiltration risks.</p>

        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">2. The TableView Solution: 100% In-Browser WebAssembly Execution</h2>
        <p>Every calculator runs entirely inside your browser tab. Amortization schedules, DSCR coverage ratios, 1031 like-kind tax deferrals, and BRRRR projections are computed locally on your machine's CPU and RAM. <strong>Exactly zero bytes leave your device</strong> — no underwriting inputs are ever uploaded to a server.</p>

        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">3. Institutional-Grade Underwriting Engines</h2>
        <p>TableView provides specialized models for commercial real estate debt (DSCR, commercial loans, balloon structures), IRC §1031 like-kind exchanges, hard-money fix-and-flip underwriting, mortgage amortization, and FLSA overtime wage conversions — all documented and reviewed against statutory guidelines (IRS, DOL, CFPB).</p>

        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">4. Engineering Team & Editorial Standards</h2>
        <p>TableView.dev is designed and maintained by a dedicated group of veteran quantitative modelers and security engineers. We believe software utilities should be fast, private by default, and free from telemetry bloat. Reach our engineering and feedback desk anytime at <a href="mailto:feedback@tableview.dev" style="color: #0284c7;">feedback@tableview.dev</a>.</p>
      </article>
    `;
  }

  if (canonical === '/contact') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Contact TableView.dev</h1>
          <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Have questions, feature requests, or need technical assistance with CRE debt modeling or 1031 exchange structures? Our team is here to assist.</p>
        </header>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 2rem; margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.3rem; font-weight: 700; color: #0284c7; margin-bottom: 0.5rem;">Direct Engineering & Support Inbox</h2>
          <p style="margin-bottom: 1rem;">Send inquiries directly to: <a href="mailto:feedback@tableview.dev" style="color: #0284c7; font-weight: 600; text-decoration: underline;">feedback@tableview.dev</a></p>
          <p style="font-size: 0.9rem; color: #64748b; margin: 0;"><strong>Response Window:</strong> Our team reviews and responds to all technical and partnership inquiries within 24 to 48 business hours (Monday – Friday, 9:00 AM – 6:00 PM EST).</p>
        </div>

        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">Inquiry Categories We Handle</h2>
        <ul style="line-height: 2;">
          <li><strong>Underwriting Feedback:</strong> Suggestions for additional institutional debt features, commercial balloon adjustments, or state-specific tax deferral nuances.</li>
          <li><strong>Calculator Accuracy:</strong> Report an amortization or DSCR discrepancy and share the scenario for rapid patch releases.</li>
          <li><strong>Enterprise Deployment:</strong> Guidance on running TableView in air-gapped, isolated networks or internal corporate intranet clusters.</li>
          <li><strong>Security & Responsible Disclosure:</strong> Security audits and vulnerability reports are prioritized immediately by our core infrastructure maintainers.</li>
        </ul>
      </article>
    `;
  }

  if (canonical === '/privacy') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Privacy Policy</h1>
          <p style="font-size: 0.85rem; color: #64748b;">Last Updated: September 2026 | TableView.dev</p>
        </header>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 2rem; color: #065f46;">
          <strong>The 100% Client-Side Sandbox Guarantee:</strong> Every calculator on TableView.dev executes locally in your browser. Deal terms, rent rolls, and any data you type or import never leave your computer.
        </div>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">1. Information We Collect</h2>
        <p>Because TableView.dev operates client-side, we never view, intercept, or store the contents of your financial models. Like all standard websites, our hosting infrastructure (e.g. Cloudflare Pages) automatically logs basic network metadata such as IP addresses, browser user-agent strings, referring URLs, and timestamp requests for security and DDoS mitigation.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">2. Google AdSense & Third-Party Advertising Disclosures</h2>
        <p>To sustain free access to our advanced in-browser modeling tools without requiring paid subscriptions, TableView.dev partners with third-party advertising vendors, including Google AdSense.</p>
        <ul style="line-height: 1.9;">
          <li><strong>Third-party vendors, including Google, use cookies</strong> to serve advertisements based on a user's prior visits to TableView.dev or other websites on the Internet.</li>
          <li><strong>Google's use of advertising cookies</strong> enables it and its partners to serve targeted ads to users based on their navigation history across the web.</li>
          <li>Users can opt out of personalized advertising at any time by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color: #0284c7;">Google Ads Settings</a> or through the Network Advertising Initiative opt-out page at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style="color: #0284c7;">www.aboutads.info</a>.</li>
        </ul>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">3. Consent Mode v2 & Analytics</h2>
        <p>We implement Google Consent Mode v2. All advertising and analytics storage cookies default to "denied" until explicit consent is granted via our user cookie preferences. Users may revoke or modify consent at any time.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">4. GDPR & CCPA Compliance</h2>
        <p>Residents of the European Economic Area (EEA) and California enjoy statutory rights to data transparency, access, and deletion. Because TableView does not collect personal identity or financial dataset records, your rights are inherently safeguarded by our architectural design.</p>
      </article>
    `;
  }

  if (canonical === '/terms') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Terms of Service</h1>
          <p style="font-size: 0.85rem; color: #64748b;">Effective Date: September 2026 | TableView.dev</p>
        </header>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">1. Acceptance of Terms</h2>
        <p>By accessing or utilizing TableView.dev, including any financial modeling calculators, you agree to be bound by these Terms of Service.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">2. Permitted Use & Intellectual Property</h2>
        <p>TableView grants you a personal, worldwide, non-exclusive license to use our in-browser web application for personal, commercial, and enterprise evaluations. All underlying application code, brand assets, and original editorial content are the exclusive intellectual property of TableView.dev.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">3. Disclaimer of Warranties & Limitation of Liability</h2>
        <p>The services and calculations on TableView.dev are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Under no circumstances shall TableView.dev or its operators be liable for financial losses, missed closing deadlines, tax penalties, or data discrepancies arising from the use of our calculators or tools.</p>
      </article>
    `;
  }

  if (canonical === '/disclaimer') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Legal & Financial Disclaimer</h1>
          <p style="font-size: 0.85rem; color: #64748b;">TableView.dev Informational Disclosure</p>
        </header>

        <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 2rem; color: #854d0e;">
          <strong>Important Advisory:</strong> TableView.dev is not a bank, licensed mortgage lender, certified public accounting (CPA) firm, or registered investment advisor. None of our tools constitute financial, legal, or tax underwriting advice.
        </div>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">1. Informational & Educational Use Only</h2>
        <p>All financial calculators, debt-service coverage ratio (DSCR) simulations, commercial real estate balloon estimates, IRC §1031 tax deferral calculations, and wage models are provided strictly for educational and preliminary exploration. Real estate and debt underwriting involves complex loan covenants, property appraisals, title insurance, and lender fees that vary by institution.</p>

        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">2. No Fiduciary or Professional Relationship</h2>
        <p>Using our website does not create any fiduciary, agency, or advisory relationship. Always review transaction structures with licensed mortgage loan officers, certified CPAs, and qualified 1031 exchange intermediaries before executing agreements.</p>
      </article>
    `;
  }

  return '';
}



/** Render finance homepage semantic content */
function generateHomepageHtml(): string {
  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 3.5rem 1.5rem;">
      <header style="text-align: center; margin-bottom: 3.5rem;">
        <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 1rem;">100% In-Browser · WebAssembly Powered · Zero Server Uploads</span>
        <h1 style="font-size: 2.75rem; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 1rem;">The 100% Private In-Browser Financial &amp; Commercial Modeling Engine</h1>
        <p style="font-size: 1.2rem; color: #64748b; max-width: 820px; margin: 0 auto; line-height: 1.7;">Institutional-grade debt modeling, commercial real estate underwriting, IRC §1031 like-kind tax deferrals, and payroll analytics running 100% client-side in WebAssembly.</p>
      </header>

      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem; text-align: center;">Institutional Real Estate &amp; Debt Calculators</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;"><a href="/dscr-loan-calculator" style="color: #0f172a; text-decoration: none;">DSCR Loan Calculator</a></h3>
            <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Calculate Debt Service Coverage Ratio, Net Operating Income (NOI), and investor qualification tiers for commercial and residential rental portfolios.</p>
            <a href="/dscr-loan-calculator" style="font-size: 0.85rem; font-weight: 600; color: #0284c7; text-decoration: none;">Launch DSCR Model →</a>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;"><a href="/commercial-loan-calculator" style="color: #0f172a; text-decoration: none;">Commercial Loan &amp; Balloon</a></h3>
            <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Underwrite commercial property debt with 20-30 year amortization curves and 5-10 year balloon maturity lump sums.</p>
            <a href="/commercial-loan-calculator" style="font-size: 0.85rem; font-weight: 600; color: #0284c7; text-decoration: none;">Calculate Balloon →</a>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;"><a href="/section-1031-exchange-calculator" style="color: #0f172a; text-decoration: none;">IRC §1031 Tax Deferral</a></h3>
            <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Model like-kind exchange tax deferrals, cash boot, mortgage relief boot, and replacement property basis.</p>
            <a href="/section-1031-exchange-calculator" style="font-size: 0.85rem; font-weight: 600; color: #0284c7; text-decoration: none;">Model 1031 Exchange →</a>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;"><a href="/loan-comparison-calculator" style="color: #0f172a; text-decoration: none;">Loan Comparison &amp; APR</a></h3>
            <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Side-by-side debt structure comparison. Evaluate origination points, effective APR, and total interest over time.</p>
            <a href="/loan-comparison-calculator" style="font-size: 0.85rem; font-weight: 600; color: #0284c7; text-decoration: none;">Compare Loans →</a>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;"><a href="/mortgage-calculator" style="color: #0f172a; text-decoration: none;">Mortgage &amp; Amortization</a></h3>
            <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Fixed-rate mortgage calculator with PMI cancellation, property tax escrow, extra principal, and full amortization charts.</p>
            <a href="/mortgage-calculator" style="font-size: 0.85rem; font-weight: 600; color: #0284c7; text-decoration: none;">Run Mortgage Model →</a>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;"><a href="/hard-money-calculator" style="color: #0f172a; text-decoration: none;">Hard Money &amp; Fix-and-Flip</a></h3>
            <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Test the 70% Rule Maximum Allowable Offer (MAO), renovation draw schedules, and net profit margins.</p>
            <a href="/hard-money-calculator" style="font-size: 0.85rem; font-weight: 600; color: #0284c7; text-decoration: none;">Analyze Fix & Flip →</a>
          </div>
        </div>
      </section>

      <section style="margin-bottom: 4rem; background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.04)); border: 1px solid #c7d2fe; border-radius: 1.25rem; padding: 2.5rem;">
        <span style="background: #eef2ff; color: #4338ca; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 1rem; border: 1px solid #c7d2fe;">100% PRIVATE · ZERO UPLOADS</span>
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Deal Files Never Leave Your Browser</h2>
        <p style="color: #475569; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">Rent rolls, purchase contracts, and financing packages are among the most sensitive documents in commercial real estate. Every TableView calculator executes in local WebAssembly memory — no deal terms are transmitted, logged, or stored on any server.</p>
        <a href="/about" style="background: #4f46e5; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; text-decoration: none;">How Privacy Works →</a>
      </section>

      <section style="margin-bottom: 4rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 2.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Underwriting Guides &amp; Research</h2>
        <p style="color: #64748b; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">Master the math behind institutional lending with in-depth practitioner guides covering DSCR qualification, 1031 exchange deadlines, loan amortization, and commercial balloon risk.</p>
        <a href="/guides" style="background: #0f172a; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; text-decoration: none;">Browse All Guides →</a>
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
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <nav style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">
        <a href="/" style="color: #0284c7; text-decoration: none;">Home</a> / 
        <a href="/salary-to-hourly-calculator" style="color: #0284c7; text-decoration: none;">Salary Calculator</a> / 
        <span>$${salary.toLocaleString()} a Year to Hourly</span>
      </nav>

      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #eef2ff; color: #3730a3; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #c7d2fe;">2026 Wage Analysis</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">$${salary.toLocaleString()} a Year is How Much an Hour? ($${salaryPage.hourlyRate}/hr Full Breakdown)</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Earning $${salary.toLocaleString()} per year equates to <strong>$${salaryPage.hourlyRate} per hour</strong> based on a standard 40-hour workweek across 52 weeks (2,080 annual working hours). Explore full paycheck calculations, overtime rates, and budget allocations below.</p>
      </header>

      <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">1. Complete Paycheck Conversion Matrix</h2>
      <div style="overflow-x: auto; margin-bottom: 2rem;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
          <thead>
            <tr style="background: #f8fafc; border: 1px solid #e2e8f0;">
              <th style="padding: 0.75rem 1rem; text-align: left; color: #0f172a; border: 1px solid #e2e8f0;">Pay Frequency</th>
              <th style="padding: 0.75rem 1rem; text-align: left; color: #0f172a; border: 1px solid #e2e8f0;">Gross Pay Amount</th>
              <th style="padding: 0.75rem 1rem; text-align: left; color: #0f172a; border: 1px solid #e2e8f0;">Working Hours Assumed</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border: 1px solid #e2e8f0;"><td style="padding: 0.75rem 1rem; color: #334155;">Hourly Wage</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #059669;">$${salaryPage.hourlyRate}</td><td style="padding: 0.75rem 1rem; color: #64748b;">1 Hour</td></tr>
            <tr style="border: 1px solid #e2e8f0;"><td style="padding: 0.75rem 1rem; color: #334155;">Daily Pay</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #0f172a;">$${daily}</td><td style="padding: 0.75rem 1rem; color: #64748b;">8 Hours (Standard Workday)</td></tr>
            <tr style="border: 1px solid #e2e8f0;"><td style="padding: 0.75rem 1rem; color: #334155;">Weekly Paycheck</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #0f172a;">$${weekly}</td><td style="padding: 0.75rem 1rem; color: #64748b;">40 Hours per Week</td></tr>
            <tr style="border: 1px solid #e2e8f0;"><td style="padding: 0.75rem 1rem; color: #334155;">Bi-Weekly Paycheck</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #0f172a;">$${biweekly}</td><td style="padding: 0.75rem 1rem; color: #64748b;">80 Hours (26 Paychecks/yr)</td></tr>
            <tr style="border: 1px solid #e2e8f0;"><td style="padding: 0.75rem 1rem; color: #334155;">Monthly Paycheck</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #0f172a;">$${monthly}</td><td style="padding: 0.75rem 1rem; color: #64748b;">173.33 Hours (12 Months/yr)</td></tr>
            <tr style="border: 1px solid #e2e8f0;"><td style="padding: 0.75rem 1rem; color: #334155;">Annual Gross Salary</td><td style="padding: 0.75rem 1rem; font-weight: 700; color: #059669;">$${salary.toLocaleString()}</td><td style="padding: 0.75rem 1rem; color: #64748b;">2,080 Hours per Year</td></tr>
          </tbody>
        </table>
      </div>

      <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">2. FLSA Overtime Pay (1.5x Time-and-a-Half)</h2>
      <p>Under the federal Fair Labor Standards Act (FLSA), non-exempt employees must receive overtime pay for all hours worked exceeding 40 in a single workweek:</p>
      <ul>
        <li><strong>Base Overtime Hourly Rate:</strong> $${salaryPage.hourlyRate} × 1.5 = <strong>$${overtimeRate} per hour</strong>.</li>
        <li><strong>5 Hours of Weekly Overtime:</strong> Yields an extra $${(Number(overtimeRate) * 5).toFixed(2)} per week, or an additional <strong>+$${overtimeAnnual5hrs} per year</strong> in gross income.</li>
      </ul>

      <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">3. Recommended 50/30/20 Monthly Budget Allocation</h2>
      <p>Based on gross monthly earnings of $${monthly}, the standard 50/30/20 budget framework divides funds as follows:</p>
      <ul>
        <li><strong>Needs (50% — $${needs50}/mo):</strong> Essential living expenses including rent or mortgage, utilities, health insurance, transportation, and groceries.</li>
        <li><strong>Wants (30% — $${wants30}/mo):</strong> Discretionary spending including dining out, travel, entertainment, hobby gear, and streaming subscriptions.</li>
        <li><strong>Savings & Debt Payoff (20% — $${savings20}/mo):</strong> Wealth accumulation including emergency fund deposits, Roth IRA/401(k) retirement contributions, and accelerated student loan or credit card debt reduction.</li>
      </ul>

      <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">4. FICA Payroll Taxes & Take-Home Pay Context</h2>
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

/** Work out the metadata + structured data for one canonical route. */
/** Map one prerender target to its route-specific page model. */
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
        title: guide.metaTitle || `${guide.title} | TableView.dev`,
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
  const salaryPage = SALARY_BY_PATH.get(canonical);
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
      `${match}\n    <meta property="og:image" content="${SITE}/og-image.png" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="TableView.dev — private in-browser financial modeling" />`
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
