# Push-through Project Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's circle wipe between project chapters with the approved push-through camera move, driven by smoothed scroll that finishes a move when the reader stops halfway.

**Architecture:** All timing and pose maths are pure functions in `src/motion/scroll.ts` (no imports, unit-tested with `node:test`). `ProjectWorlds` keeps one rAF loop: it glides a drawn position toward the real scroll position, asks the maths where the reader is and what each chapter's pose is, and writes styles. The wall dive is a root CSS variable (`--dive`) that `screen-wall.css` reads.

**Tech Stack:** React 18, TypeScript, Vite 5, `node:test` with `scripts/tests/load-ts.mjs`, Playwright 1.63.0 browser checks against `vite preview` (`scripts/check-browser.mjs`).

**Spec:** `docs/superpowers/specs/2026-11-22-project-transitions-design.md`. The reference prototype is `.superpowers/brainstorm/517-1795276536/content/transitions.html` (git-excluded, local); its `land()`, `OPT.push` and `screenRect()` are the behaviour to match.

## Global Constraints

- No new runtime dependencies.
- `src/motion/scroll.ts` keeps "No imports: tests load it directly."
- Track: arrival 0.7 screens, rest 0.55 screens per chapter, move 1 screen; track height 690vh on every screen size.
- Glide time constant 130 ms. Jumps larger than 1 screen are drawn immediately.
- Finish the move after 170 ms without scroll. Going forward, finish forward past t 0.25; going back, finish back below t 0.75. Never while a touch is held.
- Reduced motion: no dolly, scale, blur, flash, glide, wall dive or automatic finishing. Chapters cut at the middle of a move.
- Phones (≤ 860 px wide): no blur on chapters or wall.
- Hidden chapters stay in the accessibility tree and stay focusable (opacity 0 + `pointer-events: none`, never `visibility: hidden` or `display: none`).
- The 11 px text floor (`scripts/tests/css.test.mjs`) and every existing browser check keep passing.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- **Resizing or rotating mid-move:** the dolly must re-measure the laptop screen and aim at the new centre, not a stale one (test in Task 3).
- **A big jump (chapter index, deep link, focus) across several chapters:** it must land directly without drawing the chapters in between (test in Task 3).
- **PageDown / Space from a resting chapter, which lands mid-move:** it must finish cleanly on the next chapter (test in Task 4).
- **A reload while mid-move (the browser restores the scroll position):** it must end on a rest (test in Task 4).
- **Scrolling again while a finish is in flight:** the reader's input wins (test in Task 4).

---

### Task 1: Chapter timeline maths

**Files:**
- Modify: `src/motion/scroll.ts` (add below `fitFontSize`; remove `chapterWipe`, `chapterLocal`, `giantAxes`, `snap`, `trackProgress` in Task 3 once unused)
- Test: `scripts/tests/motion.test.mjs`

**Interfaces:**
- Produces (all exported from `src/motion/scroll.ts`):
  - `ARRIVE = 0.7`, `REST = 0.55`, `MOVE = 1`, `JUMP = 1`, `GLIDE_MS = 130`, `SETTLE_MS = 170`
  - `trackScreens(count: number): number`: track height in viewport heights, `ARRIVE + count*REST + (count-1)*MOVE + 1`.
  - `restStart(i: number): number`, `restCenter(i: number): number`, `movesEnd(count: number): number` (= `restStart(count-1) + REST`). All in screens of scroll from the moment the track pins.
  - `type Moment = { from: number; to: number; t: number }`: `from: -1, to: 0` while arriving; `from === to` and `t: 1` at rest.
  - `momentAt(s: number, count: number): Moment`
  - `activeChapter(m: Moment): number`: `m.t >= .5 ? m.to : m.from`.
  - `settleTarget(s: number, dir: 1 | -1, count: number): number | null`
  - `glide(cur: number, target: number, dtMs: number, reduced: boolean): number`
  - `arrivalT(s: number): number` (= `lerp(.48, 1, range(s, 0, ARRIVE))`), `COVER_AT` (= `ARRIVE * .16 / .52`), `wallDive(s: number): number` (= `easeIn3(range(s, -0.6, COVER_AT))`).

- [ ] **Step 1: Write the failing tests** in `scripts/tests/motion.test.mjs` (add the new names to the `loadTs` destructure):

```js
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);
test("chapter timeline", () => {
  near(trackScreens(4), 6.9);
  near(restStart(0), .7); near(restStart(1), 2.25); near(restCenter(1), 2.525); near(movesEnd(4), 5.9);
  assert.deepEqual(momentAt(-.1, 4), { from: -1, to: 0, t: 0 });
  near(momentAt(.35, 4).t, .5);
  assert.deepEqual(momentAt(1, 4), { from: 0, to: 0, t: 1 });
  const m = momentAt(1.65, 4); assert.equal(m.from, 0); assert.equal(m.to, 1); near(m.t, .4);
  assert.deepEqual(momentAt(9, 4), { from: 3, to: 3, t: 1 });
  assert.equal(activeChapter({ from: -1, to: 0, t: .49 }), -1);
  assert.equal(activeChapter({ from: 0, to: 1, t: .5 }), 1);
});
test("finishing a move", () => {
  near(settleTarget(1.65, 1, 4), 2.25);   // forward, t .4
  near(settleTarget(1.45, 1, 4), 1.25);   // forward, t .2
  near(settleTarget(1.95, -1, 4), 1.25);  // back, t .7
  near(settleTarget(2.05, -1, 4), 2.25);  // back, t .8
  near(settleTarget(.3, 1, 4), .7);       // arrival counts as a move
  near(settleTarget(.1, -1, 4), 0);
  assert.equal(settleTarget(1, 1, 4), null);      // resting
  assert.equal(settleTarget(1.252, 1, 4), null);  // within .005 of an end
  assert.equal(settleTarget(-.2, 1, 4), null);
});
test("glide", () => {
  near(glide(0, .5, 16, false), .5 * (1 - Math.exp(-16 / 130)));
  assert.equal(glide(0, 1.2, 16, false), 1.2);   // jump
  assert.equal(glide(0, .5, 16, true), .5);      // reduced motion
  assert.equal(glide(.4999, .5, 16, false), .5); // converged
});
test("first arrival", () => {
  near(arrivalT(0), .48); near(arrivalT(.35), .74); near(arrivalT(.7), 1);
  near(COVER_AT, .7 * .16 / .52);
  assert.equal(wallDive(-.6), 0); near(wallDive(COVER_AT), 1);
});
```

- [ ] **Step 2: Run and see them fail.** Run `npm test`. Expected: FAIL with `trackScreens is not a function` (or similar).
- [ ] **Step 3: Implement** the Produces list in `src/motion/scroll.ts`:
  - Add `easeIn3`, `easeOut3`, `easeOut4` beside `easeInOutCubic`.
  - `momentAt` walks the moves.
  - `settleTarget` returns `null` outside the arrival and the moves, and within 0.005 of either end. Otherwise it returns the end chosen by the direction rule.
  - `glide` returns the target when `reduced`, when `|target-cur| > JUMP`, or when the remainder is under 0.0004. Otherwise it eases by `1 - exp(-dt/GLIDE_MS)`.
- [ ] **Step 4: Run and see them pass.** Run `npm test`. Expected: `ℹ fail 0`.
- [ ] **Step 5: Commit.** Run `git add src/motion/scroll.ts scripts/tests/motion.test.mjs`, then `git commit -m "Chapter timeline maths for push-through"`.

### Task 2: Push-through pose maths

**Files:**
- Modify: `src/motion/scroll.ts`
- Test: `scripts/tests/motion.test.mjs`

**Interfaces:**
- Consumes: `range`, `lerp`, `clamp` and the easings from Task 1.
- Produces:
  - `pushOut(t): { zoom, blur, words, giantOpacity, shown }`:
    - `zoom = easeIn3(range(t,0,.56))`
    - `blur = range(t,.32,.58)² × 14`
    - `words = range(t,0,.22)` (the leave progress)
    - `giantOpacity = 1 - range(t,.02,.25)`
    - `shown = t < .64`
  - `pushIn(t): { opacity, scale, blur, land, flash, shown }`:
    - `opacity = easeOut3(range(t,.48,.64))`
    - `scale = lerp(.62, 1, easeOut3(range(t,.48,1)))`
    - `blur = (1 - range(t,.48,.74)) × 12`
    - `land = range(t,.54,1)`
    - `flash = tri(t,.44,.56,.7) × .5`
    - `shown = t > .48`
  - `landing(t, fit): { giantW, giantWt, giantY, giantO, deskY, deskScale, deskO, phoneY, phoneTurn, phoneO, words: number[] }`: exactly the prototype's `land()` and `infoIn()`. `giantY` is in % of the giant's height, `deskY` and `phoneY` in vh, `phoneTurn` in degrees. `words[j] = easeOut4(range(range(t,.42,1), j*.13, .55 + j*.13))` for j = 0..3.
  - `leaveWords(e): { opacity, y: number[] }` with `e = easeIn3(words)`: `opacity = 1 - e`, `y = [-14e, -60e, -14e, -14e]`. Index 1 (the heading) is in %, the rest in px.
  - `dolly(rect: { x; y; w; h }, vw, vh, zoom): { originX, originY, dx, dy, scale }`:
    - The scale ends at `max(vw/w, vh/h) × 1.15`.
    - The origin is the rect centre.
    - `dx`/`dy` move that centre to the viewport centre, × `zoom`.
  - `restDrift(s, i) = clamp(s - restCenter(i), -1.2, 1.2)`. The desk moves `-drift × 26px` and the phone `-drift × 48px`.
  - `tri(v, a, m, b)` (exported helper).

- [ ] **Step 1: Write the failing tests:**

```js
test("push-through poses", () => {
  assert.deepEqual(pushOut(0), { zoom: 0, blur: 0, words: 0, giantOpacity: 1, shown: true });
  near(pushOut(.28).zoom, .125); near(pushOut(.56).zoom, 1);
  near(pushOut(.45).blur, 3.5); near(pushOut(.58).blur, 14);
  assert.equal(pushOut(.22).words, 1); assert.equal(pushOut(.63).shown, true); assert.equal(pushOut(.64).shown, false);
  const a = pushIn(.48); near(a.opacity, 0); near(a.scale, .62); near(a.blur, 12); assert.equal(a.shown, false);
  near(pushIn(.56).flash, .5); near(pushIn(.64).opacity, 1); near(pushIn(.61).blur, 6);
  const b = pushIn(1); near(b.scale, 1); near(b.blur, 0); near(b.land, 1); near(b.flash, 0);
  assert.deepEqual(landing(0, 122), { giantW: 50, giantWt: 300, giantY: 22, giantO: 0, deskY: 9, deskScale: .94, deskO: 0, phoneY: 18, phoneTurn: -4, phoneO: 0, words: [0, 0, 0, 0] });
  assert.deepEqual(landing(1, 122), { giantW: 122, giantWt: 820, giantY: 0, giantO: 1, deskY: 0, deskScale: 1, deskO: 1, phoneY: 0, phoneTurn: 0, phoneO: 1, words: [1, 1, 1, 1] });
  near(landing(.75, 140).giantW, 140);
  const d = dolly({ x: 500, y: 200, w: 400, h: 250 }, 1000, 800, 1);
  near(d.scale, 3.68); near(d.originX, 700); near(d.originY, 325); near(d.dx, -200); near(d.dy, 75);
  const h = dolly({ x: 500, y: 200, w: 400, h: 250 }, 1000, 800, .5); near(h.scale, 2.34); near(h.dx, -100);
  near(restDrift(restCenter(1), 1), 0); near(restDrift(10, 0), 1.2);
});
```

- [ ] **Step 2: Run and see them fail.** Run `npm test`. Expected: FAIL (`pushOut is not a function`).
- [ ] **Step 3: Implement** the Produces list. `landing()` must return `-0` as `0` (`deepEqual` treats them differently). Normalise with `+ 0` or `|| 0`.
- [ ] **Step 4: Run and see them pass.** Run `npm test`. Expected: `ℹ fail 0`.
- [ ] **Step 5: Commit.** Run `git commit -m "Push-through pose maths"`.

### Task 3: Chapters move with push-through

**Files:**
- Modify: `src/components/ProjectWorlds.tsx` (the draw loop and markup)
- Modify: `src/components/worlds.css`
- Modify: `src/components/chapterScroll.ts`
- Modify: `src/motion/scroll.ts` (remove `chapterWipe`, `chapterLocal`, `giantAxes`, `snap`, `trackProgress`)
- Modify: `scripts/tests/motion.test.mjs` (drop their tests)
- Modify: `scripts/tests/css.test.mjs`
- Test: `scripts/check-browser.mjs`

**Interfaces:**
- Consumes: everything Task 1 and Task 2 produce.
- Produces:
  - **Markup:** every `.chapter` wraps its info, showcase and giant in `<div class="scene">`. The stage gains `<div class="stage-flash" aria-hidden="true">`. Anchors carry `style={{ "--rest": restCenter(i) }}`.
  - **Test hook:** under DEV or `location.search.includes("checks")`, `window.__worlds = { drawn(): number; settle(on: boolean): void }`. `drawn` returns the drawn position in screens; `settle` is used by Task 4.
  - `chapterScrollTop(slug)` returns `track.offsetTop + restCenter(index) * innerHeight` when in motion mode.
  - `onActive(slug | null, covered)` is unchanged in shape. Covered becomes `s >= COVER_AT`; Task 5 depends on that.

- [ ] **Step 1: Write the failing browser checks** in `scripts/check-browser.mjs`. Add a helper `const goTo = (page, s) => page.evaluate(s => scrollTo(0, document.querySelector(".worlds").offsetTop + s * innerHeight), s);` and a `scaleOf(selector)` evaluate that returns `new DOMMatrix(getComputedStyle(el).transform).a`. In each check, call `window.__worlds.settle(false)` first.
  - `push-through-mid-move` (1440×900):
    - At `goTo(1.25 + .3)` plus 700 ms: Space Arabica's `.scene` scale is > 1.3, and Korte's `.chapter` opacity is "0".
    - At `1.25 + .6`: Korte's opacity is > .5, its `.scene` scale is in (.62, 1), and `.stage-flash` opacity is > 0.
    - At `2.25`: Korte's `.scene` transform is "none", and Space Arabica's opacity is "0".
  - `push-through-resize` (Review Focus):
    - At `1.25 + .3`, set the viewport to 1159×668 and wait 700 ms.
    - Space Arabica's `.scene` `transform-origin` equals the centre of its `.showcase-desk img` measured with transforms cleared, ±2 px.
  - `glide-and-jump` (Review Focus):
    - At rest on Space Arabica (`goTo(restCenter 0 = .975)` plus 700 ms), send `mouse.wheel(0, 100)`.
    - On the next frame, `__worlds.drawn()` < the real position. After 700 ms they are equal (±.001).
    - Then `goTo(5.625)` (Atlas at rest). On the very next frame, only Atlas has opacity > 0 among the chapters.
  - `chapters-reduced` (`reducedMotion: "reduce"`):
    - At `1.25 + .3`: Space Arabica's `.scene` transform is "none", its filter is "none", Korte's opacity is "0", and the flash opacity is "0".
    - At `1.25 + .7`: Korte is visible with its scene at "none", and Space Arabica's opacity is "0".
  - `hidden-words-no-click`:
    - At `1.25 + .3`, `elementFromPoint` at the centre of Space Arabica's `.chapter-open` is not that link or inside it.
- [ ] **Step 2: Run and see them fail.** Run `npm run build && SKIP_BUILD=1 npm run check:browser push-through-mid-move push-through-resize glide-and-jump chapters-reduced hidden-words-no-click`. Expected: all FAIL (no `__worlds`, no `.scene`).
- [ ] **Step 3: Rewrite the draw loop in `ProjectWorlds.tsx`.**
  - Per frame:
    1. Compute `target = -track.getBoundingClientRect().top / innerHeight` and `cur = glide(cur, target, dt, reduced)`.
    2. Compute `m = momentAt(cur, COUNT)`.
    3. Build a pose per chapter from `restDrift`, `pushOut`/`pushIn`/`landing`/`leaveWords`/`dolly` (the arrival uses `pushIn(arrivalT(cur))` on chapter 0 only; Task 5 adds the wall), and write styles.
    4. Keep the rAF running while `cur !== target`.
  - **Writing poses:**
    - A hidden chapter gets `opacity: 0; pointer-events: none`.
    - `.chapter-info` gets `pointer-events: none` when its opacity < .5.
    - Blur is written only when `innerWidth > 860`.
  - **Laptop rect:** measure the `.showcase-desk img` rect with the chapter/scene/desk transforms cleared, cache it per chapter, and clear the cache in `fit()` (resize and `fonts.ready`).
  - **Reduced motion:** the chapter shown is `activeChapter(m)` (chapter 0 once arrival t ≥ .5) at rest pose. Nothing else is shown.
  - **Unchanged:** keep `onActive` and the hash sync keyed on `activeChapter(m)`, with "inside" meaning `active >= 0 && cur <= movesEnd(COUNT) + .1`. Also keep `goToHash`, `follow`, the `moved` guard and `fit()` as they are.
- [ ] **Step 4: Update `worlds.css`.**
  - `.worlds.motion { height: 690vh }`, and delete the 520vh phone override.
  - `.worlds.motion .chapter { opacity: 0; pointer-events: none; }` replaces the `clip-path: circle(0 …)` default.
  - `.scene { position: absolute; inset: 0; }`
  - `.stage-flash { position: absolute; inset: 0; z-index: 20; opacity: 0; pointer-events: none; mix-blend-mode: screen; }`
  - `.chapter-anchor { top: calc(var(--rest) * 100vh); }`
- [ ] **Step 5: Update `chapterScroll.ts`** to use `restCenter`.
- [ ] **Step 6: Remove the old maths and add a CSS guard.** Delete the old maths and its tests. Add to `css.test.mjs`: `assert.match(readFileSync("src/components/worlds.css","utf8"), /\.worlds\.motion \{ height: 690vh; \}/)` with the comment "must equal trackScreens(4) × 100".
- [ ] **Step 7: Run the new and existing checks.** Run `npm run typecheck && npm run lint && npm test && npm run build && SKIP_BUILD=1 npm run check:browser`. Expected: every check PASS, including `chapters-midpoints`, `deep-link`, `back-lands-on-chapter`, `chapter-focus-visible`, `deep-link-no-yank`, `chapters-landscape` and `header-contrast`.
- [ ] **Step 8: Commit.** Run `git commit -m "Move between project chapters with the push-through"`.

### Task 4: Finish the move when the reader stops

**Files:**
- Modify: `src/components/ProjectWorlds.tsx`
- Test: `scripts/check-browser.mjs`

**Interfaces:**
- Consumes: `settleTarget`, `SETTLE_MS`, and `window.__worlds.settle(on)` from Task 3 (default on).

- [ ] **Step 1: Write the failing checks.** In each, leave settle on and record `rest = s => track.offsetTop + s * innerHeight`.
  - `settle-forward`:
    - From rest 0, wheel down 100 px at a time until the position is between 1.25 + .3 and 1.25 + .45, then stop.
    - After 1500 ms, `scrollY` is within 2 px of `restStart(1) = 2.25` screens.
  - `settle-back`:
    - From 2.25, wheel up until the position is between 1.25 + .55 and 1.25 + .7.
    - After 1500 ms, `scrollY` is within 2 px of 1.25 screens.
  - `settle-touch-held` (`hasTouch`):
    - Start a touch with CDP `Input.dispatchTouchEvent` `touchStart`, then `goTo(1.25 + .4)`.
    - After 600 ms, `scrollY` is unchanged.
    - Send `touchEnd`. After 1500 ms, `scrollY` is at a rest (2.25 or 1.25 screens ±2 px).
  - `settle-pagedown` (Review Focus):
    - From rest 0, press `PageDown`.
    - After 1500 ms, `scrollY` is within 2 px of a `restStart`, and `activeChapter` is Korte (`location.hash === "#work-korte"`).
  - `settle-reload` (Review Focus):
    - `goTo(1.25 + .4)` with settle off, then reload.
    - After 1500 ms, `scrollY` is within 2 px of 1.25 or 2.25 screens.
  - `settle-input-wins` (Review Focus):
    - Trigger a forward finish from 1.25 + .4 and, 100 ms into it, wheel up 300 px.
    - After 1500 ms, `scrollY` is within 2 px of 1.25 screens (the reader's direction).
- [ ] **Step 2: Run and see them fail.** Run `SKIP_BUILD=1 npm run check:browser settle-forward settle-back settle-touch-held settle-pagedown settle-reload settle-input-wins` after a build. Expected: FAIL.
- [ ] **Step 3: Implement the finish.**
  - **Timer:** on `scroll`, record `dir` from the `scrollY` delta, then restart a `SETTLE_MS` timer.
  - **Touch:** `touchstart` sets `touching`. `touchend` and `touchcancel` clear it and restart the timer.
  - **On the timer:** skip if reduced motion, `touching`, or settle is switched off. Otherwise `const dest = settleTarget(target, dir, COUNT)`, and if it isn't null, `scrollTo({ top: track.offsetTop + dest * innerHeight, behavior: "smooth" })`.
  - **After a reload:** call the timer once after the initial `fit()`, so a restored mid-move position finishes. Respect the existing `moved` guard only for `goToHash`, not for this.
  - **Cleanup:** remove all the new listeners and the timer.
- [ ] **Step 4: Run the full browser suite.** Run `SKIP_BUILD=1 npm run check:browser` after `npm run build`. Expected: all PASS.
- [ ] **Step 5: Commit.** Run `git commit -m "Finish a chapter move when the reader stops halfway"`.

### Task 5: First arrival through the wall

**Files:**
- Modify: `src/components/ProjectWorlds.tsx`
- Modify: `src/components/screen-wall.css`
- Test: `scripts/check-browser.mjs`

**Interfaces:**
- Consumes: `wallDive`, `arrivalT`, `COVER_AT`, `pushIn`, `landing`.
- Produces: `document.documentElement.style --dive` (0..1), written by `ProjectWorlds`. It is removed on unmount and stays 0 under reduced motion.

- [ ] **Step 1: Write the failing check `first-arrival`** (1440×900, settle off):
  - At `goTo(-.3)`:
    - `getComputedStyle(root).getPropertyValue("--dive")` > 0.
    - `.wall-tilt`'s computed `scale` is > 1.
    - Space Arabica's opacity is "0".
  - At `goTo(-.05)`: Space Arabica's opacity is still "0" (no hard edge).
  - At `goTo(.12)`: Space Arabica's opacity is in (0, 1), and `.stage-flash` opacity is > 0.
  - At `goTo(.6)` plus 700 ms: Space Arabica's opacity is "1" and `.wall.off` exists.
  - Repeat with `reducedMotion: "reduce"` at `goTo(-.3)`: `--dive` is "" or "0".
- [ ] **Step 2: Run and see it fail.** Run `SKIP_BUILD=1 npm run check:browser first-arrival` after a build. Expected: FAIL.
- [ ] **Step 3: Implement the arrival.**
  - Write `--dive` = `wallDive(cur)` each frame, only when changed and not reduced.
  - Chapter 0 uses `pushIn(arrivalT(cur))` and the flash while `0 ≤ cur < ARRIVE`, and is hidden while `cur < 0`.
  - In `screen-wall.css`:
    - Add `.wall-tilt { scale: calc(1 + var(--dive, 0) * 1.4); }`.
    - Add `.wall { filter: blur(calc(var(--dive, 0) * 10px)); }` for widths above 860 px only.
    - Under reduced motion, add `scale: none; filter: none`.
- [ ] **Step 4: Run the full suite.** Run `npm test && npm run build && SKIP_BUILD=1 npm run check:browser`. Expected: all PASS, including `wall-renders`, `wall-reduced` and `deep-link`.
- [ ] **Step 5: Commit.** Run `git commit -m "Arrive at the first project through the wall"`.

### Task 6: Phones, frame budget, frames review and docs

**Files:**
- Test: `scripts/check-browser.mjs`
- Modify: `docs/designs/implementation-checks.md`, `DESIGN.md:38`, `README.md:21`, `PORTFOLIO_CONTEXT.md:28`

- [ ] **Step 1: Write the checks.**
  - `push-through-phone` (390×844 and 844×390, `isMobile`, `hasTouch`, settle off): at `1.25 + .45`, Space Arabica's `.scene` filter and Korte's are both "none", and Space Arabica's scene scale is > 1.3.
  - `chapters-frame-budget` (1440×900):
    - Wheel 100 px every 90 ms through all three moves (48 steps), recording rAF intervals as in the measurement recorded in the spec.
    - Assert p95 ≤ 17 ms at 1× CPU.
    - Then repeat under `Emulation.setCPUThrottlingRate { rate: 4 }` and print, without asserting, the median, p95, max and the counts over 20 ms and over 34 ms.
- [ ] **Step 2: Run them.** Run `SKIP_BUILD=1 npm run check:browser push-through-phone chapters-frame-budget`.
  - Expected: PASS.
  - If the budget fails, cut cost in this order and rerun:
    1. Apply the outgoing blur to the `.showcase-desk` only, not the whole scene.
    2. Cap the blur at 8 px.
    3. Drop the incoming blur.
- [ ] **Step 3: Review frames.** Capture frames at t = .2, .4, .5, .6, .75 and .95 of move 0 at 1440×900, 390×844 and 844×390, plus the arrival at s = -.3, .12 and .6. Compare them with the prototype's frames. The words at rest must be readable, nothing may overflow, and the showcase must stay clear of the header at rest.
- [ ] **Step 4: Update the docs.**
  - `DESIGN.md:38`: replace "Chapters wipe in as circles of their ground colour" with the push-through and glide description.
  - `README.md:21`: "wipes" → "chapter timeline and push-through poses".
  - `PORTFOLIO_CONTEXT.md:28`: keep it consistent.
  - `implementation-checks.md`: add the new checks to the table and record the results and frame numbers (1× and 4×) under a dated Results heading.
- [ ] **Step 5: Run the full verification.** Run `npm run typecheck && npm run lint && npm test && npm run build && node scripts/check-static.mjs && SKIP_BUILD=1 npm run check:browser`. Expected: everything passes.
- [ ] **Step 6: Commit.** Run `git commit -m "Check push-through on phones and its frame budget; document it"`.
