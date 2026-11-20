# Portfolio redesign — design

Date: 2026-11-21 (Asia/Singapore). Status: draft for Joshua's approval.
Approved look and motion: [`docs/designs/redesign-2026-11-21/d-index-worlds.html`](../../designs/redesign-2026-11-21/d-index-worlds.html) (throwaway mockup; run `npm run dev` and open `/docs/designs/redesign-2026-11-21/d-index-worlds.html`). Where this document and the mockup disagree, this document wins.

## Intent

Rebuild by-shion.dev from scratch so it presents Joshua as an independent designer and developer through four projects: **Space Arabica**, **Korte**, **FluxTrack** and **Atlas Treasury**. It should feel premium: dark, scroll-driven, with motion and morphing transitions. It must not overwhelm. A visitor should understand what Joshua does within the first screen, see each project one at a time, and reach him by email.

Who it is for: hiring teams and freelance clients, equally (unchanged from today).

The page's single job: show real, current work, consistently presented, and lead to an email.

## Goals

- Every project is shown in the **same layout**, with **current** screens: desktop at 1440 × 900 and phone at 390 × 844.
- One moving idea per screen. Motion follows scroll and stops when scrolling stops.
- Case studies use **one shared template**, and opening one morphs from the screen you were looking at.
- A dark theme throughout.

## Non-goals

- No contact form or backend. Contact stays `mailto:create@by-shion.dev`.
- No CMS, blog, light/dark toggle or résumé download (no current résumé supplied).
- No new projects beyond the four.

## Anti-goals (failure even if it works)

- Text that is hard to read over the moving screen wall.
- More than one competing animation on a screen.
- Claims the evidence does not support: invented metrics, solo credit for team work, real people's names or records in screenshots.
- Screens that are out of date (Korte must be the 3.0 UI; Space Arabica must be the current seven-page site).

## Approaches considered

Look and motion (Joshua chose the combination of B and C, then asked for a dark theme and the screen wall):

| Direction | Idea | Outcome |
| --- | --- | --- |
| A · One Window | One frame morphs into a different shape per project | Not chosen |
| B · Color Worlds | Each project takes over the screen in its own colour; circle wipes; stretching type | **Chosen**, as the project chapters |
| C · Quiet Index | Editorial project list; hover previews; shared-element morph into the case study | **Chosen**, as the hero, list and case-study morph |

Build approach (Joshua described outcomes and left the how to me):

| Option | Trade-off | Pick |
| --- | --- | --- |
| Rebuild inside the current React 18 + Vite + prerender setup | Keeps the working build, Vercel config, prerendering, routes and checks; no migration risk | **Chosen** |
| Move to Next.js or Astro | Nicer image tooling, but a migration with no visitor-facing gain for a five-route static site | Rejected |
| Animation library (GSAP) | Convenient, but every motion here is scroll-progress maths plus CSS; the mockup already runs on ~40 lines of helpers | Rejected; remove the unused `gsap` and `three` |

## Page structure (home, `/`)

Order: header → hero with screen wall → project list → project chapters → about → contact/footer.

### Header

Fixed. Name on the left; Work, About and Contact on the right. Its text colour follows the chapter on screen. A dark gradient keeps it readable over the wall. Inside the chapters, a centred chapter index (four names with a progress bar under the active one) appears on screens wider than 1100 px.

### Hero

- Headline in Newsreader: “I design how an idea *looks*, and build how it *works*.” The three lines rise in on load.
- Footer row: “Independent designer & developer” and “Identity · Interfaces · Working web products”. No personal location anywhere on the site (Joshua's decision). A client's own location, such as the café's, may appear in that project's label.

### Screen wall (behind the hero and the list)

- A fixed layer of real screens, rotated −14°, in 11 columns: wide columns hold desktop tiles (16:10) and narrow columns hold phone tiles. Pattern: d, p, d, d, p, d, p, d, d, p, d.
- Each column loops endlessly. Neighbouring columns drift in opposite directions (64–112 s per loop), plus a small scroll-linked offset (0.08–0.17 × scroll) in the same alternating directions.
- Default: tiles mix all four projects.
- Pointing at (or keyboard-focusing) a project row swaps every tile to that project's screens: each tile crossfades between two image layers, staggered ~20 ms per tile. A soft radial glow in the project's colour fades in on the right. Leaving the list returns to the mix.
- Readability: a left-to-right dark gradient (0.96 → about 0.45 alpha) that darkens further behind the list (up to about 0.72) and lightens slightly while pointing at a project. A top gradient protects the header.
- Once the first chapter's colour wipe begins, the wall fades out and its animation pauses.
- `aria-hidden`. Not focusable.

### Project list

Four rows: name (Newsreader, large) · what it is · my part · status (coloured dot). On hover, other rows dim to 32 %, and the hovered name shifts right, turns italic and takes the project colour. Clicking scrolls smoothly to the project's chapter. On phones each row shows a 16:10 thumbnail and hides the part/status columns. Phones have no hover, so the wall stays on the mix there.

| Project | What it is | My part | Status |
| --- | --- | --- | --- |
| Space Arabica | Café website, Davao City | Design + build | Preview online |
| Korte | Pickleball open play, Philippines | Design + build | In use |
| FluxTrack | Campus attendance system | Design + build · team of 3 | Rollout pending |
| Atlas Treasury | Finance request workflow | UI/UX · Treasury module | Institutional |

### Project chapters (“worlds”)

One sticky 100 vh stage across a tall scroll track, with four chapters in order: Space Arabica, Korte, FluxTrack, Atlas Treasury. **Every chapter uses the same template.**

- **Entry:** a circle in the chapter's ground colour grows from roughly the desktop frame's centre (62 %, 46 %) until it covers the screen.
- **Left column** (max 360 px): label (category · place), name in Anybody, one-line description in Newsreader, three facts, and an “Open case study” button.
- **Right:** a desktop screen in a browser frame (title bar with three dots and a page title), with a phone screen in a bezel overlapping its lower-left corner. They rise into place on entry, then drift slightly with scroll (phone 1.6× the desktop). The showcase is sized by both width and height (`min(60vw, 1000px, (100svh − 250px) × 1.6)`) so it never runs under the header or the giant name.
- **Caption** under the showcase, for example “Organizer on a laptop · player on a phone”.
- **Giant name** along the bottom in Anybody. Its width axis stretches from 50 to its fitted width (and weight from 300 to 820) during the first half of the chapter. It is fitted to 96 % of the viewport width, capped at 34 % of the viewport height (20 % on phones).

Chapter tokens (ground / text / giant):

| Project | Ground | Text | Giant |
| --- | --- | --- | --- |
| Space Arabica | `#1b130d` espresso | `#f1e3cc` | `#c9934a` amber |
| Korte | `#0c1626` Korte dark navy | `#eef2ea` | `#9acb2d` lime |
| FluxTrack | `#001c43` MMCM navy | `#ffffff` | `#ec1f28` MMCM red |
| Atlas Treasury | `#13161c` graphite | `#e8edf6` | `#4f86f0` Atlas blue |

FluxTrack and Atlas both come from MMCM, so they are deliberately split: saturated navy with red versus neutral graphite with blue.

Chapter copy (label, one-liner, facts, caption) is as written in the mockup. Credits:
- FluxTrack: “Designed and built it · team of three”.
- Atlas Treasury: labelled “Institutional project · Treasury module, MMCM”, credited “UI/UX designer, Treasury module”.
- Korte: the stack fact reads “Next.js, Supabase, Convex”.

Each chapter has an anchor (`#work-space-arabica`, `#work-korte`, `#work-fluxtrack`, `#work-atlas-treasury`) placed so it lands at the chapter's midpoint; the list, the chapter index and back-navigation from case studies all use it.

**Without JavaScript**, and in the prerendered HTML before hydration, the chapters are ordinary stacked sections, each one full screen in its ground colour, with all text and screens visible. A `motion` class added by script enables pinning, wipes and the giant stretch. The wall is built only by script.

### About and contact

- **About:** a statement in Newsreader (“I work on *both sides* of the screen…”) and four services (Logo & visual identity; UI/UX & product design; Website design & development; Web application development), each with one line.
- **Contact:** “Let's make something.” in Anybody and the email in Newsreader italic, on `#070809`, followed by the footer.

## Case-study template (all four projects)

Routes: `/work/space-arabica/`, `/work/korte/`, `/work/fluxtrack/` (new), `/work/atlas-treasury/` (new). All are prerendered.

Same order on every page, in the chapter's tokens:

1. **Hero:** the same browser-framed desktop screen, full width minus page padding, about 68 vh tall.
2. **Overview:** label, name (Anybody, giant colour), the question the project answers (Newsreader italic), a two-sentence intro, and a facts row: role, when, built with, status, proof.
3. **Screens:** a tabbed gallery, 3–4 tabs per project. Each tab shows one desktop and one phone frame side by side, with captions. This generalises Korte's current tabbed gallery so every project gets one. Keyboard: arrow keys move between tabs; Enter opens a full-size viewer; Escape closes it.
   | Project | Tabs (desktop · phone) |
   | --- | --- |
   | Space Arabica | Home (home · home) · Menu (menu · menu) · Spaces (spaces · spaces) · Visit (visit · visit) |
   | Korte | Run a session (live courts `33:3599` · live courts `24:953`) · Players (TV board `34:4100` · “You're up next” `49:6335`) · Organizer Hub (`69:15315` · podium `30:2521`) · Venues (partner `80:19048` · self check-in `48:5725`) |
   | FluxTrack | Faculty (`33:1374` · `34:30`) · Scan (`33:2118` · `34:2`) · Facilities (`34:12807` · `34:12685`) · Rooms (`34:10452` · `34:10346`) |
   | Atlas Treasury | File a request (step 1 `1:3432` · form `1:6739`) · Payment terms (step 3 `1:3542` · tall crop) · Track it (journey `1:3005` · tall crop) · My requests (`1:2981` · tall crop) |
4. **Decisions:** three numbered decisions (the problem, what was chosen, what happened). The numbers are a real sequence within the story.
5. **Reflection and next step**, plus an evidence note (what the screens are, and what is not claimed).
6. **Next project:** the next project's name and colour; the order loops (Atlas → Space Arabica). Clicking it wipes into that case study in its colour. Space Arabica's overview also links to the hosted demo (“View demo”).

Each route gets its own title, description, canonical URL and structured data in `scripts/prerender.mjs`, and the sitemap lists all five. The social preview image is redrawn in the dark style (1200 × 630).

## Transitions

- **Home → case study:** a cross-document View Transition. The chapter's desktop frame and the case hero share `view-transition-name: project-frame`, so the frame grows into the hero; the rest crossfades. Browsers without cross-document View Transitions get the existing arrival fade from `public/project-transitions.js` (re-themed to the chapter ground).
- **Case study → home (back):** the reverse morph, landing on that project's chapter.
- **Case → next case:** a circle wipe in the next project's ground colour.
- The mockup does the morph inside one page; the real build uses real routes so every page stays prerendered and linkable.

## Visual system

- **Base (dark):** page `#0d0f11`, surface `#16191c`, text `#e8eaeb`, muted `#8d959c`, rule `#262b30`.
- **Type** (self-hosted, OFL licences in `public/licenses`):
  - Newsreader (variable; opsz, wght 300–500, italic) for Joshua's voice: hero, one-liners, about, case questions.
  - Anybody (variable; wdth 50–150, wght 300–900) for project names and the giant words.
  - Instrument Sans for UI, body and labels (labels: 11 px, 600, 0.1em tracking, uppercase).
  - No functional text under 11 px anywhere: labels, captions, fact names, the chapter index, the browser-frame titles. Labels never sit directly above the hero headline; the hero's labels sit below it.
  - Syne and DM Sans are retired.
- **Frames:**
  - Browser: radius 12, 30 px title bar `#1c1f23` with three `#3a3f45` dots and a pill title.
  - Phone: radius 26 with a 6 px `#25292e` bezel.
  - Shadow: `0 50px 90px −40px rgba(0,0,0,.75)` plus a 1 px light outline.
- **Easing:** `cubic-bezier(.2,.7,.1,1)` for entrances and `cubic-bezier(.76,0,.18,1)` for morphs. Morph about 900 ms; wipes run over about 8 % of chapter scroll.

## Content

All project data lives in one typed module (replacing today's `src/content.ts` shapes). Per project: slug, name, category label, list columns (what it is / my part / status), chapter tokens, one-liner, three chapter facts, caption, case question, intro, facts row, gallery tabs (each: title, desktop asset, phone asset, captions), three decisions, reflection, evidence note, and wall screen lists (desktop and phone).

Copy sources (no claims beyond these):
- **Space Arabica:** `space-arabica-2/README.md` and `DESIGN.md` (seven pages, each with its own motion; the “One Pour” system), plus today's `src/content.ts` case copy.
- **Korte:** `Korte/docs/case-study/korte-before-after-copy.md`:
  - Role: “Solo designer and developer”.
  - When: March to November 2026; v1 → v2 → 3.0.
  - Usage: 112 organizers set up 373 meets between 30 March and 29 June 2026, 239 completed.
  - Stack: Next.js, Supabase, Convex.
- **FluxTrack:** `fluxtrack-main/PRODUCT.md`, `docs/PROGRESS.md` and the Figma case study (`Tp2icRcQ3dTqFrsQSeGnIS`: Roles & journeys, Design system, Process & iterations).
  - Proof: 1,637 automated tests passing.
  - Status: built, campus rollout pending.
  - It is a **three-person capstone** (SRS: Mayo, Ong, Sabuero). Joshua did the design and the build; his teammates had other responsibilities. Copy says “I designed and built FluxTrack as part of a three-person capstone team” and never implies he did the whole capstone alone.
- **Atlas Treasury:** an actual institutional project at MMCM, not a concept. Joshua was the UI/UX designer for its Treasury module. Copy credits that module only and makes no claim about the wider system, its build or its rollout. Facts come from the Figma case study frame (`yn261MuzNcCFYyQyA5J3m3`, node `2003:16394`): four request types, 100+ screens and states, flows, UI and design system.

## Assets

- **Capture spec:** desktop 1440 × 900, phone 390 × 844. Atlas is desktop-only at 1660 × 1180; it is shown in the same 16:10 browser frame, cropped from the top. Its phone-shaped tiles use the printable request form and tall crops of its desktop screens, captioned as such.
- **Delivery:** full screens as WebP (quality ~82) for frames and galleries; wall tiles as WebP at 640 px (desktop) and 300 px (phone), about 15–30 KB each. Wall images load after the hero text paints.
- **Location:** `public/media/work/<slug>/`, with a `provenance.json` per project recording the source (Figma file and node ID, or local build URL and commit), capture date and data notes.
- **Sources already gathered** (in `docs/designs/redesign-2026-11-21/assets/v2/`):
  - Space Arabica: home, menu, full menu, spaces, visit and story on desktop; home, menu, spaces, story and visit on phone. Captured 21 Nov 2026 from the `space-arabica-2` local build.
  - Korte (Figma `vVaqB6A9lmYpWGUKhbFZy5`, App Screens): live courts desktop `33:3599`, TV court board `34:4100`, Hub overview `69:15315`, partner dashboard `80:19048`, player “You're up next” `49:6335`, Explore `58:8892`, live courts phone `24:953`, podium `30:2521`, self check-in `48:5725`.
  - FluxTrack (Figma `Tp2icRcQ3dTqFrsQSeGnIS`): room utilization `34:12807`, faculty home desktop `33:1374` and phone `34:30`, buildings `34:10452` and `34:10346`, scan desktop `33:2118` and phone `34:2`, utilization phone `34:12685`, terms phone `34:13640`.
  - Atlas (Figma `yn261MuzNcCFYyQyA5J3m3`): step 3 bank `1:3542`, journey tab `1:3005`, my requests `1:2981`, step 1 `1:3432`, login `1:7433`, view-form modal `1:6739`.
- **Privacy rules:**
  - No screen may show real staff or student names next to records. FluxTrack's reporting dashboard (`34:11280`) is excluded because it lists faculty names with attendance percentages.
  - All names in screens must be fictional or demo data, and each provenance file says so.
  - FluxTrack's “Mary Jastine”, “Ivy Reyes” and “Prof. Reyes” are demo data (confirmed by Joshua).
  - Atlas is a real institutional project, so the signed-in name in its header (“Dones, Aisha Nicole”, role “CSA Facilitator”) is replaced with a neutral demo name in the delivered images unless Joshua confirms it is fine to show.

## Responsive behaviour

- **≤ 860 px:**
  - Wall: desktop columns 190 px, phone columns 88 px, 12 px gaps, and a flat 0.86 dim over the whole wall.
  - Project list: rows show thumbnails.
  - Chapters: the left column moves to the top (label, name, line, two facts, button), the showcase sits below it, the giant name at the bottom; the chapter index is hidden.
  - Case studies: a single column.
- **Short desktop screens (≤ 700 px tall):** chapters show one fact and a smaller name.
- **Wide or tall screens:** the showcase caps at 1000 px wide.

## Accessibility and reduced motion

- WCAG AA contrast on every ground; visible focus everywhere; the wall swap also works on keyboard focus; the case viewer traps focus and closes on Escape.
- `prefers-reduced-motion`:
  - The wall is static (no drift, no scroll offset) and swaps instantly.
  - Wipes and morphs become instant switches.
  - The giant words sit at their fitted width.
  - Chapters still pin, but nothing moves within them.
- The wall and the decorative frames are `aria-hidden`; every case-study screen in a gallery has a real alt text.

## Performance

- First load target: HTML + CSS + JS under 150 KB gzip; fonts subset to Latin.
- Wall images: about 500 KB total in WebP, loaded after first paint, from tiles near the viewport first.
- Animations use only transform, opacity and clip-path. The wall pauses when hidden or covered; scroll work runs in one requestAnimationFrame loop.

## Removals

- The current home (`Home.tsx`, `WorkCollage`, `ParticleField`, `collage.css`), the historical Three.js and GSAP files (`Index.tsx`, `index.css`, `src/story/*`), and the `gsap`, `three` and `gh-pages` dependencies and `deploy` script.
- `KorteCaseStudy.tsx`/`korte-case.css`, replaced by the shared template (its tabbed gallery idea carries over).
- `scripts/check-story.mjs` camera checks. The collage checks are replaced by checks for the new scroll maths (wipe ranges, giant fitting, and the wall's alternating directions).

## Space Arabica demo

Replace `public/work/space-arabica/demo/` with the current seven-page build (adds Order & Book). Keep the work-in-progress banner on every page and keep every form input `disabled` and `readonly`, including the Messenger and email actions. Update `scripts/check-static.mjs` for seven pages.

## Verification

- `npm run typecheck`, `npm run lint`, `npm test` (new scroll-maths checks) and `npm run build` (prerenders five routes).
- `node scripts/check-static.mjs`: all five routes exist with an `h1` and the email; local references resolve; the demo has the WIP banner and only disabled, read-only inputs; no `space-arabica-2.vercel.app` link.
- Browser checks at 1440 × 900, 1159 × 668, 390 × 844 and 320 × 740:
  - Wall readability.
  - The swap on hover and on focus.
  - Every chapter at its midpoint.
  - The morph into and out of each case study.
  - The case-to-case wipe.
  - Reduced motion.
  - No horizontal overflow.
- Physical iPhone/Safari check before launch; today's checks are Chromium only.

## Decided by Joshua

- The combination of B and C; the dark theme; the slanted, opposite-direction screen wall that swaps per project on hover (“feels right”); consistent layouts with current screens.
- FluxTrack: he did the design and build within a three-person capstone team.
- Atlas Treasury: an actual MMCM institutional project; he was the UI/UX designer for the Treasury module.
- The names in the FluxTrack screens are demo data.
- No personal location on the site.

## My calls (Joshua can override)

- The build stack and libraries, as above.
- Chapter order (Space Arabica, Korte, FluxTrack, Atlas).
- Four chapter palettes and the FluxTrack/Atlas split.
- One case-study template with a tabbed gallery for every project.
- Real routes with View Transitions instead of in-page overlays.
- Retiring Syne/DM Sans for Newsreader + Anybody + Instrument Sans.
- Refreshing the hosted Space Arabica demo to seven pages.

## Left to the builder

Component boundaries, file names, the exact scroll-track heights, image-pipeline tooling, and how provenance files are generated.

## Still to confirm

- Whether “Dones, Aisha Nicole” may appear in the Atlas screens. Until Joshua says yes, it is replaced with a demo name (see Privacy rules).
