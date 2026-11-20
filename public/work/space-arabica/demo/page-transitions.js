// Page changes (planning/MOTION-SYSTEM-PLAN.md, phase 4).
// - Direction: the nav order is the story; moving toward Visit is "forward",
//   toward Home is "back" (including browser Back). page-transitions.css reads it.
// - Cup morph: Home's active signature becomes a Menu opening cup, for all nine.
// - Fallback entrance for browsers without cross-document view transitions.
// Navigation is never delayed or intercepted.
(() => {
  const page = document.documentElement.dataset.page;
  const ORDER = { index: 0, menu: 1, 'full-menu': 1.5, space: 2, order: 3, story: 4, contact: 5 };
  const pageOf = url => {
    try {
      const target = new URL(url, location.href);
      if (target.origin !== location.origin) return null;
      return target.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
    } catch { return null; }
  };
  const direction = (from, to) => ((ORDER[to] ?? 0) < (ORDER[from] ?? 0) ? 'back' : 'forward');
  const CUP_KEY = 'sa-cup-from-home';
  const nameCup = (figure, slug) => {
    if (!figure || !slug) return;
    figure.style.viewTransitionName = `cup-${slug}`;
    figure.style.viewTransitionClass = 'signature-cup';
  };

  addEventListener('pageswap', event => {
    try { sessionStorage.removeItem(CUP_KEY); } catch {}
    if (!event.viewTransition) return;
    const to = pageOf(event.activation?.entry?.url);
    // Leaving Home for Menu: the cup on stage travels with the visitor.
    if (page === 'index' && to === 'menu') {
      const slug = document.querySelector('[data-theatre-detail].is-active')?.dataset.slug;
      const cup = document.querySelector(`[data-theatre-cup][data-slug="${slug}"]`);
      const rect = cup?.getBoundingClientRect();
      if (slug && rect && rect.bottom > 0 && rect.top < innerHeight) {
        nameCup(cup, slug);
        try { sessionStorage.setItem(CUP_KEY, slug); } catch {}
      }
    }
  });

  // Deferred scripts can run after 'pagereveal' has fired; the active transition is
  // then picked up directly, so direction and cup names are never missed.
  let revealed = false;
  const onReveal = transition => {
    if (revealed || !transition) return;
    revealed = true;
    const from = pageOf(navigation?.activation?.from?.url);
    // Browser Back/Forward follows history; Visit → Home through the last panel
    // completes the loop, so it continues forward; everything else follows the nav order.
    const activation = navigation?.activation;
    let type = direction(from, page);
    if (activation?.navigationType === 'traverse' && activation.from && activation.entry) {
      type = activation.entry.index < activation.from.index ? 'back' : 'forward';
    } else if (from === 'contact' && page === 'index') {
      type = 'forward';
    }
    transition.types?.add(type);
    document.documentElement.dataset.navDirection = type;
    let slug = null;
    try { slug = sessionStorage.getItem(CUP_KEY); sessionStorage.removeItem(CUP_KEY); } catch {}

    // Arriving on Menu from Home: if the travelling cup isn't one of Menu's three,
    // the front cup takes its name for this transition, so it still morphs.
    if (page === 'menu' && from === 'index' && slug) {
      const cups = [...document.querySelectorAll('.menu-opening-cup')];
      if (!cups.some(cup => cup.style.viewTransitionName === `cup-${slug}`)) {
        const front = document.querySelector('.menu-opening-cup--front');
        const original = front?.style.viewTransitionName;
        nameCup(front, slug);
        transition.finished.catch(() => {}).finally(() => { if (front) front.style.viewTransitionName = original; });
      }
    }
    // Returning Home from Menu: Home's first cup receives the Menu cup of the same name.
    if (page === 'index' && from === 'menu') {
      const first = document.querySelector('[data-theatre-cup]');
      nameCup(first, first?.dataset.slug);
      transition.finished.catch(() => {}).finally(() => { if (first) first.style.viewTransitionName = ''; });
    }
  };
  addEventListener('pagereveal', event => onReveal(event.viewTransition));
  if (document.activeViewTransition) onReveal(document.activeViewTransition);

  // Fallback entrance where cross-document transitions are unavailable.
  if ('onpagereveal' in window && 'CSSViewTransitionRule' in window) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let entry;
  addEventListener('pageshow', event => {
    if (event.persisted || reduced.matches) return;
    entry = document.querySelector('main')?.animate([
      { opacity: .5, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'none' },
    ], { duration: 320, easing: window.SAMotion?.ease.out || 'ease-out' });
  });
  reduced.addEventListener('change', () => entry?.cancel());
})();
