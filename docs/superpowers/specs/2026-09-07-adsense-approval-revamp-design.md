# Design Document: TableView.dev Google AdSense Approval Revamp

**Date**: 2026-09-07  
**Status**: Approved by User  
**Target Domain**: `https://tableview.dev/`  
**Goal**: Transform TableView.dev from a thin single-page utility into an authoritative, content-rich, fully compliant data engineering platform capable of passing Google AdSense site approval and ranking for long-tail search traffic.

---

## 1. Problem Statement & Background

### 1.1 The Challenge
`https://tableview.dev` is an in-browser Apache Parquet and CSV viewer powered by DuckDB-Wasm and SheetJS. While technologically advanced and fast, submitting it in its initial state to Google AdSense guarantees rejection due to:
1. **Thin Content / Low-Value Content**: Pure client-side single-page applications lack the sustained textual semantic depth that Googlebot and AdSense human reviewers look for.
2. **Missing Legal & Compliance Pages**: AdSense mandatory audit requirements include explicit Privacy Policy (disclosing cookies and third-party ad vendors), Terms of Service, About Us, and Contact Us pages.
3. **Missing Crawler & Indexing Infrastructure**: Lack of `sitemap.xml`, `robots.txt`, and canonical routing for multiple content pages.
4. **Site Accessibility**: The domain DNS must be properly connected on Cloudflare Pages before submitting.

### 1.2 Target Audience & Language
- Global data engineers, data analysts, Python/SQL developers, and data scientists inspecting Parquet/CSV files.
- All content, articles, and legal pages will be in professional **English** to match the `.dev` domain profile and maximize international ad eCPMs.

---

## 2. System Architecture & Routing

### 2.1 Lightweight Client-Side Routing
To maintain a fast static single-page application without unnecessary framework bloat or server dependencies, the application will use a clean Path/History-based client router with URL hash/pushState fallback:
- Supported routes:
  - `/` (or `#/`): Core TableView Web Workbench (DropZone, DuckDB SQL console, data grid, export).
  - `/guides` (or `#/guides`): Guides & Articles hub showcasing technical deep dives.
  - `/guides/:slug` (or `#/guides/:slug`): Individual guide reader with table of contents, syntax-highlighted code blocks, and structured article schemas.
  - `/about` (or `#/about`): Engineering architecture, privacy philosophy (zero-upload Wasm execution), and mission statement.
  - `/contact` (or `#/contact`): Contact channels, FAQ navigation, and bug report links.
  - `/privacy` (or `#/privacy`): GDPR/CCPA & Google AdSense compliant privacy policy.
  - `/terms` (or `#/terms`): Terms of service, open-source attribution (MIT), and liability disclaimers.

### 2.2 Global Layout & Navigation
- **Global Header**:
  - Logo (`TableView.dev`), Quick links to `Workbench`, `Guides`, `About`, `Contact`, and `GitHub`.
  - Mobile responsive hamburger menu.
- **Global Footer (4-Column Layout)**:
  - Column 1: **Product & Tools** (Parquet Viewer, SQL Query Console, Excel Converter, CSV Inspector).
  - Column 2: **Technical Guides** (Parquet Guide, DuckDB-Wasm Guide, Metadata Inspector, Excel Conversion, Benchmarks).
  - Column 3: **Company & Project** (About Us, Contact Support, Architecture, GitHub Repo).
  - Column 4: **Legal & Privacy** (Privacy Policy, Terms of Service, Cookie Preferences, Ads Transparency).
  - Bottom bar: Copyright, DuckDB-Wasm attribution, Apache Parquet trademark notice.

---

## 3. High-Value Technical Guides Library

To definitively solve the "Low-Value Content" policy violation, the project includes 6 in-depth, original technical articles (each 1,000+ words, formatted with Markdown, comparison tables, code blocks, and FAQ snippets):

1. **`what-is-apache-parquet`**:
   - *Title*: What is Apache Parquet? The Complete Guide to Columnar Storage
   - *Topics*: Row vs columnar storage, dictionary encoding, bit-packing, run-length encoding (RLE), statistics-driven predicate pushdown, and compression comparison (Snappy vs ZSTD vs Gzip).
2. **`convert-parquet-to-excel`**:
   - *Title*: How to Convert Parquet Files to Excel (.xlsx) for Free Without Python
   - *Topics*: The challenge of converting multi-gigabyte columnar files for business users, limitations of desktop spreadsheets, and step-by-step instructions using in-browser WebAssembly.
3. **`duckdb-wasm-in-browser-olap`**:
   - *Title*: DuckDB-Wasm: Running Analytical SQL Inside the Browser Tab
   - *Topics*: The mechanics of WebAssembly compilation, virtual memory file systems, vector execution engines, and running analytical queries without backend infrastructure.
4. **`inspect-parquet-metadata-and-schema`**:
   - *Title*: How to Inspect Parquet Metadata, Schema, and Row Groups
   - *Topics*: Understanding the Parquet File Footer, Thrift metadata structures, min/max statistics, dictionary pages, and inspecting schema definitions safely.
5. **`parquet-vs-csv-vs-json-benchmark`**:
   - *Title*: Parquet vs CSV vs JSON: Performance, Storage, and Cloud Cost Benchmark
   - *Topics*: Empirical benchmarks comparing disk footprint, AWS S3 query scan costs, network bandwidth transfer, and memory efficiency across large tabular datasets.
6. **`troubleshooting-corrupted-parquet-files`**:
   - *Title*: Troubleshooting Common Parquet File Errors and Corruption
   - *Topics*: Fixing "magic number not found" errors, snappy decompressor failures, schema mismatch between row groups, and partial multipart upload terminations.

---

## 4. Compliance & Legal Framework

### 4.1 Privacy Policy (`/privacy`)
- Explicit declaration of **100% Client-Side Processing**: No user data, uploaded Parquet rows, or SQL queries are ever transmitted to or logged on remote servers.
- **Google AdSense Mandatory Cookie Clause**: Discloses third-party vendor advertising, Google DART/DoubleClick cookies, personalized ad serving, and provides direct links to [Google Ad Settings](https://adssettings.google.com) and the Network Advertising Initiative (NAI) opt-out.
- GDPR and CCPA disclosures: Data subject rights, tracking disclosures, and contact details for data queries.

### 4.2 Terms of Service (`/terms`)
- Open-source software terms under the MIT License.
- Disclaimers on client-side compute availability and data integrity verification.
- User acceptable use policies and intellectual property rights.

### 4.3 About Us (`/about`)
- Comprehensive overview of why TableView was created: replacing heavy Jupyter notebooks and unsafe third-party upload services with safe, in-browser WebAssembly data inspection.
- Technology stack deep-dive (DuckDB-Wasm, SheetJS, Vite, Tailwind CSS).

### 4.4 Contact Us (`/contact`)
- Interactive feedback & support form.
- Direct contact email (`support@tableview.dev`).
- Links to GitHub issue tracking for open-source bug reports and feature requests.

---

## 5. SEO, Search Console & AdSense Infrastructure

1. **`public/robots.txt`**:
   - Grants full access to `Googlebot`, `Mediapartners-Google` (AdSense verification bot), and general crawlers.
   - Points directly to `https://tableview.dev/sitemap.xml`.
2. **`public/sitemap.xml`**:
   - Lists all application URLs (`/`, `/guides`, `/guides/*`, `/about`, `/contact`, `/privacy`, `/terms`) with appropriate `lastmod`, `changefreq`, and `priority` tags.
3. **`public/ads.txt`**:
   - Standard Authorized Digital Sellers record template (`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`) ready for quick replacement once Publisher ID is assigned.
4. **Structured Data (Schema.org)**:
   - Tool homepage: `WebApplication` / `SoftwareApplication`.
   - Guide pages: `TechArticle` / `Article` schema with author, publisher, and date published.
   - Breadcrumb schema on all subpages.
5. **AdSense Insertion Container (`AdSlot` Component)**:
   - Clean, non-intrusive container that supports standard Google responsive ad units (`ins.adsbygoogle`) with fallback styling during development and audit review.

---

## 6. Verification & Validation Plan
- **Build & TypeScript Check**: `bun run build` / `npm run build` must succeed without warnings.
- **Lint Check**: `bun run lint` (oxlint) must pass with zero errors.
- **Navigation Flow**: Seamless switching between Tool, Guides hub, individual Guides, and Legal pages without page reloads or broken state.
- **Responsive Review**: Verified on both desktop and mobile viewports.
