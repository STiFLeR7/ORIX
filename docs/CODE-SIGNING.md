# Code signing policy

## Current status

ORIX's local Windows artifacts are unsigned. SignPath Foundation is the selected free signing application route. Acceptance, certificate issuance and live signing remain pending. The public repository was empty when checked on 2026-11-05. Application prerequisites and setup instructions are in [SIGNING-SETUP.md](SIGNING-SETUP.md).

## Intended scope

The prepared [Windows workflow](../.github/workflows/windows-signing.yml) builds the application ZIP and the first-party C# installer from the selected source revision. Signing is opt-in and requires a release tag matching the package version. The [artifact configuration](../.github/signpath/installer.xml) permits exactly one versioned ORIX setup executable with the expected product, company and file version.

The requested signing scope is the installer built from `tools/setup/Setup.cs`. Electron, Codex and other upstream executables retain their upstream identity and signatures. Their redistribution terms are tracked in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) and the [public-source review](PUBLIC-SOURCE.md).

## Proposed team roles and approval

The repository owner `STiFLeR7` is the proposed committer, reviewer and signing approver. Confirm the actual role assignments during enrollment. Everyone assigned a role must use MFA on GitHub and SignPath. Production signing requires manual SignPath approval after reviewing the source revision, workflow, dependency changes, build results and requested artifact. Restrict the submitter token to the approved project and policy.

After acceptance, configure SignPath's GitHub trusted build integration for `STiFLeR7/ORIX`, this workflow, GitHub-hosted runners and reviewed release refs. The workflow checks the downloaded signature, expected publisher and timestamp before retaining a signed artifact. Current workflow outputs are Actions artifacts with 14-day retention.

After the service and certificate are granted, add the required attribution to the homepage and release/download pages using the wording provided by SignPath. The expected Windows publisher is SignPath Foundation.

## Privacy and system changes

ORIX stores settings and persistent tool data in its local application profile. Enabled clipboard history retains up to eight text entries in memory. Disable Clipboard in Modules and save to clear its history and stop capture. Hiding the layer leaves enabled integrations running. AI requests, selected project data and requested screenshots can be sent to the selected provider. Spotify authentication and controls contact Spotify. The optional weather module sends the configured city and resulting coordinates to Open-Meteo. Provider services apply their own privacy terms. These behaviors need to remain visible in the release documentation.

See the [privacy policy and provider disclosures](PRIVACY.md), [removal instructions](ORIX-REMOVAL.md) and [release checks](../RELEASE.md).

## Source requirements

This policy follows the published [Foundation conditions](https://signpath.org/terms.html) and [GitHub integration documentation](https://docs.signpath.io/trusted-build-systems/github). A prepared workflow does not establish Foundation acceptance or signed-release availability.
