# Free Windows signing setup

## Selected route and eligibility

SignPath Foundation provides free Windows code signing to accepted open-source projects. ORIX's ISC source and source preview were published on 2026-11-05, followed by preparation of the requested beta.2 Windows downloads and third-party source material. The owner confirmed GitHub MFA. SignPath enrollment/MFA, project-reputation review and certificate issuance remain pending. Current package changes and evidence are in the [native distribution review](NATIVE-REDISTRIBUTION.md). [Foundation requirements](https://signpath.org/terms.html)

OSSign's application page reported that applications were suspended when researched on 2026-11-05. Microsoft offers free Store-managed signing for MSIX packages after certification. ORIX currently produces an EXE installer and ZIP. Store signing for those EXE/MSI submissions still requires the developer's own certificate. [OSSign](https://ossign.org/), [Microsoft signing options](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options)

## Prepared locally

- Manual Windows build and signing workflow with pinned actions and read-only repository permissions.
- Signing disabled by default, enabled only for a version-matching release tag.
- Installer-only artifact configuration and a draft [Code signing policy](CODE-SIGNING.md).
- Verification of the returned Authenticode signature, Foundation publisher and timestamp, followed by a new SHA-256 checksum.

Default workflow dispatch builds and tests on Windows. Installer uploads are part of the opt-in signing route after acceptance and redistribution review.

## Before applying

- [x] Complete source publication review and publish the ISC-licensed source, excluding private binaries, credentials, profiles and generated media.
- [x] Run hosted Windows CI with signing off. All 228 tests and ZIP/setup builds passed.
- [x] Publish a source preview describing functionality and linking to the Code signing policy. Add privacy/provider disclosures and record the owner's GitHub MFA confirmation.
- [x] Start the application route with an owner-approved inquiry after the [official form](https://signpath.org/apply.html) failed to render. Request guidance on the first-binary-release prerequisite.
- [x] Prepare the requested beta.2 Windows installer/portable release with the unused voice payload excluded and FFmpeg source/build material and notices supplied alongside it.
- [ ] Complete SignPath enrollment, its MFA and actual team-role assignments. Submit any further application material through the route provided by the Foundation.

## After acceptance

1. Configure the SignPath GitHub trusted build integration for this repository and `.github/workflows/windows-signing.yml`. Restrict allowed source refs and require GitHub-hosted runners and manual signing approval. Confirm the Foundation's required repository protections.
2. Create the installer artifact configuration using `.github/signpath/installer.xml`. Configure the production policy to use the Foundation-issued certificate. Preserve manual approval and restrict the submitter account to this project/policy.
3. Set the repository variables below to the actual values issued/configured by SignPath.

   | Repository variable | Value to obtain |
   | --- | --- |
   | `SIGNPATH_ORGANIZATION_ID` | Organization identifier |
   | `SIGNPATH_PROJECT_SLUG` | ORIX project slug |
   | `SIGNPATH_SIGNING_POLICY_SLUG` | Manually approved production policy slug |
   | `SIGNPATH_ARTIFACT_CONFIGURATION_SLUG` | Installer configuration slug |

4. Store the submitter token in the ORIX vault project as `SIGNPATH_API_TOKEN`. Use the vault MCP to inject it into a command that sets the GitHub Actions secret of the same name through stdin. Keep the token out of project files and logs. GitHub requires its own secret for the hosted workflow.
5. Dispatch the reviewed version tag with `sign` enabled, approve the request in SignPath, and download `ORIX-signed-installer` only after its verification step passes. Check Windows publisher details, installation and the checksum again. Add the service attribution once granted, and keep the approval/build record with the release evidence.

The beta.2 hosted workflow completed successfully at [run 41986461561](https://github.com/STiFLeR7/ORIX/actions/runs/41986461561), passing 230 tests and building ZIP/setup. The public [Windows beta.2 release](https://github.com/STiFLeR7/ORIX/releases/tag/v0.1.0-beta.2) now includes the installer, portable ZIP and third-party source material. This supplies an existing release in the Windows binary form for the Foundation's review. Acceptance, project-reputation review and enrollment are pending.

The official application page's embedded HubSpot form remained blank in Chrome, and its direct frame rejected top-level access. With the owner's approval, an application/eligibility inquiry was sent on 2026-11-05 from the Codex agent inbox to SignPath's published information address. It requests an alternative application route and guidance on review before the first binary release. A response is pending. No signing account, certificate or signing credential has been issued.

Checked the inquiry thread and SignPath sender search again on 2026-11-05, including spam, blocked and unauthenticated mail. No reply was present. The thread contained only the original sent message.
