# ORIX interface design system

**Status:** Working interface specification. The selected logo, shared palette, dashboard lockup and compact switch have been integrated into the local app; other guidance remains subject to implementation and validation. The interface is English only.

## Foundations

Use Inter when the bundled font is available, then Segoe UI and system sans-serif. The logo wordmark is artwork, not typed Inter. Keep text readable and restrained: 36/41 px page title, 20/26 px section heading, 16/22 px card title, 14/20 px body, and 12/18 px supporting text. Avoid using small uppercase text for essential instructions.

Use the 4, 8, 12, 16, 24 and 32 px spacing scale. Working radii: 20 px panels, 10 px controls and fully rounded pills. Default transitions are 160 ms; layer expansion can take 220 ms. Under reduced motion remove decorative movement and transforms; never delay an essential state change.

The [CSS tokens](tokens.css) use the redesign plan's interface colors, distinct from the identity palette. They are proposals until tested in the running application, including opacity and high-contrast settings.

### Initial opaque contrast checks

On white, the earlier planned light accent `#3975D5` measures approximately 4.49:1 and does not meet 4.5:1 for normal text. The proposed `--orix-action-text: #315C97` measures approximately 6.76:1 on white; the product uses `#3974D4` as its current action accent; verify each actual use against its background. Dark text, dark muted text, dark action text, light text and light muted text each exceeded 4.5:1 on their respective tested backgrounds. These calculations do not establish control, focus, opacity or real-screen compliance.

## Navigation and layout

Four destinations: **Overview**, **Appearance**, **Modules**, **Settings**. Settings contains General, Connections, AI, Updates and About. General contains Light / Dark / System appearance selection; there is no language selector or Dutch UI. Use a compact sidebar at wide sizes and preserve all navigation and controls at the planned 820×560 minimum. Verify actual window scaling and content overflow.

## Components and states

- **Layer switch:** compact and clearly labelled with its current On/Off state; changing it hides or shows the desktop layer only. Enabled tools and integrations continue running. Give it an accessible name and checked state; do not rely on color alone.
- **Buttons:** use clear action verbs, a visible focus indicator and distinct hover, pressed and disabled states. Primary buttons have one dominant action per context; secondary buttons are outlined or quiet. Do not make unavailable functionality look operational.
- **Cards and rows:** group a title, a short explanation and the relevant control. Maintain readable hierarchy and consistent spacing; show empty, loading, success and error states where applicable.
- **Inputs and settings:** use persistent labels, descriptions and specific errors. Preserve the existing Save/Cancel semantics for drafted settings. A visibility change is immediate and must not be undone by discarding settings.
- **Status:** pair color with a word or icon. Never convey success, warning or error by color alone. Surface errors near their cause and offer a restoration action when one exists.
- **Icons:** use accurate, properly licensed provider artwork and preserve their brand shapes; generic icons use a consistent size and stroke. Do not fabricate provider logos.

## Accessibility and verification

Target WCAG AA contrast for text and meaningful controls in their actual states; test any translucent surface over representative wallpapers. Keyboard operation, focus visibility, screen reader names and state, Windows high contrast, scaling and reduced motion must be checked in the running product. Controls should retain usable target sizes, and desktop-layer visibility must not stop ongoing work.

[Brand system](BRAND-SYSTEM.md) · [Approved redesign plan](../../docs/ORIX-FEATURE-MAP.md) · [Design direction](../CREATIVE-DIRECTION.md)
