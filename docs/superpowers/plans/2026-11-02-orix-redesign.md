# ORIX Redesign Implementation Plan

> Latest user decision (2026-11-02): English only. Remove Dutch support and every language selector. This overrides all earlier bilingual/language-selection requirements below. Migrate legacy Dutch preferences to English without changing user content or unrelated settings. Installer, tray, native dialogs, dashboard and desktop surfaces stay English regardless of Windows locale. Light/Dark/System controls remain only in Settings → General. Verify `tests/english-only.test.cjs` and the English-only installer/localization checks.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use superpowers:subagent-driven-development only if the user chooses delegated execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign ORIX's existing desktop layer and dashboard with four clear destinations, persistent layer visibility, coordinated themes, and complete English/Dutch controls while preserving working tools and data.

**Architecture:** Retain Electron, existing renderer-owned preferences, validated main-process IPC, and the hidden settings bridge. Add one main-process visibility controller; share appearance helpers and CSS across current surfaces. Keep visibility immediate, appearance/language drafted, and legacy navigation aliases compatible.

**Tech Stack:** Existing Electron 44.10.1 baseline, CommonJS, browser JavaScript, HTML/CSS/canvas, Node's built-in test runner, Windows C# installer. No framework or dependency additions.

**Spec:** [Approved design](../specs/2026-11-02-orix-redesign-design.md). Also read [foundation requirements](../specs/2026-11-02-orix-foundation.md), [foundation plan](2026-11-02-orix-foundation.md), and [creative direction](../../../dashboard-rewamp/CREATIVE-DIRECTION.md).

## Global Constraints

- First release: redesign existing features. Defer original mascot selection and new modules to later releases.
- The main ON/OFF switch hides or shows the desktop interaction layer. Enabled tools and integrations continue running while it is hidden.
- Include English and Dutch with a saved language selector.
- Latest user placement decision: language and light/dark/system selectors appear only in Settings → General, never in a persistent toolbar/footer or duplicated in Appearance.
- Replace Robo as part of the ORIX identity; use the neutral ORIX mark for this first release.
- Remain fully free and open source. The existing foundation selects ISC and preserves third-party notices.
- Keep Electron and the existing HTML/CSS/JavaScript implementation. No framework migration or dependency additions are planned.
- Do not reset notes, history, integration configuration, or feature preferences. ORIX remains isolated from the original TwoCode installation and its hooks. The immutable recovered baseline remains untouched.
- The visibility switch applies and persists immediately, outside settings drafts. Cancel/Discard must not undo it. Appearance and language retain the existing save semantics.
- No public push, publication, real-profile installation, new hosted service, or automatic updater in this execution. Intended repository: https://github.com/STiFLeR7/ORIX.git.
- Never read/create `.env` or print credentials. Use the vault MCP if authorized live checks require secrets. Do not log real clipboard contents or user conversations.
- A later user-started `/goal` begins execution. This planning task does not begin it.

## Review Focus

1. OFF during Focus/media/AI or an unsaved note must hide surfaces without cancelling work or losing input; test in Tasks 3 and 8.
2. Startup, ready-to-show, second instances, hotkeys, delayed buddy callbacks, and renderer recovery must not resurface OFF; test in Tasks 3 and 8.
3. Missing/corrupt preferences and older Dutch/theme saves must retain valid choices; Cancel must revert drafts without undoing visibility; test in Tasks 4 and 7.
4. Foreign-window IPC, invalid visibility/theme values, and failed disk writes must not alter state or expose data; test in Tasks 3 and 4.
5. Long Dutch strings, DPI scaling, keyboard-only use, high contrast, and reduced motion must leave every existing tool reachable; test in Tasks 5–8.

## Execution order and tracking

Execute Tasks 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9. Tasks share preference and renderer boundaries, so sequential execution is the default. Each task ends in a working checkpoint and a short evidence entry in `docs/ORIX-REDESIGN-VALIDATION.md` (command/result or screenshot, limitations, next task). Never mark a check passed based on a source search alone.

The workspace currently has no Git repository. At execution start, check again. If it is still absent, keep working in place with `recovered/` untouched; use the evidence ledger for checkpoints. If Git exists, inspect existing changes first, isolate work where appropriate, and commit only task-owned source after checks pass. Never run `git add .`, discard unrelated edits, or push automatically.

Task 2 includes review of disposable visual previews before production layout changes. If those change this plan's concrete choices, update the affected tasks before proceeding. Do not ask again about decisions already captured by the approved spec.

## File responsibilities and existing seams

| Files | Responsibility |
| --- | --- |
| `main.js`, `preload.js` | Island lifecycle, ready-to-show and validated island bridge |
| `tray-main.cjs`, `island-window-main.js`, `extras-main.cjs` | Tray, second instance, recovery and global shortcuts |
| `buddy-main.cjs`, `buddy-preload.js`, `buddy-ui.js`, `buddy.html` | Context overlay and its delayed show/return paths |
| `settings-app-main.cjs`, `settings-app-preload.js` | Dashboard window, trusted IPC, close-with-dirty handling |
| `settings-app.html` | Existing dashboard layout, route rendering and EN/NL dictionaries |
| `settings-bridge-ui.js` | Hidden renderer relay, app toggles, draft/save/discard |
| `twocode-fun.js` | `twocode:prefs` storage, `__twocodeRealPrefs`, `__twocodeWithDraft`, `__twocodeSaveDraft`, animation controls |
| `mascot.html`, `pages-ui.js`, `tools-ui.js`, `extras-ui.js`, `focus-ui.js`, `spotify-ui.js`, `chat-ui.js`, `ai-monitor-ui.js`, `ai-settings-ui.js`, `project-mode-ui.js`, `island-window-ui.js` | Existing layer rendering and tools; preserve their handlers |
| `i18n-ui.js`, `icons-ui.js`, `orix-brand-ui.js` | Existing translations, icons and shared ORIX mark |
| **New** `orix-layer-main.cjs` | Persisted layer visibility, registered floating surfaces and trusted visibility IPC |
| **New** `orix-appearance-ui.js`, `orix-theme.css` | Shared appearance normalization/resolution and CSS tokens |
| **New** `orix-navigation-ui.js` | Canonical dashboard route/legacy alias mapping and catalog metadata |
| `tools/setup/Setup.cs`, `tools/make-setup.cjs` | Existing installer generation and EN/NL installer copy |
| **New** `tools/make-package.cjs` | Reproducible allowlisted Windows package using installed patched Electron |
| `tests/*.test.cjs` | Existing release/hook/tool tests plus focused new behavior tests |

Browser helpers expose `window.ORIXAppearance` / `window.ORIXNavigation`; guarded `module.exports` exposes the same pure functions to Node tests. Do not enable Node integration to import them. Do not extract unrelated code from large existing files.

### Task 1: Establish a reproducible foundation baseline

**Files:** existing foundation files only when checks identify a real defect; create `tools/make-package.cjs`, `tests/package.test.cjs`, `docs/ORIX-REDESIGN-VALIDATION.md`; update `TESTING.md`, `RELEASE.md`, `package.json` scripts only as needed.

**Interfaces:** `node tools/make-package.cjs` produces `dist/ORIX-Windows-<package.version>.zip`, with one top-level `ORIX/`, renamed patched runtime `ORIX.exe`, and `resources/app`; existing `node tools/make-setup.cjs <zip>` consumes it. Use the already available 7-Zip executable, reporting its required location clearly; do not introduce a new archive dependency.

- [x] Review foundation source changes against the untouched recovered source and reconcile the stale `.verification/orix-progress.md` from actual evidence. Never infer completion from the old unchecked ledger.
- [x] Close isolated test app instances before tests to avoid hook-port contention. Run `npm test`, `npm audit --json`, and syntax checks for first-party JS/CJS plus compiled inline HTML scripts. Save results in `.verification/`; summarize current counts and failures in the validation report. Dependency security decisions must be rechecked at execution time.
- [x] Write `tests/package.test.cjs`: a temporary staging fixture includes allowed runtime source/license/assets but excludes `recovered`, `.verification`, `dist`, development dependencies, local profiles, `.env` names and planning references. Assert package/runtime version agreement and required application entry points. Run `node --test tests/package.test.cjs` and confirm meaningful failure before implementing packaging logic.
- [x] Implement the package script using `fs`, `path`, and `execFileSync`. Stage from installed `node_modules/electron/dist`, not `recovered`; explicitly enumerate first-party runtime files, assets, the existing editor extension, README/license/notices, and production dependencies. Use `npm ci --omit=dev --ignore-scripts` in staged app if dependencies are absent; never copy the development `node_modules`. Exclude design-reference images from distributed runtime. Fail on missing required files or a runtime version mismatch.
- [x] Run the packaging test, generate ZIP/setup, and install only to `.verification/orix-installed` with `--quiet --no-start --dir`. Check installer exit code and hashes of installed files against staging. Launch with isolated appData/home using the existing `.verification/launch.cjs` pattern, extended for the new ORIX executable/source variants. No real hooks, registry startup preference, or user profile changes.
- [x] Smoke-check patched runtime, neutral mark, dashboard, notes and Focus; record limitations. Gate: working local ORIX baseline, complete ISC/notices, current audit result assessed, and an isolated reproducible build. Resolve material failures before Task 2.

### Task 2: Inventory existing features and review disposable previews

**Files:** create `docs/ORIX-FEATURE-MAP.md`, `docs/design/orix-preview.html`, `docs/design/orix-preview.css`; update this plan if reviewed choices change. No production UI edits.

**Interfaces:** feature map columns: existing control/view, preference or IPC, entry points, new route, save semantics, regression check. Preview uses the canonical routes `overview`, `appearance`, `modules`, `settings` and Settings subsections `connections`, `ai`, `general`, `updates`, `about`.

- [ ] Inventory all current settings rows, hidden settings lists, tools, project/chat entry points, history, sleep/status preferences, startup controls and shortcuts. Record retired mascot-only controls distinctly; preserve supported functional preferences. Catalog baseline IDs: `claude`, `buddy`, `spotify`, `focus`, `tray`, `clips`, `note`, `clock`, `settings`; core flags stay unchanged.
- [ ] Map `home→overview`, `karakter→appearance`, `apps→modules`, `connect→settings/connections`, `ai→settings/ai`, `general→settings/general`, `news→settings/updates`; stale `wardrobe→appearance`. Preserve old IPC/query links through this mapping.
- [ ] Build disposable previews with real representative labels and seeded, explicitly labelled sample status. Show all four destinations, both themes, compact/expanded layer, ON/OFF, keyboard focus, unsaved/error states, and long Dutch labels. Use Windows window controls and the bundled Inter font. No nonfunctional control may be presented as a finished product feature.
- [ ] Start from these concrete shared tokens: dark background `#111315`, surface `#1c2024`, text `#f3f5f7`, muted `#b4bdc6`, border `#414950`; light background `#f2f4f6`, surface `#ffffff`, text `#171b20`, muted `#505b66`, border `#b8c2cc`; action `#3975d5` (dark mode action `#82b4ff`), status orange `#ff9a1f`, success `#22e05a`, error `#ff3b3b`. Status always has a text/icon distinction. Spacing: 4/8/12/16/24/32 px; panel radius 20 px, control radius 10 px, pills fully rounded; normal transitions 160 ms, expansion 220 ms; reduced motion removes transforms and decorative loops. Verify actual contrast before acceptance.
- [ ] Inspect previews at dashboard 1120×760 and minimum 820×560, EN/NL and light/dark. Provide screenshots/preview for user review of visual treatment. Gate: explicit visual approval before Task 5; Task 3's behavior work can proceed independently if execution remains active and review is pending. If execution is deliberately paused for this gate, record the exact outstanding review.

### Task 3: Persist and enforce hide-only layer visibility

**Files:** create `orix-layer-main.cjs`, `tests/layer-visibility.test.cjs`; modify `main.js`, `preload.js`, `settings-app-main.cjs`, `settings-app-preload.js`, `tray-main.cjs`, `island-window-main.js`, `extras-main.cjs`, `buddy-main.cjs` and renderer entry handlers only where they can surface a floating window.

**Interfaces:** controller exports `getState() → { visible: boolean }`, `setVisible(visible: boolean) → { ok: boolean, visible: boolean, error?: string }`, `registerSurface(win) → void`, `isVisible() → boolean`. Main owns `%userData%/orix-layer.json`, schema `{ version: 1, visible: boolean }`, default true. Register only the island and context overlay, never dashboard/editor windows. Trusted IPC: `orix:layer-get`, `orix:layer-set`; change event `orix:layer-changed`. Preloads expose `layer.get()`, `layer.set(boolean)`, `layer.onChange(callback) → unsubscribe` under existing `twocode` / `settingsApp` objects.

- [ ] Write failing tests with temporary userData and mocked Electron surfaces: default ON, valid OFF survives recreation, corrupt schema falls back ON without touching unrelated files, nonboolean values fail, foreign senders fail, write failure reports an error and preserves the old visible state. Assert broadcasts and rejected requests never leak profile paths.
- [ ] Implement the controller. Write temporary sibling then rename before acknowledging success; clean only its own temporary file on failure. Keep renderer/timers alive. Hide all registered floating surfaces when OFF, guard each show/ready callback and add a defensive show-event hide. Register a replaced/recovered island with the current state before it can show.
- [ ] Route explicit tray “Show desktop layer” / “Hide desktop layer” through the controller. Tray single-click explicitly shows the layer. Dashboard launch/second-instance activation opens dashboard when hidden and does not flip visibility. Existing Ctrl+Alt+1..6 and Ctrl+Alt+T do nothing to visibility while OFF; show their behavior in Settings. When ON, Ctrl+Alt+T selects the island by page identity rather than the first BrowserWindow.
- [ ] Gate all show/focus paths in `main.js`, `buddy-main.cjs`, `island-window-main.js` and discovered callers, including delayed callbacks and integration-driven UI. An OFF transition dismisses floating UI but retains draft text and running tasks. Do not call stop/reset/cancel functions. Preserve OS notifications and monitoring according to existing enabled preferences.
- [ ] Add integration-style mock tests exercising real tray/hotkey/ready-to-show/buddy-return handlers while OFF, then explicit ON; avoid tests that only call `isVisible()` and restate its result. Test dashboard IPC remains usable while the island is hidden and its renderer is not destroyed.
- [ ] Run `node --test tests/layer-visibility.test.cjs tests/release.test.cjs tests/extras.test.cjs`; inspect actual OFF during an active Focus countdown and note entry, reopen dashboard, switch ON, and restart OFF in isolation. Gate: no unintended resurfacing and no cancelled/lost work.

### Task 4: Shared appearance, language persistence, and draft semantics

**Files:** create `orix-appearance-ui.js`, `orix-theme.css`, `tests/appearance.test.cjs`, `tests/settings-drafts.test.cjs`; modify `twocode-fun.js`, `settings-bridge-ui.js`, `settings-app-main.cjs`, `settings-app-preload.js`, `preload.js`, `settings-app.html`, `mascot.html`, `buddy.html`, `buddy-ui.js`.

**Interfaces:** `ORIXAppearance.normalize(input, legacyTheme, locale) → { themeMode: 'light'|'dark'|'system', motionMode: 'full'|'reduced'|'system', lang: 'en'|'nl' }`; `resolve(preferences, { dark, reducedMotion, highContrast }) → { theme: 'light'|'dark', reducedMotion: boolean, highContrast: boolean }`. Browser `apply(root, resolved) → void` sets `data-theme`, `data-reduced-motion`, `data-high-contrast`. CSS tokens supply canvas colors through computed-style values cached on appearance changes, never queried every animation frame.

- [ ] Write failing tests for valid/invalid modes, saved Dutch preserved even without `englishDefault`, Dutch locale fallback, English fallback, older dashboard `localStorage.theme` migrated once, explicit theme surviving system changes, system theme reacting, reduced-motion override, and unrelated preference fields preserved.
- [ ] Remove the unconditional `englishDefault` migration that currently overwrites older language choices. Add only the new `themeMode`/`motionMode` fields to the existing `twocode:prefs` object. Preserve valid saved settings; initial motion defaults to system. Existing dashboard theme is used only when no canonical themeMode exists. Pass legacy dashboard theme through a cleaned `kind:'appearance-init'` settings relay request, with payload `{legacyTheme:'light'|'dark'|null}`. Persist the one-time migration without saving an active draft; subsequent requests cannot overwrite the chosen preference.
- [ ] Extend the existing relay with `kind:'appearance'` and cleaned `values:{themeMode,motionMode,lang}`; apply changes to `draft.prefs` through the existing draft API. Reject unknown values before applying. Both initialize and draft requests retain current-window trust checks and bounded payloads.
- [ ] Use `nativeTheme.shouldUseDarkColors` and `shouldUseHighContrastColors` for system colors, keeping `nativeTheme.themeSource = 'system'` so a draft cannot change the global OS snapshot. Expose trusted `orix:system-get → { dark, highContrast, locale }` and `orix:system-changed` through both preloads; re-read on nativeTheme `updated`. In each renderer, obtain reduced motion from `matchMedia('(prefers-reduced-motion: reduce)')` and merge it into the resolver's system argument; listen for `change`. Add only one nativeTheme listener per process and unsubscribe renderer listeners on teardown. API references: [Electron nativeTheme](https://www.electronjs.org/docs/latest/api/native-theme); verify against installed `electron.d.ts` at execution time.
- [ ] Share a renderer-resolved appearance snapshot with main for native window chrome through the existing validated theme channel, extended with `lang` if necessary. Draft changes affect dashboard preview/chrome only; saved changes notify the island, buddy, tray and dashboard. Discard restores committed appearance and close-dialog language. Main never treats a preview as persisted preferences.
- [ ] Exercise actual `__twocodeRemoteSettings` in a minimal VM/DOM harness: theme/language change marks dirty; live preview changes; Save persists; Discard restores committed values; failed relay leaves draft dirty with a recoverable error; immediate visibility survives either outcome. Do not print whole preference objects that might contain user data.
- [ ] Run `node --test tests/appearance.test.cjs tests/settings-drafts.test.cjs tests/layer-visibility.test.cjs`; check system light/dark updates and dark/light/system selection in the isolated app. Gate: single committed preference source, no save/cancel regression, no language reset.

### Task 5: Apply the approved desktop-layer visual system

Approved refinement: the Overview visibility switch is 148×52 px, preserving keyboard/label behavior. Reuse `orix-icons-ui.js` and `assets/icons/brands` for accurate integration logos and consistent SVG shapes throughout dashboard and layer; retain attribution. The current ORIX logo remains temporary and will be replaced later.

**Files:** `mascot.html`, `orix-brand-ui.js`, `orix-theme.css`, `twocode-fun.js`, `island-window-ui.js`, `buddy.html`, `buddy-ui.js`, `pages-ui.js`, `tools-ui.js`, `focus-ui.js`, `extras-ui.js`, `spotify-ui.js`, `chat-ui.js`, `ai-monitor-ui.js`, `ai-settings-ui.js`, `project-mode-ui.js`; extend `tests/orix-brand.test.cjs` and appearance tests.

**Interfaces:** keep `window.__orixMark(ctx,x,y,size,accent)` and all current tool/IPC entry points. Add optional resolved theme/motion inputs through current render state; preserve existing positional arguments. Do not rename internal `twocode:*` storage/IPC for cosmetics.

- [ ] Require Task 2 visual approval. Extend canvas behavior tests before changes: busy remains distinct from question, success/error text or glyphs remain distinct without color, parent canvas alpha is restored, reduced motion keeps informative status while removing pulsing/decorative movement.
- [ ] Apply shared typography/surfaces to compact, expanded, contextual and tool states. Use cached token colors for canvas and shared CSS for DOM. Keep file drop regions, click-through behavior, input focus, resize bounds and existing drag interactions intact.
- [ ] Add an accessible DOM activation/status control for canvas-only essential interactions. Enter/Space opens or activates; Escape closes the expanded surface without quitting; visible focus remains within bounds. Preserve current keyboard paths; do not require pointer hover.
- [ ] Respect motion preferences in `twocode-fun.js` scheduling, layer transitions and buddy animation, without disabling Focus/AI timers. High contrast uses opaque surfaces and visible outlines. Do not add native acrylic/blur APIs unless existing behavior supports them without dependency changes.
- [ ] Run `node --test tests/orix-brand.test.cjs tests/appearance.test.cjs`; inspect compact/expanded/tool/context states in both themes, reduced motion and keyboard-only input. Gate: approved treatment with baseline tool behavior preserved.

### Task 6: Reorganize the dashboard without losing handlers

**Files:** create `orix-navigation-ui.js`, `tests/dashboard-navigation.test.cjs`; modify `settings-app.html`, `settings-app-main.cjs`, `settings-app-preload.js`, `settings-bridge-ui.js`, `orix-theme.css`; feature-map checklist updated.

**Interfaces:** `ORIXNavigation.resolveRoute(input:string) → { page, section }` validates canonical routes/legacy aliases, with `overview` fallback. `ORIXNavigation.modules` contains the nine existing catalog objects (same IDs/core flags), moved from `APPS` without duplicate lists. All existing settings IPC actions still relay through the current handlers.

- [ ] Write failing navigation tests for every alias in Task 2, canonical subsection, invalid input and unknown saved tab. Assert exact baseline catalog IDs/core flags and that each maps to a reachable existing handler. Keep runtime route handling testable through the pure helper rather than testing only HTML strings.
- [ ] Replace the dashboard sidebar with Overview, Appearance, Modules, Settings. Keep `home`, `connect`, `ai`, `apps`, `karakter`, `general`, `news` aliases accepted by main and renderer. Preserve AI/connection links opened from the island/tray and restored tabs; no dead wardrobe route.
- [ ] Implement Overview with the immediate switch, its keep-running explanation, real current state, existing connection/history data and useful existing-tool links. Reflect errors/loading/externally changed state; disable repeated writes while pending and retain last confirmed switch state on failure. Do not fabricate recent activity or system metrics.
- [ ] Implement Appearance using Task 4 drafted controls and the existing live ORIX mark preview. Render functional appearance/status controls from current handlers; omit retired pet cosmetics and document them in the feature map. Keep Save/Cancel visible and keyboard reachable when dirty.
- [ ] Move catalog to Modules and existing integration/AI/general controls to Settings subsections. Preserve startup, app toggles, provider setup, history, close-with-unsaved-changes and manual update behavior. About shows version, ISC and notices; link only to the provided repository/its releases over explicit allowed HTTPS URLs, with clear empty-release behavior and no automatic checks or downloads.
- [ ] Run navigation/draft/release tests. Manually follow every feature-map row, including deep links and keyboard activation, and record route/handler evidence. Gate: all existing functionality reachable, four working destinations, accurate save state and no inactive future-feature placeholders.

### Task 7: Complete English/Dutch coverage and native copy

**Files:** `settings-app.html`, `i18n-ui.js`, `twocode-fun.js`, `tray-main.cjs`, `settings-app-main.cjs`, `buddy-main.cjs`, `extras-main.cjs`, `project-mode-main.js`, `project-editor-main.js`, `project-agent-main.js`, `main.js`, related existing renderer strings, `tools/setup/Setup.cs`; create `tests/localization.test.cjs`.

**Interfaces:** retain existing dashboard `T.nl` / `T.en` and island translation mechanism. Add a small `orix-copy.cjs` only for main-process-owned UI copy: `text(lang,key,params={}) → string`, deterministic EN/NL fallback, no translation of provider/user messages. Installer uses `CultureInfo.CurrentUICulture.TwoLetterISOLanguageName == "nl"` for Dutch, otherwise English; application saved language is independent.

- [ ] Write failing assertions for matching dashboard dictionary key sets, required main-process EN/NL keys, locale fallback, preserved user/provider text and no repeated translation corruption when switching twice. Include the new visibility explanation, errors, accessible labels, unsaved dialog, tray show/hide and update/about copy.
- [ ] Complete both dictionaries and missing existing translations; use existing interpolation/escaping. Translate app-owned validation wrappers, not raw provider output. Remove any remaining visible premium/activation or Robo wording while preserving provenance in notices.
- [ ] Bind the saved language selector to Task 4's draft path; keep tray and committed desktop copy unchanged until Save, restore preview on Cancel. Rebuild tray labels on committed-language change without changing startup state or visibility.
- [x] Localize installer UI, success/failure guidance and controlled error text. Keep `--quiet`, `--dir`, `--no-start`, archive path validation, rollback and ORIX isolation unchanged. Use existing `--shot` render path to inspect success UI under EN/NL culture; do not add a product language flag just for tests.
- [ ] Run `node --test tests/localization.test.cjs tests/settings-drafts.test.cjs tests/dashboard-navigation.test.cjs`, compile installer, then inspect both languages across dashboard/layer/tray/dialogs. Gate: persistence after restart, no clipped Dutch controls, no untranslated essential app-owned controls.

### Task 8: Integrated regression and accessibility verification

**Files:** `docs/ORIX-REDESIGN-VALIDATION.md`, `TESTING.md`, focused tests for any defect found. Screenshots/profiles stay in `.verification/`.

**Interfaces:** every result records variant (source or packaged), locale, theme, viewport/scaling, action, expected/actual, evidence location, and pass/fail/unverified. A known offline pass never implies a live-provider pass.

- [ ] Run full `npm test`, current `npm audit --json`, first-party JS/CJS/inline-script syntax checks and reproducible build. Fix failures with a failing regression first; repeat only affected checks plus the final full suite after the last source change.
- [ ] Through Computer Use, verify notes autosave/restart, Focus start/countdown/stop, clipboard/file-tray with synthetic inputs, catalog toggles, connections/AI configuration drafts, history and simulated working/question/done/error. Run real integration checks only where account/hardware availability permits; report missing ones precisely.
- [ ] Test OFF mid-Focus, unsaved note entry, pending AI work and settings drafts; wait for events/delayed callbacks; use hotkeys and a second launch; restart OFF; open dashboard; explicitly ON. Confirm continuing work and input preservation. Check crash recovery with a disposable profile and documented expected loss only of genuinely unsaved crashed-renderer state.
- [ ] Check EN/NL × light/dark, system theme changes, reduced-motion and high-contrast behavior. Test keyboard tab order, switch Space/Enter, Escape, visible focus, accessible names and screen-reader reading where available. Record screen-reader checks as unverified if no actual assistive-technology test occurs.
- [ ] Check dashboard at 1120×760 and 820×560 and Windows 100%/125%/150% scaling. With hardware available, test monitor movement, taskbar edges, different work areas and disconnect/reconnect. Do not change the user's desktop scaling persistently; restore any temporary setting. If hardware is unavailable, leave the check explicitly unverified.
- [ ] Compare idle and expanded behavior before/after in the same environment: confirm no new polling/fetch loops, background Focus still progresses OFF, and memory/timer/listener counts do not grow on repeated dashboard open/close. Record observations rather than inventing a performance target.
- [ ] Review the final diff for data-loss paths, trusted IPC checks, OFF show paths, draft isolation, hook/install identity and reference-asset copying. Gate: material issues fixed; remaining OS/provider/assistive-tech limits are named in release documentation.

### Task 9: Prepare a reviewable open-source release and handoff

**Files:** `README.md`, `LEES-MIJ.md`, `RELEASE.md`, `UPDATES.md`, `THIRD_PARTY_NOTICES.md`, `.gitignore`, `package.json`, `package-lock.json`; create `CONTRIBUTING.md`; finalize validation/feature map and plan checkboxes.

**Interfaces:** repository metadata points to `https://github.com/STiFLeR7/ORIX`; `bugs.url` is `/issues`, `repository.url` is `git+https://github.com/STiFLeR7/ORIX.git`. Build outputs remain local until publication is separately requested.

- [x] Add accurate source/setup/build/test/contribution instructions, free-feature policy, English/Dutch behavior, visibility semantics, manual updates and provider configuration limitations. Keep ISC and third-party notices intact. Source release can remain version `0.1.0-beta.1` unless execution reveals an already-published version; never overwrite a published tag.
- [x] Review the candidate public file list explicitly. Exclude recovered executables, `.verification`, `dist`, dependencies, local user data, secrets and reference images without established redistribution permission. Keep reference images local as design inputs; retain a textual creative-direction summary with provenance in tracked docs. Never open `.env` to perform this check.
- [ ] Rebuild final ZIP/setup from final source and repeat isolated installation/startup and required notices checks; record SHA-256 hashes and actual test/audit results in `RELEASE.md`. Document code-signing state honestly; do not claim Windows trust/signing that has not been configured.
- [ ] Prepare a concise final change summary and list unverified items. Do not push to the empty repository or create a public release during this plan. If a later instruction authorizes publication, review the exact source/artifacts first and use that authorization then.
- [ ] Update project docs/ledger to completed or explicitly remaining items. Update Waypoint as the last task action, with current Done/Next and remaining Attention; never change project Status or generated dashboard files.

## Completion criteria and later `/goal`

The execution objective is a tested, locally packaged ORIX redesign implementing the approved scope, with evidence and a clean source tree ready for publication. A visual-review gate or unavailable external/hardware check is reported clearly; it is never counted as a pass. Public publication and later mascot/module work are separate objectives.

Suggested later goal text:

> Implement docs/superpowers/plans/2026-11-02-orix-redesign.md against its approved design. Preserve all existing tools and data, complete the foundation checks, produce reviewed light/dark previews, implement the bilingual four-section dashboard and hide-only layer switch, verify the packaged app, and prepare the STiFLeR7/ORIX source release locally. Do not push or publish. Report visual-review gates and unavailable live/hardware checks honestly.

Plan self-review: spec requirements are assigned to Tasks 1–9; interfaces use one visibility state and the existing committed preference source; five review-focus cases are covered by automated and real-app checks. Visual approval is a deliberate execution checkpoint, not an unfilled implementation decision.
