# ORIX GEO and AEO content specification

## Definitions and intended result

GEO describes work to make ORIX discoverable and accurately represented in generative search answers. AEO describes making its content answer a visitor's question clearly enough to be understood and cited. The intended result is a correct product explanation and a useful source destination.

Google's AI search guidance carries forward SEO fundamentals and identifies indexing and snippet eligibility as prerequisites for supporting links. Its guidance says additional AI-specific files or special schema are unnecessary for its AI features. Treat the llms files as optional aids for systems that use them. [Google AI-feature guidance](https://developers.google.com/search/docs/appearance/ai-features)

## Public product fact set

| Fact | Preferred description | Authority |
| --- | --- | --- |
| Name | ORIX, paired with Windows desktop layer where useful | Project brand system and README |
| Purpose | A compact Windows desktop layer for supported AI session status and everyday tools | Visible product explanation and feature documentation |
| License/model | Free and open source under ISC | Repository LICENSE |
| Local tools | Notes, clipboard history, focus sessions and file tray | Product documentation and demonstrated release |
| AI integration scope | Explain Claude Code, Codex monitoring and the ChatGPT provider individually | Current feature/setup records |
| Optional services | Provider accounts, charges and policies apply separately | Privacy and connection documentation |
| Visibility behavior | Hiding the layer leaves enabled tools and integrations running | Product visibility contract |
| Release access | Follow the currently available source preview or verified binary release | GitHub releases and release checklist |

Use the same facts in visible HTML, metadata, structured data and agent-readable references. Refresh release-sensitive wording together. The supplied `llms-full.txt` is a compact authored product reference assembled from these public facts, with links to fuller documentation.

## Answer block format

Start with the direct answer, then explain the condition, setup step or limitation that matters. Use a descriptive heading and include the relevant source link. Product-specific examples and real interface states provide supporting evidence.

| Question | Draft direct answer | Detail to include nearby |
| --- | --- | --- |
| What is ORIX? | ORIX is a free, open-source desktop layer for Windows that brings supported AI session status and everyday tools into a compact interface. | Actual desktop/notch view and release destination |
| Is ORIX free? | ORIX is free and open source under ISC. Connected services apply their own accounts, charges and terms. | License and provider documentation |
| What happens when ORIX is hidden? | Its desktop layer is hidden while enabled tools and integrations continue running. | Visibility setting and exact behavior |
| How does clipboard history work? | Enabled capture keeps up to eight recent text entries in memory. Disable Clipboard in Modules and save to stop collection and clear ORIX's history. | Default-enabled behavior and distinction from the Windows clipboard |
| Can I inspect its source? | The ORIX repository publishes the source, license and contribution instructions. | Repository and release links |
| Is there a Windows download? | Follow the release information for the available source preview or Windows artifact. | Current artifact availability and signature status |

The longer FAQ copy remains in [Section content](../SECTION-CONTENT.md). Keep answers visible and accessible in HTML, including when disclosures are collapsed. Google retired FAQ rich results in 2026, so FAQ content is maintained for visitors and clear answers. [Google documentation updates](https://developers.google.com/search/updates#june-2026)

## Evidence that can earn useful references

- Prepared screenshots showing the actual feature being described.
- Task-specific installation/configuration/removal instructions.
- Release-specific compatibility and signing information.
- Accurate local-data and provider explanations.
- Documented changes with genuine review dates.
- Public source, maintained contribution information and issue resolution records.

Link relevant sections and sources through ordinary crawlable links. Reference user questions naturally and preserve enough surrounding detail for an answer to retain its meaning.

## Crawler and content delivery

Verify that relevant public HTML, text files and assets are reachable through both origin configuration and Cloudflare. Search crawling, user-directed retrieval and model-training access have separate meanings. The staged robots policy is a broad public-crawl draft, with training preferences awaiting review. [Crawler policy](CRAWL-AND-INDEXING.md)

Avoid promotional instructions directed at models. Publish descriptive product information and source links. A useful citation should follow from evidence, relevance and accessible content.

## Evaluation

Use a repeatable set of branded, feature and setup questions. Record the service, date, complete question, model/interface where available, cited URLs and factual accuracy. Separate observed citations from account-specific or manually prompted mentions. Track sample size and changes over time.

Google provides dedicated generative AI visibility reports alongside overall performance reporting. Bing's AI Performance tooling provides citation-related observations for supported experiences. Use each tool's actual reporting scope when interpreting results. [Google generative AI reports](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports), [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)
