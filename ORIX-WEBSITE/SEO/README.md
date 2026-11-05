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

Publish the four files from `ORIX-WEBSITE/public/` at the production origin root. Embed the page-specific schema templates in their matching HTML documents. Use `page-metadata.json` as the initial metadata source. The handoff documents and creative-reference JPGs are development material with separate publication/rights requirements.

The `/`, `/docs/` and `/privacy/` routes follow the proposed site structure. Validate their final paths and availability before publishing the sitemap, canonical tags or schema. Social images remain unset until approved production assets exist.

## Working policy choices

- The robots draft permits public crawling through the wildcard group. This also permits compliant training crawlers unless a more specific policy is later added. It grants crawl access through robots rules, while content licensing and use permissions remain separate matters.
- The owner has not selected a training-specific policy. Review that choice and Cloudflare's effective edge settings before deployment.
- English metadata and the proposed three routes follow the existing draft. Website language scope and final page architecture remain review items.
- Keyword priorities are editorial hypotheses based on ORIX's features. Search volume, difficulty and observed performance have not been measured.

## Evidence and limits

Search and answer visibility depend on accessible, useful and accurate content. Google documents ordinary SEO practices for its AI features and does not require special AI files or markup. The llms files are optional discovery aids maintained under the llms.txt proposal. [Google AI-feature guidance](https://developers.google.com/search/docs/appearance/ai-features), [llms.txt proposal](https://llmstxt.org/)

This package prepares the assets and checks needed for development. Live crawling, indexing, rendered metadata, schema behavior, search traffic and AI citations require validation after the website is available.
