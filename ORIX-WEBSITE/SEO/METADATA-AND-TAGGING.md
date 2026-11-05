# ORIX metadata and tagging

## Metadata source

Use [page-metadata.json](page-metadata.json) as the initial route metadata inventory. It follows the proposed three-page structure and English draft. Confirm the final routes and language before implementation.

| Element | Implementation rule |
| --- | --- |
| Document title | Unique, descriptive and consistent with the visible page |
| Meta description | A concise page-specific explanation that accurately describes its content |
| Canonical link | One absolute production URL per canonical page, matching routing and sitemap |
| Language | Set the HTML language to the actual content language |
| Robots meta | Public production pages use the approved indexing policy, with preview rules handled per environment |
| Open Graph | Set page title, description, canonical URL, site name and appropriate type |
| Social image | Add an absolute image URL and meaningful image description after the approved file is published |
| Twitter/X card | Use a summary card initially, and the large-image variant when an appropriate approved image is available |
| Site verification | Add real owner-issued verification values only when needed for the selected verification method |

The inventory's `socialImage` values are null because the production assets and paths remain to be selected. Treat approved social imagery as a launch-review item. The current local JPG references require separate rights review before production use.

## Title and description writing

Start from the supplied drafts, then test wording and visible previews with the final content. Review the distinguishing words first, keep claims specific and make room for the product/platform identity. Character counts are editorial checks, while display depends on the search surface and device. Search engines can generate alternative titles and snippets. [Google title guidance](https://developers.google.com/search/docs/appearance/title-link), [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet)

## Semantic page tagging

- Give each page a clear primary heading and a logical section-heading hierarchy.
- Use navigation, main content and footer landmarks with descriptive link names.
- Use real links for destinations and buttons for interface actions.
- Retain the homepage section IDs from [Site structure](../SITE-STRUCTURE.md).
- Keep the product definition and feature descriptions in selectable text.
- Give informative screenshots useful alternative text and captions. Decorative layers can have empty image descriptions where their meaning is already conveyed.
- Provide captions and an accessible text explanation for product video.

## Keywords and editorial taxonomy

The [keyword map](KEYWORD-MAP.csv) assigns visitor intent and content destinations. Use phrases where they explain the topic naturally. Review observed query data before changing editorial priorities.

The [editorial tags](EDITORIAL-TAGS.csv) are internal content categories for documentation and maintenance. They can support visible navigation if the resulting category views have a genuine purpose and sufficient content. An editorial tag does not require a public archive page.

Google ignores the keywords meta tag. Keep the keyword inventory in the editorial workflow and use descriptive visible content. [Google's keywords-meta guidance](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag)

## URL and locale handling

Use the same origin and trailing-slash policy in links, canonical tags, social URLs, schema and sitemap. Section fragments belong to their parent page's canonical URL. Handle tracking/query variants consistently with the chosen site implementation.

The current content is an English draft. Add `hreflang` only when actual maintained language/region alternatives exist, with reciprocal valid destinations. Confirm website language scope independently of the application's English-only interface.

## Media and attribution

Use readable prepared product captures with concise filenames that describe the state. Add social-image dimensions when verified. Preserve provider artwork attribution and check that the screenshot represents the release described on the page. [Asset and capture plan](../ASSET-AND-CAPTURE-PLAN.md)
