/* Runs before first paint so cross-document navigation can prepare its snapshot.
   Links, metadata, loading, and history remain normal browser navigation. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const native = 'onpageswap' in window && 'onpagereveal' in window;
  const arrivalKey = 'portfolio-project-arrival';
  const projects = {
    korte: { title: 'Korte', number: '02' },
    'space-arabica': { title: 'Space Arabica', number: '01' },
  };
  const projectAt = (value) => {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      return url.origin === location.origin
        ? url.pathname.match(/\/work\/(korte|space-arabica)\/?$/)?.[1] || null
        : null;
    } catch { return null; }
  };
  const quiet = () => reduced.matches;
  const betweenProjects = (from, to) => {
    const source = projectAt(from);
    const target = projectAt(to);
    return source && target && source !== target ? target : null;
  };
  const reset = () => {
    delete root.dataset.projectSwitching;
    delete root.dataset.projectArrival;
  };
  const prepare = (target) => {
    root.dataset.projectTheme = target;
    document.getElementById('project-transition-label').textContent = projects[target].title;
    document.getElementById('project-transition-number').textContent = projects[target].number;
    root.dataset.projectSwitching = 'true';
  };
  let activeTransition;
  const cleanAfter = (transition) => {
    activeTransition = transition;
    transition.finished.catch(() => {}).finally(() => {
      if (activeTransition === transition) { activeTransition = null; reset(); }
    });
  };
  window.addEventListener('pageswap', (event) => {
    if (!event.viewTransition) return;
    const target = betweenProjects(location.href, event.activation?.entry.url);
    if (!target || quiet()) { event.viewTransition.skipTransition(); return; }
    prepare(target);
    cleanAfter(event.viewTransition);
  });
  window.addEventListener('pagereveal', (event) => {
    reset();
    if (!event.viewTransition) return;
    const target = betweenProjects(window.navigation?.activation?.from?.url, location.href);
    if (!target || quiet()) { event.viewTransition.skipTransition(); return; }
    prepare(target);
    cleanAfter(event.viewTransition);
  });
  // Returning from the back/forward cache must never retain an opaque curtain.
  window.addEventListener('pageshow', (event) => { if (event.persisted) reset(); });
  reduced.addEventListener('change', () => {
    if (quiet()) { activeTransition?.skipTransition(); reset(); }
  });

  // Browsers without cross-document transitions get a short arrival reveal.
  // No link interception, artificial loading delay, or stored page contents.
  if (!native) {
    try {
      const arrival = JSON.parse(sessionStorage.getItem(arrivalKey) || 'null');
      sessionStorage.removeItem(arrivalKey);
      if (arrival && arrival.path === location.pathname && Date.now() - arrival.time < 15000 && !quiet()) {
        root.dataset.projectArrival = 'true';
        window.addEventListener('DOMContentLoaded', () => setTimeout(reset, 400), { once: true });
      }
    } catch { /* Navigation remains usable when storage is unavailable. */ }
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || quiet()) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      if (!betweenProjects(location.href, link.href)) return;
      try { sessionStorage.setItem(arrivalKey, JSON.stringify({ path: new URL(link.href).pathname, time: Date.now() })); }
      catch { /* Ordinary navigation is the fallback. */ }
    });
  }
})();
