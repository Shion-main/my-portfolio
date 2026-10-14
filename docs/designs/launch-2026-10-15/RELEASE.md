# Portfolio launch — 15 October 2026

Published to https://by-shion.dev on Vercel. `www.by-shion.dev` redirects permanently to the apex domain, preserving paths.

- Project: `by-shion`, `prj_f24ZV1uJhCcwnZtor9REHWRJKTai`
- Team: `shions-projects-85be3095`
- Deployment: `dpl_AhQBfBCvNqVGoWkqRqkAnp5XtAM3`, production, READY
- Dashboard: https://vercel.com/shions-projects-85be3095/by-shion/AhQBfBCvNqVGoWkqRqkAnp5XtAM3

## Final polish

Preserved the blue palette, opposing desktop/phone collage, stacked project showcases, scroll reveals, and auto-hiding header. Tightened the phone hero, exposed About and Services in its Menu, enlarged the motion control's touch target, and added outside-click dismissal to navigation.

Twenty full-resolution WebP showcase images total 1,249,184 bytes instead of 5,199,841 bytes (76% smaller). Original captures remain intact. Korte PNG captures also have full-resolution WebP delivery versions.

Updated the public contact address to `create@by-shion.dev`, including Korte's footer. The owner explicitly chose to set up a separate mailbox later. No mail DNS records were added; website publication does not activate the mailbox.

Fixed the root-domain asset base, added route-specific canonical URLs and structured data, a matching social preview, valid SVG favicon, sitemap, custom 404 page, and static caching rules. Deployment excludes credentials, local fixtures, logs, and design research.

## Verification

- Typecheck, lint, motion checks, and both local and Vercel production builds passed.
- Homepage and both case studies checked live at 1159×668, 390×844, and 320×740: no broken images, missing anchors, old asset paths, or horizontal overflow.
- Live collage exposes all twenty unique screens; no screenshot clipping inside tiles.
- Live header hides downward, returns upward, and section navigation has intermediate smooth-scroll frames.
- Korte Book transition and full-screen viewer work; Escape closes the viewer.
- HTTPS pages, sitemap, robots, favicon, and social image return 200. Unknown paths return 404. `www` redirects to the canonical apex domain.
- Fresh console checks on the public portfolio have no errors. Earlier Vercel documentation-tab warnings were unrelated and cleared before verification.

Deploy future local changes with `vercel deploy --prod --scope shions-projects-85be3095 --project by-shion`. The initial release was deployed from the working directory; Git synchronization was subsequently requested by the owner.

## Hero-to-collage fade follow-up

Published as `dpl_8UmU7hv7edQzEX22dFDBuNoNteHr` on the same domain. A gradient softens the particle hero's lower boundary and collapses as the collage reaches the viewport top. It is attached to the section rather than the sticky stage, so the pinned screens remain clear. Mobile, simple-motion, and reduced-motion layouts keep a short static fade above the heading.

Typecheck, lint, motion checks, and production build passed. Browser verification covered desktop entry/reversal, mobile widths 390 and 320, and simple motion. Live verification confirmed that the fade clears at pinning, all twenty screens remain reachable without clipping inside their frames, reduced-motion text stays clear, and the console has no errors.

## Final motion, mobile and identity follow-up

- Added a project-color curtain when switching Korte ↔ Space Arabica, including header navigation. Native cross-document transitions preserve ordinary links/history, with a short arrival reveal fallback. The decorative curtain is hidden by default; development mounts synchronously before its render-blocking entry module completes, fixing the unstyled local-page flash.
- Services slides over About; Projects slides over Services. Service headings and rows reveal with scroll and are fully readable before being covered. Stable flow anchors keep navigation accurate alongside sticky sections.
- Mobile retains opposing collage columns, project card stacking, Korte hero depth, gallery transitions and the viewer. All 20 distinct UI screens pass through the pinned window without distortion or clipping inside their devices. Touch activates the same particle attraction and spring return as the mouse.
- Removed the motion control and saved manual preference. Full motion is default on every screen size; system reduced-motion preference remains supported.
- Mobile Hero fills the viewport, About gets a full reading screen, and Contact plus the footer form one closing screen. The closing composition completely covers the project pile without leaving a large blank gap below the email.
- Clearly labeled the official email. Removed the oversized footer arrow and social links. Converted remaining text arrows and the contact ornament to SVG icons.
- Traced the owner's supplied JS monogram into real SVG paths for the logo and favicon. Header color adapts to the dark portfolio and light Korte page.
- Kept the original outlined Joshua footer lettering, added 24px of space above it, and added a brief blue/ivory sliced glitch. It pauses offscreen and respects system reduced motion.

Local verification covers 320×740, 390×844, 430×932 and 1159×668. Collage lanes reverse continuously, all service rows reach full opacity, header direction behavior works, touch particles return to their original pixels, and Korte's mobile screen/viewer animations remain active. System reduced-motion switches to readable static layouts. Mobile Contact starts at the viewport top when the footer reaches the bottom. Physical-device Safari performance remains untested; these are Chromium browser checks.
