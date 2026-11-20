document.documentElement.classList.remove('no-js');
const menuButton = document.querySelector('.nav-toggle');
const menu = document.querySelector('#site-nav');

if (menuButton && menu) {
  const closeMenu = () => {
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  });

  menu.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) closeMenu();
  });
}

document.querySelectorAll('[data-mailto-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const subject = form.dataset.subject;
    const recipient = form.dataset.recipient;
    const lines = Array.from(data.entries(), ([label, value]) => `${label}: ${String(value).trim() || 'Not specified'}`);
    const body = lines.join('\n');
    const href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.querySelector('.form-status').textContent = `Review and send your message in your email app. If it does not open, email ${recipient} directly.`;
    window.location.href = href;
  });
});

const reducedMotion = window.SAMotion.reduced;
const easeOut = window.SAMotion.ease.out;
const photoWheel = document.querySelector('[data-menu-wheel]');
if (photoWheel) {
  const slides = [...photoWheel.querySelectorAll('[data-wheel-slide]')];
  const count = photoWheel.querySelector('[data-wheel-count]');
  const announcement = photoWheel.querySelector('[data-wheel-announcement]');
  const jumps = [...photoWheel.querySelectorAll('[data-wheel-jump]')];
  let active = 0;
  let lastWheel = 0;
  let pointerStart = null;

  const preload = index => {
    const image = slides[(index + slides.length) % slides.length]?.querySelector('img');
    if (image) image.loading = 'eager';
  };
  const updateWheel = (next, instant = false) => {
    active = (next + slides.length) % slides.length;
    if (instant || reducedMotion.matches) photoWheel.classList.add('is-instant');
    slides.forEach((slide, index) => {
      const selected = index === active;
      slide.classList.toggle('is-active', selected);
      slide.classList.toggle('is-prev', index === (active - 1 + slides.length) % slides.length);
      slide.classList.toggle('is-next', index === (active + 1) % slides.length);
      slide.inert = !selected;
      slide.setAttribute('aria-hidden', String(!selected));
    });
    preload(active);
    preload(active + 1);
    preload(active - 1);
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    const title = slides[active].querySelector('h2')?.textContent.trim() || 'Photo';
    announcement.textContent = `${title}, photo ${active + 1} of ${slides.length}`;
    jumps.forEach((button, index) => {
      const start = Number(button.dataset.wheelJump);
      const end = index + 1 < jumps.length ? Number(jumps[index + 1].dataset.wheelJump) : slides.length;
      button.setAttribute('aria-pressed', String(active >= start && active < end));
    });
    if (instant || reducedMotion.matches) {
      requestAnimationFrame(() => requestAnimationFrame(() => photoWheel.classList.remove('is-instant')));
    }
  };

  photoWheel.classList.add('is-enhanced');
  updateWheel(0, true);
  photoWheel.querySelector('[data-wheel-prev]').addEventListener('click', () => updateWheel(active - 1));
  photoWheel.querySelector('[data-wheel-next]').addEventListener('click', () => updateWheel(active + 1));
  jumps.forEach(button => button.addEventListener('click', () => updateWheel(Number(button.dataset.wheelJump))));

  photoWheel.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = active - 1;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = active + 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = slides.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    updateWheel(next, true);
  });

  photoWheel.addEventListener('wheel', event => {
    if (!event.target.closest('.menu-wheel__slide-visual') || event.ctrlKey || Math.abs(event.deltaY) < 8) return;
    const direction = Math.sign(event.deltaY);
    if ((direction > 0 && active === slides.length - 1) || (direction < 0 && active === 0)) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel < 420) return;
    lastWheel = now;
    updateWheel(active + direction);
  }, { passive: false });

  photoWheel.addEventListener('pointerdown', event => {
    if (!event.target.closest('.menu-wheel__slide.is-active .menu-wheel__slide-visual')) return;
    pointerStart = { x: event.clientX, y: event.clientY, type: event.pointerType };
    photoWheel.classList.add('is-dragging');
  });
  photoWheel.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    const distance = pointerStart.type === 'touch' ? dx : Math.abs(dy) > Math.abs(dx) ? dy : dx;
    if (Math.abs(distance) > 45) updateWheel(active + (distance < 0 ? 1 : -1));
    pointerStart = null;
    photoWheel.classList.remove('is-dragging');
  });
  photoWheel.addEventListener('pointercancel', () => {
    pointerStart = null;
    photoWheel.classList.remove('is-dragging');
  });
}

document.querySelectorAll('[data-signature-showcase]').forEach(showcase => {
  const cups = [...showcase.querySelectorAll('[data-signature-cup]')];
  const copies = [...showcase.querySelectorAll('[data-signature-copy]')];
  const dots = [...showcase.querySelectorAll('[data-signature-jump]')];
  const flavors = [...showcase.querySelectorAll('[data-signature-flavor]')];
  const gesture = showcase.querySelector('[data-signature-gesture]');
  const count = showcase.querySelector('[data-signature-count]');
  const announcement = showcase.querySelector('[data-signature-announcement]');
  let active = 0;
  let drag = null;
  let suppressClickUntil = 0;
  let releaseFrame = 0;

  const update = (next, { instant = false, announce = true } = {}) => {
    const previous = active;
    active = (next + cups.length) % cups.length;
    const distance = Math.min((active - previous + cups.length) % cups.length, (previous - active + cups.length) % cups.length);
    showcase.style.setProperty('--signature-travel', distance > 1 ? '560ms' : '900ms');
    cancelAnimationFrame(releaseFrame);
    showcase.classList.toggle('is-instant', instant || reducedMotion.matches);
    flavors.forEach((flavor, index) => {
      flavor.classList.toggle('is-active', index === active);
      flavor.querySelectorAll('.signature-ingredient, .signature-stage-name').forEach(el => el.getAnimations().forEach(a => a.cancel()));
    });
    if (flavors[active] && previous !== active && !instant && !reducedMotion.matches) {
      flavors[active].querySelectorAll('.signature-ingredient').forEach((piece, i) => piece.animate([
        { opacity: 0, transform: `translate(${i % 2 ? 45 : -45}px, 35px) rotate(${i % 2 ? 35 : -35}deg) scale(.8)` },
        { opacity: 1, transform: 'translate(0, 0) rotate(0) scale(1)' },
      ], { duration: 800, delay: i * 45, fill: 'backwards', easing: easeOut }));
      flavors[active].querySelector('.signature-stage-name').animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550, easing: easeOut });
    }
    showcase.style.setProperty('--signature-tone', cups[active].dataset.tone);
    showcase.style.setProperty('--line-shift', `${(active % 3 - 1) * 14}px`);
    showcase.style.setProperty('--line-tilt', `${(active % 3 - 1) * 5}deg`);
    cups.forEach((cup, index) => {
      let offset = (index - active + cups.length) % cups.length;
      if (offset > cups.length / 2) offset -= cups.length;
      cup.style.setProperty('--offset', offset);
      cup.style.setProperty('--scale', offset === 0 ? '1' : '.58');
      cup.style.setProperty('--tilt', `${offset === 0 ? 0 : -Math.sign(offset) * 8}deg`);
      cup.style.setProperty('--opacity', offset === 0 ? '1' : Math.abs(offset) === 1 ? '.28' : '0');
      cup.style.pointerEvents = Math.abs(offset) <= 1 ? 'auto' : 'none';
      cup.setAttribute('aria-hidden', String(index !== active));
      if (Math.abs(offset) <= 1) cup.querySelector('img').loading = 'eager';
      copies[index].classList.toggle('is-active', index === active);
      copies[index].setAttribute('aria-hidden', String(index !== active));
      copies[index].inert = index !== active;
      copies[index].getAnimations().forEach(animation => animation.cancel());
      dots[index].setAttribute('aria-pressed', String(index === active));
    });
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cups.length).padStart(2, '0')}`;
    if (announce) {
      announcement.textContent = `${copies[active].dataset.name}, ${active + 1} of ${cups.length}`;
      if (!instant && !reducedMotion.matches) copies[active].animate(
        [{ opacity: .35 }, { opacity: 1 }],
        { duration: 320, easing: easeOut }
      );
    }
    if (instant) releaseFrame = requestAnimationFrame(() => requestAnimationFrame(() => showcase.classList.remove('is-instant')));
  };

  const activate = (next, event) => update(next, { instant: event.detail === 0 });
  showcase.querySelector('[data-signature-prev]').addEventListener('click', event => activate(active - 1, event));
  showcase.querySelector('[data-signature-next]').addEventListener('click', event => activate(active + 1, event));
  dots.forEach((dot, index) => dot.addEventListener('click', event => activate(index, event)));
  showcase.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? cups.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1);
    update(next, { instant: true });
  });
  gesture.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil) return;
    const cup = event.target.closest('[data-signature-cup]');
    if (cup) update(cups.indexOf(cup));
  });
  gesture.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, delta: 0, horizontal: false };
  });
  gesture.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.horizontal && Math.abs(dy) > Math.abs(dx) + 10) { drag = null; return; }
    if (!drag.horizontal && Math.abs(dx) > 8) {
      drag.horizontal = true;
      gesture.setPointerCapture(event.pointerId);
      showcase.classList.add('is-dragging');
    }
    if (drag.horizontal) {
      drag.delta = dx;
      showcase.style.setProperty('--drag', `${Math.max(-160, Math.min(160, dx))}px`);
    }
  });
  const finishDrag = (event, cancel = false) => {
    if (!drag || event.pointerId !== drag.id) return;
    const finished = drag;
    drag = null;
    showcase.classList.remove('is-dragging');
    showcase.style.setProperty('--drag', '0px');
    if (gesture.hasPointerCapture(event.pointerId)) gesture.releasePointerCapture(event.pointerId);
    if (finished.horizontal) {
      suppressClickUntil = Date.now() + 350;
      update(!cancel && Math.abs(finished.delta) > 45 ? active + (finished.delta < 0 ? 1 : -1) : active);
    }
  };
  gesture.addEventListener('pointerup', event => finishDrag(event));
  gesture.addEventListener('pointercancel', event => finishDrag(event, true));
  reducedMotion.addEventListener('change', () => update(active, { instant: true, announce: false }));
  update(0, { instant: true, announce: false });
  showcase.classList.add('is-ready');
});
