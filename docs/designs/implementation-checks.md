# Portfolio implementation checks

Current build: the dark “Index & Worlds” redesign (design: `docs/superpowers/specs/2026-11-21-portfolio-redesign-design.md`).

## How to check

| Command | What it checks |
| --- | --- |
| `npm test` | `node:test` suites in `scripts/tests/`: project data and confirmed credits, media and provenance for every screen, scroll and wall maths, the 11 px text floor and font licences, removed tooling and unused media |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm run build` | Client build, SSR bundle, five prerendered routes and the sitemap |
| `node scripts/check-static.mjs` | Every route has its heading, copy, contact block, canonical URL and title; local links resolve; no retired fonts or personal location; the seven demo pages show the work-in-progress banner and nothing on them can send |
| `npm run check:browser` | Chromium: the screen wall (render, decode-safe swap, reduced motion); the project list (hover, keyboard focus, touch); every chapter at 1440×900, 1159×668, 390×844, 320×740 and landscape 844×390 (visible heading, no overflow, giant name fits, showcase clear of the header and the text); keyboard focus into chapters; touch taps leave no hover state; deep links, including a slow load that must not pull the reader back; no-JavaScript; header contrast; case-study tabs, viewer and phone layout; morph, wipe, back navigation and reduced-motion transitions |

## Results (2026-11-21, branch redesign/index-worlds)

- `npm test`: 26 passed, 0 failed.
- `npm run typecheck`, `npm run lint`: clean.
- `npm run build`: five routes prerendered; JS 57.4 KB and CSS 5.4 KB gzipped.
- `node scripts/check-static.mjs`: passed.
- `npm run check:browser`: 23 of 23 passed (Chromium 153), including the six checks added from the code review.
- Screenshot review at 1440×900 and 390×844: hero over the wall, the list pointing at a project, every chapter, case studies, the mid-morph and mid-wipe frames, the hosted demo with its banner.
- Lighthouse 12 (simulated mobile, Chrome): `/` Performance 81, Accessibility 100 (FCP 1.4 s, LCP 5.1 s, TBT 30 ms); `/work/korte/` Performance 80, Accessibility 100 (LCP 3.9 s, TBT 0 ms). The plan's Performance target of 85 is not met. On `/` the largest element Lighthouse picks is a decorative wall tile that mounts after the hero paints; on case pages the four variable font files (about 385 KB, mostly Newsreader's optical-size axis) and the hero image dominate.

## Not covered

Physical iPhone and Android devices and Safari: all automated checks run in Chromium.
