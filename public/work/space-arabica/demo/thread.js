// The Thread (planning/MOTION-SYSTEM-PLAN.md §2, phase 2).
// After a page arrives, the amber line drops from the nav (or the logo's dash on
// phones), curves to the page's signature element and traces its shape there.
// Pages call SAMotion.thread.land(target, { shape, persist, onLand }) once.
// Reduced motion, an off-screen target or a missing API → onLand runs at once.
(() => {
  const M = window.SAMotion;
  if (!M) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  const clamp = M.clamp;

  /* ---------- When to start: after the incoming view transition, or after first layout ---------- */
  let arrival = null;
  addEventListener('pagereveal', event => { arrival = event.viewTransition; }, { once: true });
  const domReady = new Promise(resolve => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resolve, { once: true });
    else resolve();
  });
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const ready = () => domReady
    .then(() => (arrival || document.activeViewTransition)?.finished.catch(() => {}))
    .then(() => document.fonts?.ready)
    .then(frame);

  /* ---------- Where it starts: the nav thread, or the dash in the logo on phones ---------- */
  const startPoint = () => {
    const rest = document.querySelector('.nav-thread')?.getBoundingClientRect();
    if (rest?.width) return { x: rest.left + rest.width / 2, y: rest.top + rest.height / 2 };
    const dash = document.querySelector('.brand__name span')?.getBoundingClientRect();
    return dash ? { x: dash.left + dash.width / 2, y: dash.top + dash.height / 2 } : { x: 40, y: 40 };
  };

  /* ---------- Shapes, in the target's own (untransformed) box ---------- */
  const radius = (value, size) => (value.endsWith('%') ? parseFloat(value) / 100 * size : parseFloat(value) || 0);
  const shapes = {
    // From the left shoulder (on screen at every width; the crown can sit under the header),
    // over the crown and down the right side, then down the left side.
    arch(el, w, h) {
      const [rxRaw, ryRaw = rxRaw] = getComputedStyle(el).borderTopLeftRadius.split(' ');
      const rx = Math.min(w / 2, radius(rxRaw, w));
      const ry = Math.min(h, radius(ryRaw, h));
      return `M0 ${ry} A${rx} ${ry} 0 0 1 ${rx} 0 H${w - rx} A${rx} ${ry} 0 0 1 ${w} ${ry} V${h} M0 ${ry} V${h}`;
    },
    // From the top of the ring, all the way round.
    ellipse: (el, w, h) => `M${w / 2} 0 A${w / 2} ${h / 2} 0 1 1 ${w / 2} ${h} A${w / 2} ${h / 2} 0 1 1 ${w / 2} 0`,
    rect: (el, w, h) => `M0 0 H${w} V${h} H0 Z`,
    rule: (el, w) => `M0 0 H${w}`,
    line: (el, w, h) => `M0 ${h / 2} H${w}`,
    ticket(el, w, h) {
      const r = Math.min(12, h / 6);
      return `M0 0 H${w} V${h / 2 - r} A${r} ${r} 0 0 0 ${w} ${h / 2 + r} V${h} H0 V${h / 2 + r} A${r} ${r} 0 0 0 0 ${h / 2 - r} Z`;
    },
  };

  // Screen position of a path's first point, including CSS transforms on ancestors.
  const screenStart = path => {
    const point = path.getPointAtLength(0);
    const matrix = path.getScreenCTM();
    return matrix ? new DOMPoint(point.x, point.y).matrixTransform(matrix) : null;
  };

  const inViewport = el => {
    const rect = el.getBoundingClientRect();
    return rect.width + rect.height > 0 && rect.top < innerHeight * .92 && rect.bottom > 70;
  };

  /* ---------- The landing ---------- */
  let requested = false;
  const land = (target, { shape = 'point', persist = false, onLand = () => {} } = {}) => {
    if (requested || !target) { onLand(); return; }
    requested = true;
    const skip = () => M.reduced.matches || !Element.prototype.animate || !inViewport(target);
    if (M.reduced.matches || !Element.prototype.animate) { onLand(); return; }
    ready().then(() => {
      if (skip()) { onLand(); return; }

      // The trace lives inside the target so it scrolls (and rotates) with it.
      let trace = null;
      let tracePath = target;
      if (shape !== 'point') {
        const w = target.offsetWidth;
        const h = target.offsetHeight;
        if (!w || !h) { onLand(); return; }
        if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
        trace = svg('svg', { class: `thread-trace ${persist ? 'thread-trace--persist' : 'thread-trace--fade'}`, viewBox: `0 0 ${w} ${h}`, 'aria-hidden': 'true', focusable: 'false' });
        tracePath = svg('path', { d: shapes[shape](target, w, h) });
        trace.append(tracePath);
        target.append(trace);
        const length = tracePath.getTotalLength();
        tracePath.style.strokeDasharray = `${length}`;
        tracePath.style.strokeDashoffset = `${length}`;
      }
      const end = screenStart(tracePath);
      // The line must visibly arrive somewhere; an off-screen landing point skips the flight.
      if (!end || end.y < 0 || end.y > innerHeight - 24 || end.x < 0 || end.x > innerWidth) {
        trace?.remove();
        onLand();
        return;
      }

      // The approach: drop from the nav, then swing into the target.
      const start = startPoint();
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const overlay = svg('svg', { class: 'thread-overlay', 'aria-hidden': 'true', focusable: 'false' });
      const approach = svg('path', {
        d: `M${start.x} ${start.y} C${start.x} ${start.y + Math.max(90, dy * .6)} ${end.x - dx * .3} ${end.y - Math.min(160, Math.abs(dy) * .4)} ${end.x} ${end.y}`,
      });
      overlay.append(approach);
      document.body.append(overlay);
      const approachLength = approach.getTotalLength();
      approach.style.strokeDasharray = `${approachLength} ${approachLength}`;
      const duration = clamp(approachLength * .9, 560, 950);
      // The head reaches the target at 60%; the tail then follows it in.
      const travel = approach.animate([
        { strokeDashoffset: approachLength },
        { strokeDashoffset: 0, offset: .6 },
        { strokeDashoffset: -approachLength },
      ], { duration, easing: M.ease.inOut, fill: 'both' });

      let arrived = false;
      const arrive = () => {
        if (arrived) return;
        arrived = true;
        onLand();
        if (!trace) return;
        const length = tracePath.getTotalLength();
        tracePath.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
          duration: clamp(length * .75, 650, 1400), easing: M.ease.inOut, fill: 'forwards',
        }).finished.then(() => trace.classList.add('is-done')).catch(() => {});
      };
      setTimeout(arrive, duration * .6);
      travel.finished.then(() => overlay.remove()).catch(() => overlay.remove());
      // Scrolling mid-flight would detach the line from its target: land immediately.
      addEventListener('scroll', () => { travel.finish(); arrive(); }, { once: true, passive: true });
    });
  };

  /* ---------- Resting place: the dash in the footer wordmark ---------- */
  M.reveal(document.querySelectorAll('.thread-rest'), { threshold: .6, pendingClass: 'js-drawn-pending' });

  M.thread = { land };
})();
