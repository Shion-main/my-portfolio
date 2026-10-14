# Scroll collage portfolio

Current direction, 2026-10-13. Supersedes the previous architectural 3D story.

## User direction

The work should form a background collage of actual websites, including Korte. Screens move up and down while scrolling and feel spatial; a true 3D scene is optional. The user also requested stronger reference research after finding the previous visual output weak.

## Visual approach

The [reference research](reference-research-2026-10-13/index.html) informs the treatment: Huy Nguyen's spatial image composition and dramatic work title, combined with the clear, substantial project previews observed in Ilja van Eck's site. These are design principles, not reproduced layouts or borrowed artwork.

A restrained introduction leads into a full-viewport collage. Four layers of real desktop and phone captures pass behind a stationary “Selected work” heading. Different sizes, overlaps, slight rotations, and perspective imply distance. The project links stay above the imagery on dark backgrounds. The sequence ends in two large project previews with role, summary, and case-study access. About and contact remain ordinary document sections.

Only Space Arabica and Korte appear. Screens come from existing project assets. The Korte live interface is labeled as a local demonstration with synthetic data. No adoption, synchronization, commercial outcome, or full-stack claims have been added.

## Motion contract

- Purpose: spatial consistency and delight on a portfolio landing page.
- Native scrolling; no wheel interception, snapping, or automatic looping.
- One sticky stage for 230 small viewport heights on desktop; 165 on phones.
- Layers 0 and 3 travel upward, layers 1 and 2 downward. The position is a deterministic function of current scroll, so reversing scroll reverses the same path.
- Perspective uses 1,150px, with layer depths between approximately -178px and +73px. Rotation changes remain small.
- Only layer transforms change on scroll. A passive scroll handler schedules a single animation frame; the animation does not run a continuous render loop. Reads for geometry happen on measurement, not every scroll frame.
- The observer activates layers near the viewport and releases `will-change` outside it. Listeners and observers are cleaned up.
- Mobile travel is 36% of desktop travel, with a separate arrangement.
- The visitor's Motion control turns the collage into a one-viewport static composition. OS reduced motion is respected automatically and removes the redundant control.
- Case-study previews and descriptions remain stationary. Fine-pointer hover uses 200–250ms transforms with the existing ease-out token, disabled for simple/reduced motion.

## Implementation

- `src/pages/Home.tsx`: introduction, motion preference, project previews, about.
- `src/components/WorkCollage.tsx`: screen composition and scroll lifecycle.
- `src/story/collage.ts`: pure motion mapping.
- `src/collage.css`: all current homepage layouts, transforms, and responsive rules.
- `src/components/SiteChrome.tsx`: shared accessible motion-control label and tooltip.

No new dependencies. The homepage no longer loads the previous Three.js canvas or GSAP scroll controller. Historical scene source remains available but is not imported.

## Validation

Pure checks cover scroll boundaries, both travel directions, continuous reversal, smaller phone travel, and safe camera distance. Browser checks sample the actual DOM transforms at 0%, 25%, 50%, 75%, and 100%, then reverse the sequence. Desktop and phone samples return identical transforms at matching positions. Simple motion removes the sticky distance and inline animation transforms; OS reduced-motion emulation produces the same static layout.

The collage and project previews are inspected visually at desktop and phone sizes. Type checking, lint, the motion checks, and a production build with all three prerendered routes are required. Browser rendering uses the gstack browse skill.

### Completed checks

- `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`: passed. The production build required elevated execution because the Windows sandbox blocked Vite's filesystem `realpath` call.
- Desktop 1440×900 and phone 390×844: actual layer transforms sampled forward and backward; matching positions match exactly.
- 320×740, 390×844, 768×1024, 1440×900: no horizontal document overflow or broken loaded images.
- Simple-motion control and OS reduced-motion emulation: static transforms, ordinary section positioning, no extra pinned scroll distance.
- Korte and Space Arabica preview links, Work menu, Escape dismissal, and return-home link: exercised successfully.
- Production preview at `/my-portfolio/`: hydrated successfully, correct base-path links, working fresh direct project anchor, one client JS bundle, no canvas or runtime errors observed.

Visual records: [desktop collage](collage-preview/desktop.png), [phone collage](collage-preview/mobile.png), [Korte on a phone](collage-preview/korte-mobile.png).
