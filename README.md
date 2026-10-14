
# Joshua Sabuero — Portfolio

A dark, scroll-driven portfolio for Joshua's design and development work, published at https://by-shion.dev. Twenty real Space Arabica and Korte screens move in opposing columns, followed by layered sections, stacked project previews and separate case studies. Full motion runs on desktop and mobile; the visitor's system reduced-motion preference provides a static layout. Joshua confirmed sole design and development ownership of both projects. Project content is grounded in their codebases and existing captures.

## Run locally

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. `npm run build` builds the client and prerenders all three routes to complete HTML; `npm run preview` serves that output. The production base path is `/` for `https://by-shion.dev`. `VITE_BASE_PATH` remains available for a subdirectory deployment. Vercel build, caching, and route settings live in `vercel.json`.

## Edit content

- Homepage sections: `src/pages/Home.tsx`
- Shared project data and case-study copy: `src/content.ts`
- Case-study layout: `src/pages/CaseStudy.tsx`
- Korte's interactive case study: `src/pages/KorteCaseStudy.tsx` and `src/korte-case.css`
- Project-to-project transitions: `public/project-transitions.js` and `src/project-transitions.css`
- Shared color, type, chrome, and case-study rules: `src/portfolio.css`
- Current homepage layout, collage, and responsive rules: `src/collage.css`
- Collage composition and native-scroll lifecycle: `src/components/WorkCollage.tsx`
- Collage travel, depth, and reversible scroll mapping: `src/story/collage.ts`
- Page title and social metadata: `index.html`
- Current design contract: `docs/designs/scroll-collage-portfolio.md`
- Implementation checks and remaining release work: `docs/designs/implementation-checks.md`

The prior `Index.tsx`, `index.css`, and Three.js story files remain historical source. The homepage does not import the previous canvas, scene, GSAP, or Three.js.

## Validation

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, then `node scripts/check-static.mjs`. Collage tests cover bounded scroll, opposing travel, continuous reversal and complete lane travel on desktop and mobile. The prior camera checks remain for the historical scene. Browser checks cover navigation, rendering, reduced motion and the prerendered pages.

Publish with `vercel deploy --prod --scope shions-projects-85be3095 --project by-shion` from an authorized Vercel account. Environment files, local research captures, tooling and build output are excluded from deployment.

## Assets and attribution

`public/media` contains optimized copies of real project images and the original generated architectural artwork. Provenance and the exact image-generation prompt are recorded in `docs/designs/asset-provenance.md`. The source projects are not modified. The asset-preparation script records the local source locations and does not need to run to build or deploy this repository. Syne and DM Sans are self-hosted; their OFL licenses ship in `public/licenses`.

The contact link opens the visitor's email app. The site does not have a contact form or backend.

The public contact address is `create@by-shion.dev`. Mailbox delivery is separate from website hosting and will be configured later by the owner.
