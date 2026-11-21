# Project transitions: push-through — design

Date: 2026-11-22 (corrected while planning: 690vh track, wall cover timing) · Branch: `redesign/index-worlds` · Builds on: `2026-11-21-portfolio-redesign-design.md`

## Intent

On the home page the four projects (Space Arabica, Korte, FluxTrack, Atlas Treasury) are pinned chapters that change as the reader scrolls. Today each new chapter opens as a circle of its colour. Joshua scrolled through it and found the circle "off" and "too plain", and asked for something more cinematic: "go all out".

Two things were wrong, and both get fixed:

1. **The feel.** The circle is tied 1:1 to the scroll position and runs over about a third of a screen of scroll, so each wheel click jumps it forward by a large step, and stopping partway leaves it frozen half-open. Frame rate is not the problem (measured 60 fps; p95 33 ms at 4× CPU throttle).
2. **The look.** A colour circle says nothing about the work. The transition should feel like a camera move through the projects.

Joshua compared three prototypes built from the real projects (push-through, title card, deck, plus the current circle) and chose **A · Push-through**.

## What the reader sees

Every move between two projects is one continuous camera move, driven by scroll. Timings below are fractions of the move (0 = the outgoing project at rest, 1 = the incoming project at rest).

**Outgoing project: the camera flies into its laptop screen**
- 0 → 0.56: the whole chapter scales up around the centre of the laptop's screenshot while that point slides to the centre of the viewport, accelerating (ease-in cubic), until the screenshot fills the viewport with ~15% overscan.
- 0 → 0.22: the words (label, name, line, button) lift and fade out. 0.02 → 0.25: the giant name fades out.
- 0.32 → 0.58: motion blur builds (to ~14 px, quadratic), as if the camera is rushing.

**Hand-off**
- 0.44 → 0.56 → 0.70: a soft flash in the incoming project's giant colour (radial, screen blend, peak ~50% opacity).
- 0.48 → 0.64: the incoming chapter fades in over the outgoing one, which is hidden from 0.64.

**Incoming project: it rushes out to meet the camera**
- 0.48 → 1: its scene grows from 62% to full size (ease-out cubic) around the showcase point (62% 46%), and its blur clears from ~12 px by 0.74.
- 0.54 → 1, staggered: the giant name stretches from condensed and light to its fitted width and weight (as today), the laptop rises and settles, the phone rises a beat later with a slight turn, then the words come in one by one (label, name revealed from a mask, line, button).

While resting on a project, the laptop and phone keep a slow parallax drift with scroll (as today), so the scene never looks frozen.

The approved prototype is `.superpowers/brainstorm/517-1795276536/content/transitions.html` (git-excluded, kept locally). It is the reference for timings and easing, and the numbers above are copied from it.

## How scrolling feels

- **Glide.** The page itself scrolls natively. Only the drawn progress of the chapters is smoothed: each frame it moves toward the real scroll position with a 130 ms time constant, so a wheel click glides instead of jumping.
- **Room.** The first arrival takes 0.7 of a screen of scroll once the section is pinned, each project rests for 0.55 of a screen, and each move takes 1 full screen. With four projects that is 5.9 screens of scroll, so the pinned track is 690vh, on every screen size.
- **Finish the move.** If scrolling stops partway through a move (no scroll for 170 ms), the page finishes the move in the direction the reader was heading, so a single arrow key or wheel notch out of a rest carries on to the next project. The dive from the list (from 0.6 of a screen before the section pins) up to Space Arabica's rest counts as a move; finishing it backward ends with the list in view. It never fires while a finger or a mouse button is held, any input stops a finish in flight, and it never fires again once a move has ended. Until the reader gives any input, a chapter named in the address wins (so a reload lands on that chapter). (Corrected after review: the first version finished to the nearer end with a quarter rule, which undid single steps forward.)

## First arrival and the exit

- **Arriving from the list (Space Arabica).** Today the first chapter opens as a circle over the list while its section scrolls in. It now arrives in the same camera language: as the list scrolls away, the wall of UI screens behind it rushes toward the camera (scales up and blurs), and Space Arabica emerges out of it with the same incoming half as above (fade, grow from 62%, blur clearing, staggered landing, flash). The section's top edge must never show as a hard line sliding up: the dive starts while the list is still scrolling away, and Space Arabica only begins to emerge once the stage is pinned (the stage itself is transparent, so the diving wall shows through it). The wall's existing "covered" signal (which fades the wall out over half a second) fires once Space Arabica is fully opaque over it, so that fade is never seen.
- **Leaving after Atlas Treasury.** Unchanged. The pinned stage scrolls away natively into About.

## Everything else that must keep working

- **Reduced motion.** No dolly, scale, blur, flash or glide, and no automatic finishing. Projects switch in a single cut at the middle of each move, as today, and the words and screens are shown at rest.
- **Phones and small screens (≤ 860 px wide).** Same choreography and the same 620vh track, with no blur (the most expensive part on phones). The dolly target is the laptop as laid out on that screen, including the landscape-phone layout.
- **The active project** is the one more than halfway through its move. It drives the chapter index, the address hash (`#work-<slug>`), the header colour, and which laptop frame morphs into the case study.
- **Deep links, Back and the chapter index** land each project at its rest position (the middle of its rest), now computed from the new layout. The zero-size anchors move to match.
- **Hidden words take no clicks.** When a project's words have faded out, its button can't be clicked by mistake (no pointer events below half opacity). Keyboard focus into a project still brings it to rest (as today).
- **No JavaScript.** Unchanged: the four chapters stay stacked full-screen sections.
- **Case-study morph and wipe.** Unchanged.

## Goals, non-goals, anti-goals

- **Goals.** A cinematic camera move between projects. A smooth feel on a mouse wheel, trackpad, touch and keyboard. The same frame rate as today.
- **Non-goals.** Changing the case-study page transitions, the project content or the layout at rest. Taking over the page's own scrolling.
- **Anti-goals (failure even if it works).**
  - The page scrolling on its own when the reader didn't expect it, or fighting their input.
  - Visible stutter on a mid-range phone.
  - Motion that ignores reduced motion.
  - The words of a project being unreadable at rest.

## Approaches considered

1. **Extend the site's own scroll engine (chosen).** Port the prototype's pose-per-frame approach into `ProjectWorlds` and the pure maths in `src/motion/scroll.ts`. This adds no dependencies, the page weight stays the same, the maths can be unit-tested, and it behaves exactly like the prototype Joshua approved.
2. **An animation library (GSAP ScrollTrigger, or Lenis).** Rejected. GSAP was deliberately removed in the redesign, and adding it costs about 70 KB on a page already below its Lighthouse target. Lenis would take over scrolling for the whole page.
3. **CSS scroll-driven animations.** Rejected. They follow the scroll exactly, so the glide after each wheel click (the main complaint) can't be built that way.

Joshua handed over the how; approach 1 is my call.

## Constraints

- Stack: React 18, TypeScript, Vite, SSR prerender. No new runtime dependencies.
- Pure motion maths lives in `src/motion/scroll.ts` and is unit-tested with `node:test`. Components measure the page and write styles.
- The 11 px minimum text size, existing accessibility behaviour, and every browser check except the ones this design deliberately changes keep passing.

## Calls I made (Joshua can overrule any of these)

- The wall of screens dives toward the camera as Space Arabica arrives, which extends push-through to the first project. The prototype didn't cover the first arrival.
- The exit after the last project is left as it is.
- "Finish the move" is on, as in the prototype's default.
- Phones get the move without blur.
- A move takes one screen of scroll on every screen size (phones used to get a shorter track).

## Left to the builder

- Exact code structure: for example, a pure `pushPose(t)` that returns numbers, applied by the component.
- Where the laptop screen is measured (at rest, on resize and after fonts load), and caching it.
- Fine-tuning the first-arrival timing within the constraint above.
- A test hook for the drawn progress under `?checks`, like `window.__wall`.

## How we'll know it works

- **Unit tests** for the layout maths: rest and move ranges, rest positions, the move index and fraction at any scroll position, finish-direction rules, and pose values at key points of a move.
- **Browser checks**, new or updated:
  - Mid-move, the outgoing project is scaled well above 1 around its laptop screen, and the incoming one is visible and growing.
  - After one wheel step, the drawn progress lags the real position and then catches up.
  - Stopping mid-move ends at a rest position, in the direction of travel.
  - Nothing finishes while a touch is held.
  - Reduced motion shows no transform, blur or flash, and cuts at the midpoint.
  - The existing checks for chapters, deep links, Back, focus, landscape and touch pass with the new rest positions.
- **Frame budget**: the same wheel-scroll measurement as before the change (1× and 4× CPU throttle), recorded in `docs/designs/implementation-checks.md`. At 1×, 95% of frames must come in at or under 17 ms, and nothing may be much worse than today's baseline at 4×.
- **Visual check**: frames at 0.2, 0.4, 0.5, 0.6, 0.75 and 0.95 of a move at 1440×900, 390×844 and 844×390, plus the first arrival.
