# ORIX redesign — design and delivery roadmap

> Latest user decision (2026-11-02): English only. Remove Dutch support and every language selector. This overrides all earlier bilingual/language-selection requirements below. Migrate legacy Dutch preferences to English without changing user content or unrelated settings. Installer, tray, native dialogs, dashboard and desktop surfaces stay English regardless of Windows locale. Light/Dark/System controls remain only in Settings → General. Verify `tests/english-only.test.cjs` and the English-only installer/localization checks.

Date: 2026-11-02. Status: design, four-section navigation and visual direction approved; implementation is in progress. Latest placement refinements below govern the execution plan.

Execution update: user approved the interactive preview direction on 2026-11-02. The logo will change later; the current ORIX mark is temporary. Preserve a single replaceable asset/renderer entry point rather than treating it as final branding.

User refinement: make the desktop-layer switch smaller and use accurate Claude Code, Codex and other integration logos with consistent SVG shapes for interface items. Updated preview switch is 148×52 px (was 212×86), preserving a usable pointer/keyboard target. Use local attributed product SVG assets, including separate Claude Code/Claude and Codex/ChatGPT marks and light/dark variants. A specifically named shapes-kit was not available among connected tools; the existing SVG shape system is reused pending any more-specific library reference.

Latest placement decision: language and light/dark/system theme selection belong only in Settings → General. Do not expose them in the persistent toolbar/footer or duplicate theme selection in Appearance. Appearance retains previews and desktop-layer behavior controls.

## Intent and sources

ORIX is a Windows desktop interaction layer with a companion control center. The redesign should make its existing functions easier to discover and use, with coordinated light and dark materials and an original identity.

The visual source of truth is [CREATIVE-DIRECTION.md](../../../dashboard-rewamp/CREATIVE-DIRECTION.md), together with the five images in that folder. Use the images for material, hierarchy, and interaction inspiration. Create original ORIX assets rather than copying the reference illustrations or another operating system's window controls.

The earlier [foundation requirements](2026-11-02-orix-foundation.md) still govern application isolation, free features, licensing, and removal of legacy vendor services. The new visual direction supersedes the earlier fixed navy/mint direction where they differ.

Intended public repository: https://github.com/STiFLeR7/ORIX.git. The remote was reachable and returned no branch references during inspection. No code has been pushed; publication is a separate release step.

## Confirmed user decisions

- First release: redesign existing features. Defer original mascot selection and new modules to later releases.
- The main ON/OFF switch hides or shows the desktop interaction layer. Enabled tools and integrations continue running while it is hidden.
- Include English and Dutch with a saved language selector.
- Replace Robo as part of the ORIX identity; use the neutral ORIX mark for this first release.
- Remain fully free and open source. The existing foundation selects ISC and preserves third-party notices.
- Plan and review before implementation; the user intends to start execution later as a `/goal`.

## Proposed product structure

The user approved this proposed structure on 2026-11-02. Implementation defaults below remain engineering choices, distinguished from the explicit decisions above.

Use four dashboard destinations for the first release:

1. **Overview:** current layer visibility, the prominent ON/OFF control, a real layer preview, integration status, and shortcuts to existing features. Show only information already available from the app.
2. **Appearance:** theme, existing positioning/appearance controls, status colors and animation settings, with previews that use the same renderer as the layer. Add system-following theme and reduced-motion behavior as part of the shared appearance work.
3. **Modules:** the existing app/tool catalog and its existing enable/configure controls. Preserve access to notes, Focus, clipboard/file tools, media, and other currently supported functions without inventing new modules.
4. **Settings:** Connections, AI & Chat, General, startup, available shortcuts, language, manual updates, About and license information. Keep integration setup discoverable with direct links from Overview. Existing history remains available.

Do not show an empty Mascot Studio destination or inactive future controls. Its place in the full specification is reserved for a later release.

Audit every current setting and entry point before reorganizing navigation. Retain behavior, validation, draft/save/cancel/discard semantics, and discoverability. Document any intentional retirement separately; a visual redesign does not authorize losing functionality.

## Visual and interaction contract

- Shared typography, spacing, radii, icons, focus treatment, and state colors across dashboard and layer. Reuse the bundled Inter family and current SVG infrastructure.
- Graphite, white, and cool neutral surfaces; accents convey action or state. Determine exact tokens in the preview stage rather than adding several competing palettes.
- Light and dark themes receive equal attention. Use restrained translucency with readable solid fallbacks; native blur is optional and must not be required for usability.
- Respect Windows title-bar behavior, taskbar/tray behavior, DPI scaling, and multiple monitors. Reference images do not mandate macOS traffic-light controls.
- The tactile main toggle is a keyboard-operable, labelled switch. Its adjacent description explains that tools keep running when the layer is hidden. Distinguish hidden, paused, disconnected, working, question, success, and error states where applicable.
- Hidden means all desktop-layer surfaces are dismissed and cannot reappear on hover or events until re-enabled. Dashboard and tray remain available. Existing notifications and integration work must not be silently stopped.
- Provide a discoverable tray/dashboard action to show the layer again. Visibility is separate from Quit and startup preferences.
- The visibility switch applies and persists immediately, outside settings drafts. Cancel/Discard must not undo it. Appearance and language retain the existing save semantics.
- Keyboard navigation, visible focus, labelled controls, readable contrast, UI scaling, and reduced motion are acceptance criteria. Essential controls cannot depend on hover alone.
- English and Dutch cover visible UI copy, accessibility labels, validation messages, empty states, and installer text where the application controls it. User-entered/provider text is not translated. Longer Dutch text must not clip controls.

## Architecture and data constraints

Keep Electron and the existing HTML/CSS/JavaScript implementation. No framework migration or dependency additions are planned. Retain main-process validation and established IPC contracts unless a new contract is necessary for layer visibility or system appearance.

Use the existing preference storage and translation machinery after checking their callers. Persist language and layer visibility independently. Set the initial language from the existing saved preference; absent one, use Dutch for Dutch system locales and English otherwise. Keep the existing theme preference; system-following becomes an explicit option rather than silently replacing a user's choice.

Keep the island renderer alive while its windows are hidden: `settings-bridge-ui.js` currently handles dashboard preference access through it. Do not destroy the renderer or suspend background timers for OFF. Preserve active Focus/media/AI work and unsaved input. Gate automatic window opening, hotkeys, second-instance activation, buddy surfaces, and recovery paths; only an explicit show action re-enables visibility. The installer uses Windows locale for its English/Dutch copy independently of the application's saved language.

Do not reset notes, history, integration configuration, or feature preferences. ORIX remains isolated from the original TwoCode installation and its hooks. The immutable recovered baseline remains untouched.

Before changing layout, map the current controls, preference keys, IPC handlers, callers, tests, and launch surfaces. Before adding a preference, define validation, default, persistence, renderer notification, and restart behavior together.

## Delivery phases and acceptance gates

### 0. Close the open-source foundation checks

Finish the existing foundation task: run the complete current tests and syntax checks, persist the dependency audit, exercise the patched ORIX runtime, build a local package/installer, and verify isolated installation. Update the validation report with checked and unchecked behavior. This work is already in progress and is not proof that the redesigned UI works.

Gate: reproducible local ORIX baseline, preserved recovered source, correct license/notices, and clearly documented remaining live-service or OS checks. Confirm an explicit tracked-file list before any public push so recovered binaries, local profiles, test artifacts, and credentials cannot be included accidentally.

### 1. Inventory and approve the visual direction

Map current features and settings into the proposed navigation, including integrations and history. Produce coordinated light/dark previews of Overview, Appearance, Modules, Settings, and the compact/expanded layer. Include the ON/OFF interaction and representative Dutch text. These previews are explicitly disposable until reviewed.

The inventory covers the entire existing catalog, including desktop-context tools beyond the examples above. Its checklist becomes a reachability check after navigation changes.

Gate: user reviews navigation, material treatment, density, and the visibility control before production layout changes. Convert the accepted design into an implementation plan with exact files, interfaces, tests, and ordering.

### 2. Shared appearance and desktop layer

Implement shared tokens and typography, light/dark/system theme handling, reduced motion, and the compact/expanded layer treatment. Add persistent layer visibility with dashboard/tray recovery. Check all call sites that can open a floating surface, including hotkeys and integration events. Preserve working status distinctions and existing tool behavior.

Gate: visibility survives restart; OFF prevents unintended resurfacing; tools continue running; ON restores the layer; theme/system changes and keyboard interaction work; regression tests cover the new visibility and preference behavior.

### 3. Dashboard and bilingual experience

Implement the approved four-section dashboard, reusing existing feature handlers. Connect live previews to actual preferences, retain unsaved-change handling, and complete both language dictionaries and the saved selector. Translate related desktop menus/dialogs so the selected language is consistent across the app.

Gate: every inventoried control has a working destination; settings save/cancel/discard still work; changing language and themes preserves data; both languages fit at supported sizes and scaling levels.

### 4. Regression validation and release preparation

Run meaningful automated regression checks, then inspect real application flows through Computer Use: notes persistence, Focus, catalog, preferences, layer visibility, integrations/status history, themes, keyboard focus, and both languages. Test packaged startup and isolated installation again. Exercise Windows scaling at 100%, 125%, and 150%, and multiple-monitor movement where the available hardware permits; record any unavailable checks.

Gate: reviewed screenshots, test/audit/build results, no known data-loss regression, and documented remaining limits. Prepare repository metadata, setup/contribution instructions, release notes, and a clean public source tree for STiFLeR7/ORIX. Do not publish, push, sign, or claim live-provider parity merely from offline UI tests.

## Deferred scope

Original mascot artwork/animation packs, Mascot Studio, community packs, new notification/calendar/accessibility/system-monitoring modules, richer customization controls that do not exist yet, hosted services, automatic update infrastructure, and a framework rewrite are outside this release. Existing supported tools remain in scope.

## Remaining review points

The four-section navigation is approved. The user will review visual previews during execution. The implementation plan supplies concrete initial tokens and file boundaries, which may be revised after that visual review. Code signing, public release hosting, and live integration verification remain release concerns; the supplied repository URL does not itself settle them.

Read-only builder review completed on 2026-11-02. No additional user decision blocks detailed planning; renderer lifetime, active workflows, visibility persistence, catalog coverage, and installer language defaults have been incorporated. This review does not establish runtime correctness.
