# ORIX website section content

Status on 2026-11-05. Draft English copy and proposed content for the [eight-section homepage](SITE-STRUCTURE.md). Headlines can be refined during visual review. Product and release statements must match the build presented at publication.

## Shared header

Use the supplied ORIX lockup with links to Features, How it works, Documentation and GitHub. The release action follows the availability rules in section 7. Provide the same destinations in the compact navigation.

## 1. Introduction — `overview`

**Purpose** Help visitors understand the product and its desktop context immediately.

**Eyebrow** A desktop layer for Windows

**Headline** Your desktop, within reach.

**Body** Keep AI session status, notes, clipboard history, focus sessions and optional Spotify controls close to your work.

**Supporting detail** Free and open source. Optional connected services have their own accounts and terms.

**Actions** The primary action reaches the available release or source preview. The secondary action, See ORIX in action, targets `#demo`.

**Visual** A Windows workspace containing the actual ORIX notch, paired with a readable expanded-state crop. Keep prepared work content and ordinary desktop context visible enough to establish scale.

**Acceptance** The first screen communicates the product, Windows context and a usable next action at both desktop and mobile widths.

## 2. Product demonstration — `demo`

**Purpose** Explain the notch's transition from a compact layer to a useful tool.

**Headline** See ORIX in action.

**Body** Explore the layer, open a tool and see how it fits alongside your desktop.

**Content** Offer a small number of labeled sample states, such as Note, Focus and AI status. Final sample selection depends on available verified captures. Include an always-visible Preview label for an interactive recreation and a short explanation that it illustrates the Windows app.

**Actions** Select a sample state, replay the demonstration or explicitly play the optional launch film. A static image and its text explanation provide the complete basic story.

**Visual** An actual expanded-notch capture or a faithful recreation assembled from verified product states. A demo action updates the website's sample view. Use prepared local sample data.

**Acceptance** Selection works through touch and keyboard, state is announced appropriately and essential information is available with motion reduced or JavaScript unavailable.

## 3. Everyday tools — `tools`

**Purpose** Connect features to recognizable tasks.

**Headline** The tools you reach for.

**Body** Keep a note nearby, revisit copied text or make time for focused work.

| Tool | Draft heading | Draft description | Required visual evidence |
| --- | --- | --- | --- |
| Notes | Keep a thought close. | Write a note and return to it from the desktop layer. | Prepared note shown in the actual editor |
| Clipboard | Find the text again. | Revisit recent text captured while Clipboard is enabled. | A prepared history sample and capture-control context |
| Focus | Make room to concentrate. | Set a focus timer and keep its progress in view. | Timer setup and a running session |
| File tray | Keep useful files nearby. | Keep file references together in the layer. | Prepared tray contents with public sample names |

**Content detail** Add relevant setup/help links. Explain Clipboard's default-enabled behavior and memory-only history in the adjacent detail or FAQ. Drag/drop descriptions require the applicable release verification.

**Visual** Use close-ups sized for reading and a consistent example format. A card arc or fan is a composition option for prototype review.

**Acceptance** Each benefit is supported by an authentic state, and the essential explanation appears as website text.

## 4. AI workflow — `integrations`

**Purpose** Explain the supported connections and what each one does.

**Headline** Keep up with your AI work.

**Body** Bring supported AI session information into your desktop layer and configure the connections you use.

**Content** Provide individual explanations for Claude Code, Codex monitoring and the ChatGPT provider. The final wording should distinguish local session monitoring from requesting an AI response. Describe account/setup requirements beside the relevant connection.

**Actions** Select a supported connection to see its explanation and actual ORIX capture, then follow its documentation link.

**Visual** Accurate licensed integration marks and a readable connection/status screenshot. Use a highlighted selection treatment inspired by `website-inspiration-3.jpg`.

**Acceptance** Logos and labels match the integrations supported by the presented release. Each illustrated state has supporting evidence and uses sample project/account information.

## 5. Appearance and control — `appearance`

**Purpose** Explain how ORIX fits the desktop and what the visibility switch does.

**Headline** Make room for your way of working.

**Body** Choose the appearance that suits your desktop and show the layer when you need it.

**Content** Show actual Light and Dark application views, explain the System option and identify where appearance settings live. Explain the compact layer visibility control with the sentence “Hiding the desktop layer leaves enabled tools and integrations running.” Keyboard-shortcut copy follows the current application documentation.

**Visual** Matched dashboard/notch captures in the demonstrated themes, with the relevant Settings detail. Keep the website appearance distinct from the app theme being demonstrated.

**Acceptance** Theme comparisons use comparable content, and visibility behavior is stated accurately.

## 6. Open source and transparency — `open-source`

**Purpose** Explain the project's model, provenance and relevant data controls.

**Headline** Free, open and understandable.

**Body** ORIX is free and open source. Explore the code, follow development and see how its tools and connections handle your data.

**Content** Present the ISC license, repository, contribution route and a brief maintainer/project introduction based on approved public information. Add a short data summary covering local persistence, Clipboard controls and optional providers. Link to the full privacy and code signing policies.

**Actions** View source, read contribution guidance and read the privacy policy.

**Visual** An authentic code or repository detail can sit within a restrained depth or point-pattern composition.

**Acceptance** Claims remain specific to actual behavior and public project records. Statistics, testimonials and endorsements require documented sources before inclusion.

## 7. Release access — `get-orix`

**Purpose** Bring visitors to an accurate, available release destination.

**Headline** Get ORIX.

**Availability behavior**

| Release state | Primary action | Required explanation |
| --- | --- | --- |
| Public source preview | Explore source preview | Source is available. Windows binary downloads are pending the recorded release requirements. |
| Published Windows binary | Download for Windows | Verified version, architecture, requirements, release date and signature status |
| Release information unavailable | View releases on GitHub | Direct visitors to the authoritative release listing and show a clear availability message |

**Release fields** Display name, version, release date, release URL, verified artifact URLs, architectures, OS requirements, checksums, signature status, install/update instructions and known limitations. Populate these from a reviewed source at implementation time.

**Secondary actions** View source, read installation guidance and read release notes.

**Visual** A settled ORIX product composition or a restrained particle background with an opaque readable action surface.

**Acceptance** Each action label describes its destination. Artifact information corresponds to the exact linked file. Binary availability, signing and system requirements follow [the release checklist](../RELEASE.md).

## 8. FAQ and closing action — `faq`

**Purpose** Answer the remaining practical questions and provide a useful next step.

**Headline** Before you install.

| Visitor question | Draft answer |
| --- | --- |
| What does ORIX do? | ORIX is a desktop layer for Windows that brings supported AI session status and everyday tools into a compact interface. |
| Which Windows versions and architectures are supported? | The application documents Windows 10 and 11. Check the current release for its exact architecture and requirements. |
| Is ORIX completely free? | ORIX is free and open source. Connected AI and music services have their own accounts, subscriptions and terms. |
| Where can I inspect the source? | The ORIX repository contains the source, license, contribution information and release records. |
| Do I need accounts for integrations? | Setup depends on the selected integration. Core local tools can be used independently of connected services. Refer to each connection's documentation. |
| What happens to clipboard history? | Clipboard capture is enabled by default and keeps up to eight text entries in memory. Disable Clipboard in Modules and save to stop capture and clear ORIX's history. The Windows clipboard is managed separately. |
| What happens when I hide the desktop layer? | The layer is hidden while enabled tools and integrations continue running. |
| How do installation, updates and removal work? | Follow the instructions for the selected release. Updates are manual in the current application, and a manual removal guide is provided. |
| What is the signing status? | Refer to the exact Windows artifact's signature information and the project's code signing policy. The source preview and binary availability are identified separately in release information. |

**Closing line** Bring ORIX within reach.

**Closing actions** Repeat the current release action and offer Documentation as a secondary destination.

**Acceptance** Questions remain keyboard-operable if presented as disclosures. Answers remain available in page content and search indexing.

## Supporting pages

### Documentation

Organize content around getting started, local tools, AI connections, Spotify, appearance, shortcuts, updates, troubleshooting and removal. Reuse the project's maintained documentation and keep provenance/version details visible where behavior varies by release. Confirm which content is maintained locally and which remains linked to GitHub before implementation.

### Privacy

Explain website hosting and any selected website data-processing features, then link or reproduce the relevant application disclosures from [the product privacy policy](../docs/PRIVACY.md). Identify the policy date and maintenance owner. Website processing and application processing each need their own accurate explanation.

## Editorial rules

Use useful English, actual product labels and supplied brand lines. Keep each section centered on a visitor question. Give screenshots explanatory captions, maintain specific actions and check every release-dependent statement immediately before publication.
