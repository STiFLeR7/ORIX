# ORIX website asset and capture plan

Status on 2026-11-05. The owner has included actual dashboard and notch snippets in the website direction. This document defines the media needed for later design and implementation.

## Existing candidate material

| Material | Existing location | Review position |
| --- | --- | --- |
| ORIX aperture | [Production SVG](../assets/orix-icon.svg) | Existing approved identity artwork |
| ORIX lockups | [Light artwork](../assets/orix-lockup-light.svg), [dark artwork](../assets/orix-lockup-dark.svg) | Existing supplied wordmark compositions |
| Integration marks | [Asset sources and licenses](../assets/icons/brands/SOURCES.md) | Existing licensed variants, retain recorded attribution |
| Inter fonts | [Font license](../assets/fonts/Inter-LICENSE.txt) and adjacent WOFF2 files | Existing bundled family, select required subsets |
| Dashboard image | `docs/media/dashboard.png` | Existing candidate media, review build, privacy and suitability before website use |
| Cover image | `docs/media/orix-cover.jpg` | Existing candidate media, review content and publication suitability |
| Demo animation | `docs/media/orix-demo.gif` | Existing candidate media, review behavior, data and motion alternatives |
| Creative references | [Reference inventory](CREATIVE-DIRECTION.md) | All 11 images visually inspected as inspiration, redistribution rights remain unverified |

The candidate media paths above record discovery of existing files. Their suitability and redaction have not been verified by this documentation task.

## Required product captures

| Capture ID | Required state | Intended use |
| --- | --- | --- |
| `desktop-overview` | A prepared Windows workspace with ORIX visible in context | Hero composition and scale |
| `notch-collapsed` | Actual compact resting layer | Product introduction and comparison |
| `notch-expanded` | Expanded home/tool-selection state | Demonstration and interaction explanation |
| `note-open` | Prepared note in the real editor | Everyday-tool explanation |
| `clipboard-history` | Prepared copied-text entries with no private content | Clipboard feature and data-control explanation |
| `focus-running` | A running sample focus session | Focus explanation and optional recording |
| `file-tray` | Public sample files and neutral filenames | File-tray explanation |
| `ai-session-status` | A verified supported session state with sample project information | AI workflow section |
| `dashboard-overview` | Actual Overview dashboard | Dashboard gallery |
| `dashboard-appearance` | Actual appearance controls | Appearance section |
| `dashboard-modules` | Actual module controls | Tool configuration explanation |
| `dashboard-connections` | Actual supported integration settings with safe account information | Integration setup explanation |
| `theme-light` and `theme-dark` | Matched product views using the same sample content | Theme comparison |

Record an asset's ID, source path, app version/build, capture date, Windows scaling, theme, crop, sample-data preparation, attribution and approval status. A simple manifest can be established when captures are produced.

## Capture procedure

1. Select the release/build whose behavior the website will describe.
2. Prepare an isolated demonstration profile with sample notes, filenames, projects and clipboard contents.
3. Review the full visible area for account details, notifications, private paths, calendar links, credentials and unrelated applications.
4. Capture the actual app at a recorded Windows scale and stable state.
5. Retain the source capture and derive clearly identified desktop and mobile crops.
6. Compare the crop against the original to confirm labels, proportions and state remain accurate.
7. Review any recording frame-by-frame for data exposure and unintended background activity.
8. Record publication approval and rights for each final asset.

## Export and composition

Keep source screenshots as lossless PNGs. Evaluate WebP/AVIF derivatives for smaller delivery where interface text and edges remain crisp. Supply appropriate image variants for the rendered size and high-density displays, with intrinsic dimensions to stabilize layout.

Use context and detail exports together. A full dashboard image establishes the product, while a tighter crop makes the relevant control readable on a phone. Keep informative text in HTML as well as the image. Perspective and lighting can affect the surrounding composition while the interface screenshot retains its geometry.

Place illustrative previews within clearly labeled demo framing. Use a poster and controls for motion assets. Existing GIF media may need a controllable video or static alternative after review. Voice, music and other launch-film media require documented rights and accessible equivalents.

## Descriptions and attribution

Write alternative text for the purpose of the image in its section. A useful example is “ORIX's expanded desktop layer showing a sample focus timer.” Decorative layers can use empty alternative text when the meaningful information is already available separately.

Preserve the approved logo geometry, applicable font notices and licensed integration artwork. Use providers supported by the presented ORIX release. Maintain source/license records for any new illustration, texture, model, music or footage. Public asset review must cover the final generated files and exports as well as their source material.

## Asset completion criteria

- Every published capture is mapped to a reviewed build and a section.
- Public captures contain prepared sample data and have been checked at full resolution.
- Desktop and mobile crops remain readable and faithful to the product.
- Media dimensions, file sizes, formats, captions and alternatives are recorded.
- Production assets have documented publication rights and required attribution.
- Static and reduced-motion alternatives are available for each animated presentation.
