# ORIX structured data

## Intended graph

Use the JSON-LD fragments in [templates](templates/) after matching their facts to the visible pages. Their URLs follow the planned production origin and proposed route inventory.

| Entity | Stable identifier | Purpose |
| --- | --- | --- |
| Project publisher | `https://orix.stifler.in/#project` | Identify the open-source ORIX project |
| Website | `https://orix.stifler.in/#website` | Identify the public website |
| Desktop application | `https://orix.stifler.in/#software` | Identify the Windows product and its category |
| Source code | `https://orix.stifler.in/#source` | Identify the public source repository |
| Homepage | `https://orix.stifler.in/#webpage` | Connect the product and website on Home |
| Documentation | `https://orix.stifler.in/docs/#webpage` | Identify the documentation page |
| Privacy | `https://orix.stifler.in/privacy/#webpage` | Identify the privacy page |

The project uses an Organization node to describe the open-source project publisher. Legal-company details, addresses, personal identities and contact information require their own verified visible source before inclusion.

## Template integration

- Embed the relevant file in a `<script type="application/ld+json">` element on the matching page.
- Maintain stable IDs and matching facts wherever entities recur.
- Serialize generated JSON safely for an HTML script context. Escape less-than signs when source values can contain arbitrary text.
- Keep the structured description aligned with the product explanation available to visitors.
- Add a published logo/image URL only after the approved asset exists and is crawlable.
- Add release-dependent version, dates and exact download destinations through the reviewed release data when available.

The supplied fragments describe the app, website, source and pages. `SoftwareSourceCode.codeRepository` records the source URL. Software pricing is zero, consistent with ORIX's stated model. Compatibility is described as Windows, with exact release requirements left to reviewed release information.

## Eligibility and evidence

Google's software rich-result requirements include a rating or review as well as the required software/offer information. The supplied template carries no rating or review because genuine evidence has not been supplied. It is a descriptive graph whose Google rich-result eligibility remains incomplete. Any later rating/review needs genuine visible supporting content and the applicable review guidance. [Google software-app requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app)

FAQ answers remain useful visible content. Google's FAQ rich-result feature was retired in 2026. The initial graph therefore focuses on product and page identity. [Google documentation updates](https://developers.google.com/search/updates#june-2026)

VideoObject can be evaluated when a real public video, thumbnail, publication information and required metadata are available. SearchAction can be evaluated if the website gains an actual site-search facility. Use structured types for implemented, evidenced page content.

## Verification

Parse JSON during the build and validate vocabulary with Schema.org's validator. Use Google's Rich Results Test to evaluate supported feature eligibility separately. Then inspect the deployed rendered HTML and search-console reports. Valid syntax and a sound entity graph are separate checks from an engine choosing to show a rich result.

Review factual consistency, canonical URLs, visible pricing/license text, publisher naming, image destinations and release availability before publishing any schema change.
