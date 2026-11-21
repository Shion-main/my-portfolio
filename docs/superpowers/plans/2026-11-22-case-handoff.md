# Case Studies Keep Going Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** At the end of every case study, a scroll-driven hand-off brings in the next project and dives into its laptop, then opens the next case study by itself with a frame morph onto its hero.

**Architecture:**
- Pure hand-off timeline and finishing maths go in `src/motion/scroll.ts`.
- A new `CaseHandoff` component (with `handoff.css`) renders a prerendered static "next project" section. Once hydrated, it pins a 300vh track and draws it with the existing push-through helpers.
- `public/project-transitions.js` gains a case → case kind, `dive`. It replaces `wipe`, and names the hand-off frame on the leaving page.

**Tech Stack:** React 18, TypeScript, Vite 5, `node:test` with `load-ts.mjs`, Playwright browser checks (`scripts/check-browser.mjs`).

**Spec:** `docs/superpowers/specs/2026-11-22-case-handoff-design.md`

## Global Constraints

- No new dependencies. Pure maths stays in `src/motion/scroll.ts` with no imports.
- **Hand-off positions**, in screens from the moment the stage pins:
  - the finishing span starts at −0.6;
  - arrival 0 → 0.6;
  - hold 0.6 → 1.1, with its rest at 0.85;
  - dive 1.1 → 2.0;
  - track 300vh.
- **Opening the next case** happens once per page view, only after reader input (wheel, touch, key, pointer) since load, and only when the drawn position reaches the dive's end.
- **Back and restore:** a page restored or reloaded at the end moves to the hold (0.85) and never navigates by itself.
- **Reduced motion and no JS:** the static section with a "Continue to …" link, with no pinning, dive, glide or automatic opening.
- **Page order:** the contact block follows "Looking back". There is no footer on case pages, and `.case-next` and the circle wipe are gone.
- **Old page:** the hand-off frame carries `project-frame` only while a `dive` transition runs, and its own hero frame does not.
- The 11 px floor and every existing check stay green; `wipe-next-case` is replaced by a `dive` check.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- **A bounce or overscroll at the very end** (trackpad elastic scroll, a big fling) must open the next case only once, and never on a scroll back up (test in Task 2).
- **Navigating Back while the dive is mid-way on the restored page:** it must settle at the hold, not open the next case again (test in Task 2).
- **Tabbing out of the contact block into the hand-off** must land focus on the "Continue to …" link at the hold, without opening anything (test in Task 2).
- **Atlas → Space Arabica** must loop, including the transition naming (test in Task 3).
- **A phone at 390 × 844 and 320 px** must have no horizontal overflow, with the dive filling the screen (test in Task 2).

---

### Task 1: Hand-off maths

**Files:**
- Modify: `src/motion/scroll.ts`
- Test: `scripts/tests/motion.test.mjs`

**Interfaces:**
- Produces:
  - `HANDOFF = { FROM: -0.6, ARRIVE: 0.6, HOLD: 0.85, DIVE_FROM: 1.1, DIVE_TO: 2 } as const`
  - `handoffTrackScreens(): number` (= `DIVE_TO + 1` = 3)
  - `handoffPhase(s): { phase: "before" | "arrive" | "hold" | "dive" | "done"; t: number }`: `before` when s < 0; `arrive` t = s / ARRIVE; `hold` t = 1; `dive` t = (s − DIVE_FROM) / (DIVE_TO − DIVE_FROM); `done` when s ≥ DIVE_TO − 0.002.
  - `handoffSettle(s, dir): number | null`:
    - In the span (FROM, ARRIVE): forward gives ARRIVE, back gives FROM.
    - In the span (DIVE_FROM, DIVE_TO): forward gives DIVE_TO, back gives HOLD.
    - Within 0.005 of a span's end, or outside both spans: null.

- [ ] **Step 1: Write the failing tests:**

```js
test("case hand-off timeline", () => {
  assert.equal(handoffPhase(-0.3).phase, "before");
  assert.equal(handoffPhase(0.3).phase, "arrive"); near(handoffPhase(0.3).t, .5);
  assert.deepEqual(handoffPhase(.85), { phase: "hold", t: 1 });
  const d = handoffPhase(1.55); assert.equal(d.phase, "dive"); near(d.t, .5);
  assert.equal(handoffPhase(1.999).phase, "done");
  near(handoffTrackScreens(), 3);
});
test("case hand-off finishing", () => {
  near(handoffSettle(.2, 1), .6); near(handoffSettle(-.2, 1), .6); near(handoffSettle(.2, -1), -.6);
  near(handoffSettle(1.3, 1), 2); near(handoffSettle(1.9, -1), .85);
  assert.equal(handoffSettle(.85, 1), null); assert.equal(handoffSettle(-.8, 1), null); assert.equal(handoffSettle(1.997, 1), null);
});
```

- [ ] **Step 2: Run them and see them fail.** Run `npm test`. Expected: FAIL (`handoffPhase is not a function`).
- [ ] **Step 3: Implement** the Produces list.
- [ ] **Step 4: Run them and see them pass.** Run `npm test`. Expected: `ℹ fail 0`.
- [ ] **Step 5: Commit.** Run `git commit -m "Case hand-off maths"`.

### Task 2: The hand-off section and its behaviour

**Files:**
- Create: `src/components/CaseHandoff.tsx`, `src/components/handoff.css`
- Modify:
  - `src/pages/ProjectCase.tsx`: remove `.case-next` and `<Footer />`; render `<Contact />` right after the reflection, then `<CaseHandoff next={nextProject(slug)} index={…} />`.
  - `src/pages/case.css`: remove the `.case-next` rules.
- Modify: `scripts/check-browser.mjs`, `scripts/check-static.mjs`

**Interfaces:**
- Consumes: Task 1, plus `pushIn`, `landing`, `dolly`, `glide`, `restDrift`-style drift, `easeIn3` and `range` from `scroll.ts`.
- Produces:
  - **Markup:** `<section class="handoff" aria-labelledby="handoff-title">` containing:
    - `.handoff__stage` > `.handoff__scene`, which holds a label `Next project · 0N / 04`, `h2#handoff-title` with the next project's name, `.handoff__line`, and `a.handoff__continue` (`href` = next case URL, text `Continue to {name} →`);
    - `.handoff__desk` > `BrowserFrame` with the class `handoff__frame`, showing the next project's desktop screenshot;
    - `.handoff__giant`.
  - **Motion mode:** the root gains `.motion` once hydrated and not reduced, which makes the track 300vh with a sticky stage.
  - **Test hook:** under `?checks`, `window.__handoff = { drawn(): number; caught(): boolean; settle(on: boolean): void }`.

- [ ] **Step 1: Write the failing browser checks.** Add helpers `handoffGoTo(page, s)` (scroll to `.handoff` top + s × innerHeight) and `handoffCaught(page)`, modelled on `goTo` and `caughtUp`.
  - `handoff-continues` (1440×900, `/work/space-arabica/?checks`):
    - Press Shift (reader input), then wheel 100 px every 60 ms from the hold until the URL changes.
    - The URL becomes `/work/korte/`, and Korte's `.case-hero__frame` top is < 200 px.
  - `handoff-overscroll-once` (Review Focus):
    - From the dive at 1.9, send three fast wheel events of +400.
    - Exactly one navigation happens (count `framenavigated` on the main frame, which is 1), and the final URL is `/work/korte/`.
  - `handoff-back-holds` (Review Focus):
    - After `handoff-continues`, go back.
    - The URL is `/work/space-arabica/`, and two seconds later it's still there.
    - The hand-off's position is within ±0.05 of 0.85, and Korte's `.handoff__frame` scale is ≤ 1.05.
    - The header text colour is Korte's text token, `rgb(238, 242, 234)`.
  - `handoff-no-accidental-open`:
    - Load `/work/space-arabica/?checks`, scroll by script to the very end with no reader input, then reload.
    - After two seconds the URL is unchanged.
  - `handoff-finish-back`: from the hold, wheel into the dive to about 1.5, then wheel up 100 px and stop. After 1.5 s the position is within ±0.01 of 0.85, and the URL is unchanged.
  - `handoff-keyboard` (Review Focus):
    - Focus the contact email link and press Tab.
    - Focus is on `a.handoff__continue`, the hand-off is at the hold (±0.05), and the URL is unchanged.
    - Press Enter: the URL becomes `/work/korte/`.
  - `handoff-reduced`: with `reducedMotion: "reduce"`, scrolling to the end leaves the URL unchanged, and clicking `a.handoff__continue` opens Korte.
  - `handoff-phone` (Review Focus): at 390×844 and 320×740, there's no horizontal overflow on any case page. At 1.95 on a phone, the `.handoff__frame` rect covers the viewport (±2 px).
  - **check-static:**
    - every case page includes `class="handoff"`, the next project's name and `href="/work/<next>/"`;
    - no case page includes `case-next` or `site-foot`;
    - the contact block comes before the hand-off in the HTML.
- [ ] **Step 2: Run them and see them fail.** Run `npm run build && node scripts/check-static.mjs; SKIP_BUILD=1 npm run check:browser handoff-continues handoff-overscroll-once handoff-back-holds handoff-no-accidental-open handoff-finish-back handoff-keyboard handoff-reduced handoff-phone`. Expected: all FAIL.
- [ ] **Step 3: Build `CaseHandoff`** following the spec's "What the reader sees". One rAF loop, as in `ProjectWorlds`: glide, then `handoffPhase`, then poses.
  - **Arrival:** `pushIn(lerp(.48, 1, t))` plus `landing`. The flash uses the next project's giant colour.
  - **Hold:** at rest with drift.
  - **Dive:** the words and the giant leave (`leaveWords`), and the desk dollies with `dolly(rect, vw, vh, easeIn3(t))` with **no blur**.
  - **`--head`:** set to the next project's text colour while the stage is showing.
  - **Finishing:** use `handoffSettle` with the same timer, direction, touch, pressed and cancel-on-input rules as `ProjectWorlds`, moved into a small shared helper if it keeps both files simpler.
  - **Opening the next case:** when `handoffPhase(drawn).phase === "done"` and `moved` and not yet `opened`, set `opened = true` and call `location.assign(nextUrl)`.
  - **Restores:** on `pageshow` with `persisted`, and after mount, if the position is beyond the hold (> 0.85), set `opened = false`, jump to the hold instantly, and wait for new input.
  - **Focus:** `focusin` inside the hand-off scrolls to the hold.
  - **Reduced motion:** no `.motion` class; static section.
- [ ] **Step 4: Update `ProjectCase.tsx` and `case.css`** as listed.
- [ ] **Step 5: Run the checks again.** Run `npm run typecheck && npm run lint && npm test && npm run build && node scripts/check-static.mjs && SKIP_BUILD=1 npm run check:browser`. Expected: everything passes, except `wipe-next-case` until Task 3.
- [ ] **Step 6: Commit.** Run `git commit -m "Case studies carry on into the next project"`.

### Task 3: The dive transition between case studies

**Files:**
- Modify: `public/project-transitions.js`, `src/project-transitions.css`
- Modify: `scripts/check-browser.mjs` (replace `wipe-next-case`), `scripts/tests/projects.test.mjs` (the slug-sync test still holds)

**Interfaces:**
- Consumes: `.handoff__frame` and `.case-hero__frame` from Task 2.
- Produces:
  - `kindBetween` returns `"dive"` for case → different case (it was `"wipe"`).
  - `begin` sets `root.dataset.transitionSide = "old"` in `pageswap` and `"new"` in `pagereveal`, and clears it in `reset`.
  - **CSS:**
    - `:root[data-transition-kind="dive"][data-transition-side="old"] .case-hero__frame { view-transition-name: none !important; }`
    - `:root[data-transition-kind="dive"][data-transition-side="old"] .handoff__frame { view-transition-name: project-frame; }`
    - Group timing for `dive` matches `morph` (900 ms, `cubic-bezier(.76, 0, .18, 1)`), and the root crossfades at 600 ms.
    - The wipe rules and keyframes are removed.

- [ ] **Step 1: Write the failing check `dive-next-case`.** It replaces `wipe-next-case`:
  - Use the `RECORD` and `navigateBy` helpers.
  - From `/work/atlas-accountancy/` at the hold (`handoffGoTo` 0.85), activate `.handoff__continue`.
  - The URL becomes `/work/space-arabica/`, and the reveal is `{ vt: true, kind: "dive" }`.
  - Repeat from `/work/space-arabica/` to Korte.
- [ ] **Step 2: Run it and see it fail.** Run `SKIP_BUILD=1 npm run check:browser dive-next-case` after a build. Expected: FAIL (`kind: "wipe"`).
- [ ] **Step 3: Implement** the Produces list.
- [ ] **Step 4: Run the full suite.** Run `npm run build && node scripts/check-static.mjs && SKIP_BUILD=1 npm run check:browser`. Expected: all PASS, including `morph-into-case`, `back-lands-on-chapter` and `transitions-reduced`.
- [ ] **Step 5: Commit.** Run `git commit -m "Dive from one case study into the next"`.

### Task 4: Review frames, docs and the full suite

**Files:**
- Modify:
  - `docs/designs/implementation-checks.md`: the table and results.
  - `DESIGN.md`: the motion paragraph, which says "case → case wipes".
  - `README.md` and `PORTFOLIO_CONTEXT.md`: wherever they mention the next-project block or the wipe.

- [ ] **Step 1: Review frames.** Capture frames of the hand-off at s = −0.3, 0.2, 0.6, 0.85, 1.3, 1.7, 1.95 and the landing on Korte at 1440×900, 390×844 and 844×390, plus the reduced-motion end of a case page. The words must be readable at the hold, there must be no overflow, and the landing must not jump.
- [ ] **Step 2: Update the docs** listed above.
- [ ] **Step 3: Run the full verification.** Run `npm run typecheck && npm run lint && npm test && npm run build && node scripts/check-static.mjs && SKIP_BUILD=1 npm run check:browser`. Expected: everything passes.
- [ ] **Step 4: Commit.** Run `git commit -m "Document the case hand-off"`.
