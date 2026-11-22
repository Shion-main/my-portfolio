# Case hand-off as a whip pan — design

Date: 2026-11-22 · Branch: `redesign/index-worlds` · Changes: `2026-11-22-case-handoff-design.md` (replaces its arrival, dive and landing; everything else there stands)

## Intent

The hand-off at the end of each case study works, but it borrows the home page's push-through: the next project emerges with the same flash and grow, and the camera dives into its laptop. Joshua wants the case → case move to be **its own cinematic transition, not the same as the main page**. From three prototypes (title card, whip pan, split doors) he picked **B, the whip pan**: the camera whips sideways like a film cut. The page streaks off to the left as the next project races in from the right. Its giant name and laptop move at different speeds, and cinema bars close in mid-move.

The home page keeps the push-through (forward and back). The case studies get the whip. Home is a dive *into* a project; between case studies the camera *pans along* from one to the next.

## Approaches considered

- **A · Title card.** Cut to black, the next project's name is a window into its world, then the camera flies through a letter. Strong, but it is still a dive through something, so it is close to the home page.
- **B · Whip pan (chosen).** A sideways move: nothing on the home page travels sideways, so it reads as new.
- **C · Split doors.** The page parts top and bottom around a light seam. It is new too, but it is slower and more decorative, and it ends on a reveal rather than a move into the next case.

## What the reader sees

Every case study, in the same loop: Space Arabica → Korte → FluxTrack → Atlas Accountancy → Space Arabica. Positions are screens of scroll; 0 is where the stage pins.

1. **Contact (rest, up to 0.35).** The contact block ("Let's make something." and the email) now opens the pinned stage instead of scrolling away above it. It scrolls in exactly as it looks today, then holds still for a moment.
2. **Whip in (0.35 → 1.35).** The camera whips right:
   - the contact block streaks off to the left with a slight skew and motion blur;
   - the next project races in from the right, on its own ground colour;
   - parallax inside it: its giant name runs ahead and its laptop lags behind, then both settle; the name tightens from extra-wide to its normal width as it lands;
   - thin horizontal streaks in its giant colour sweep across, and black cinema bars close in to about 9% of the screen at the fastest point, then open;
   - its label ("Next project · 02 / 04"), line and "Continue to Korte →" link fade in last.
3. **Hold (1.35 → 1.75, rests at 1.55).** The next project at rest, the same layout as today, with the laptop showing the screenshot that tops its case study.
4. **Whip out (1.75 → 2.6).** Scrolling on starts a second whip in the same direction: the scene accelerates off to the left (name first, laptop last), blur and streaks build, and the bars close. At the end the screen is a blur of the next project's colours, in the middle of the move.
5. **Landing.** The next case opens by itself, and the page transition finishes the whip: the old frame keeps sliding left and fades, and the new case study slides in from the right, unskewing, its blur clearing as it slows to a stop on the hero. The site header stays still through it, like a camera's frame. The scroll accelerates into the cut and the page transition slows out of it, so it reads as one whip across the page change.

The "Continue to …" link at the hold plays the same landing on its own: the next project at rest whips off left and the case study arrives from the right.

## Behaviour (unchanged rules, new positions)

- **Glide and finishing** as today: the drawn position glides with a 130 ms time constant. A reader who stops mid-move has it finished in the direction they were heading:
  - **Whip in:** forward ends at the hold (1.55); back ends at 0, the contact block at rest.
  - **Whip out:** forward completes it and opens the next case; back ends at the hold.
  - Nothing finishes under a held finger or button, and the reader's own input stops a finish in flight.
- **Opening by itself:** once per page view, only after the reader has scrolled since the page loaded, and only when heading forward. A page that loads or is restored past the hold rests at the hold.
- **Back** from the next case crossfades (as now) and rests at the hold.
- **End key** goes to the hold. A width change keeps the reader's place.
- **`#contact`** on a case study lands on the contact block at rest. (The header's Contact link goes to the home page's contact block, as now.) Focus on the email link brings the contact block into view; focus on the "Continue to …" link brings the reader to the hold.
- **Reduced motion and no JavaScript:** no whip, glide or automatic opening. The page ends with the contact block, then the next project at rest with its link, as today. The page transition between case studies is skipped.
- **Phones and landscape phones:** the same whip. Distances are in screen widths, so it scales. In the stage, the contact block keeps its look, but its top padding shrinks on short screens (at most 16% of the screen height), so it fits a landscape phone.

## Constraints

- The whip must hold the frame budget the push-through holds (the existing GPU frame check, same ceiling). Blur is capped at 10px on desktop and 6px below 860px wide. Streaks are one moving gradient layer, not many elements.
- Back/Forward between case studies keeps the plain crossfade. Home ↔ case keeps the frame morph.
- The motion maths stays pure in `src/motion/scroll.ts`, tested with `node:test`.
- Every hand-off rule that is checked today keeps a check (once, after input, forward only, Back at the hold, restore, rotation, toolbar, End key, sized before the app runs, reduced motion).

## What it replaces

- The `dive` page-transition kind between case studies becomes `whip`. The named laptop frame is no longer morphed between case studies.
- The hand-off's dolly and dive code, and its arrival flash and grow, are removed.
- The contact block moves inside the hand-off's pinned stage on case pages. On the home page it is unchanged.

## Left to the builder

The exact curves (prototype B is the reference: ease-in-out-quart for the move, peak blur and skew at the midpoint), the streak artwork, the bar colour (black), how the contact block becomes a layer without changing its look as it scrolls in, and how the checks read the whip's position.

## Revision (2026-11-22): one pan, and phones on transforms only

Joshua saw two transitions between case studies, and the second one looked off. Recorded frame by frame, the move was:
the in-page whip out (about 0.9 s), then almost half a second of empty, blurred screen while the next page loaded, then
a second, skewed whip that showed seams at its slanted edges. On his phone the transitions also ran at about 16 frames
a second.

- **The pull replaces the whip out.** Past the hold, 0.4 screens of scroll (1.75 → 2.15; the track is now 3.15
  screens) lean the next project about 8vw to the left, its name a little ahead, with a touch of blur. Stopping inside
  finishes it as before: forward commits, back returns to the hold. The screen is never empty.
- **One pan replaces the second whip.** On commit (or a click on “Continue”), the page transition pans both pages
  together, edge to edge, on one curve (760 ms, cubic-bezier(.7, 0, .2, 1)): the old page out to the left, the next
  case study in from the right, blur peaking mid-pan. No skew. The header holds still.
- **No wait before the pan.** Once the reader is within 1.5 screens of the hand-off, the next case study is prerendered (Chromium, speculation rules; other browsers prefetch it). It opens as soon as the reader's own forward scroll reaches the end of the pull, not when the drawn lean has glided there (that slow last stretch read as a pause); a layout shift that moves the position, such as a phone toolbar resizing screen-height content, never opens it. Measured: about 0.65 s from reaching the end to opening before, under 0.35 s after.
- **Phones (860px wide or less): transforms only.** No blur on the shots or in the pan, no streak layer, no
  per-frame change to the giant name's font width, layers promoted for transform only, and a solid header instead of
  a frosted one (the frosted header re-blurred the moving page beneath it every frame). This follows the home page,
  where phones already get the push-through without blur.
