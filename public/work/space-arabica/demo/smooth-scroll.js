// Ease stepped wheel input using the real document scroll position.
// Touch momentum, small trackpad deltas, keyboard, anchors and nested scroll stay native.
(() => {
  if (!document.body.matches('.page-index, .page-menu, .page-full-menu, .page-space, .page-story, .page-contact')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let target = scrollY;
  let position = scrollY;
  let written = scrollY;
  let previousTime = 0;
  let direction = 0;
  const limit = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  let maximum = limit();
  // Content sizing can change when photos/fonts load. Keep geometry reads out of the glide loop.
  const sizeObserver = new ResizeObserver(() => { maximum = limit(); });
  sizeObserver.observe(document.body);
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    direction = 0;
    target = position = written = scrollY;
  };
  const disabled = () => reduced.matches || !finePointer.matches || document.hidden || document.body.matches('.journey-paused, .menu-motion-paused, .menu-open');
  const tick = now => {
    if (disabled()) { stop(); return; }
    const dt = Math.min(48, Math.max(1, now - previousTime));
    previousTime = now;
    target = Math.max(0, Math.min(maximum, target));
    // Time-based damping keeps the same response at 60 and 120 Hz.
    position += (target - position) * (1 - Math.exp(-dt / 115));
    const settled = Math.abs(target - position) < .6;
    if (settled) position = target;
    scrollTo({ top: position, behavior: 'instant' });
    written = scrollY;
    if (settled) { frame = 0; direction = 0; }
    else frame = requestAnimationFrame(tick);
  };
  const hasNativeTarget = element => {
    for (let node = element instanceof Element ? element : null; node && node !== document.body; node = node.parentElement) {
      if (node.matches('textarea, select, input, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [data-native-scroll]')) return true;
      if (node.scrollHeight > node.clientHeight + 1 && /auto|scroll|overlay/.test(getComputedStyle(node).overflowY)) return true;
    }
    return false;
  };
  addEventListener('wheel', event => {
    if (disabled() || event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || hasNativeTarget(event.target)) { stop(); return; }
    // Fine trackpad input already includes native momentum; don't ease it twice.
    if (event.deltaMode === 0 && Math.abs(event.deltaY) < 50) { stop(); return; }
    const delta = event.deltaY * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1);
    if (!delta) return;
    const nextDirection = Math.sign(delta);
    if (!frame || nextDirection !== direction) target = position = scrollY;
    direction = nextDirection;
    maximum = limit();
    const next = Math.max(0, Math.min(maximum, target + delta));
    if (Math.abs(next - scrollY) < .6) { stop(); return; }
    event.preventDefault();
    target = next;
    if (!frame) {
      written = scrollY;
      previousTime = performance.now() - 16;
      frame = requestAnimationFrame(tick);
    }
  }, { passive: false });
  // New input and browser navigation take control immediately, without catch-up.
  addEventListener('scroll', () => { if (frame && Math.abs(scrollY - written) > 2) stop(); }, { passive: true });
  addEventListener('pointerdown', stop, { passive: true });
  addEventListener('touchstart', stop, { passive: true });
  addEventListener('keydown', event => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape', 'Tab'].includes(event.key)) stop(); });
  document.addEventListener('click', event => { if (event.target instanceof Element && event.target.closest('a')) stop(); }, true);
  addEventListener('resize', () => { maximum = limit(); stop(); });
  addEventListener('hashchange', stop);
  addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', stop);
  document.addEventListener('site-motion-change', stop);
  reduced.addEventListener('change', stop);
  finePointer.addEventListener('change', stop);
})();
