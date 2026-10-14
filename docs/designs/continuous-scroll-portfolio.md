# Joshua Sabuero — Frame in motion

> Superseded on 2026-10-13 by [Spatial portfolio: revised direction and audit](spatial-scroll-portfolio.md). The review and motion study below describe the earlier frame-based proposal, not the revised 3D direction.

Date: 2026-10-12, Asia/Singapore
Status: DRAFT for visual review. The continuous story and dark presentation are accepted; this document proposes their design and choreography.
Planning only: this document and its motion study are design artifacts. Application implementation follows visual review.
Supersedes the narrative and project scope in `docs/superpowers/specs/2026-10-12-scroll-portfolio-design.md` for the next portfolio version. The existing application and root design system remain the current implementation until the new direction is adopted.

## Decisions and purpose

- Serve freelance clients and hiring teams equally. Visitors should understand the work, identify Joshua's contribution, and find a relevant contact action quickly.
- Use a continuous scroll story, selected as approach B. The connection between chapters is part of the demonstration of craft.
- Use a dark, cinematic presentation, selected by Joshua. Project imagery supplies warmth, energy, and contrast against the quieter personal canvas.
- Feature exactly two projects: Space Arabica and Korte. Older school-project content is outside the selected narrative.
- Center public copy on design, development, decisions, and finished experiences.
- Keep the public title provisional: **Web designer & developer**. The introduction describes concrete work while the portfolio demonstrates its depth.
- Lead with Space Arabica for visual craft; follow with Korte for product complexity. This order is proposed and can change if the evidence or desired emphasis warrants it.

The page's job is to let someone see how Joshua gives a digital experience character and makes a complicated interface understandable. Freelance clients need evidence of a thoughtful result and a clear way to discuss a project. Hiring teams need ownership, process, readable case studies, and a route to a résumé or conversation.

## The signature

**One frame, several meanings.** A thin, suspended frame is the recurring visual. It begins as a window onto Joshua's work, bends into Space Arabica's architectural arch, settles around the café website, straightens into a court outline, and becomes Korte's application viewport. At the end it resolves into the rule beneath the invitation to connect.

The same geometry carries position and momentum across transitions. Keep project logos, readable text, and meaningful controls as ordinary HTML. Shape changes belong to the decorative frame, so neither brand identity nor reading requires a geometric transformation.

The memorable moment is the arch-to-court handoff: a recognizable frame carries the visitor from an expressive website into a structured product. The transition explains Joshua's range.

## Visual language

The mood is a dark studio with controlled light, physical depth, large geometric typography, and real work in focus. Use crisp edges, broad empty space, and quiet supporting text. Let the frame and actual project imagery earn the attention.

### Proposed palette

| Role | Value | Use |
| --- | --- | --- |
| Studio ink | `#101116` | Main portfolio canvas |
| Graphite | `#1B1E25` | Necessary elevated surfaces and navigation when it overlaps media |
| Warm white | `#F3F0E8` | Headings and primary readable content |
| Quiet silver | `#ABAEB8` | Supporting copy; verify against its actual surface |
| Frame silver | `#BEC6D8` | Thin geometry and restrained highlights |
| Space Arabica amber | `#C18B3E` | Café chapter; source brand color |
| Korte navy / lime | `#071421` / `#9BD52F` | Product chapter; source dark-theme colors |

Amber and lime enter with their project chapters and leave with them. Keep the portfolio navigation and primary text in warm white. Photography creates most of the color and material variation. Evaluate contrast once composited over the actual imagery; the tokens alone do not establish accessibility.

### Proposed typography

Use **Syne 600/700** for the personal display voice and **DM Sans 400/500** for reading and controls. Syne's broad geometric forms relate to the frame; a quieter body family keeps case studies comfortable. Preserve the typography inside actual project screens.

Desktop opening display: approximately 88–120px, with deliberate two-line breaks and a bounded width. Mobile opening: approximately 40–52px, reduced further where necessary at 320px. Body: 17–18px desktop and 16–17px mobile, with a 1.5–1.6 line height and about 55–65 characters per line. Utility labels: 12–14px; use labels sparingly.

Do not squeeze large titles to fit an arbitrary line count. Keep Joshua's full name and role readable on the initial view. Font loading must reserve stable layout; self-host only the selected weights during implementation and use sensible metric-compatible fallbacks.

Typefaces were verified through [Syne on Google Fonts](https://fonts.google.com/specimen/Syne) and [DM Sans on Google Fonts](https://fonts.google.com/specimen/DM+Sans).

### Composition

At 1440px, use a maximum content width near 1280px with roughly 64–80px side space. A 12-column structure aligns the text, visual stage, and case-study details. The opening uses approximately five columns of text and seven of visual stage. Media occasionally crosses those columns; readable text keeps its measure.

The page has a compact persistent header: Joshua Sabuero, Work, About, Contact. A separate **Skip to work** link and direct project links support fast evaluation. Navigation lands on readable summaries outside any pinned transition.

Project evidence uses large media plus short adjacent annotations. Limit the main story to two or three meaningful decisions per project. Each project has a readable summary in normal document flow at `#work-space-arabica` or `#work-korte`, outside its pinned transition.

Longer case studies are separate, normally scrolling pages at `/work/space-arabica/` and `/work/korte/`. **Read case study** links open these in the same tab. Each page starts with a brief contribution summary and has a **Back to selected work** link to its corresponding main-page summary anchor. Browser Back can restore the previous scroll position; the explicit return link lands on a readable summary rather than forcing a replay of a pinned sequence. Case-study pages share the identity and contact navigation. Paths are resolved against the eventual deployment base. About and contact return to a quieter composition on the main page.

## Copy direction

Proposed opening:

> **Designed to feel. Built to work.**
>
> I'm Joshua Sabuero, a web designer & developer. I create websites and web apps with thoughtful interfaces and expressive motion.

The first view also offers **Explore my work** and **Let's talk**. Both are usable immediately. These are provisional lines, to be reviewed against Joshua's own voice and contribution.

Project chapters explain the problem, a decision, and its visible consequence. Use actual work to support claims. Keep the public role, dates, outcome statements, and links accurate; repository contents do not establish personal authorship, customer impact, or deployment status.

Proposed final invitation:

> **Have a project or a role in mind? Let's talk.**

Offer **Discuss a project** and **Discuss a role** with equal visual weight and distinct email subject lines. A résumé link belongs near the role action once a current document is supplied. One verified email destination is enough; a form is optional only if it provides a real delivery path.

## Scroll storyboard

Percentages describe relative narrative progress in the planning study, not final page distances. Allow roughly 8–12 viewport heights for the complete desktop page as an initial pacing hypothesis, then revise with the real content. Two short pinned visual sequences are candidates; text and proof have ordinary scrolling sections between them.

| Beat | Visitor sees | Motion and purpose | Evidence / handoff |
| --- | --- | --- | --- |
| Introduction, 0–15% | Full name, role, opening statement, suspended frame containing glimpses of both projects | A brief masked heading entrance and shallow frame tilt establish identity and depth | Identity and actions are available before motion finishes |
| Space Arabica arrives, 15–30% | Frame turns toward the visitor; its upper edge becomes an arch; a real signature-drink cutout enters | A shape morph and layered transforms carry the frame into the café's visual world | Real supplied cup imagery, café photographs, and source brand colors |
| Space Arabica decisions, 30–45% | Expressive product presentation settles beside menu navigation and mobile evidence | The same cup and frame move into their place in the finished website; selected layers briefly separate to explain hierarchy | Show a brand decision, a practical menu decision, and a responsive decision, with the contribution stated |
| Arch becomes court, 45–58% | Cup leaves through the edge it entered; arch straightens into a rectangular plane; warm amber gives way to navy | Continuous shape interpolation and a controlled perspective change connect the chapters | Preserve one stable frame while the subject changes; project names remain readable |
| Korte becomes understandable, 58–75% | Illustrative players move from waiting into two court groups; clear state labels accompany them | A small stagger and deterministic position changes demonstrate queue-to-court organization | This is a bounded explanatory illustration. Use sanitized local data and a faithful sequence verified against the product |
| Korte evidence, 75–87% | Diagram regions align with actual application captures; the frame settles front-facing | A shared-element transition connects the explanation to real interface evidence | Actual organizer/player views, contribution, one interface choice, and one development choice |
| About and contact, 87–100% | A concise personal account of how Joshua works, then the shared invitation | The frame flattens into a quiet rule; the pace resolves | Project and role actions remain equally prominent; include résumé when supplied |

Space Arabica's opening is a short original interpretation for the portfolio. The underlying café website remains recognizable. Its existing seven-drink carousel and scroll composition are available evidence, but the portfolio should show a selected, understandable moment rather than reproduce the entire site.

Korte's illustration does not run the live production system. Match assignment, score entry, and subsequent rotation are represented by local demonstration states only after their order and captions are verified. Label illustrative sequences clearly. Show actual screens as evidence alongside them, preserving their source appearance.

## Motion contract

| Technique | Where it belongs | Planned behavior |
| --- | --- | --- |
| Scroll-linked timeline | The two signature transitions | Progress follows native scroll position, with reversible state and no forced snapping |
| Transforms | Frame, cup, interface layers | Translate, scale, and restrained rotation carry continuity; reading text stays stable |
| SVG morph | Suspended frame → arch → court outline | Author compatible control points and inspect the full interpolation for folds or kinks |
| Shared-element transition | Cup into site composition; court diagram into evidence frame | Preserve the element's visual identity while its location and size change |
| Mask / clip reveal | Short headings and media apertures | Reveal content in meaningful groups; the semantic heading remains intact |
| Parallax | Café imagery and the opening frame | Two or three shallow depth planes; approximately 12–32px travel on desktop, reduced on phones |
| Stagger | Small illustrative groups | Approximately 30–60ms between elements for timed entrances; scroll sequencing uses progress intervals |
| Hover and press | Links, project actions, contact | Subtle 160–220ms hover response and 100–160ms press feedback; pointer motion gated to fine pointers |

Scroll-scrubbed states use direct progress rather than applying time-based easing to every segment. Use small catch-up smoothing only if it helps control; begin around 0.2 seconds and compare with a direct scrub. Timed interface feedback uses the strong ease-out curve `cubic-bezier(0.23, 1, 0.32, 1)`. A deliberate on-screen handoff can use `cubic-bezier(0.77, 0, 0.175, 1)`. Large story movements can be longer than control feedback, but they must never delay navigation or actions.

Use separate wrappers for scroll movement and pointer tilt. Give each property one owner. Measure untransformed layout; transforms must not feed back into their own progress calculations. Resize, reverse scroll, anchor navigation, and interruption must all resolve to the same intended stage.

Masks and SVG path changes can incur paint work. Keep their geometry simple and active area bounded, measure actual rendering cost, and spend most movement on transforms and opacity. Treat a crossfade as a crossfade in the design; reserve the word morph for real geometric interpolation.

## Where Three.js earns a place

Prototype one narrow Three.js opportunity: **the suspended opening frame and its turn into the first chapter**. A small procedural frame could show thickness, changing highlights, and actual camera perspective. Its material can feel like softly lit anodized metal; the scene holds the work rather than introducing an unrelated object.

The SVG/CSS composition is the baseline. Keep the 3D version only if the side-by-side prototype makes the turn, depth, and handoff visibly better. A 3D coffee model is not required: available drink assets are photographic cutouts. Avoid making the story depend on unprepared models, heavy post-processing, or a new rendering framework.

One lazily loaded canvas is enough. Cap pixel ratio initially at 1.5 on mobile and 2 on desktop, then measure on representative devices. Render only on changing scene state, relevant asset completion, or resize; stop offscreen and when the document is hidden. Dispose of geometry, materials, textures, and the renderer when its owner unmounts. On the final turn, align the canvas frame with measured HTML geometry and hand over to the real interface at a front-facing state. Preserve the SVG/CSS equivalent when WebGL is unavailable or reduced motion is active.

The scene/camera/renderer model is documented in [Three.js: creating a scene](https://threejs.org/manual/#en/creating-a-scene). [Rendering on demand](https://threejs.org/manual/#en/rendering-on-demand) supports the scoped rendering approach, and [resource cleanup](https://threejs.org/manual/#en/cleanup) explains the disposal responsibility. The decision to prototype this scene is our design judgment, rather than a requirement of those sources.

## Proposed implementation structure

Keep the existing React, TypeScript, and Vite foundation. Use **GSAP with ScrollTrigger** for coordinated native-scroll choreography. The official [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) confirms timeline scrubbing, pinning, and progress callbacks. **MorphSVG** is suited to the decorative path changes; its [documentation](https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/) describes interpolation between SVG paths and point mapping. **Flip** is an option for measured shared-element transitions; its [documentation](https://gsap.com/docs/v3/Plugins/Flip/) describes capturing and transitioning position, size, and rotation.

React owns identity, readable content, navigation, and project data. Add a small build-time prerender step using React's server rendering to write the homepage and both case-study pages into complete HTML documents, including their real headings, images, summaries, and links. Vite supplies the client bundles; those enhance the same content after hydration. Generate nested `index.html` files for the two case-study paths so navigation does not depend on a client router or a hosting rewrite. Keep browser-only motion initialization out of the server render, and use the same data for initial HTML and hydration. This is the delivery path for the no-JavaScript presentation.

A story controller owns the decorative frame and timeline progress. Project demos consume explicit local scene state. The optional 3D component consumes the same progress rather than running a competing scroll controller. Use scoped cleanup for every timeline and media-query branch. Introduce dependencies only when their assigned transition is being prototyped.

The main story can use coordinated chapter timelines under one controller, with boundaries refreshed after images/fonts settle or layout changes. Pin only the selected visual stages. Keep readable summaries outside the pins. First-view HTML, images, links, and contact remain useful while later media and any canvas load.

## Mobile and alternative presentation

At 320–430px, stack heading, visual, and annotation. Keep the same chapter order, project evidence, and contact choices. Shorten or remove pinning, omit pointer tilt, reduce simultaneous planes, and make the frame morph a shallow two-dimensional change. Use short sequences with ordinary scrolling between them; the visitor's touch scroll remains native.

Reduced-motion mode shows complete compositions in the same reading order. Omit camera travel, positional parallax, path morphing, and prolonged pins. Optional gentle opacity feedback may remain. Anchor navigation and keyboard-initiated jumps are immediate. A keyboard user can reach every real action without interacting with the decorative stage. The no-JavaScript presentation preserves headings, project evidence, readable summaries, and contact links.

## Assets and factual boundaries

Available: Space Arabica's real cup cutouts, café photography, six-page site, motion source, and existing portfolio assets; Korte's logo and organizer/share-meet captures, plus source product and design documentation.

Still needed before final copy and application implementation:

- Confirm the exact personal contribution and collaborators for each project, along with client/self-initiated wording and dates.
- Select current Korte live-session and player screenshots using safe demonstration data. The available organizer home screenshot does not demonstrate the proposed queue sequence.
- Select the Space Arabica desktop/mobile views that illustrate the three chosen decisions. Its reconstructed wireframes must retain that label if shown.
- Supply a current résumé and choose any portrait or personal image for About. A text-first About section works without a portrait.
- Confirm public project links and the eventual domain details before release. Existing preview links and old deployment configuration are context, not a release decision.

## Build and review order

1. Review this visual direction and the planning study: typography, hierarchy, frame geometry, and chapter continuity.
2. Prototype the introduction-to-Space Arabica handoff in SVG/CSS. Compare the optional procedural 3D frame at the same camera position and pacing.
3. Prototype the arch-to-court handoff and a faithful Korte demonstration using local data.
4. Add the main-page summaries, separate case-study pages, contribution statements, About, résumé, and contact actions. Add build-time prerendering for the three pages and hydrate their shared content.
5. Verify reverse and fast scrolling, navigation jumps, case-study return paths, mid-page refresh, resize, keyboard access, reduced motion, touch behavior, image failures, and WebGL fallback. Open all three built pages with JavaScript disabled and confirm their headings, evidence, summaries, navigation, and contact actions are available.
6. Run the existing typecheck, lint, and production build once application work exists; test the story on a physical phone and desktop before choosing deployment and domain configuration.

Acceptance: the initial view clearly identifies Joshua and the work. Visitors can bypass the motion and evaluate either project. A person can explain one decision from each project and identify Joshua's contribution. No project state waits on a timer before becoming usable. The complete story survives reduced motion, canvas failure, and narrow layouts. Frame pacing and any 3D effect must improve comprehension or character when compared against the simpler version.

## Open decisions

The visual motif, display/body font pairing, exact story copy, project contribution statements, and optional Three.js scene remain proposed. Final scroll lengths and performance budgets are set after the first representative prototype. Narrative progress in the planning study is schematic.

## The assignment

Choose one decision from Space Arabica and one from Korte that you can explain in your own words: what you changed, why you changed it, and what the finished interface makes easier. Pair each with an actual screen. Those two examples give the story a personal voice and a factual anchor.

## Session observations

Joshua asked to show "what I'm capable of" through a journey, selected the continuous story, and named Space Arabica and Korte as the two projects. He specified "both equally" for freelance clients and job opportunities, then selected a "Dark, cinematic presentation." These choices set the scope and mood; they do not establish project outcomes or personal contribution.

<!-- gstack:office-hours:concerns:start -->
## Reviewer Concerns

Disposition: COMPLETED

Stop: PASS

No unresolved findings.
<!-- gstack:office-hours:concerns:end -->
