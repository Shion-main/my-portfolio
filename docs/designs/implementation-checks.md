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
| `npm run check:browser` | Chromium: the screen wall (render, decode-safe swap, reduced motion); the project list (hover, keyboard focus, touch); every chapter at 1440×900, 1159×668, 390×844, 320×740 and landscape 844×390 (visible heading, no overflow, giant name fits, showcase clear of the header and the text); the push-through (fly-in, hand-off flash, landing, re-aimed after a resize, no blur on phones, reduced-motion cut, faded words take no clicks); glide after a wheel click and jumps drawn at once; finishing a move forward, back, after PageDown, after a reload, never under a finger, and never over the reader's own input; the first arrival through the wall; single wheel notches and arrow keys advance; finishing from the list and back to it; a reload keeps the address's chapter; rotation keeps the chapter; nothing finishes under a held button; a list click plays one move; reduced motion has no drift; a frame budget on the machine's GPU with a ceiling on the cold first arrival; keyboard focus into chapters; touch taps leave no hover state; deep links, including a slow load that must not pull the reader back; no-JavaScript; header contrast; case-study tabs, viewer and phone layout; morph, the whip from one case study into the next (including the loop; no morphed frame, the header held still), back navigation and reduced-motion transitions; the case hand-off as a whip pan (the frames at the contact block, mid-whip, the hold, mid-way out and the cut; finishing either whip both ways; carries on by itself, once, only after reader input; Back rests on the next project; keyboard focus brings each shot on screen; `#contact`; reduced motion puts the contact block first; next project visible at the hold on desktop, phone and landscape; no overflow and the phone blur cap mid-whip; the next project gone at the cut; rotation on the contact block and at the hold; a frame budget on the GPU with a ceiling on the cold whip) |

## Results (2026-11-22, one pan between case studies, phones on transforms only, Korte Explore; branch polish/one-pan-landing)

- Recorded frame by frame, the old move was a whip out, almost half a second of empty blurred screen, then a second skewed whip. Now: a short pull (the next project leans away), then one pan with both pages travelling together. The next case study is prerendered near the hand-off (Chromium; prefetched elsewhere) and opens as soon as the reader's own forward scroll reaches the end: about 0.65 s from the end to opening before, under 0.35 s after (`handoff-opens-at-the-end`).
- Phones (860px or less) run the hand-off and the pan on transforms only: no blur, no streak layer, no per-frame font-width change, a solid header instead of a frosted one (`handoff-phone`, `whip-next-case-phone`). An emulated phone held about 60 fps before and after; a real phone's GPU cannot be measured here, so these follow the home page's rule for phones.
- Korte's main desktop screen is the public Explore page (korteph.app/explore, captured logged out, consent banner hidden, no player names). Rebuilding all of Korte from the default media folder would have rolled back the 2026-11-22 Figma screens, so only the new screen was added; `build-work-media.mjs` now warns about this.
- Checks made reliable: `header-contrast` waits for the colour instead of a fixed 600 ms (a cold first jump measured 0.4–1.0 s); `whip-next-case-phone` retries once when headless Chromium navigates with no transition at all (about 1 in 6, with or without prerender, tap or click), and still fails every time if the pan blurs on a phone (checked by breaking it on purpose).

## Results (2026-11-22, case studies rewritten for clients, branch content/case-studies-for-clients)

- Copy approved by Joshua, drawn from his Figma case-study files (Korte UI/UX and Developer pages, FluxTrack's three chapters, Atlas Treasury) and his answers. New template: headline and facts at a glance, the challenge, what I did, results, screens, a line for the client with “Let’s talk”, and a note. Atlas is now Atlas Treasury at `/work/atlas-treasury/`.
- `npm test`: 40 passed (adds checks that the template is filled, no technical stats appear, and the approved credits and numbers); `npm run typecheck`, `npm run lint`: clean; `node scripts/check-static.mjs`: passed (every section's text is on each page, the old template is gone); `npm run check:browser`: 75 of 76 in the full run, including the new `case-template` (section order and “Let’s talk” reaching the contact block). The one miss, `space-arabica-demo-transitions` (the embedded demo's own page transition), passes on its own three times out of three; it only times out inside the long full run.

## Results (2026-11-22, whip-pan hand-off, branch redesign/index-worlds)

- After the minor fixes from the final review: `npm test`: 39 passed (adds the whip's normal blending); `npm run check:browser`: 75 of 75 (one run lost `space-arabica-demo-transitions`, the embedded demo's own page transition, which this change does not touch; it passed on both reruns). New: if the app's code fails to load, the end of a case study falls back to the plain layout; rotating while the contact block scrolls in keeps the place without scroll anchoring; the contact label clears the header on landscape phones; the streaks are dashed so their sweep shows; the bars scale instead of changing height; the shots get their own layers only near the hand-off (the cold first whip now drops 9–11 frames, ceiling 14; a 4× CPU-throttled whip is printed: p95 16.8 ms); the next project's shot clips instead of scrolling; the landing runs only the whip's own animations on its root images (no plus-lighter blend).
- `npm test`: 38 passed; `npm run typecheck`, `npm run lint`: clean; `node scripts/check-static.mjs`: passed; `npm run check:browser`: 69 of 69 passed (Chromium 153), including six new hand-off checks (whip frames, finishing the whip in, `#contact`, the whip's frame budget, and from the final review: a click or tap on the email while the contact block scrolls in stays put and reaches the link; opening by itself gets the fallback arrival fade without native view transitions).
- Frame budget for the whip on the machine's GPU (AMD Radeon, ANGLE D3D11): warm p95 16.8 ms with no frame over 20 ms; the cold first whip drops 7–9 frames (ceiling 14), the same range as the home page's cold first arrival. Two things brought it there from 11–19: the next project's lazy screenshot is now loaded and decoded as the reader nears the hand-off instead of mid-whip, and the moving shots get their own layers up front (`will-change`).
- Frames reviewed at s = 0.2, 0.6, 0.8, 1.1, 1.55, 2.0, 2.3 and 2.59 at 1440×900, 390×844 and 844×390. The page change's own whip runs in Chrome but is not captured headless.

## Results (2026-11-22, case hand-off, branch redesign/index-worlds)

- `npm test`: 35 passed; `npm run typecheck`, `npm run lint`: clean; `node scripts/check-static.mjs`: passed; `npm run check:browser`: 63 of 63 passed (Chromium 153), including six added from the final review (rotation, phone toolbar, Back crossfade, sizing before the app runs, restore mid-arrival, End key). Frames reviewed at s = −0.3, 0.2, 0.45, 0.85, 1.3, 1.7, 1.95 and the landing on Korte at 1440×900, 390×844 and 844×390, plus the reduced-motion ending.

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
