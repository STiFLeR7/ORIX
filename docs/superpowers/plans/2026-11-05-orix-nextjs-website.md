# ORIX Next.js Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task by task.

**Goal:** Ship the reviewed ORIX experience as an English Next.js and TypeScript website at `https://orix.stifler.in/`, with real product content, direct Windows download, public documentation and privacy routes, and the documented search files.

**Architecture:** Keep the website within `ORIX-WEBSITE` so the Electron app's root dependency tree and build stay independent. Use the Next.js App Router with static export because these three public pages and their prepared interactive demos need no server-side state. Deliver the `out/` folder through Cloudflare static assets and map the production hostname in Wrangler. Put current release facts in one TypeScript module and use them for visible copy, links and structured data.

**Tech Stack:** Next.js 16, React 19, TypeScript, native browser APIs, Cloudflare Wrangler. No additional animation library.

**Spec:** `ORIX-WEBSITE/DEVELOPMENT-REQUIREMENTS.md`, `SITE-STRUCTURE.md`, `SECTION-CONTENT.md`, `ANIMATION-AND-INTERACTION.md`, `TYPOGRAPHY-AND-VISUAL-SYSTEM.md`, `SEO/README.md`, the approved prototype and application release/privacy records.

**Execution:** The Next.js site was deployed on 2026-11-05. The build, browser, live-route and Cloudflare checks are recorded in [production validation](../../../ORIX-WEBSITE/PRODUCTION-VALIDATION.md). The checkboxes below retain the original work breakdown; the validation record is authoritative for completed checks and remaining observations.

## Global constraints

- Preserve Obsidian `#111318`, Cloud `#F4F5F7`, Ice `#A4C8FF`, Inter and the approved Aperture.
- The website is English. Use the verified beta.3 installer, version, checksum and unsigned status until a later release is reviewed.
- The main copy and navigation must render in HTML before client JavaScript. Demonstrations may be client enhanced and must state when data is illustrative.
- Honor `prefers-reduced-motion`. Use a compact icon-only pause/resume control for continuous decoration, with a descriptive accessible name. Do not display “Motion on/off” status text.
- Publish `/`, `/docs/`, `/privacy/`, `robots.txt`, `sitemap.xml`, `llms.txt` and `llms-full.txt` at the production origin.
- The local reference images in `creative-direction` are research material and stay outside the public bundle.
- Only the website package receives Next.js dependencies. No new runtime secrets or environment variables are required by the current static site.

## Review focus

1. A visitor without JavaScript must still reach the product explanation, release link, documentation and privacy information.
2. A visitor with reduced motion must see settled examples and be able to select each tool directly.
3. A release update must change the installer target, version, checksums and structured facts together.
4. `/docs/`, `/privacy/` and unknown paths must return the right content/status through Cloudflare, including direct navigation and refresh.
5. The live host must serve crawl files, canonical URLs and social metadata consistently over HTTPS.

---

### Task 1 — Website package and asset extraction

**Files:** `ORIX-WEBSITE/package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `app/layout.tsx`, `app/globals.css`, `public/` approved product assets.

- [ ] Extract the embedded project-owned SVG, font and dashboard assets from the standalone prototype into named public assets. Keep vendor artwork attribution and existing notices.
- [ ] Create an App Router static export with trailing-slash routes, TypeScript strict checks, an English document and a shared brand shell.
- [ ] Run `npm ci`, `npx tsc --noEmit` and `npm run build` inside `ORIX-WEBSITE`. Confirm generated HTML routes and compare the asset sizes with the current prototype.

### Task 2 — Full homepage migration

**Files:** `app/page.tsx`, `components/` for the existing sections and interactive demos, `lib/release.ts`, `app/globals.css`.

- [ ] Rebuild all eight sections using semantic React markup and original CSS composition. Preserve the notch, tool tour, integration samples, actual dashboard gallery, terrain, FAQ and responsive navigation.
- [ ] Move browser state into focused client components. Use one release record for all download buttons and release descriptions. Remove visible implementation labels such as the motion switch, while retaining honest illustrative-data labels within demos.
- [ ] Verify keyboard, touch, five widths, short desktop height, zoom/reflow, reduced motion, direct anchors, no-JavaScript content and the real browser download event. Correct deviations from the approved prototype.

### Task 3 — Useful documentation and privacy pages

**Files:** `app/docs/page.tsx`, `app/privacy/page.tsx`, shared navigation/footer components.

- [ ] Write installation, tools, integrations, appearance, shortcuts, update/removal and troubleshooting information from the current app README and release records.
- [ ] Explain website hosting behavior and the app's local data, external providers, retention and controls from `docs/PRIVACY.md`. Keep the beta.3 date and scope accurate.
- [ ] Check headings, source links, direct route loading and no-JavaScript readability.

### Task 4 — SEO, AEO and GEO delivery

**Files:** `app/layout.tsx`, route metadata, JSON-LD data, `public/robots.txt`, `public/llms.txt`, `public/llms-full.txt`, sitemap output and a reviewed social image.

- [ ] Adapt `SEO/page-metadata.json` to the final visible pages. Emit route-specific titles, descriptions, canonicals, Open Graph and Twitter data, one HTML language and an appropriate 404 page.
- [ ] Publish a valid schema graph for the project, website, software, source and three pages using verified release facts. Keep claims visible in HTML and avoid invented ratings or reviews.
- [ ] Align sitemap, robots, llms files and metadata to `https://orix.stifler.in/`. Review the staged crawler policy, link all answer blocks to useful sources and verify social image rights and size.
- [ ] Inspect the built HTML/XML/JSON and deployed HTTP content types and indexing headers.

### Task 5 — Cloudflare release and production checks

**Files:** `ORIX-WEBSITE/wrangler.jsonc`, website README, deployment evidence in `output/`.

- [ ] Verify the authenticated Cloudflare account and production hostname state. Configure the static `out/` directory, HTML routing, custom domain and appropriate cache/security headers.
- [ ] Deploy with Wrangler. Confirm DNS, HTTPS certificate, the three routes, 404 behavior, public assets and crawl files from outside the local build.
- [ ] Run the responsive/interactions browser check against production, inspect console and missing asset requests, and document the build/deploy/rollback commands. Fix critical issues before marking the goal complete.

## Completion audit

Every numbered goal requirement must have current evidence from source, build output and deployed runtime. The website goal stays active until the hostname, content, interactions and search surfaces pass production checks.
