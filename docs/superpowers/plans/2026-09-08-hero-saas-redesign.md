# TableView.dev Modern SaaS Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate TableView.dev's homepage with a split-screen SaaS hero, an interactive live product shell, a developer comparison matrix, and Bento-style visual polish inspired by `tableview.com`.

**Architecture:** Replace the legacy standalone dropzone on the homepage with an integrated `HeroSection` combining value propositions, quick-start CTAs, and a live interactive `ProductShell` mockup. Add a `CompareSection` delivering high-authority developer comparisons.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, DuckDB-Wasm, Vite 8.

## Global Constraints
- Preserve 100% of existing DuckDB-Wasm file reading, sample generation, and SQL querying capabilities.
- Maintain clean compilation with `tsc -b` and 0 errors under `oxlint`.
- Ensure responsive adaptability across mobile, tablet, and widescreen desktop displays.
- Retain all SEO text density and legal page routes for AdSense compliance.

---

### Task 1: Interactive Product Shell Component

**Files:**
- Create: `src/components/ProductShell.tsx`

**Interfaces:**
- `ProductShellProps`: `{ onFileSelected: (file: File) => void; onTrySample: () => void; isLoading: boolean; loadingStatus: string; }`
- Features interactive tabs between "Table View" (stylized real columnar data preview) and "SQL Console" (syntax-highlighted DuckDB query).
- Supports drag-and-drop file detection with visual highlight state.

- [ ] **Step 1: Create `src/components/ProductShell.tsx`**
- [ ] **Step 2: Verify component with `bun run lint`**
- [ ] **Step 3: Commit: `feat: create interactive ProductShell mockup component`**

---

### Task 2: Modern Split-Screen Hero Section

**Files:**
- Create: `src/components/HeroSection.tsx`

**Interfaces:**
- `HeroSectionProps`: `{ onFileSelected: (file: File) => void; onTrySample: () => void; isLoading: boolean; loadingStatus: string; }`
- Left side: Value proposition, format tags, primary sample button, file picker button, and 3 stat counters.
- Right side: Mounts `ProductShell` with subtle background glow mesh.

- [ ] **Step 1: Create `src/components/HeroSection.tsx`**
- [ ] **Step 2: Verify component with `bun run lint`**
- [ ] **Step 3: Commit: `feat: create split-screen HeroSection with SaaS layout`**

---

### Task 3: Developer Tooling Comparison Matrix

**Files:**
- Create: `src/components/CompareSection.tsx`

**Interfaces:**
- `CompareSection`: Displays a four-way comparative table contrasting TableView.dev against Jupyter/Pandas, Desktop clients (DBeaver), and generic cloud converters across 5 critical dimensions.

- [ ] **Step 1: Create `src/components/CompareSection.tsx`**
- [ ] **Step 2: Verify component with `bun run lint`**
- [ ] **Step 3: Commit: `feat: add developer comparison matrix section`**

---

### Task 4: App Integration & Bento Polish

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/SeoSection.tsx`

**Interfaces:**
- When `currentTable` is null, render `HeroSection` and `CompareSection` followed by `SeoSection`.
- Ensure drag-and-drop listeners work seamlessly whether dropped on the hero or anywhere in the window.

- [ ] **Step 1: Refactor `src/components/SeoSection.tsx` to align with the new Bento aesthetic**
- [ ] **Step 2: Update `src/App.tsx` to render `HeroSection` and `CompareSection`**
- [ ] **Step 3: Verify build with `bun run build` and `bun run lint`**
- [ ] **Step 4: Commit: `feat: integrate modern hero and comparison matrix into App.tsx`**

---

### Task 5: Build Verification & Push

**Files:**
- Verification only

- [ ] **Step 1: Run `bun run lint` (0 errors)**
- [ ] **Step 2: Run `bun run build` (clean Vite build)**
- [ ] **Step 3: Push changes to GitHub and confirm deployment**
