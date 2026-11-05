# ORIX website typography and visual system

Existing ORIX identity rules govern this specification. Website dimensions and composition values below are designer proposals for prototype review.

## Identity and color

Use the supplied [light lockup](../assets/orix-lockup-light.svg), [dark lockup](../assets/orix-lockup-dark.svg) and [aperture artwork](../assets/orix-icon.svg). Preserve aspect ratio and the supplied wordmark spacing. Place the complete artwork on a surface that maintains recognition. Logo clear-space guidance in the brand system remains a working proposal.

| Role | Existing value | Website application |
| --- | --- | --- |
| Obsidian | `#111318` | Primary dark background |
| Cloud | `#F4F5F7` | Primary light foreground and light identity surfaces |
| Slate | `#858B98` | Secondary detail where contrast permits |
| Ice | `#A4C8FF` | Restrained illumination, emphasis and accents |
| Dark interface surface | `#1C2024` | Elevated panels where needed |
| Dark muted interface text | `#B4BDC6` | Supporting copy on dark surfaces |
| Dark interface border | `#414950` | Panel boundaries, verified in context |
| Light interface text | `#171B20` | Primary copy on light surfaces |
| Light muted interface text | `#505B66` | Supporting copy on light surfaces |
| Light action text | `#315C97` | Existing accessible-alternative candidate for actions on light surfaces |

Identity colors and interface semantic colors retain their separate roles. Use approved provider variants for integration artwork. A blue accent remains an accent and carries state together with a label or shape.

Check actual foreground/background combinations, including translucency, images, hover and focus. Slate and Ice require particular care on Cloud. The target is WCAG AA contrast, including at least 4.5 to 1 for normal text and applicable 3 to 1 requirements for large text and meaningful control graphics. [W3C text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

## Typography

Use the existing Inter family, followed by Segoe UI and system sans-serif. The logo wordmark uses supplied artwork. Self-host the required font subset and preserve the [Inter license](../assets/fonts/Inter-LICENSE.txt).

| Role | Proposed desktop range | Proposed small-screen range | Weight | Line height |
| --- | --- | --- | --- | --- |
| Hero heading | 64–80 px | 40–48 px | 600 | 1.08 |
| Section heading | 40–52 px | 28–36 px | 600 | 1.15 |
| Feature/card heading | 20–24 px | 20–22 px | 600 | 1.3 |
| Introductory body | 18–20 px | 17–18 px | 400 | 1.55 |
| Body and FAQ answer | 16–18 px | 16–18 px | 400 | 1.6 |
| Navigation and controls | 14–16 px | 14–16 px | 500–600 | 1.4 |
| Supporting metadata | 13–14 px | 13–14 px | 400–500 | 1.5 |

Use fluid sizes within these ranges and test heading wrapping with the actual copy. Essential explanations remain at body size. Start with natural font tracking, then adjust display headings only after legibility review. Keep body lines around 55–70 characters where the layout permits. Give user text-size settings room to reflow the layout.

## Layout and spacing

- Build from the existing 4, 8, 12, 16, 24 and 32 px spacing scale.
- Proposed larger spacing steps are 48, 64 and 96 px for section composition.
- Begin with a content width near 1200 px and responsive horizontal gutters of 20–48 px.
- Use two-column compositions where the explanation and product detail remain readable. Stack them as available width decreases.
- Let content determine section height, with room for the product visual and its explanation.
- Keep dashboard crops readable through alternate exports and layouts at small widths.
- Use the existing 20 px panel and 10 px control radii as the starting point. Pills suit compact labels and actions where appropriate.

## Surfaces and effects

Use solid readable surfaces behind essential copy. Glass and lighting treatments may frame imagery or reinforce depth. Check transparent panels against every background state. Separate decorative atmosphere from the readable text and control surfaces.

Apply perspective to illustrative compositions with an equivalent flat view at narrow widths and under reduced motion. Keep the original screenshots internally flat and proportionate inside those compositions.

## Control states

| State | Required visible response |
| --- | --- |
| Rest | Clear label, boundary and action hierarchy |
| Hover | Restrained surface/border feedback on supported pointers |
| Focus | Visible focus indicator with adequate contrast |
| Pressed | Immediate feedback while preserving label readability |
| Selected | Persistent state indicator and a programmatic state |
| Loading | Named progress/status without blocking unrelated navigation |
| Error | Specific readable explanation and a relevant restoration action |

Use a proposed 44 by 44 CSS-pixel minimum touch target for interactive controls. Verify keyboard navigation, browser zoom, long labels and forced-color presentation. The [app design system](../docs/design/orix-system/DESIGN-SYSTEM.md) and [token reference](../docs/design/orix-system/tokens.css) provide the existing foundations.
