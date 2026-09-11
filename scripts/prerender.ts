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
 *   - a <noscript> summary of the visible H1 + FAQ content
 *
 * React still boots over the top of it, so behaviour is unchanged for users.
 *
 * Run: bun run scripts/prerender.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOOLS_CONFIG } from '../src/data/tools';
import { guidesData } from '../src/data/guides';
import { listPrerenderTargets, resolveRoutePath } from '../src/lib/resolveRoute';
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
  /** Route key the SPA will resolve this URL to (for debugging). */
  route: string;
  faqs: { q: string; a: string }[];
  h1?: string;
  intro?: string;
  jsonLd: Record<string, any>[];
}

/** TOOLS_CONFIG keyed by canonical path, for calculator + tool lookups. */
const TOOLS_BY_PATH = new Map(Object.values(TOOLS_CONFIG).map((cfg) => [cfg.path, cfg]));

/**
 * Guides carry a human-readable date for display. Structured data needs ISO
 * 8601, so derive it once here and fail the build if any guide is unparseable —
 * shipping an invalid date is worse than failing loudly.
 */
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

/**
 * Publisher identity, attached to every page.
 *
 * Google uses Organization markup to understand who publishes a site, which
 * matters for a YMYL-adjacent finance/data property where trust signals are
 * weighted heavily. `WebSite` establishes the site as an entity in its own
 * right.
 */
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

/** Work out the metadata + structured data for one canonical route. */
function resolvePage(url: string, canonical: string): ResolvedPage {
  const route = resolveRoutePath(url).path;

  // --- Homepage -------------------------------------------------------------
  if (canonical === '/') {
    return {
      ...HOME_META,
      route,
      faqs: [],
      jsonLd: [breadcrumb([{ name: 'Home', url: '/' }])],
    };
  }

  // --- Guides hub -----------------------------------------------------------
  if (canonical === '/guides') {
    return {
      ...GUIDES_HUB_META,
      route,
      faqs: [],
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
        jsonLd: [
          {
            // Both types: TechArticle is the accurate schema.org type, and the
            // bare Article is what Google's Article rich result documents.
            '@type': ['TechArticle', 'Article'],
            headline: guide.title,
            description: guide.excerpt,
            articleSection: guide.category,
            // Must be ISO 8601. The previous value was the display string
            // ("September 5, 2026"), which Google cannot parse — that silently
            // made every guide ineligible. toIsoDate throws loudly on failure
            // rather than letting an invalid date ship again.
            datePublished: guide.isoDate,
            dateModified: guide.isoDate,
            author: { '@type': 'Organization', name: guide.author, url: SITE },
            publisher: {
              '@type': 'Organization',
              name: 'TableView.dev',
              url: SITE,
              logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` },
            },
            // Required by Google for the Article rich result to render.
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
    // FAQs come from the registry the PAGE ITSELF renders, never from a
    // separate copy. Emitting FAQ copy a visitor cannot see would be cloaking;
    // a calculator that still inlines its own FAQ is simply not registered yet.
    const faqs = getCalculatorFaqs(calc.canonical);
    const label = calc.title.split('|')[0].trim();

    return {
      ...calc,
      route,
      faqs,
      h1: label,
      intro: calc.description,
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

  // --- Static / legal pages -------------------------------------------------
  const staticMeta = STATIC_PAGE_META[canonical];
  if (staticMeta) {
    return {
      ...staticMeta,
      route,
      faqs: [],
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

  // Should never happen — fail loudly rather than shipping a wrong <title>.
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

  // Social preview image. index.html declared twitter:card = summary_large_image
  // but shipped no og:image, so every share rendered a blank card.
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    (match) =>
      `${match}\n    <meta property="og:image" content="${SITE}/og-image.png" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="TableView.dev — private in-browser data workspace" />`
  );

  html = html.replace(
    /<meta property="twitter:url" content="[^"]*" \/>/,
    (match) => `${match}\n    <meta property="twitter:image" content="${SITE}/og-image.png" />`
  );

  // Static, crawlable summary. Mirrors content that is visible after hydration,
  // so this is progressive enhancement rather than cloaking.
  const faqHtml = page.faqs.length
    ? `<h2>Frequently asked questions</h2>${page.faqs
        .map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`)
        .join('')}`
    : '';

  const noscript = `<noscript>
      <div>
        ${page.h1 ? `<h1>${escapeHtml(page.h1)}</h1>` : ''}
        ${page.intro ? `<p>${escapeHtml(page.intro)}</p>` : ''}
        ${faqHtml}
      </div>
    </noscript>`;

  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);

  return html;
}

function writePage(outPath: string, html: string, written: Set<string>) {
  const normalised = path.normalize(outPath);
  if (written.has(normalised)) return;
  written.add(normalised);
  fs.mkdirSync(path.dirname(normalised), { recursive: true });
  fs.writeFileSync(normalised, html);
}

/** Priority hint per route family — purely a crawl-budget signal. */
function priorityFor(canonical: string): { priority: string; changefreq: string } {
  if (canonical === '/') return { priority: '1.0', changefreq: 'daily' };
  if (canonical.startsWith('/guides')) return { priority: '0.7', changefreq: 'monthly' };
  if (['/about', '/contact', '/privacy', '/terms', '/disclaimer'].includes(canonical)) {
    return { priority: '0.3', changefreq: 'yearly' };
  }
  if (canonical.endsWith('-calculator')) return { priority: '0.9', changefreq: 'monthly' };
  return { priority: '0.9', changefreq: 'weekly' };
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
  console.log(`[prerender] sitemap.xml regenerated with ${unique.length} canonical URLs`);
}

function main() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found — run `vite build` first.');
  }
  let template = fs.readFileSync(templatePath, 'utf8');

  // Preload the primary UI font. Vite hashes CSS-referenced assets, so the
  // filename is only known after the build — which is exactly why this happens
  // here rather than in index.html. Starting the font fetch during head parsing
  // takes it off the render-blocking chain and avoids a swap flash.
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

  // Aliases intentionally reuse their canonical page's title, so duplicate
  // detection compares canonical paths, not raw URLs.
  const titleByCanonical = new Map<string, string>();
  const duplicates: string[] = [];

  for (const { url, canonical } of targets) {
    const page = resolvePage(url, canonical);
    const html = renderHtml(template, page);

    // "/" is the template itself.
    if (url === '/') {
      writePage(templatePath, html, written);
    } else {
      // Emit both forms so Cloudflare Pages resolves the URL either way.
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

  // Regenerate the sitemap from the same canonical list the prerenderer used.
  // Previously it was hand-maintained and listed alias URLs (/sql-on-csv) whose
  // canonical pointed at a different page — a self-contradicting sitemap that
  // Search Console reports as "Duplicate, Google chose different canonical".
  writeSitemap(targets.map((t) => resolvePage(t.url, t.canonical).canonical));

  console.log(`[prerender] wrote ${written.size} files for ${targets.length} URLs`);
  if (duplicates.length) {
    console.warn(`[prerender] ${duplicates.length} duplicate <title> value(s):`);
    for (const d of duplicates) console.warn(`  - ${d}`);
  }
}

main();