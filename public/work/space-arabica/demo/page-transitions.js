// Progressive entry fallback for browsers without cross-document transitions.
// Navigation is never delayed or intercepted, including modifier clicks and external links.
(() => {
  if ('onpagereveal' in window && 'CSSViewTransitionRule' in window) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let entry;
  addEventListener('pageshow', event => {
    if (event.persisted || reduced.matches) return;
    entry = document.querySelector('main')?.animate([
      { opacity: .5, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'none' },
    ], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
  });
  reduced.addEventListener('change', () => entry?.cancel());
})();
