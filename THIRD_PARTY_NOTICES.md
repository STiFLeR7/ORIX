# Attribution and third-party notices

## Application license

ORIX application code is distributed under the [ISC license](LICENSE). Third-party code, artwork, trademarks and fonts retain their respective licenses and notices.

## Runtime, fonts, and packages

| Component | License and notices to preserve |
| --- | --- |
| Inter fonts | Copyright 2016 The Inter Project Authors. SIL Open Font License 1.1, including its notices, in [assets/fonts/Inter-LICENSE.txt](assets/fonts/Inter-LICENSE.txt). |
| Integration SVG assets | Claude Code artwork from [Devicon](https://github.com/devicons/devicon); Claude, Codex, OpenAI/ChatGPT and Spotify artwork from [SVGL](https://github.com/pheralb/svgl). MIT license texts and pinned source revisions are retained in [assets/icons/brands](assets/icons/brands/SOURCES.md). Vendor trademarks remain their respective owners' property. |
| Optional weather data | Weather data is provided by [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). ORIX displays the returned current temperature and weather condition. The service's [usage terms](https://open-meteo.com/en/terms) apply separately. |
| Electron 44.10.1 | MIT, as declared by the installed Electron package. Preserve Electron's `LICENSE` and Chromium/third-party notices in `LICENSES.chromium.html` beside the executable in the distributable. Chromium and bundled components have their own terms. |
| `@openai/codex` 0.160.0 and its platform package | Apache-2.0. The upstream [license](assets/licenses/CODEX-APACHE-2.0.txt) and [notice](assets/licenses/CODEX-NOTICE.txt) are retained from the [rust-v0.160.0 tag](https://github.com/openai/codex/tree/rust-v0.160.0). The credited Ratatui [MIT text](assets/licenses/RATATUI-MIT.txt) is included. The Windows package retains the text runtime and helpers and excludes the optional real-time voice payload. |
| FFmpeg in Electron | LGPL 2.1 or later, with [license text](assets/licenses/FFMPEG-LGPL-2.1.txt) and complete Electron component notices retained. Matching FFmpeg source at `2b68d2babae73714846961fb0ee47e3b3d2e39a9`, Electron 44.10.1 patches/build rules and Chromium 152.0.7977.169 build material are supplied in the release's third-party source ZIP. A compatible modified `ffmpeg.dll` can replace the library beside `ORIX.exe` after quitting ORIX. |
| Other npm dependencies | Each package retains its own license and notices. Consult the locked dependency tree and the license/notice files in the actual installed packages; include those required by the files shipped. Development-only dependencies need separate review if included in a distributable. |

This file summarizes the principal components; it does not replace their complete license texts or the notices bundled with native binaries. Before distributing a build, verify the final archive contains the required runtime, font, and dependency license files. Retain upstream attribution when modifying or replacing any third-party material.

The upstream Codex Windows package contains a separate real-time voice runtime with GStreamer/GLib and a Microsoft VC++ runtime. ORIX 0.1.0-beta.2 excludes that unused payload during package staging. ORIX's current ChatGPT integration uses text `app-server` and `exec` entry points. Its five native runtime/helper executables are retained. The bundled `codex-path/rg.exe` reports ripgrep 15.2.0 with PCRE2 10.45. Their [MIT](assets/licenses/RIPGREP-15.2.0-MIT.txt) and [PCRE2](assets/licenses/PCRE2-10.45-LICENCE.md) texts are retained.

Windows 10/11 supply the D3DCompiler used through the normal OS loader. The package excludes Electron's app-local `d3dcompiler_47.dll`. DirectX Shader Compiler, SwiftShader and Vulkan notices remain in Electron's complete `LICENSES.chromium.html`. ORIX preserves upstream native files without applying its publisher signature to them.
