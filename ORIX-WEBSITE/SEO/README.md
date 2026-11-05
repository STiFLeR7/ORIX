# ORIX search and AI discovery handoff

Prepared 2026-11-05 for the planned `https://orix.stifler.in` website. This extends the [website design handoff](../README.md). Content, metadata and crawler files are staged for implementation and launch review.

## Files and responsibilities

| File | Purpose |
| --- | --- |
| [SEO strategy](SEO-STRATEGY.md) | Search intent, entity identity, architecture and technical priorities |
| [GEO and AEO content](GEO-AEO-CONTENT.md) | Answer-focused content, source evidence and AI-discovery guidance |
| [Keyword map](KEYWORD-MAP.csv) | Candidate search phrases, intent, destinations and content requirements |
| [Metadata and tagging](METADATA-AND-TAGGING.md) | Titles, descriptions, canonical/social tags, headings and editorial taxonomy |
| [Page metadata](page-metadata.json) | Concrete metadata for the proposed three primary routes |
| [Editorial tags](EDITORIAL-TAGS.csv) | Controlled content categories with scope and usage |
| [Structured data](STRUCTURED-DATA.md) | Entity graph, schema integration and eligibility requirements |
| [Schema templates](templates/) | Page-specific JSON-LD to embed after visible-content verification |
| [Crawl and indexing](CRAWL-AND-INDEXING.md) | Robots, sitemaps, AI crawlers, preview handling and Cloudflare checks |
| [Measurement and launch](MEASUREMENT-AND-LAUNCH.md) | Verification, search/citation measurement and maintenance |
| [robots.txt](../public/robots.txt) | Proposed public-crawl policy and sitemap discovery |
| [sitemap.xml](../public/sitemap.xml) | Candidate canonical URLs for the proposed three-page site |
| [llms.txt](../public/llms.txt) | Concise optional Markdown index for agents |
| [llms-full.txt](../public/llms-full.txt) | Expanded public product reference with authoritative source links |

## Placement during implementation

The four files from `ORIX-WEBSITE/public/` are published at the production origin root. Page-specific schema is embedded in each HTML document, and `page-metadata.json` supplies build-time metadata. The handoff documents and creative-reference JPGs remain development material with separate publication/rights requirements.

The `/`, `/docs/` and `/privacy/` routes follow the site structure. The initial social image is the actual isolated-profile dashboard capture. The live route responses, image URL, sitemap, canonical tags and schema were checked in [production validation](../PRODUCTION-VALIDATION.md).

## Working policy choices

- The website's own robots file permits public crawling through the wildcard group. Cloudflare currently prepends zone-managed training-crawler restrictions and `ai-train=no`; the effective live response is documented in [production validation](../PRODUCTION-VALIDATION.md). Robots rules and content licensing remain separate matters.
- The deployed site uses English metadata and the three public routes.
- Keyword priorities are editorial hypotheses based on ORIX's features. Search volume, difficulty and observed performance have not been measured.

## Evidence and limits

Search and answer visibility depend on accessible, useful and accurate content. Google documents ordinary SEO practices for its AI features and does not require special AI files or markup. The llms files are optional discovery aids maintained under the llms.txt proposal. [Google AI-feature guidance](https://developers.google.com/search/docs/appearance/ai-features), [llms.txt proposal](https://llmstxt.org/)

This package prepares the assets and checks needed for development. Live crawling, indexing, rendered metadata, schema behavior, search traffic and AI citations require validation after the website is available.
