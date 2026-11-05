# ORIX brand system

**Status:** Working brand system for design and review. The 86% dark-tile icon and tighter uppercase wordmark are selected; the mark has been viewed in the app and Windows Explorer; notification-area display and trademark clearance remain unverified. The selected logo and core palette are integrated in the local app; this document also records guidance still awaiting validation.

## Position

ORIX is a Windows desktop interaction layer that keeps useful tools close while people work. Its character is calm, precise and approachable: native in behavior, minimal by default, expressive in context.

**Name:** ORIX (uppercase).  
**Primary line:** Your desktop, within reach.  
**Supporting line:** Everything in reach.

Write in direct, useful English. Describe actual features and states; avoid inflated claims, invented performance numbers and treating mockups as shipped features. Keep mascots and future modules separate from the parent identity.

## Identity

- **Mark:** the selected V4 aperture with a crossed opening. [Production icon SVG](../../../assets/orix-icon.svg).
- **Wordmark:** custom uppercase ORIX with approved tighter spacing; use the supplied artwork rather than recreating it with a font. [Light-on-dark SVG](../../../assets/orix-lockup-light.svg), [dark-on-light SVG](../../../assets/orix-lockup-dark.svg).
- **Icon:** light mark on a dark rounded tile; user selected the 86% mark viewport. [Windows icon](../../../assets/icon.ico). The 16-pixel mark may be read as an envelope; verify before release.
- **Clear space:** working proposal S/4 outside each edge of the complete logo viewport, where S is symbol viewport height. This is not an approved minimum.
- **Backgrounds:** use a dark mark on light and a light mark on dark; use a calm solid surface when wallpaper or translucency reduces visibility. Never stretch or redraw the mark, use an effect to make it recognizable, or combine it with a mascot.
- **Motion:** a brief boundary and aperture reveal, followed by the wordmark. Give reduced-motion users the complete static mark.

## Brand palette

| Color | Hex | Use |
| --- | --- | --- |
| Obsidian | #111318 | Dark identity surface and dark mark |
| Cloud | #F4F5F7 | Light identity surface and light mark |
| Slate | #858B98 | Secondary detail where contrast permits |
| Ice | #A4C8FF | Restrained accent |

The mark works in one color, including pure black or white. Brand colors and interface semantic colors are related but not interchangeable; use the [design system](DESIGN-SYSTEM.md) for interface roles. Do not use Slate or Ice for normal text on Cloud without an accessible alternative.

## Assets and usage

The production SVG lockups and Windows icon are linked above. The app also includes generated PNG sizes and tray icons in [assets](../../../assets); regenerate them with `node_modules\electron\dist\electron.exe tools\make-icon.cjs`. Earlier local explorations are not part of the public-source candidate.

Open-source licensing and trademark rights are separate. A preliminary local name screen found existing ORIX uses; no legal conclusion has been made. The project owner has elected to continue design without waiting for clearance.
