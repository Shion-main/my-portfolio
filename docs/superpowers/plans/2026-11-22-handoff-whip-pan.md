# Whip-pan hand-off Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the case hand-off's push-through arrival and laptop dive with a sideways whip pan: the contact block whips off left as the next project races in, it holds, then a second whip carries on into the next case study across the page change.

**Architecture:** The whip's timeline and curves are pure functions in `src/motion/scroll.ts`. `CaseHandoff.tsx` keeps its glide, finishing, opening and restore logic and draws the new curves. The contact block moves inside its pinned stage as the first shot. The cross-document view transition between case studies becomes a new kind, `whip`, that slides the old page out left and the new one in from the right.

**Tech Stack:** React 18 + TypeScript, Vite 5 (SSR prerender), CSS, cross-document View Transitions, `node:test`, Playwright 1.63 checks.

**Spec:** `docs/superpowers/specs/2026-11-22-handoff-whip-pan-design.md`. Unchanged rules come from `docs/superpowers/specs/2026-11-22-case-handoff-design.md`.

## Global Constraints

- Positions are screens of scroll from where the stage pins:
  - contact rest up to 0.35;
  - whip in 0.35 → 1.35;
  - hold 1.35 → 1.75, resting at 1.55;
  - whip out 1.75 → 2.6;
  - track 3.6 screens (`360vh`).
- Finishing:
  - whip in: forward → 1.55, back → 0;
  - whip out: forward → 2.6 (opens the next case), back → 1.55;
  - nothing finishes under a held finger or button; input stops a finish in flight.
- Blur is capped at 10px on desktop and 6px at 860px wide or less. The cinema bars are black and peak at 9vh. The streaks are one moving gradient layer.
- Unchanged:
  - the 130 ms glide and 170 ms settle;
  - opens once, only after reader input, only heading forward;
  - a load or restore past the hold rests at the hold;
  - End goes to the hold;
  - a width change keeps the place;
  - Back between case studies is `fade`;
  - home ↔ case is `morph`;
  - reduced motion skips the transition.
- Reduced motion and no JavaScript: the contact block, then the next project at rest with its link. No whip, glide or automatic opening.
- The home page and its push-through are not touched.
- `src/motion/scroll.ts` stays pure: no imports, no DOM.
- Every commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Focus between the two shots.** Tab and Shift+Tab move between the email link (contact shot) and "Continue to …" (next-project shot). Each must bring its own shot on screen, never leave focus on something off screen. Covered by Task 2's `handoff-keyboard`.
2. **Rotation or resize at the contact rest.** The reader stays on the contact block, not snapped to the hold. Covered by Task 2's `handoff-rotate-at-hold`.
3. **Horizontal overflow.** The next project parked 105vw to the right must never widen a phone's page. Covered by Task 2's `handoff-phone`, which checks mid whip-in.
4. **Header colour.** It stays the case study's own colour over the contact block, and takes the next project's text colour only once that project covers the screen. Covered by Task 2's `handoff-whip-frames`.
5. **Blending during the landing.** The two root snapshots overlap while one slides over the other, and the browser's default `plus-lighter` blending would brighten that overlap. Covered by Task 3's `mix-blend-mode: normal` rule and the frame review in Task 4.

---

### Task 1: Whip timeline and curves

**Files:**
- Modify: `src/motion/scroll.ts` (add `easeInOut4` beside the other easings; replace the hand-off section, lines 133–163)
- Test: `scripts/tests/motion.test.mjs` (import line 7; replace the two hand-off tests, lines 115–129)

**Interfaces:**
- Produces:
  - `HANDOFF = { IN_FROM: 0.35, IN_TO: 1.35, HOLD: 1.55, OUT_FROM: 1.75, OUT_TO: 2.6 } as const`
  - `handoffTrackScreens(): number`, which returns `HANDOFF.OUT_TO + 1` (3.6)
  - `type HandoffPhase = { phase: "contact" | "in" | "hold" | "out" | "done"; t: number }`
  - `handoffPhase(s: number): HandoffPhase`:
    - `contact` (t 0) below `IN_FROM`;
    - `in` with t across `IN_FROM → IN_TO`;
    - `hold` (t 1) below `OUT_FROM`;
    - `out` with t across `OUT_FROM → OUT_TO` while `s < OUT_TO - 0.002`;
    - otherwise `done` (t 1).
  - `handoffSettle(s: number, dir: 1 | -1): number | null`: spans `[IN_FROM, IN_TO]` → forward `HOLD`, back `0`; `[OUT_FROM, OUT_TO]` → forward `OUT_TO`, back `HOLD`; the same 0.005 edge tolerance as today.
  - `easeInOut4(t: number): number`
  - `whipEnter(t: number, fit: number)` returns `{ contactX, worldX, skew, blur, streaks, streakX, bars, giantX, giantW, deskX, infoO, infoX }`.
  - `whipLeave(u: number)` returns `{ infoO, infoX, giantX, deskX, skew, blur, streaks, streakX, bars }`.
  - Units: `…X` in vw, except `infoX` in `whipEnter`, which is in px. `skew` in degrees. `blur` is 0–1, a fraction of the cap. `streaks` is opacity 0–1. `bars` in vh.

- [ ] **Step 1: Write the failing tests** (replace the two hand-off tests; add `whipEnter, whipLeave` to the import and drop the old names the tests no longer use)

```js
test("case hand-off timeline", () => {
  assert.deepEqual(handoffPhase(-0.3), { phase: "contact", t: 0 });
  assert.equal(handoffPhase(.2).phase, "contact");
  const w = handoffPhase(.85); assert.equal(w.phase, "in"); near(w.t, .5);
  assert.deepEqual(handoffPhase(1.55), { phase: "hold", t: 1 });
  const o = handoffPhase(2.175); assert.equal(o.phase, "out"); near(o.t, .5);
  assert.equal(handoffPhase(2.599).phase, "done");
  near(handoffTrackScreens(), 3.6);
});

test("case hand-off finishing", () => {
  near(handoffSettle(.8, 1), 1.55); near(handoffSettle(.8, -1), 0);
  near(handoffSettle(2, 1), 2.6); near(handoffSettle(2.5, -1), 1.55);
  for (const s of [-.5, .2, .35, 1.55, 1.75, 2.598]) assert.equal(handoffSettle(s, 1), null, String(s));
});

test("whip in: the contact block out, the next project in, fastest in the middle", () => {
  const a = whipEnter(0, 122), m = whipEnter(.45, 122), b = whipEnter(1, 122);
  near(a.contactX, 0); near(a.worldX, 105); near(a.bars, 0); near(a.blur, 0); near(a.streaks, 0); near(a.infoO, 0);
  near(m.contactX, -52.5); near(m.worldX, 52.5); near(m.skew, -8); near(m.bars, 9); near(m.blur, 1); near(m.streaks, .9);
  for (const k of ["worldX", "giantX", "deskX", "infoX", "skew", "bars", "blur", "streaks"]) near(b[k], 0);
  near(b.contactX, -105); near(b.giantW, 122); near(b.infoO, 1);
  const h = whipEnter(.5, 122);
  assert.ok(h.giantX < 0 && h.deskX > 0, "the name runs ahead and the laptop lags behind");
});

test("whip out: the name leaves first, the laptop last, building to a blur", () => {
  const a = whipLeave(0), m = whipLeave(.5), b = whipLeave(1);
  for (const k of ["giantX", "deskX", "infoX", "skew", "blur", "streaks", "bars"]) near(a[k], 0);
  near(a.infoO, 1);
  assert.ok(m.giantX < m.deskX, "the name leads");
  near(b.infoO, 0); near(b.giantX, -140); near(b.deskX, -125); near(b.skew, -8); near(b.blur, 1); near(b.bars, 9);
});
```

- [ ] **Step 2: Run and watch them fail**

Run: `node --test scripts/tests/motion.test.mjs`
Expected: FAIL (`handoffPhase(-0.3)` is `before`; `whipEnter is not a function`).

- [ ] **Step 3: Implement in `src/motion/scroll.ts`**

The curves are prototype B's (`.superpowers/brainstorm/517-1795276536/content/handoff-transitions.html`, `pan`):

- **`whipEnter`:** with `p = easeInOut4(range(t, .05, .85))`:
  - `contactX = -105p` and `worldX = 105(1 − p)`;
  - `skew = −8·tri(t, .05, .45, .85)`;
  - `blur = tri(t, .1, .45, .8)`;
  - `streaks = .9·tri(t, .12, .45, .78)` and `streakX = −60p`;
  - `bars = 9·tri(t, .05, .45, .9)`;
  - `giantX = −40·(1 − easeOut4(range(t, .15, .95)))` and `giantW = lerp(150, fit, easeOut3(range(t, .3, 1)))`;
  - `deskX = 26·(1 − easeOut3(range(t, .25, 1)))`;
  - `infoO = range(t, .7, 1)` and `infoX = −30·(1 − easeOut3(range(t, .7, 1)))`.
- **`whipLeave`:**
  - `infoO = 1 − range(u, 0, .3)` and `infoX = −120·easeIn3(range(u, 0, .7))`;
  - `giantX = −140·easeIn3(range(u, 0, .85))`;
  - `deskX = −125·easeIn3(range(u, .1, 1))`;
  - `skew = −8·range(u, .1, 1)`;
  - `blur = range(u, .2, 1)`;
  - `streaks = .9·range(u, .15, .9)` and `streakX = −60·easeIn3(u)`;
  - `bars = 9·range(u, .1, 1)`.
- **Returned values:** pass them through the file's `z()` so no `-0` leaks into styles.
- **Doc comments:** update the hand-off section's comments to describe the whip.
- **Between tasks:** `CaseHandoff.tsx` still names the old keys until Task 2. Run only unit tests between Task 1 and Task 2.

- [ ] **Step 4: Run and watch them pass**

Run: `npm test`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add src/motion/scroll.ts scripts/tests/motion.test.mjs
git commit -m "Time the case hand-off as a whip pan"
```

---

### Task 2: The whip in the page

**Files:**
- Modify: `src/components/CaseHandoff.tsx` (markup and `draw`; remove the dive)
- Modify: `src/components/handoff.css`
- Modify: `src/components/SiteChrome.tsx:18-26` (`Contact` props)
- Modify: `src/pages/ProjectCase.tsx:89` (remove `<Contact />` and its import if unused)
- Modify: `scripts/check-browser.mjs` (hand-off helpers and checks, lines 918–1170)
- Modify: `scripts/check-static.mjs:91`

**Interfaces:**
- Consumes: everything Task 1 produces.
- Produces:
  - **`Contact`:** `Contact({ anchor = true, className = "" }: { anchor?: boolean; className?: string })`. It carries `id="contact"` only when `anchor`.
  - **Hand-off DOM:** `div.handoff` holds, in order:
    1. `span#contact.handoff__anchor`, absolute at the track's top;
    2. `div.handoff__stage`, containing:
       - `section.contact.handoff__contact`;
       - `section.handoff__world[aria-labelledby=handoff-title]`, with its scene, info, desk and giant as today;
       - `div.handoff__streaks`;
       - `div.handoff__bar.handoff__bar--top` and `div.handoff__bar.handoff__bar--bottom`.

    The streaks and both bars are `aria-hidden`.
  - **`window.__handoff`:** its API is unchanged.

- [ ] **Step 1: Update the checks and write the new ones** in `scripts/check-browser.mjs`

At the top: `import { loadTs } from "./tests/load-ts.mjs";` and `const { HANDOFF, handoffTrackScreens } = await loadTs("src/motion/scroll.ts"); const HS = handoffTrackScreens();`. Then:

- **Helpers:**
  - `handoffGoTo` and `handoffPos` divide `.handoff`'s `offsetHeight` by `HS`, passed in as an argument, instead of `3`.
- **Positions:**
  - every `.85` in the hand-off checks becomes `HANDOFF.HOLD`;
  - `1.9` becomes `HANDOFF.OUT_TO - .1`;
  - `1.5` becomes `(HANDOFF.OUT_FROM + HANDOFF.OUT_TO) / 2`;
  - `1.999` becomes `HANDOFF.OUT_TO - .001`;
  - `3 * innerHeight` becomes `HS * innerHeight`, passed in;
  - positions read as `/ innerHeight` in `handoff-back-holds` and `handoff-keyboard` use `handoffPos`.
- **`handoff-back-holds`:** replace the scale assertion. The `.handoff__scene` transform is `none` or the identity, and the `.handoff__world` rect's `left` is within 1px of 0.
- **`handoff-phone`:**
  - replace "the dive fills the screen" with: at `OUT_TO - .001`, the info, giant and desk rects all have `right <= 0`, and the world rect still covers the screen (`left <= 1`, `right >= w - 1`);
  - add: at `IN_FROM + .45 * (IN_TO - IN_FROM)`, `document.documentElement.scrollWidth - innerWidth <= 0`, and the world's `filter` blur radius is at most 6px (the phone cap).
- **`handoff-restored-mid-arrival`** becomes `handoff-restored-mid-whip`. It restores to `IN_FROM + .1` instead of `.02`, then expects within 1800 ms the world rect's `left` within 1px of 0 and the contact rect's `right <= 0`.
- **`handoff-rotate-at-hold`** also rotates at 0.2 (the contact rest) and expects `Math.abs(handoffPos - .2) <= .05`.
- **`handoff-keyboard`:**
  - focus `.contact-mail` → the position is within `[-.02, IN_FROM + .02]` and the email link's rect is inside the viewport;
  - Tab → `.handoff__continue` is focused, at the hold ±.05;
  - Shift+Tab → `.contact-mail` is focused and the position is `<= IN_FROM + .02`;
  - Tab, then Enter → opens `/work/korte/`.
- **`handoff-reduced`:** add a check that the contact heading's document top is above `#handoff-title`'s document top.
- **New `handoff-whip-frames`** (1440×900, `settle(false)`; read transforms with `new DOMMatrix(getComputedStyle(el).transform).m41`). Each row is a position, then what must be true there:

  | Position | Expected |
  |---|---|
  | `0.2` | `#contact-title` inside the viewport; world rect `left >= innerWidth - 1`; `document.documentElement.style.getPropertyValue("--head") === ""` |
  | `IN_FROM + .45 * (IN_TO - IN_FROM)` | contact rect `left < 0`; world `left` between 1 and `innerWidth - 1`; `.handoff__bar--top` height `> 40`; `.handoff__streaks` opacity `> .5`; giant `m41 < 0`; desk `m41 > 0`; world `filter` contains `blur` |
  | `HOLD` | contact `right <= 0`; world `left` within 1px of 0; bar height 0; world `filter` is `none`; streaks opacity 0; `--head` equals Korte's text colour `#eef2ea` |
  | `(OUT_FROM + OUT_TO) / 2` | giant `m41` < desk `m41`; bar height `> 0` |
  | `OUT_TO - .003` | info, giant and desk rects `right <= 0`; bar height `>= .08 * innerHeight`; `.handoff__scene` `filter` contains `blur` |
- **New `handoff-finish-whip-in`** (with `settle(false)`, go to `IN_FROM + .5`, then `settle(true)`):
  - one wheel notch back (−100) → after 1500 ms the position is `0 ± .01`;
  - from the same place, one notch forward (+100) → `HOLD ± .01`;
  - the URL stays.
- **New `handoff-contact-anchor`:**
  - open `/work/space-arabica/?checks#contact` and wait 1000 ms after load;
  - `#contact-title` is inside the viewport, and `handoffPos` is within `[-.05, IN_FROM + .02]`;
  - the URL is still Space Arabica.

In `scripts/check-static.mjs:91`, replace the order assertion with "the contact block opens the hand-off":
- the page contains exactly one `class="contact`;
- `indexOf('class="handoff"') < indexOf('class="contact handoff__contact"') < indexOf('id="handoff-title"')`.

- [ ] **Step 2: Build and watch them fail**

Run: `npm run build && node scripts/check-static.mjs; SKIP_BUILD=1 npm run check:browser handoff-whip-frames handoff-finish-whip-in handoff-contact-anchor handoff-keyboard handoff-phone`
Expected: the static check FAILS on the contact order; the browser checks FAIL (no `.handoff__contact`, no bars, old timeline).

- [ ] **Step 3: Implement**

**`Contact` and `ProjectCase`:**
- Add the props above to `Contact`.
- `CaseHandoff` renders `<Contact anchor={false} className="handoff__contact" />` as the stage's first layer.
- `ProjectCase` no longer renders `Contact`.

**`handoff.css`:**
- **Static** (no `.can-move` and no `.motion`):
  - the outer element is an ordinary block, and the stage has auto height with nothing clipped;
  - the contact block looks exactly as today;
  - `.handoff__world` is `position: relative; height: 100vh; height: 100svh; min-height: 560px; overflow: hidden`;
  - streaks and bars are `display: none`.
- **Pinned** (`.can-move .handoff, .handoff.motion`):
  - `height: 360vh; background: #070809`;
  - the stage is `position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden`;
  - contact and world are `position: absolute; inset: 0`;
  - the contact keeps its border and colours, with `padding-top: min(150px, 16svh)`;
  - the world's background is `var(--ground)`;
  - before the app draws (`.can-move` only), the world sits at `translateX(105vw)` so the contact block shows.
- **Streaks:** `position: absolute; inset: 0 -100%; pointer-events: none; opacity: 0; z-index: 15`, with a `repeating-linear-gradient` of thin horizontal lines in `var(--giant)` and faint white.
- **Bars:** absolute, full width, `height: 0; background: #000; z-index: 18`, one at the top and one at the bottom.
- **Remove:** `.handoff__flash` and the `.handoff.motion .handoff__world { opacity: 0 }` rule.

**`draw()` in `CaseHandoff.tsx`.** Let `cap = innerWidth > 860 ? 10 : 6` and `drift = clamp(cur - HOLD, -1.2, 1.2)`, frozen at `clamp(OUT_FROM - HOLD)` during `out` and `done`. By phase:

- **`contact`:**
  - the contact has no transform;
  - the world is at `translateX(105vw)`;
  - the streaks and bars are off.
- **`in`**, using `whipEnter(t, next.giantFit)`:
  - contact `translateX(contactX vw) skewX(skew)`, plus `blur(blur·cap px)` when it is over .05;
  - world `translateX(worldX vw) skewX(skew)` with the same blur;
  - giant `translateX(giantX vw)` with `--wd = giantW`;
  - desk `translateX(deskX vw) translateY(−drift·26 px)`;
  - info opacity and `translateX(infoX px)`.
- **`hold`:**
  - the contact is at `translateX(-105vw)`;
  - the world and scene have no transform;
  - the desk drifts as today.
- **`out`/`done`**, using `whipLeave(done ? 1 : t)` (the contact stays at `-105vw`):
  - the scene gets `skewX(skew)` and `blur(blur·cap px)`;
  - the info, giant and desk get their own `translateX(… vw)`;
  - the desk also gets the frozen drift.

In every phase:
- the streaks get `opacity` and `translateX(streakX vw)`;
- each bar gets `height: bars vh`;
- the transforms of the world, contact, scene, giant and desk are always written explicitly.

Other rules in `draw()`:
- **Info pointer events:** on only when `infoO >= .5` and the phase is `hold`, or `in` with `t > .85`.
- **`--head`:** set to `next.tokens.text` while the phase is `in` with `worldX < 50`, or `hold`, `out` or `done`; removed otherwise.
- **Opening the next case:** unchanged.

**Handlers:**
- **`resized`:** keeps the place for `keep` in `[0, OUT_TO]`, then moves to `min(keep, HOLD)`.
- **`follow(event)`:**
  - when `event.target` is inside `.handoff__contact` and `position()` is outside `[-.02, IN_FROM]`, scroll to `topFor(0)`;
  - otherwise, the existing move to the hold.
- **Remove:** `screenRect`, `rect`, `DIVE_DRIFT`, the flash, and the `dolly`, `pushIn`, `landing` and `leaveWords` imports.

- [ ] **Step 4: Run and watch them pass**

Run: `npm test && npm run typecheck && npm run build && node scripts/check-static.mjs && SKIP_BUILD=1 npm run check:browser dive-next-case $(grep -o 'check("handoff-[a-z-]*' scripts/check-browser.mjs | cut -d'"' -f2 | tr '
' ' ')`
Expected: PASS for every `handoff-*` check. The runner matches exact names, hence the list. `dive-next-case` still passes too, because the page transition changes only in Task 3.

- [ ] **Step 5: Commit**

```bash
git add src/components/CaseHandoff.tsx src/components/handoff.css src/components/SiteChrome.tsx src/pages/ProjectCase.tsx scripts/check-browser.mjs scripts/check-static.mjs
git commit -m "Whip from the contact block into the next project, and on out of it"
```

---

### Task 3: The whip across the page change

**Files:**
- Modify: `public/project-transitions.js` (the header comment and `kindBetween`)
- Modify: `src/project-transitions.css` (replace the `dive` rules)
- Modify: `scripts/check-browser.mjs` (`dive-next-case` and `handoff-back-fades`)

**Interfaces:**
- Consumes: the `.handoff__frame`, `.case-hero__frame` and `.site-head` class names.
- Produces: the transition kind `"whip"`. `"dive"` no longer exists.

- [ ] **Step 1: Write the failing check**

Rename `dive-next-case` to `whip-next-case` and expect `{ vt: true, kind: "whip" }`. Add a second init script that records, on `pagereveal` (after `setTimeout(0)`):

```js
window.__names = { hero: name(".case-hero__frame"), head: name(".site-head") }
```

Here `name(sel)` returns the computed `viewTransitionName`, or `"missing"` when the element is not there. Then assert:
- `__names` deep-equals `{ hero: "none", head: "site-header" }`;
- 1200 ms later, no `[data-transition-kind]` remains;
- the hero's computed name is `project-frame` again.

In `handoff-back-fades`, the forward step expects `"whip"`.

- [ ] **Step 2: Run and watch it fail**

Run: `SKIP_BUILD=1 npm run check:browser whip-next-case handoff-back-fades`
Expected: FAIL with `kind: "dive"`.

- [ ] **Step 3: Implement**

- **`kindBetween`:** returns `traverse ? 'fade' : 'whip'` between two different case studies.
- **CSS:** replace the dive rules with these:

```css
:root[data-transition-kind="whip"] .case-hero__frame,
:root[data-transition-kind="whip"] .handoff__frame { view-transition-name: none !important; }
:root[data-transition-kind="whip"] .site-head { view-transition-name: site-header; }
:root[data-transition-kind="whip"]::view-transition-old(root) { animation: whip-old 600ms cubic-bezier(.2, .7, .2, 1) both; mix-blend-mode: normal; }
:root[data-transition-kind="whip"]::view-transition-new(root) { animation: whip-new 700ms cubic-bezier(.16, 1, .3, 1) both; mix-blend-mode: normal; }
@keyframes whip-old { to { transform: translateX(-40vw) skewX(-8deg); filter: blur(12px); opacity: 0; } }
@keyframes whip-new { from { transform: translateX(60vw) skewX(-6deg); filter: blur(10px); } }
```

- **Durations rule:** remove `dive` from the shared 600 ms rule.
- **Comments:** update them in both files.

- [ ] **Step 4: Run and watch it pass**

Run: `npm run build && SKIP_BUILD=1 npm run check:browser whip-next-case handoff-back-fades morph-into-case back-lands-on-chapter transitions-reduced handoff-continues`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/project-transitions.js src/project-transitions.css scripts/check-browser.mjs
git commit -m "Finish the whip across the page change between case studies"
```

---

### Task 4: Frame budget, docs, full run and frame review

**Files:**
- Modify: `scripts/check-browser.mjs` (new `handoff-frame-budget`, after `chapters-frame-budget`)
- Modify: `README.md`, `DESIGN.md`, `PORTFOLIO_CONTEXT.md`, `docs/designs/implementation-checks.md` (the hand-off wording: dive → whip pan; contact inside the hand-off)

**Interfaces:**
- Consumes: `GPU_ARGS`, `chromium`, `HANDOFF`, and `handoffGoTo` from Task 2.

- [ ] **Step 1: Write `handoff-frame-budget`**

On the GPU (same launch and SwiftShader guard as `chapters-frame-budget`), open `/work/space-arabica/?checks` at 1440×900, wait for fonts and `__handoff`, then call `settle(false)`. Then two runs, each:
- go to 0.2 and wait 800 ms;
- record rAF intervals with the recorder pattern from `wheelFrames`;
- wheel `+100` fifteen times, 90 ms apart (0.2 → about 1.9: the whole whip in and the start of the whip out);
- wait 500 ms.

The first run is cold and the second warm. Assert cold `over20 <= 14` and warm `p95 <= 17`, and print both. Software numbers are printed only.

- [ ] **Step 2: Run it**

Run: `SKIP_BUILD=1 npm run check:browser handoff-frame-budget`
Expected: PASS. This is a guard on Task 2's code, so it may pass the first time.

If it fails, use superpowers:systematic-debugging: profile which layer costs the frame. `will-change` on the moving layers during the move is allowed; changing the blur caps is not.

- [ ] **Step 3: Update the docs**

Each doc's hand-off sentence now describes:
- the contact block whipping off left as the next project races in;
- the hold;
- a second whip that the page change finishes.

`implementation-checks.md` gets a new results heading for this change, listing the new checks.

- [ ] **Step 4: Full verification**

Run: `npm test && npm run typecheck && npm run lint && npm run build && node scripts/check-static.mjs && SKIP_BUILD=1 npm run check:browser`
Expected: every unit, static and browser check passes. The browser count is today's 63, minus none, plus the four new ones (`handoff-whip-frames`, `handoff-finish-whip-in`, `handoff-contact-anchor`, `handoff-frame-budget`).

- [ ] **Step 5: Frame review**

Capture these positions at 1440×900, 390×844 and 844×390 into a contact sheet in the scratchpad, then read it:
- 0.2 (contact);
- 0.6, 0.8 and 1.1 (whip in);
- 1.55 (hold);
- 2.0 and 2.3 (whip out);
- 2.59 (end).

Compare it against prototype B. Fix anything that reads wrong (a clipped name, the laptop off screen at the hold, bars over the words at rest) with a check first.

- [ ] **Step 6: Commit**

```bash
git add scripts/check-browser.mjs README.md DESIGN.md PORTFOLIO_CONTEXT.md docs/designs/implementation-checks.md
git commit -m "Guard the whip's frame budget and describe the whip pan"
```
