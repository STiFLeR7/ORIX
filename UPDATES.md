# ORIX updates

Download reviewed Windows builds from [ORIX Releases](https://github.com/STiFLeR7/ORIX/releases). ORIX uses manual updates. Automatic update checks, background downloads and staged-update installation are disabled.

## Installing an update

1. Quit ORIX and retain a copy of the previous version.
2. Download and run the installer for the chosen release.
3. Reopen ORIX and check its displayed version, saved settings and enabled integrations.

The per-user installation is %LOCALAPPDATA%\Programs\ORIX. Profile data is stored separately. Existing ORIX beta preferences and history remain available after the internal identity migration. Development runs use npm start from the source folder.

An Electron update requires the complete runtime package. Install the full reviewed release.

## Preparing a release

Synchronize version metadata, run the automated checks, build the pinned runtime, verify licenses and Windows installation, and validate signing and artifact checksums. Local beta.3 artifacts are named ORIX-Setup-0.1.0-beta.3.exe and ORIX-Windows-0.1.0-beta.3.zip.
