// Cups stay in one scene and follow a shallow orbit into the foreground.
(() => {
  const theatre = document.querySelector('[data-product-theatre]');
  if (!theatre) return;
  const scene = theatre.querySelector('[data-theatre-gesture]');
  const cups = [...theatre.querySelectorAll('[data-theatre-cup]')];
  // Decode even offstage products before their first transition into the scene.
  const flavors = [...theatre.querySelectorAll('[data-theatre-ingredients]')];
  const productImagesReady = Promise.all([...cups.map(cup => cup.querySelector('img')), ...flavors.map(group => group.querySelector('img'))].map(img => img.decode().catch(() => {})));
  const titles = [...theatre.querySelectorAll('[data-theatre-title]')];
  const details = [...theatre.querySelectorAll('[data-theatre-detail]')];
  const jumps = [...theatre.querySelectorAll('[data-theatre-jump]')];
  const beans = [...theatre.querySelectorAll('[data-theatre-bean]')];
  const count = theatre.querySelector('[data-theatre-count]');
  const announcement = theatre.querySelector('[data-theatre-announcement]');
  const cupLayer = theatre.querySelector('.theatre-cups');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const ease = 'cubic-bezier(.55,0,.2,1)';
  let active = 0;
  let hasInteracted = false;
  let drag = null;
  let suppressClick = 0;
  let releaseFrame = 0;
  let lastWidth = scene.clientWidth;

  const animate = (element, frames, options) => {
    if (motion.matches || !element.animate) return;
    const animation = element.animate(frames, { fill: 'both', ...options });
    animations.add(animation);
    const release = () => animations.delete(animation);
    animation.onfinish = () => { release(); animation.cancel(); };
    animation.oncancel = release;
    return animation;
  };
  const cancel = element => element.getAnimations().forEach(animation => animation.cancel());
  const offsetOf = (index, selected) => {
    let offset = (index - selected + cups.length) % cups.length;
    if (offset > cups.length / 2) offset -= cups.length;
    return offset;
  };
  const slot = offset => {
    const mobile = scene.clientWidth < 540;
    const spacing = scene.clientWidth * (mobile ? .46 : .34);
    const distance = Math.abs(offset);
    return {
      x: offset * spacing,
      y: distance === 0 ? 0 : distance === 1 ? 28 : 60,
      scale: distance === 0 ? 1 : distance === 1 ? .64 : .38,
      angle: distance === 0 ? -6 : offset < 0 ? -19 : 16,
      opacity: distance < 2 ? 1 : 0,
    };
  };
  const transform = s => `translate(-50%, -50%) translate(${s.x}px, ${s.y}px) rotate(${s.angle}deg) scale(${s.scale})`;

  const update = (next, { instant = false, opening = false, announce = true, quick = false } = {}) => {
    if (quick && (next + cups.length) % cups.length === active) return;
    if (announce) hasInteracted = true;
    cancelAnimationFrame(releaseFrame);
    theatre.classList.toggle('is-instant', instant || motion.matches);
    if (instant) animations.forEach(animation => animation.cancel());
    const previous = active;
    active = (next + cups.length) % cups.length;
    let distance = (active - previous + cups.length) % cups.length;
    if (distance > cups.length / 2) distance -= cups.length;
    const direction = Math.sign(distance) || 1;
    const duration = opening ? 1250 : quick ? Math.max(440, 650 - Math.abs(distance) * 60) : 1050;
    const shouldAnimate = !instant && !motion.matches;
    theatre.dataset.transitionDuration = String(shouldAnimate ? duration : 0);
    theatre.dataset.active = String(active);
    scene.classList.remove('is-dragging');
    scene.style.removeProperty('--theatre-drag');
    cancel(cupLayer);
    cups.forEach((cup, index) => {
      const offset = offsetOf(index, active);
      const oldOffset = offsetOf(index, previous);
      const target = slot(offset);
      let destination = target;
      const old = getComputedStyle(cup);
      const start = { transform: old.transform, opacity: old.opacity };
      const matrix = new DOMMatrixReadOnly(old.transform === 'none' ? undefined : old.transform);
      let startPose = {
        x: matrix.e + cup.clientWidth / 2, y: matrix.f + cup.clientHeight / 2,
        scale: Math.hypot(matrix.a, matrix.b), angle: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
      };
      cancel(cup);
      cup.style.transform = transform(target);
      cup.style.opacity = String(target.opacity);
      cup.style.zIndex = offset === 0 ? '5' : offset > 0 ? '3' : '2';
      cup.style.pointerEvents = Math.abs(offset) < 2 ? 'auto' : 'none';
      cup.setAttribute('aria-hidden', String(offset !== 0));
      cup.dataset.position = offset === 0 ? 'center' : offset === -1 ? 'left' : offset === 1 ? 'right' : 'offstage';
      if (!shouldAnimate || (Math.abs(offset) > 1 && Math.abs(oldOffset) > 1)) return;
      // Bring a distant selection through the adjacent slot at a faster pace.
      if (Math.abs(oldOffset - offset) > 1 && Math.abs(oldOffset) > 1) {
        startPose = offset === 0 ? slot(direction) : { ...target, x: target.x * 1.3, scale: .5 };
        start.transform = transform(startPose);
        start.opacity = 0;
      }
      if (quick && Math.abs(distance) > 1 && target.opacity === 0 && Math.abs(oldOffset) < 2) {
        destination = { ...slot(-direction), x: slot(-direction).x * 1.35, scale: .48, opacity: 0 };
      }
      if (opening) {
        startPose = { ...target, x: target.x * 1.25, y: target.y + 120, angle: target.angle - 12, scale: target.scale * .85 };
        start.transform = transform(startPose);
        start.opacity = 0;
      }
      const settle = { ...destination, y: destination.y - (offset === 0 ? 10 : 8), angle: destination.angle + (offset === 0 ? 2 : -direction * 2), scale: destination.scale * 1.015 };
      const arc = {
        x: (startPose.x + destination.x) / 2,
        y: (startPose.y + destination.y) / 2 - (opening ? 12 : 45),
        scale: (startPose.scale + destination.scale) / 2,
        angle: (startPose.angle + destination.angle) / 2 - direction * 4,
      };
      animate(cup, [start, { transform: transform(arc), opacity: destination.opacity, offset: .45 }, { transform: transform(settle), opacity: destination.opacity, offset: .84 }, { transform: transform(destination), opacity: destination.opacity }], {
        duration, delay: opening ? (offset === 0 ? 100 : 180) : quick && Math.abs(oldOffset) > 1 && Math.abs(offset) === 1 ? duration * .12 : 0, easing: ease,
      });
    });
    flavors.forEach((group, index) => {
      const selected = index === active;
      const wasVisible = group.classList.contains('is-active') || group.classList.contains('is-exiting');
      const images = [...group.querySelectorAll('img')];
      const before = images.map(img => ({ transform: getComputedStyle(img).transform, opacity: getComputedStyle(img).opacity }));
      images.forEach(cancel);
      group.classList.toggle('is-active', selected);
      group.classList.remove('is-exiting');
      if (!shouldAnimate || (active === previous && !opening)) {
        images.forEach(img => { img.style.transform = 'none'; img.style.opacity = selected ? '1' : '0'; });
        return;
      }
      if (!selected && !wasVisible) return;
      group.classList.toggle('is-exiting', !selected);
      images.forEach((img, position) => {
        const side = position % 2 ? 1 : -1;
        const incoming = { transform: `translate(${direction * (70 + position * 15)}px, ${side * 55}px) rotate(${direction * -28}deg) scale(.8)`, opacity: 0 };
        const end = selected ? { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 }
          : { transform: `translate(${-direction * (85 + position * 12)}px, ${side * -45}px) rotate(${direction * 32}deg) scale(.85)`, opacity: 0 };
        img.style.transform = end.transform;
        img.style.opacity = String(end.opacity);
        const animation = animate(img, [selected && (!wasVisible || opening) ? incoming : before[position], end], {
          duration: duration * (selected ? .85 : .4),
          delay: selected ? duration * .1 + position * (quick ? 12 : 30) : 0,
          easing: selected ? 'cubic-bezier(.2,.65,.2,1)' : window.SAMotion.ease.in,
        });
        if (!selected && position === images.length - 1) animation?.addEventListener('finish', () => group.classList.remove('is-exiting'));
      });
    });
    titles.forEach((title, index) => {
      const lines = [...title.children].map(line => line.firstElementChild);
      const before = lines.map(line => ({ transform: getComputedStyle(line).transform, opacity: getComputedStyle(line).opacity }));
      lines.forEach(line => { cancel(line); line.style.transform = 'translateY(0)'; line.style.opacity = '1'; });
      title.classList.remove('is-exiting');
      const selected = index === active;
      title.classList.toggle('is-active', selected);
      title.setAttribute('aria-hidden', String(!selected));
      if (index === previous && active !== previous && shouldAnimate) {
        title.classList.add('is-exiting');
        lines.forEach((line, lineIndex) => {
          const end = { transform: `translateY(${-direction * 110}%)`, opacity: 0 };
          line.style.transform = end.transform;
          line.style.opacity = '0';
          const animation = animate(line, [before[lineIndex], end], { duration: duration * .25, delay: lineIndex * (quick ? 15 : 30), easing: 'cubic-bezier(.4,0,.2,1)' });
          if (lineIndex === lines.length - 1) animation?.addEventListener('finish', () => title.classList.remove('is-exiting'));
        });
      }
      if (selected && shouldAnimate && (active !== previous || opening)) {
        lines.forEach((line, lineIndex) => {
          animate(line, [
            { transform: `translateY(${direction * 110}%)`, opacity: .2 },
            { transform: 'translateY(0)', opacity: 1 },
          ], { duration: duration * .68, delay: (opening ? 80 : duration * .24) + lineIndex * (quick ? 30 : 70), easing: 'cubic-bezier(.4,0,.2,1)' });
        });
      }
    });
    details.forEach((detail, index) => {
      cancel(detail);
      const selected = index === active;
      detail.classList.toggle('is-active', selected);
      detail.inert = !selected;
      detail.setAttribute('aria-hidden', String(!selected));
      if (selected && shouldAnimate && active !== previous) animate(detail, [
        { transform: `translateY(${direction * 22}px)`, opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ], { duration: duration * .6, delay: duration * .18, easing: 'cubic-bezier(.4,0,.2,1)' });
      jumps[index].setAttribute('aria-pressed', String(selected));
    });
    if (shouldAnimate && (active !== previous || opening)) beans.forEach((bean, index) => {
      const img = bean.firstElementChild;
      const before = getComputedStyle(img).transform;
      cancel(img);
      const turn = (active % 3 - 1) * (index % 2 ? 12 : -12);
      const end = `translate(${turn}px, ${-Math.abs(turn) * .7}px) rotate(${turn}deg)`;
      img.style.transform = end;
      animate(img, [{ transform: opening ? `translateY(${index % 2 ? -60 : 70}px) rotate(-20deg)` : before, opacity: opening ? 0 : 1 }, { transform: end, opacity: 1 }], { duration: duration + (quick ? index * 10 : index * 30), delay: opening ? 170 : 0, easing: ease });
    });
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cups.length).padStart(2, '0')}`;
    if (announce) announcement.textContent = `${cups[active].dataset.name}, coffee ${active + 1} of ${cups.length}`;
    if (instant && !motion.matches) {
      // Commit selector styles before re-enabling transitions on a later frame.
      void theatre.offsetWidth;
      releaseFrame = requestAnimationFrame(() => {
        releaseFrame = requestAnimationFrame(() => theatre.classList.remove('is-instant'));
      });
    }
  };

  theatre.querySelector('[data-theatre-prev]').addEventListener('click', event => update(active - 1, { instant: event.detail === 0 }));
  theatre.querySelector('[data-theatre-next]').addEventListener('click', event => update(active + 1, { instant: event.detail === 0 }));
  jumps.forEach((button, index) => button.addEventListener('click', () => update(index, { quick: true })));
  scene.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    update(event.key === 'Home' ? 0 : event.key === 'End' ? cups.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1), { instant: true });
  });
  scene.addEventListener('click', event => {
    if (performance.now() < suppressClick) return;
    const cup = event.target.closest('[data-theatre-cup]');
    if (cup && cup.dataset.position !== 'center') update(cups.indexOf(cup));
  });
  scene.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('button, a')) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, delta: 0, horizontal: false };
  });
  scene.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.horizontal && Math.abs(dy) > Math.abs(dx) + 10) { drag = null; return; }
    if (!drag.horizontal && Math.abs(dx) > 8) {
      drag.horizontal = true;
      scene.setPointerCapture(event.pointerId);
      scene.classList.add('is-dragging');
    }
    if (drag.horizontal) {
      drag.delta = dx;
      scene.style.setProperty('--theatre-drag', `${Math.max(-120, Math.min(120, dx * .55))}px`);
    }
  });
  const finishDrag = (event, cancelled = false) => {
    if (!drag || event.pointerId !== drag.id) return;
    const finished = drag;
    drag = null;
    if (scene.hasPointerCapture(event.pointerId)) scene.releasePointerCapture(event.pointerId);
    const before = getComputedStyle(cupLayer).transform;
    scene.classList.remove('is-dragging');
    scene.style.removeProperty('--theatre-drag');
    if (!finished.horizontal) return;
    suppressClick = performance.now() + 400;
    update(!cancelled && Math.abs(finished.delta) > 45 ? active + (finished.delta < 0 ? 1 : -1) : active);
    animate(cupLayer, [{ transform: before }, { transform: getComputedStyle(cupLayer).transform }], { duration: 450, easing: ease });
  };
  scene.addEventListener('pointerup', event => finishDrag(event));
  scene.addEventListener('pointercancel', event => finishDrag(event, true));
  scene.addEventListener('lostpointercapture', event => { if (drag) finishDrag(event, true); });

  // Scroll depth runs in the shared frame loop (motion.js): read first, then write.
  window.SAMotion.scene({
    read: () => scene.getBoundingClientRect(),
    write: ({ height }, rect) => {
      if (motion.matches || rect.bottom < 0 || rect.top > height) return;
      const travel = Math.max(0, Math.min(1, -rect.top / rect.height));
      cupLayer.style.setProperty('--scene-parallax', `${travel * 45}px`);
      beans.forEach((bean, index) => bean.style.setProperty('--bean-parallax', `${travel * (index === 2 || index === 6 ? -100 : 35)}px`));
      theatre.style.setProperty('--ingredient-parallax', `${travel * -65}px`);
    },
  });
  window.addEventListener('resize', () => {
    if (scene.clientWidth !== lastWidth) {
      lastWidth = scene.clientWidth;
      update(active, { instant: true, announce: false });
    }
  });
  const resetMotion = () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
    cupLayer.style.removeProperty('--scene-parallax');
    theatre.style.removeProperty('--ingredient-parallax');
    beans.forEach(bean => { bean.style.removeProperty('--bean-parallax'); bean.firstElementChild.style.removeProperty('transform'); });
    update(active, { instant: true, announce: false });
  };
  motion.addEventListener('change', resetMotion);
  // Ambient motion is independent of the finite cup/ingredient transitions.
  window.SAMotion.inView(scene, { host: theatre });
  theatre.classList.add('is-ready');
  update(0, { instant: true, announce: false });
  productImagesReady.then(() => {
    if (motion.matches || hasInteracted) return;
    update(0, { opening: true, announce: false });
    animate(theatre.querySelector('.theatre-arch'), [{ transform: 'scaleX(.85)' }, { transform: 'scaleX(1)' }], { duration: 1200, easing: ease });
  });
})();
