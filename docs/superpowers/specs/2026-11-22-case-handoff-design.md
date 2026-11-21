# Case studies keep going — design

Date: 2026-11-22 · Branch: `redesign/index-worlds` · Builds on: `2026-11-22-project-transitions-design.md` (the push-through)

## Intent

Today a case study ends in a dead end. There is a "Next project" block that has to be clicked (it opens the next case with a circle wipe), then the contact block and the footer. Joshua wants the case studies to **keep going**. At the end of Space Arabica, scrolling carries on into Korte through a cinematic move, without a click. He chose "carry on by itself" over "stop for a tap".

The move uses the same camera language as the home page's push-through, so the whole portfolio reads as one continuous camera.

## What the reader sees

This applies to every case study, in a loop: Space Arabica → Korte → FluxTrack → Atlas Accountancy → Space Arabica.

After "Looking back" comes the contact block ("Let's make something."), moved up from the end of the page. Then the **hand-off**: a pinned stage, measured in screens of scroll once it pins.

1. **Arrival (0 → 0.6).** As the contact block scrolls away, the next project emerges, the same incoming half as the home page's push-through:
   - its ground colour, a flash in its giant colour, and the scene growing from 62% with blur clearing;
   - its giant name stretching from condensed to full;
   - its laptop rising, showing the exact screenshot that tops its case study;
   - a label ("Next project · 02 / 04"), its one-line description, and a "Continue to Korte →" link with a quiet "Keep scrolling" hint.
2. **Hold (0.6 → 1.1).** The next project rests, readable. The laptop drifts slightly with scroll, as on the home page.
3. **Dive (1.1 → 2.0).** The words and the giant name leave, and the camera flies into the laptop's screenshot until it fills the viewport, with no blur at the end so it stays sharp. This is the dolly from the push-through.
4. **Landing.** When the dive completes (the end of the page), the browser opens the next case study by itself. A page transition morphs the full-screen screenshot into the next page's hero frame at the top, so the camera settles onto Korte's case study. The address becomes `/work/korte/`.

## Behaviour

- **Glide and finishing** match the home page.
  - The drawn progress glides with a 130 ms time constant.
  - A reader who stops inside the arrival or the dive has the move finished in the direction they were heading:
    - **Arrival:** forward ends at the hold; back ends at −0.6, with the contact block in view, never on an empty stage.
    - **Dive:** forward completes it, which opens the next case; back ends at the hold.
  - The same guards apply: nothing finishes under a held finger or button, and the reader's own input stops a finish in flight.
- **Opening the next case by itself** happens only once per page view, and only after the reader has actually scrolled (wheel, touch, keys, scrollbar) since the page loaded. A page that loads or is restored already at the end never navigates on its own.
- **Back** from the next case returns to the previous case at the **hold**, showing the next project at rest with its link. It does not show the full-screen screenshot and does not navigate again. The browser's own scroll restoration (or back-forward cache) can land at the end, so the page moves to the hold position in that case.
- **Keyboard and assistive tech.** The "Continue to …" link is a real link at every stage. Activating it from the hold morphs the laptop frame into the next page's hero, like home → case. Focus landing inside the hand-off brings it to the hold.
- **Reduced motion.**
  - There is no arrival animation, dive, glide or automatic opening.
  - The hand-off is an ordinary section at the end of the page, showing the next project at rest with the "Continue to …" link.
  - The page ends there.
- **No JavaScript.** The same static section with the link (prerendered).
- **Header** colour follows the next project's text colour while its ground fills the stage, as on the home page.

## Page changes

- **The `.case-next` block is replaced** by the hand-off section.
- **The contact block** moves from after the next-project block to right after "Looking back".
- **The footer** is removed from case study pages, since the hand-off makes it unreachable. It stays on the home page.
- **Page transitions** (`public/project-transitions.js`, `src/project-transitions.css`): case → case changes from the circle wipe to a frame morph.
  - **Old page:** the hand-off's laptop frame carries `view-transition-name: project-frame` during the navigation. The old page's own hero frame must not carry it at the same time, because duplicate names abort a transition.
  - **New page:** the hero frame carries it, as it already does for home → case.
  - The root crossfades, as in the existing morph.
  - The circle wipe CSS and check are retired.

## Goals, non-goals, anti-goals

- **Goals.** Reading on from one case study into the next with no click; one camera language across the site; Back that feels natural.
- **Non-goals.** Merging the case studies into one page; changing the case studies' content; changing home ↔ case transitions.
- **Anti-goals.**
  - Opening a page the reader didn't head for: a bounce at the end, a restored scroll position, or a reload must never navigate.
  - Trapping keyboard or screen-reader users.
  - Ignoring reduced motion.
  - A blurry or jumping landing on the next page.

## Approaches considered

1. **A scroll-driven hand-off at the end of each case page, then a real navigation with a frame morph (chosen).** It reuses the push-through maths and the existing view transitions, and keeps the separate prerendered pages, links and history.
2. **All four case studies on one long page.** Rejected: it gives up the separate prerendered pages, makes each load heavier and complicates Back and links. A rewrite for the same effect.
3. **Keep a click, with a more cinematic transition.** Rejected: Joshua asked for the case study to carry on by itself.

## Constraints

- No new dependencies.
- Pure maths stays in `src/motion/scroll.ts`, unit-tested, with no imports.
- The 11 px text floor, existing accessibility behaviour, and every existing check pass. The circle-wipe check is replaced, not just deleted.

## Calls I made (Joshua can overrule any of these)

- It applies to all four case studies, looping from Atlas back to Space Arabica.
- Contact moves above the hand-off, and the footer leaves case pages.
- The hand-off shows the next project's laptop only, with no phone, because the laptop is what the camera dives into and what the next page opens on.
- The dive ends sharp, with no blur at its end, so the landing on the next page doesn't jump from blurred to crisp.
- Back lands on the hold, not on the full-screen screenshot.
- With reduced motion the page simply ends with the link.

## Left to the builder

- **Exact timings** inside each phase. Reuse `pushIn`, `landing`, `dolly` and `glide` where they fit.
- **How the old page names its hand-off frame** for the transition without double-naming its hero, for example a transition-side attribute set in `pageswap`.
- **How "the reader has scrolled since load"** is tracked, using the same input signals as the home page.

## How we'll know it works

**Unit tests:**
- the hand-off timeline (phase and fraction at any position);
- the finish targets, including the arrival's back end at −0.6 and the dive's back end at the hold.

**Browser checks:**
- **Continues:** wheel through the end of Space Arabica and the address becomes `/work/korte/`, with Korte's hero in view and the page transition recorded as the frame morph.
- **Loop:** Atlas → Space Arabica.
- **Back:** after continuing, Back returns to Space Arabica at the hold, and it is still there two seconds later.
- **No accidental navigation:** reloading at the end, or opening the page already scrolled to the end, never navigates.
- **Finishing back:** stopping mid-dive heading back returns to the hold.
- **Keyboard:** the "Continue to …" link works from the hold.
- **Reduced motion:** scrolling to the end stays put and the link works.
- **No JavaScript:** the static section and link are present.
- **Unchanged:** no horizontal overflow at 390 and 320 px; header contrast over the next project's ground; all existing checks still pass, with the wipe check replaced by the new frame-morph check.
