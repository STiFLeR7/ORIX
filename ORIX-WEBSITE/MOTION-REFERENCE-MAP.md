# ORIX motion reference mapping

Updated 2026-11-05 for Prototype 03 after the full `D:/WEBSITE-INSPIRATIONS/` review.

## Evidence reviewed

The [full archive review](ARCHIVE-REVIEW.md) covers all 21 site studies and all 25 captured motion recordings. The recordings were decoded into full-span timestamped sheets and selected denser excerpts. All 92 sheets were visually inspected. This temporal review establishes changing states and sequence. Continuous playback smoothness and exact easing remain unmeasured.

The earlier 11 JPG references continue to govern visual composition alongside ORIX's identity. This mapping adds interaction and motion patterns from the website archive.

## Applied patterns

| Reference | Archived evidence | ORIX adaptation | Verification |
| --- | --- | --- | --- |
| Anime.js | Chapter scrubber and the distinction between continuously changing geometry and discrete scene states | A native range control scrubs the layer from resting geometry through Tools to Note. Named chapter buttons provide direct access. | Keyboard Home, ArrowRight and End, intermediate geometry and final Note state |
| Superset | Stable product frame with individual job states and a short hero handoff | The same layer hosts each tool. Native scrolling settles and fades the supporting dashboard sheet while keeping the layer as the focal object. Integration glass responds to pointer position. | Tool selection, scroll-derived handoff progress and mouse/touch-independent button operation |
| Giga | Named step navigation that follows and controls a demonstration | Resting, Tools and Note buttons remain synchronized with automatic replay and direct tool selection. Replay retains short timed beats. | Selected chapter state and the collapsed → home → note → home sequence |
| Granola | Light inspection sections and full-bleed brand-tinted bands | Cloud tool section and Ice dashboard-inspection section alternate with the dark product/connection chapters. | Desktop/mobile compositions and actual Light/Dark capture switching |
| Tempo, Giga, Guild and Zoah | Stable media stage with synchronized process statements. Tempo's 7.2–10.2 s excerpt and Zoah's 7.5–10.5 s excerpt show the stage holding as the chapter changes. | A compact native-scroll tool tour selects Notes, Focus, Clipboard and File tray. The chapter buttons, existing arc, preview and progress line share one selected state. | All four scroll positions, pinned geometry, keyboard activation and direct arc/chapter synchronization |
| AgentCat, Amperos, Granola, Polar and V7 Labs | Inputs develop through local work rows into an observable result while the frame remains steady. | Original DOM vignettes reveal prepared input, two work rows and one Ice result card. Focus adds a finite progress fill. The final state stays readable. | Intermediate result opacity, settled result, finite four-chapter playback and final hold |
| Intercom and Handhold | Readable holds, visible progression and compact controls | Play/Pause/Replay runs one finite tool story. Native scrolling and direct controls take priority. Leaving the region, hiding the tab or disabling motion stops the story timer. | Pause holds the chapter, offscreen stops playback, one-pass completion and motion-off checks |
| Agiloft, Tempo and Reveni | A single active route makes the integration mechanism legible. | An original Ice signal travels from Your work through the approved Aperture to the selected provider. The existing sample session clock resolves the route and status together. | Time-varying dash offset, completion state, provider-change cancellation and ChatGPT prepared-response state |
| Solidroad and Concurrence | Surface boundaries coordinate the header's palette and content. | The Cloud tool chapter has a rounded entry over Obsidian. Header background, original logo silhouette, navigation and controls adopt the current section's contrast. | Cloud and Obsidian header states, mobile view and reduced-motion transition removal |

The implementation uses original ORIX HTML, CSS, JavaScript and supplied project assets. The reference library remains a private study source. Existing image/font/provider notices stay with the embedded project assets.

## Local source records

- [Anime.js motion study](D:/WEBSITE-INSPIRATIONS/ANIMEJS/INTERACTIONS_AND_MOTION.md) and [takeaways](D:/WEBSITE-INSPIRATIONS/ANIMEJS/TAKEAWAYS.md).
- [Anime.js scrubber frame 1](D:/WEBSITE-INSPIRATIONS/ANIMEJS/visuals/animejs__desktop__seq-drag-scrubber-01.png) and [frame 4](D:/WEBSITE-INSPIRATIONS/ANIMEJS/visuals/animejs__desktop__seq-drag-scrubber-04.png).
- [Superset motion study](D:/WEBSITE-INSPIRATIONS/SUPERSET/INTERACTIONS_AND_MOTION.md) and [takeaways](D:/WEBSITE-INSPIRATIONS/SUPERSET/TAKEAWAYS.md).
- [Superset hero frame 1](D:/WEBSITE-INSPIRATIONS/SUPERSET/visuals/superset__desktop__seq-hero-scroll-01.png) and [frame 6](D:/WEBSITE-INSPIRATIONS/SUPERSET/visuals/superset__desktop__seq-hero-scroll-06.png).
- [Giga motion study](D:/WEBSITE-INSPIRATIONS/GIGA/INTERACTIONS_AND_MOTION.md), [takeaways](D:/WEBSITE-INSPIRATIONS/GIGA/TAKEAWAYS.md) and [chat frame 4](D:/WEBSITE-INSPIRATIONS/GIGA/visuals/giga__desktop__seq-chat-04.png).
- [Granola takeaways](D:/WEBSITE-INSPIRATIONS/GRANOLA/TAKEAWAYS.md) and [Zoah motion study](D:/WEBSITE-INSPIRATIONS/ZOAH/INTERACTIONS_AND_MOTION.md).

## Controls and limits

Normal scrolling, anchor navigation, labeled buttons and the keyboard-operable range control remain available. No wheel interception or external animation dependency is used. The desktop tour pin requires at least 1100×760 CSS pixels and enabled motion. Narrow and short viewports use normal flow. Motion off and the system reduced-motion preference release the pin, hide timed playback controls and settle the visuals. Direct chapter selection and the opening range continue to work.

The prepared tool content enters over approximately 1.65 seconds, then holds. Optional playback advances every 3.2 seconds and finishes after one pass. The finite provider signal shares the existing 1.6-second sample-session completion timer. Pointer/touch scrolling, navigation keys, offscreen state, a hidden tab and motion preference changes stop story playback. Decorative CSS is paused offscreen or while the tab is hidden.

The [45-assertion Prototype 03 check](../output/playwright/orix-v3-check.js) and [result](../output/playwright/orix-v3-check-result.txt) cover the new story and signal behavior. The [existing interaction check](../output/playwright/orix-v2-check.js) also runs against the updated prototype. The [Prototype 02 baseline](../output/playwright/orix-website-v2.html) is retained for comparison.

The product interactions remain prepared illustrations. The gallery uses actual beta Overview images and detail crops. Fresh production tool/notch/connection captures, owner visual approval and real-device performance profiling remain open.
