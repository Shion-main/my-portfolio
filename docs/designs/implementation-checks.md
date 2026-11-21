# Portfolio implementation checks

Current build: the dark “Index & Worlds” redesign (design: `docs/superpowers/specs/2026-11-21-portfolio-redesign-design.md`).

## How to check

| Command | What it checks |
| --- | --- |
| `npm test` | `node:test` suites in `scripts/tests/`: project data and confirmed credits, media and provenance for every screen, scroll and wall maths, the 11 px text floor and font licences, removed tooling and unused media |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm run build` | Client build, SSR bundle, five prerendered routes and the sitemap |
| `node scripts/check-static.mjs` | Every route has its heading, copy, contact block, canonical URL and title; local links resolve; no retired fonts or personal location; the seven demo pages show the “my original design” banner with a live-site link and a back link that leaves the frame, and nothing on them can send; the Space Arabica case study embeds the demo (lazy, titled) and links safely to spacearabica.com |
| `npm run check:browser` | Chromium: the screen wall (render, decode-safe swap, reduced motion); the project list (hover, keyboard focus, touch); every chapter at 1440×900, 1159×668, 390×844, 320×740 and landscape 844×390 (visible heading, no overflow, giant name fits, showcase clear of the header and the text); the push-through (fly-in, hand-off flash, landing, re-aimed after a resize, no blur on phones, reduced-motion cut, faded words take no clicks); glide after a wheel click and jumps drawn at once; finishing a move forward, back, after PageDown, after a reload, never under a finger, and never over the reader's own input; the first arrival through the wall; single wheel notches and arrow keys advance; finishing from the list and back to it; a reload keeps the address's chapter; rotation keeps the chapter; nothing finishes under a held button; a list click plays one move; reduced motion has no drift; a frame budget on the machine's GPU with a ceiling on the cold first arrival; keyboard focus into chapters; touch taps leave no hover state; deep links, including a slow load that must not pull the reader back; no-JavaScript; header contrast; case-study tabs, viewer and phone layout; morph, wipe, back navigation and reduced-motion transitions |

## Results (2026-11-22, push-through transitions, branch redesign/index-worlds)

- `npm test`: 33 passed, 0 failed.
- `npm run typecheck`, `npm run lint`: clean.
- `npm run build`: five routes prerendered; JS 60.0 KB and CSS 5.7 KB gzipped.
- `npm run check:browser`: 48 of 48 passed (Chromium 153), including seven added from the final review, one for long names, one that Atlas shows no phone, one that the Space Arabica demo runs inside its case study and one that its page transitions run; `node scripts/check-static.mjs`: passed.
- Frame budget, wheel-scrolling the arrival and all three moves at 1440×900 on this laptop's integrated AMD Radeon (D3D11): p95 16.7 ms, no frame over 20 ms; a warm arrival p95 16.8 ms. At 4× CPU throttle p95 33 ms. Headless Chromium draws in software by default (SwiftShader), where the blurs cost several times more (p95 33–50 ms); the budget is judged on the GPU.
- Known cost: a visitor's very first arrival (cold page) drops 7–12 frames on that GPU, against 1 for the old circle; every later pass holds 60 fps. It is the sum of the new effects (wall dive, chapter blur, the screen-blend flash, giant stretch); no single one removes it. The check fails above 14.
- Frames reviewed at .2, .4, .5, .6, .75 and .95 of the first move at 1440×900, 390×844 and 844×390, plus the first arrival.

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
