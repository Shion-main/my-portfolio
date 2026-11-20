# Portfolio Redesign (Index & Worlds) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild by-shion.dev as the approved dark “Index & Worlds” portfolio: slanted screen wall, project list, four colour chapters in one template, one shared case-study template, and View-Transition morphs.

**Architecture:** Same stack and build as today. React 18 pages render on the server through `src/entry-server.tsx`, and `scripts/prerender.mjs` writes one HTML file per route; `src/main.tsx` hydrates. All project content lives in one dependency-free data module. Every piece of scroll and motion maths lives in pure functions with unit tests. Components only measure, call those functions and write styles. Motion is CSS plus one `requestAnimationFrame` loop per feature; no animation library.

**Tech Stack:** React 18, TypeScript 5, Vite 5, `@fontsource-variable` fonts, `sharp` (media script only), `playwright` (browser checks only), `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-21-portfolio-redesign-design.md` (approved 2026-11-21). Visual reference: `docs/designs/redesign-2026-11-21/d-index-worlds.html`. Port its CSS values and behaviour; do not copy its structure.

## Global Constraints

- Work on branch `redesign/index-worlds`, never `main`. Commit at the end of each task; push only when Joshua asks.
- Base tokens: page `#0d0f11`, surface `#16191c`, text `#e8eaeb`, muted `#8d959c`, rule `#262b30`.
- Chapter tokens (ground / text / giant):
  - Space Arabica `#1b130d` / `#f1e3cc` / `#c9934a`
  - Korte `#0c1626` / `#eef2ea` / `#9acb2d`
  - FluxTrack `#001c43` / `#ffffff` / `#ec1f28`
  - Atlas Treasury `#13161c` / `#e8edf6` / `#4f86f0`
- Fonts, self-hosted with OFL licences in `public/licenses`:
  - Newsreader (opsz, wght 300–500, italic)
  - Anybody (wdth 50–150, wght 300–900)
  - Instrument Sans (body, UI, labels)
  - Syne and DM Sans are removed.
- No functional text under 11 px. Labels: Instrument Sans 11 px, weight 600, 0.1em tracking, uppercase.
- Easing: `cubic-bezier(.2,.7,.1,1)` for entrances and `cubic-bezier(.76,0,.18,1)` for morphs. Morph ≈ 900 ms.
- Routes: `/`, `/work/space-arabica/`, `/work/korte/`, `/work/fluxtrack/`, `/work/atlas-treasury/`, plus the static demo `/work/space-arabica/demo/`.
- Chapter anchors: `#work-space-arabica`, `#work-korte`, `#work-fluxtrack`, `#work-atlas-treasury`.
- Contact is only `mailto:create@by-shion.dev`. No forms or backend.
- No personal location anywhere. A client's own location (“Café website, Davao City”) is allowed.
- Credits, verbatim:
  - FluxTrack: “Designed and built it · team of three” (list column: “Design + build · team of 3”).
  - Atlas: label “Institutional project · Treasury module, MMCM”, credit “UI/UX designer, Treasury module”, list columns “UI/UX · Treasury module” / “Institutional”.
  - Korte: role “Solo designer & developer”; stack “Next.js, Supabase, Convex”.
- Privacy:
  - FluxTrack reporting dashboard `34:11280` is never used.
  - Every Atlas image has “Dones, Aisha Nicole” / “CSA Facilitator” (and any “Aisha Nicole Dones” field) replaced with “Demo Requester” / “Requester”.
  - Every `provenance.json` entry carries a `data` note.
- Reduced motion: no drift, no wipes, no stretch, no morphs; instant state changes; chapters still pin.
- Without JavaScript, all chapter text and screens are visible as stacked full-screen sections.
- Remove `gsap`, `three`, `@types/three`, `gh-pages` and the `predeploy`/`deploy` scripts.

## Review Focus

1. **Fonts arrive after first fit:** the giant words must refit after `document.fonts.ready` and on resize, never overflowing horizontally. Test owner: Task 4 (`fitFontSize`) and Task 7 (browser overflow check after fonts load).
2. **Deep link into a chapter** (`/#work-korte` on a cold load): Korte's chapter shows fully wiped in with its text visible, and the wall is hidden. Test owner: Task 7.
3. **Back from a case study** (including the back/forward cache): it lands on that project's chapter with no stuck transition curtain or overlay. Test owner: Task 10.
4. **Touch devices with no hover:** tapping a row scrolls to the chapter; the wall stays mixed, with no stuck “pointing” state. Test owner: Task 6.
5. **Wall images still loading during a hover swap:** a tile never shows an empty or broken layer; the back layer only fades in after `decode()` resolves. Test owner: Task 5.

---

## File map

| Path | Responsibility |
| --- | --- |
| `src/work/projects.ts` | Typed data for the four projects: copy, tokens, media paths, gallery tabs, wall lists. No imports. |
| `src/motion/scroll.ts` | Pure scroll and motion maths: progress, wipes, giant stretch and fit, wall column parameters, source selection. |
| `src/styles/base.css` | Tokens, fonts, typography, labels, focus, frames (browser and phone). |
| `src/components/ScreenWall.tsx` + `screen-wall.css` | Background wall, swap, shade, tint. |
| `src/components/ProjectList.tsx` | Index rows (hover, focus and tap behaviour). |
| `src/components/ProjectWorlds.tsx` + `worlds.css` | Sticky chapters, wipes, giant names, chapter index. |
| `src/components/DeviceFrames.tsx` | `BrowserFrame` and `PhoneFrame`. |
| `src/components/SiteChrome.tsx` | Rewritten `Header`, `Contact`, `Footer`. |
| `src/components/ScreenTabs.tsx` + `case.css` | Case-study tabbed gallery and viewer. |
| `src/pages/Home.tsx` | Hero, wall, list, worlds, about, contact. |
| `src/pages/ProjectCase.tsx` | The one case-study template. |
| `scripts/build-work-media.mjs` | Source PNG → WebP (full and wall), Atlas redaction, provenance. Run by hand; not part of the build. |
| `scripts/sync-space-demo.mjs` | Copies the seven-page Space Arabica build into `public/work/space-arabica/demo/` with the WIP banner and disabled inputs. Run by hand. |
| `scripts/tests/*.test.mjs` | `node:test` unit and content tests (`npm test`). |
| `scripts/check-browser.mjs` | Playwright browser checks against `vite preview` (`npm run check:browser`). |
| `scripts/check-static.mjs` | Checks on the prerendered HTML (extended). |

---

### Task 1: Branch, test runner and project data

**Files:**
- Create: `scripts/tests/load-ts.mjs`, `scripts/tests/projects.test.mjs`, `src/work/projects.ts`
- Modify: `package.json` (`"test": "node --test scripts/tests/"`)

**Interfaces:**
- Produces, from `src/work/projects.ts`:
  - `type ProjectSlug = "space-arabica" | "korte" | "fluxtrack" | "atlas-treasury"`
  - `type Shot = { src: string; alt: string; caption: string }`. `src` is relative to the site root, e.g. `media/work/korte/live-desktop.webp`.
  - `type Tab = { title: string; desktop: Shot; phone: Shot }`
  - `type Project` with these fields:
    - Identity: `slug`, `name`, `label`, `list: { what; part; status; dot; hover }`
    - Tokens: `tokens: { ground; text; giant }`
    - Chapter: `line`, `facts: [Fact, Fact, Fact]` (`Fact = { term: string; detail: string }`), `caption`, `desktop: Shot & { title: string }`, `phone: Shot`
    - Case study: `question`, `intro`, `caseFacts: Fact[]`, `tabs: Tab[]`, `decisions: { title; problem; choice; result }[]`, `reflection`, `evidence`
    - Other: `demo?: string`, `wall: { desktop: string[]; phone: string[] }`, `giantFit: number`, `glow: string` (an rgba string)
  - `const projects: readonly Project[]` in chapter order
  - `projectBySlug(slug: ProjectSlug): Project`
  - `nextProject(slug: ProjectSlug): Project`
  - `loadTs(path: string): Promise<Record<string, unknown>>` in `load-ts.mjs`: transpiles with `typescript` and imports through a data URL, as `scripts/check-story.mjs` does today.

- [ ] **Step 1: Create the branch.** Run `git switch -c redesign/index-worlds`. Expected: `Switched to a new branch`.
- [ ] **Step 2: Write the failing test** `scripts/tests/projects.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";
const { projects, projectBySlug, nextProject } = await loadTs("src/work/projects.ts");

test("four projects in chapter order", () => {
  assert.deepEqual(projects.map(p => p.slug), ["space-arabica", "korte", "fluxtrack", "atlas-treasury"]);
});
test("every project fills the same template", () => {
  for (const p of projects) {
    assert.equal(p.facts.length, 3, p.slug);
    assert.equal(p.tabs.length, 4, p.slug);
    assert.equal(p.decisions.length, 3, p.slug);
    assert.ok(p.wall.desktop.length >= 4 && p.wall.phone.length >= 4, p.slug);
    for (const shot of [p.desktop, p.phone, ...p.tabs.flatMap(t => [t.desktop, t.phone])]) {
      assert.match(shot.src, new RegExp(`^media/work/${p.slug}/[a-z0-9-]+\\.webp$`));
      assert.ok(shot.alt.length > 10, `${p.slug} alt text`);
    }
  }
});
test("tokens match the spec", () => {
  assert.deepEqual(projects.map(p => [p.tokens.ground, p.tokens.giant]), [["#1b130d", "#c9934a"], ["#0c1626", "#9acb2d"], ["#001c43", "#ec1f28"], ["#13161c", "#4f86f0"]]);
});
test("credits are worded as Joshua confirmed", () => {
  const text = p => JSON.stringify(p);
  assert.match(text(projectBySlug("fluxtrack")), /Designed and built it · team of three/);
  assert.equal(projectBySlug("fluxtrack").list.part, "Design + build · team of 3");
  assert.equal(projectBySlug("atlas-treasury").label, "Institutional project · Treasury module, MMCM");
  assert.match(text(projectBySlug("atlas-treasury")), /UI\/UX designer, Treasury module/);
  assert.match(text(projectBySlug("korte")), /Next\.js, Supabase, Convex/);
  assert.match(text(projectBySlug("korte")), /112 organizers/);
  for (const p of projects) assert.doesNotMatch(text(p), /concept|Aisha|Dones/i, p.slug);
  assert.doesNotMatch(text(projectBySlug("fluxtrack")), /sole|solo/i);
});
test("next project loops", () => {
  assert.equal(nextProject("atlas-treasury").slug, "space-arabica");
  assert.equal(nextProject("space-arabica").slug, "korte");
});
```

- [ ] **Step 3: Run it.** Run `npm test`. Expected: FAIL (cannot find `src/work/projects.ts`).
- [ ] **Step 4: Implement `src/work/projects.ts`.**
  - Chapter copy, facts and captions: take them from the mockup's `.world` blocks.
  - List columns: the spec's list table.
  - Gallery tabs: the spec's tab table, with media names as in Task 2's mapping.
  - Case copy:
    - Space Arabica: from today's `src/content.ts`, adjusted to seven pages.
    - Korte: from `../Korte/Korte/docs/case-study/korte-before-after-copy.md` (stories: “Why the look changed twice”, “Tablet-first organizer”, “Fairness you can see”).
    - FluxTrack: from `fluxtrack-main/PRODUCT.md` and `docs/PROGRESS.md` (trust as the product; phone-first floor; every state designed).
    - Atlas: from the Figma case-study frame (four request types in one shell; the stepper; the journey view).
  - `glow` values: `rgba(201,147,74,.2)`, `rgba(154,203,45,.18)`, `rgba(236,31,40,.18)`, `rgba(79,134,240,.2)`.
  - `giantFit`: 122, 140, 125, 122.
- [ ] **Step 5: Run it.** Run `npm test`. Expected: all tests PASS. (The old `check-story.mjs` stays out of `npm test` from now on; Task 12 deletes it.)
- [ ] **Step 6: Commit.** `git add package.json scripts/tests src/work && git commit -m "Add typed project data for the redesign"`

### Task 2: Work media pipeline

**Files:**
- Create: `scripts/build-work-media.mjs`, `scripts/tests/media.test.mjs`, and `public/media/work/<slug>/*.webp`, `public/media/work/<slug>/wall/*.webp`, `public/media/work/<slug>/provenance.json`
- Modify: `package.json` (devDependency `sharp`)

**Interfaces:**
- Consumes: `projects` (Task 1). Every `Shot.src` and every wall name must exist after the script runs.
- Produces:
  - `media/work/<slug>/<name>.webp`: full screens. Desktop width 1440, cropped to 16:10 from the top (Atlas sources are 1660 × 1180). Phone 780 × 1688.
  - `media/work/<slug>/wall/<name>.webp`: desktop 640 × 400; phone 300 × 649.
  - `provenance.json`: `[{ file, source, captured, data }]`, where `source` is `figma:<fileKey>#<nodeId>` or `local:space-arabica-2@9ba1c45/<page>`.

- [ ] **Step 1: Write the failing test** `scripts/tests/media.test.mjs`. For every project:
  - Every `Shot.src`, and `media/work/<slug>/wall/<name>.webp` for every wall name, exists under `public/`.
  - Every wall file is ≤ 40 000 bytes.
  - `provenance.json` lists every produced file, each with non-empty `source`, `captured` and `data`.
  - No file comes from FluxTrack node `34:11280`.
- [ ] **Step 2: Run it.** `npm test`. Expected: FAIL (missing files).
- [ ] **Step 3: Implement `scripts/build-work-media.mjs`.**
  - Read sources from `docs/designs/redesign-2026-11-21/assets/v2/` (the file names already there map one-to-one, e.g. `korte-desktop.png` → `media/work/korte/live-desktop.webp`). Encode WebP at quality 82 for full screens and 75 for wall tiles.
  - Atlas phone-shaped wall tiles: crop 0.462-aspect strips from `atlas-list-desktop` (x 0), `atlas-journey` (x 560) and `atlas-step1-desktop` (x 300), plus `atlas-portrait`.
  - Atlas redaction: keep a `redactions` map of `{ file: [{ left, top, width, height, text }] }`. For each region, sharp-composite an SVG rectangle filled with the sampled header colour, with the replacement text in 14 px Montserrat-like sans at the original position. Find every region by viewing each Atlas source: the header name block sits at about x 1370–1525, y 20–70 at 1660 px; also look for “Requested By” fields.
- [ ] **Step 4: Run it.** `npm i -D sharp && node scripts/build-work-media.mjs && npm test`. Expected: PASS. Then open every Atlas output and confirm no trace of the original name.
- [ ] **Step 5: Commit.** `git add package.json package-lock.json scripts public/media/work && git commit -m "Add work media pipeline with provenance and Atlas redaction"`

### Task 3: Fonts, base theme and the 11 px floor

**Files:**
- Create: `src/styles/base.css`, `scripts/tests/css.test.mjs`, `public/licenses/newsreader.txt`, `anybody.txt`, `instrument-sans.txt`
- Modify: `package.json` (add `@fontsource-variable/newsreader`, `@fontsource-variable/anybody`, `@fontsource-variable/instrument-sans`; remove `@fontsource/syne`, `@fontsource/dm-sans`), `src/main.tsx` (font and CSS imports)
- Delete: `public/licenses/syne.txt`, `dm-sans.txt`

**Interfaces:**
- Produces CSS custom properties used by every later task:
  - Colours: `--page`, `--surface`, `--text`, `--muted`, `--rule`
  - Fonts: `--serif`, `--display`, `--sans`
  - Easing: `--ease-in-out-entry`, `--ease-morph`
  - Spacing: `--pad: clamp(20px, 4vw, 64px)`
  - Classes: `.label`, and the frame classes `.frame`, `.frame--browser`, `.frame--phone`, `.frame__bar` (values from the spec's Frames bullet)

- [ ] **Step 1: Write the failing test** `scripts/tests/css.test.mjs`. Scan every `src/**/*.css` for `font-size: Npx` and `font:` shorthands with a px size; assert none is below 11. Assert `public/licenses/{newsreader,anybody,instrument-sans}.txt` exist and `syne.txt` does not.
- [ ] **Step 2: Run it.** `npm test`. Expected: FAIL (old CSS still contains 10–10.5 px sizes; licences missing). Old CSS files are deleted in Task 12, so for now scope the scan to files under `src/styles/` and `src/components/*.css` that this redesign creates (list them in the test) and widen it to all of `src/` in Task 12.
- [ ] **Step 3: Implement.**
  - Install the fonts and import the axis CSS that carries the needed axes: Newsreader opsz plus italic, Anybody wdth, Instrument Sans wdth. Check each package's README for the exact file names.
  - Write `base.css` from the Global Constraints.
  - Copy the OFL texts from each package into `public/licenses`.
- [ ] **Step 4: Run it.** `npm test && npm run typecheck`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A src/styles src/main.tsx public/licenses scripts/tests package.json package-lock.json && git commit -m "Switch to Newsreader, Anybody and Instrument Sans on the dark base"`

### Task 4: Motion maths

**Files:**
- Create: `src/motion/scroll.ts`, `scripts/tests/motion.test.mjs`

**Interfaces:**
- Produces:
  - `clamp(v, a = 0, b = 1)`, `lerp(a, b, t)`, `easeInOutCubic(t)`, `range(v, start, end)` (clamped 0–1)
  - `snap(t: number, reduced: boolean): number`: returns `t` unchanged, or 0 or 1 (threshold .5) when `reduced`
  - `trackProgress(top: number, height: number, viewport: number): number`: unclamped (raw)
  - `chapterWipe(raw: number, index: number, count: number): number`. Chapter 0 uses `range(raw, -.07, .02)`; chapter i uses `range(clamp(raw), i/count - .03, i/count + .05)`.
  - `chapterLocal(raw: number, index: number, count: number): number`: `range(clamp(raw), i/count, (i+1)/count)`
  - `giantAxes(local: number, fit: number, first: boolean): { wdth: number; wght: number }`: wdth 50→fit and wght 300→820 over `range(local, first ? 0 : .08, .55)`, eased
  - `fitFontSize(widthAt100: number, viewportW: number, viewportH: number, mobile: boolean): number`: `min(100 * viewportW * .96 / widthAt100, viewportH * (mobile ? .2 : .34))`
  - `WALL_PATTERN = ["d","p","d","d","p","d","p","d","d","p","d"] as const`
  - `wallColumn(index: number): { dir: 1 | -1; speed: number; duration: number }`: dir `index % 2 ? 1 : -1`; speed `.08 + (index % 3) * .045`; duration `64 + (index % 4) * 16` seconds
  - `wallSource(which: "all" | number, type: "desktop" | "phone", col: number, i: number, lists: { desktop: string[]; phone: string[] }[]): { project: number; name: string }`. In “all” mode the project is `(col*3 + i) % 4` and the item is `(col + i) % len`; in project mode the item is `(col*2 + i) % len`.
  - `shadeEdge(scrollY: number, viewport: number, pointing: boolean): number`: `.42 + .3 * range(scrollY, viewport*.3, viewport*.9) - (pointing ? .14 : 0)`

- [ ] **Step 1: Write the failing test** `scripts/tests/motion.test.mjs`:

```js
test("chapter wipes", () => {
  assert.equal(chapterWipe(-.2, 0, 4), 0); assert.equal(chapterWipe(.02, 0, 4), 1);
  assert.equal(chapterWipe(.21, 1, 4), 0); assert.equal(chapterWipe(.30, 1, 4), 1);
  let prev = 0; for (let r = -.1; r <= 1.1; r += .001) { const w = chapterWipe(r, 2, 4); assert.ok(w >= prev - 1e-9); prev = w; }
});
test("giant stretch and fit", () => {
  assert.deepEqual(giantAxes(0, 122, false), { wdth: 50, wght: 300 });
  assert.deepEqual(giantAxes(.6, 122, false), { wdth: 122, wght: 820 });
  assert.equal(fitFontSize(500, 1440, 900, false), Math.min(100 * 1440 * .96 / 500, 900 * .34));
  assert.equal(fitFontSize(200, 390, 844, true), 844 * .2);
});
test("wall columns alternate and stay in range", () => {
  for (let c = 0; c < WALL_PATTERN.length; c++) {
    const col = wallColumn(c), next = wallColumn(c + 1);
    assert.notEqual(col.dir, next.dir);
    assert.ok(col.speed >= .08 && col.speed <= .17 && col.duration >= 64 && col.duration <= 112);
  }
});
test("wall sources mix in all mode and stay on one project when pointing", () => {
  const lists = [0, 1, 2, 3].map(k => ({ desktop: [`d${k}a`, `d${k}b`], phone: [`p${k}a`] }));
  assert.deepEqual(new Set([0, 1, 2, 3].map(i => wallSource("all", "desktop", 0, i, lists).project)), new Set([0, 1, 2, 3]));
  for (let i = 0; i < 8; i++) assert.equal(wallSource(2, "phone", 5, i, lists).project, 2);
});
test("reduced motion snaps", () => { assert.equal(snap(.4, true), 0); assert.equal(snap(.6, true), 1); assert.equal(snap(.4, false), .4); });
```

- [ ] **Step 2: Run it.** `npm test`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement `src/motion/scroll.ts`** with exactly the signatures above and no imports.
- [ ] **Step 4: Run it.** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add src/motion scripts/tests/motion.test.mjs && git commit -m "Add tested scroll and wall maths"`

### Task 5: Screen wall

**Files:**
- Create: `src/components/ScreenWall.tsx`, `src/components/screen-wall.css`, `scripts/check-browser.mjs`
- Modify: `package.json` (devDependency `playwright`; script `"check:browser": "node scripts/check-browser.mjs"`)

**Interfaces:**
- Consumes: `projects`, `WALL_PATTERN`, `wallColumn`, `wallSource`, `shadeEdge`, `snap`.
- Produces:
  - `<ScreenWall show={ProjectSlug | "all"} hidden={boolean} />`. It renders `.wall[data-show]`, `.wall-shade`, `.wall-tint`, all `aria-hidden`.
  - `check-browser.mjs` exports nothing. It builds once (`npm run build`), serves `dist` with `vite preview --port 4174`, runs named checks with Chromium (`chromium.launch()`), prints `PASS <name>` per check, and exits non-zero on the first failure. Later tasks add checks to it.

- [ ] **Step 1: Write the failing browser checks** in `scripts/check-browser.mjs`:
  - `wall-renders`: at 1440 × 900, `.wall .tile` count is 160, and the `.wall-tilt` rotate is `-14deg`.
  - `wall-swaps-after-decode`: set the attribute through the test hook `window.__wall.show("korte")`. Within 1.5 s, every `.tile img.on` src contains `/korte/`. Throttle image requests to 300 ms and assert no `.tile` ever has zero `img.on`.
  - `wall-reduced`: with `reducedMotion: "reduce"`, `.col-track` has `animation-name: none` and the column transforms stay `none` after scrolling 600 px.
- [ ] **Step 2: Run it.** `npm i -D playwright && npm run check:browser`. Expected: FAIL (no wall on the page yet; the home still renders the old design). Mount `<ScreenWall show="all" hidden={false} />` temporarily at the top of the old `Home` so the checks can run.
- [ ] **Step 3: Implement.**
  - Tiles: two `<img>` layers each. In a swap, set the back layer's `src`, `await img.decode()`, then toggle `.on`, staggered by `--i * 20ms` (`--i = (col*2 + i) % 20`).
  - Columns: `.col-track` uses the `drift` keyframes (`translateY(-50%)`) for `duration`; odd columns get `animation-direction: reverse`.
  - One rAF loop on scroll writes each column's `translateY(scrollY * speed * dir)` and the shade's `--edge` from `shadeEdge`.
  - Mounting: tiles mount after `load` via `requestIdleCallback` (fall back to a 200 ms timeout).
  - The `hidden` prop adds `.off` (opacity 0, visibility hidden, animation paused).
  - Expose `window.__wall = { show }` only when `import.meta.env.DEV` or `?checks` is in the URL.
  - Port the CSS values from the mockup's wall rules; on screens ≤ 860 px: column widths 190/88, gaps 12, a flat `.86` shade.
- [ ] **Step 4: Run it.** `npm run check:browser`. Expected: `PASS wall-renders`, `PASS wall-swaps-after-decode`, `PASS wall-reduced`.
- [ ] **Step 5: Commit.** `git add -A src/components scripts/check-browser.mjs package.json package-lock.json && git commit -m "Add the slanted screen wall with decode-safe swaps"`

### Task 6: Home hero and project list

**Files:**
- Create: `src/components/ProjectList.tsx`, `src/pages/home.css`
- Modify: `src/pages/Home.tsx` (rewrite), `scripts/check-browser.mjs`, `scripts/check-static.mjs`

**Interfaces:**
- Consumes: `projects`, `<ScreenWall>`.
- Produces: `<ProjectList onPoint={(slug: ProjectSlug | "all") => void} />`. Each row is a `<a class="row" href="#work-<slug>">`, a real link so it works without JavaScript; the click handler smooth-scrolls unless reduced motion is set.

- [ ] **Step 1: Write the failing checks.**
  - `check-static`: `dist/index.html` contains “I design how an idea”, all four row names, “Design + build · team of 3”, “UI/UX · Treasury module”, and no “Davao City” outside the Space Arabica row.
  - `check-browser`:
    - `list-hover`: hovering the Korte row sets `.wall[data-show="korte"]`; moving the pointer to the hero sets `all`.
    - `list-focus`: tabbing to the FluxTrack row sets `fluxtrack`.
    - `list-touch`: in a `hasTouch: true, isMobile: true` 390 × 844 context, tapping the Korte row scrolls so that `#work-korte` is within 4 px of its target, and `.wall` keeps `data-show="all"`.
- [ ] **Step 2: Run them.** `npm run build && node scripts/check-static.mjs; npm run check:browser`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Hero copy, verbatim: “I design how an idea *looks*, and build how it *works*.” The three lines rise in (1.1 s, 80 ms stagger).
  - Footer row: “Independent designer & developer” and “Identity · Interfaces · Working web products”.
  - List: the header row (Project / What it is / My part / Status); the dim-others effect at 32 %; the hovered name shifts 16 px, turns italic and takes `list.hover`.
  - Below 860 px: 96 px thumbnails from `desktop.src`.
- [ ] **Step 4: Run them.** Same commands. Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "Rebuild the home hero and project list over the wall"`

### Task 7: Project chapters

**Files:**
- Create: `src/components/ProjectWorlds.tsx`, `src/components/DeviceFrames.tsx`, `src/components/worlds.css`
- Modify: `src/pages/Home.tsx`, `scripts/check-browser.mjs`, `scripts/check-static.mjs`

**Interfaces:**
- Consumes: `projects`, `chapterWipe`, `chapterLocal`, `giantAxes`, `fitFontSize`, `snap`, `trackProgress`.
- Produces:
  - `<ProjectWorlds onActive={(slug: ProjectSlug | null) => void} />`. `Home` uses it to set the header's `--head` colour and `ScreenWall hidden` (`raw > .06`).
  - `<BrowserFrame title={string} src={string} alt={string} />`, `<PhoneFrame src alt />`.
  - Each chapter's desktop frame carries `style={{ viewTransitionName: "project-frame" }}` only while it is the active chapter (for Task 10).

- [ ] **Step 1: Write the failing checks.**
  - `check-static`: `dist/index.html` contains all four `id="work-…"` anchors and every chapter's name, line and three fact details. The prerendered chapter markup has no `visibility:hidden` and no `clip-path` in inline styles.
  - `check-browser`, at 1440 × 900, 1159 × 668, 390 × 844 and 320 × 740:
    - `chapters-midpoints`: scroll to each anchor; that chapter's `h2` is visible (elementFromPoint at its centre is inside it); `.wall.off`; `document.documentElement.scrollWidth <= innerWidth`; the giant span's width ≤ `innerWidth`, measured after `document.fonts.ready`.
    - `showcase-clear-of-header`: the desktop frame's top ≥ the header's bottom at every size.
    - `deep-link`: a cold load of `/#work-korte` shows Korte's `h2` visible and the wall off within 1 s.
    - `no-js`: with `javaScriptEnabled: false`, every chapter `h2` is visible after scrolling to it.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Track height: 560vh, or 520vh at ≤ 860 px.
  - Hydration: `.worlds.motion` is added on mount and enables sticky, clip-path and visibility. The wipe circle is centred at 62 % 46 %, with radius `hypot(vw, vh) * easeInOutCubic(wipe)`.
  - Left column: label, Anybody `h2`, Newsreader line, three facts and an “Open case study” link to `/work/<slug>/`.
  - Showcase: width `min(60vw, 1000px, calc((100svh - 250px) * 1.6))`. The desktop and phone frames rise from `34vh * depth` (desktop depth 1, phone 1.6) over `range(local, .04, .32)` and drift `-local * 50 * depth` px. The caption sits under the showcase.
  - Info fade: `range(local, .14, .3)`.
  - Giant: refit on mount, on `document.fonts.ready` and on resize.
  - Chapter index: centred in the header area, shown over 1100 px, only while a chapter is active.
  - ≤ 700 px tall: one fact. ≤ 860 px wide: two facts, info at the top.
- [ ] **Step 4: Run them.** Expected: PASS at all four sizes.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "Add the four project chapters in one template"`

### Task 8: Header, about, contact and footer

**Files:**
- Modify: `src/components/SiteChrome.tsx` (rewrite `Header`, `Contact`, `Footer`; delete `TextLink` if unused), `src/pages/Home.tsx`, `src/styles/base.css`, `public/404.html`

**Interfaces:**
- Produces:
  - `<Header tone?: string chapters?: { slug; name; active: boolean }[] />`: the name links to `/`; Work, About and Contact link to `/#work`, `/#about` and `/#contact`.
  - `<Contact />`: an Anybody “Let's make something.” and a Newsreader-italic `mailto:create@by-shion.dev`, on `#070809`.
  - `<Footer />`: “© 2026 Joshua Sabuero” and the email.

- [ ] **Step 1: Write the failing checks.**
  - `check-static`: every route contains `mailto:create@by-shion.dev` and “Let’s make something.” (existing email assert kept); no route contains “Syne”, “DM Sans” or “Davao City” outside Space Arabica.
  - `check-browser` `header-contrast`: at the top of `/`, the computed header text colour has contrast ≥ 4.5 against `#0d0f11`; inside each chapter, the header colour equals that chapter's text token.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - About: “I work on *both sides* of the screen, so an idea keeps one character from first sketch to shipped product.” and the four services, one line each, as in the mockup.
  - Header: the top gradient comes from the wall shade on `/` and from a solid `--page` 0.9 backdrop on case pages.
  - `404.html`: the same palette, Newsreader headline and labels at ≥ 11 px.
- [ ] **Step 4: Run them.** Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "Restyle header, about, contact, footer and 404"`

### Task 9: Case-study template and routes

**Files:**
- Create: `src/pages/ProjectCase.tsx`, `src/components/ScreenTabs.tsx`, `src/pages/case.css`
- Modify: `src/App.tsx` (route `^/work/(space-arabica|korte|fluxtrack|atlas-treasury)/?$` → `<ProjectCase slug>`), `scripts/prerender.mjs` (five routes; per-route title, description, canonical, JSON-LD; sitemap), `scripts/check-static.mjs`, `scripts/check-browser.mjs`
- Delete: `src/pages/CaseStudy.tsx`, `src/pages/KorteCaseStudy.tsx`, `src/korte-case.css`, `src/components/ScreenGallery.tsx`, `src/components/ProjectShowcase.tsx`

**Interfaces:**
- Consumes: `projectBySlug`, `nextProject`, `BrowserFrame`, `PhoneFrame`, `Header`, `Contact`, `Footer`.
- Produces:
  - `<ProjectCase slug={ProjectSlug} />`. Its hero `BrowserFrame` carries `viewTransitionName: "project-frame"`.
  - `<ScreenTabs tabs={Tab[]} />`: a WAI-ARIA tablist. ArrowLeft/ArrowRight move between tabs and Home/End jump to the ends. Enter or a click on a frame opens a `<dialog>` viewer; Escape closes it and returns focus.
  - Page titles: “Space Arabica — Joshua Sabuero”, “Korte — Joshua Sabuero”, “FluxTrack — Joshua Sabuero”, “Atlas Treasury — Joshua Sabuero”.

- [ ] **Step 1: Write the failing checks.**
  - `check-static`, for each case route: an `h1` with the project name; the question; three decision titles; four tab labels; a link to the next project's route; the correct canonical URL. Atlas's next link points to `/work/space-arabica/`. The sitemap lists five URLs. Space Arabica's page contains “View demo” and no `vercel.app`.
  - `check-browser`:
    - `tabs-keyboard`: focus the first tab, press ArrowRight; the second tab has `aria-selected="true"` and its panel is visible.
    - `viewer-escape`: Enter opens the dialog; Escape closes it and focus returns to the frame.
    - `case-layout`: at 390 × 844 there is no horizontal overflow on any case route.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement** the six sections in the spec's order (hero, overview, screens, decisions, reflection, next project), in the project's tokens. The overview facts row comes from `caseFacts`; Space Arabica's overview also links to `demo`.
- [ ] **Step 4: Run them.** `npm run typecheck && npm run lint && npm test && npm run build && node scripts/check-static.mjs && npm run check:browser`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "Add one case-study template for all four projects"`

### Task 10: Morph and wipe transitions

**Files:**
- Modify: `public/project-transitions.js`, `src/project-transitions.css`, `index.html`, `scripts/check-browser.mjs`

**Interfaces:**
- Consumes: the `project-frame` view-transition name (Tasks 7 and 9) and the project tokens.
- Produces, in `project-transitions.js`:
  - Three kinds of navigation: home↔case (morph) and case→case (wipe).
  - `root.dataset.projectTheme = slug` for all four slugs.
  - `root.dataset.transitionKind = "morph" | "wipe"`.

- [ ] **Step 1: Write the failing checks** (Chromium supports cross-document View Transitions):
  - `morph-into-case`: from `/#work-korte`, click Korte's “Open case study” and record `pagereveal` with `event.viewTransition` non-null and `transitionKind === "morph"`. The case `h1` reads “Korte”; there are no console errors.
  - `wipe-next-case`: on `/work/atlas-treasury/`, click the next-project link; it lands on `/work/space-arabica/` with `transitionKind === "wipe"`.
  - `back-lands-on-chapter`: after the morph, `page.goBack()` lands on `/#work-korte`; Korte's `h2` is visible, and no element matches `[data-project-switching]` or `.project-transition:not([hidden])` after 1 s. Repeat with the back/forward cache (`pageshow` persisted) by navigating away and back twice.
  - `transitions-reduced`: with reduced motion, `pagereveal`'s transition is skipped (`transitionKind` unset) and the navigation completes.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Morph: the shared `project-frame` group animates for 900 ms with the morph easing; the root crossfades.
  - Wipe: `::view-transition-new(root)` animates `clip-path: circle(0 at 50% 50%)` → `circle(150% at 50% 50%)` over 900 ms, on top of the old page, with the new page's `--ground` as background.
  - Case pages' “back” and header links use the `/#work-<slug>` anchors.
  - The non-native fallback keeps the existing sessionStorage arrival reveal, re-themed to the target ground.
  - Remove the old curtain label markup from `index.html` if it is no longer used.
- [ ] **Step 4: Run them.** Expected: PASS. Then watch both transitions once in a headed browser (`HEADED=1 npm run check:browser`) and confirm the frame visibly grows into the hero.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "Morph frames into case studies and wipe between cases"`

### Task 11: Space Arabica demo refresh

**Files:**
- Create: `scripts/sync-space-demo.mjs`, `scripts/space-demo/wip-banner.html`, `scripts/space-demo/wip-banner.css` (extracted from the current demo's banner markup in `public/work/space-arabica/demo/index.html` lines 30–37 and its `.wip-banner` rules in `contact-design.css`)
- Modify: `public/work/space-arabica/demo/**` (regenerated), `scripts/check-static.mjs`

**Interfaces:**
- Consumes: source `SOURCE = process.env.SPACE_ARABICA_SITE ?? "../space-arabica-2/local-site"`, at commit `9ba1c45`.
- Produces: seven pages (`index`, `menu`, `full-menu`, `space`, `order`, `story`, `contact`), each with the banner after `<body>` and `wip-banner.css` linked. Every `input`, `textarea` and `select` gets `disabled readonly tabindex="-1" aria-disabled="true"`. Every `<form>` loses its `action` and `target` and gains `data-demo-disabled`. Every `https://m.me/` link becomes an inert `<span>` with the same text.

- [ ] **Step 1: Write the failing check** in `check-static.mjs`. Loop over the seven pages: each contains `class="wip-banner"` and “Work in progress”; every `<input|textarea|select>` tag has both `disabled` and `readonly`; there is no `action="http` and no `href="https://m.me/`.
- [ ] **Step 2: Run it.** `npm run build && node scripts/check-static.mjs`. Expected: FAIL (`order.html` missing).
- [ ] **Step 3: Implement** the sync script with string transforms only (no DOM library). It deletes the old demo folder before copying.
- [ ] **Step 4: Run it.** `node scripts/sync-space-demo.mjs && npm run build && node scripts/check-static.mjs`. Expected: PASS. Then open `/work/space-arabica/demo/order.html` in `npm run dev` and confirm the form is visibly disabled.
- [ ] **Step 5: Commit.** `git add scripts/sync-space-demo.mjs scripts/space-demo public/work/space-arabica/demo scripts/check-static.mjs && git commit -m "Refresh the Space Arabica demo to the seven-page build"`

### Task 12: Remove the old site and update the docs

**Files:**
- Delete:
  - `src/pages/Index.tsx`, `src/index.css`, `src/story/`
  - `src/components/WorkCollage.tsx`, `src/components/ParticleField.tsx`
  - `src/collage.css`, `src/portfolio.css` (after moving anything still used into `base.css`), `src/showcase.ts`, `src/content.ts`
  - `scripts/check-story.mjs`, `scripts/prepare-showcase.py`
  - `public/media/showcase/`, `public/media/bento/`, `public/media/korte-case/`, and any other `public/media` file no route references
- Modify:
  - `package.json`: remove `gsap`, `three`, `@types/three`, `gh-pages`, `predeploy`, `deploy`; remove `homepage`
  - `scripts/tests/css.test.mjs`: widen the scan to all `src/**/*.css`
  - `README.md`, `PORTFOLIO_CONTEXT.md`, `DESIGN.md`, `PRODUCT.md`: replace their “current” sections with the new design
  - `docs/designs/asset-provenance.md`: point to `public/media/work/*/provenance.json`
  - `docs/designs/implementation-checks.md`: the new commands and results
  - The social cover `public/media/social-cover.png`: redraw at 1200 × 630 in the dark style, captured with Playwright from `scripts/social-cover.html`

- [ ] **Step 1: Add the failing checks.**
  - `scripts/tests/css.test.mjs` scans all of `src/`.
  - A new `scripts/tests/repo.test.mjs` asserts that `package.json` has none of the removed packages or scripts, and that every file under `public/media` is referenced by `dist/**/*.html`, `src/work/projects.ts` or a provenance file. Use an allowlist of `social-cover.png`, `shion-monogram.svg` and `commission-story.png`.
- [ ] **Step 2: Run them.** `npm test`. Expected: FAIL.
- [ ] **Step 3: Delete, update and redraw** as listed above.
- [ ] **Step 4: Run everything.** `npm run typecheck && npm run lint && npm test && npm run build && node scripts/check-static.mjs && npm run check:browser`. Expected: all PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "Remove the previous portfolio and document the redesign"`

### Task 13: Final verification

**Files:**
- Modify: `docs/designs/implementation-checks.md` (record results)

- [ ] **Step 1:** Run the full suite from Task 12, Step 4. Expected: all PASS.
- [ ] **Step 2:** Headed review at 1440 × 900, 1159 × 668, 390 × 844 and 320 × 740 (`HEADED=1 npm run check:browser`). Look at:
  - wall readability behind the hero and the list
  - the swap on every row
  - each chapter mid-wipe and at rest
  - every morph, wipe and back navigation
  - reduced motion (DevTools rendering emulation)
- [ ] **Step 3:** Lighthouse on `npm run preview` (`/` and `/work/korte/`). Expected: Performance ≥ 85 on mobile emulation; Accessibility 100; JS + CSS ≤ 150 KB gzip (read from the `vite build` output).
- [ ] **Step 4:** Record the results, including what was not tested (physical iPhone/Safari), in `implementation-checks.md`, then commit with `git add -A && git commit -m "Record redesign verification"`. Do not deploy; deploying is a separate request from Joshua.
