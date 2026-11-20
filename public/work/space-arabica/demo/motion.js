// Motion runtime shared by every page (planning/MOTION-SYSTEM-PLAN.md §5).
// One scroll/resize frame loop, one reveal helper, one in-view helper, and the
// motion tokens from motion-tokens.css. Page scenes live in scenes.js; the hero
// carousel (theatre.js) and menu widgets (script.js) register here too.
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const styles = getComputedStyle(root);
  const token = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  const ease = {
    out: token('--ease-out', 'cubic-bezier(.22, 1, .36, 1)'),
    inOut: token('--ease-in-out', 'cubic-bezier(.65, 0, .35, 1)'),
    in: token('--ease-in', 'cubic-bezier(.4, 0, 1, 1)'),
    sine: token('--ease-sine', 'cubic-bezier(.45, 0, .55, 1)'),
    spring: token('--ease-spring', 'cubic-bezier(.2, 1.35, .4, 1)'),
  };
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
  const smooth = n => n * n * (3 - 2 * n);

  /* ---------- Frame loop: every scene reads first, then every scene writes ---------- */
  // Interleaving layout reads with style writes forces repeated style flushes,
  // so a scene may split its work into read(view) and write(view, data).
  const scenes = [];
  let frame = 0;
  const run = () => {
    frame = 0;
    const view = { width: innerWidth, height: innerHeight, calm: reduced.matches };
    const reads = scenes.map(scene => (scene.read ? scene.read(view) : undefined));
    scenes.forEach((scene, i) => scene.write?.(view, reads[i]));
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(run); };
  const scene = definition => {
    scenes.push(typeof definition === 'function' ? { write: definition } : definition);
    request();
  };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  reduced.addEventListener('change', request);

  // 0 → 1 as a tall (sticky) section scrolls through the viewport.
  const sectionProgress = section => {
    const rect = section.getBoundingClientRect();
    const travel = rect.height - innerHeight;
    return travel > 0 ? clamp(-rect.top / travel) : (rect.top < innerHeight / 2 ? 1 : 0);
  };

  // Accepts an element, a NodeList, or (nested) arrays of either; drops nulls.
  const toList = value => {
    if (!value) return [];
    if (value instanceof Element) return [value];
    return typeof value[Symbol.iterator] === 'function' ? [...value].flatMap(toList) : [];
  };

  /* ---------- Reveal once: one observer per threshold/margin pair ---------- */
  const revealObservers = new Map();
  const revealOptions = new Map();
  const finishReveal = el => {
    const options = revealOptions.get(el);
    if (!options) return;
    if (options.onReveal && options.onReveal(el) === false) return;
    if (options.className) el.classList.add(options.className);
    options.observer?.unobserve(el);
    revealOptions.delete(el);
  };
  const observerFor = (threshold, rootMargin) => {
    const key = `${threshold}|${rootMargin}`;
    if (!revealObservers.has(key)) {
      revealObservers.set(key, new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) finishReveal(entry.target);
      }), { threshold, rootMargin }));
    }
    return revealObservers.get(key);
  };
  // A fast jump (anchor link, Page Down, restored scroll) can carry an element from
  // below the viewport to above it between frames without ever intersecting.
  // Anything already scrolled past is revealed so content is never left hidden.
  scene({
    read: () => revealOptions.size ? [...revealOptions.keys()].filter(el => el.getBoundingClientRect().bottom < 0) : [],
    write: (view, passed) => passed.forEach(finishReveal),
  });
  // pendingClass hides content only when the reveal can actually run, so content
  // stays visible without IntersectionObserver or with reduced motion.
  const reveal = (elements, { threshold = .2, rootMargin = '0px', className = 'is-drawn', pendingClass = null, onReveal = null } = {}) => {
    const list = toList(elements);
    if (pendingClass && (reduced.matches || !('IntersectionObserver' in window))) return;
    if (!('IntersectionObserver' in window)) {
      list.forEach(el => { if (!onReveal || onReveal(el) !== false) { if (className) el.classList.add(className); } });
      return;
    }
    const observer = observerFor(threshold, rootMargin);
    list.forEach(el => {
      if (pendingClass) el.classList.add(pendingClass);
      revealOptions.set(el, { className, onReveal, observer });
      observer.observe(el);
    });
    request();
  };

  /* ---------- In view: ambient loops run only for visible, foreground sections ---------- */
  const watched = [];
  const syncHost = record => record.host.classList.toggle('is-in-view', record.visible && !document.hidden);
  const inView = (elements, { rootMargin = '0px', host = null } = {}) => {
    const list = toList(elements);
    if (!('IntersectionObserver' in window)) { list.forEach(el => (host || el).classList.add('is-in-view')); return; }
    const records = list.map(el => ({ el, host: host || el, visible: false }));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const record = records.find(r => r.el === entry.target);
      record.visible = entry.isIntersecting;
      syncHost(record);
    }), { rootMargin });
    records.forEach(record => { watched.push(record); observer.observe(record.el); });
  };
  document.addEventListener('visibilitychange', () => watched.forEach(syncHost));

  /* ---------- Site chrome: header state and reading progress ---------- */
  const header = document.querySelector('.site-header');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);
  scene({
    read: () => ({ y: scrollY, distance: root.scrollHeight - innerHeight }),
    write: (view, { y, distance }) => {
      header?.classList.toggle('is-scrolled', y > 42);
      progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, y / distance) : 0})`;
    },
  });

  window.SAMotion = { page: root.dataset.page, reduced, ease, clamp, smooth, scene, request, sectionProgress, reveal, inView };
})();
