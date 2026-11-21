import { useEffect, useRef, useState, type CSSProperties } from "react";
import { projects, type ProjectSlug } from "../work/projects";
import { asset } from "../work/asset";
import { BrowserFrame, PhoneFrame } from "./DeviceFrames";
import { ARRIVE, COVER_AT, SETTLE_MS, activeChapter, clamp, easeInOut3, arrivalT, dolly, fitFontSize, glide, landing, leaveWords, momentAt, movesEnd, pushIn, pushOut, restCenter, restDrift, settleTarget, wallDive } from "../motion/scroll";
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

type Rect = { x: number; y: number; w: number; h: number };
type Parts = { chapter: HTMLElement; scene: HTMLElement; info: HTMLElement; words: HTMLElement[]; desk: HTMLElement; screen: HTMLElement; phone: HTMLElement; giant: HTMLElement };
/** Everything one frame writes for one chapter. Word groups: 0 label, 1 heading (moves in % inside its mask), 2 line and facts, 3 button. */
type Pose = {
  shown: boolean; z: number; opacity: number;
  sceneT: string; sceneO: string; blur: number;
  infoO: number; wordO: number[]; wordY: number[];
  deskT: string; deskO: number; phoneT: string; phoneO: number;
  giantW: number; giantWt: number; giantT: string; giantO: number;
};

function restPose(i: number, s: number): Pose {
  const drift = restDrift(s, i);
  return {
    shown: false, z: 1, opacity: 1, sceneT: "", sceneO: "", blur: 0,
    infoO: 1, wordO: [1, 1, 1, 1], wordY: [0, 0, 0, 0],
    deskT: drift ? `translateY(${(-drift * 26).toFixed(1)}px)` : "", deskO: 1,
    phoneT: drift ? `translateY(${(-drift * 48).toFixed(1)}px)` : "", phoneO: 1,
    giantW: projects[i].giantFit, giantWt: 820, giantT: "", giantO: 1,
  };
}

/**
 * The four project chapters, one template. Prerendered as stacked full-screen sections;
 * once hydrated they pin to one stage, and scrolling flies the camera from one project's laptop screen into the next.
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
    const flashEl = root.querySelector<HTMLElement>(".stage-flash")!;
    const parts: Parts[] = [...root.querySelectorAll<HTMLElement>(".chapter")].map(chapter => ({
      chapter,
      scene: chapter.querySelector<HTMLElement>(".scene")!,
      info: chapter.querySelector<HTMLElement>(".chapter-info")!,
      words: [...chapter.querySelectorAll<HTMLElement>("[data-word]")],
      desk: chapter.querySelector<HTMLElement>(".showcase-desk")!,
      screen: chapter.querySelector<HTMLElement>(".showcase-desk img")!,
      phone: chapter.querySelector<HTMLElement>(".showcase-phone")!,
      giant: chapter.querySelector<HTMLElement>(".giant")!,
    }));
    const opts = { settle: true };
    let frame = 0;
    let last = 0;
    let cur = Number.NaN;
    let target = 0;
    let key = "";
    let onScreen = -1;
    let flashFor = -1;
    let dive = "";
    let rects: (Rect | null)[] = [];

    if (import.meta.env.DEV || location.search.includes("checks")) {
      (window as unknown as { __worlds: unknown }).__worlds = { drawn: () => cur, caught: () => cur === target && !frame, settle: (on: boolean) => { opts.settle = on; } };
    }

    // Where a chapter's laptop screen sits at rest, measured with this frame's transforms cleared.
    const screenRect = (i: number): Rect => {
      const cached = rects[i];
      if (cached) return cached;
      const { chapter, scene, desk, screen } = parts[i];
      const saved = [chapter.style.transform, scene.style.transform, desk.style.transform];
      chapter.style.transform = scene.style.transform = desk.style.transform = "";
      const r = screen.getBoundingClientRect();
      [chapter.style.transform, scene.style.transform, desk.style.transform] = saved;
      return (rects[i] = { x: r.left, y: r.top, w: r.width, h: r.height });
    };

    const leaving = (pose: Pose, i: number, t: number, blurs: boolean) => {
      const o = pushOut(t);
      const d = dolly(screenRect(i), innerWidth, innerHeight, o.zoom);
      const words = leaveWords(o.words);
      Object.assign(pose, {
        shown: o.shown, z: 1, opacity: 1, blur: blurs ? o.blur : 0, giantO: o.giantOpacity,
        sceneO: `${d.originX.toFixed(1)}px ${d.originY.toFixed(1)}px`,
        sceneT: `translate(${d.dx.toFixed(1)}px, ${d.dy.toFixed(1)}px) scale(${d.scale.toFixed(4)})`,
        infoO: words.opacity, wordY: words.y,
      });
    };

    const arriving = (pose: Pose, i: number, t: number, s: number, blurs: boolean) => {
      const n = pushIn(t);
      const l = landing(n.land, projects[i].giantFit);
      const drift = restDrift(s, i);
      Object.assign(pose, {
        shown: n.shown, z: 2, opacity: n.opacity, blur: blurs ? n.blur : 0,
        sceneO: "62% 46%", sceneT: `scale(${n.scale.toFixed(4)})`,
        infoO: 1, wordO: l.words.map((w, j) => (j === 1 ? (w > 0 ? 1 : 0) : w)), wordY: l.words.map((w, j) => (1 - w) * (j === 1 ? 108 : 18)),
        deskT: `translateY(${(-drift * 26).toFixed(1)}px) translateY(${l.deskY.toFixed(2)}vh) scale(${l.deskScale.toFixed(4)})`, deskO: l.deskO,
        phoneT: `translateY(${(-drift * 48).toFixed(1)}px) translateY(${l.phoneY.toFixed(2)}vh) rotate(${l.phoneTurn.toFixed(2)}deg)`, phoneO: l.phoneO,
        giantW: l.giantW, giantWt: l.giantWt, giantT: `translateY(${l.giantY.toFixed(2)}%)`, giantO: l.giantO,
      });
      return n.flash;
    };

    const paint = (p: Parts, o: Pose) => {
      const c = p.chapter.style;
      c.opacity = o.shown ? o.opacity.toFixed(3) : "0";
      c.zIndex = o.shown ? String(o.z) : "0";
      // Hidden chapters stay in the accessibility tree and focusable; they just take no pointer.
      c.pointerEvents = o.shown && o.opacity >= 0.5 ? "auto" : "none";
      if (!o.shown) return;
      const s = p.scene.style;
      s.transform = o.sceneT;
      s.transformOrigin = o.sceneO;
      s.filter = o.blur > 0.05 ? `blur(${o.blur.toFixed(1)}px)` : "";
      p.info.style.opacity = o.infoO === 1 ? "" : o.infoO.toFixed(3);
      p.info.style.pointerEvents = o.infoO >= 0.5 && o.wordO[3] >= 0.5 ? "" : "none";
      p.words.forEach(el => {
        const j = Number(el.dataset.word);
        el.style.opacity = o.wordO[j] === 1 ? "" : o.wordO[j].toFixed(3);
        el.style.transform = o.wordY[j] ? `translateY(${o.wordY[j].toFixed(2)}${j === 1 ? "%" : "px"})` : "";
      });
      p.desk.style.transform = o.deskT;
      p.desk.style.opacity = o.deskO === 1 ? "" : o.deskO.toFixed(3);
      p.phone.style.transform = o.phoneT;
      p.phone.style.opacity = o.phoneO === 1 ? "" : o.phoneO.toFixed(3);
      const g = p.giant.style;
      g.setProperty("--wd", o.giantW.toFixed(1));
      g.setProperty("--wt", o.giantWt.toFixed(0));
      g.transform = o.giantT;
      g.opacity = o.giantO === 1 ? "" : o.giantO.toFixed(3);
    };

    const draw = (now: number) => {
      frame = 0;
      const still = reduced();
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      target = -root.getBoundingClientRect().top / innerHeight;
      cur = Number.isNaN(cur) ? target : glide(cur, target, dt, still);
      const m = momentAt(cur, COUNT);
      // Reduced motion: no parallax drift either, so every chapter is drawn at its rest centre.
      const poses = parts.map((_, i) => restPose(i, still ? restCenter(i) : cur));
      const blurs = innerWidth > 860;
      let flash = 0;
      let lit = -1;
      if (still) {
        const a = activeChapter(m);
        if (a >= 0) poses[a].shown = true;
      } else if (m.from === -1) {
        if (cur >= 0) { flash = arriving(poses[0], 0, arrivalT(cur), cur, blurs); lit = 0; }
      } else if (m.from === m.to) {
        poses[m.from].shown = true;
      } else {
        leaving(poses[m.from], m.from, m.t, blurs);
        flash = arriving(poses[m.to], m.to, m.t, cur, blurs);
        lit = m.to;
      }
      parts.forEach((p, i) => paint(p, poses[i]));
      if (lit >= 0 && lit !== flashFor) {
        flashFor = lit;
        flashEl.style.background = `radial-gradient(circle at 50% 50%, ${projects[lit].tokens.giant} 0%, transparent 65%)`;
      }
      flashEl.style.opacity = flash > 0.001 ? flash.toFixed(3) : "0";
      // The wall of screens behind the list rushes toward the camera as the first project arrives.
      const nextDive = still ? "" : wallDive(cur).toFixed(3);
      if (nextDive !== dive) {
        dive = nextDive;
        const rootStyle = document.documentElement.style;
        if (dive && dive !== "0.000") {
          rootStyle.setProperty("--dive", dive);
          rootStyle.setProperty("--dive-blur", `blur(${(Number(dive) * 10).toFixed(1)}px)`);
        } else {
          rootStyle.removeProperty("--dive");
          rootStyle.removeProperty("--dive-blur");
        }
      }

      const current = activeChapter(m);
      const inside = current >= 0 && cur <= movesEnd(COUNT) + 0.1;
      onScreen = inside ? current : -1;
      // The wall turns off once the first project fully covers it, and stays off below.
      const covered = still ? cur >= ARRIVE / 2 : cur >= COVER_AT;
      const next = `${onScreen}|${covered}`;
      if (next !== key) {
        key = next;
        // Keep the address on the chapter being read, so Back from a case study returns here.
        const hash = inside ? `#work-${projects[current].slug}` : "";
        if (location.hash !== hash && (inside || slugFromHash())) history.replaceState(history.state, "", `${location.pathname}${location.search}${hash}`);
        setActive(onScreen);
        report.current(inside ? projects[current].slug : null, covered);
      }
      if (cur !== target) frame = requestAnimationFrame(draw);
    };

    const queue = () => { if (!frame) { last = 0; frame = requestAnimationFrame(draw); } };

    // Finish a move the reader stopped inside, in the direction they were heading. Never under a finger.
    let finishTimer = 0;
    let touching = false;
    let pressing = false;
    let lastY = scrollY;
    let dir: 1 | -1 = 1;
    // Our own eased scroll rather than behavior: "smooth", which keeps heading for its target over the reader's own input.
    let finishing = 0;
    const stopFinishing = () => { cancelAnimationFrame(finishing); finishing = 0; };
    const finish = () => {
      finishTimer = 0;
      if (reduced() || touching || pressing || finishing || !opts.settle) return;
      // Until the reader moves, a chapter in the address wins: a reload's restored scroll position must not pick the other chapter.
      if (!moved && slugFromHash()) { goToHash(); return; }
      const top = root.getBoundingClientRect().top;
      const dest = settleTarget(-top / innerHeight, dir, COUNT);
      if (dest === null) return;
      const from = scrollY, to = top + scrollY + dest * innerHeight;
      const duration = clamp(260 + Math.abs(to - from) * 0.5, 300, 700);
      const start = performance.now();
      const step = (now: number) => {
        const k = clamp((now - start) / duration);
        window.scrollTo(0, from + (to - from) * easeInOut3(k));
        finishing = k < 1 ? requestAnimationFrame(step) : 0;
      };
      finishing = requestAnimationFrame(step);
    };
    const waitToFinish = () => { clearTimeout(finishTimer); finishTimer = window.setTimeout(finish, SETTLE_MS); };
    const scrolled = () => {
      const delta = scrollY - lastY;
      if (delta) dir = delta > 0 ? 1 : -1;
      lastY = scrollY;
      queue();
      waitToFinish();
    };
    const touchOn = () => { touching = true; stopFinishing(); };
    const pressOn = () => { pressing = true; };
    const pressOff = () => { if (!pressing) return; pressing = false; waitToFinish(); };
    const touchOff = () => { touching = false; waitToFinish(); };

    const fit = () => {
      const mobile = innerWidth <= 860;
      rects = [];
      parts.forEach(({ giant }, i) => {
        giant.style.fontSize = "100px";
        giant.style.setProperty("--wd", String(projects[i].giantFit));
        giant.style.setProperty("--wt", "820");
        const width = giant.firstElementChild!.getBoundingClientRect().width;
        giant.style.fontSize = `${fitFontSize(width, innerWidth, innerHeight, mobile)}px`;
      });
      queue();
    };

    const goToHash = () => {
      const slug = slugFromHash();
      if (slug) window.scrollTo({ top: chapterScrollTop(slug), behavior: "auto" });
    };
    // Keyboard focus inside a chapter brings that chapter on screen, so the focus ring is never hidden under another.
    const follow = (event: FocusEvent) => {
      const chapter = (event.target as HTMLElement).closest<HTMLElement>("[data-chapter]");
      if (!chapter) return;
      const index = parts.findIndex(p => p.chapter === chapter);
      if (index !== onScreen) window.scrollTo({ top: chapterScrollTop(projects[index].slug), behavior: "auto" });
    };
    root.addEventListener("focusin", follow);
    // Once the reader has scrolled, a late load event must not pull them back to the linked chapter.
    let moved = false;
    const mark = () => { moved = true; };
    const settle = () => { if (!moved) goToHash(); };
    for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) window.addEventListener(type, mark, { passive: true, once: true });
    // A rotation or width change keeps the reader where they were in the chapters (positions are in screens,
    // the browser keeps pixels). Height-only changes are left alone: phone toolbars resize mid-scroll.
    let lastWidth = innerWidth;
    const resized = () => {
      const keep = target;
      const widthChanged = innerWidth !== lastWidth;
      lastWidth = innerWidth;
      fit();
      if (widthChanged && keep >= 0 && keep <= movesEnd(COUNT)) window.scrollTo(0, root.getBoundingClientRect().top + scrollY + keep * innerHeight);
      waitToFinish();
    };
    // Jump to a linked chapter before the first draw, which would otherwise rewrite the address.
    goToHash();
    fit();
    // A position the browser restored mid-move (a reload) finishes too.
    waitToFinish();
    document.fonts?.ready.then(fit);
    window.addEventListener("load", settle, { once: true });
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener("touchstart", touchOn, { passive: true });
    // The reader's own input always wins over a finish in flight, and nothing finishes under a held button.
    for (const type of ["wheel", "keydown", "pointerdown"]) window.addEventListener(type, stopFinishing, { passive: true });
    window.addEventListener("pointerdown", pressOn, { passive: true });
    for (const type of ["pointerup", "pointercancel", "blur"]) window.addEventListener(type, pressOff, { passive: true });
    window.addEventListener("touchend", touchOff, { passive: true });
    window.addEventListener("touchcancel", touchOff, { passive: true });
    window.addEventListener("resize", resized);
    window.addEventListener("hashchange", goToHash);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("focusin", follow);
      window.removeEventListener("load", settle);
      for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) window.removeEventListener(type, mark);
      clearTimeout(finishTimer);
      document.documentElement.style.removeProperty("--dive");
      document.documentElement.style.removeProperty("--dive-blur");
      stopFinishing();
      for (const type of ["wheel", "keydown", "pointerdown"]) window.removeEventListener(type, stopFinishing);
      window.removeEventListener("pointerdown", pressOn);
      for (const type of ["pointerup", "pointercancel", "blur"]) window.removeEventListener(type, pressOff);
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("touchstart", touchOn);
      window.removeEventListener("touchend", touchOff);
      window.removeEventListener("touchcancel", touchOff);
      window.removeEventListener("resize", resized);
      window.removeEventListener("hashchange", goToHash);
    };
  }, [motion]);

  return (
    <section ref={track} className={`worlds${motion ? " motion" : ""}`} aria-label="Projects">
      {/* Once pinned, each chapter's anchor sits at the scroll position where that chapter is at rest. */}
      {motion && projects.map((p, i) => (
        <span key={p.slug} id={`work-${p.slug}`} className="chapter-anchor" style={{ "--rest": restCenter(i) } as CSSProperties} aria-hidden="true" />
      ))}
      <div className="stage">
        {projects.map((p, i) => (
          <article
            key={p.slug}
            id={motion ? undefined : `work-${p.slug}`}
            data-chapter={p.slug}
            className="chapter"
            aria-labelledby={`chapter-${p.slug}`}
            style={{ "--ground": p.tokens.ground, "--ink": p.tokens.text, "--giant": p.tokens.giant } as CSSProperties}
          >
            <div className="scene">
              <div className="chapter-info">
                <p className="label" data-word="0">{p.label}</p>
                <div className="chapter-mask"><h2 id={`chapter-${p.slug}`} data-word="1">{p.name}</h2></div>
                <p className="chapter-line" data-word="2">{p.line}</p>
                <dl className="facts" data-word="2">
                  {p.facts.map(f => <div key={f.term}><dt>{f.term}</dt><dd>{f.detail}</dd></div>)}
                </dl>
                <a className="chapter-open" data-word="3" href={asset(`work/${p.slug}/`)}>Open case study<span className="visually-hidden">: {p.name}</span> <span aria-hidden="true">→</span></a>
              </div>
              <div className="showcase" aria-hidden="true">
                <div className="showcase-desk">
                  <BrowserFrame title={p.desktop.title} src={asset(p.desktop.src)} srcSet={`${asset(small(p.desktop.src))} 640w, ${asset(p.desktop.src)} 1440w`} sizes="(max-width: 860px) 90vw, 54vw" alt="" morph={active === i} />
                </div>
                <div className="showcase-phone">
                  <PhoneFrame src={asset(p.phone.src)} srcSet={`${asset(small(p.phone.src))} 300w, ${asset(p.phone.src)} 780w`} sizes="(max-width: 860px) 30vw, 14vw" alt="" />
                </div>
                <p className="showcase-caption label">{p.caption}</p>
              </div>
              <p className="giant" aria-hidden="true"><span>{p.name}</span></p>
            </div>
          </article>
        ))}
        <div className="stage-flash" aria-hidden="true" />
        <nav className={`chapter-index${active >= 0 ? " on" : ""}`} aria-label="Project chapters">
          {projects.map((p, i) => (
            <a key={p.slug} href={`#work-${p.slug}`} className={active === i ? "on" : undefined} aria-current={active === i ? "true" : undefined}>{p.name}</a>
          ))}
        </nav>
      </div>
    </section>
  );
}
