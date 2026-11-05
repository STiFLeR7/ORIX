# ORIX release checks

## Windows beta.3 — 2026-11-05

Version 0.1.0-beta.3 packages the Windows Codex hook fixes found during beta.2 validation. It quotes the stdin argument, serializes lifecycle callbacks and upgrades older ORIX hook definitions while preserving unrelated hooks. Four regression cases and all 234 workspace tests pass. Clean hosted Windows [run 41992769011](https://github.com/STiFLeR7/ORIX/actions/runs/41992769011) passed all 234 tests and built ZIP/setup from release commit `d3ea0c22925a22f3659d4cc15cab48135aa6efe3`. The earlier [run 41991411203](https://github.com/STiFLeR7/ORIX/actions/runs/41991411203) passed 233 tests for the first fix revision.

The final setup installed successfully in a new isolated directory. All 193 installed files matched staging, and all 11 native files matched the reviewed beta.2 payload. Startup upgraded the disposable profile's legacy hooks automatically and retained its note. A live request through the installed beta.3 Codex runtime and reviewed, session-scoped installed hook definitions produced an exact reply, ordered SessionStart/UserPromptSubmit/Stop/SessionEnd events, Ready → Working → Done, a completed history entry and a Windows notification show event with no failure event. The isolated hooks were removed and ORIX quit normally afterward. The default user hooks file and authentication remained outside the fixture.

The [beta.3 release](https://github.com/STiFLeR7/ORIX/releases/tag/v0.1.0-beta.3) supplies the unsigned setup, portable ZIP, matching third-party source supplement, demo and checksums. The installer SHA-256 is `98862bcf5e4b3a5894456f274d60b68f31b1c0b01d67869247ada4b37f7fec28`. Its corresponding native source revisions and dependency versions match beta.2. [Codex hook behavior](https://developers.openai.com/codex/hooks)

Claude Code and ORIX ChatGPT live replies remain pending sign-in, which the owner deferred. Live checks used reviewed, session-scoped ORIX hooks and the existing account. A malformed pre-existing user hooks file was later repaired by merging its legacy top-level SessionStart group into the nested hook map while retaining the existing groups and saving an exact backup. The packaged Codex parser then loaded 11 hooks with zero parse warnings. Users must review new or changed hook definitions through `/hooks`. The release remains unsigned while SignPath's reply and enrollment are pending. Other remaining Windows checks retain the scope described in the beta.2 follow-up.

## Beta.2 follow-up validation — 2026-11-05

The packaged, voice-free Codex executable returned the expected live reply using the existing CLI account. ChatGPT's ORIX-specific runtime reported signed out in both the previous test profile and legacy user profile. Claude Code also reported signed out. The owner chose to continue available checks, so fresh Claude and ChatGPT replies remain pending.

Live monitoring exposed two hook defects. PowerShell rejects the unquoted `@-` argument, and an asynchronous Stop callback can be cancelled when the CLI session ends. The source now quotes the argument, runs Stop/SessionEnd callbacks synchronously and upgrades older ORIX commands at hub startup while preserving unrelated hooks. Three regressions cover these changes. All 233 workspace tests pass with the isolated app stopped so its server does not occupy the test port.

Using the published beta.2 app and runtime with corrected, reviewed, session-scoped hook definitions, a real request produced Ready → Working → Done, all four lifecycle events, a completed activity-history entry and a Windows notification `show` event without a failure event. This validates the corrected command configuration. **The published beta.2 EXE and ZIP still contain the original hook commands. A rebuilt follow-up installer is required to distribute the fix.** Codex requires users to review and trust new or changed hooks through `/hooks`. A malformed pre-existing user hooks file was reported by Codex during testing and was left intact.

The Windows removal check verified every installed file against staging, quit ORIX normally, removed the disposable installation's 193 files and two target-checked shortcuts, and retained the saved note unchanged. Reinstallation from the original beta.2 setup exited 0, and the installed note API read the retained text. This covers isolated Windows filesystem removal and reinstallation, including redirected shortcuts and hook settings. Default-profile cleanup and notification-registration cleanup remain outside that check.

The native dashboard and accessibility tree were inspected at the machine's current 125% display scaling. Transparent-layer input was again rejected as belonging to the underlying Explorer window after activation and one retry. Native file drag/drop remains pending. An actual Windows login cycle, other system DPI settings, Windows high contrast and an actual screen reader still require a dedicated test session. SignPath's thread and sender search, including filtered mail, contained no reply on 2026-11-05.

## Windows beta.2 — 2026-11-05

The owner requested a downloadable installer and refreshed repository presentation. Version 0.1.0-beta.2 is published with an unsigned Windows 10/11 x64 installer and portable ZIP, a 60-second demo, SHA-256 checksums and a third-party source ZIP. All five uploaded asset sizes and SHA-256 digests matched the local files, and the public installer URL returned HTTP 200. SignPath acceptance and a signing certificate remain pending.

The package excludes Codex's unused real-time voice payload and Electron's app-local D3DCompiler. It retains the text Codex runtime/helpers and uses the Windows system D3DCompiler. An isolated app-server check passed initialize, account/read and thread/start. A separate Electron check decoded MP3 with a modified compatible FFmpeg DLL and initialized WebGL without the app-local D3DCompiler. The release's source ZIP supplies the pinned FFmpeg source and Electron/Chromium build material and notices. A full FFmpeg source rebuild was not performed.

All 230 workspace tests and the hosted Windows [run 41986461561](https://github.com/STiFLeR7/ORIX/actions/runs/41986461561) passed. That run built ZIP/setup from release commit `dd39e057c0b6fbf8d0b83f7b1556d91467ba4da4`. The beta.2 setup installed successfully into a new isolated folder with `--quiet --no-start`. All 193 installed files matched staging by SHA-256, and all 11 native files matched their upstream dependency copies. This installer check did not launch the app. Prior live integration and Windows observations below retain their original scope. Remaining actual-login, native drag/drop, system DPI and screen-reader checks are recorded in the execution ledger.

Release assets are listed at [v0.1.0-beta.2](https://github.com/STiFLeR7/ORIX/releases/tag/v0.1.0-beta.2). The exact download hashes are supplied as `SHA256SUMS.txt` with those assets. [Native review](docs/NATIVE-REDISTRIBUTION.md)

## Earlier beta.1 checks

ORIX is a free, ISC-licensed desktop layer for Windows, based on recovered TwoCode 1.2.0-beta.6. This first independent beta includes the four-section dashboard redesign, Settings-only theme controls and English-only interface, hide-only layer switch, shared appearance system, unlocked tools, independent app identity, patched dependencies, and removal of original remote update/news/account defaults. Execution and final validation remain in progress. The selected ORIX aperture logo is integrated; visual Windows and small-icon validation remain open.

**Clipboard verification:** The isolated installed app captured a disposable text from the real Windows clipboard and copied it back through its history handler. The previous clipboard contents were retained in memory and restored after the check.

This checklist records required release work, not a declaration that the beta is production ready. See [TESTING.md](TESTING.md) for executed checks and remaining limitations.

No application uninstaller was identified in the current package. A [provisional manual removal procedure](docs/ORIX-REMOVAL.md) is documented; it has not been verified end to end on a real Windows profile.

The local Windows artifacts are unsigned. The ISC-licensed source and [source preview release](https://github.com/STiFLeR7/ORIX/releases/tag/v0.1.0-beta.1) are public. Windows binary downloads remain pending [native redistribution requirements](docs/NATIVE-REDISTRIBUTION.md), signing and final Windows checks. See [the execution ledger](docs/ORIX-REDESIGN-VALIDATION.md) and [public-source review](docs/PUBLIC-SOURCE.md).

## Published source checkpoint — 2026-11-05

The hosted Windows [run 41981139758](https://github.com/STiFLeR7/ORIX/actions/runs/41981139758) passed all 228 tests and built ZIP/setup at `a2ad065a61eeadb9bc2c70b15d84f3dbf12df84b`, tagged `v0.1.0-beta.1`. CI exposed an installer path-alias defect. Normalizing the running executable path fixed it, with the short-path regression observed failing and then passing locally. The editor concurrency fixture now uses the same native path resolution as production. Local ZIP/setup were rebuilt afterward, with hashes below. Prior installed-app observations predate this setup fix and the latest notice update.

The owner confirmed GitHub MFA. The SignPath application form remained blank, so an approved application/eligibility inquiry was sent from the Codex inbox to SignPath on 2026-11-05. The source preview supplies source archives. It does not resolve the Foundation's requirement for an existing Windows binary release. A reply and completion of the native distribution requirements remain pending.

**Hook preservation:** New hook installations record originally empty event lists and empty Claude status-line values in the ORIX profile for restoration. An installation created by an older build without the relevant record cannot reconstruct those original values; inspect backups before removal.

**Packaged documentation:** The installed build uses a separate concise README and includes the provisional removal guide. Relative Markdown links in the five top-level shipped documents are covered by the staging test; external URLs and nested documents were not checked by that test.

## RC checkpoint — 2026-11-05

- [x] Resolved the intermittent layout test. The fixture could measure after layout changed its scroll range. It now measures at the scroll end and asserts that prerequisite. Ten repeat runs passed, and an intentional absolute-positioned Save-bar regression was rejected.
- [x] Fixed asynchronous clipboard copy acknowledgment. A rejected Windows write now returns failure and preserves history order. Disabling capture during a pending copy keeps history cleared.
- [x] Workspace and fresh 156-file source copy each passed all 228 tests. Clean dependency installation reported zero vulnerabilities. Clean ZIP/setup built successfully, and all 231 installed files matched staging by SHA-256.
- [x] Checked actual Windows shortcut targets, real clipboard capture/copy, note persistence across launches, native startup registration/removal under a temporary value name, and isolated hook install/removal preserving unrelated settings.
- [x] The installer safely refused an upgrade while the real packaged app was running. After normal quit, upgrade succeeded and preserved the test profile.
- [x] The real app restart handler exited its parent with code 0. Native relaunch was directed through the isolation launcher, and the replacement packaged process loaded all three windows and the saved note. This covers the isolated restart route.
- [ ] Complete file-tray drag/drop. Computer Use rejected input because it identified an underlying terminal at the source point. The receiver recorded no successful drop. Manual confirmation has been requested.
- [ ] Complete installation-directory and shortcut removal. Automatic approval review blocked the checked recursive removal command before execution with the reason "blocked by policy". The disposable installation remains available for manual removal verification.
- [ ] Complete actual Windows login, system DPI/high-contrast, screen-reader and notification-delivery checks. Current process-level and automated checks cover a narrower scope.
- [ ] Complete native dependency redistribution review and signing. The user selected signed distribution. Signing identity setup is pending.

The current artifact version remains 0.1.0-beta.1. Binary distribution awaits the open checks above and publication approval.

## Prior checkpoint — 2026-11-05

`npm audit --audit-level=low` reported zero vulnerabilities on 2026-11-04. This is a point-in-time advisory check of the npm dependency tree, not a review of every bundled native component or its redistribution terms.

The latest full workspace run passed 226 tests after restoring layer topmost state after native focus and making Spotify control errors visible while restoring the previous play/pause state. ZIP/setup rebuilt successfully. Isolated setup exited 0 and all 231 installed files matched staging by SHA-256. Live Spotify authorization, track/device display and native ORIX Play/Pause were verified in the preceding focus-order build. The installed backend also passed live pause/play/pause. Playback was left paused. The final error-message change has automated coverage and awaits a visual check. On 2026-11-05, the user confirmed their own manual testing of Claude/ChatGPT sign-in, live Codex monitoring and dashboard behavior. One earlier automated dashboard Save-bar overlap test failed and passed unchanged on rerun. Its intermittent cause remains unresolved. See the execution ledger for scope and earlier Focus, Note, appearance and visibility checks.

### User-confirmed manual checks — 2026-11-05

- [x] Claude sign-in and connection, verified by the user.
- [x] ChatGPT sign-in and connection, verified by the user.
- [x] Live Codex monitoring, verified by the user.
- [x] Dashboard behavior, verified by the user.

The user supplied an overall confirmation. Build identifier and individual test steps remain unspecified. The intermittent automated layout-test failure remains tracked separately.

## Previous local checkpoint — 2026-11-03

201/201 workspace tests, 76 first-party/inline syntax checks before the latest changes plus changed-script syntax checks, npm audit reported zero vulnerabilities on 2026-11-03. Electron 44.10.1. ZIP and setup compiled; isolated installer exited 0 and 228 installed files matched staging hashes. ISC, runtime, Inter, SVG and upstream Codex, ripgrep and PCRE2 license and notice files are present; bundled native-component notices still require review. Independent source review and its persistence/accessibility fixes are complete; final packaged UI/provider/OS/accessibility checks remain open. English-only interface verified in an earlier installed build using a formerly Dutch test profile; Light theme was retained and no language selector was present. Final workflow checks and review remain required.

| Unsigned local artifact | SHA-256 |
| --- | --- |
| ORIX-Windows-0.1.0-beta.1.zip | `99b5649f10d9882747c6fbdba95840df60ce9af206f2c1b20037950122596a01` |
| ORIX-Setup-0.1.0-beta.1.exe | `3edd2acd0d6e13619c38d10aabe247ae4d37a8e09d247352403f0547937cc775` |

## Redesign evidence and remaining checks

| Requirement | Current evidence | Still needed |
| --- | --- | --- |
| Dashboard and visual direction | Four destinations implemented, preview direction approved and some packaged views inspected. User confirmed manual dashboard testing on 2026-11-05. The layout-test scroll prerequisite was corrected and repeat and mutation checks passed. | Verify actual Windows DPI combinations and the selected ORIX logo in Windows and tray contexts. |
| Desktop layer OFF | Automated lifecycle tests and isolated observations cover persistence, hotkeys, a running Focus timer, a simulated pending AI plan and approval, a mocked pending project request, and a delayed note save across OFF/ON and restart. Native automated UI checks also observed Focus continuing across OFF/ON and OFF persisting across a separate launch. | Check real pending AI work and other delayed callbacks. |
| English and appearance | English migration, settings and installer locale tests pass; an earlier installed build was checked with a formerly Dutch profile. | Check latest packaged views, system theme, high contrast, keyboard and screen-reader behavior. |
| Existing tools and integrations | Focus, Note, live Spotify and user-confirmed Claude/ChatGPT and Codex checks are recorded. The latest isolated installed app passed real Windows clipboard capture and copy with prior contents restored. | Complete native tray drag/drop and visually verify the latest Spotify error message. |
| Local package and source | Workspace and fresh 156-file source copy passed 228 tests. Clean ZIP/setup built, isolated installation and upgrade succeeded, and 231 installed files matched staging. A real running packaged process caused setup to refuse upgrade safely. Scoped native startup and restart checks passed. | Finish actual-login and removal checks, native redistribution review, signing and publication approval. |

The detailed observations, dates and limits are in the [execution ledger](docs/ORIX-REDESIGN-VALIDATION.md). An unchecked or unavailable real-world check is not a pass.

## Validate the candidate

- [ ] Confirm `package.json`, lockfile, displayed version, and artifact names agree on 0.1.0-beta.1.
- [ ] Install with Node.js 22.12 or newer: `npm ci`, then `node node_modules/electron/install.js`. Confirm the packaged runtime is Electron 44.10.1 rather than the recovered 44.5.1 runtime.
- [ ] Run `npm test`, JavaScript syntax checks, and `npm audit`; record exact results and unresolved advisories in TESTING.md.
- [ ] Launch ORIX with the patched runtime and inspect the island, settings, neutral mark, keyboard access, notes, clipboard, Focus, and free feature access.
- [ ] Verify no original account/news/update requests or staged update installation occur, including with legacy saved configuration.
- [ ] Verify ORIX installs, stores settings, and installs/removes hooks independently while preserving existing TwoCode/custom hooks.
- [ ] Test real AI monitor connections, Windows accessibility and notifications, and optional Spotify PKCE with a configured public client ID. Document unavailable accounts, unsupported app versions, and untested live flows.

## Package and distribute

Free signing preparation is tracked in [SIGNING-SETUP.md](docs/SIGNING-SETUP.md), with the [Code signing policy](docs/CODE-SIGNING.md). The public Windows workflow passed its first complete build. Source and a source preview are published. SignPath acceptance and the Windows binary-release prerequisite remain pending.

- [x] Build `ORIX-Windows-0.1.0-beta.1.zip` and `ORIX-Setup-0.1.0-beta.1.exe` using the project's local packaging tools. Redesigned candidate rebuilt and installed in an isolated folder; rebuild again after any shipped-file changes.
- [ ] Confirm clean install, launch, quit, startup shortcut, manual upgrade, and uninstall on Windows. Expected installation: `%LOCALAPPDATA%\Programs\ORIX`; settings shortcut: **ORIX Settings**.
- [ ] Inspect archive contents for LICENSE, THIRD_PARTY_NOTICES.md, Inter's license, Electron's LICENSE / LICENSES.chromium.html, and applicable dependency notices. Exclude local credentials, recovery artifacts, and verification scratch files.
- [x] Check relative Markdown links in the five top-level packaged documents without including the checksum-bearing release checklist or excluded recovery files. External links and nested documents were not checked.
- [x] Publish reviewed source and a source preview in the user-supplied repository [STiFLeR7/ORIX](https://github.com/STiFLeR7/ORIX). Windows binary assets remain pending the documented release gates.
- [ ] Establish and verify ORIX code signing and artifact checksums before public distribution. Do not reuse the recovered updater's identity or keys. Developer credentials are handled through the vault MCP.
- [x] Obtain explicit authorization for source publication. The owner authorized it on 2026-11-05. Public source and the source preview are available.

The earlier 30 passing recovered-source tests are historical evidence for the original baseline. They do not validate this release's changed behavior or UI. Automated tests and local smoke checks do not establish live provider compatibility; preserve these distinctions in release notes.
