# SEO & Feature Mapping — TableView.dev Monorepo

> Source of truth for how each deployable app maps its **features → canonical routes →
> meta/SEO schema → build-time prerender**. Covers domains, route inventories, the shared
> prerender pipeline, and the remaining split-cleanup items identified during re-platforming.

## 1. Topology

Every app is an independent Vite SPA prerendered to static HTML. Three sibling domains share
the `@tableview/*` packages and a single brand namespace:

| App | Package | Domain | Canonical home |
|---|---|---|---|
| Finance Underwriting Suite | `apps/finance` | `https://tableview.dev` | `/` |
| Data & Parquet Tools | `apps/tools` | `https://tools.tableview.dev` | `/` |
| Media Compressor | `apps/compressor` | `https://compress.tableview.dev` | `/` |

Each app owns its legal pages at its own origin (`/about`, `/contact`, `/privacy`,
`/terms`, `/disclaimer`). Canonicals are absolute per-origin, so the same guideline
content is not duplicated across domains.

## 2. Shared SEO pipeline

All three apps run the identical prerender contract (`scripts/prerender.ts` wired into
`"build": "tsc -b && vite build && bun run prerender"`). For every target the prerenderer:

1. resolves a canonical path + page model (title, description, article body, JSON-LD, FAQs);
2. rewrites `<title>`, description, canonical, Open Graph, Twitter, and the JSON-LD
   `@graph` of the Vite `dist/index.html`;
3. injects the semantic article into both `#root` and `<noscript>` (crawler-visible,
   replaced cleanly when React hydrates);
4. writes both `/path/index.html` and `/path.html` (Cloudflare Pages friendly);
5. regenerates `sitemap.xml` (also copied into `public/`) and copies `robots.txt`,
   `llms.txt`, `llms-full.txt`.

| App | Prerender script | Canonical URLs | Total URLs (incl. aliases) |
|---|---|---|---|
| finance | `apps/finance/scripts/prerender.ts` | ~100 (16 calculators + salary long-tail + 9 guides + static) | >200 |
| tools | `apps/tools/scripts/prerender.ts` | 45 | 110 |
| compressor | `apps/compressor/scripts/prerender.ts` | 14 | 39 |

## 3. Finance — `apps/finance` (tableview.dev)

**Features:** CRE & lending underwriting (DSCR, hard money, mortgage, refinance,
amortization, cash-out refinance, mortgage payoff, loan comparison, commercial loan,
balloon payment), 1031 exchange (2 calculators), salary/hourly payroll calculator with a
programmatic long-tail of salary tiers, finance-calculator hub, guides hub + 9 finance
guides, legal pages, and the Cloudflare Worker (auth + D1 + `/api/tools/is-it-down`).

**Route kinds → SEO schema:**

| Route kind | Example | JSON-LD | FAQ |
|---|---|---|---|
| Homepage | `/` | Organization + WebSite | — |
| Calculator | `/dscr-loan-calculator` | WebApplication + FAQPage | `calculatorFaqs` |
| Salary long-tail | `/salary/120000-a-year-is-how-much-an-hour` | WebApplication + FAQPage | generated |
| Guide | `/guides/dscr-loans-complete-investor-guide` | TechArticle + FAQPage | guide.faqs |
| Static/legal | `/privacy` | WebPage | — |

**9 finance guides:** dscr-loans-complete-investor-guide, how-to-calculate-dscr,
mortgage-refinance-break-even-guide, loan-amortization-math-explained,
commercial-real-estate-loan-types, commercial-balloon-mortgages-risks,
hard-money-loans-for-fix-and-flip, flsa-overtime-rules-and-exemptions,
section-1031-exchange-rules-timeline.

## 4. Data Tools — `apps/tools` (tools.tableview.dev)

**Features:** DuckDB-Wasm data workbench hub, Parquet/CSV/Excel/JSON/TSV/GeoParquet viewers,
the full CSV↔Excel↔Parquet↔JSON converter matrix, a DuckDB SQL workbench, Parquet schema
inspector, JSON/SQL formatters, Snowflake & Parquet-storage FinOps calculators, and a website
uptime checker.

**Canonical route inventory (45 URLs):**

| Group | Routes |
|---|---|
| Home / hub | `/`, `/data-tools` |
| Viewers (6) | `/csv-viewer`, `/excel-viewer`, `/parquet-viewer`, `/json-viewer`, `/tsv-viewer`, `/geoparquet-viewer` |
| Converters (13) | `/data-converter`, `/csv-to-excel`, `/csv-to-parquet`, `/csv-to-json`, `/excel-to-csv`, `/excel-to-parquet`, `/excel-to-json`, `/parquet-to-excel`, `/parquet-to-csv`, `/parquet-to-json`, `/json-to-parquet`, `/json-to-csv`, `/json-to-excel` |
| SQL / analysis (2) | `/sql-workbench`, `/parquet-schema-inspector` |
| FinOps / formatters (4) | `/snowflake-cost-calculator`, `/parquet-storage-calculator`, `/json-formatter`, `/sql-formatter` |
| Uptime (1) | `/is-it-down` |
| Guides (1 + 11) | `/guides` + 11 data/FinOps guides (below) |
| Legal (5) | `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer` |

**Route kinds → SEO schema:**

| Route kind | Example | JSON-LD | Content source |
|---|---|---|---|
| Data tool page | `/parquet-viewer` | WebApplication (+FAQPage) | `TOOLS_CONFIG` (`tools.ts`) |
| FinOps / formatter | `/snowflake-cost-calculator` | WebApplication (+FAQPage) | `CALCULATOR_META` + `calculatorFaqs` |
| Uptime | `/is-it-down` | WebApplication + FAQPage | prerender (edge-probe copy) |
| Guide | `/guides/what-is-apache-parquet` | TechArticle (+FAQPage) | `guides.ts` (data subset) |
| Static/legal | `/about` | WebPage | prerender |

**11 data/FinOps guides:** what-is-apache-parquet, convert-parquet-to-excel,
duckdb-wasm-in-browser-olap, inspect-parquet-metadata-and-schema,
parquet-vs-csv-vs-json-benchmark, troubleshooting-corrupted-parquet-files,
cloud-data-lake-storage-economics, duckdb-wasm-memory-and-performance,
apache-parquet-encodings-deep-dive, cloud-finops-snowflake-storage-optimization,
zero-server-data-processing-security.

## 5. Media Compressor — `apps/compressor` (compress.tableview.dev)

**Features:** client-side (WebAssembly FFmpeg / canvas) video + image compression; format
landing pages for MP4, Discord 25MB/50MB limits, PNG/JPG/WebP; media studio hub.

**Canonical route inventory (14 URLs):**

| Group | Routes |
|---|---|
| Home | `/` (renders the video compressor) |
| Hub | `/media-tools` |
| Video (3) | `/video-compressor`, `/compress-mp4`, `/compress-video-for-discord` |
| Image (4) | `/image-compressor`, `/compress-png`, `/compress-jpg`, `/compress-webp` |
| Legal (5) | `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer` |

Aliases (`/compress-video`, `/compress-image`, `/mp4-compressor`, `/png-compressor`,
etc.) emit files that canonicalize to the rows above.

**Route kinds → SEO schema:** video/image/format pages → `WebApplication` + `FAQPage`
(sourced from the per-format FAQ constants); hub & legal → `CollectionPage`/`WebPage`.

## 6. Canonical & alias resolution

`resolveRoute.ts` in each app holds `TOOL_ALIASES`, `CALCULATOR_ROUTES` (regex alias
families), `STATIC_ALIASES` (`privacy-policy → /privacy`, `terms-of-service → /terms`),
guide aliases, and the workbench/guide-hub patterns. The prerenderer emits **alias files**
with a canonical tag pointing at the primary route, and the runtime resolves to the same
destination — so crawlers and the SPA can never disagree.

## 7. Findings from re-platforming (remaining cleanup)

The tools/compressor split was previously **incomplete** — both apps shipped full monolith
copies of several data layers plus a byte-identical full-monolith resolveRoute.ts. This
round completed the data-layer prune and routing scope (items 1–2 below are now DONE;
3–5 remain as component/theme/infra follow-ups):

1. ~~Duplicated data modules~~ — **DONE.** apps/tools data now holds only data+FinOps scope:
   routeMeta.ts (4 calculators — snowflake-cost-calculator, parquet-storage-calculator,
   json-formatter, sql-formatter + 8 static pages), tools.ts (25 data/converter/sql/analysis/FinOps
   tools), guides.ts / guideSlugs.ts (11 data guides), calculatorFaqs.ts (4 FAQ sets), and
   adSlots.ts. salaryLongTail.ts and pmmsRates.ts are deleted from tools.
   apps/compressor data now holds only media scope: routeMeta.ts (9 media + 5 legal pages) and
   adSlots.ts; its tools.ts / guides.ts / guideSlugs.ts / calculatorFaqs.ts / salaryLongTail.ts /
   pmmsRates.ts are deleted.
2. ~~Over-broad resolveRoute~~ — **DONE.** Each app's resolveRoute.ts is scoped to its own
   routes (KNOWN_ROUTES, listPrerenderTargets, CALCULATOR_ROUTES, TOOL_ALIASES, category
   classification) and the routes.test.ts / router.test.ts suites now assert app-specific
   behavior. Tools keeps /tools/:toolSlug dispatch for data tools + FinOps + formatters + guides
   + legal; compressor keeps media + legal only.
3. ~~Finance-only components remain~~ — **DONE.** Dead code removed from tools/compressor this
   round (101 files: finance chrome Header/Footer/Sidebar/TopBar, financial widgets, printable
   reports, calculator-kit finance components, plus finance/data/salary calculator libs and the
   orphaned DataView/DropZone/JsonView/auth/urlState modules). A reachability pass confirmed no
   live file (App, prerender, or tests) imports any removed module.
4. **Unwired tool:** ai-article-polisher was removed from tools.ts / routeMeta this round (it had
   no page or App wiring). Re-add deliberately if/when it is built.
5. **Home/theme:** HOME_META is now app-appropriate (data vs media), but the light/dark theme
   mismatch remains (index.html body is dark while App calls applyTheme('light')), and the
   /api/tools/is-it-down Worker reachability from tools.tableview.dev is unconfirmed.

### Verified this round

- bun run build green for finance (42 canonical), tools (45 canonical), compressor (14 canonical).
- Full test suites green (finance 242, tools 148, compressor 79) with no failures.
- bun run lint: 0 errors.

### Remaining next steps (priority order)

1. Decide and apply a consistent light/dark theme per app.
2. Confirm /api/tools/is-it-down Worker reachability from tools.tableview.dev.
