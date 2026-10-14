# Joshua Sabuero — Work, in space

Date: 2026-10-13, Asia/Singapore
Status: direction and content approved by Joshua; implemented locally on 2026-10-13. See [implementation checks](implementation-checks.md) for verified behavior and remaining release work. Joshua confirmed sole design and development ownership of both projects.

This is the current direction. It supersedes `continuous-scroll-portfolio.md` and its mostly two-dimensional motion study. The earlier independent review applies only to that earlier proposal. This revision includes an author audit; it has not received a new independent review.

## Design thesis

**Scroll through a space built from the work.** A single camera travels between two distinct exhibits: Space Arabica's warmth, architecture, and visual identity; Korte's court geometry, organization, and interface. The experience demonstrates Joshua's ability to connect visual design, interaction, and implementation.

Depth is structural: the visitor moves past foreground objects, through an opening, around an exhibit, and toward real interface evidence. At each reading position, the camera settles and the content becomes calm. The overall impression is a small, carefully lit digital exhibition.

Keep the accepted decisions: dark cinematic mood, continuous native-scroll story, two equally substantial projects, freelance and employment audiences given equal weight, public copy focused on design and development. Provisional positioning: **Web designer & developer**. Project order remains Space Arabica then Korte, with direct access to either.

## Audit of the previous plan

Severity here expresses the effect on this creative brief, not a production defect score.

| Priority | Finding | Why it falls short | Revision |
| --- | --- | --- | --- |
| P1 | Three.js confined to an optional opening frame | The requested sense of travelling through space disappears after the introduction | One shared 3D stage spans the work narrative |
| P1 | Most changes are SVG morphs, flat image translations, and shallow tilt | These show objects changing on a page; the visitor's viewpoint barely travels | Design camera positions, targets, foreground occlusion, and exhibit depth together |
| P1 | No complete camera choreography | A developer would have to invent the experience during implementation | Specify entry, travel, settle, reading, and exit for every scene |
| P1 | Korte diagram lacks matching product evidence | Choreography could promise functionality the available screenshot does not prove | Keep illustrative court geometry clearly labelled; require verified live-session captures for the case study |
| P2 | Split hero resembles a conventional portfolio | The first impression does not establish the spatial premise | Full-bleed architectural opening, with editorial identity layered in HTML |
| P2 | Mobile removes the signature almost entirely | Most phone visitors would get a fundamentally different character | Preserve a shorter forward camera move and real perspective on capable phones; use explicit quality tiers |
| P2 | Case-study reading and stage motion are loosely connected | Visitors may encounter drift while trying to evaluate the work | Give each project a long, stable reading interval and a normally scrolling case-study route |
| P2 | Performance guidance lacks measurable gates | Ambition has no defined decision points | Set provisional resource budgets and test the heaviest transition on real devices before completing all scenes |

Keep the earlier plan's strongest decisions: real project imagery, semantic HTML, reversible progress, ordinary case-study pages, accessible navigation, truthful contribution statements, and equal contact paths.

## Art direction

The personal space uses warm black `#101116`, warm white `#F3F0E8`, and brushed silver `#BEC6D8`. Space Arabica occupies a warm espresso and amber chamber, using `#C18B3E` as its accent. Korte shifts to navy `#071421` with lime `#9BD52F`. Color belongs to an exhibit and its light, rather than washing over every text surface.

Use Syne 600/700 for expressive titles and DM Sans 400/500 for reading. Self-host selected weights during implementation after checking licenses. The personal title may extend across the screen, while paragraphs remain around 55–65 characters per line. Text inside real product captures keeps its original typography.

Materials: dark matte architecture, narrow metallic edges, softly lit exhibit surfaces. One warm area of illumination in Space Arabica and one cool field in Korte establish atmosphere. Start with direct lights and simple materials. Texture and lighting must make forms legible without depending on bloom or depth-of-field effects.

The opening is a full-bleed spatial composition. Joshua's name and role sit in a stable editorial layer; a large arch stands slightly off-center with evidence of the first project visible beyond it. The second project is available immediately through Work navigation. Proposed headline: **I shape websites and digital products.** Supporting line: **From the first idea to the way it feels to use.** Final wording awaits Joshua's voice and confirmed role.

Compact navigation: name, Work, About, Contact. A Work menu contains both project names. Use understated text links with visible focus and clear touch targets. The scenery does not move the navigation or its hit targets.

## Scene-by-scene choreography

Provisional desktop distance: about 11–14 viewport heights, including reading. This is a pacing budget, not a loading or time requirement. No forced minimum dwell, scroll snapping, wheel interception, or intro gate. About 60% of the distance should support reading or inspection at settled viewpoints. Users control the pace.

| Scene | Spatial experience | Camera behavior | What the visitor learns |
| --- | --- | --- | --- |
| Arrival | A substantial illuminated arch stands in a dark gallery; the first exhibit is visible through it | Hold the opening view; then dolly forward with a small lateral offset so the jamb passes the foreground | Joshua's name, provisional role, and direct routes to work/contact |
| Enter Space Arabica | Move through the arch; its sides pass out of view, revealing the cup and real site imagery at different depths | Travel forward, then a small sideways arc; no roll, no FOV zoom | An expressive café website with a distinct visual identity |
| Inspect the design | Cup, desktop composition, and mobile evidence occupy deliberate exhibit positions | Settle into a readable three-quarter view, then hand the primary evidence to front-facing HTML | One visual decision, one practical menu decision, and the actual contribution |
| Leave the café | Track beside the architectural edge; the warm space remains briefly behind | Move laterally and forward; the next court is visible before the first exhibit leaves | Continuity between two different kinds of work |
| Enter Korte | A rectangular frame tilts down into a court plane; structure carries from architecture into product logic | A modest rise reveals the court from above; maintain an upright horizon | Korte addresses organizing play and making session state understandable |
| Resolve into the product | Court geometry leads the eye toward an upright application display | Lower toward the evidence display and settle front-facing | Actual organizer/player interfaces and a verified design/development decision |
| Meet Joshua | The two exhibit frames are seen together in a composed final view | A short pullback reveals the relationship between the projects; then the camera rests | How Joshua works and what he can contribute |
| Connect | Calm typography takes priority while the final composition remains still | No continuing background drift | Equal choices: Discuss a project / Discuss a role; résumé when supplied |

**Signature transition:** the same architectural frame changes from an upright café opening into a horizontal court boundary. Its top edge straightens and the plane pitches down while the camera rises just enough to understand the change. Preserve its dimensions continuously before resolving to the court proportions. Amber light recedes and lime markings become visible. This must read as one connected event when played backward as well as forward.

Use a fixed-topology procedural frame or authored matching meshes for this morph. Inspect intermediate states for self-intersection, thickness collapse, and corners folding through themselves. If the geometry fails, use a deliberate rigid-body hinge and separate court-line reveal; document that as the chosen transition instead of pretending a crossfade is a geometric morph.

Do not fly through a screenshot, an opaque panel, or the drink. The camera passes through architectural negative space. Keep photographic cutouts within a narrow viewing angle so their flatness is unobtrusive. A realistic 3D cup model is an optional later asset, not a prerequisite.

## Camera and depth contract

Use one perspective camera and a single world coordinate system. Prototype with a roughly 40-degree vertical field of view and an upright world-Y axis; fit the composition by moving the camera and arranging exhibits. FOV stays fixed during travel. Exact coordinates are blockout values and must be tuned against the final aspect ratios.

Three kinds of motion have separate jobs:

- **Camera travel:** takes the visitor between exhibits. Near objects move faster across the screen than distant ones; foreground occlusion makes depth legible.
- **Exhibit transformation:** changes the architecture or explains a project. It is not another camera controller.
- **Interface feedback:** brief hover, press, and focus responses. Real controls stay in the HTML layer.

Travel follows continuous, authored position and orientation curves with explicit stationary intervals. Maintain tangent continuity where travel segments join. Use controlled orientation interpolation toward authored target poses; do not let an unconstrained look-at target swing behind the camera. Begin with yaw under about 25 degrees and pitch under about 20 degrees in the main narrative, and zero roll. These are starting composition constraints, not universal comfort guarantees.

Sample the entire scene from absolute scroll progress. Reversing, dragging the scrollbar, refreshing mid-page, or selecting an anchor must produce the same state. Avoid event-triggered sequences that depend on having visited an earlier chapter. Navigation and restored scroll positions immediately synchronize the stage; they do not fly through all intermediate scenes.

Keep transitions relatively short and reading intervals long. Within reading intervals, camera position/orientation, evidence alignment, and lighting are constant. A person stopping the scroll should see a finished composition. Pointer response, if retained, moves a minor decorative layer by a small amount; it never perturbs the camera or readable evidence.

## Content and evidence

Both projects receive the same content budget: a short introduction, a contribution statement, two or three substantiated decisions, and a prominent case-study link. Different scene shapes should not imply different importance.

Space Arabica evidence: real cup cutout, actual desktop/mobile site views, café photography, and the completed menu experience. Reconstructed wireframes remain labelled reconstructed. Korte evidence: the available organizer-home screenshot is valid for the home screen only. Court/queue behavior needs current local demonstration captures and verified captions before it becomes a product claim.

Case studies use `/work/space-arabica/` and `/work/korte/`, with ordinary document scrolling, readable images, and return links to `#work-space-arabica` and `#work-korte`. The homepage summaries at those anchors remain usable without the 3D stage. Confirm personal ownership, collaborators, dates, project status, public links, and outcomes before final copy. Avoid invented metrics or client endorsements.

## Rendering and page architecture

Keep React, TypeScript, and Vite. **Three.js is now the proposed main narrative renderer**, because a shared camera, occlusion, perspective, and lit geometry are central to the revised brief. A lightweight direct Three.js integration is sufficient for the first proof. Introduce an additional React rendering framework only if a concrete scene-management need justifies it.

One WebGL canvas sits behind the work-story container. Native document scrolling drives the camera through a scoped GSAP ScrollTrigger controller. The container supplies the scroll distance; semantic project sections remain real HTML in document order. The canvas can stay sticky through the work narrative and leaves with that container. Persistent global navigation remains independent.

React owns content, routes, navigation, and accessible controls. The story controller maps measured section boundaries to progress. Three.js consumes that state, rather than registering another scroll system. One scheduled render responds to changed scene state, asset completion, or resize; do not maintain an idle animation loop. Refresh measurements after fonts/images/layout settle, preserving the active chapter and local progress.

For an image-to-HTML handoff, match the projected screen corners to measured DOM geometry, use a short crossfade only after alignment, then show one readable copy. The canvas copy is decorative and never interactive. Test cropping and aspect ratio explicitly. Never texture-map essential paragraph copy and expect it to serve as accessible reading content.

Prerender the homepage and both case studies into complete HTML using a small React server-rendering build step, sharing data with hydration. Generate nested `index.html` files for the case studies. Browser-only rendering and motion initialize after hydration. The fully readable page is the base delivery path; enhancement failure leaves it intact.

Suggested responsibilities: `story/scene.ts` owns scene resources; `story/choreography.ts` contains pure progress-to-state functions; `story/scroll.ts` owns measurement and native-scroll mapping; `story/quality.ts` owns rendering tiers; regular React components own the project summaries and case studies. These are proposed boundaries, not files already implemented.

## Mobile and alternative modes

At narrow widths, use a portrait composition and a shorter, primarily forward camera path. Remove the lateral orbit before removing depth. Keep the opening passage and one concise architecture-to-court transition on capable devices. Put readable text above or below the exhibit, with controls outside moving media. Fit using the stage's measured dimensions; address-bar changes must not repeatedly remap the story.

Provide **Motion: full / simple** as an accessible preference. Respect `prefers-reduced-motion` by defaulting to simple mode. In simple mode, show selected static exhibit compositions, no travelling camera, no prolonged pinning, and the same semantic evidence and links. The basic first render should already be useful if JavaScript or WebGL is unavailable.

Quality tiers are separate from the motion preference: full desktop, lighter mobile, static fallback. Reduce pixel ratio, texture resolution, secondary geometry, and lighting cost before removing the central spatial idea. A WebGL context loss replaces the stage with a prepared static composition without losing the current reading position. Never expose an empty black rectangle while trying to recover.

## Provisional performance budgets and gates

These are proposed acceptance targets, not measured results.

| Item | Initial budget / decision rule |
| --- | --- |
| Initial HTML, CSS, JS and fonts | Aim below 500 KB compressed before optional scene code; inspect the actual build output |
| First-view scene and media | Aim below 1.5 MB transferred; load the second project's textures shortly before its chapter |
| Scene draw calls | Aim under 50 in the active shot, including its effects |
| Visible geometry | Aim under 100k triangles; procedural frames should need far less |
| Texture residency | Aim below 64 MB decoded, including mipmaps; measure rather than equating download size with GPU memory |
| Pixel ratio | Start at maximum 1.5 desktop / 1.25 phone; adjust from device measurements |
| Rendering | Target 60 fps on the agreed baseline devices; downgrade if sustained frame cost exceeds the target |
| Reading and background tabs | No continuous render loop at rest; suspend scheduled visual work when hidden |
| Effects | No real-time reflection, large blur chain, particles, or full-scene post-processing in the first proof |

Prove the hardest transition first on desktop Chrome and Safari, then physical iPhone Safari and mid-range Android Chrome where available. Emulation proves layout, not mobile GPU performance. Record actual devices and trace results before claiming the budget is met. Dispose textures/materials/geometry and listeners on unmount; bound texture preloading to the current and adjacent exhibit.

## Prototype and build sequence

1. **Spatial blockout:** prove the arch passage, exhibit inspection, frame-to-court transition, and stable reading poses in a single scene. Use actual project media where available; clearly label geometric stand-ins.
2. **Hardest transition:** implement the actual frame morph/hinge and camera rise; verify reverse scroll, intermediate poses, occlusion, and no near-plane flashes. Test a physical phone before expanding detail.
3. **Evidence and handoff:** choose verified project captures; align a 3D screen with its HTML evidence and prove the stable reading/anchor behavior.
4. **Art direction:** tune materials, lights, crop, typography, spacing, and a small number of purposeful detail animations around the proven choreography.
5. **Complete delivery:** case studies, accurate contribution copy, About, contact, résumé, prerendering, fallbacks, and release checks.

The first visible proof should answer whether movement genuinely feels spatial. A polished static homepage cannot answer that question. This turn's camera study is a planning blockout, not the final website or proof that production performance budgets have passed.

## Acceptance checklist

- Foreground, subject, and background exhibit visibly different motion under camera travel; the arch is actually passed through.
- Space Arabica and Korte have distinct lighting/composition while sharing a coherent world.
- Camera stops and text remains sharp during both project reading intervals.
- Forward and reverse travel show the same continuous geometry and state, including quick jumps and reloads mid-story.
- Work navigation reaches readable evidence immediately; contact and résumé never require finishing the story.
- Both projects receive equal substantive evidence and each has a separate readable case study.
- At 320px, controls and text fit without clipping or overlap; physical-device performance is measured separately.
- Keyboard use, reduced motion, disabled JavaScript, unavailable WebGL, and context loss preserve content and useful actions.
- No claim about ownership, production functionality, users, or outcomes exceeds verified evidence.

## Camera-study verification, 2026-10-13

The accompanying `studies/spatial-camera-study.source.html` is an actual Three.js perspective scene, pinned to version 0.180.0 for the study. `studies/prepare-spatial-study.py` embeds the unchanged cup and Korte organizer-home assets into the inline preview. The range control previews the progress that native page scrolling would drive in production. It does not implement the production page's scroll container, case studies, or DOM evidence handoff.

Verified locally in desktop Chromium at browser widths 1024px and 320px: scene and both embedded images render; 16 sampled camera positions reproduce identically in reverse; Space Arabica and Korte reading intervals hold identical camera poses; slider Home/End reach the endpoints; reduced-motion emulation selects stationary chapter poses; document width does not overflow. No console errors were reported in the final check. This verifies the planning study, not cross-browser or physical-device performance.

The study uses a rigid rectangular frame hinge to demonstrate the Korte handoff. The full arch-to-court geometric morph remains to be prototyped. The small amber panel is an architectural stand-in, not a fabricated project screenshot. Final lighting, project evidence layout, authored camera-curve refinement, mobile-specific camera poses, static-image failure treatment, and native scroll choreography remain production work.

### Official capability references

The earlier session verified official [Three.js scene/camera/renderer guidance](https://threejs.org/manual/#en/creating-a-scene), [rendering on demand](https://threejs.org/manual/#en/rendering-on-demand), [resource cleanup](https://threejs.org/manual/#en/cleanup), and [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/). These explain the underlying capabilities. Camera choreography, visual choices, budgets, and architecture above are proposals for this portfolio, not claims that those sources prescribe this design.
