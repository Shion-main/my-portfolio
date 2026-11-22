/* Runs before first paint so cross-document View Transitions can be prepared.
   Home ↔ case study: the chapter's browser frame morphs into the case hero ("morph").
   Case study → the next case study: one whip pan ("whip"): the two pages travel together, edge to edge, the old one
   out to the left and the next case study in from the right, with the header holding still. Back and Forward
   between case studies crossfade ("fade").
   Links, loading and history stay ordinary browser navigation. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const native = 'onpageswap' in window && 'onpagereveal' in window;
  const arrivalKey = 'portfolio-arrival';
  const slugs = ['space-arabica', 'korte', 'fluxtrack', 'atlas-treasury'];
  // Before first paint: pages that will move get their full layout now (the case hand-off's 315vh track),
  // so a restored scroll position is never clamped to a shorter page than the app will build.
  if (!reduced.matches) root.classList.add('can-move');
  // If the app's own code fails to load, nothing would ever move that layout: fall back to the plain one, so the end
  // of a case study can still be read and its link reached. (Once the app runs, its own classes keep the layout.)
  window.addEventListener('error', (event) => {
    const script = event.target;
    if (script instanceof HTMLScriptElement && script.type === 'module' && script.src.startsWith(location.origin)) root.classList.remove('can-move');
  }, true);

  // Returns { page: 'home' | 'case', slug } for same-origin portfolio URLs.
  const place = (value) => {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin) return null;
      if (url.pathname === '/' || url.pathname === '/index.html') {
        const slug = (url.hash.match(/^#work-([a-z-]+)$/) || [])[1];
        return { page: 'home', slug: slugs.includes(slug) ? slug : null };
      }
      const slug = (url.pathname.match(/^\/work\/([a-z-]+)\/?$/) || [])[1];
      return slugs.includes(slug) ? { page: 'case', slug } : null;
    } catch { return null; }
  };
  // Back and Forward between case studies crossfade: going back is not the camera carrying on.
  const kindBetween = (from, to, traverse) => {
    const a = place(from), b = place(to);
    if (!a || !b) return null;
    if (a.page === 'case' && b.page === 'case' && a.slug !== b.slug) return traverse ? 'fade' : 'whip';
    if (a.page !== b.page) return 'morph';
    return null;
  };
  const reset = () => {
    delete root.dataset.transitionKind;
    delete root.dataset.transitionSide;
    delete root.dataset.morphTarget;
    delete root.dataset.projectArrival;
  };
  let active = null;
  const begin = (transition, kind, to, side) => {
    root.dataset.transitionKind = kind;
    root.dataset.transitionSide = side;
    // Arriving on the home page before React has run: name the right chapter's frame from CSS.
    const target = place(to);
    if (kind === 'morph' && target && target.page === 'home' && target.slug) root.dataset.morphTarget = target.slug;
    active = transition;
    transition.finished.catch(() => {}).finally(() => { if (active === transition) { active = null; reset(); } });
  };

  window.addEventListener('pageswap', (event) => {
    if (!event.viewTransition) return;
    const to = event.activation && event.activation.entry && event.activation.entry.url;
    const kind = kindBetween(location.href, to, event.activation && event.activation.navigationType === 'traverse');
    if (!kind || reduced.matches) { event.viewTransition.skipTransition(); return; }
    begin(event.viewTransition, kind, to, 'old');
  });
  window.addEventListener('pagereveal', (event) => {
    reset();
    if (!event.viewTransition) return;
    const from = window.navigation && navigation.activation && navigation.activation.from && navigation.activation.from.url;
    const kind = kindBetween(from, location.href, navigation.activation.navigationType === 'traverse');
    if (!kind || reduced.matches) { event.viewTransition.skipTransition(); return; }
    begin(event.viewTransition, kind, location.href, 'new');
  });
  // A page restored from the back/forward cache never keeps a transition state.
  window.addEventListener('pageshow', (event) => { if (event.persisted) reset(); });
  reduced.addEventListener('change', () => { if (reduced.matches) { if (active) active.skipTransition(); reset(); } });

  // Browsers without cross-document transitions get a short arrival fade instead.
  if (!native) {
    try {
      const arrival = JSON.parse(sessionStorage.getItem(arrivalKey) || 'null');
      sessionStorage.removeItem(arrivalKey);
      if (arrival && arrival.path === location.pathname && Date.now() - arrival.time < 15000 && !reduced.matches) {
        root.dataset.projectArrival = 'true';
        window.addEventListener('DOMContentLoaded', () => setTimeout(reset, 450), { once: true });
      }
    } catch { /* Navigation still works without storage. */ }
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduced.matches) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      if (!kindBetween(location.href, link.href)) return;
      try { sessionStorage.setItem(arrivalKey, JSON.stringify({ path: new URL(link.href).pathname, time: Date.now() })); }
      catch { /* Ordinary navigation is the fallback. */ }
    });
  }
})();
