# Spatial portfolio implementation checks

Date: 2026-10-13, Asia/Singapore. Implemented locally; no production deployment or domain change was performed.

## Delivered

- Native-scroll Three.js journey with one camera, architectural depth, actual project imagery, a procedural arch-to-rectangle morph, and a frame lowering into the court plane.
- Seven authored camera poses. Long project reading intervals hold the camera still. Position is derived from absolute scroll state, so reverse scroll and direct anchors agree.
- Space Arabica and Korte summaries, complete separate case-study pages, About, working mail links for both project and role inquiries, existing GitHub and LinkedIn links.
- Sole designer/developer credits confirmed directly by Joshua.
- Original generated gallery atmosphere used in the static scene fallback and About. Real project screenshots remain the evidence. Exact provenance and generation prompt: `asset-provenance.md`.
- Responsive portrait composition, saved full/simple motion preference, default simple mode for reduced motion, keyboard-accessible Work navigation with Escape handling.
- Self-hosted fonts with shipped licenses, complete prerendered HTML, nested routes, base-aware assets, lazy-loaded scene code, render on demand, scoped resource disposal, context-loss fallback.

## Verification

- `npm test`: passed. Boundary clamping, stationary reading intervals, monotonic scroll mapping, finite camera values, and continuous camera paths in desktop/mobile modes. This caught and corrected a mobile camera offset discontinuity.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed, including HTML prerendering for `/`, `/work/space-arabica/`, and `/work/korte/`.
- `node scripts/check-static.mjs`: passed for the default `/my-portfolio/` build. All pages contain headings, project content and equal contact actions; local references resolve.
- Chromium browser checks at 1440px, 390px, and 320px: no horizontal overflow; heading fits at 320px; real images render; both project links and nested routes work.
- All seven rendered camera checkpoints matched their expected values: 0, 22, 35, 50, 64, 80, 100. Inspected scenes ranged from 14 to 39 draw calls and at most 8,090 triangles in those samples. These counts are not a frame-rate benchmark.
- Script-free copy of the built HTML: zero scripts/canvases, nine homepage headings and two case-study links; direct Work navigation and content remain available. Temporary check file removed after verification.
- Reduced-motion emulation: simple mode, no canvas. User toggle persists locally. Work-menu Escape closes the menu and returns focus to its summary.
- Simulated WebGL context loss: scene falls back to the generated static image; headings and actions remain intact.
- Final production browser checks reported no app console errors. Public Space Arabica preview responded successfully with its expected title.

Browser evidence is stored in ignored `.gstack/` captures and verification scripts. The dev server uses port 5173; the production preview uses port 4173 with `/my-portfolio/`.

## Practical limits / release follow-up

- Physical iPhone/Android GPU performance and Safari rendering remain untested. Browser viewport emulation is not a physical-device benchmark.
- The 3D scene is a decorative, illustrative interpretation of the projects. The court markers do not simulate Korte's queue engine. Case-study captures use documented synthetic data.
- The HTML evidence sections remain independent of the WebGL displays; this build uses an atmospheric transition into reading, not a pixel-matched WebGL-to-DOM handoff.
- The scene chunk is about 135 KB gzip (about 521 KB minified) and loads separately from the initial application. Vite emits its default 500 KB minified-chunk advisory. An empty-state renderer runs only when state/size/assets change; no ambient animation loop is installed.
- A current résumé has not been supplied, so there is no empty or fake download action.
- The newly purchased domain and hosting destination are not yet supplied. Existing GitHub Pages base support is preserved; `VITE_BASE_PATH=/` supports a root-domain build. Update absolute social-image metadata for the real domain at release.
- Existing package installation reports dependency advisories. This task did not perform an unrelated dependency-major-version migration.

The original light portfolio source is retained, and pre-existing working-tree edits/deletions were not reverted. The new entry point is `src/pages/Home.tsx` with `src/portfolio.css`.
