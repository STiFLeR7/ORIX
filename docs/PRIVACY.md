# ORIX privacy and connected services

This describes the ORIX 0.1.0-beta.1 source release reviewed on 2026-11-05. ORIX is maintained through [STiFLeR7/ORIX](https://github.com/STiFLeR7/ORIX). Report problems through the repository's issues without including tokens, private calendar links, conversations or personal files.

## Local data and controls

ORIX stores preferences, notes, file-tray paths and integration configuration in its application profile, normally `%APPDATA%/ORIX`. ChatGPT/Codex runtime data uses a separate directory within that profile. The installed agent tools and external applications may keep their own histories and credentials. Spotify tokens are protected using Electron's OS-backed storage when encryption is available.

Clipboard history is enabled by default and keeps up to eight text entries in memory. It is cleared when capture is disabled or the process ends. To stop capture, disable Clipboard in Modules and save. This does not clear the Windows clipboard. Notes and tray paths persist until removed. The layer OFF switch hides the interface while enabled tools and integrations continue running.

The AI monitor reads supported local window/accessibility and agent-status information to show session status. Connecting an AI provider, sending a request, choosing project files, or asking it to inspect a screenshot can send that content to the selected provider. Project-agent operations can read or change files in the selected project. Review the selected provider and project before starting work.

## Network destinations

| Feature | Information and destination | Control and provider policy |
| --- | --- | --- |
| ChatGPT, Codex and OpenAI API | Authentication, prompts, selected context, screenshots and responses pass through OpenAI's services and the installed/bundled Codex runtime. Provider software may make its own service requests. | Use these connections only when needed. Provider account and data controls apply. [OpenAI privacy policy](https://openai.com/policies/privacy-policy/) and applicable API/customer terms. |
| Claude / Claude Code | Claude's external applications and agent tools handle their own authentication, conversation and project context. | Disconnect or disable the integration and manage the provider's own settings. [Anthropic privacy policy](https://www.anthropic.com/legal/privacy). |
| Spotify | OAuth uses Spotify Accounts and a loopback callback at `http://127.0.0.1:8888/callback`. Playback/device requests go to Spotify's API and include authorization. | Use Disconnect in ORIX and revoke application access in Spotify when appropriate. [Spotify privacy policy](https://www.spotify.com/legal/privacy-policy/). |
| Weather | A configured city is sent to Open-Meteo geocoding. Its returned coordinates are used for forecast requests. Providers also receive ordinary connection information such as IP address. | Leave the city blank or clear it and save to stop configured-city requests. [Open-Meteo terms and privacy](https://open-meteo.com/en/terms). |
| Calendar | ORIX fetches the HTTPS calendar URL the user supplies. That service receives the request and connection information. A private calendar URL may itself grant access to the calendar. | Clear the URL and save to stop requests. The selected calendar service's privacy policy applies. |

Source dependency installation contacts npm and Electron's download infrastructure. Manual project/download links open GitHub in the browser. Automatic-update and remote account/news defaults are disabled.

## Removal and retention

Quit ORIX to stop its background processing. Follow the [removal guide](ORIX-REMOVAL.md) to remove the program, startup entry, shortcuts, hooks and optional editor extension. Program removal retains the profile unless you separately remove it. Back up notes and other required data first. External providers retain data under their own policies and account controls.

Never post profile files or hook backups publicly without reviewing them. They may contain credentials, private URLs or conversation/project information.
