# Contributing to ORIX

Use Windows 10/11, Node.js 22.12 or newer, npm and Windows PowerShell 5.1. Follow the setup and build commands in [README.md](README.md). Changes should remain compatible with the pinned Electron version and existing preferences.

Keep all existing desktop tools free. New mascots, modules and future logo changes are separate work; this redesign preserves existing functionality and uses the approved ORIX logo. Prefer the existing helpers, SVG assets and CSS tokens over new dependencies.

Before proposing a change:

- Run `npm test`. Add a focused regression for behavioral fixes; preserve notes, settings drafts, active timers and custom integration hooks.
- Run `npm audit` and inspect the affected screens in English and light/dark. Record unavailable provider or hardware checks rather than claiming them passed.
- Check OFF semantics: hide the desktop layer while enabled tools continue. Settings must remain reachable. Theme belongs in Settings → General and follows Save/Cancel. English is the only interface language; there is no language selector.
- Retain ISC and all third-party notices. Attribute imported assets and establish redistribution permission. Do not include local profiles, recovered binaries, dependency folders or unlicensed reference images.

Never submit keys, tokens, conversation data or local user settings. This workspace uses the vault MCP for commands needing secrets; contributors should use their own secret-management tools without committing credentials. Public Spotify client IDs are launch configuration; account access remains the user's responsibility.

Use the [issue tracker](https://github.com/STiFLeR7/ORIX/issues) for reproducible bugs and describe expected/actual behavior, app version, Windows version and relevant settings. Remove personal data from logs and screenshots. A pull request should describe the user-visible change and the checks actually run.

Building artifacts does not publish them. Releases, tags, signing and uploads require maintainer authorization. Current release readiness is recorded in [RELEASE.md](RELEASE.md).
