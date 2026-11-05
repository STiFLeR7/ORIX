# ORIX tests and historical TwoCode comparison — 2026-11-02

## Current ORIX execution

The 2026-11-05 RC checks resolved the intermittent layout test by measuring after the fixture reaches its current scroll end. A delayed native resize reproduced a stale scroll position, and the revised test also detected an intentionally reintroduced Save-bar overlap. Ten repeat runs passed. An asynchronous clipboard-write regression failed before the installed handler was changed to await completion. The handler now preserves history on failure and respects capture being disabled while a copy is pending. Workspace and fresh 156-file source copy each passed all 228 tests. Clean dependency installation reported zero vulnerabilities, ZIP/setup built, and all 231 installed files matched clean staging. The current hashes are recorded in RELEASE.md.

In an isolated Windows installation, the actual clipboard API captured a disposable sample and copied it through the installed history handler. All existing clipboard formats were retained in memory and restored afterward. Real Windows shortcut files pointed to the installed executable and Settings arguments. The startup handler registered and removed a real native startup value under a temporary test name. The test adapted the name used for native readback to protect the user's normal startup entry. A real login session remains pending. The note survived separate launches and upgrade. Installed Claude/Codex hook handlers restored controlled unrelated configuration after install/removal.

The current setup refused to replace a running real packaged ORIX process and left its files unchanged. After a normal quit, upgrade succeeded, retained the disposable profile and left no pending installation folders. A restart request through the real app handler exited the parent with code 0. Native relaunch was directed through the isolation launcher so the child retained the protected profile. The replacement packaged process loaded three windows and the saved note. This validates that scoped restart route.

Native file dragging remains pending. Computer Use identified an underlying terminal at the drag source and rejected input. A separate receiver process was closed after the attempt, and manual confirmation was requested. Automatic approval review separately rejected the command to remove the verified disposable installation and its two shortcuts with "blocked by policy". That command performed no deletion. Actual-login, system display/accessibility/notification checks, native dependency redistribution review and signing remain open. The user selected signed distribution.

On 2026-11-05, the user confirmed personally testing the Claude/ChatGPT sign-in, live Codex monitoring and dashboard items quoted from the prior status report. These checks are recorded as user-confirmed manual passes in the release checklist. Build identifier and individual test steps remain unspecified. The earlier agent-run authentication attempts and intermittent automated dashboard layout-test failure retain their historical results.

On 2026-11-05, an installed-app trace showed native `focus()` clearing the floating layer's topmost state during tool reveal. A new regression failed before moving the guarded topmost restoration after focus and passed afterward. In the rebuilt isolated installation, the real Ctrl+Alt+2 shortcut opened Spotify and native clicks reached its controls. This verifies the observed sequence, not every window-ordering or virtual-desktop scenario.

Spotify authorization completed using the vault-provided public Client ID. A signed-in Spotify web player provided the active device. ORIX displayed its actual track, progress and device. The installed backend passed pause/play/pause with settled live state checked after each command. Subsequent native ORIX Play and Pause clicks changed the browser player's corresponding controls. Playback was left paused. Closing the web-player tab removed the active device and produced Spotify's real "No active device found" failure. The earlier agent-run Claude/ChatGPT sign-in attempt ended before completion. The user's subsequent manual confirmation of those connections and live Codex monitoring is recorded above.

Fixed Spotify playback failures being hidden in the console and leaving the optimistic play/pause state incorrect. The player, swipe and home controls now share error handling that restores state and shows the error through the existing flash message. The focused regression failed before the fix; the latest full run passed 226 tests, and changed production scripts passed syntax checks. An earlier full run had one failure in `dashboard controls retain focus and remain visible` (Save bar overlap); it passed unchanged on rerun and remains an intermittent verification concern. Hook tests also failed while the live app occupied their service port and passed after it closed. The final ZIP/setup rebuilt, setup exited 0 into `.verification/spotify-errors-install-20261105`, and all 231 installed files matched staging by SHA-256. The latest error flash was not checked visually, and a fresh clean-source build after these changes remains pending. Artifact hashes are in [RELEASE.md](RELEASE.md).

On 2026-11-05, added regression checks showing that malformed tray JSON cannot be overwritten and that its load error reaches the empty tray renderer. They failed before the fix and passed afterward; all 223 workspace tests passed. The rebuilt setup exited 0 in isolation and all 231 installed files matched staging by SHA-256. A fresh 156-file source copy also passed all 223 tests, built ZIP/setup, and matched all 231 main staging files. In the isolated installed app, a deliberately malformed tray file produced a visible recovery message exposed as an accessibility alert; the fixture remained unchanged after normal exit. This does not test a screen reader, physical input or the clean setup installer.

After fixing startup with a tray file containing valid JSON of the wrong shape, the focused test reproduced the failure before the fix and passed afterward; all 220 workspace tests passed. ZIP/setup rebuilt and setup exited 0 into an isolated directory. A fresh 156-file source copy installed dependencies and Electron, passed all 220 tests and built ZIP/setup. All 231 current installed files and clean staged files matched main staging by SHA-256. The clean setup was built but not installed in this repeat.

The redesign is in progress; see [execution evidence](docs/ORIX-REDESIGN-VALIDATION.md) and [feature preservation map](docs/ORIX-FEATURE-MAP.md). The foundation audit reports zero vulnerabilities with Electron 44.10.1. Before visibility work, 42/42 tests passed (including packaging and recovery regressions); current results are recorded in the execution evidence.

At the foundation checkpoint, reproducible ZIP/setup generation and isolated installation passed: 204 staged/installed files matched by hash. The packaged dashboard and manual-update page loaded; source UI checks verified neutral layer rendering, notes written to the isolated profile, and Focus start/countdown/stop. Ctrl+Alt+T selected the wrong window; a regression test reproduced it and now passes after targeting the island. The foundation artifact was rebuilt with this fix. Later source changes require a fresh artifact before release.

Current checkpoint: 219/219 workspace tests passed on 2026-11-04. A focused Electron forced-colors test failed without button borders and passed after the fix. The latest ZIP/setup were rebuilt after the subsequent Save/Cancel layout fix; isolated installation exited 0 and all 231 installed files matched staging by SHA-256. A fresh 156-file clean-source copy passed all 219 tests after the Save/Cancel layout fix and matched both the clean and current installations by SHA-256. Runtime, font, SVG and upstream Codex, ripgrep and PCRE2 license and notice files are present; bundled native-component notices still require review. Installer success screens were compiled and rendered in English under English, Dutch and French Windows locales.

The staging test checks relative Markdown targets in five top-level packaged documents, including the new removal guide. The installed files matched staging hashes; external links and nested documents were not checked.

Native Computer Use subsequently recovered. In the current packaged app with an isolated profile, automated UI checks confirmed Focus continues across layer OFF/ON, Note autosave survives a separate launch, layer OFF persists, and a Light theme selection survives a separate launch. The harness intercepted registry writes, global shortcuts and clipboard reads; see the execution evidence for the individual test limits. These checks do not establish physical keyboard or screen-reader behavior.

Remaining: other redesigned UI and visibility end-to-end checks, live providers/Spotify, real clipboard/file-drop integration, Windows login startup, native notifications, multiple monitors/DPI and assistive technology. Independent source review and fixes are complete; final packaged workflow checks remain open. No public release has been made.

For reproducible hands-on checks and expected results, see the [manual test procedure](docs/ORIX-MANUAL-TEST.md). The procedure itself does not mark any workflow as passed.

Latest scope change: English only. Dutch language selection is removed; legacy Dutch source strings remain mapped to English for compatibility. Legacy Dutch preferences migrate while retaining other settings, and native/installer UI stays English under Dutch Windows locale. The rebuilt package was installed and inspected using the formerly Dutch profile: Overview and General were English, Light persisted, and no language selector was shown. Earlier bilingual test descriptions below are historical and superseded.

## Clean Save/Cancel layout source-candidate check — 2026-11-04

A fresh 156-file source candidate ran `npm ci`, installed Electron and passed all 219 tests; npm reported zero vulnerabilities in its audited dependency tree. It built ZIP/setup; the setup exited 0 into a disposable directory, and all 231 files matched clean staging and the current installed build by SHA-256. This does not verify byte-identical archives, physical keyboard use, actual Windows contrast or scaling, live services or redistribution rights.

## Clean connection-focus source-candidate check — 2026-11-04

A fresh 156-file source candidate ran `npm ci`, installed Electron and passed all 219 tests; npm reported zero vulnerabilities in its audited dependency tree. It built ZIP/setup; the setup exited 0 into a disposable directory, and all 231 files matched clean staging and the current installed build by SHA-256. This does not verify byte-identical archives, physical keyboard use, actual Windows contrast themes, live services or redistribution rights.

## Clean dashboard-focus source-candidate check — 2026-11-04

A fresh 156-file source candidate ran `npm ci`, installed Electron and passed all 219 tests; npm reported zero vulnerabilities in its audited dependency tree. It built ZIP/setup; the setup exited 0 into a disposable directory, and all 231 files matched clean staging and the current installed build by SHA-256. This does not verify byte-identical archives, physical keyboard use, actual Windows contrast themes, live services or redistribution rights.

## Clean status-accessibility source-candidate check — 2026-11-04

A fresh 156-file source candidate ran `npm ci`, installed Electron and passed all 219 tests; npm reported zero vulnerabilities in its audited dependency tree. It built ZIP/setup; the setup exited 0 into a disposable directory, and all 231 files matched clean staging and the current installed build by SHA-256. This does not verify byte-identical archives, actual Windows contrast themes, interactive startup, live services or redistribution rights.

## Clean forced-colors source-candidate check — 2026-11-04

A fresh copy of the 156-file source candidate ran `npm ci`, the Electron installer and all 218 tests successfully; npm reported zero vulnerabilities in its audited dependency tree. It built the Windows ZIP and setup. The setup exited 0 in a disposable directory, and all 231 files in clean staging and that installation matched the existing forced-colors installation by SHA-256. This does not verify byte-identical archives, real Windows contrast themes, interactive startup, live services or redistribution rights.

## Clean Settings preflight source-candidate check — 2026-11-04

A fresh copy of the 155-file source candidate ran `npm ci`, the Electron installer and all 216 tests successfully; npm reported zero vulnerabilities in its audited dependency tree. It built the Windows ZIP and setup. The setup exited 0 into a disposable directory, and all 231 files in clean staging and that installation matched the existing Settings-preflight installation by SHA-256. The archives were not compared byte-for-byte, and this check did not exercise an interactive launch, live services, Windows integrations or redistribution rights.

## Clean shutdown-fix source-candidate check — 2026-11-04

A fresh copy of the 155-file source candidate ran `npm ci`, installed Electron and passed all 212 tests. It built the Windows ZIP and setup; the setup exited 0 into a new disposable directory. All 231 files in both clean staging and the isolated installation matched the current main staging by SHA-256. This did not verify archive byte reproducibility, a live interactive launch, the Windows restart path or redistribution rights.

## Clean branded source-candidate check — 2026-11-04

A fresh copy of the 152-file candidate, including the ORIX logo assets, ran `npm ci`, the documented Electron installer and all 204 tests successfully. `npm ci` reported zero vulnerabilities in its audited dependency tree. The clean copy built the Windows ZIP and setup; the setup exited 0 into a new disposable directory. All 231 files in the clean staging and the isolated installation matched the current main staging by SHA-256. This check did not exercise an interactive launch, live services, real Windows integrations, byte-identical archives or redistribution rights.

## Clean source-candidate check — 2026-11-03

After adding the removal guide to the package, a fresh 148-file source copy installed dependencies with zero reported vulnerabilities, installed Electron 44.10.1 and passed all 201 tests. Its ZIP and setup built successfully; the clean installer exited 0, and all 228 installed files matched both clean and main staging by SHA-256. This did not verify actual removal, interactive startup or archive byte reproducibility.

A fresh 148-file source copy including the package-specific README installed dependencies with zero reported vulnerabilities, installed Electron 44.10.1 and passed all 201 tests. It built ZIP and setup; its isolated installer exited 0 and all 227 installed files matched both clean and main staging by SHA-256. ZIP bytes, interactive startup and live services were not checked in this repeat.

After the Claude status-line preservation fix, copied the current 147-file candidate into a fresh isolated folder. `npm ci` reported zero vulnerabilities, the documented Electron install produced version 44.10.1, and all 201 tests passed. The clean copy built ZIP and setup; its setup exited 0 in a separate isolated directory, and all 227 installed files matched both clean and main staging by SHA-256. This check did not launch the latest build interactively or test live services. The ZIP archives were not compared for byte-level reproducibility in this repeat.

Copied the 147-file public-source candidate into an isolated folder without recovered binaries or existing dependencies. The documented `npm ci` and Electron install command succeeded, the resulting Electron runtime reported 44.10.1, and all 198 tests passed. An instrumented, hidden Electron source launch using an isolated profile opened the desktop layer, Settings and context windows and exited 0; this was not an ordinary interactive `npm start` check.

The clean copy built ZIP and setup with the documented commands. All 227 staged files matched the main candidate by SHA-256, and the clean setup installed 227 files matching its own staging. The two ZIP archives were not byte-identical. Their 251 entries had the same order, CRCs, sizes and compression methods, and every raw compressed payload matched by SHA-256. Seventy-eight entries differed in ZIP timestamps and NTFS timestamp extra fields; byte-for-byte reproducibility was not established. No live accounts, native interaction, real profile, publication or signing were involved.

## Historical baseline below

The following comparison describes the recovered TwoCode build before ORIX changes. Its dependency findings and source-preservation statements describe that historical build, not the current ORIX working source.

## Verdict

The recovered build matches the original in the completed offline UI checks. No recovery-specific regression was found in those checks. Recovery integrity, installer rebuilding/installation, startup, and all 30 bundled automated tests also passed.

This is a scoped comparison, not a claim that every feature is identical. Live AI/Spotify/services, real clipboard capture, file-tray drag/drop, Windows login startup, multi-monitor behavior, and production updates remain unverified. The dependency audit still reports high-severity findings in Electron and Undici.

Application code was preserved: all 88 recovered application files remain present, with only `.gitignore` changed. The local test launcher and documentation are separate from that recovered code. Nothing has been published.

## Interactive comparison

Computer Use access succeeded after the user restarted ChatGPT. The following checks were performed against the original packaged app and the source-based rebuilt packaged app, one at a time, with separate test profiles.

| Flow | Original | Rebuilt |
| --- | --- | --- |
| Island Home and menu navigation | Opened and interacted with | Matching layout and navigation |
| Settings Home and Apps catalog | Rendered; bundled apps available | Matching screens and available apps |
| Light theme | Applied | Applied with matching rendering |
| Animation preference, Fast → Normal | Saved | Saved |
| Close with unsaved changes | Save / Don't save / Cancel prompt appeared | Same prompt appeared |
| Cancel close prompt | Settings stayed open with draft | Same behavior |
| Save draft | Unsaved-change bar disappeared | Same behavior |
| Don't save appearance draft | Settings closed | Same behavior |
| Wardrobe | Body/eye choices and task-earned outfits rendered | Same choices and progression labels |
| Note entry and autosave | Synthetic two-line note saved | Identical note saved |
| Note after full process restart | Saved text visible again in Note | Same text visible again |
| Light theme and Normal animation speed after restart | Persisted | Persisted |
| Focus 5-minute preset | Selected; started; visibly counted down; Stop returned to setup | Same behavior |
| Synthetic AI readout | Working → Question → Done → Error observed | Same states observed |
| Synthetic activity history | Question, Done, Error records persisted | Matching prompt/project/result/file-count records, apart from timing |

The synthetic note was `TwoCode verification note` followed by `Persist after restart.`. Its stored value was checked in both test profiles as well as observed through the Note UI after process restarts.

The AI checks used the app's existing General → Test mode buttons. Its hook view needs a connected hook configuration even for these scenes. Dummy hook settings were therefore prepared with the app's existing `createHub().install()` helper **only inside `.verification/<variant>/home/.claude/`**, using each packaged app's own module paths. No real Claude/Codex configuration was changed, no actual agent was launched, and no AI service was contacted. These results establish synthetic event-to-UI behavior, not real-provider integration. Test mode was not saved as a permanent preference; the rebuilt profile showed it off after restart.

Additional rebuilt-only observations: Clipboard showed its expected empty screen with clipboard reads suppressed by the test fixture. Tray navigation was attempted but the panel folded before its contents could be fully verified. Quit required the app's second confirmation click, then produced the normal close request, before-quit events, and window teardown. The inspector kept the process waiting for debugger disconnection; the remaining test process was stopped as harness cleanup. These are not original-versus-rebuilt parity claims for clipboard operations, file drop, or process exit codes.

The transparent island occasionally needed the native Raise action and hover activation before its controls could be used. Computer Use blocked attempted clicks that still belonged to an underlying window. Similar occlusion/pass-through behavior occurred with both packages; it was not classified as a recovered-source regression. Actual key-to-page behavior was exercised for Focus and Clipboard while the island was expanded. Ctrl+Alt+T targeting and shortcuts from every collapsed state are not fully verified.

## Automated, startup, and installer results

| Check | Result |
| --- | --- |
| Extracted installer files | 160 files independently decompressed, CRC-32 checked, and byte-compared |
| Recovered application files | 88 verified against the package; only `.gitignore` exclusions differ |
| JavaScript syntax | 48 files passed `node --check` during recovery |
| Literal local `require()` references | No missing local targets found |
| Packaged and development Electron executables | Identical bytes; Electron 44.5.1 |
| Original, source-development, and rebuilt startup | Version 1.2.0-beta.6; island, Settings, and buddy pages loaded |
| Original installer in isolated folder | Exit 0; all 160 installed files matched the extraction |
| Installer compilation from recovered C# source | Successful |
| Rebuilt installer in isolated folder | Exit 0; all 160 installed files matched the staged package |
| Native Windows PowerShell/C# bridge | Compiled and returned the expected JSONL error for a harmless unknown command; no windows read or controlled |
| Final bundled regression suite after UI cleanup | 30 passed, 0 failed, 0 skipped |
| Beta feature-pack state | `free: true`, six unlocked pack apps, empty locked list; foreign HTTPS license request rejected |
| npm audit | Two high-severity package findings: `electron` and `undici` |
| Captured UI-run diagnostics | No captured uncaught exception, failed load, preload error, renderer error, or renderer crash in the retained original/rebuilt UI logs |

Close all TwoCode instances before running the test suite. The app and the hook tests share port 47823. A run with the app open failed six hook tests; the suite passed after closing the app, including the final run after these UI checks.

## Test isolation and limits

The debugger bootstrap redirected app data and home lookup to separate project-local profiles, suppressed registry writes and real clipboard reads, and blocked the application's fetch calls and renderer HTTP(S) requests. Start menu files were redirected into the test app-data folders. It is not a full virtual machine. OS volume/Bluetooth observation and temporary global shortcut registration still ran. No account, startup-at-login setting, or normal user agent configuration was changed during the UI checks.

The original and rebuilt launches were packaged (`app.isPackaged === true`); direct source startup was development (`false`). The packaged self-install target was set to the test executable's existing folder to prevent migration into the normal installation. Development intentionally skips self-install and automatic update downloads.

The temporary launcher was adjusted to launch GUI processes without `windowsHide`; it continued to hide the application's own helper consoles as the original code specifies. It has a ten-minute session limit. One rebuilt test run reached that harness limit; the subsequent launch was used for persistence and Quit checks. This timeout is not a product crash.

The beta already unlocks its feature packs. Task-earned outfits still have achievement requirements, which do not constitute payment gates. This check does not establish that the original website-backed services will stay free or available. The code still contains its original `twocode.nl` backend and updater connections.

## Artifacts and provenance

- Original installer SHA-256: `cdc5e655ea25daa73423f7c20070b3f9ecc4fa4ffcd251fd37a03641f614eb5d`.
- Shared Electron executable SHA-256: `49b61a030a520fc36a4b8fa5cce53fb4e935a7bdbbe4b80e9222f598e49cc7fa`.
- `dist/TwoCode-Setup-1.2.0-beta.6.exe`: 162,898,432 bytes; SHA-256 `c0e70efbb99d7c0d54945bc5922a1f1ab18354f9c4502bd57612c35f46fc04c1`.
- `dist/TwoCode-Windows-1.2.0-beta.6.zip`: 162,822,628 bytes; SHA-256 `046d81dcea7d18c2a39f8655029db51941eecf9a8094f1dbe11a4e3e55d03b09`.
- `.verification/baseline-ui-first.log`, `baseline-ui-restart.log`, `baseline-ui-scenes.log`: original package UI diagnostics.
- `.verification/rebuilt-ui-first.log`, `rebuilt-ui-restart.log`: rebuilt package UI diagnostics.
- `.verification/ui-history-comparison.json`: asserted synthetic history comparison.
- `.verification/ui-results.json`: recorded interactive results and limitations.
- `.verification/smoke-results.json`: original/source/rebuilt startup assertions.
- `.verification/npm-audit.json`: complete audit findings.
- `.verification/launch.cjs`: retained temporary startup/isolation launcher.
- `.verification/original-installed/` and `rebuilt-installed/`: isolated installer outputs.

Computer Use screenshots/accessibility observations are in the task transcript; no filesystem screenshot gallery was created. `dist/`, `.verification/`, and `recovered/` are excluded from source control. Test profiles contain generated local hook tokens and must stay private and excluded.

The Windows ZIP was staged from the original runtime with the 88 project-root application files overlaid. It excludes development `node_modules`, test profiles, and recovery documentation. Compression and compiler metadata differ from the original, so matching installer hashes are not expected. These files are local test builds, not a prepared public release.

## Reproduce

With Windows and Node.js, from the project folder:

```powershell
npm ci
node node_modules/electron/install.js
node --test tests/monitor.test.cjs tests/windows-check.test.cjs tests/claude-code-hooks.test.cjs tests/extras.test.cjs tests/auto-update.test.cjs
```

The locked Electron package has an explicit runtime installer; `npm ci` alone did not download its executable. The original `npm test` script omits the auto-update tests, which are included above.

`npm start` runs the source normally. On this machine the retained temporary launcher can run isolated sessions with `node .verification/launch.cjs baseline --settings` or `node .verification/launch.cjs rebuilt --settings`. Do not run both at once. The launcher is a local test artifact, not committed project tooling.

```powershell
node tools/make-setup.cjs dist/TwoCode-Windows-1.2.0-beta.6.zip
```

The installer supports `--quiet --no-start --dir <disposable-folder>`. Use a new folder under `.verification/`: the installer replaces that target, so it must not contain real work.

## Remaining before publication

1. Resolve the high-severity Electron/Undici findings and repeat affected checks on the updated dependencies. No automatic dependency fix was applied while establishing the original baseline.
2. Test real Claude Code/Codex connections, permission/reply/notification flows, Spotify, and other optional services using authorized test accounts and synthetic content.
3. Test file-tray add/open/remove, real clipboard capture/copy, project tools with disposable files, buddy drag/context behavior, language changes, multi-monitor placement, login startup, and installer replacement of an existing installation.
4. Verify signed update download, invalid signatures, interruption, rollback, and the intended public project's update service. Existing unit tests do not replace a full packaged update exercise.
5. Define the public license text/attribution, project identity, service dependencies, and update-signing ownership. The recovered manifest declares ISC, but the app directory did not include application-level license text. No release has been published.
