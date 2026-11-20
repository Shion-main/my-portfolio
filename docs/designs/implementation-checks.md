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
| `npm run check:browser` | Chromium: the screen wall (render, decode-safe swap, reduced motion); the project list (hover, keyboard focus, touch); every chapter at 1440×900, 1159×668, 390×844 and 320×740 (visible heading, no overflow, giant name fits, showcase clear of the header); deep links; no-JavaScript; header contrast; case-study tabs, viewer and phone layout; morph, wipe, back navigation and reduced-motion transitions |

## Results

Recorded in Task 13 of `docs/superpowers/plans/2026-11-21-portfolio-redesign.md`.

## Not covered

Physical iPhone and Android devices and Safari: all automated checks run in Chromium.
