# ORIX crawl and indexing requirements

## Staged public files

| Source file | Intended production URL | Expected response |
| --- | --- | --- |
| `public/robots.txt` | `https://orix.stifler.in/robots.txt` | HTTP 200 and UTF-8 plain text |
| `public/sitemap.xml` | `https://orix.stifler.in/sitemap.xml` | HTTP 200 and XML |
| `public/llms.txt` | `https://orix.stifler.in/llms.txt` | HTTP 200 and UTF-8 plain text containing Markdown |
| `public/llms-full.txt` | `https://orix.stifler.in/llms-full.txt` | HTTP 200 and UTF-8 plain text containing Markdown |

Paths in the first column are relative to `ORIX-WEBSITE/`. Publish these files at the intended origin root through the eventual site's asset pipeline. Confirm the final response bodies and content types after Cloudflare delivery.

## Robots policy

The supplied origin file has a single wildcard group that permits public crawling and declares the sitemap. It leaves public assets reachable so a crawler can understand the rendered site. The effective production response also includes Cloudflare zone-managed directives that disallow several training crawlers and declare `ai-train=no`; see [production validation](../PRODUCTION-VALIDATION.md). Changing this zone-wide policy could affect other `stifler.in` sites.

Robots rules communicate crawl preferences. Index removal uses the applicable indexing controls, and private material needs actual access control. Public source licensing and robots access are separate from content-use permissions. [Google robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

Keep any selected specific bot groups consistent with the general policy. Specific groups may replace the wildcard rules used by that bot, so review the whole effective response after changes. Use documented operators and supported directives for each service.

## Search, retrieval and training agents

| Operator | Search/discovery | User-requested access | Separate use control |
| --- | --- | --- | --- |
| Google | Googlebot for Search | Product-specific fetchers vary | Google-Extended governs specified Gemini training and grounding uses |
| Bing | Bingbot | Product-specific access varies | Review current Microsoft guidance for selected use controls |
| OpenAI | OAI-SearchBot | ChatGPT-User | GPTBot for model-training crawling |
| Anthropic | Claude-SearchBot | Claude-User | ClaudeBot for model-development crawling |
| Perplexity | PerplexityBot | Perplexity-User | Review current Perplexity crawler documentation |

OpenAI documents independent search and training controls, while its user-initiated fetches may fall outside robots rules. Anthropic documents distinct search, user and training agents. Perplexity documents its search and user-requested agents. Review each service's current behavior before applying restrictions. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots), [Anthropic crawler documentation](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

Google-Extended is a control token with specified training and Gemini-grounding effects. It does not govern Google Search inclusion or ranking. Account for both affected uses when evaluating a policy change. [Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)

## Cloudflare delivery checks

Inspect the effective robots response, AI Crawl Control policies, managed-bot policies and WAF/challenge behavior on the final hostname. A permissive origin file alone does not establish accessibility through the edge. Verify approved crawlers with the operator's documented identity/IP methods before assigning security exceptions.

Cloudflare's current Bot Preference Sync can prepend managed robots directives and a Content Signals Policy according to selected Search, Agent and Training policies. Confirm that the returned content expresses the owner's intended policy. Edge access restrictions and voluntary robots rules need separate checks. [Cloudflare managed robots documentation](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)

## Sitemap and canonical URLs

The staged sitemap lists the proposed Home, Documentation and Privacy URLs only. Publish entries when those pages exist, return HTTP 200, permit indexing and identify the same canonical URL. Keep fragments, redirected variants, errors and preview URLs out of the canonical page inventory.

Modification dates are omitted until the site build has an accurate content-change source. When added, use substantive actual modification dates. Maintain one consistent origin and slash policy across metadata, internal links, sitemap and schema. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## Preview environments and missing pages

Protect private previews through the selected access mechanism. For publicly accessible development previews, use an environment-specific `X-Robots-Tag: noindex` response and verify it separately from production. A crawler must be able to read an indexing directive for it to take effect. Authentication remains the appropriate boundary for private material.

Serve a useful missing-page view with an actual 404 status. Ensure broad application fallbacks do not turn unknown page URLs into successful indexable copies of Home. Production pages need a final check for accidental preview indexing headers or meta tags.

## llms files

The concise index follows the llms.txt proposal's H1, summary, context and Markdown file-list structure. It points to the expanded product reference and maintained public Markdown sources. Its optional section includes secondary human-facing destinations. `llms-full.txt` is the requested expanded-reference companion, maintained for systems that choose to consume it. [llms.txt proposal](https://llmstxt.org/)

Keep both files synchronized with the visible public product facts and reviewed release state. This package uses working size budgets of 4 KiB for the index and 12 KiB for the expanded reference. These are editorial maintenance targets. Generate the files from the maintained content source when a website pipeline is selected, or explicitly update them during content review.

## Prepublication verification

Check the final policy, bot access, status codes, content types, file encoding, sitemap destinations, canonical agreement, rendered indexing tags and actual llms links. Compare regular visitor responses and supported crawler responses for the same public content. Validate deployment configuration after every policy or routing change.
