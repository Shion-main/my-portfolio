# Bento showcase update

The homepage now has twenty distinct captures in four alternating columns: desktop, phone, desktop, phone. Each column contains five screens. Desktop columns rise and phone columns descend through a pinned viewport; scrolling backward reverses the same path. Each column's travel is measured from its actual content height, so every screen is revealed completely before the section releases.

The screenshots keep their native aspect ratios inside browser or phone frames. The scroll window naturally hides incoming and outgoing tiles at its edges; it never crops the screenshot inside a tile. Native page scrolling drives the effect, with no automatic playback or scroll interception. Keyboard focus brings an offscreen tile into the window. Small screens, simple motion, and system reduced motion use a readable static column layout.

Space Arabica includes six pages captured from the deployed site. Korte includes fourteen distinct product and website views, including signed-in setup, manual check-in, organizer home, venue details and profile editing. Korte records are realistic fictional capture data. Clean earlier captures are reused where appropriate. See [capture provenance](../../public/media/bento/provenance.json) for all twenty sources, routes, dates and dimensions.

Each selected-project card now compiles four screens into one visual journey. The existing sticky project stack remains intact. Korte's header uses its unmodified light-background SVG from the actual app, without the old brightness filter.

## Verification

- At 1159 × 668, 920 × 668 and 1440 × 900, all twenty screens become fully visible during the pinned interval. No duplicate assets, broken images, stretched proportions or screenshot clipping inside tiles.
- The 1159 × 668 stage fills the viewport and holds at y=0 while desktop columns travel upward by about 1030–1049 px and phone columns travel downward by about 1296 px. Reverse-scroll samples reproduce the same transforms. The header overlays the stage when returning, so hiding it leaves no reserved blank strip.
- The selected project cards remain sticky at y=96 and y=172 at the user's viewport.
- At 390 × 844 and 320 × 740, all images load and fit without horizontal overflow. Reduced-motion and simple modes retain all twenty screens.
- Keyboard focus reveals the target tile fully; a fresh browser reload reports no console errors.
- `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build` pass. The production build required execution outside the Windows filesystem sandbox after a Vite realpath EPERM error.

No production Korte records were created or changed. Temporary localhost capture services and the temporary court-cover copy were removed after capture.
