# Portfolio context for a new agent

Last reviewed: 21 November 2026 (Asia/Singapore). Published at **https://by-shion.dev** on Vercel. The approved design is `docs/superpowers/specs/2026-11-21-portfolio-redesign-design.md`; read it before changing layout, copy or motion. Older documents in `docs/designs/` describe previous versions.

## What this portfolio is

Joshua Sabuero's personal portfolio. It presents him as an independent designer and developer — visual identity, interfaces and working web products — for freelance clients and hiring teams equally. A visitor goes: intro → project list → four project chapters → about → contact. Contact is a `mailto:create@by-shion.dev` link; there is no form or backend.

## Pages

| Route | What a visitor sees | Source |
| --- | --- | --- |
| `/` | Serif hero over a slanted, moving wall of real screens; project list (pointing at a row fills the wall with that project); four colour chapters in one layout; about with four services; contact | `src/pages/Home.tsx` |
| `/work/space-arabica/`, `/work/korte/`, `/work/fluxtrack/`, `/work/atlas-treasury/` | One case-study template, written for clients (approved 2026-11-22): hero frame, headline and facts at a glance, the challenge, what I did (three or four moves), results, a four-tab screen gallery with a larger viewer, then a line for the client with a “Let’s talk” link to the contact block and a short honest note; then the hand-off: the contact block whips over to the next project, which carries on into its case study | `src/pages/ProjectCase.tsx` |
| `/work/space-arabica/demo/` | The café's seven-page site, hosted as a demo of Joshua's original design (banner links to the live site, Joshua's second design made to the owner's brief) with every form disabled; embedded in the Space Arabica case study | `public/work/space-arabica/demo/` |

## The four projects (all copy lives in `src/work/projects.ts`)

- **Space Arabica** — café website in Ecoland, Davao City (the café's location). Sole designer & developer. Seven pages, each with its own motion idea. The owner then asked for a different type of site, which Joshua also designed and built; that second design is live at spacearabica.com. The case study tells this as its last move (“Built what the owner chose”), embeds his original direction as a full working demo and links to the live site.
- **Korte** — one app for the pickleball community in the Philippines: players, organizers and venues. Organizers had been using one to four apps to run open play. Solo designer & developer, March–November 2026, three versions; Korte 3.0 launched on 28 October 2026. 1,800+ users and 700+ sessions completed, and counting (Joshua, 2026-11-22). Built with Next.js, Supabase, Convex. Screens are Korte 3.0 App Screens with made-up names. Case-study sources: the Figma “Case Study · UI/UX” and “Case Study · Developer” pages; the older “Case Study” page is not used.
- **FluxTrack** — MMCM faculty attendance and room occupancy system that a three-person capstone team researched and pitched, so the school has data on how its rooms are used. Joshua researched, designed and built it; campus rollout pending. Screens use demo data. Technical stats (such as test counts) stay out of the case study. The reporting dashboard with staff-like names (Figma `34:11280`) is never used.
- **Atlas Treasury** — Atlas is Mapúa's in-house system; Joshua was the UI/UX designer for its accounting module, used by the Accounting / Treasury Office, turning manual forms and processes into a familiar, easy-to-use system. It was his first ever UI/UX work (confirmed 2026-11-22). Claims cover that module's design only. Signed-in names in screens are replaced with “Demo Requester”.

No personal location appears anywhere on the site.

## Look and motion

Dark base (`#0d0f11`), Newsreader for Joshua's voice, Anybody for project names (its width axis stretches as chapters arrive), Instrument Sans for UI. Each chapter has its own ground: espresso/amber, Korte navy/lime, MMCM navy/red, graphite/blue. Chapters change with a push-through camera move: into the current project's laptop screen and out into the next project, which lands piece by piece; the first project arrives out of the wall of screens. Scroll glides, and a move stopped halfway finishes itself. Home → case study is a cross-document View Transition where the chapter's browser frame morphs into the hero; at the end of a case study, after the reflection, the case study carries on into the next project as a whip pan: the contact block (“Let’s make something.”) streaks off to the left as the next project races in from the right, its giant name ahead of its laptop, with motion blur, streaks and cinema bars at the fastest point; it holds with a “Continue to …” link; scrolling on starts a second whip that the page change finishes, the next case study sliding in from the right as the header holds still. The next case opens by itself only after the reader has scrolled, never on a reload or restore; Back rests on the next project; reduced motion keeps the contact block and a plain next-project section with the link. Reduced motion turns all of it off; without JavaScript every chapter is a readable stacked section. No text is smaller than 11 px.

## Technical map

- React 18 + TypeScript + Vite. `src/App.tsx` picks the route; `src/entry-server.tsx` and `scripts/prerender.mjs` prerender five routes with titles, canonical URLs, JSON-LD and a sitemap; `src/main.tsx` hydrates.
- Pure scroll maths in `src/motion/scroll.ts` (unit-tested); components only measure and write styles.
- Media: `public/media/work/<slug>/` (full screens, `wall/` tiles, `provenance.json`), produced by `scripts/build-work-media.mjs`.
- Checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `node scripts/check-static.mjs`, `npm run check:browser`.

## Editing cautions

Keep credits exactly as above. Re-run `scripts/build-work-media.mjs` rather than editing images by hand, so provenance stays true. Re-run `scripts/sync-space-demo.mjs` to update the demo; never ship a demo page whose inputs or links can send anything. Preserve unrelated working-tree edits.
