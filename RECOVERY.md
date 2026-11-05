# TwoCode source recovery

Follow-up startup, build, installer, and dependency results are in [TESTING.md](TESTING.md). Full interactive equivalence remains unverified.

Recovered on 2026-11-02 from `D:/EXE Files/TwoCode-Setup.exe` without executing the installer or launching TwoCode.

## Result

The installer is a .NET wrapper containing an embedded ZIP at byte offset 3660. The ZIP includes an Electron runtime and loose, readable application source under `TwoCode/resources/app/`. Decompilation was unnecessary for the recovered application files; even the C# installer source was included.

- Application: TwoCode `1.2.0-beta.6`.
- Bundled Electron runtime: `44.5.1` (from its `version` file).
- Installer size: 158,815,232 bytes.
- Installer SHA-256: `cdc5e655ea25daa73423f7c20070b3f9ecc4fa4ffcd251fd37a03641f614eb5d`.
- Extracted package: 160 files, 386,547,638 bytes, retained in `recovered/TwoCode/`.
- Application source and assets: 88 files, 1,721,791 bytes, copied to this project root.
- The root `.gitignore` adds exclusions for `/recovered/` and `/.verification/`; all other recovered application files are byte-for-byte copies.

`recovered/` is the untouched extraction baseline and is excluded from source control. The original installer remains at its original path. The recovered `README.md`, `LEES-MIJ.md`, and `UPDATES.md` retain their original content and claims; they have not been rewritten as a new release announcement.

## Where to work

| Area | Entry points |
| --- | --- |
| Electron application | `main.js`, `preload.js` |
| Island and mascot | `mascot.html`, `island-window-main.js`, `island-window-ui.js`, `twocode-fun.js` |
| AI monitoring and integrations | `ai-monitor-main.cjs`, `ai-monitor-model.cjs`, `ai-monitor-ui.js`, `claude-code-hooks.cjs`, `chatgpt-provider.js` |
| Project workflows and editor | `project-mode-main.js`, `project-agent-main.js`, `project-editor-main.js`, `vscode-editor/` |
| Settings and desktop buddy | `settings-app-main.cjs`, `settings-app.html`, `buddy-main.cjs`, `buddy.html` |
| Windows accessibility bridge | `windows-ai-access.cs`, `windows-ai-access.ps1` |
| Installation and updates | `self-install.cjs`, `auto-update.cjs`, `auto-update-core.cjs`, `tools/setup/Setup.cs` |
| Tests | `tests/*.test.cjs` |

## Verification performed

- Independently read the ZIP central directory, decompressed every file, checked its length and CRC-32, and compared its bytes with the extracted files: 160/160 passed.
- Compared each application file in the project root with its archive entry: 88/88 passed, allowing only the documented `.gitignore` append.
- Ran `node --check` on all 48 recovered `.js` and `.cjs` files: passed.
- Checked literal relative `require()` references for missing local targets: none found. This does not cover dynamic references or external dependencies.
- Ran all five bundled test files with Node.js v24.11.0: 30 passed, 0 failed, 0 skipped.
- A narrow scan for private-key headers and common OpenAI/GitHub token prefixes found no matches. This was not a full secrets or security audit.

Run the same test suite without installing dependencies:

```powershell
node --test tests/monitor.test.cjs tests/windows-check.test.cjs tests/claude-code-hooks.test.cjs tests/extras.test.cjs tests/auto-update.test.cjs
```

The original `npm test` script omits `tests/auto-update.test.cjs`; the command above includes it.

## Development startup

The recovered manifest and lockfile are present. The original documented development path is:

```powershell
npm ci
npm start
```

These commands have not been run as part of recovery. Dependency installation, GUI startup, real Windows accessibility, external AI integrations, and a rebuilt installer remain unverified.

Do not use `recovered/TwoCode/TwoCode.exe` as an isolated development launch: its packaged startup can copy the app into `%LOCALAPPDATA%/Programs/TwoCode` and hand over to that installation. The packaged updater can contact `https://twocode.nl/wp-json/twocode/v1/app-update` and install signed updates. The source guards disable self-install and automatic downloads in development mode. Other configured integrations may still contact their services when used.

## Limits and next work

This recovers what this installer shipped, not the complete former repository. Git history, CI configuration, website/server source, and any files excluded from the package cannot be reconstructed from this extraction. The recovered publishing tools reference a separate website backend and an external update-signing private key; that backend source and private key were not supplied by this recovery. No credentials were retrieved and no publishing tools were run.

The beta's `license-main.cjs` already reports all feature packs unlocked. It was preserved without modification. `package.json` declares `ISC`, but no application-level license text was found in the recovered app directory; the runtime and Inter font have their own license files. This session has not selected a license, created a public repository, or published a release.

Next: verify development startup, decide the public project's identity and license, and define its update/distribution ownership before publishing. Keep the recovered baseline available for comparison.
