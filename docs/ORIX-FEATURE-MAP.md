# ORIX existing-feature map

Inventory date: 2026-11-02. This is a preservation checklist. The redesign is implemented, but an unchecked item means its complete stated workflow has not yet been verified; partial evidence is summarized below and detailed in the [execution ledger](ORIX-REDESIGN-VALIDATION.md).

## Dashboard routes

| Existing entry | New destination | Backing code/contract | Save behavior / verification |
| --- | --- | --- | --- |
| Home / `home` | Overview | `settings-app:home`, `settings-app:connections`; existing activity search | Read-only; history/search and connection links |
| Desktop layer / `karakter` | Appearance | `__orixSettingsCharacter`, `settings-app:get` list/click | Draft; status colors/sleep preview, Save/Discard |
| Apps / `apps` | Modules | `settings-app:get` apps/app; `orix:apps-off` | Draft; exact nine IDs below |
| Connections / `connect` | Settings / Connections | `settings-app:connections`, `settings-app:connect`; monitor provider setup | Existing connection actions remain explicit/immediate; do not pretend Save controls installed hooks |
| AI & Chat / `ai` | Settings / AI & Chat | `ai-settings:*`; dashboard's `aiDirty` and provider selection flow | Preserve existing provider draft vs explicit login/logout/test actions |
| General / `general` | Settings / General, with theme controls in General | `__orixSettingsExtra`, `settings-bridge-ui.js` | Preserve row delegation and draft/save/discard; action exceptions below |
| News / `news` | Settings / Updates | local `settings-app:news`, disabled `update:*` | Manual only; repository link; no vendor checks/downloads |
| Removed `wardrobe` link | Appearance | legacy route alias | Do not restore retired pet wardrobe or paid activation |
| About (new destination for existing release facts) | Settings / About | app version, LICENSE, THIRD_PARTY_NOTICES | Read-only, accurate provenance and repository |

## Existing catalog — exact IDs and core flags

| ID | Core | Feature / entry points | Existing handler / persisted state | New reachability check |
| --- | --- | --- | --- | --- |
| `claude` | yes | AI status, monitor/history, questions/replies; home/footer, Ctrl+Alt+3 | `ai-monitor-*`, `claude-code-hooks.cjs`, reply/statusline helpers | [ ] Overview status → existing monitor, Settings connections/AI |
| `buddy` | no | Desktop context drag/drop, ask about screen, spelling/Word fixes | `buddy:*`, `buddy-main.cjs`, `chat-ui.js` | [ ] Modules toggle, existing context/chat workflow |
| `spotify` | no | Playback/devices/connect; home/footer, Ctrl+Alt+2 | `spotify:*`, `spotify-ui.js`; user-supplied public client ID | [ ] Modules, media view, configured/unconfigured states |
| `focus` | no | Timer/duration presets/start/stop; home/footer, Ctrl+Alt+4 | `focus-ui.js`, `orix-fun.js`; focus duration prefs | [ ] Modules, Focus view; running while layer OFF |
| `tray` | no | Dropped files, open/remove/drag-out; footer and drop target | `extras:tray-*`; `tray.json` | [ ] Modules and file tray with synthetic files |
| `clips` | no | Clipboard history/copy/clear; footer, Ctrl+Alt+5 | `extras:clips-*`; existing collector | [ ] Modules and clipboard; synthetic inputs only |
| `note` | no | Note/edit/check circles/autosave; footer, Ctrl+Alt+6 | `extras:note-get/set`; `note.json`, max 20000 chars | [ ] Modules, note persisted across restart |
| `clock` | no | Home clock/date | existing home renderer and app-off list | [ ] Modules toggle hides/shows clock without affecting timer |
| `settings` | yes | Gear/footer/tray/Start menu `--settings` | `settings-app:open`, `orix-open-settings` | [ ] Always reachable, including while layer OFF |

## Existing controls outside the catalog

| Control | State/handler | Destination and acceptance |
| --- | --- | --- |
| Interface language | Compatibility field `orix:prefs.lang` | English only per latest user decision; old Dutch values migrate without altering user content. No language selector. |
| Animation speed | `prefs.speed` (`snel`, `normaal`) | Appearance; preserve speed selection; reduced motion takes precedence over decorative motion |
| Confetti | `prefs.confetti` | Appearance; preserve toggle, no decorative effects when reduced motion applies |
| Status colors | `prefs.lightBusy/lightDone/lightError` | Appearance; preserve presets and demos, busy/question distinguishable beyond color |
| Sleep | `sleepEnabled`, `prefs.sleepMin` | Appearance; preserve draft behavior, distinct from hide-only layer switch |
| Sound enabled / sound pack | `prefs.chimes`, `prefs.pack` | Settings / General; preserve sound preview and choice |
| Windows notifications / usage-limit warning | `prefs.notify`, `prefs.warnAt` | Settings / General; OFF does not turn these off |
| Weather city | `extras:config`, `city` | Settings / General; retain input/save/error handling and bounded strings |
| Existing calendar ICS link | `extras:config`, `calendarUrl` | Settings / General; preserve existing integration, no new calendar module; never expose private ICS URL in screenshots/logs |
| Volume HUD | `prefs.volumeHud`, `extras:volume-*`, loopback helper | Settings / General; layer HUD hidden OFF, background integration not reset |
| Battery warning | `prefs.batteryWarn`, Bluetooth/laptop status | Settings / General; retain toggle and existing warning behavior |
| Test mode / startup, goodbye, busy, question, done, error, fake music, short Focus, clear test scenes | `prefs.testMode`, `[data-test]` | Settings / General; retain explicitly labelled test tools, no fake real activity |
| Reset preferences | `[data-pref=reset]` | Settings / General; current draft semantics and bounded reset; never reset notes/history/integrations or immediate layer visibility |
| Start with Windows | `app:login-get/set`, `draft.login` | Settings / General; only applies on Save, no real startup changes in isolated tests |
| Restart / Quit | `app:restart`, existing quit action | Settings / General and tray; explicit immediate actions outside draft |
| Project/workspace chat/editor/task tools | `project-mode-*`, `project-agent-main.js`, `project-editor-main.js` | Keep existing layer entry points/IPC, including editor URI/extension compatibility; not a new module |
| AI provider setup, model, key clearing, Codex login/cancel/logout/test | `ai-settings:*`, existing provider implementation | Settings / AI & Chat → Advanced AI settings and project AI-settings action; retain trust checks, do not log credentials or perform unrequested live login |
| Activity history/search and daily counters | `settings-app:home`, monitor history | Overview; preserve genuine data, empty state when none |
| Layer positioning / display work-area behavior | `main.js` positioning and screen events | Preserve existing behavior; no invented position slider if none exists |

## Launch and visibility paths to audit

- `main.js`: island creation, ready-to-show, interactive/click-through handling.
- `tray-main.cjs`: tray click/open, `--settings`, second instance, restart and quit.
- `island-window-main.js`: Ctrl+Alt+T, crashed-renderer restoration. Foundation now targets the island, not first BrowserWindow.
- `extras-main.cjs`: Ctrl+Alt+1..6; renderer `tools-ui.js` and monitor listeners.
- `buddy-main.cjs`: grab, regrab, drop/park, flyHome/arrived, delayed return, debug-only startup.
- Renderer hover/blur/expand/collapse, project/chat navigation, file drag-enter, notification and monitor-driven reveals.
- OFF must retain the hidden island renderer/settings bridge and active tool state. Only explicit tray/dashboard Show re-enables it; other opening paths respect OFF.

## Intentionally retired or deferred

Original Robo styling/wardrobe/badges-as-shopping/paid activation are retired by the foundation. Keep old internal storage fields and compatibility names where harmless; do not erase saved data for visual cleanup. Mascot Studio, new mascot assets, new modules, new transparency/radius controls and automatic updating remain deferred.

## Validation progress

- Foundation source: note input persisted in isolated profile; Focus 5:00→4:49→Stop observed; restoration shortcut tested RED→GREEN.
- Foundation packaged: island/Settings/buddy loaded; Home and local manual-update page observed; isolated installer 204-file hashes matched.
- Redesigned navigation is implemented: canonical/legacy route tests preserve all nine module IDs and core flags. Source UI observed Overview, General settings and OFF→ON; Settings-only theme placement and Light preview verified; English-only supersedes the earlier language-selector direction. Other route/control checkboxes remain unverified until exercised.

- Current installed candidate: the project panel’s English empty state and Choose folder button were observed with a test-only keep-open flag in an isolated profile; selected-project and real interaction checks remain open. The current setup completion screen was inspected in off-screen screenshot mode.
- Current installed candidate: with a disposable selected project and a test-only keep-open flag, the project panel showed the project name unchanged and a synthetic click opened Advanced AI settings. Live AI, file editing and normal pointer interaction remain unverified.
- Connections: the installed dashboard IPC enabled and removed Claude and Codex hooks in isolated configurations, preserving unrelated values; live agent sessions remain unverified.
- Note and Focus: in the current packaged app, native UI automation entered a disposable note that autosaved and survived a separate launch, and started a Focus countdown that continued across layer OFF/ON. These isolated checks intercepted registry writes, global shortcuts and clipboard reads; they do not cover a complete Focus session or physical input.
- Clipboard and tray: the installed Clipboard switch and synthetic polling/copy paths were exercised; actual Windows clipboard capture remains unverified. A disposable tray item reached mocked open and drag-start handlers, and keyboard removal preserved the source file; native external drag/drop remains unverified.
- Spotify: disconnected state and synthetic device text were exercised in the installed app; real account connection, playback and device switching remain unverified.
- Settings and project: trusted installed-app Settings/project requests and foreign-window rejection were exercised. An isolated VS Code extension-host round trip completed a synthetic edit; Windows URI routing and real provider work remain unverified.
- Computer Use subsequently reconnected. Native automated Tab navigation showed visible focus on sidebar buttons; Enter opened Appearance and Space opened Modules. This is a scoped keyboard-navigation check, not physical-input or screen-reader validation.
