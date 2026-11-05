# ORIX website production validation

Checked 2026-11-05. Production origin: <https://orix.stifler.in/>. Cloudflare Worker: `orix-website`; deployed version `30bbdd03-a110-462f-9c1f-ee5c15c784e5`.

## Build and release

- `npm run typecheck` and `npm run build` passed with Next.js 16.4.5 and TypeScript 5.9.3. The build exports `/`, `/docs/`, `/privacy/` and a 404 page.
- Wrangler's dry run and local routing check passed. `npm run deploy` uploaded the static assets and attached the custom domain.
- All three homepage installer actions point to the published `ORIX-Setup-0.1.0-beta.3.exe`. A browser download began with that filename and was cancelled after the filename check. The release remains unsigned; its URL, version and SHA-256 are in [lib/release.ts](lib/release.ts).

## Browser checks

- The 45-check scroll, motion, keyboard, connection and viewport run passed against the exported site at 320, 390, 768, 1024 and 1440 pixels.
- The broader notch, timer, gallery, theme, integration, reduced-motion and no-JavaScript run passed. A missing no-JavaScript fallback stylesheet was found and restored before deployment.
- The icon-only pause control stops continuous animation. System reduced motion disables that control and leaves settled content readable. The production browser console had zero errors or warnings during the checked flow.
- Direct download links remain available without JavaScript. The mobile hero download remained visible without horizontal overflow.

## Live origin checks

- DNS resolves to Cloudflare. HTTPS returned 200 with certificate verification success for `/`, `/docs/` and `/privacy/`.
- Each route has one H1, an absolute production canonical, indexable robots metadata, Open Graph image and valid JSON-LD. `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, the interaction script and no-JavaScript stylesheet returned 200. The sitemap lists three page URLs.
- An unknown URL returned a real 404. The live homepage loaded its dashboard image, and the pause control worked at a 390-pixel browser viewport with no horizontal overflow.

## Effective crawler policy and follow-up

Cloudflare currently prepends **zone-managed** directives to the website's `robots.txt`. They allow search indexing but declare `ai-train=no` and disallow several training crawlers, including `ClaudeBot` and `GPTBot`. The website's own `User-agent: * / Allow: /` rules appear after this block. Cloudflare also returned 403 to `Python-urllib/3.12` and `ClaudeBot` user-agent probes. User-agent probes for `Googlebot`, `bingbot`, `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User` and `PerplexityBot` returned 200. These probes do not prove how the real crawler IPs are treated.

[Cloudflare's managed robots setting](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/) is applied at the zone level. Changing it could affect other `stifler.in` sites, so this deployment leaves that existing policy in place. Search Console/Bing ownership, indexing, AI citations, real mobile hardware and screen-reader behavior still need observation or device testing after launch.
