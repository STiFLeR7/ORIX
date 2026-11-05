# Native-component distribution review

## Beta.3 component check — 2026-11-05

All 11 native EXE/DLL files in the final beta.3 installation matched the reviewed beta.2 files by SHA-256. The dependency versions, exclusions and source revisions below still apply. The beta.3 release includes `ORIX-Third-Party-Sources-0.1.0-beta.3.zip` with the same pinned materials, refreshed version label and checksums. Its eight-file archive passed an integrity test. The packaged Codex runtime also completed a live reply and monitored lifecycle test. A full FFmpeg source rebuild remains unperformed.

## Beta.2 distribution changes — 2026-11-05

The owner requested a downloadable Windows installer. The beta.2 package excludes the unused Codex real-time voice payload, including its GStreamer/GLib libraries and Microsoft VC++ DLL. ORIX's text app-server and exec executable/helpers remain. A real isolated protocol check passed initialization, account-state reading and thread creation with the voice directory absent. A packaging regression verifies retention of the text executable/helpers and rejection of an out-of-staging junction before deletion.

The package also excludes Electron's app-local D3DCompiler and uses Windows 10/11's system component. A hidden Electron check initialized WebGL without the local DLL. The six remaining Electron and five Codex native files retain their upstream identities and notices.

The release supplies FFmpeg source at Chromium's pinned commit `2b68d2babae73714846961fb0ee47e3b3d2e39a9`, the Electron 44.10.1 source including its patch series/build rules, Chromium 152.0.7977.169 build scripts, DEPS records, license and replacement instructions. These are mirrored in `ORIX-Third-Party-Sources-0.1.0-beta.2.zip` alongside the binaries. A test altered the FFmpeg DLL's DOS-stub text and successfully decoded a generated MP3 through Electron's AudioContext. This verifies that an altered compatible DLL can load. A full FFmpeg rebuild was not performed.

FFmpeg LGPL, Ratatui MIT, Codex Apache/NOTICE, ripgrep/PCRE2, Electron component, font and icon notices are retained. The installer remains unsigned while SignPath enrollment is pending. The beta's remaining Windows checks are listed in [RELEASE.md](../RELEASE.md).

## Earlier beta.1 review

The reviewed source is published under ISC. Binary distribution remains on hold for the items below. The public source and source-preview release exclude the installed Electron and Codex runtime payloads. The owner confirmed GitHub MFA and reported no confirmed Visual Studio 2026/Build Tools 2026 license. SignPath enrollment and its MFA setup are pending.

## Reviewed evidence

| Component | Evidence | Remaining binary-distribution action |
| --- | --- | --- |
| ORIX application and setup | First-party source and ISC text are published. The installer is compiled from `tools/setup/Setup.cs`. | Retain the ISC text and attribution. Sign only the first-party setup after approval. |
| Inter, integration icons and ORIX artwork | OFL/MIT texts and pinned integration sources are retained. ORIX's approved mark is included. Unapproved design references and generated media are excluded. | Preserve attribution and vendor trademark distinctions. |
| VS Code extension | All four VSIX entries were listed. The embedded extension JavaScript and package manifest match adjacent source byte-for-byte. | Preserve the published source and license. |
| Electron 44.10.1 | The package retains Electron's MIT license and `LICENSES.chromium.html`. Its seven native files were matched to the installed Electron package. The notice includes LGPL-covered FFmpeg. Electron's `v44.10.1` DEPS pins Chromium `152.0.7977.169`. | Complete the corresponding FFmpeg source/build-material delivery and replacement review against that exact Electron build. Retaining the notice alone does not finish these obligations. |
| Codex 0.160.0 and helpers | Apache-2.0 license and notice, ripgrep MIT and PCRE2 license texts are included. Native inventory records package identity. | Review any additional embedded-component obligations against upstream's complete build and notices. |
| Codex voice libraries | Bundled notices, seven license texts, source manifests and build commit `a956835d020762cb2b570053af06f643a11c0ecc` identify GStreamer/GLib and supporting libraries. Earlier downloads verified all 11 recorded source archive hashes. The upstream source directory includes build and packaging scripts. | Provide complete corresponding source/build material through a durable distribution route and verify the applicable LGPL shared-library replacement conditions. The source archives were previously streamed for hashing, so no ORIX-hosted source mirror exists yet. |
| Microsoft `vcruntime140.dll` | The bundled runtime is recorded as 14.50.35719, with its upstream Microsoft download, SHA-256 and license references. A complete local Visual Studio Build Tools 2022 installation was found. The owner has not confirmed an applicable Visual Studio product license. | Establish distributor eligibility and applicable terms before including this DLL in a public ORIX binary. The standalone Build Tools installation and an upstream signature do not establish that right. |

## Microsoft license finding

The [Microsoft redistribution guidance](https://learn.microsoft.com/en-us/cpp/windows/redistributing-visual-cpp-files) limits redistribution to licensed Visual Studio users under applicable terms. The [current v14 runtime page](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist) explains that Visual Studio 2017–2026 share current v14 redistributable files. A separate 2026 installation is therefore not by itself the deciding condition. An applicable Visual Studio license and its distribution terms still need to be established.

The official [Build Tools 2022 license](https://visualstudio.microsoft.com/license-terms/vs2022-ga-diagnosticbuildtools/) was inspected. Its standalone permission to build third-party open-source C++ dependencies does not by itself grant redistribution of the separately licensed runtime. The reviewed evidence does not establish a suitable license for this distributor.

## Release and signing consequences

The [source preview](https://github.com/STiFLeR7/ORIX/releases/tag/v0.1.0-beta.1) remains available. The requested beta.2 Windows release supplies the installer, portable ZIP and third-party source material. Signing remains a separate pending step. The manual CI workflow tests and builds by default, with signing uploads gated on the signing route.

An owner-approved inquiry was sent to SignPath on 2026-11-05 asking for an alternative to the non-rendering application form and whether review can begin before the first public binary release. Foundation acceptance, any exception and certificate issuance require its response. The inquiry does not claim that the outstanding requirements are satisfied.

Detailed historical inventory and checks are in [PUBLIC-SOURCE.md](PUBLIC-SOURCE.md). [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) contains the notices preserved in the current package.
