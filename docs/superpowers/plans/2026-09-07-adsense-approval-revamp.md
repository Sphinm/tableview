# TableView.dev AdSense Approval Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform TableView.dev into a content-rich, compliant, multi-page data engineering site with 6 comprehensive technical guides and complete legal pages to secure Google AdSense approval.

**Architecture:** Lightweight client-side router integrated into existing React 19 + Vite + Tailwind CSS v4 setup, featuring a global 4-column footer, updated header navigation, 4 mandatory compliance pages, and a dedicated Guides knowledge hub with 6 in-depth articles.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, DuckDB-Wasm, Vite 8.

## Global Constraints
- Pure English content throughout guides, legal, and navigation pages.
- Zero extra heavy dependencies (maintain fast Vite build and static deployability to Cloudflare Pages).
- 100% Client-Side Privacy Guarantee preserved and explicitly highlighted.
- Clean compilation under `oxlint` and TypeScript `tsc -b`.

---

### Task 1: Navigation & Routing Infrastructure

**Files:**
- Create: `src/lib/router.ts`
- Create: `src/components/Footer.tsx`
- Create: `src/components/AdSlot.tsx`
- Modify: `src/components/Header.tsx`

**Interfaces:**
- `useRouter()`: returns `{ currentPath, navigate(path: string), params: Record<string, string> }`
- `Footer`: global 4-column footer component with links to tools, guides, legal, and project pages.
- `AdSlot`: responsive container ready for AdSense `adsbygoogle` script with development placeholder.

- [ ] **Step 1: Create `src/lib/router.ts` with lightweight history/hash routing**
- [ ] **Step 2: Create `src/components/AdSlot.tsx` for AdSense placement**
- [ ] **Step 3: Create `src/components/Footer.tsx` with full 4-column compliance navigation**
- [ ] **Step 4: Update `src/components/Header.tsx` to support page navigation links & mobile menu**
- [ ] **Step 5: Verify syntax and lint with `bun run lint`**
- [ ] **Step 6: Commit changes: `feat: add router, global footer, ad slots, and navigation`**

---

### Task 2: Mandatory Legal & Compliance Pages

**Files:**
- Create: `src/pages/PrivacyPolicy.tsx`
- Create: `src/pages/TermsOfService.tsx`
- Create: `src/pages/About.tsx`
- Create: `src/pages/Contact.tsx`

**Interfaces:**
- Export `PrivacyPolicy`, `TermsOfService`, `About`, and `Contact` React functional components styled with Tailwind CSS dark theme matching TableView aesthetic.
- Include explicit Google AdSense cookies and third-party vendor disclosures in `PrivacyPolicy.tsx`.

- [ ] **Step 1: Create `src/pages/PrivacyPolicy.tsx` with GDPR/CCPA and Google AdSense clauses**
- [ ] **Step 2: Create `src/pages/TermsOfService.tsx` with MIT open-source terms and limitations**
- [ ] **Step 3: Create `src/pages/About.tsx` detailing the Wasm client-side privacy architecture**
- [ ] **Step 4: Create `src/pages/Contact.tsx` with support form and FAQ links**
- [ ] **Step 5: Test and lint pages with `bun run lint`**
- [ ] **Step 6: Commit changes: `feat: add mandatory AdSense legal and compliance pages`**

---

### Task 3: In-Depth Technical Guides Library

**Files:**
- Create: `src/data/guides.ts`
- Create: `src/pages/GuidesHub.tsx`
- Create: `src/pages/GuideDetail.tsx`

**Interfaces:**
- `GuideItem`: `{ id: string, slug: string, title: string, excerpt: string, readTime: string, category: string, date: string, author: string, content: string }`
- Export `guidesData` with 6 exhaustive, original technical articles (each 1,000+ words with code samples and comparison tables).
- `GuidesHub`: Card list with category filtering and search.
- `GuideDetail`: Complete long-form reader with table of contents, breadcrumbs, and AdSlot.

- [ ] **Step 1: Write `src/data/guides.ts` containing the 6 comprehensive Parquet & DuckDB articles**
- [ ] **Step 2: Create `src/pages/GuidesHub.tsx` for article discovery**
- [ ] **Step 3: Create `src/pages/GuideDetail.tsx` for readable, SEO-optimized article rendering**
- [ ] **Step 4: Verify type safety and linting with `bun run lint`**
- [ ] **Step 5: Commit changes: `feat: add technical guides knowledge hub and 6 deep-dive articles`**

---

### Task 4: App Integration & Router Assembly

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Switch view based on `useRouter().currentPath`:
  - `/` -> Workbench (DropZone/DataView) + SeoSection
  - `/guides` -> `GuidesHub`
  - `/guides/:slug` -> `GuideDetail`
  - `/about` -> `About`
  - `/contact` -> `Contact`
  - `/privacy` -> `PrivacyPolicy`
  - `/terms` -> `TermsOfService`
- Mount `Header` and `Footer` across all views with seamless page transition and scroll-to-top.

- [ ] **Step 1: Wire all views and routing in `src/App.tsx`**
- [ ] **Step 2: Ensure Workbench state remains functional when switching tabs**
- [ ] **Step 3: Test and lint with `bun run lint`**
- [ ] **Step 4: Commit changes: `feat: wire application router and pages in App.tsx`**

---

### Task 5: SEO, Crawler & AdSense Public Assets

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Create: `public/ads.txt`
- Modify: `index.html`

**Interfaces:**
- `robots.txt`: allow Googlebot, declare sitemap URL.
- `sitemap.xml`: list all 11+ routes with `priority` and `lastmod`.
- `ads.txt`: ready-to-use AdSense authorized digital seller record.

- [ ] **Step 1: Create `public/robots.txt`**
- [ ] **Step 2: Create `public/sitemap.xml`**
- [ ] **Step 3: Create `public/ads.txt`**
- [ ] **Step 4: Update `index.html` with enhanced meta tags**
- [ ] **Step 5: Commit changes: `feat: add robots.txt, sitemap.xml, ads.txt, and SEO headers`**

---

### Task 6: Build Verification & Quality Review

**Files:**
- Verification only

- [ ] **Step 1: Run `bun run lint` (oxlint) and fix any warnings**
- [ ] **Step 2: Run `bun run build` (`tsc -b && vite build`) and verify clean output**
- [ ] **Step 3: Test in local preview to verify routing, responsive layout, and DuckDB-Wasm core tool**
- [ ] **Step 4: Commit and finalize summary**
