# Portfolio context for a new agent

Last reviewed: 21 November 2026 (Asia/Singapore). Published at **https://by-shion.dev** on Vercel. The approved design is `docs/superpowers/specs/2026-11-21-portfolio-redesign-design.md`; read it before changing layout, copy or motion. Older documents in `docs/designs/` describe previous versions.

## What this portfolio is

Joshua Sabuero's personal portfolio. It presents him as an independent designer and developer — visual identity, interfaces and working web products — for freelance clients and hiring teams equally. A visitor goes: intro → project list → four project chapters → about → contact. Contact is a `mailto:create@by-shion.dev` link; there is no form or backend.

## Pages

| Route | What a visitor sees | Source |
| --- | --- | --- |
| `/` | Serif hero over a slanted, moving wall of real screens; project list (pointing at a row fills the wall with that project); four colour chapters in one layout; about with four services; contact | `src/pages/Home.tsx` |
| `/work/space-arabica/`, `/work/korte/`, `/work/fluxtrack/`, `/work/atlas-accountancy/` | One case-study template: hero frame, overview and facts, four-tab screen gallery with a larger viewer, three decisions, reflection, next project | `src/pages/ProjectCase.tsx` |
| `/work/space-arabica/demo/` | The café's seven-page site, hosted as a demo with a work-in-progress banner and every form disabled | `public/work/space-arabica/demo/` |

## The four projects (all copy lives in `src/work/projects.ts`)

- **Space Arabica** — café website in Ecoland, Davao City (the café's location). Sole designer & developer. Seven pages, each with its own motion idea. Preview online.
- **Korte** — pickleball open play in the Philippines. Solo designer & developer, March–November 2026; Korte 3.0 is calmer and light by default. 112 organizers set up 373 meets between 30 March and 29 June 2026 (239 completed). Built with Next.js, Supabase, Convex. Screens are Korte 3.0 App Screens with made-up names.
- **FluxTrack** — MMCM faculty attendance and facility utilization system. A three-person capstone: Joshua designed and built it; teammates had other responsibilities. 1,637 automated tests passing; campus rollout pending. Screens use demo data. The reporting dashboard with staff-like names (Figma `34:11280`) is never used.
- **Atlas Accountancy** — an actual MMCM institutional project; Joshua was the UI/UX designer for its Accountancy module. Claims cover that module's design only. Signed-in names in screens are replaced with “Demo Requester”.

No personal location appears anywhere on the site.

## Look and motion

Dark base (`#0d0f11`), Newsreader for Joshua's voice, Anybody for project names (its width axis stretches as chapters arrive), Instrument Sans for UI. Each chapter has its own ground: espresso/amber, Korte navy/lime, MMCM navy/red, graphite/blue. Chapters change with a push-through camera move: into the current project's laptop screen and out into the next project, which lands piece by piece; the first project arrives out of the wall of screens. Scroll glides, and a move stopped halfway finishes itself. Home → case study is a cross-document View Transition where the chapter's browser frame morphs into the hero; case → next case is a circle wipe. Reduced motion turns all of it off; without JavaScript every chapter is a readable stacked section. No text is smaller than 11 px.

## Technical map

- React 18 + TypeScript + Vite. `src/App.tsx` picks the route; `src/entry-server.tsx` and `scripts/prerender.mjs` prerender five routes with titles, canonical URLs, JSON-LD and a sitemap; `src/main.tsx` hydrates.
- Pure scroll maths in `src/motion/scroll.ts` (unit-tested); components only measure and write styles.
- Media: `public/media/work/<slug>/` (full screens, `wall/` tiles, `provenance.json`), produced by `scripts/build-work-media.mjs`.
- Checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `node scripts/check-static.mjs`, `npm run check:browser`.

## Editing cautions

Keep credits exactly as above. Re-run `scripts/build-work-media.mjs` rather than editing images by hand, so provenance stays true. Re-run `scripts/sync-space-demo.mjs` to update the demo; never ship a demo page whose inputs or links can send anything. Preserve unrelated working-tree edits.
