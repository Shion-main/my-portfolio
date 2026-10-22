// Native scroll choreography. Hero/carousel code remains independent.
(() => {
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  if (!chapters.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  const calm = () => reduced.matches || paused;
  const toggles = [...document.querySelectorAll('[data-journey-motion]')];
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => n * n * (3 - 2 * n);
  const records = chapters.map(section => ({
    section,
    headings: [...section.querySelectorAll('[data-motion-heading]')].map(element => ({ element, lines: [...element.querySelectorAll('.motion-line > span')] })),
    beans: [...section.querySelectorAll('.chapter-bean')],
    ingredients: [...section.querySelectorAll('[data-ingredient]')],
    portrait: section.querySelector('.space-portrait'),
    counter: section.querySelector('.space-counter'),
    coffee: section.querySelector('.floating-coffee'),
    ring: section.querySelector('.chapter-ring'),
    tracks: [...section.querySelectorAll('[data-passage-track]')],
    drift: section.querySelector('[data-journey-drift]'),
    photo: section.querySelector('.table-photo, .ideas-photo'),
    outline: section.querySelector('.ideas-outline'),
    arrival: section.querySelector('.arrival-backdrop'),
  }));
  let frame = 0;
  document.body.classList.add('journey-ready');
  const set = (element, values) => { if (element) Object.entries(values).forEach(([key, value]) => element.style.setProperty(key, value)); };
  const update = () => {
    frame = 0;
    const height = innerHeight;
    const mobile = innerWidth <= 540;
    // Read every visible composition before writing any transforms or masks.
    // Interleaving these reads with style updates forces repeated style flushes.
    const visibleRecords = records.flatMap(r => {
      const rect = r.section.getBoundingClientRect();
      if ((rect.top > height + 120 || rect.bottom < -120) && !calm()) return [];
      return [{ r, rect, headingTops: r.headings.map(h => h.element.getBoundingClientRect().top), photoTop: r.photo ? r.photo.offsetTop + rect.top : 0 }];
    });
    visibleRecords.forEach(({ r, rect, headingTops, photoTop }) => {
      const p = calm() ? .5 : clamp((height - rect.top) / (height + rect.height));
      const enter = calm() ? 1 : smooth(clamp((height - rect.top) / (height * .85)));
      const depth = calm() ? 0 : (p - .5) * (mobile ? 170 : 360);
      r.headings.forEach(({ lines }, headingIndex) => {
        const top = headingTops[headingIndex];
        const reveal = calm() ? 1 : clamp((height * .96 - top) / (height * .48));
        lines.forEach((line, index) => {
          const amount = smooth(clamp((reveal - index * .1) / .75));
          line.style.transform = `translate3d(${(1 - amount) * (index % 2 ? -25 : 25)}px, ${(1 - amount) * 110}%, 0) rotate(${(1 - amount) * 4}deg)`;
        });
      });
      r.beans.forEach((bean, index) => {
        bean.style.translate = `${depth * (index % 2 ? -.25 : .3)}px ${depth * (index % 2 ? -1 : .75)}px`;
        bean.style.rotate = `${[28, -38, 85, 125][index] + (calm() ? 0 : (p - .5) * 95)}deg`;
      });
      r.ingredients.forEach((element, index) => {
        const direction = index % 2 ? -1 : 1;
        element.style.transform = `translate3d(${depth * .18 * direction}px, ${depth * -.45 * direction}px, 0) rotate(${calm() ? 0 : (p - .5) * direction * 65}deg)`;
      });
      if (r.portrait) {
        const radius = calm() ? 48 : 48 * (1 - smooth(clamp((p - .18) / .47)));
        set(r.portrait, { 'border-radius': `${radius}% ${radius}% 4px 4px`, transform: `translate3d(${(1 - enter) * (mobile ? 20 : 110)}px, ${depth * -.14}px, 0) rotate(${(1 - enter) * 6}deg)` });
        r.portrait.querySelector('img').style.transform = calm() ? 'none' : `scale(${1.14 - p * .1}) translateY(${depth * .075}px)`;
      }
      if (r.counter) r.counter.style.transform = `translate3d(${(1 - enter) * -65}px, ${depth * -.34}px, 0) rotate(${calm() ? 0 : (p - .5) * 18}deg)`;
      if (r.coffee) r.coffee.style.transform = `translate3d(${depth * -.18}px, ${depth * -.8}px, 0) rotate(${calm() ? 0 : (p - .5) * 100}deg)`;
      if (r.ring) r.ring.style.transform = `translateY(${depth * .4}px) scale(${.85 + p * .35})`;
      r.tracks.forEach((track, index) => { track.style.transform = `translateX(${depth * (index ? -1.7 : 1.7)}px)`; });
      if (r.drift) r.drift.style.transform = `translateX(${depth * -.7}px)`;
      if (r.photo) {
        // offsetTop is unaffected by the transforms being driven here.
        const arrival = calm() ? 1 : smooth(clamp((height - photoTop) / (height * .85)));
        const food = r.photo.classList.contains('table-photo');
        set(r.photo, {
          '--photo-x': `${(1 - arrival) * (mobile ? 25 : food ? 130 : -110)}px`,
          '--photo-y': `${depth * (food ? -.12 : .12)}px`,
          '--photo-rotation': `${food ? 4 + (1 - arrival) * 12 - (p - .5) * 9 : (1 - arrival) * -7}deg`,
          '--photo-crop': `${(1 - arrival) * 18}%`,
          '--back-rotation': `${-10 - (1 - arrival) * 15}deg`,
          '--back-x': `${(1 - arrival) * -45}px`,
        });
      }
      set(r.outline, { '--ideas-radius': `${(1 - enter) * 160}px`, '--ideas-rotation': `${(1 - enter) * 8}deg`, '--ideas-scale': String(.83 + enter * .17) });
      if (r.arrival) {
        set(r.arrival, { '--arrival-inset': `${(1 - enter) * 15}%`, '--arrival-radius': `${(1 - enter) * 250}px` });
        r.arrival.querySelector('img').style.transform = calm() ? 'none' : `scale(${1.2 - enter * .08}) translateY(${depth * .1}px)`;
      }
    });
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  const visibility = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('is-in-view', entry.isIntersecting && !document.hidden);
  }), { rootMargin: '50px' });
  chapters.forEach(chapter => visibility.observe(chapter));
  document.addEventListener('visibilitychange', () => {
    records.forEach(r => {
      const rect = r.section.getBoundingClientRect();
      r.section.classList.toggle('is-in-view', !document.hidden && rect.top < innerHeight && rect.bottom > 0);
    });
  });
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll('[data-journey-reveal]').forEach(element => reveal.observe(element));
  records.filter(r => r.photo).forEach(r => {
    const reset = () => set(r.photo, { '--pointer-x': '0deg', '--pointer-y': '0deg' });
    r.section.addEventListener('pointermove', event => {
      if (calm() || !pointer.matches) return;
      const rect = r.section.getBoundingClientRect();
      set(r.photo, { '--pointer-x': `${((event.clientX - rect.left) / rect.width - .5) * 6}deg`, '--pointer-y': `${((event.clientY - rect.top) / rect.height - .5) * -4}deg` });
    }, { passive: true });
    r.section.addEventListener('pointerleave', reset);
    reduced.addEventListener('change', reset);
  });
  toggles.forEach(toggle => toggle.addEventListener('click', () => {
    paused = !paused;
    document.body.classList.toggle('journey-paused', paused);
    toggles.forEach(button => {
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Resume motion' : 'Pause motion';
    });
    document.dispatchEvent(new CustomEvent('site-motion-change'));
    if (paused) records.forEach(r => set(r.photo, { '--pointer-x': '0deg', '--pointer-y': '0deg' }));
    update();
  }));
  reduced.addEventListener('change', request);
  update();
})();
