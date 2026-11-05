# ORIX source publication

The public source repository is [STiFLeR7/ORIX](https://github.com/STiFLeR7/ORIX). Application code is available under the [ISC license](../LICENSE).

## Source contents

The repository contains application code, tests, Windows build tools, licensed assets, the local VS Code extension, website work and contributor documentation. Credentials, local profiles, installed dependencies, private verification material and third-party design references stay outside source publication.

Keep dependency licenses and attribution with distributed files. [Third-party notices](../THIRD_PARTY_NOTICES.md) cover fonts, integration artwork, Electron and bundled runtime components. The [native-library review](NATIVE-REDISTRIBUTION.md) records distribution requirements and the corresponding source supplement.

## Published validation

The beta.3 Windows build passed 234 automated tests and produced reviewed ZIP and installer artifacts. Its native payload matched the reviewed dependencies. These results describe the published beta.3 candidate. Later source changes require fresh validation before another binary release.

Source publication candidates passed Gitleaks scans. Detailed release evidence and remaining Windows and AI checks are maintained in [RELEASE.md](RELEASE.md), [TESTING.md](TESTING.md) and the [validation ledger](ORIX-REDESIGN-VALIDATION.md).

## Publication process

1. Review changes and scan the exact source candidate for secrets.
2. Run syntax checks, automated tests and a clean Windows build.
3. Verify installer contents, dependency notices and checksums.
4. Complete the applicable Windows and integration checks.
5. Publish source and release artifacts with accurate validation status.

See the [privacy policy](PRIVACY.md), [code-signing policy](CODE-SIGNING.md) and [signing setup](SIGNING-SETUP.md) for related requirements. Windows beta.3 is unsigned and SignPath acceptance remains pending.
