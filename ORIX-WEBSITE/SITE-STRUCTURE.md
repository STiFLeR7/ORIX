# ORIX website structure

Status on 2026-11-05. Proposed architecture for review. Confirmed inputs are listed in the [handoff index](README.md).

## Pages and destinations

| Destination | Purpose | Proposed content |
| --- | --- | --- |
| `/` | Introduce ORIX and help visitors reach its available release | Eight sections listed below |
| `/docs/` | Explain installation and everyday use | Setup, tools, integrations, appearance, shortcuts, updates, troubleshooting and removal |
| `/privacy/` | Explain website and application data handling | Website processing, local app data, connected providers, retention and controls |
| GitHub repository | Source, contribution and issue workflows | Link to the existing repository and its contribution instructions |
| GitHub releases | Version history and authoritative release artifacts | Link to the published release appropriate to the website's current state |

The initial proposal has three primary website routes. Documentation can grow into additional routes if its volume requires them. Features and release access are homepage anchors in this proposal.

## Homepage sequence

| Order | Anchor | Section | Visitor question |
| --- | --- | --- | --- |
| 1 | `#overview` | Introduction and actual desktop scene | What is ORIX? |
| 2 | `#demo` | Interactive product demonstration | How does the layer behave? |
| 3 | `#tools` | Everyday tools | Which tasks would I use it for? |
| 4 | `#integrations` | AI work and supported integrations | How does it fit my existing workflow? |
| 5 | `#appearance` | Appearance and control | How will it fit my desktop? |
| 6 | `#open-source` | Open-source model and data transparency | Who maintains it and how can I inspect it? |
| 7 | `#get-orix` | Current release access | What is available for my Windows PC? |
| 8 | `#faq` | Installation and usage questions | What should I understand before using it? |

Navigation and footer are shared elements outside the eight content sections. [Section content](SECTION-CONTENT.md) provides draft copy and actions for each section.

## Navigation and footer

Proposed header items are Features, How it works, Documentation, GitHub and the release action. Features targets `#tools`, and How it works targets `#demo`. Use the current release-state label for the primary action.

The header should preserve space for the ORIX lockup and readable navigation. A compact mobile menu exposes the same destinations, with visible open/close states and predictable focus behavior. Anchor headings remain visible below any persistent header.

The footer groups Documentation, Privacy, Code signing policy, Releases, Report an issue and GitHub. Attribution and maintainer information use accurate project records. Long legal or contribution text can remain linked to its authoritative repository document.

## Primary journeys

| Visitor | Path | Expected result |
| --- | --- | --- |
| New visitor | Introduction → demonstration → tools → release access | Understand ORIX and reach the available release/source |
| AI-tool user | Integrations → relevant documentation → release access | Understand the specific supported connection and setup |
| Existing user | Documentation or GitHub releases | Find setup, update, troubleshooting or removal information |
| Contributor | Open-source section → GitHub/contribution guide | Reach source and participation instructions |
| Mobile visitor | Product explanation → readable crops/video → release information | Understand the Windows product and retain a useful destination |

## Design questions with proposed answers

| Question | Proposed answer |
| --- | --- |
| What should be clear in five seconds? | ORIX is a compact Windows desktop layer for useful tools and AI session status. |
| What is the strongest product moment? | Expand the notch, use a tool and return to the surrounding workspace. |
| What should visitors remember? | The aperture mark and the actual desktop-layer shape and behavior. |
| How can the feature story be concrete? | Pair each short benefit with an authentic interface state and an everyday action. |
| What should establish trust? | Public source, accurate releases, authentic captures and understandable data disclosures. |
| What role should visual effects play? | Explain spatial relationships, interaction and product states while retaining readable content. |
| What is the main conversion? | Reach the currently available source preview or a verified Windows binary release. |
| What is the launch film's role? | Provide an optional expressive introduction alongside practical product explanation. |

## Decisions still needed

Confirm the audience priority, route count, homepage sequence, website language scope, selected demonstration states, media treatment and content maintenance owner. These are the remaining architecture/content choices before implementation planning.
