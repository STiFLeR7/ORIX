<p align="center"><img src="assets/icon-256.png" width="120" alt="ORIX desktop layer mark"></p>

<h1 align="center">ORIX</h1>
<p align="center"><b>Your operating system, within reach.</b><br>A desktop layer for Windows.</p>

ORIX brings AI session status, desktop tools, notes, clipboard history, focus sessions, and optional Spotify controls into a compact desktop layer. Core tools and feature packs are fully free, with no TwoCode account, activation key, or paywall. The selected ORIX aperture mark is integrated into the local app and Windows icon assets.

This is **0.1.0-beta.1**, the first independent ORIX beta, based on recovered TwoCode **1.2.0-beta.6**. Its dashboard redesign is in progress. See [recovery provenance](RECOVERY.md), [current execution evidence](docs/ORIX-REDESIGN-VALIDATION.md), and [release checklist](RELEASE.md).

## Run from source

Use Windows 10 or 11, Node.js **22.12 or newer**, npm, and Windows PowerShell 5.1. From this project folder:

```powershell
npm ci
node node_modules/electron/install.js
npm start
```

The explicit install step downloads the Electron runtime if dependency installation skipped it. The ORIX dependency lock selects Electron 44.10.1; do not launch the recovered runtime as the ORIX release.

```powershell
npm test
npm run check:windows
```

The first command runs the automated suite. The Windows check inspects supported AI window accessibility; it does not establish that every browser, provider, or desktop app works.

## Use ORIX

- **Overview** shows activity, connections and the desktop-layer ON/OFF switch. OFF hides the layer while enabled tools and integrations keep running.
- **Appearance** controls motion and status colors; **Modules** manages the existing tools; **Settings** contains General, Connections, AI & Chat, Updates and About.
- Choose **Light, Dark or System** in **Settings → General**. Changes preview in the dashboard; Save commits them and Cancel restores saved choices. ORIX uses English only; older Dutch interface preferences migrate to English without changing your notes, chats or other saved data.
- **Ctrl+Alt+T** recovers the layer while ON; **Ctrl+Alt+1–6** selects a tool while ON. Turn it back ON from Overview or **Show desktop layer** in the tray.
- Open **ORIX Settings** from the island, tray or Start menu to configure tools and AI connections.
- Enable Claude Code or Codex monitoring in **Settings → Connections** to follow local sessions. Window monitoring requires an open, readable conversation window; UI changes can affect recognition.
- Quit from the island's power button or the tray menu. Optional startup behavior is available in the tray menu.

Packaged ORIX uses its own application identity, settings, hooks, and `%LOCALAPPDATA%\Programs\ORIX` installation. It does not migrate TwoCode settings automatically. The original recovered runtime stays local for historical comparison and is excluded from source releases.

## Optional services and privacy

The [privacy policy](docs/PRIVACY.md) describes local data, network destinations, provider policies and removal controls.

Core tools require no original TwoCode service. ORIX does not request the original update, news, or account endpoints. Updates are [manual](UPDATES.md).

The Clipboard module is enabled by default. While enabled, ORIX checks for copied text and keeps up to eight entries in memory; this history is not written to disk. To stop collection and clear ORIX’s in-memory history, switch **Clipboard** off in **Modules** and press **Save**. This does not clear the Windows clipboard. Hiding the desktop layer does not disable enabled modules.

AI providers and Spotify require their own access and may charge for accounts, subscriptions, or API usage. AI requests, screenshots you ask an AI to inspect, and enabled integrations can send information to the selected provider. Local status monitoring does not make those external services offline or free.

Direct Spotify login uses PKCE and requires a public client ID supplied as `ORIX_SPOTIFY_CLIENT_ID` in the launch environment. The client ID is public configuration, not a secret. Developer commands needing credentials must use the configured vault MCP; never place API keys in project files.

## Distribution and license

The open-source repository is [STiFLeR7/ORIX](https://github.com/STiFLeR7/ORIX). Windows binary distribution is undergoing a separate redistribution and signing review. Local artifact names are `ORIX-Setup-0.1.0-beta.1.exe` and `ORIX-Windows-0.1.0-beta.1.zip`. Current validation and unsigned status are tracked in [RELEASE.md](RELEASE.md).

### Code signing policy

Windows artifacts are currently unsigned. Free SignPath Foundation signing is being prepared and requires project acceptance. See the [Code signing policy](docs/CODE-SIGNING.md) and [setup prerequisites](docs/SIGNING-SETUP.md).

To build on Windows, install 7-Zip and put `7z` on PATH, then run:

```powershell
npm run package:windows
node tools/make-setup.cjs dist/ORIX-Windows-0.1.0-beta.1.zip
```

Alternatively, set the non-secret `ORIX_7ZIP` launch-environment variable to your `7z.exe` path. The installer compiler is the Windows .NET Framework C# compiler. Packaging stages the installed, pinned Electron runtime and production dependencies in `.verification/` and writes local artifacts to `dist/`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution checks and [the public-source review](docs/PUBLIC-SOURCE.md) for distribution exclusions. The [brand system](dashboard-rewamp/orix-system/BRAND-SYSTEM.md) and [interface design system](dashboard-rewamp/orix-system/DESIGN-SYSTEM.md) describe the current visual direction.

ORIX application code is distributed under [ISC](LICENSE), retaining the recovered manifest's license choice. Dependencies, runtime components, fonts, and other third-party material retain their own terms and attribution: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Contribution and testing instructions: [CONTRIBUTING.md](CONTRIBUTING.md).
