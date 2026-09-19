# TableView Development Guide & Agent Instructions

## Overview

TableView is a high-performance in-browser analytical workbench and financial underwriting suite.
The repository is organized as a **Bun Monorepo** containing three independent applications:
- **`apps/finance`**: Institutional Real Estate & Lending Underwriting Suite (`tableview.dev`).
- **`apps/tools`**: In-Browser Parquet Viewer & DuckDB SQL Workbench (`tools.tableview.dev`).
- **`apps/compressor`**: 100% In-Browser Video & Image Compressor (`compress.tableview.dev`).
- **`packages/ui` & `packages/shared`**: Shared primitives and design system.

## Commands

```bash
# Install dependencies
bun install

# Run local development servers
bun run dev:finance     # port 5173
bun run dev:tools       # port 5174
bun run dev:compressor  # port 5175

# Build all applications
bun run build:all

# Linting
bun run lint
```

## Architecture Principles

- **Zero Bundle Bleed**: Heavy WebAssembly engines (`@ffmpeg/ffmpeg`, `@duckdb/duckdb-wasm`) are isolated strictly to their respective apps (`compressor` and `tools`). The flagship `finance` app must remain ultralight.
- **Client-Side Privacy**: All analytical, parsing, and compression tasks execute locally in-browser without sending user files to servers.

---

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues (`gh issue`). See [`docs/agents/issue-tracker.md`](file:///Users/min.su/Desktop/github/tableview/docs/agents/issue-tracker.md).

### Triage labels

Canonical 5 triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See [`docs/agents/triage-labels.md`](file:///Users/min.su/Desktop/github/tableview/docs/agents/triage-labels.md).

### Domain docs

Multi-context monorepo layout mapped via [`CONTEXT-MAP.md`](file:///Users/min.su/Desktop/github/tableview/CONTEXT-MAP.md). See [`docs/agents/domain.md`](file:///Users/min.su/Desktop/github/tableview/docs/agents/domain.md).
