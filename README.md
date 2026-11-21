# Joshua Sabuero — Portfolio

A dark, scroll-driven portfolio published at https://by-shion.dev. A slanted wall of real screens sits behind the intro and project list; pointing at a project fills the wall with that project's screens. Four projects — Space Arabica, Korte, FluxTrack and Atlas Treasury — each take over the screen in the same chapter layout, and each has a case study built from one shared template. Opening a case study morphs the chapter's browser frame into the case-study hero.

Design: `docs/superpowers/specs/2026-11-21-portfolio-redesign-design.md`. Build plan: `docs/superpowers/plans/2026-11-21-portfolio-redesign.md`.

## Run locally

```bash
npm ci
npm run dev
```

Open the URL Vite prints (port 8080). `npm run build` builds the client and prerenders five routes (`/` and the four case studies) to complete HTML; `npm run preview` serves that output. `VITE_BASE_PATH` is available for a subdirectory deployment; production uses `/`.

## Where things live

| What | Where |
| --- | --- |
| All project copy, credits, colours, screens, gallery tabs and wall lists | `src/work/projects.ts` |
| Scroll and motion maths (chapter timeline, push-through poses, glide and finishing, wall columns) | `src/motion/scroll.ts` |
| Dark base: tokens, fonts, labels, device frames | `src/styles/base.css` |
| Home page: hero, list, chapters, about, contact | `src/pages/Home.tsx`, `src/pages/home.css` |
| Screen wall | `src/components/ScreenWall.tsx`, `screen-wall.css` |
| Project list | `src/components/ProjectList.tsx` |
| Project chapters | `src/components/ProjectWorlds.tsx`, `worlds.css`, `chapterScroll.ts` |
| Case-study template and screen tabs | `src/pages/ProjectCase.tsx`, `src/pages/case.css`, `src/components/ScreenTabs.tsx` |
| Header, contact, footer | `src/components/SiteChrome.tsx`, `chrome.css` |
| Page transitions (morph and wipe) | `public/project-transitions.js`, `src/project-transitions.css` |
| Titles, descriptions, canonical URLs, structured data, sitemap | `scripts/prerender.mjs` |
| Hosted Space Arabica demo | `public/work/space-arabica/demo/` (generated) |

## Scripts that are run by hand

The build never runs these; their output is committed.

- `node scripts/build-work-media.mjs` — turns captured screens into `public/media/work/<slug>/` WebP files, wall tiles and `provenance.json`, and replaces the signed-in name in Atlas screens. Set `WORK_MEDIA_SOURCE` to the folder of source PNGs.
- `node scripts/sync-space-demo.mjs` — copies the current Space Arabica build into the hosted demo with the work-in-progress banner and every form disabled. Set `SPACE_ARABICA_SITE` to `space-arabica-2/local-site`.
- `node scripts/build-social-cover.mjs` — renders `scripts/social-cover.html` to `public/media/social-cover.png`.

## Validation

```bash
npm run typecheck
npm run lint
npm test                      # unit, content, media and CSS checks (node:test)
npm run build
node scripts/check-static.mjs # prerendered pages, links, demo safety
npm run check:browser         # Chromium checks at four sizes, transitions, no-JS, reduced motion
```

`check:browser` uses the Playwright version pinned in `package.json`, which matches the Chromium already installed on this machine.

## Publish

`vercel deploy --prod --scope shions-projects-85be3095 --project by-shion` from an authorized Vercel account. Environment files, design research, tooling and build output are excluded by `.vercelignore`.

## Content rules

- FluxTrack is credited as “Designed and built it · team of three” (a three-person capstone).
- Atlas Treasury is an institutional MMCM project; Joshua was the UI/UX designer for its Treasury module. Signed-in names in its screens are replaced with “Demo Requester”.
- No personal location appears on the site.
- Every screen's source, capture date and data note are in `public/media/work/<slug>/provenance.json`.

Fonts (Newsreader, Anybody, Instrument Sans) are self-hosted; their OFL licences ship in `public/licenses`. The contact link opens the visitor's email app; there is no form or backend. The address is `create@by-shion.dev`.
