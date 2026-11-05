# Free Windows signing setup

## Selected route and eligibility

SignPath Foundation provides free Windows code signing to accepted open-source projects. ORIX uses ISC locally and is being actively developed. Eligibility is incomplete. The public repository has no source, license or releases, project reputation requires Foundation review, MFA is unverified and bundled native-library redistribution review remains open. [Foundation requirements](https://signpath.org/terms.html)

OSSign's application page reported that applications were suspended when researched on 2026-11-05. Microsoft offers free Store-managed signing for MSIX packages after certification. ORIX currently produces an EXE installer and ZIP. Store signing for those EXE/MSI submissions still requires the developer's own certificate. [OSSign](https://ossign.org/), [Microsoft signing options](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options)

## Prepared locally

- Manual Windows build and signing workflow with pinned actions and read-only repository permissions.
- Signing disabled by default, enabled only for a version-matching release tag.
- Installer-only artifact configuration and a draft [Code signing policy](CODE-SIGNING.md).
- Verification of the returned Authenticode signature, Foundation publisher and timestamp, followed by a new SHA-256 checksum.

## Before applying

1. Complete the existing source-content and native redistribution reviews. The prepared source candidate excludes recovered binaries, local credentials, test profiles and generated media.
2. Obtain publication approval, publish the reviewed source and ISC license to `STiFLeR7/ORIX`, and run the workflow with signing left off. Review the CI results and document the application's functionality on its release page.
3. Meet the already-released prerequisite with a reviewed Windows release if acceptable to the owner. The owner previously selected signed distribution, so an unsigned public release requires a new decision. Alternatively ask the Foundation whether it will consider the existing pre-release situation. Do not claim that an unpublished local candidate meets this condition.
4. Confirm MFA and maintainer roles, finish privacy/service disclosures and put a Code signing policy link on the homepage and download/release page.
5. Apply through the [Foundation application page](https://signpath.org/apply.html). Provide the published repository, license, release, build workflow, policy and accurate project history. Acceptance depends on Foundation review, including project reputation.

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

The public application and hosted workflow have not been submitted or run. No signing account, secret, certificate or repository protection has been created by this preparation.
