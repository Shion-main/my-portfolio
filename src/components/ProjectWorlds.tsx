import { useEffect, useRef, useState, type CSSProperties } from "react";
import { projects, type ProjectSlug } from "../work/projects";
import { asset } from "../work/asset";
import { BrowserFrame, PhoneFrame } from "./DeviceFrames";
import { chapterLocal, chapterWipe, easeInOutCubic, fitFontSize, giantAxes, range, snap, trackProgress } from "../motion/scroll";
import { chapterScrollTop } from "./chapterScroll";
import "./worlds.css";

const COUNT = projects.length;
// The wall tile of the same screen: media/work/<slug>/<name>.webp → media/work/<slug>/wall/<name>.webp
const small = (src: string) => src.replace(/\/([^/]+)$/, "/wall/$1");
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const slugFromHash = () => {
  const match = location.hash.match(/^#work-([a-z-]+)$/);
  return match && projects.some(p => p.slug === match[1]) ? (match[1] as ProjectSlug) : null;
};

/**
 * The four project chapters, one template. Prerendered as stacked full-screen sections;
 * once hydrated they pin to one stage and each wipes in as a circle of its ground colour.
 */
export default function ProjectWorlds({ onActive }: { onActive: (slug: ProjectSlug | null, covered: boolean) => void }) {
  const track = useRef<HTMLElement>(null);
  const [motion, setMotion] = useState(false);
  const [active, setActive] = useState(-1);
  const report = useRef(onActive);
  report.current = onActive;

  useEffect(() => setMotion(true), []);

  useEffect(() => {
    if (!motion || !track.current) return;
    const root = track.current;
    const chapters = [...root.querySelectorAll<HTMLElement>(".chapter")];
    let frame = 0;
    let last = "";
    let onScreen = -1;

    const fit = () => {
      const mobile = innerWidth <= 860;
      chapters.forEach((chapter, i) => {
        const giant = chapter.querySelector<HTMLElement>(".giant");
        if (!giant) return;
        giant.style.fontSize = "100px";
        giant.style.setProperty("--wd", String(projects[i].giantFit));
        giant.style.setProperty("--wt", "820");
        const width = giant.firstElementChild!.getBoundingClientRect().width;
        giant.style.fontSize = `${fitFontSize(width, innerWidth, innerHeight, mobile)}px`;
      });
      draw();
    };

    const draw = () => {
      frame = 0;
      const still = reduced();
      const rect = root.getBoundingClientRect();
      const raw = trackProgress(rect.top, rect.height, innerHeight);
      let current = -1;
      chapters.forEach((chapter, i) => {
        const wipe = snap(chapterWipe(raw, i, COUNT), still);
        const radius = Math.hypot(innerWidth, innerHeight) * easeInOutCubic(wipe);
        // Hidden by its clip alone, so screen readers and the keyboard can still reach it.
        chapter.style.clipPath = `circle(${radius.toFixed(1)}px at 62% 46%)`;
        if (wipe > 0.5) current = i;
        const local = chapterLocal(raw, i, COUNT);
        const axes = giantAxes(still ? 1 : local, projects[i].giantFit, i === 0);
        const giant = chapter.querySelector<HTMLElement>(".giant")!;
        giant.style.setProperty("--wd", axes.wdth.toFixed(1));
        giant.style.setProperty("--wt", axes.wght.toFixed(0));
        const info = chapter.querySelector<HTMLElement>(".chapter-info")!;
        const shown = still ? 1 : i === 0 ? range(raw, -0.02, 0.05) : range(local, 0.14, 0.3);
        info.style.opacity = String(shown);
        info.style.transform = `translateY(${((1 - shown) * 26).toFixed(1)}px)`;
        const enter = i === 0 ? range(raw, -0.05, 0.07) : range(local, 0.04, 0.32);
        chapter.querySelectorAll<HTMLElement>("[data-depth]").forEach(el => {
          const depth = Number(el.dataset.depth);
          const rise = still ? 0 : 1 - easeInOutCubic(enter);
          const drift = still ? 0 : local * 50 * depth;
          el.style.transform = `translateY(${(rise * 34 * depth).toFixed(2)}vh) translateY(${(-drift).toFixed(1)}px)`;
        });
      });
      const inside = current >= 0 && raw > -0.03 && raw < 1.02;
      onScreen = inside ? current : -1;
      // The wall fades out as soon as the first chapter's wipe is under way, and stays off below.
      const covered = raw > -0.04;
      const key = `${inside ? current : -1}|${covered}`;
      if (key !== last) {
        last = key;
        // Keep the address on the chapter being read, so Back from a case study returns here.
        const hash = inside ? `#work-${projects[current].slug}` : "";
        if (location.hash !== hash && (inside || slugFromHash())) history.replaceState(history.state, "", `${location.pathname}${location.search}${hash}`);
        setActive(inside ? current : -1);
        report.current(inside ? projects[current].slug : null, covered);
      }
    };

    const queue = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const goToHash = () => {
      const slug = slugFromHash();
      if (slug) window.scrollTo({ top: chapterScrollTop(slug), behavior: "auto" });
    };
    // Keyboard focus inside a chapter brings that chapter on screen, so the focus ring is never hidden under another.
    const follow = (event: FocusEvent) => {
      const chapter = (event.target as HTMLElement).closest<HTMLElement>("[data-chapter]");
      if (!chapter) return;
      const index = chapters.indexOf(chapter);
      if (index !== onScreen) window.scrollTo({ top: chapterScrollTop(projects[index].slug), behavior: "auto" });
    };
    root.addEventListener("focusin", follow);
    // Jump to a linked chapter before the first draw, which would otherwise rewrite the address.
    goToHash();
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("load", goToHash, { once: true });
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", fit);
    window.addEventListener("hashchange", goToHash);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("focusin", follow);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", fit);
      window.removeEventListener("hashchange", goToHash);
    };
  }, [motion]);

  return (
    <section ref={track} className={`worlds${motion ? " motion" : ""}`} aria-label="Projects">
      {/* Once pinned, each chapter's anchor sits at the scroll position where that chapter is at rest. */}
      {motion && projects.map((p, i) => (
        <span key={p.slug} id={`work-${p.slug}`} className="chapter-anchor" style={{ "--k": (i + 0.5) / COUNT } as CSSProperties} aria-hidden="true" />
      ))}
      <div className="stage">
        {projects.map((p, i) => (
          <article
            key={p.slug}
            id={motion ? undefined : `work-${p.slug}`}
            data-chapter={p.slug}
            className="chapter"
            aria-labelledby={`chapter-${p.slug}`}
            style={{ "--ground": p.tokens.ground, "--ink": p.tokens.text, "--giant": p.tokens.giant, zIndex: i + 1 } as CSSProperties}
          >
            <div className="chapter-info">
              <p className="label">{p.label}</p>
              <h2 id={`chapter-${p.slug}`}>{p.name}</h2>
              <p className="chapter-line">{p.line}</p>
              <dl className="facts">
                {p.facts.map(f => <div key={f.term}><dt>{f.term}</dt><dd>{f.detail}</dd></div>)}
              </dl>
              <a className="chapter-open" href={asset(`work/${p.slug}/`)}>Open case study<span className="visually-hidden">: {p.name}</span> <span aria-hidden="true">→</span></a>
            </div>
            <div className="showcase" aria-hidden="true">
              <div className="showcase-desk" data-depth="1">
                <BrowserFrame title={p.desktop.title} src={asset(p.desktop.src)} srcSet={`${asset(small(p.desktop.src))} 640w, ${asset(p.desktop.src)} 1440w`} sizes="(max-width: 860px) 90vw, 54vw" alt="" morph={active === i} />
              </div>
              <div className="showcase-phone" data-depth="1.6">
                <PhoneFrame src={asset(p.phone.src)} srcSet={`${asset(small(p.phone.src))} 300w, ${asset(p.phone.src)} 780w`} sizes="(max-width: 860px) 30vw, 14vw" alt="" />
              </div>
              <p className="showcase-caption label">{p.caption}</p>
            </div>
            <p className="giant" aria-hidden="true"><span>{p.name}</span></p>
          </article>
        ))}
        <nav className={`chapter-index${active >= 0 ? " on" : ""}`} aria-label="Project chapters">
          {projects.map((p, i) => (
            <a key={p.slug} href={`#work-${p.slug}`} className={active === i ? "on" : undefined} aria-current={active === i ? "true" : undefined}>{p.name}</a>
          ))}
        </nav>
      </div>
    </section>
  );
}
