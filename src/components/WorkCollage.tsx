import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { asset } from "../content";
import { bentoScreens, bentoPreview } from "../showcase";
import { collageLayers, collageProgress, collageScrollRange, sampleCollage } from "../story/collage";

// Desktop and phone captures keep separate, alternating lanes. Every capture
// keeps its original ratio; the pinned window reveals the full lane on scroll.
const desktopLanes = [
  bentoScreens.filter(screen => screen.device === "desktop").slice(0, 5),
  bentoScreens.filter(screen => screen.device === "phone").slice(0, 5),
  bentoScreens.filter(screen => screen.device === "desktop").slice(5),
  bentoScreens.filter(screen => screen.device === "phone").slice(5),
];
const mobileLanes = [
  bentoScreens.filter(screen => screen.device === "desktop"),
  bentoScreens.filter(screen => screen.device === "phone"),
];

export default function WorkCollage({ simple, enabled }: { simple: boolean; enabled: boolean }) {
  const section = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const lanes = compact ? mobileLanes : desktopLanes;

  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = section.current;
    if (!root || !enabled || simple) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const layers = [...root.querySelectorAll<HTMLElement>(".collage-lane")];
    let frame = 0;
    let inView = false;
    let start = 0;
    let distance = 1;
    let travel: number[] = [];
    let disposed = false;

    const draw = () => {
      frame = 0;
      if (document.hidden) return;
      const progress = collageProgress(window.scrollY, start, distance);
      // Collapse the entrance fade before the opposing lanes start moving.
      // Static layouts keep a small gradient above their heading instead.
      const entry = motion.matches ? 1 : Math.min(1, Math.max(0, (start - window.scrollY) / 160));
      root.style.setProperty("--collage-entry-progress", entry.toFixed(3));
      layers.forEach((element, index) => {
        if (motion.matches) { element.style.removeProperty("transform"); return; }
        const pose = sampleCollage(progress, collageLayers[index], travel[index]);
        element.style.transform = `translate3d(0, ${pose.y.toFixed(2)}px, 0)`;
      });
    };
    const schedule = () => {
      if (inView && !frame && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const revealFocusedScreen = (event: FocusEvent) => {
      if (motion.matches || !(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return;
      const tile = event.target.closest<HTMLElement>(".bento-tile");
      if (!tile) return;
      const lane = tile.parentElement!;
      const index = layers.indexOf(lane);
      if (index < 0 || !travel[index]) return;
      const offset = tile.offsetTop + tile.offsetHeight / 2 - lane.offsetHeight / 2;
      const progress = Math.min(1, Math.max(0, .5 - offset / (collageLayers[index].travel * travel[index])));
      window.scrollTo({ top: start + progress * distance, behavior: "instant" });
    };
    const measure = () => {
      if (disposed) return;
      const windowHeight = root.querySelector<HTMLElement>(".collage-window")!.clientHeight;
      travel = layers.map(element => Math.max(0, element.offsetHeight - windowHeight + 64));
      root.style.setProperty("--collage-scroll-distance", `${Math.ceil(Math.max(...travel) * 1.15)}px`);
      const range = collageScrollRange(
        root.getBoundingClientRect().top + window.scrollY,
        root.offsetHeight,
        root.querySelector<HTMLElement>(".collage-stage")!.offsetHeight,
        // The header overlays this full-viewport stage when it returns.
        0,
      );
      start = range.start;
      distance = range.distance;
      draw();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      layers.forEach(element => { element.style.willChange = inView && !motion.matches ? "transform" : "auto"; });
      if (inView) {
        root.querySelectorAll<HTMLImageElement>(".bento-device img").forEach(image => { image.loading = "eager"; });
        measure();
      }
    }, { rootMargin: "500px 0px" });
    const resize = new ResizeObserver(measure);
    observer.observe(root);
    resize.observe(root);
    layers.forEach(element => resize.observe(element));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    root.addEventListener("focusin", revealFocusedScreen);
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", measure);
    void document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      root.removeEventListener("focusin", revealFocusedScreen);
      document.removeEventListener("visibilitychange", schedule);
      motion.removeEventListener("change", measure);
      layers.forEach(element => { element.style.removeProperty("transform"); element.style.removeProperty("will-change"); });
      root.style.removeProperty("--collage-scroll-distance");
      root.style.removeProperty("--collage-entry-progress");
    };
  }, [simple, enabled, compact]);

  return (
    <section className={`work-collage ${!simple ? "collage-active" : ""}`} id="work" ref={section} data-chapter="collage" aria-labelledby="work-title">
      <div className="collage-stage">
        <div className="collage-caption">
          <div><p className="eyebrow">A few windows into my world</p><h2 id="work-title">Made to be experienced.</h2></div>
          <div className="collage-project-links">
            <a href="#work-space-arabica"><span>01</span> Space Arabica <ArrowUpRight size={14} aria-hidden="true" /></a>
            <a href="#work-korte"><span>02</span> Korte <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="collage-window"><div className="collage-bento">
          {lanes.map((screens, index) => <div className={`collage-lane collage-lane--${index % 2 ? "phone" : "desktop"}`} key={index}>{screens.map(screen => (
            <a className={`bento-tile bento-tile--${screen.device} bento-tile--${screen.tone}`} key={screen.id} data-screen={screen.id} href={asset(`work/${screen.slug}/`)} aria-label={`${screen.project}: ${screen.title}. Explore project.`}>
              <div className="bento-visual">
                <figure className={`bento-device bento-device--${screen.device}`}>
                  {screen.device === "desktop" && <div className="bento-browser" aria-hidden="true"><i /><i /><i /><span>{screen.project}</span></div>}
                  <img src={bentoPreview(screen.id)} alt={`${screen.project} — ${screen.title}, ${screen.device === "phone" ? "mobile" : "desktop"} interface`} width={screen.width} height={screen.height} loading="lazy" decoding="async" />
                </figure>
              </div>
              <div className="bento-label" aria-hidden="true"><span>{screen.project}<small>{screen.title}</small></span><ArrowUpRight size={14} /></div>
            </a>
          ))}</div>)}
        </div></div>
      </div>
    </section>
  );
}
