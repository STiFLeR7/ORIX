# ORIX website design and development handoff

Updated 2026-11-05. Intended address `orix.stifler.in`. Hosting platform Cloudflare.

Design-reference image and archive-contact-sheet links resolve in the maintainer's local reference collection. The versioned handoff includes the website prototype, original ORIX review captures, browser checks and motion previews.

## Production website

[ORIX is live at orix.stifler.in](https://orix.stifler.in/). The deployable site in this folder uses Next.js, TypeScript, static export and Cloudflare Workers static assets. Its public routes are `/`, `/docs/` and `/privacy/`; `robots.txt`, `sitemap.xml`, `llms.txt` and `llms-full.txt` are served from the same origin. The standalone [index.html](index.html) remains a review reference and is excluded from the production bundle.

Run `npm ci`, `npm run typecheck` and `npm run build` from this folder to verify the source. `npm run deploy` builds and deploys with Wrangler using [wrangler.jsonc](wrangler.jsonc). The release URL, version, checksum, signing status and Windows requirement live in [lib/release.ts](lib/release.ts). Update that record and the release-facing text files together when a new installer is published.

The production page keeps the approved Aperture identity and Obsidian, Cloud and Ice palette. Continuous decoration has a compact icon-only pause control with an accessible name. `prefers-reduced-motion` stops animation and presents the settled examples. The production HTML includes the main content and download link before JavaScript runs; a no-JavaScript stylesheet keeps the layer and mobile navigation readable.

Shared links use a dedicated [ORIX social card](public/images/orix-social-card.png) at 1200 × 630, built from the approved logo and actual dashboard capture. The [artwork source](tools/social-card.html) can be rendered again when the brand or capture changes. Each page supplies its own Open Graph and Twitter title, description and canonical URL.

The [deployment and validation record](PRODUCTION-VALIDATION.md) contains the live checks and the effective Cloudflare crawler policy.

## Archived standalone prototype

Prototype 03 follows the [full inspiration archive review](ARCHIVE-REVIEW.md), covering 21 site studies and 25 captured recordings. It adds a compact scroll-led tool tour, self-building tool vignettes, finite story playback, visible provider signals and coordinated header/section surfaces. Obsidian, Cloud, Ice, Inter and the approved Aperture remain the visual system. The [first version](../docs/reviews/website/orix-website-v1.html) and [Prototype 02](../docs/reviews/website/orix-website-v2.html) are retained for comparison.

The visitor-facing prototype no longer displays “Motion on/off” or its internal prototype/version label. A compact icon-only control pauses continuous decoration and has an accessible pause/resume name. System reduced-motion preference also stops animation and disables that control. The migration plan is [here](../docs/superpowers/plans/2026-11-05-orix-nextjs-website.md).

Open [index.html](index.html) in a browser to review the single-file prototype. Its font, ORIX artwork, integration marks and actual isolated-profile Dark/Light dashboard captures are embedded. The opening layer transitions through collapsed, expanded and tool states. It supports replay, sample Notes/Focus/Clipboard/File tray interactions, a session-status demonstration, a prepared ChatGPT response and a silent Spotify visual preview. The gallery provides theme comparison, three detail views and a full-image dialog.

In the tools section, scroll through the short desktop stage or select a named chapter. Play tool story runs one four-chapter pass with pause and replay. Narrow or short viewports use normal flow with direct chapter buttons. Reduced motion removes the pin and timed playback, with immediately readable content. Provider sample actions light the path from your work through ORIX to the selected connection. These scenes use prepared illustrative data.

The standalone prototype uses `noindex, nofollow` for review. Layer and connection recreations carry Preview or Illustrative labels and prepared data. The gallery's detail views crop the actual Overview capture. The actual Light capture includes an unsaved-preferences bar. Production routes, crawler files, social metadata and deployment are implemented in the Next.js site.

The [45-assertion Prototype 03 browser check](../docs/reviews/website/orix-v3-check.js) covers the new scroll chapters, stable stage, keyboard selection, finite playback, pause/offscreen behavior, timed signals, stale-provider cancellation, adaptive header and responsive/reduced-motion fallbacks. The existing [interaction check](../docs/reviews/website/orix-v2-check.js) covers notch geometry, replay, timer, tool/provider actions, actual image replacement, gallery/dialog, terrain, mobile focus, five widths and JavaScript-disabled content. Review captures and results are under `output/playwright/`. Final visual approval and real-device performance remain review work.

The [Prototype 03 motion review clip](../docs/reviews/website/orix-v3-motion.webm) demonstrates the opening, scroll-led story, finite playback, provider signal, prepared response, silent Spotify visual, actual theme switch and flowing closing background. Release destinations follow the currently published unsigned beta.3 recorded in the application's release checklist.

The header Get ORIX link and both Download for Windows buttons link directly to the published `ORIX-Setup-0.1.0-beta.3.exe` asset on GitHub Releases. They work without JavaScript. The closing section retains the unsigned-beta label and a separate release-notes/checksums link. The installer URL and displayed version are pinned together and must be updated together for a new website release. The [download browser check](../docs/reviews/website/orix-download-check.js) verifies all three destinations, responsive layout, JavaScript-disabled links and an actual browser download event, cancelled after checking the suggested filename.

## Handoff documents

The [motion reference map](MOTION-REFERENCE-MAP.md) connects the supplied `D:/WEBSITE-INSPIRATIONS/` archive to the layer scrubber, chapter controls, hero handoff and visual treatments in the prototype.

| File | Responsibility |
| --- | --- |
| [Website discovery Q&A](WEBSITE-DISCOVERY-QA.md) | Original 23 questions, product context and discovery record |
| [Site structure](SITE-STRUCTURE.md) | Proposed pages, navigation, visitor journeys and design questions |
| [Creative direction](CREATIVE-DIRECTION.md) | All 11 visual references, their interpretation and application to ORIX |
| [Section content](SECTION-CONTENT.md) | Eight homepage sections, draft copy, actions, FAQ and supporting-page content |
| [Typography and visual system](TYPOGRAPHY-AND-VISUAL-SYSTEM.md) | Identity, colors, type, layout, surfaces and control states |
| [Animation and interaction](ANIMATION-AND-INTERACTION.md) | Product animation, micro interactions, scrolling, background flow and accessible behavior |
| [Asset and capture plan](ASSET-AND-CAPTURE-PLAN.md) | Actual dashboard/notch imagery, capture requirements, media handling and attribution |
| [Development requirements](DEVELOPMENT-REQUIREMENTS.md) | Implementation constraints, Cloudflare considerations and acceptance checks |
| [SEO, GEO and AEO handoff](SEO/README.md) | Search strategy, keywords/tags, metadata, structured data, crawler files, llms references and measurement |

## Confirmed direction

- ORIX is a fully free, open-source Windows desktop layer.
- The website will use the existing ORIX brand system, colors and supplied identity assets.
- The owner has accepted the images in `creative-direction/` as visual inspiration for composition, motion, interactions and background treatments.
- Actual ORIX dashboard and notch snippets are part of the content direction.
- The planned public address is `orix.stifler.in`, hosted through Cloudflare.

## Proposals and open decisions

| Item | Current position |
| --- | --- |
| Information architecture | Home, Documentation and Privacy are live; the home page contains the approved product story |
| Audience priority | Working assumption of Windows users with frequent AI/tool switching, awaiting owner prioritization |
| Copy language | English only |
| Visual presentation | Dark primary presentation using existing ORIX colors |
| Exact typography sizes, spacing and motion values | Designer-proposed starting values for prototype review |
| Illustration and animation selection | Candidate treatments documented per image, with final selection pending composition and performance review |
| Framework and Cloudflare service | Next.js static export deployed with Cloudflare Workers static assets |
| Public Windows downloads | Direct link to the published unsigned beta.3 installer |
| Public crawler policy | Cloudflare prepends zone-managed restrictions for training crawlers. Search and user-initiated fetchers tested below remain reachable; changing the zone-wide policy needs a separate review. |
| Search and AI visibility | Metadata, schema, sitemap and AI-readable files are live. Indexing, rankings and citations require post-launch observation. |

The original Q&A remains the discovery record. These companion files add the later owner direction and proposed development detail. Confirmed owner instructions take precedence over proposed defaults. Product behavior, compatibility and download claims follow the repository's current release and privacy records.

## Scope of this handoff

This package contains the production website, its archived prototype and its design and content specifications. Existing app brand documents retain authority over the identity and supplied logo artwork.

The [application brand system](../docs/design/orix-system/BRAND-SYSTEM.md), [interface design system](../docs/design/orix-system/DESIGN-SYSTEM.md) and [release checklist](../docs/RELEASE.md) provide the underlying product references.
