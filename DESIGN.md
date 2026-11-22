# Portfolio design system

Current (2026-11-21). The full approved design, including motion values and the case-study template, is `docs/superpowers/specs/2026-11-21-portfolio-redesign-design.md`. Exact values live in `src/styles/base.css` and the component stylesheets; this page is the summary.

## Direction

Confident, crafted, community-minded. A dark stage where Joshua's own voice is quiet and each project arrives in its own colour. One moving idea per screen; motion follows scroll and stops when scrolling stops. Project evidence and Joshua's part come before decoration.

## Colour

| Token | Value | Role |
| --- | --- | --- |
| `--page` | `#0d0f11` | Page background |
| `--surface` | `#16191c` | Frames, wall tiles, viewer |
| `--text` | `#e8eaeb` | Text |
| `--muted` | `#8d959c` | Labels, supporting text |
| `--rule` | `#262b30` | Rules and borders |

Project chapters (ground / text / giant): Space Arabica `#1b130d` / `#f1e3cc` / `#c9934a` · Korte `#0c1626` / `#eef2ea` / `#9acb2d` · FluxTrack `#001c43` / `#ffffff` / `#ec1f28` · Atlas Treasury `#13161c` / `#e8edf6` / `#4f86f0`. FluxTrack and Atlas both come from MMCM, so they are split into saturated navy with red and neutral graphite with blue.

## Typography

- **Newsreader** (variable, opsz and italic) — Joshua's voice: hero, chapter one-liners, about, case questions.
- **Anybody** (variable, wdth 50–150) — project names and the giant words, which stretch from condensed to their fitted width as a chapter arrives.
- **Instrument Sans** — UI, body and labels. Labels are 11 px, weight 600, 0.1em tracking, uppercase.
- No functional text below 11 px anywhere (checked by `scripts/tests/css.test.mjs`).

## Layout and components

- **Screen wall** behind the hero and list: 11 columns of real screens rotated −14°, neighbours drifting in opposite directions; pointing at a project swaps every tile to that project after its image has decoded.
- **Project list**: four rows (name, what it is, my part, status); others dim while one is pointed at.
- **Chapters**: one template — label, name, one-liner, three facts and a button on the left; a browser frame with an overlapping phone on the right; a giant name along the bottom.
- **Case study** (written for clients): hero frame, headline and facts at a glance, the challenge, what I did (three or four moves), results, a four-tab screen gallery with a larger viewer, then a line for the client with a “Let’s talk” link to the contact block and a short honest note; then the hand-off: the contact block whips over to the next project (no footer).
- **Frames**: browser (radius 12, 30 px title bar) and phone (radius 26, 6 px bezel), the same everywhere.

## Motion and accessibility

Entrances use `cubic-bezier(.2,.7,.1,1)`, morphs `cubic-bezier(.76,0,.18,1)` at about 900 ms. Chapters change with a push-through: scroll flies the camera into the current project's laptop screen (it scales around the screen and motion-blurs), a soft flash in the next project's colour hands over, and the next project rushes out to meet the camera before its giant name, laptop, phone and words land in turn. The first project arrives the same way out of the wall of screens, which rushes toward the camera as the list leaves. The drawn motion glides after each wheel click (130 ms), each move takes a full screen of scroll, and a move the reader stops inside finishes in the direction they were heading; phones get the move without blur. Home → case study morphs the frame into the hero. At the end of a case study, after the reflection, the case study carries on into the next project as a whip pan: the contact block (“Let’s make something.”) streaks off to the left as the next project races in from the right, its giant name ahead of its laptop, with motion blur, streaks and cinema bars at the fastest point; it holds with a “Continue to …” link; scrolling on starts a second whip that the page change finishes, the next case study sliding in from the right as the header holds still. The next case opens by itself only after the reader has scrolled, never on a reload or restore; Back rests on the next project; reduced motion keeps the contact block and a plain next-project section with the link. The home page dives into projects; between case studies the camera pans along. `prefers-reduced-motion` removes drift, the camera move, glide, stretching and morphs, and chapters cut at the middle of each move. Without JavaScript the chapters are stacked, readable sections. Focus is always visible, the gallery is keyboard-operable, and text meets WCAG AA on every ground.
