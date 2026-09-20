# Cloudflare Pages Monorepo Deployment Guide

This guide describes how to configure your three sub-projects on Cloudflare Pages for **`Sphinm/tableview`**.

---

## Architecture Summary

| Cloudflare Pages Project | Monorepo Root Directory | Build Command | Output Directory | Domain / Subdomain |
|---|---|---|---|---|
| **`tableview`** *(Existing)* | `apps/finance` | `bun run build` | `dist` | `tableview.dev` & `www.tableview.dev` |
| **`tableview-tools`** *(New)* | `apps/tools` | `bun run build` | `dist` | `tools.tableview.dev` |
| **`tableview-compressor`** *(New)* | `apps/compressor` | `bun run build` | `dist` | `compress.tableview.dev` |

---

## 1. Project 1: Update Existing `tableview` (Flagship Finance)

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) ➡️ **Workers & Pages**.
2. Click on the existing **`tableview`** application in the list.
3. Click **Settings** in the top navigation bar.
4. On the left menu, select **Builds & deployments**.
5. Find **Build configuration** and click **Edit configuration**:
   * **Root directory (advanced)**: Change to `apps/finance`
   * **Build command**: `bun run build`
   * **Build output directory**: `dist`
6. Click **Save**.
7. Go to **Deployments**, click **Retry deployment** (or push a new commit to `main`) to deploy the updated `apps/finance`.

---

## 2. Project 2: Create `tableview-tools` (Data & Parquet Workbench)

1. Return to **Workers & Pages**.
2. Click the blue **Create application** button in the top right.
3. Select the **Pages** tab and click **Connect to Git**.
4. Select the repository **`Sphinm/tableview`** and click **Begin setup**.
5. Configure build settings:
   * **Project name**: `tableview-tools`
   * **Framework preset**: `None` (or `Vite`)
   * **Root directory**: `apps/tools`
   * **Build command**: `bun run build`
   * **Build output directory**: `dist`
6. Click **Save and Deploy**.
7. Once the first deployment finishes, go to the project's **Custom domains** tab.
8. Click **Set up a custom domain**, enter `tools.tableview.dev`, and click **Activate domain** (Cloudflare automatically sets up the CNAME).

---

## 3. Project 3: Create `tableview-compressor` (Media Compressor)

1. Return to **Workers & Pages**.
2. Click **Create application** ➡️ **Pages** ➡️ **Connect to Git**.
3. Select **`Sphinm/tableview`** again and click **Begin setup**.
4. Configure build settings:
   * **Project name**: `tableview-compressor`
   * **Framework preset**: `None` (or `Vite`)
   * **Root directory**: `apps/compressor`
   * **Build command**: `bun run build`
   * **Build output directory**: `dist`
5. Click **Save and Deploy**.
6. Once deployed, go to **Custom domains** tab, add `compress.tableview.dev`, and activate.

---

## Local Development Commands

To run individual sub-applications locally:

```bash
# Finance Underwriting Suite (port 8123)
bun run dev:finance

# Data Tools & Parquet Workbench (port 8124)
bun run dev:tools

# Media Compressor (port 8125)
bun run dev:compressor

# Build all applications
bun run build:all
```
