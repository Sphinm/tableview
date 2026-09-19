# Implementation Plan: TableView Monorepo Architecture & Finance Replatforming

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the TableView repository from a monolithic multi-purpose tool into a clean Bun Monorepo with three focused sub-applications (`apps/finance`, `apps/tools`, and `apps/compressor`), establishing `apps/finance` as the flagship paid underwriting suite for `tableview.dev`.

**Architecture:** Bun Workspaces orchestrating three independent Vite applications sharing common tokens and UI primitives. Each app builds to its own `dist/` and deploys as a standalone Cloudflare Pages project with dedicated subdomain routing.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Bun Workspaces, Cloudflare Pages, DuckDB-Wasm, FFmpeg WASM, Lucide Icons.

---

## Global Constraints

- Platform: Bun runtime on macOS/Linux.
- Package manager: Bun (`bun.lock`, `bun install`, `bun run`).
- Strict typing: TypeScript `tsc -b` must pass across all workspaces.
- Cloudflare Pages compatibility: Each app must produce a self-contained `dist/` directory on `bun run build`.
- Zero bundle regression: Heavy WebAssembly libraries (`@ffmpeg/ffmpeg`, `@duckdb/duckdb-wasm`) must be isolated strictly to `apps/compressor` and `apps/tools` respectively, keeping `apps/finance` ultralight and sub-second FCP.

---

### Task 1: Root Bun Workspaces Scaffolding

**Files:**
- Modify: `package.json`
- Create: `apps/.gitkeep`, `packages/.gitkeep`

**Interfaces:**
- Produces: Root workspace configuration linking `apps/*` and `packages/*`.

- [ ] **Step 1: Configure root `package.json` for Bun workspaces**
- [ ] **Step 2: Verify root workspace resolution** (`bun install`)
- [ ] **Step 3: Commit**

---

### Task 2: Extract Shared Packages (`packages/shared` & `packages/ui`)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/ui/package.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/SuiteSwitcher.tsx`

**Interfaces:**
- Consumes: Core utilities and UI primitives from existing `src/lib/` and `src/components/`.
- Produces: `@tableview/shared` (router, formatters, theme, analytics) and `@tableview/ui` (SuiteSwitcher, Tooltip, Modal, Icons).

- [ ] **Step 1: Create `packages/shared/package.json` and export common utilities**
- [ ] **Step 2: Create `packages/ui/package.json` and `SuiteSwitcher.tsx`**
- [ ] **Step 3: Verify packages link and export cleanly** (`bun install`)
- [ ] **Step 4: Commit**

---

### Task 3: Build `apps/finance` (Flagship Underwriting Suite)

**Files:**
- Create: `apps/finance/package.json`
- Create: `apps/finance/vite.config.ts`
- Create: `apps/finance/index.html`
- Create: `apps/finance/src/App.tsx`
- Move/Adapt: Financial pages (Mortgage, Refinance, DSCR, Hard Money, 1031, Commercial, Comparison, Salary, Hub) into `apps/finance/src/pages/`
- Move/Adapt: Lender Dossier export and Pro branding modal into `apps/finance/src/components/`

**Interfaces:**
- Produces: Standalone `apps/finance` building to `apps/finance/dist` for `tableview.dev`.
- Free of any WebAssembly or FFmpeg dependencies.

- [ ] **Step 1: Create `apps/finance/package.json`**
- [ ] **Step 2: Assemble Financial App Entry (`apps/finance/src/App.tsx`)**
- [ ] **Step 3: Verify build of `apps/finance`** (`bun run build`)
- [ ] **Step 4: Commit**

---

### Task 4: Build `apps/tools` (Data & Parquet Workbench)

**Files:**
- Create: `apps/tools/package.json`
- Create: `apps/tools/vite.config.ts`
- Create: `apps/tools/index.html`
- Move/Adapt: Parquet viewer, DuckDB-Wasm SQL workbench, CSV/JSON/Excel converters, Schema inspector, S3/Snowflake calculators into `apps/tools/src/`

**Interfaces:**
- Produces: Standalone `apps/tools` building to `apps/tools/dist` for `tools.tableview.dev`.
- Isolates DuckDB-Wasm and SheetJS without bleeding into `apps/finance`.

- [ ] **Step 1: Create `apps/tools/package.json`**
- [ ] **Step 2: Assemble `apps/tools/src/App.tsx`**
- [ ] **Step 3: Verify build of `apps/tools`** (`bun run build`)
- [ ] **Step 4: Commit**

---

### Task 5: Build `apps/compressor` (Isolated Media Compressor)

**Files:**
- Create: `apps/compressor/package.json`
- Create: `apps/compressor/vite.config.ts`
- Create: `apps/compressor/index.html`
- Move/Adapt: `VideoCompressor.tsx`, `ImageCompressor.tsx`, `MediaToolsHub.tsx` into `apps/compressor/src/`

**Interfaces:**
- Produces: Standalone `apps/compressor` building to `apps/compressor/dist` for `compress.tableview.dev`.
- Encapsulates `@ffmpeg/ffmpeg` and COOP/COEP server headers solely to this app.

- [ ] **Step 1: Create `apps/compressor/package.json`**
- [ ] **Step 2: Verify build of `apps/compressor`** (`bun run build`)
- [ ] **Step 3: Commit**

---

### Task 6: Cloudflare Configuration & Deployment Guide

**Files:**
- Create: `docs/deployment-cloudflare-monorepo.md`

- [ ] **Step 1: Document Cloudflare Pages project setup for the 3 apps**
- [ ] **Step 2: Run root multi-build test** (`bun run build:all`)
- [ ] **Step 3: Commit & Final Verification**
