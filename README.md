# TableView.dev — In-Browser Parquet Viewer, SQL Workbench & FinOps Calculators

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![DuckDB Wasm](https://img.shields.io/badge/Engine-DuckDB--Wasm-yellow.svg)](https://duckdb.org/docs/api/wasm/overview)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange.svg)](https://pages.cloudflare.com)
[![Website](https://img.shields.io/badge/Website-tableview.dev-emerald.svg)](https://tableview.dev)

> **TableView.dev** is a modern, 100% private, client-side web workbench for inspecting, querying, and converting **Apache Parquet**, **CSV**, **TSV**, and **JSON** files directly in your browser. Powered by **DuckDB-Wasm**, it executes high-performance analytical SQL locally with zero server file uploads. Also includes institutional-grade real estate and cloud data FinOps calculators.

🌐 **Live Website**: [https://tableview.dev](https://tableview.dev)

---

## 🧰 Live Web Tools & Dedicated Calculators

All tools run 100% client-side in your browser. Your sensitive files, financial deal sheets, and database metrics never leave your computer.

| Tool / Calculator | Description | Live Link |
|---|---|---|
| **Online Parquet Viewer** | Drag-and-drop viewer for `.parquet` and `GeoParquet` with live SQL query console | [Open Viewer](https://tableview.dev/parquet-viewer) |
| **Parquet to Excel (.xlsx)** | Convert columnar Parquet datasets directly into formatted Microsoft Excel spreadsheets | [Convert to Excel](https://tableview.dev/parquet-to-excel) |
| **CSV to Parquet (ZSTD)** | Convert large CSV files into compressed columnar Apache Parquet with Snappy or ZSTD | [Convert to Parquet](https://tableview.dev/csv-to-parquet) |
| **Parquet to CSV** | Stream and extract Parquet records into plain text comma-separated values | [Convert to CSV](https://tableview.dev/parquet-to-csv) |
| **JSON to Parquet** | Convert nested JSON and JSON Lines (NDJSON) into strongly-typed Parquet | [Convert JSON](https://tableview.dev/json-to-parquet) |
| **Schema & Metadata Inspector** | Inspect Parquet Row Groups, statistics (Min/Max), dictionary encoding, and null rates | [Inspect Metadata](https://tableview.dev/parquet-schema-inspector) |
| **Parquet Storage & Query Savings** | Calculate exact AWS S3 storage cost cuts and Athena/BigQuery scan savings | [Estimate Cloud Savings](https://tableview.dev/parquet-storage-calculator) |
| **Snowflake Warehouse Cost Calculator** | Model virtual warehouse T-shirt sizing credits, autoscaling, and auto-suspend FinOps savings | [Snowflake Calculator](https://tableview.dev/snowflake-cost-calculator) |
| **DSCR Loan Calculator** | Non-QM rental property cash flow, PITIA debt coverage ratio, and amortization schedule | [DSCR Calculator](https://tableview.dev/dscr-loan-calculator) |
| **Hard Money & Fix-Flip Calculator** | Fix & flip bridge financing, points, holding interest, 70% rule MAO, and net flip profit | [Hard Money Calculator](https://tableview.dev/hard-money-calculator) |
| **Mortgage Payment Calculator** | Home loan P&I payment modeling, amortization schedules, and PMI payoff milestones | [Mortgage Calculator](https://tableview.dev/mortgage-calculator) |
| **Mortgage Refinance Calculator** | Monthly payment reduction, break-even timeline, and lifetime interest analysis | [Refinance Calculator](https://tableview.dev/refinance-calculator) |

---

## ✨ Core Capabilities

- **🔒 100% Confidential & Secure**: All data decoding and SQL execution happen locally on your device CPU via WebAssembly. Zero files or data rows are transmitted over the network. Works offline.
- **⚡ Blazing Fast Analytical Engine**: Powered by **DuckDB-Wasm** with columnar lazy-loading, column pruning, and zero-copy Arrow memory buffers.
- **📊 Native Spreadsheet Export**: Export analyzed tables or calculated financial deal sheets into Microsoft Excel `.xlsx` workbooks with 1 click.
- **💻 Interactive SQL Console**: Run full SQL queries (`SELECT`, `WHERE`, `GROUP BY`, `ORDER BY`, `WINDOW`, aggregates, subqueries) directly on your local datasets.
- **📱 Responsive Bento Grid UI**: Beautiful dark-mode interface built with Tailwind CSS v4 and Lucide icons.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (Dark Bento UI)
- **Analytical Engine**: `@duckdb/duckdb-wasm`
- **Spreadsheet Generation**: `xlsx` (SheetJS)
- **Icons**: `lucide-react`
- **Hosting**: Cloudflare Pages / Vercel (100% Static SPA)

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) installed.

```bash
# Clone the repository
git clone https://github.com/Sphinm/tableview.git
cd tableview

# Install dependencies
bun install
# or
npm install

# Start development server
bun dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build

```bash
bun run build
# or
npm run build
```

The production-ready static assets will be output to the `dist/` directory.

---

## ☁️ Deploy to Cloudflare Pages (with custom domain tableview.dev)

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages**.
2. Click **Create Application** -> **Pages** -> **Connect to Git**.
3. Select this repository: `Sphinm/tableview`.
4. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `bun run build` (or `npm run build`)
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.
6. Once deployed, go to **Custom Domains** tab in the Pages project, add `tableview.dev`, and Cloudflare will automatically route your domain with full SSL!

---

## 📄 License

MIT License © 2026 TableView.dev
