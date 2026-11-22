import { useEffect, useRef, useState, type CSSProperties } from "react";
import { projects, type Project } from "../work/projects";
import { asset } from "../work/asset";
import { BrowserFrame } from "./DeviceFrames";
import { Contact } from "./SiteChrome";
import { HANDOFF, SETTLE_MS, clamp, easeInOut3, fitFontSize, glide, handoffPhase, handoffSettle, handoffTrackScreens, whipEnter, whipLeave } from "../motion/scroll";
import "./handoff.css";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The end of every case study: the contact block, then the next project. Prerendered (and kept, with reduced motion) as
 * two plain sections with a link. Once hydrated it pins as a whip pan: the contact block rests, the camera whips sideways
 * to the next project, holds on it, then whips on, and the next case opens by itself (its page transition finishes the whip).
 */
export default function CaseHandoff({ next }: { next: Project }) {
  const root = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(false);
  useEffect(() => { if (!reduced()) setMotion(true); }, []);

  useEffect(() => {
    if (!motion || !root.current) return;
    const el = root.current;
    const pick = <T extends HTMLElement>(selector: string) => el.querySelector<T>(selector)!;
    const contact = pick(".handoff__contact"), world = pick(".handoff__world"), scene = pick(".handoff__scene");
    const info = pick(".handoff__info"), desk = pick(".handoff__desk"), giant = pick(".handoff__giant");
    const streaksEl = pick(".handoff__streaks"), bars = [pick(".handoff__bar--top"), pick(".handoff__bar--bottom")];
    const screen = pick<HTMLImageElement>(".handoff__frame img");
    const continueLink = pick<HTMLAnchorElement>(".handoff__continue");
    const page = document.documentElement.style;
    const opts = { settle: true };
    let frame = 0;
    let last = 0;
    let cur = Number.NaN;
    let target = 0;
    let headOn = false;
    let primed = false;
    // Opening the next case needs a reader: some input since load (or since a restore), and only once per page view.
    let moved = false;
    let opened = false;
    // The way the reader last scrolled; the next case opens only when they are heading forward into it.
    let dir: 1 | -1 = 1;

    if (import.meta.env.DEV || location.search.includes("checks")) {
      (window as unknown as { __handoff: unknown }).__handoff = { drawn: () => cur, caught: () => cur === target && !frame, settle: (on: boolean) => { opts.settle = on; } };
    }

    // Screens are counted in the track's own unit (its CSS height is a whole number of them, in large-viewport units),
    // not innerHeight: a phone toolbar sliding in or out changes innerHeight and must not move the reader.
    const unit = () => el.offsetHeight / handoffTrackScreens();
    const position = () => -el.getBoundingClientRect().top / unit();
    const topFor = (s: number) => el.getBoundingClientRect().top + scrollY + s * unit();

    const draw = (now: number) => {
      frame = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      target = position();
      cur = Number.isNaN(cur) ? target : glide(cur, target, dt, false);
      // The next project's screenshot is lazy: load and decode it as the reader nears the hand-off, so it is never
      // fetched and decoded in the middle of the whip.
      if (!primed && cur > -1.5) { primed = true; screen.loading = "eager"; screen.decode?.().catch(() => {}); }
      const { phase, t } = handoffPhase(cur);
      const cap = innerWidth > 860 ? 10 : 6;
      const blurOf = (b: number) => (b * cap > 0.05 ? `blur(${(b * cap).toFixed(1)}px)` : "none");
      const leaving = phase === "out" || phase === "done";
      // The laptop drifts while the next project rests; it is frozen where the second whip starts.
      const drift = clamp((leaving ? HANDOFF.OUT_FROM : cur) - HANDOFF.HOLD, -1.2, 1.2);
      const driftY = `translateY(${(-drift * 26).toFixed(1)}px)`;
      let contactT = "none", contactF = "none", worldT = "none", worldF = "none", sceneT = "none", sceneF = "none";
      let giantT = "none", giantW = next.giantFit, deskT = driftY, infoO = 1, infoT = "none";
      let streaks = 0, streakX = 0, barH = 0, head = true, live = true;
      if (phase === "contact") {
        // The contact block at rest; the next project waits off to the right.
        worldT = "translateX(105vw)"; infoO = 0; head = false; live = false;
      } else if (phase === "in") {
        // The first whip: the contact block streaks off left as the next project races in, name ahead, laptop behind.
        const w = whipEnter(t, next.giantFit);
        const skew = `skewX(${w.skew.toFixed(2)}deg)`;
        contactT = `translateX(${w.contactX.toFixed(2)}vw) ${skew}`;
        worldT = `translateX(${w.worldX.toFixed(2)}vw) ${skew}`;
        contactF = worldF = blurOf(w.blur);
        giantT = `translateX(${w.giantX.toFixed(2)}vw)`; giantW = w.giantW;
        deskT = `translateX(${w.deskX.toFixed(2)}vw) ${driftY}`;
        infoO = w.infoO; infoT = `translateX(${w.infoX.toFixed(1)}px)`;
        streaks = w.streaks; streakX = w.streakX; barH = w.bars;
        head = w.worldX < 50; live = t > 0.85;
      } else if (phase === "hold") {
        contactT = "translateX(-105vw)";
      } else {
        // The second whip: the next project accelerates off left; the page change finishes the move.
        const l = whipLeave(phase === "done" ? 1 : t);
        contactT = "translateX(-105vw)";
        sceneT = `skewX(${l.skew.toFixed(2)}deg)`; sceneF = blurOf(l.blur);
        infoO = l.infoO; infoT = `translateX(${l.infoX.toFixed(2)}vw)`;
        giantT = `translateX(${l.giantX.toFixed(2)}vw)`;
        deskT = `translateX(${l.deskX.toFixed(2)}vw) ${driftY}`;
        streaks = l.streaks; streakX = l.streakX; barH = l.bars; live = false;
      }

      // Always written: the stylesheet parks the world off to the right until the app draws.
      contact.style.transform = contactT; contact.style.filter = contactF;
      world.style.transform = worldT; world.style.filter = worldF;
      scene.style.transform = sceneT; scene.style.filter = sceneF;
      info.style.opacity = infoO >= 1 ? "" : infoO.toFixed(3);
      info.style.transform = infoT;
      // Words that are fading or flying take no clicks.
      info.style.pointerEvents = live && infoO >= 0.5 ? "" : "none";
      giant.style.transform = giantT;
      giant.style.setProperty("--wd", giantW.toFixed(1));
      desk.style.transform = deskT;
      streaksEl.style.opacity = streaks > 0.001 ? streaks.toFixed(3) : "0";
      streaksEl.style.transform = `translateX(${streakX.toFixed(2)}vw)`;
      for (const bar of bars) bar.style.height = barH > 0.01 ? `${barH.toFixed(2)}vh` : "0px";

      // The header takes the next project's text colour once its world covers most of the screen.
      if (head !== headOn) {
        headOn = head;
        if (head) page.setProperty("--head", next.tokens.text);
        else page.removeProperty("--head");
      }
      if (phase === "done" && moved && dir > 0 && !opened) {
        opened = true;
        // Through the link itself: the same navigation as a click on Continue, so browsers without view transitions
        // still get the arrival fade instead of a cut from the whip's blurred end frame.
        continueLink.click();
      }
      if (cur !== target) frame = requestAnimationFrame(draw);
    };
    const queue = () => { if (!frame) { last = 0; frame = requestAnimationFrame(draw); } };

    // A page that loads, reloads or is restored already past the hold, with no reader input yet, rests at the hold.
    const toHold = () => window.scrollTo(0, topFor(HANDOFF.HOLD));
    const restAtHold = () => { if (!moved && opts.settle && position() > HANDOFF.HOLD + 0.01) toHold(); };

    // Finish a whip the reader stopped inside, the way they were heading. Never under a finger or a held button;
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
    // Whether the last input was a pointer: a click or tap focuses its link too, and that focus must not move the page.
    let pointerFocus = false;
    const input = (event: Event) => { moved = true; stopFinishing(); if (event.type === "keydown") pointerFocus = false; };
    const touchOn = () => { moved = true; touching = true; pointerFocus = true; stopFinishing(); };
    const touchOff = (event: TouchEvent) => { if (event.touches.length === 0) { touching = false; waitToFinish(); } };
    const pressOn = () => { moved = true; pressing = true; pointerFocus = true; stopFinishing(); };
    const pressOff = () => { if (!pressing) return; pressing = false; waitToFinish(); };
    // Keyboard focus brings its own shot on screen: the email link the contact block, anything else the next project
    // at rest, so the focused link is visible and nothing opens. Focus from a click or tap stays where the reader is.
    const follow = (event: FocusEvent) => {
      if (pointerFocus) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(".handoff__contact")) {
        const s = position();
        if (s < -0.02 || s > HANDOFF.IN_FROM) window.scrollTo(0, topFor(0));
        return;
      }
      if (Math.abs(position() - HANDOFF.HOLD) > 0.02) toHold();
    };
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
      if (widthChanged && keep >= 0 && keep <= HANDOFF.OUT_TO) window.scrollTo(0, topFor(Math.min(keep, HANDOFF.HOLD)));
      waitToFinish();
    };
    const fit = () => {
      giant.style.fontSize = "100px";
      giant.style.setProperty("--wd", String(next.giantFit));
      giant.style.setProperty("--wt", "820");
      const width = giant.firstElementChild!.getBoundingClientRect().width;
      giant.style.fontSize = `${fitFontSize(width, innerWidth, innerHeight, innerWidth <= 860)}px`;
      queue();
    };

    fit();
    restAtHold();
    // A position the browser restored mid-whip (no scroll event follows) finishes too, so the stage is never left mid-move.
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
    <div
      ref={root}
      className={`handoff${motion ? " motion" : ""}`}
      style={{ "--ground": next.tokens.ground, "--ink": next.tokens.text, "--giant": next.tokens.giant } as CSSProperties}
    >
      <span id="contact" className="handoff__anchor" aria-hidden="true" />
      <div className="handoff__stage">
        <Contact anchor={false} className="handoff__contact" />
        <section className="handoff__world" aria-labelledby="handoff-title">
          <div className="handoff__scene">
            <div className="handoff__info">
              <p className="label">{`Next project · ${String(index).padStart(2, "0")} / ${count}`}</p>
              <div className="handoff__mask"><h2 id="handoff-title">{next.name}</h2></div>
              <p className="handoff__line">{next.line}</p>
              <a className="handoff__continue" href={asset(`work/${next.slug}/`)}>{`Continue to ${next.name}`} <span aria-hidden="true">→</span></a>
              <p className="handoff__hint label" aria-hidden="true">Keep scrolling</p>
            </div>
            <div className="handoff__desk" aria-hidden="true">
              <BrowserFrame className="handoff__frame" title={next.desktop.title} src={asset(next.desktop.src)} alt="" />
            </div>
            <p className="handoff__giant" aria-hidden="true"><span>{next.name}</span></p>
          </div>
        </section>
        <div className="handoff__streaks" aria-hidden="true" />
        <div className="handoff__bar handoff__bar--top" aria-hidden="true" />
        <div className="handoff__bar handoff__bar--bottom" aria-hidden="true" />
      </div>
    </div>
  );
}
