# ORIX updates

ORIX uses manual updates. It does not check the original TwoCode update or news endpoints, download update payloads, or install old staged TwoCode updates. The recovered publishing/signing scripts and original update public key are not part of the ORIX release workflow.

The intended release location is [STiFLeR7/ORIX Releases](https://github.com/STiFLeR7/ORIX/releases). No release has been uploaded by this execution; an empty page means no download is available yet. The dashboard opens that page only when requested. Do not use the original TwoCode download site to update ORIX. Local artifacts are named:

- `ORIX-Setup-0.1.0-beta.1.exe`
- `ORIX-Windows-0.1.0-beta.1.zip`

Before updating, quit ORIX and retain a copy of the previous version. Install the reviewed full ORIX package, then reopen ORIX and check its displayed version and saved settings. The packaged install location is `%LOCALAPPDATA%\Programs\ORIX`; ORIX settings are separate from TwoCode settings. Development runs use `npm start` from the source folder.

An Electron update requires a complete runtime package. Do not copy only application files into the recovered TwoCode runtime or reuse its updater signing identity.

## Preparing a release

For source releases, follow the release checklist in the source repository: synchronize version metadata, run all checks, package the patched runtime, verify notices and Windows installation, then establish signing and distribution explicitly. No publishing command or automatic rollout is configured.

For the original update mechanism's historical documentation, consult the untouched `recovered/TwoCode/resources/app/UPDATES.md`; it is not an ORIX operating procedure.
