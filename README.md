# TableView.dev — Fast, Private In-Browser Parquet Viewer & Converter

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![DuckDB Wasm](https://img.shields.io/badge/Engine-DuckDB--Wasm-yellow.svg)](https://duckdb.org/docs/api/wasm/overview)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange.svg)](https://pages.cloudflare.com)

**TableView.dev** is a modern, lightweight, 100% client-side web workbench for opening, inspecting, querying, and converting **Apache Parquet**, **CSV**, **TSV**, and **JSON** files directly in your browser.

🌐 **Live URL**: [https://tableview.dev](https://tableview.dev)

---

## ✨ Features

- **🔒 100% Local & Confidential**: All data decoding and SQL execution happen locally on your device CPU via WebAssembly. Zero files or rows are uploaded to any server. Works offline.
- **📊 Native Excel (.xlsx) & CSV Export**: Convert complex columnar data directly into formatted Microsoft Excel workbooks with accurate column types.
- **⚡ High Performance**: Powered by **DuckDB-Wasm** with columnar lazy-loading, column pruning, and pagination.
- **💻 Interactive SQL Console**: Run arbitrary DuckDB SQL queries (`SELECT`, `WHERE`, `GROUP BY`, `ORDER BY`, aggregates) over local datasets.
- **✨ 1-Click Sample Dataset**: Built-in 1,000-row e-commerce sample generator to test features with zero file prep.

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
