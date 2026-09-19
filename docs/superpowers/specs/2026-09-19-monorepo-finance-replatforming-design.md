# Design Spec: TableView Monorepo Architecture & Finance Replatforming

- **Date**: 2026-09-19
- **Status**: Approved
- **Author**: Antigravity & User Pair

---

## 1. Background & Problem Statement

`tableview.dev` currently bundles three disparate product suites into a single monolithic Single Page Application (SPA):
1. **Real Estate & Lending Finance Calculators** (DSCR, Hard Money, Mortgage, Refinance, 1031 Exchange, Commercial Loan) — High commercial value and willingness-to-pay from loan officers, brokers, and real estate investors.
2. **Modern Data & Parquet Workbench** (Parquet viewer, DuckDB-Wasm SQL console, CSV/JSON/Excel converters, Snowflake & S3 cost estimators) — Developer and data engineer tools matching the `tableview.dev` brand.
3. **Client-side Media Utilities** (WebAssembly FFmpeg video compressor, browser canvas image compressor, AI text polisher) — Low commercial value, heavy bundle footprint (~30MB FFmpeg WASM), causing brand dilution.

Without AdSense advertising, maintaining generic media utilities on the flagship domain dilutes brand credibility, makes monetization ambiguous, and degrades performance.

---

## 2. Target Architecture

We split the codebase into a clean **Bun Monorepo** comprising three independent web applications and shared packages:

```text
tableview/
├── apps/
│   ├── finance/               # [Flagship Domain: tableview.dev] Real estate & lending underwriting
│   ├── tools/                 # [Subdomain: tools.tableview.dev] Parquet & data workbench
│   └── compressor/            # [Subdomain: compress.tableview.dev] Heavy media processing
├── packages/
│   ├── ui/                    # Shared UI primitives, Tailwind v4 design tokens, Lucide icons
│   └── shared/                # Shared utilities, date/currency formatters, SEO metadata helpers
├── package.json               # Root workspace manifest ("workspaces": ["apps/*", "packages/*"])
└── bun.lock
```

---

## 3. Sub-Project Scope & Route Mappings

### 3.1 `apps/finance` (Flagship: `tableview.dev`)
* **Target Audience**: Real Estate Investors, Loan Officers, Mortgage Brokers, Fix & Flippers.
* **Core Pages**:
  * `/` — Financial Deal Table & Underwriting Suite Hub (converted from `FinanceCalculatorHub.tsx`)
  * `/dscr-loan-calculator` — Non-QM Rental Cash Flow & Debt Service Coverage
  * `/hard-money-calculator` — Fix & Flip, 70% Rule MAO, Holding Costs & Draw Schedules
  * `/mortgage-calculator` — P&I Amortization, Extra Payments, PMI Payoff Milestones
  * `/refinance-calculator` — Rate & Term vs. Cash-out Break-even Analysis
  * `/section-1031-exchange-calculator` — Statutory 45-day / 180-day Replacement Property Modeler
  * `/commercial-real-estate-loan-calculator` — Multifamily & CRE Underwriting
  * `/loan-comparison-calculator` — Side-by-side Loan Scenario Matrix
  * `/salary-calculator` — Take-home Pay & Tax Modeling
* **Monetization & Pro Features**:
  * **White-label Institutional Lender Dossier**: Export clean, 5-8 page printable/PDF loan submission packages with user's custom brokerage logo, contact info, and watermark removal.
  * **Multi-Scenario Comparison & Cloud Drafts**: Save deal variations, stress-test interest rate shifts (+100/200 bps).

### 3.2 `apps/tools` (Subdomain: `tools.tableview.dev`)
* **Target Audience**: Data Engineers, Analytics Engineers, Backend Developers.
* **Core Pages**:
  * `/` & `/parquet-viewer` — In-browser DuckDB-Wasm Parquet viewer and SQL workbench
  * `/parquet-to-excel`, `/csv-to-parquet`, `/parquet-to-csv`, `/json-to-parquet`
  * `/parquet-schema-inspector` — Row groups, dictionary encoding, and null count analyzer
  * `/parquet-storage-calculator` — S3 scan and storage savings calculator
  * `/snowflake-cost-calculator` — Virtual warehouse credit optimizer
  * `/sql-formatter` — SQL prettifier
  * `/json-formatter` — JSON validator and formatter
  * `/website-status-checker` — Client-side connectivity inspector

### 3.3 `apps/compressor` (Subdomain: `compress.tableview.dev`)
* **Target Audience**: Users needing fast, private, 100% in-browser compression without server upload.
* **Core Pages**:
  * `/` & `/video-compressor` — FFmpeg WebAssembly local video compression (CRF, bitrate, scaling)
  * `/image-compressor` — WebP, JPEG, PNG client-side compression
* **Benefit**: Isolates heavy WebAssembly binaries (`@ffmpeg/ffmpeg`, `@ffmpeg/util`, COOP/COEP headers) so they do not impact `finance` or `tools`.

---

## 4. Shared Design System & Cross-Product Suite Navigation

* A sleek top-bar / footer switcher across all three sub-sites:
  ```html
  TableView Suite: [Finance Underwriting (Pro)] · [Data Tools] · [Compressor]
  ```
* Shared branding, colors, dark mode tokens, and UI components live in `packages/ui`.

---

## 5. Cloudflare Pages Deployment Setup

| Project Name | Root Directory | Build Command | Output Directory | Custom Domain |
|---|---|---|---|---|
| `tableview` (Existing) | `apps/finance` | `bun run build` | `dist` | `tableview.dev` + `www.tableview.dev` |
| `tableview-tools` (New) | `apps/tools` | `bun run build` | `dist` | `tools.tableview.dev` |
| `tableview-compressor` (New) | `apps/compressor` | `bun run build` | `dist` | `compress.tableview.dev` |

---

## 6. Implementation Stages

1. **Monorepo Scaffolding**: Setup root `package.json` workspaces (`apps/*`, `packages/*`).
2. **Shared Packages Extraction**: Extract reusable UI primitives (`packages/ui`) and shared libraries (`packages/shared`).
3. **App Migration**:
   - Create `apps/finance`, move all financial calculators, configure standalone Vite + Prerender.
   - Create `apps/tools`, move DuckDB, Parquet, and developer utilities.
   - Create `apps/compressor`, move video & image compressors with FFmpeg dependencies.
4. **Verification & Testing**: Ensure each app builds cleanly via `bun run build` and tests pass.
5. **Deployment Readiness**: Provide clear Cloudflare configuration instructions for the user.
