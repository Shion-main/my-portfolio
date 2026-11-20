// The Aperture morph (planning/MOTION-SYSTEM-PLAN.md §2, phase 3).
// Each page marks one opening window with .aperture (view-transition-name: aperture).
// The browser morphs its box between pages; this script adds the shape: the old
// page records its corner radii on the way out, the new page animates the morphing
// group from those radii to its own. An off-screen window is left out of the morph,
// so nothing flies in from outside the viewport.
(() => {
  const M = window.SAMotion;
  const KEY = 'sa-aperture-from';
  const aperture = () => document.querySelector('.aperture');
  const visible = el => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  };
  // Resolve border-radius to pixels of this box, so the morph interpolates cleanly.
  const radiusOf = el => {
    const style = getComputedStyle(el);
    const { width, height } = el.getBoundingClientRect();
    const corner = value => {
      const [x, y = x] = value.split(' ');
      const px = (v, size) => (v.endsWith('%') ? parseFloat(v) / 100 * size : parseFloat(v) || 0);
      return [px(x, width), px(y, height)];
    };
    const corners = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(c => corner(style[`border${c}Radius`]));
    return `${corners.map(c => `${c[0].toFixed(1)}px`).join(' ')} / ${corners.map(c => `${c[1].toFixed(1)}px`).join(' ')}`;
  };
  const off = el => { if (el) el.style.viewTransitionName = 'none'; };
  const HANDOFF = 'sa-title-handoff';

  // Arriving through a next-chapter panel: the headline is already on screen (it morphed
  // in), so this page skips its own headline entrance (title-handoff, see aperture.css).
  try {
    const handedTo = sessionStorage.getItem(HANDOFF);
    sessionStorage.removeItem(HANDOFF);
    if (handedTo && handedTo === document.documentElement.dataset.page) document.documentElement.classList.add('title-handoff');
  } catch {}

  const pageOf = url => {
    try { return new URL(url, location.href).pathname.split('/').pop().replace(/\.html$/, '') || 'index'; } catch { return null; }
  };

  addEventListener('pageswap', event => {
    try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(HANDOFF); } catch {}
    if (!event.viewTransition) return;
    // Leaving through the next-chapter panel: its window and headline are the next
    // page's opening, so they (not this page's own opening) carry into the morph.
    const to = pageOf(event.activation?.entry?.url);
    const panel = document.querySelector('[data-next-chapter] .next-chapter__link');
    const panelWindow = panel?.querySelector('.next-chapter__window');
    if (panel && panel.dataset.nextPage === to && visible(panelWindow)) {
      off(aperture());
      panelWindow.style.viewTransitionName = 'aperture';
      const title = panel.querySelector('.next-chapter__title');
      // Home's headline is the carousel, not a phrase, so it isn't morphed into.
      if (title && to !== 'index') {
        title.style.viewTransitionName = `title-${to}`;
        title.style.viewTransitionClass = 'hero-title';
      }
      try {
        sessionStorage.setItem(KEY, radiusOf(panelWindow));
        if (title && to !== 'index') sessionStorage.setItem(HANDOFF, to);
      } catch {}
      return;
    }
    const el = aperture();
    if (!visible(el)) { off(el); return; }
    try { sessionStorage.setItem(KEY, radiusOf(el)); } catch {}
  });

  let revealed = false;
  const onReveal = transition => {
    if (revealed || !transition) return;
    revealed = true;
    let from = null;
    try { from = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch {}
    const el = aperture();
    if (!visible(el)) { off(el); return; }
    if (!from || M?.reduced.matches) return;
    const to = radiusOf(el);
    transition.ready.then(() => {
      document.documentElement.animate({ borderRadius: [from, to] }, {
        duration: 720,
        easing: M?.ease.inOut || 'ease-in-out',
        pseudoElement: '::view-transition-group(aperture)',
        fill: 'both',
      });
    }).catch(() => {});
  };
  // As in page-transitions.js: catch a transition that started before this script ran.
  addEventListener('pagereveal', event => onReveal(event.viewTransition));
  if (document.activeViewTransition) onReveal(document.activeViewTransition);
})();
