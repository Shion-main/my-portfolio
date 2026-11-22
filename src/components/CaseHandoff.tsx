import { useEffect, useRef, useState, type CSSProperties } from "react";
import { projects, type Project } from "../work/projects";
import { asset } from "../work/asset";
import { BrowserFrame } from "./DeviceFrames";
import { HANDOFF, SETTLE_MS, clamp, dolly, easeIn3, easeInOut3, fitFontSize, glide, handoffPhase, handoffSettle, handoffTrackScreens, landing, leaveWords, lerp, pushIn, range } from "../motion/scroll";
import "./handoff.css";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
type Rect = { x: number; y: number; w: number; h: number };

/**
 * The end of every case study. Prerendered (and kept, with reduced motion) as a plain "next project" section with a link.
 * Once hydrated it pins: the next project arrives, holds, then the camera dives into its laptop and the next case opens by itself.
 */
export default function CaseHandoff({ next }: { next: Project }) {
  const root = useRef<HTMLElement>(null);
  const [motion, setMotion] = useState(false);
  useEffect(() => { if (!reduced()) setMotion(true); }, []);

  useEffect(() => {
    if (!motion || !root.current) return;
    const el = root.current;
    const pick = <T extends HTMLElement>(selector: string) => el.querySelector<T>(selector)!;
    const world = pick(".handoff__world"), scene = pick(".handoff__scene"), info = pick(".handoff__info"), desk = pick(".handoff__desk");
    const screen = pick(".handoff__frame img"), giant = pick(".handoff__giant"), flashEl = pick(".handoff__flash"), hint = pick(".handoff__hint");
    const words = [...el.querySelectorAll<HTMLElement>("[data-word]")];
    const url = pick<HTMLAnchorElement>(".handoff__continue").href;
    const page = document.documentElement.style;
    const opts = { settle: true };
    let frame = 0;
    let last = 0;
    let cur = Number.NaN;
    let target = 0;
    let rect: Rect | null = null;
    let headOn = false;
    // Opening the next case needs a reader: some input since load (or since a restore), and only once per page view.
    let moved = false;
    let opened = false;
    // The way the reader last scrolled; the next case opens only when they are heading forward into it.
    let dir: 1 | -1 = 1;

    if (import.meta.env.DEV || location.search.includes("checks")) {
      (window as unknown as { __handoff: unknown }).__handoff = { drawn: () => cur, caught: () => cur === target && !frame, settle: (on: boolean) => { opts.settle = on; } };
    }

    // Screens are counted in the track's own unit (its CSS height is three of them, in large-viewport units),
    // not innerHeight: a phone toolbar sliding in or out changes innerHeight and must not move the reader.
    const unit = () => el.offsetHeight / handoffTrackScreens();
    const position = () => -el.getBoundingClientRect().top / unit();
    const topFor = (s: number) => el.getBoundingClientRect().top + scrollY + s * unit();
    // The laptop drifts while resting; it is frozen where the dive starts, so the dolly aims at a still screen.
    const DIVE_DRIFT = clamp(HANDOFF.DIVE_FROM - HANDOFF.HOLD, -1.2, 1.2);
    const diveDeskT = `translateY(${(-DIVE_DRIFT * 26).toFixed(1)}px)`;
    // Measured exactly as the dive holds the laptop: scene untransformed, laptop at the dive's frozen drift
    // (not whatever the previous frame left, which is off by the parallax when the reader jumps straight in).
    const screenRect = (): Rect => {
      if (rect) return rect;
      const saved = [scene.style.transform, desk.style.transform];
      scene.style.transform = "";
      desk.style.transform = diveDeskT;
      const r = screen.getBoundingClientRect();
      [scene.style.transform, desk.style.transform] = saved;
      return (rect = { x: r.left, y: r.top, w: r.width, h: r.height });
    };

    const draw = (now: number) => {
      frame = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      target = position();
      cur = Number.isNaN(cur) ? target : glide(cur, target, dt, false);
      const { phase, t } = handoffPhase(cur);
      const drift = phase === "dive" || phase === "done" ? DIVE_DRIFT : clamp(cur - HANDOFF.HOLD, -1.2, 1.2);
      let worldO = 1, sceneT = "", sceneO = "62% 46%", blur = 0, flash = 0, infoO = 1, hintO = 1;
      let wordO = [1, 1, 1, 1], wordY = [0, 0, 0, 0];
      let deskT = `translateY(${(-drift * 26).toFixed(1)}px)`, deskO = 1;
      let giantW = next.giantFit, giantWt = 820, giantT = "", giantO = 1;
      if (phase === "before") {
        worldO = 0;
      } else if (phase === "arrive") {
        const n = pushIn(lerp(0.48, 1, t));
        const l = landing(n.land, next.giantFit);
        worldO = n.opacity; sceneT = `scale(${n.scale.toFixed(4)})`; blur = innerWidth > 860 ? n.blur : 0; flash = n.flash;
        wordO = l.words.map((w, j) => (j === 1 ? (w > 0 ? 1 : 0) : w));
        wordY = l.words.map((w, j) => (1 - w) * (j === 1 ? 108 : 18));
        deskT = `translateY(${(-drift * 26).toFixed(1)}px) translateY(${l.deskY.toFixed(2)}vh) scale(${l.deskScale.toFixed(4)})`; deskO = l.deskO;
        giantW = l.giantW; giantWt = l.giantWt; giantT = `translateY(${l.giantY.toFixed(2)}%)`; giantO = l.giantO;
        hintO = range(t, 0.8, 1);
      } else if (phase === "dive" || phase === "done") {
        const d = phase === "done" ? 1 : t;
        const leave = leaveWords(range(d, 0, 0.3));
        infoO = leave.opacity; wordY = leave.y; giantO = 1 - range(d, 0, 0.35); hintO = 0;
        // The camera flies into the laptop's screenshot until it overfills the view. No blur: the landing stays sharp.
        const dl = dolly(screenRect(), innerWidth, innerHeight, easeIn3(d));
        sceneO = `${dl.originX.toFixed(1)}px ${dl.originY.toFixed(1)}px`;
        sceneT = `translate(${dl.dx.toFixed(1)}px, ${dl.dy.toFixed(1)}px) scale(${dl.scale.toFixed(4)})`;
      }

      // Always written: in motion mode the stylesheet starts the world hidden, so clearing it would hide it again.
      world.style.opacity = worldO.toFixed(3);
      scene.style.transform = sceneT;
      scene.style.transformOrigin = sceneO;
      scene.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : "";
      flashEl.style.opacity = flash > 0.001 ? flash.toFixed(3) : "0";
      info.style.opacity = infoO >= 1 ? "" : infoO.toFixed(3);
      // Faded words take no clicks.
      info.style.pointerEvents = infoO >= 0.5 && worldO >= 0.5 && wordO[3] >= 0.5 ? "" : "none";
      words.forEach(w => {
        const j = Number(w.dataset.word);
        w.style.opacity = wordO[j] >= 1 ? "" : wordO[j].toFixed(3);
        w.style.transform = wordY[j] ? `translateY(${wordY[j].toFixed(2)}${j === 1 ? "%" : "px"})` : "";
      });
      hint.style.opacity = hintO >= 1 ? "" : hintO.toFixed(3);
      desk.style.transform = deskT;
      desk.style.opacity = deskO >= 1 ? "" : deskO.toFixed(3);
      giant.style.setProperty("--wd", giantW.toFixed(1));
      giant.style.setProperty("--wt", giantWt.toFixed(0));
      giant.style.transform = giantT;
      giant.style.opacity = giantO >= 1 ? "" : giantO.toFixed(3);

      // The header takes the next project's text colour while its world fills the stage.
      const showing = worldO > 0.5;
      if (showing !== headOn) {
        headOn = showing;
        if (showing) page.setProperty("--head", next.tokens.text);
        else page.removeProperty("--head");
      }
      if (phase === "done" && moved && dir > 0 && !opened) {
        opened = true;
        location.assign(url);
      }
      if (cur !== target) frame = requestAnimationFrame(draw);
    };
    const queue = () => { if (!frame) { last = 0; frame = requestAnimationFrame(draw); } };

    // A page that loads, reloads or is restored already past the hold, with no reader input yet, rests at the hold.
    const toHold = () => window.scrollTo(0, topFor(HANDOFF.HOLD));
    const restAtHold = () => { if (!moved && opts.settle && position() > HANDOFF.HOLD + 0.01) toHold(); };

    // Finish a move the reader stopped inside, the way they were heading. Never under a finger or a held button;
    // any input stops a finish in flight.
    let finishTimer = 0, finishing = 0, touching = false, pressing = false, lastY = scrollY;
    const stopFinishing = () => { cancelAnimationFrame(finishing); finishing = 0; };
    const finish = () => {
      finishTimer = 0;
      if (touching || pressing || finishing || !opts.settle) return;
      const dest = handoffSettle(position(), dir);
      if (dest === null) return;
      const from = scrollY, to = topFor(dest);
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
      restAtHold();
      queue();
      waitToFinish();
    };
    const input = () => { moved = true; stopFinishing(); };
    const touchOn = () => { moved = true; touching = true; stopFinishing(); };
    const touchOff = (event: TouchEvent) => { if (event.touches.length === 0) { touching = false; waitToFinish(); } };
    const pressOn = () => { moved = true; pressing = true; stopFinishing(); };
    const pressOff = () => { if (!pressing) return; pressing = false; waitToFinish(); };
    // Keyboard focus inside the hand-off brings the next project to rest, so the link is visible and nothing opens.
    const follow = () => { if (Math.abs(position() - HANDOFF.HOLD) > 0.02) toHold(); };
    const restored = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      moved = false; opened = false; cur = Number.NaN;
      restAtHold();
      queue();
    };
    // End goes to the end of this page — the next project at rest — instead of jumping straight into the next case.
    const endKey = (event: KeyboardEvent) => {
      if (event.key !== "End" || event.altKey || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))) return;
      event.preventDefault();
      moved = true;
      toHold();
    };
    let lastWidth = innerWidth;
    const resized = () => {
      const keep = target;
      const widthChanged = innerWidth !== lastWidth;
      lastWidth = innerWidth;
      fit();
      if (widthChanged && keep >= HANDOFF.FROM && keep <= HANDOFF.DIVE_TO) window.scrollTo(0, topFor(Math.min(keep, HANDOFF.HOLD)));
      waitToFinish();
    };
    const fit = () => {
      rect = null;
      giant.style.fontSize = "100px";
      giant.style.setProperty("--wd", String(next.giantFit));
      giant.style.setProperty("--wt", "820");
      const width = giant.firstElementChild!.getBoundingClientRect().width;
      giant.style.fontSize = `${fitFontSize(width, innerWidth, innerHeight, innerWidth <= 860)}px`;
      queue();
    };

    fit();
    restAtHold();
    // A position the browser restored mid-move (no scroll event follows) finishes too, so the stage is never left empty.
    waitToFinish();
    document.fonts?.ready.then(fit);
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener("resize", resized);
    window.addEventListener("keydown", endKey);
    window.addEventListener("pageshow", restored);
    for (const type of ["wheel", "keydown"]) window.addEventListener(type, input, { passive: true });
    window.addEventListener("touchstart", touchOn, { passive: true });
    window.addEventListener("touchend", touchOff, { passive: true });
    window.addEventListener("touchcancel", touchOff, { passive: true });
    window.addEventListener("pointerdown", pressOn, { passive: true });
    for (const type of ["pointerup", "pointercancel", "blur"]) window.addEventListener(type, pressOff, { passive: true });
    el.addEventListener("focusin", follow);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(finishTimer);
      stopFinishing();
      page.removeProperty("--head");
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("resize", resized);
      window.removeEventListener("keydown", endKey);
      window.removeEventListener("pageshow", restored);
      for (const type of ["wheel", "keydown"]) window.removeEventListener(type, input);
      window.removeEventListener("touchstart", touchOn);
      window.removeEventListener("touchend", touchOff);
      window.removeEventListener("touchcancel", touchOff);
      window.removeEventListener("pointerdown", pressOn);
      for (const type of ["pointerup", "pointercancel", "blur"]) window.removeEventListener(type, pressOff);
      el.removeEventListener("focusin", follow);
    };
  }, [motion, next]);

  const index = projects.findIndex(p => p.slug === next.slug) + 1;
  const count = String(projects.length).padStart(2, "0");
  return (
    <section
      ref={root}
      className={`handoff${motion ? " motion" : ""}`}
      aria-labelledby="handoff-title"
      style={{ "--ground": next.tokens.ground, "--ink": next.tokens.text, "--giant": next.tokens.giant } as CSSProperties}
    >
      <div className="handoff__stage">
        <div className="handoff__world">
          <div className="handoff__scene">
            <div className="handoff__info">
              <p className="label" data-word="0">{`Next project · ${String(index).padStart(2, "0")} / ${count}`}</p>
              <div className="handoff__mask"><h2 id="handoff-title" data-word="1">{next.name}</h2></div>
              <p className="handoff__line" data-word="2">{next.line}</p>
              <a className="handoff__continue" data-word="3" href={asset(`work/${next.slug}/`)}>{`Continue to ${next.name}`} <span aria-hidden="true">→</span></a>
              <p className="handoff__hint label" aria-hidden="true">Keep scrolling</p>
            </div>
            <div className="handoff__desk" aria-hidden="true">
              <BrowserFrame className="handoff__frame" title={next.desktop.title} src={asset(next.desktop.src)} alt="" />
            </div>
            <p className="handoff__giant" aria-hidden="true"><span>{next.name}</span></p>
          </div>
        </div>
        <div className="handoff__flash" aria-hidden="true" />
      </div>
    </section>
  );
}
