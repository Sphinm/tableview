# TableView.dev — 100% Private In-Browser Tools (Bun workspaces monorepo)

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Runtime](https://img.shields.io/badge/Runtime-Bun-yellow.svg)](https://bun.sh)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange.svg)](https://workers.cloudflare.com)
[![Website](https://img.shields.io/badge/Website-tableview.dev-emerald.svg)](https://tableview.dev)

> **TableView.dev** is a monorepo of modern, 100% private, client-side web apps.
> The flagship is an institutional **commercial real estate & lending underwriting
> suite**; alongside it ship a **DuckDB-Wasm data workbench** (Parquet / CSV / JSON /
> SQL) and a **client-side media compression studio**. Everything runs locally in
> the browser via WebAssembly — zero files are uploaded to a server.

🌐 **Live Website**: [https://tableview.dev](https://tableview.dev)

---

## 🗂️ Repository structure

Bun workspaces (`apps/*`, `packages/*`) group three independent Vite apps that
share common code through the `@tableview/*` packages:

| Package | Purpose |
|---|---|
| `apps/finance` (`@tableview/finance`) | Flagship at [tableview.dev](https://tableview.dev): CRE debt & lending calculators, 1031 exchange, salary/payroll, plus a Cloudflare Worker (auth, D1, `/api/tools/is-it-down`). Includes the build-time prerenderer. |
| `apps/tools` (`@tableview/tools`) | DuckDB-Wasm data workbench: Parquet/CSV/Excel/JSON viewers & converters, SQL console, Snowflake/Parquet FinOps calculators, JSON/SQL formatters. |
| `apps/compressor` (`@tableview/compressor`) | Client-side media compression studio (video + image, WebAssembly FFmpeg / Web Codecs). |
| `packages/shared` (`@tableview/shared`) | Shared utilities across apps. |
| `packages/ui` (`@tableview/ui`) | Shared Tailwind components and design tokens. |

```
apps/
  finance/      # @tableview/finance   — flagship + Worker
  tools/        # @tableview/tools     — data workbench + FinOps
  compressor/   # @tableview/compressor — media compression
packages/
  shared/       # @tableview/shared
  ui/           # @tableview/ui
```

---

## 🧰 Live Web Tools & Dedicated Calculators

All tools run 100% client-side in your browser. Your sensitive files, financial
deal sheets, and database metrics never leave your computer.

**Commercial Real Estate & Lending (`apps/finance`)**

| Calculator | Description | Live Link |
|---|---|---|
| **DSCR Loan Calculator** | Non-QM rental property cash flow, PITIA debt coverage ratio, and amortization schedule | [DSCR Calculator](https://tableview.dev/dscr-loan-calculator) |
| **Hard Money & Fix-Flip Calculator** | Fix & flip bridge financing, points, holding interest, 70% rule MAO, and net flip profit | [Hard Money Calculator](https://tableview.dev/hard-money-calculator) |
| **Mortgage Payment Calculator** | Home loan P&I payment modeling, amortization schedules, and PMI payoff milestones | [Mortgage Calculator](https://tableview.dev/mortgage-calculator) |
| **Mortgage Refinance Calculator** | Monthly payment reduction, break-even timeline, and lifetime interest analysis | [Refinance Calculator](https://tableview.dev/refinance-calculator) |
| **1031 Exchange Calculator** | Realized gain, cash & mortgage boot, §1250 recapture, deferred tax, and the 45-day / 180-day deadlines | [1031 Calculator](https://tableview.dev/section-1031-exchange-calculator) |

**Data Workbench (`apps/tools`)**

| Tool | Description | Live Link |
|---|---|---|
| **Online Parquet Viewer** | Drag-and-drop viewer for `.parquet` and `GeoParquet` with a live SQL query console | [Open Viewer](https://tableview.dev/parquet-viewer) |
| **Parquet / CSV / JSON converters** | Convert between Parquet, CSV, Excel, and JSON with compression (Snappy / ZSTD) | [Data Workbench](https://tableview.dev/data-tools) |
| **Parquet Storage & Query Savings** | Estimate AWS S3 storage cuts and Athena/BigQuery scan savings | [Estimate Cloud Savings](https://tableview.dev/parquet-storage-calculator) |
| **Snowflake Warehouse Cost Calculator** | Model virtual warehouse T-shirt sizing, autoscaling, and auto-suspend FinOps savings | [Snowflake Calculator](https://tableview.dev/snowflake-cost-calculator) |

**Media Compression (`apps/compressor`)**

| Tool | Description | Live Link |
|---|---|---|
| **Video Compressor** | Compress MP4/MOV/WebM locally via WebAssembly FFmpeg | [Video Compressor](https://tableview.dev/video-compressor) |
| **Image Compressor** | Batch-optimize JPEG/PNG/WebP with interactive before/after preview | [Image Compressor](https://tableview.dev/image-compressor) |

---

## 🛠️ Tech Stack

- **Runtime / tooling**: [Bun](https://bun.sh) workspaces (Node ≥ 22)
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + `lucide-react`
- **Analytical engine**: `@duckdb/duckdb-wasm` (`apps/tools`)
- **Media compression**: `@ffmpeg/ffmpeg` + Web Codecs (`apps/compressor`)
- **Spreadsheet generation**: `xlsx` (lazily loaded)
- **Observability**: Sentry (`@sentry/react` + `@sentry/replay`)
- **Hosting**: Cloudflare Workers (static assets + D1), custom domain `tableview.dev`

---

## 🚀 Commands

```bash
bun install              # install all workspace dependencies

bun run build:finance    # type-check + vite build + prerender  (flagship)
bun run build:tools      # type-check + vite build
bun run build:compressor # type-check + vite build
bun run build:all        # build all three apps

bun run dev:finance      # Vite dev server (finance)
bun run dev:tools        # Vite dev server (tools)
bun run dev:compressor   # Vite dev server (compressor)

bun run test             # bun test across the workspace
bun run lint             # oxlint
```

Each command is a thin wrapper over `bun --filter <package> <script>`.

---

## 🏗️ Build pipeline

The flagship app (`apps/finance`) ships a **build-time prerenderer** so that
search-engine and social crawlers get correct, route-specific metadata instead of
the SPA's single homepage title:

1. **`tsc -b && vite build`** — type-check and bundle to `apps/finance/dist/`.
2. **`bun run prerender`** (`apps/finance/scripts/prerender.ts`) — writes a real
   static HTML file for every route (canonical pages *and* keyword aliases) with
   the correct `<title>`, description, canonical, Open Graph/Twitter tags and
   JSON-LD, plus a `<noscript>` summary. It also regenerates `dist/sitemap.xml`
   and `public/sitemap.xml` from the same canonical list, so the sitemap can
   never contradict a page's canonical tag.
3. Icons are pre-generated and committed; regenerate with **`bun run icons`**.

Finance-only scripts:

| Script | Purpose |
|---|---|
| `bun run dev` | Vite dev server (inside `apps/finance`) |
| `bun run prerender` | Regenerate per-route SEO HTML + `sitemap.xml` |
| `bun run icons` | Regenerate PNG PWA icons from the favicon geometry |
| `bun run adslots:check` | Print the ad placement map and flag unconfigured units |

> `apps/tools` and `apps/compressor` currently build with plain
> `tsc -b && vite build`; porting the prerenderer to them is tracked as a
> follow-up.

### Bundle strategy

The initial JavaScript payload is deliberately small, because Core Web Vitals
drive both ranking and ad viewability:

- The **DuckDB-Wasm engine** (`apps/tools`) is imported only when a file is
  actually opened.
- **SheetJS** (`~424 kB`) is imported only in the Excel read/write paths.
- **Sentry** (`~144 kB`) is fetched **only after an error occurs**; errors thrown
  before then are buffered in memory and replayed.

Anything that would pull one of these onto the critical path should be treated as
a regression.

---

## 💰 Advertising

All ad configuration lives in **`apps/finance/src/data/adSlots.ts`**. Nothing
else in the codebase knows a slot id.

### Going live

1. Create an ad unit in AdSense for each entry in `AD_UNITS`.
2. Paste its `data-ad-slot` value into `apps/finance/src/data/adSlots.ts`.
3. Run `bun run adslots:check` — it prints every placement and which units are
   still unconfigured.

**While a unit still holds the placeholder `0000000000`, `AdSlot` renders
nothing and issues no ad request.** Requesting an invalid slot spams the console
and counts as invalid traffic against the account, so this is deliberate; in
development a labelled dashed box shows where the unit will appear.

### `AdSlot` behaviour

- **Lazy request** — the ad is only requested once the slot scrolls within 250px
  of the viewport. Ads requested far below the fold are often never seen, and
  viewability feeds directly into RPM.
- **CLS-safe** — space is reserved before the ad arrives, so filling it cannot
  shift the layout.
- **Single push** — guarded by both a ref and AdSense's own
  `data-adsbygoogle-status`, because pushing twice for one `<ins>` throws. React
  19 StrictMode double-invokes effects in development, which makes this real.
- **Print-safe** — every slot carries `no-print`; the calculators all have
  print-to-PDF flows and AdSense forbids ads in printed output.

### Placement principles

Ads sit where commercial intent is highest and content is thickest: beneath a
calculator's results and mid-article in guides. Deliberately excluded:

- **Legal pages** (privacy, terms, disclaimer, about, contact) — thin content
  with negligible RPM and a policy risk. A test enforces this.
- **The data workspace** (`DataView`, `JsonView`) — never place ads next to a
  user's own data; those views are also `data-sentry-mask`ed.

---

## 📊 Analytics

**Google Analytics 4** (`G-JJBNH56W95`) and **Sentry session replay** are both
gated on analytics consent in `apps/finance/src/lib/consent.ts`.

This is **basic consent mode**, deliberately *not* the snippet the GA4 dashboard
hands out. That snippet loads `gtag.js` on every visit and relies on Consent
Mode's *advanced* mode to suppress cookies before consent — which still sends
cookieless pings to Google beforehand. Here, **no request reaches
`googletagmanager.com` until the visitor opts in**, which matches what the site
tells users about their data.

Trade-off: EEA visitors who decline produce no data at all, rather than Google's
modelled estimates. To switch to advanced mode, inline Google's standard snippet
in `apps/finance/index.html` and delete the `loadAnalytics()` call from
`consent.ts`.

The GA4 property is configured with `allow_google_signals: false` and
`allow_ad_personalization_signals: false`, so analytics consent never silently
doubles as advertising consent — those are governed separately by
`ad_storage` / `ad_personalization`.

---

## 🔐 Privacy & Compliance

TableView's core promise is that user files never leave the device. Several
guards exist to keep that true:

- **Sentry scrubbing** (`apps/finance/src/lib/sentry.ts`) — file names, table
  names, sheet names, SQL text and column names are redacted before any event is
  sent. `sendDefaultPii` is off.
- **Session-recording masking** — data and calculator views carry
  `data-sentry-mask`, and replay additionally sets `maskAllText`, `maskAllInputs`
  and `blockAllMedia`. Grid contents, the SQL console, JSON trees and every
  calculator field are excluded from recordings. Request and response bodies are
  never captured.
- **Replay never ships without consent** — the Sentry preload is gated, because
  `@sentry/react` re-exports `@sentry/replay` and loading the core would
  otherwise download the recorder. Verified against a cold browser profile:
  without consent the replay chunk is never requested; with consent, both chunks
  load. A test asserts the guard stays in place.
- **Replay is sampled** — `REPLAY_SESSION_SAMPLE_RATE` (currently `0.5`) in
  `apps/finance/src/lib/sentry.ts` controls how much of a consenting visitor's
  session is uploaded. `replaysOnErrorSampleRate` stays at `1.0` so an error is
  never missed because its session lost the sampling coin flip.

  **Quota check before raising this.** Sentry's free Developer plan includes
  **50 replays per month** (new accounts get 5,000/mo for three months). At 0.5
  that is roughly 100 recorded sessions/month before the quota is spent, after
  which Sentry silently stops accepting replays until the period resets. Watch
  the Replays usage graph in Sentry after deploying.
- **Consent Mode v2** — `index.html` declares a *denied* default before the
  AdSense tag loads; `src/lib/consent.ts` upgrades it only after an explicit
  choice. Nothing third-party loads before then, and consent can be withdrawn
  from the footer's 'Cookie Settings' link.
- **Self-hosted fonts** — Inter and JetBrains Mono are served from our own origin
  rather than Google's CDN. This drops two third-party connections from the
  critical path and avoids sending every visitor's IP to Google, which a German
  court has held breaches the GDPR.

---

## ☁️ Deploy to Cloudflare Workers (custom domain `tableview.dev`)

The flagship (`apps/finance`) deploys as a **Cloudflare Worker with static
assets** — see `apps/finance/wrangler.jsonc`:

1. Build the app: `bun run build:finance` (outputs `apps/finance/dist/`).
2. Deploy the worker + assets: `cd apps/finance && bunx wrangler deploy`
3. The worker serves `./dist` with single-page-application fallback, exposes the
   `/api/*` routes (including `/api/tools/is-it-down`), and binds two D1
   databases (`tableview_db`, `tableview_logs`).

`public/_headers` sets `immutable` caching on `/assets/*`, keeps `/sw.js`
uncached, and adds baseline security headers.

---

## 📄 License

MIT License © 2026 TableView.dev
