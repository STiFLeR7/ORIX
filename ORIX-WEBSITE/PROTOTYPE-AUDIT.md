# ORIX website prototype audit

First-prototype review on 2026-11-05 against the owner's reference images and website handoff.

## Prototype 02 follow-up

Updated 2026-11-05 after the owner rated the first prototype 5/10. The original findings below describe the retained first-version baseline. [Current index.html](index.html) now includes the following corrections.

| Finding | Follow-up | Remaining scope |
| --- | --- | --- |
| 1 · Notch transformation | One container changes between collapsed, home and tool states, with replay and explicit controls | The layer remains a labeled illustrative recreation |
| 2 · Motion direction | Identity/title entrance, moving light/orbit, tool stagger, visual transitions, code depth and flowing point terrain | Owner visual review and real-device performance |
| 3 · Actual imagery | Actual Dark/Light Overview images, three detail crops and full-image viewing | Fresh actual tool/notch/connection captures are still needed for final production media; the Light image includes an unsaved-preferences bar |
| 4 · Integration feedback | Visible service labels, glass-like selected states and distinct session/chat/playback sample interactions | Provider views are prepared illustrations |
| 5 · First-screen interaction | Layer and tool controls moved into the opening view | Mobile browser checks cover 390 by 844 CSS pixels, with broader layout checks at five widths |
| 6 · Acceptance coverage | Added intermediate-width/replay checks, time-varying motion and pause checks, gallery and modal checks, normal/reduced-motion captures | Human visual approval, frame-time profiling and real-device checks |

## Original verdict

The prototype underdelivers the documented creative direction. It implements the eight-section information structure, ORIX identity and basic controls. The central product demonstration, motion sequence and visual response need substantial work before the prototype can represent the intended website experience.

The earlier browser checks established that several controls work and that the layout fits selected viewport widths. They did not establish fidelity to the creative direction. Describing that verification without identifying the missing experience overstated the prototype's completeness.

## Scope and method

Reviewed the complete HTML/CSS/JavaScript in [the first prototype](../docs/reviews/website/orix-website-v1.html), the [browser check](../docs/reviews/website/orix-prototype-check.js), the creative direction, animation specification, section copy, site structure and capture plan. Visually inspected all 11 supplied reference JPGs again. Inspected the prototype in the owner's open in-app browser and exercised its demo selector, focus control, integration selector and appearance control.

The expected use is one visitor exploring a local design prototype. This audit evaluates that experience and its correspondence with the handoff. Public hosting, search indexing and the Windows application's operation belong to their respective validation work.

## Observed behavior

- The open prototype reported `data-effects="on"` and the visible label Effects on.
- Selecting A little focus exposed the timer panel. Starting it changed the control to Pause focus and the status to Sample session running.
- Selecting Spotify updated its pressed state, explanatory copy and terminal text.
- Selecting Light changed the illustrative card's class to `appearance-preview light`. The actual dashboard retained its Dark-mode image and caption.
- Source inspection found one CSS keyframe sequence, the 14-second `breathe` glow. Other motion consists of generic reveal and control transitions. The product bodies change through immediate `hidden` assignments or text replacements.
- The page has zero video elements. The absence of a canvas alone says nothing about design quality or animation capability.
- After checking, the timer was reset and the Note, Claude Code and Dark selections were restored. The prototype was returned to Overview.

## Must fix for creative-direction fidelity

### 1. The notch never becomes the tool

**Priority P1**

**What this is** The main product demonstration is meant to show the compact Windows layer opening into a useful tool.

**Problem** The notch is a fixed 150 by 34-pixel decorative element. A separate sample window sits beneath it. Choosing Note, Focus or AI status immediately hides and shows detached panels. There is no collapsed-to-expanded transition, close action or replayable product sequence. Visitors cannot experience ORIX's defining transformation.

**Evidence** The geometry is defined in [index.html](../docs/reviews/website/orix-website-v1.html:102). Selection uses immediate visibility changes in [the demo handler](../docs/reviews/website/orix-website-v1.html:488). The [motion specification](ANIMATION-AND-INTERACTION.md:13) describes a shape transition, and the [product sequence](ANIMATION-AND-INTERACTION.md:23) calls for collapsed and expanded states.

**Smallest correction** Use one preview container for collapsed, expanded and tool-open states. Give it an explicit activation and close/replay path, animate the supported geometry between settled states and preserve an immediate reduced-motion path. Match the geometry to prepared app evidence.

**If deferred** The page explains tools while leaving the desktop-layer interaction unexplained.

### 2. The motion direction was reduced to background glow and repeated fades

**Priority P1**

**What this is** Motion should establish the identity, explain state changes and connect product visuals across the page.

**Problem** The hero's tilted card and orbit remain static. The only keyframe sequence changes a faint glow over 14 seconds. There is no aperture/wordmark entrance, related-item stagger or animated transition between demo bodies. The same opacity/translation reveal is applied to unrelated panels. It also hides complete feature articles, including their essential copy, while they wait for the observer.

**Evidence** See [hero artwork and glow](../docs/reviews/website/orix-website-v1.html:66), [generic reveal CSS](../docs/reviews/website/orix-website-v1.html:203) and [the reveal observer](../docs/reviews/website/orix-website-v1.html:457). Compare the [motion roles and identity sequence](ANIMATION-AND-INTERACTION.md:8) and the requirement to keep [essential text present](ANIMATION-AND-INTERACTION.md:43).

**Smallest correction** Build a short identity entrance, the product transformation from finding 1 and differentiated reveals for a small related visual group. Keep essential text visible. Select one atmospheric treatment with noticeable depth at the normal viewing size, retain Effects off and reduced motion, and pause continuous work outside view.

**If deferred** Scrolling exposes more information with little visual explanation of how the product works.

### 3. Actual product imagery is too limited for the promised demonstrations

**Priority P1**

**What this is** The handoff makes real dashboard and notch details the principal product evidence.

**Problem** The actual product evidence is a single full Dark dashboard image in Appearance. The hero supplies an invented floating composition without a Windows workspace. Integration selection changes explanatory text inside a generic terminal. Light/Dark selection changes a small illustrative card while the adjacent actual dashboard remains Dark. No matched actual-theme comparison, expanded-notch capture, connection capture or readable dashboard-detail gallery is supplied.

**Evidence** See [the actual image](../docs/reviews/website/orix-website-v1.html:416), [integration text replacement](../docs/reviews/website/orix-website-v1.html:533) and [the appearance handler](../docs/reviews/website/orix-website-v1.html:545). Compare the required [hero visual](SECTION-CONTENT.md:23), [integration visual](SECTION-CONTENT.md:74), [theme comparison](SECTION-CONTENT.md:88) and [capture inventory](ASSET-AND-CAPTURE-PLAN.md:22).

**Smallest correction** Prepare a coherent set of real notch/dashboard states. Use a contextual desktop scene and readable crops. Pair integration choices with their corresponding ORIX view, and implement a matched theme comparison. Keep every recreation labeled and use verified sample data.

**If deferred** Visitors must infer the application from stylized placeholders and a small full-dashboard image.

## Should fix

### 4. Integration feedback and visual selection are underdeveloped

**Priority P2**

**What this is** Integration choices should provide a visible, understandable connection between the selected service and the resulting product state.

**Problem** The four choices are small icon-only tiles. They have accessible names, but their names are only displayed for the selected item. Selection changes a border, a slight tint and text in the same terminal layout. Spotify, an AI provider and session monitoring consequently receive almost the same visual treatment. The reference's strong selected-object hierarchy and the handoff's associated product preview are largely absent.

**Evidence** See [tile styling](../docs/reviews/website/orix-website-v1.html:139) and [selection behavior](../docs/reviews/website/orix-website-v1.html:533). Compare [the integration reference](creative-direction/website-inspiration-3.jpg) and [micro-interaction guidance](ANIMATION-AND-INTERACTION.md:33).

**Smallest correction** Add visible service labels, strengthen the selected-state hierarchy and transition the associated product visual. Show each connection's relevant behavior and retain its individual setup explanation. Resolve the real captures through finding 3.

**If deferred** Selecting a service offers little sense of exploring its product connection.

### 5. The narrow first-screen presentation delays the useful product moment

**Priority P2**

**What this is** A visitor using the in-app browser or a phone should quickly understand and try the desktop layer.

**Problem** The narrow layout stacks the headline, body, two links, supporting copy and a 365-pixel decorative hero region before the demonstration. The saved 390-pixel-wide preview fills most of its first screen with this material. The owner's current narrow in-app view likewise leads with copy and static art. The hero artwork contains decorative tool icons with no tool-selection behavior. The usable layer controls appear later in the document.

**Evidence** See [the narrow layout rules](../docs/reviews/website/orix-website-v1.html:227), [hero artwork](../docs/reviews/website/orix-website-v1.html:66) and [the saved mobile view](../docs/reviews/website/orix-website-mobile.png). The [site structure](SITE-STRUCTURE.md:56) identifies the actual layer shape and behavior as the memorable product moment.

**Smallest correction** Move the collapsed-to-expanded demonstration into the initial product composition or bring its entry control and useful state earlier in the narrow layout. Compress the supporting copy/art spacing around it. Verify discoverability in the actual in-app viewport as well as desktop and phone widths.

**If deferred** The first impression continues to be a reading experience before visitors reach the interactive example.

### 6. The acceptance check misses the reason this prototype was requested

**Priority P1 before the next completion claim**

**What this is** Verification must cover visible motion, product fidelity and discoverable interactions alongside functional correctness.

**Problem** The existing check verifies visibility, text, class changes, selected states, timer behavior and overflow. Its image captures are taken after Effects off is selected. It contains no acceptance check for notch transformation, identity animation, transition progression, matched app captures or a gallery. Passing those assertions could not demonstrate that the prototype met the creative brief.

**Evidence** The check switches effects off in [the browser script](../docs/reviews/website/orix-prototype-check.js:53), then takes its screenshots at [the following capture steps](../docs/reviews/website/orix-prototype-check.js:58). The [motion acceptance list](ANIMATION-AND-INTERACTION.md:65) requires broader visual and behavioral inspection.

**Smallest correction** Keep the useful control checks. Add a brief-to-implementation checklist and review the selected motion sequences through start, intermediate and settled states, with a short recording or timestamped frames. Capture a normal-motion pass and a separate reduced-motion/Effects off pass. Check the live narrow viewport with visible interaction cues.

**If deferred** Another functionally passing build can repeat the same creative omissions.

## Reference-by-reference trace

All images are static inspiration. Their proposed motion treatments are interpretations documented in the handoff. The arc and fan are alternative composition candidates. Particle, code-depth and pixel treatments are optional. A coherent selection needs to carry through the page.

| Reference | Direction available to ORIX | Present implementation | Audit position |
| --- | --- | --- | --- |
| [inspiration-1](creative-direction/inspiration-1.jpg) | Sculpted product depth, material and light | Tilted card with a flat shaded orbit | Partial surface/depth treatment, static |
| [website-inspiration-1](creative-direction/website-inspiration-1.jpg) | Concentrated illumination around a focal product | Faint Ice radial glow | Partial atmosphere, weak product response |
| [website-inspiration-2](creative-direction/website-inspiration-2.jpg) | Activation produces a visual result | Button selection swaps a panel | Functional response exists, activation choreography absent |
| [website-inspiration-3](creative-direction/website-inspiration-3.jpg) | Glass-like integration selection with a strong focal state | Small tiles, border/tint and text replacement | Partial and underdeveloped |
| [website-inspiration-4](creative-direction/website-inspiration-4.jpg) | Settled selectable tool arc | Static rectangular feature grid | Arc candidate unused |
| [website-inspiration-5](creative-direction/website-inspiration-5.jpg) | Selected dashboard fan/gallery | One dashboard image | Fan candidate unused, gallery absent |
| [website-inspiration-6](creative-direction/website-inspiration-6.jpg) | Floating product surface with focused edge light | Static hero card and ordinary screenshot frame | Partial shallow depth |
| [website-inspiration-7](creative-direction/website-inspiration-7.jpg) | Code-depth treatment around an opening | Text and data summaries in Open source | Optional code-depth candidate unused |
| [section-inspiration-1](creative-direction/section-inspiration-1.jpg) | Point-pattern assembly around a meaningful silhouette | No comparable motif | Optional candidate unused |
| [section-inspiration-2](creative-direction/section-inspiration-2.jpg) | Restrained fragment/pixel reveal | Generic fade/translate | Optional candidate unused |
| [cta-inspiration-1](creative-direction/cta-inspiration-1.jpg) | Flowing depth behind the closing action | Static concentric CSS rings | Optional flow treatment unused |

## Work that remains useful

The prototype already supplies the ORIX palette, Inter, approved logo geometry, licensed integration artwork, section anchors, factual beta.2 release wording, semantic FAQ disclosures, temporary note editing, a sample focus timer and presentation controls. Effects off and reduced-motion handling should remain part of the implementation. These are foundations for the correction.

## Proposed correction order

1. Establish the actual notch geometry and prepare the minimum corresponding product captures.
2. Build one convincing, discoverable collapsed-to-tool interaction and its reduced-motion alternative.
3. Compose the opening desktop scene around that interaction and check it in the narrow in-app browser.
4. Connect integration/theme selection to meaningful product visuals and a readable capture gallery.
5. Select a coherent lighting/depth treatment, add the short identity and visual-group transitions, and review them in motion.
6. Verify the creative acceptance checklist and controls together before presenting the next prototype as complete.

## Limits and disposition

Live checks here sampled the core controls and presentation, with source inspection covering all handlers. Full screen-reader, real mobile hardware, performance profiling, frame-timed animation measurement and public deployment/SEO checks were outside this audit.

## Prototype 03 follow-up — 2026-11-05

The [full archive review](ARCHIVE-REVIEW.md) replaces the earlier limited reference sampling with 21 site studies and all 25 captured motion recordings. Full-span temporal frames and selected dense excerpts were inspected across 92 sheets. Continuous playback smoothness remains unmeasured.

The corrected composition now has a working notch morph/replay/scrubber, a selectable tool arc, glass integration controls, an actual-dashboard gallery and flowing terrain. Prototype 03 adds a stable scroll-led tool stage, synchronized chapter controls, self-building illustrative input/work/result panels, optional finite story playback and visible provider signals. Header surfaces coordinate with Cloud and Obsidian sections. The [reference map](MOTION-REFERENCE-MAP.md) identifies the specific sources and adaptations.

The new [45-assertion browser check](../docs/reviews/website/orix-v3-check.js) verifies intermediate/settled states, four scroll chapters, stable stage geometry, keyboard selection, finite playback, pause/offscreen behavior, changing signal geometry, provider cancellation, five viewport widths and reduced-motion/normal-flow fallbacks. The existing interaction suite continues to exercise notch, timer, sample tools/providers, actual theme captures, gallery/dialog, canvas, mobile focus and no-JavaScript content against the current page.

Desktop, mobile and reduced-motion captures and a [normal-motion walkthrough](../docs/reviews/website/orix-v3-motion.webm) provide review evidence. The [Prototype 02 baseline](../docs/reviews/website/orix-website-v2.html) preserves the previous implementation. Final owner visual approval, fresh production tool/notch media, screen-reader testing, real-device performance and public deployment/SEO verification remain open.
