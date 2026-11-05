# ORIX website development requirements

Status on 2026-11-05. This document translates the owner's direction and the proposed handoff into development considerations and acceptance checks. Framework, final page scope and deployment service remain open choices.

## Confirmed platform and project constraints

- Intended public hostname `orix.stifler.in`.
- Hosting through Cloudflare.
- Existing ORIX brand colors, supplied identity and actual product behavior govern the presentation.
- Actual dashboard and notch captures support the product explanation.
- The reference images guide composition and motion ideas, with separate review of production asset rights.
- Project credentials use the vault MCP. Keep secret values outside source files and public bundles.

Implement the [proposed structure](SITE-STRUCTURE.md) only after its route and section scope are settled. Keep site implementation scoped within the website project and coordinate any shared package or build changes with the desktop-app work.

## Architecture considerations

Essential product copy, navigation, documentation and release links should be delivered as usable HTML. Enhance the demonstration and selected visual effects with JavaScript. Maintain useful navigation, product explanation and release access if an optional enhancement fails.

Choose a framework after reviewing the agreed route count, documentation needs, asset handling and interaction complexity. Use existing project assets and standard platform capabilities where they meet the requirements. A content-focused initial site can use static delivery.

Cloudflare documents static HTML delivery through Pages and static-asset delivery through Workers. Select the service and its custom-domain/build configuration during deployment planning. Record the source directory, output directory, build command, runtime requirements, preview workflow and rollback method for the chosen approach. [Cloudflare Pages static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/)

## Content and release data

Use the draft in [Section content](SECTION-CONTENT.md) as the copy source for design review. Keep release-dependent content in one maintainable source during implementation. Required fields include release name/version, date, availability state, release URL, exact artifact links, Windows requirements, architectures, checksums and signature status.

Resolve artifact destinations from reviewed published release information. Support the source-preview, available-binary and unavailable-information states described in the content file. Product feature claims follow the presented build and [release records](../RELEASE.md).

The privacy page needs accurate website processing information alongside the existing [application disclosures](../docs/PRIVACY.md). Any later forms, analytics, accounts or donation features need their own scope and content review when selected.

## Interaction requirements

- Implement named actions and the correct button, link, disclosure or tab semantics.
- Provide pointer, keyboard and touch operation for every interactive preview.
- Keep controls in stable positions and preserve focus during visual updates.
- Support direct anchor navigation and visible destination headings.
- Give interactive recreations a visible Preview label and prepared sample data.
- Apply the [motion requirements](ANIMATION-AND-INTERACTION.md), including reduced motion, effects controls and media playback controls.
- Show a readable fallback when an optional media or demonstration asset fails to load.

## Responsive and accessibility requirements

Target WCAG 2.2 AA for the implemented website and adopt the additional reduced-motion behavior documented in this handoff. Verify text/control contrast against actual surfaces, including all animated background states.

Check navigation, focus order, visible focus, control names, headings, landmarks, image descriptions, FAQ expansion, video controls and error feedback. Validate text zoom, narrow screens, forced colors and the full keyboard path. Use the proposed 44 CSS-pixel control target and confirm the final layout in practice.

The proposed layout review widths are 320, 390, 768, 1024 and 1440 CSS pixels. Include a short desktop viewport and browser zoom at 200% and 400%. Controls and essential content must remain reachable as the layout reflows.

## Proposed performance budgets

These are working design targets to evaluate after the framework and media selection.

| Area | Proposed target |
| --- | --- |
| Initial route JavaScript | Up to 100 KiB compressed, with optional effects loaded separately |
| Initial route CSS | Up to 60 KiB compressed |
| Initial hero image | Aim for up to 400 KiB while retaining readable product detail |
| Initial font delivery | Aim for up to 150 KiB of required subsets |
| Video | Poster on initial load and deliberate media loading/playback |
| Optional heavy effects | Defer until useful, provide a static alternative and pause outside view |

Prioritize legible captures and usable content when evaluating these budgets. Reserve image/video dimensions, load later section media as needed and measure real page behavior on a mobile device and constrained connection. Performance claims require measurements from the implementation.

## Metadata and content maintenance

Provide descriptive page titles, descriptions, canonical URLs, social previews, a sitemap, appropriate crawler directives and a useful missing-page state. Validate metadata against the actual production origin. Link maintenance, release updates and privacy updates need named project ownership before launch.

The [SEO, GEO and AEO handoff](SEO/README.md) supplies draft page metadata, keyword and editorial-tag maps, JSON-LD templates, robots/sitemap files and optional llms references. Map the files in `public/` to their production root URLs through the selected build. Review crawler/training policy and the effective Cloudflare response before deployment. Keep release facts synchronized across visible content, metadata, schema and agent-readable references.

## Acceptance checklist

- [ ] Confirm route scope, section order, copy language and visitor priority.
- [ ] Review desktop and mobile compositions with the actual copy and product captures.
- [ ] Complete capture provenance, privacy and production asset-rights review.
- [ ] Verify all navigation, anchors, documentation and external release links.
- [ ] Verify source-preview, binary-release and unavailable-information behavior.
- [ ] Complete keyboard, touch, focus, zoom, screen-reader and contrast checks.
- [ ] Verify reduced motion, Effects off, video controls and static fallbacks.
- [ ] Verify narrow-screen layouts and readable screenshot crops.
- [ ] Measure loading, layout stability and optional-effect performance.
- [ ] Check browser consoles, missing assets and enhancement failures.
- [ ] Confirm production hostname, HTTPS, metadata, redirects and missing-page behavior for the selected Cloudflare setup.
- [ ] Validate canonical routes against sitemap entries and page-specific JSON-LD.
- [ ] Confirm effective crawler policy, public text-file delivery and preview/production indexing behavior.
- [ ] Complete the search/AI discovery launch checks and ownership setup in [Measurement and launch](SEO/MEASUREMENT-AND-LAUNCH.md).
- [ ] Record the reviewed preview/build and obtain the owner's launch instruction.

These checks describe the future implementation's acceptance work. Their completion status remains open.
