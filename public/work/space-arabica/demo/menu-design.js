(() => {
  if (!document.body.matches('.page-menu, .page-full-menu')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.menu-closing, .menu-wheel-section').forEach(el => el.setAttribute('data-menu-scene', ''));
  const headings = [...document.querySelectorAll('.menu-opening h1, .full-menu-opening h1, .signature-menu__heading h2, .menu-editorial h2, .menu-catalog__group-head h2, .menu-closing h2, .menu-wheel-section__intro h2')];
  headings.forEach(heading => {
    const fragments = [[]];
    [...heading.childNodes].forEach(node => {
      if (node.nodeName === 'BR') fragments.push([]);
      else fragments.at(-1).push(node);
    });
    heading.replaceChildren(...fragments.map(nodes => {
      const line = document.createElement('span');
      line.className = 'menu-motion-line';
      const inner = document.createElement('span');
      inner.append(...nodes);
      line.append(inner);
      return line;
    }));
  });
  const scenes = [...document.querySelectorAll('[data-menu-scene]')];
  const toggle = document.querySelector('[data-menu-motion]');
  let paused = false;
  let frame = 0;
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => n * n * (3 - 2 * n);
  const compositions = scenes.map(scene => ({
    scene,
    headings: headings.filter(h => h.closest('[data-menu-scene]') === scene),
    photo: scene.querySelector('.menu-editorial-photo, .catalog-heading-photo'),
    inset: scene.querySelector('.menu-inset-photo, .catalog-inset-photo'),
    orbit: scene.querySelector('.menu-art-orbit, .menu-opening-orbit, .full-menu-opening-frame'),
    cups: [...scene.querySelectorAll('.menu-opening-cup, .full-menu-opening-art > figure')],
    tracks: [...scene.querySelectorAll('.menu-type-track')],
    coffee: scene.querySelector('.menu-passage-coffee'),
    accents: [...scene.querySelectorAll('.menu-accent')],
  }));
  document.body.classList.add('menu-motion-ready');
  const update = () => {
    frame = 0;
    const calm = reduced.matches || paused;
    const mobile = innerWidth <= 600;
    // Read scene/heading geometry in a batch, then write only visual transforms.
    const records = compositions.flatMap(r => {
      const rect = r.scene.getBoundingClientRect();
      if (!calm && (rect.bottom < -150 || rect.top > innerHeight + 150)) return [];
      return [{ r, rect, headingTops: r.headings.map(h => h.getBoundingClientRect().top) }];
    });
    records.forEach(({ r, rect, headingTops }) => {
      const progress = calm ? .5 : clamp((innerHeight - rect.top) / (innerHeight + rect.height));
      const enter = calm ? 1 : smooth(clamp((innerHeight - rect.top) / (innerHeight * .8)));
      const depth = calm ? 0 : (progress - .5) * (mobile ? 130 : 270);
      r.headings.forEach((heading, h) => {
        const reveal = calm ? 1 : clamp((innerHeight * .98 - headingTops[h]) / (innerHeight * .42));
        [...heading.querySelectorAll('.menu-motion-line > span')].forEach((line, i) => {
          const amount = smooth(clamp((reveal - i * .08) / .82));
          line.style.transform = `translate3d(${(1 - amount) * (i % 2 ? -25 : 25)}px, ${(1 - amount) * 105}%, 0) rotate(${(1 - amount) * 3}deg)`;
        });
      });
      if (r.photo) {
        r.photo.style.setProperty('--menu-photo-y', `${depth * -.3}px`);
        r.photo.style.transform = `translate3d(${(1 - enter) * (mobile ? 22 : 85)}px, ${depth * -.3}px, 0) rotate(${-4 + (1 - enter) * 14 + (progress - .5) * 8}deg) scale(${.9 + enter * .1})`;
        r.photo.style.setProperty('--frame-turn', `${-10 - (1 - enter) * 15}deg`);
      }
      if (r.inset) r.inset.style.transform = `translate3d(${(1 - enter) * -28}px, ${depth * -.48}px, 0) rotate(${depth * .08}deg)`;
      if (r.orbit) r.orbit.style.transform = `rotate(${depth * .12}deg) scale(${.88 + enter * .12})`;
      r.cups.forEach((cup, i) => {
        const side = i === 1 ? -1 : 1;
        cup.style.transform = `translate3d(${depth * side * .1}px, ${depth * (i === 1 ? -.35 : .3)}px, 0) rotate(calc(var(--cup-rest, 0deg) + ${depth * side * .06}deg))`;
      });
      r.accents.forEach((accent, i) => { accent.style.transform = `translate3d(${depth * (i % 2 ? -.05 : .05)}px, ${depth * (i % 2 ? -.18 : .18)}px, 0)`; });
      r.tracks.forEach((track, i) => { track.style.transform = `translateX(${depth * (i ? -1.5 : 1.5)}px)`; });
      if (r.coffee) r.coffee.style.transform = `translateY(${depth * -.3}px) rotate(${depth * .25}deg)`;
    });
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting && !document.hidden)));
  scenes.forEach(scene => observer.observe(scene));
  document.addEventListener('visibilitychange', () => scenes.forEach(scene => {
    const rect = scene.getBoundingClientRect();
    scene.classList.toggle('is-in-view', !document.hidden && rect.bottom > 0 && rect.top < innerHeight);
  }));
  toggle?.addEventListener('click', () => {
    paused = !paused;
    document.body.classList.toggle('menu-motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
    document.dispatchEvent(new CustomEvent('site-motion-change'));
    if (paused) document.querySelectorAll('[data-reveal]').forEach(el => el.getAnimations().forEach(animation => animation.finish()));
    update();
  });
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  reduced.addEventListener('change', request);
  const entryAnimations = [];
  if (!reduced.matches) {
    const opening = document.querySelector('.menu-opening, .full-menu-opening');
    opening.querySelectorAll('.menu-motion-line > span').forEach((line, index) => {
      entryAnimations.push(line.animate([{ transform: 'translateY(105%) rotate(3deg)' }, { transform: 'translateY(0) rotate(0)' }], { duration: 850, delay: index * 90, easing: 'cubic-bezier(.22,1,.36,1)' }));
    });
    opening.querySelectorAll('figure img').forEach((img, i) => {
      entryAnimations.push(img.animate([{ opacity: 0, transform: `translateY(80px) rotate(${i % 2 ? -16 : 16}deg) scale(.88)` }, { opacity: 1, transform: 'translateY(0) rotate(0) scale(1)' }], { duration: 1150, delay: 120 + i * 95, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    });
  }
  const finishEntry = () => { if (reduced.matches || paused) entryAnimations.forEach(animation => animation.finish()); };
  reduced.addEventListener('change', finishEntry);
  document.addEventListener('site-motion-change', finishEntry);
  const categoryLinks = [...document.querySelectorAll('.menu-catalog__nav a')];
  const targets = categoryLinks.map(link => document.querySelector(link.hash));
  if (targets.length) {
    const dock = document.querySelector('.menu-jump');
    let categoryFrame = 0;
    const markCategory = () => {
      categoryFrame = 0;
      const top = document.querySelector('.site-header').getBoundingClientRect().bottom + 48;
      // Keep the opening's actions clear; offer category navigation in the catalog.
      const showDock = targets[0].getBoundingClientRect().top <= top;
      dock.classList.toggle('is-visible', showDock);
      dock.inert = !showDock;
      let selected = 0;
      targets.forEach((target, index) => { if (target?.getBoundingClientRect().top <= top) selected = index; });
      categoryLinks.forEach((link, index) => {
        if (index === selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const requestCategory = () => { if (!categoryFrame) categoryFrame = requestAnimationFrame(markCategory); };
    addEventListener('scroll', requestCategory, { passive: true });
    addEventListener('resize', requestCategory);
    markCategory();
  }
  update();
})();
