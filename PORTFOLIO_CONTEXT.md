# Portfolio context for a new agent

Last reviewed: 15 October 2026 (Asia/Singapore). The portfolio is published at **https://by-shion.dev** on Vercel. Read the current source before editing; older design documents describe previous iterations.

## What this portfolio is

This is Joshua Sabuero's personal portfolio. It presents him as an independent designer and developer who connects visual identity, interface design, websites, and working web products. It serves both prospective freelance clients and hiring teams. The main path for a visitor is: introduction → actual project screens → about/services → two selected projects → email contact. Joshua confirmed that he was the sole designer and developer of the two featured projects; avoid adding unsupported team, client, research, adoption, revenue, or impact claims.

The public-facing tone is confident, direct, and human. The hero says: “I give ideas a visual identity. Then I build the websites and products that bring them to life.” The closing invitation is “Let’s make something.” The site has no contact form or backend; project and role actions open preaddressed drafts to `create@by-shion.dev`. Mail delivery will be configured separately by the owner.

## Live pages and content

| Route | What a visitor sees | Source |
| --- | --- | --- |
| `/` | Type-led Joshua introduction; scroll-driven collage of real project screens; About; four services; stacked Space Arabica and Korte project boards; contact and footer | `src/pages/Home.tsx` |
| `/work/space-arabica/` | Café website case study: challenge, three design decisions, responsive captures, full screen gallery, reflection, project link | `src/pages/CaseStudy.tsx` and `src/content.ts` |
| `/work/korte/` | Custom four-part Korte case study: hero, three user perspectives, interactive product gallery, contribution/reflection and links | `src/pages/KorteCaseStudy.tsx` |

The homepage's four offered services are **Logo & visual identity**, **UI/UX & product design**, **Website design & development**, and **Web application development**. The About section says Joshua works between visual identity, interfaces, and code, with attention to visual character and usable interactions. Only Space Arabica and Korte are featured in the live project stack. Older project and certificate files in `public/Images/` are remnants of a previous portfolio and are not current homepage sections.

### Space Arabica

- Category: hospitality website. Role shown: **sole designer & developer**. Disciplines: visual direction, interaction design, responsive development.
- Story: bring a café's character online while making drinks, menu, space, story, and contact details easy to explore. The case study asks, “How do you translate the feeling of a place into a website?”
- Decisions described: let actual signature drinks lead the art direction; separate expressive discovery from a practical full menu; adapt the hierarchy and interactions to phones. The site has six connected pages: home, menu highlights, full menu, space, story, and contact.
- Evidence: captures of the implemented website, including desktop and mobile screens. The case study explicitly does **not** claim measured commercial impact or participant research.
- Public website in current copy: `https://space-arabica-2.vercel.app`.

### Korte

- Category: pickleball community web app. The dedicated page says Joshua designed and built an all-in-one app for the Philippines spanning discovery, clubs, court booking, and open-play management. The homepage credits him as **sole designer & developer**.
- Three perspectives: players find open play, join clubs, and book courts; organizers set up sessions, check in players, manage rotations, and record results; venue partners manage venues, availability, and bookings.
- The interactive gallery has **Discover**, **Book**, **Organize**, and **Connect** tabs. Book can switch between a player's court booking and a venue partner's dashboard. Desktop/mobile screenshots can be enlarged in a dialog.
- The case study's closing point is Joshua's product design and development across these perspectives. It says that testing how people move between finding, arranging, and running play is a *next step*, not completed user research.
- Screens are local app captures with realistic **fictional/mock data**. Names, participation counts, booking prices, and payment totals shown in captures are illustrative. Do not present them as real customer records, adoption, or revenue. Project dates, team details, and release status are currently **“To be confirmed”** in the page's Project details disclosure. Do not infer that the full product is publicly hosted or synchronized across devices.
- The source and reconstructed wireframe links were removed from the visible case study at the owner's request.

## Visual and interaction direction

The current direction is ink/paper with sky-blue accents (`#91c9ed`, darker `#286b9b` on light backgrounds), Syne display type, and restrained editorial layouts. Twenty actual screenshots move in opposing desktop/phone columns (four columns on desktop, two on phones). About, Services and Projects overlap like folders; service content fades with scroll. Project cards retain their title-rail stack on mobile. The particle field responds to mouse or touch. The header hides downwards and returns upwards, with smooth section navigation. The motion button was removed: full motion is the default, and only system reduced-motion preference disables it. Korte has light mineral/navy/lime styling and local Exo/Geist fonts. Its gallery and image viewer support keyboard interaction. Switching between case studies uses a project-color curtain, with an arrival reveal fallback on browsers lacking cross-document transitions.

Useful source of truth: `src/portfolio.css` (shared styling), `src/collage.css` (home layout/motion), `src/korte-case.css` (Korte page), `src/components/WorkCollage.tsx`, `src/story/collage.ts`, `src/components/SiteChrome.tsx`, `src/components/ProjectShowcase.tsx`, and `src/components/ScreenGallery.tsx`.

## Technical map

- React 18 + TypeScript + Vite; no site backend. `src/App.tsx` selects the three routes by path. `src/main.tsx` hydrates prerendered HTML, or renders the app during development.
- `src/content.ts` holds shared project copy, contact addresses, roles, and asset paths. **Korte's live detailed story is in `src/pages/KorteCaseStudy.tsx`**, not the generic Korte case content in `src/content.ts`; check both if editing shared previews.
- `src/showcase.ts` lists gallery screens. Project screenshot files live in `public/media/showcase/` (full JPGs and optimized WebP previews). Korte-specific case assets and provenance live in `public/media/korte-case/`; general project media is in `public/media/`.
- `npm run build` builds the client, then server-renders complete HTML for all three routes via `src/entry-server.tsx` and `scripts/prerender.mjs`. Production base defaults to `/`; `VITE_BASE_PATH` supports subdirectory builds. Page metadata is set during prerendering. Vercel serves by-shion.dev; www redirects to the apex domain. The GitHub Pages command is historical.
- Local commands: `npm ci`, `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run preview`. Vite's configured dev port is **8080**.

## Evidence, history, and editing cautions

`README.md` is the short project guide. `docs/designs/feedback-2026-10-15/CHANGES.md` documents the latest homepage fixes. `docs/designs/korte-case-study-2026-10-15.md` and `docs/designs/korte-motion-polish-2026-10-15/AUDIT.md` document the current Korte direction. `docs/designs/asset-provenance.md` and `public/media/korte-case/capture-provenance-2026-10-15.json` identify image sources and limitations. `PRODUCT.md` and `DESIGN.md` contain current-direction notes at the top, followed by older historical descriptions; use the current components/CSS for exact behavior and appearance. `src/pages/Index.tsx`, `src/index.css`, and `src/story/StoryCanvas.tsx`/`scene.ts` are historical and are not imported by the live entry point.

Preserve unrelated working-tree edits. No current résumé was supplied. Update public URL and social metadata in `index.html`/`scripts/prerender.mjs` if the destination changes. Local frame captures and skill installations are not needed to build the published site.
