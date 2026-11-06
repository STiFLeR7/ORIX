# ORIX website animation and interaction specification

Status on 2026-11-05. Candidate treatments follow the owner's approved reference direction. Timing and movement values are proposed starting points. The [creative-direction inventory](CREATIVE-DIRECTION.md) identifies the static source images and inferred motion ideas.

## Motion roles

Use movement to explain the layer's position, show an interaction result or support a transition between product states. Let content and controls reach a stable readable state. The aperture/wordmark sequence follows the existing brand guidance.

| Role | Proposed duration | Proposed movement | Completion |
| --- | --- | --- | --- |
| Button/control feedback | 120–160 ms | Surface/border change, optional 1 px press offset | Settles immediately after input |
| Card selection | 160–220 ms | Small elevation or scale change up to 1.02 | Selected state remains visible |
| Illustrative notch expansion | Around 220 ms | Morph a preview container between supported shapes | Lands on the selected product state |
| Section/product reveal | 320–480 ms | Opacity and 12–24 px translation | Once per section on initial discovery |
| Related-item stagger | 40–60 ms between items | Same reveal applied to a small group | Entire group settles within about 600 ms |
| Background atmosphere | 12–20 second cycle | Low-amplitude gradient/light movement | Controlled by the effects preference |

Use a smooth ease-out curve such as `cubic-bezier(0.2, 0, 0, 1)` as a proposed default. Prioritize opacity and transforms when practical. Website timing can be adjusted after testing alongside actual product recordings.

## Product and identity animation

- Reveal the aperture boundary and opening briefly, followed by the complete supplied wordmark.
- Present a collapsed notch and the selected expanded/tool state with correct proportions.
- Preserve crisp source imagery inside any animated frame.
- Keep the introduction, primary link and navigation available throughout decorative animation.
- Allow replay of longer product explanations through an explicit control.

## Micro interactions

| Element | Trigger | Behavior |
| --- | --- | --- |
| Primary action | Hover, focus, press | Clear feedback with a stable hit area and visible label |
| Integration selection | Click, tap or keyboard activation | Update the selected state, explanation and associated preview |
| Screenshot gallery | Named previous/next controls or a selected thumbnail | Bring the chosen view into a readable position |
| FAQ disclosure | Click, tap, Enter or Space | Update expanded state and expose the answer |
| Mobile menu | Open/close control and Escape | Preserve predictable focus and restore it to the trigger on close |
| Video dialog | Explicit play action | Open accessible playback controls, retain a close action and restore focus on exit |

Choose the correct semantic pattern during implementation. Tabs need the tab keyboard pattern and programmatic relationships. A simpler group of buttons can update a labeled preview when that better fits the content.

## Scroll behavior

Use ordinary document scrolling and stable anchor destinations. A section may reveal its product visual when roughly one quarter of that visual enters the viewport. Essential text remains present throughout. Users can proceed directly to another section regardless of animation progress.

Use restrained transitions between sections. If a desktop composition uses a sticky visual, confirm that the content remains comprehensible at browser zoom and on short screens. Narrow layouts use a normal stacked arrangement. Optional depth effects must retain a flat, complete alternative.

## Background flow

Candidate treatments include soft Ice light, a low-contrast gradient, restrained code depth and a point/particle field. Begin with one active decorative region in view. Its visual layer sits beneath opaque or sufficiently contrasted copy and controls.

Pause decorative processing when the region leaves view or the document is hidden. Background movement must not follow or obstruct interactive targets. Keep a static poster/background available for small devices and limited rendering environments.

## Reduced motion and continuous effects

Honor `prefers-reduced-motion`. With reduced motion enabled, show complete static artwork, settled cards and immediate preview changes. Essential state changes remain available. Playback begins through explicit user input.

Provide an icon-only animation pause control with a clear accessible name wherever continuous decoration is included. Its paused state stops background movement and optional pointer/scroll transforms. A change to the system motion preference should be reflected during the visit.

Automatically starting movement lasting more than five seconds alongside other content needs an applicable pause, stop or hide mechanism. The icon-only pause control supplies that mechanism for the proposed decorative treatment. This handoff also adopts disabling nonessential interaction motion as a design requirement. The latter is covered by the Level AAA interaction-animation criterion. [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [W3C Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## Video and optional effects

Use a poster, explicit playback control, captions and a useful text summary for the launch film. A practical product recording can be presented separately with clear controls. Evaluate particle and pixel-reveal effects for readability and flashing before selection. Treat any WebGL/3D implementation as an optional enhancement with a static fallback.

## Motion acceptance

- Complete the product story with system reduced motion enabled and with animation paused.
- Verify hover, keyboard focus, touch and selected states independently.
- Verify that focus and hit areas remain stable during animation.
- Check text/background contrast across the entire decorative cycle.
- Verify pause behavior for hidden/offscreen content and continuous effects.
- Test real mobile hardware, browser zoom and low-power conditions.
- Confirm that anchors and navigation operate before every animation has settled.

Production now includes directional hero trails, moving connection light, staggered connection tiles, the source ribbon and a travelling crest across the closing point field. These effects use the existing pause control, stop offscreen or with a hidden tab, and settle under reduced motion. Real-device performance and final visual approval remain open.
