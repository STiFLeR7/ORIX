# ORIX Open-source Foundation Implementation Plan

> **For agentic workers:** Use the existing project patterns; test nontrivial behavior changes before implementation. Tasks have disjoint file ownership for parallel execution.

**Goal:** Prepare a free, independent ORIX build with patched dependencies, explicit ISC licensing, and the supplied desktop-layer brand direction.
**Architecture:** Preserve existing Electron IPC/tool interfaces. Disable legacy services at their main-process boundaries, keep updates manual, and change operating-system identity independently of renderer compatibility names. Replace visible pet imagery with a neutral ORIX mark while retaining core tools.
**Tech Stack:** Electron 44, CommonJS, Node test runner, HTML/canvas, Windows C# installer.
**Spec:** ../specs/2026-11-02-orix-foundation.md

## Global Constraints
- ORIX, fully free; ISC; version 0.1.0-beta.1.
- Separate ORIX app/data/install/local-hook identity; no modifications in recovered/.
- No original backend or updater requests; no new secrets or .env files; no publication.
- UI/UX workflow redesign beyond rebranding is deferred.

## Review Focus
- Existing saved legacy connections must not cause network requests or expose old tokens.
- No updater action or app-quit path may install an old staged package.
- ORIX hook install/uninstall must preserve existing TwoCode/custom hooks and status lines.
- Missing Spotify client configuration must fail clearly before browser/network use.
- Rebranding must preserve notes, Focus, AI status IPC, keyboard interaction and accessible settings controls.

### Task 1: Release behavior and identity (root)
Files: package.json/lock, main.js, companion-service.cjs, auto-update.cjs, settings-app-main.cjs, self-install.cjs, tray-main.cjs, claude-code-hooks.cjs, twocode-reply/statusline.cjs, tools/make-setup.cjs, tools/setup/Setup.cs, tests/release.test.cjs and hook tests. Remove obsolete publisher/signing entry points and old update public key after checking callers.
- [ ] Write/run failing behavioral tests for offline legacy account/update/news behavior and isolated hook ownership.
- [ ] Apply minimum main-process changes, ORIX app identities and safe optional Spotify client ID handling.
- [ ] Upgrade Electron to latest verified 44.x and refresh compatible Undici; run npm audit and full tests.
- [ ] Build and smoke-check the ORIX artifact; do not reuse the vulnerable recovered runtime as the new release runtime.

### Task 2: Renderer brand and icons (frontend worker)
Files: renderer HTML/JS/CSS, new brand renderer if needed, tools/make-icon.cjs, assets (excluding fonts). Excludes main-process .cjs and package metadata.
- [ ] Replace visible TwoCode/Robo identity with ORIX and neutral layer imagery; navy/green palette.
- [ ] Remove paid-pack shopping/activation copy and original website/download links; render a manual-update News state using {ok:true,version,releases:[],manual:true}.
- [ ] Retire pet-specific visible pages/controls without breaking core features; retain compatibility IPC/file names.
- [ ] Generate non-mascot icons using existing icon tooling and verify renderer syntax and a focused mark self-check.

### Task 3: License and documentation (docs worker)
Files: LICENSE, THIRD_PARTY_NOTICES.md, README.md, LEES-MIJ.md, UPDATES.md, RELEASE.md. Excludes historical RECOVERY.md/TESTING.md and planning files.
- [ ] Add standard ISC license, Copyright (c) 2026 ORIX contributors; preserve original attribution in notices and separate third-party font/runtime licenses.
- [ ] Replace original distribution/support instructions with accurate ORIX setup/manual-update/free-feature documentation.
- [ ] Record service limitations and pending public repository/signing/live tests; no invented download/support URL.

### Integration and verification (root)
- [ ] Review worker diffs, run full tests/audit/syntax and patched ORIX startup/targeted UI checks.
- [ ] Run one independent code review; fix material issues and verify again as needed.
- [ ] Update release/testing documentation with evidence and remaining limits; log Waypoint last.

Execution ruling: user explicitly authorized resolving release blockers and ORIX rebranding; execute continuously. This folder has no Git repository, so work in place with the untouched recovered package as the source baseline; no worktree is created. Keep the progress ledger in .verification/orix-progress.md. No remote push or publication is authorized.
