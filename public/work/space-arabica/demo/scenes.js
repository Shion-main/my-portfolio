// Page scenes, one module per page, all driven by the shared runtime in motion.js.
// Each block runs only on its own page; every page's content works without it.
(() => {
  const M = window.SAMotion;
  if (!M) return;
  const { page, reduced, clamp, smooth } = M;
  const root = document.documentElement;
  const calm = () => reduced.matches;
  const set = (element, values) => { if (element) Object.entries(values).forEach(([key, value]) => element.style.setProperty(key, value)); };
  // The Thread lands on one signature element per page (thread.js).
  const land = (target, options = {}) => (M.thread ? M.thread.land(target, options) : options.onLand?.());
  const syncReduce = () => root.classList.toggle('reduce-scrub', reduced.matches);
  syncReduce();
  reduced.addEventListener('change', syncReduce);

  // The Home ↔ Menu cup morph and page direction live in page-transitions.js.
  const isHome = path => /(^|\/)(index\.html)?$/.test(path);

  /* ---------- Where the Thread lands on each page ---------- */
  const landings = {
    index: ['.theatre-arch', { shape: 'arch' }],
    menu: ['.menu-opening-orbit', { shape: 'ellipse' }],
    'full-menu': ['.menu-index-toc', { shape: 'rule', persist: true }],
    space: ['.bp-hero__photo', { shape: 'rect', persist: true }],
    order: ['.ob-jump', { shape: 'ticket', persist: true }],
    story: ['.nw-dash', { shape: 'line' }],
  };
  if (landings[page]) land(document.querySelector(landings[page][0]), landings[page][1]);

  /* ---------- Next chapter: the next page's opening window opens as it scrolls in ---------- */
  const chapter = document.querySelector('[data-next-chapter]');
  if (chapter) {
    M.scene({
      read: ({ height }) => (calm() ? null : chapter.getBoundingClientRect().top),
      write: ({ height }, top) => chapter.style.setProperty('--enter', top === null ? '1' : clamp((height - top) / (height * .75)).toFixed(3)),
    });
  }

  /* ---------- Home: chapters below the hero (depth, masks, type tracks) ---------- */
  if (page === 'index') {
    const chapters = [...document.querySelectorAll('[data-chapter]')];
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
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
    if (records.length) {
      document.body.classList.add('journey-ready');
      M.scene({
        read: ({ height }) => records.flatMap(r => {
          const rect = r.section.getBoundingClientRect();
          if ((rect.top > height + 120 || rect.bottom < -120) && !calm()) return [];
          return [{ r, rect, headingTops: r.headings.map(h => h.element.getBoundingClientRect().top), photoTop: r.photo ? r.photo.offsetTop + rect.top : 0 }];
        }),
        write: ({ height, width }, visible) => {
          const mobile = width <= 540;
          visible.forEach(({ r, rect, headingTops, photoTop }) => {
            const p = calm() ? .5 : clamp((height - rect.top) / (height + rect.height));
            const enter = calm() ? 1 : smooth(clamp((height - rect.top) / (height * .85)));
            const depth = calm() ? 0 : (p - .5) * (mobile ? 170 : 360);
            r.headings.forEach(({ lines }, headingIndex) => {
              const reveal = calm() ? 1 : clamp((height * .96 - headingTops[headingIndex]) / (height * .48));
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
        },
      });
      M.inView(chapters, { rootMargin: '50px' });
      M.reveal(document.querySelectorAll('[data-journey-reveal]'), { threshold: .12, className: 'is-visible' });
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
    }
  }

  /* ---------- Menu and Full Menu: masked headings, photo depth, opening entrance ---------- */
  if (page === 'menu' || page === 'full-menu') {
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
    const compositions = scenes.map(scene => ({
      scene,
      lines: headings.filter(h => h.closest('[data-menu-scene]') === scene).map(h => ({ heading: h, lines: [...h.querySelectorAll('.menu-motion-line > span')] })),
      photo: scene.querySelector('.menu-editorial-photo, .catalog-heading-photo'),
      inset: scene.querySelector('.menu-inset-photo, .catalog-inset-photo'),
      orbit: scene.querySelector('.menu-art-orbit, .menu-opening-orbit, .full-menu-opening-frame'),
      cups: [...scene.querySelectorAll('.menu-opening-cup, .full-menu-opening-art > figure')],
      tracks: [...scene.querySelectorAll('.menu-type-track')],
      coffee: scene.querySelector('.menu-passage-coffee'),
      accents: [...scene.querySelectorAll('.menu-accent')],
    }));
    document.body.classList.add('menu-motion-ready');
    M.scene({
      read: ({ height }) => compositions.flatMap(r => {
        const rect = r.scene.getBoundingClientRect();
        if (!calm() && (rect.bottom < -150 || rect.top > height + 150)) return [];
        return [{ r, rect, headingTops: r.lines.map(h => h.heading.getBoundingClientRect().top) }];
      }),
      write: ({ height, width }, visible) => {
        const mobile = width <= 600;
        visible.forEach(({ r, rect, headingTops }) => {
          const progress = calm() ? .5 : clamp((height - rect.top) / (height + rect.height));
          const enter = calm() ? 1 : smooth(clamp((height - rect.top) / (height * .8)));
          const depth = calm() ? 0 : (progress - .5) * (mobile ? 130 : 270);
          r.lines.forEach(({ lines }, h) => {
            const reveal = calm() ? 1 : clamp((height * .98 - headingTops[h]) / (height * .42));
            lines.forEach((line, i) => {
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
      },
    });
    M.inView(scenes);

    const entryAnimations = [];
    if (!reduced.matches) {
      const opening = document.querySelector('.menu-opening, .full-menu-opening');
      if (!root.classList.contains('title-handoff')) opening?.querySelectorAll('.menu-motion-line > span').forEach((line, index) => {
        entryAnimations.push(line.animate([{ transform: 'translateY(105%) rotate(3deg)' }, { transform: 'translateY(0) rotate(0)' }], { duration: 850, delay: index * 90, easing: M.ease.out }));
      });
      // Arriving from Home with a view transition: the cup morphs in, so skip its own entrance.
      const fromHome = (() => { try { const from = new URL(navigation.activation.from.url); return 'onpagereveal' in window && from.origin === location.origin && isHome(from.pathname); } catch { return false; } })();
      if (!fromHome) opening?.querySelectorAll('figure img').forEach((img, i) => {
        entryAnimations.push(img.animate([{ opacity: 0, transform: `translateY(80px) rotate(${i % 2 ? -16 : 16}deg) scale(.88)` }, { opacity: 1, transform: 'translateY(0) rotate(0) scale(1)' }], { duration: 1150, delay: 120 + i * 95, easing: M.ease.out, fill: 'backwards' }));
      });
    }
    reduced.addEventListener('change', () => { if (reduced.matches) entryAnimations.forEach(animation => animation.finish()); });

    // Full Menu category dock: appears once the catalog is reached and tracks the current group.
    const categoryLinks = [...document.querySelectorAll('.menu-catalog__nav a')];
    const targets = categoryLinks.map(link => document.querySelector(link.hash));
    const dock = document.querySelector('.menu-jump');
    if (targets.length && dock) {
      const headerEl = document.querySelector('.site-header');
      M.scene({
        read: () => {
          const top = headerEl.getBoundingClientRect().bottom + 48;
          return { top, tops: targets.map(target => target?.getBoundingClientRect().top ?? Infinity) };
        },
        write: (view, { top, tops }) => {
          // Keep the opening's actions clear; offer category navigation in the catalog.
          const showDock = tops[0] <= top;
          dock.classList.toggle('is-visible', showDock);
          dock.inert = !showDock;
          let selected = 0;
          tops.forEach((value, index) => { if (value <= top) selected = index; });
          categoryLinks.forEach((link, index) => {
            if (index === selected) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        },
      });
    }
  }

  /* ---------- Full Menu: filter with re-flow, sliding nav pill ---------- */
  if (page === 'full-menu') {
    const bar = document.querySelector('[data-menu-filters]');
    const status = document.querySelector('[data-menu-filter-status]');
    const categories = [...document.querySelectorAll('.menu-catalog__category[data-temp]')];
    const groups = [...document.querySelectorAll('.menu-catalog__group')];
    if (bar && categories.length) {
      bar.hidden = false;
      const buttons = [...bar.querySelectorAll('[data-menu-filter]')];
      const pill = bar.querySelector('.menu-filter__pill');
      const placePill = button => {
        pill.style.setProperty('--pill-x', `${button.offsetLeft}px`);
        pill.style.setProperty('--pill-w', `${button.offsetWidth}px`);
      };
      const apply = key => {
        let count = 0;
        categories.forEach(cat => {
          const show = key === 'all' || cat.dataset.temp.split(' ').includes(key);
          cat.toggleAttribute('data-hidden', !show);
          if (show) count += cat.querySelectorAll('.menu-catalog__item').length;
        });
        groups.forEach(group => group.toggleAttribute('data-empty', !group.querySelector('.menu-catalog__category:not([data-hidden])')));
        status.textContent = `Showing ${count} items.`;
        M.request();
      };
      buttons.forEach(button => button.addEventListener('click', () => {
        const key = button.dataset.menuFilter;
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        placePill(button);
        if (!document.startViewTransition || reduced.matches) { apply(key); return; }
        categories.forEach(cat => { cat.style.viewTransitionName = `cat-${cat.id}`; });
        const transition = document.startViewTransition(() => apply(key));
        transition.finished.catch(() => {}).finally(() => categories.forEach(cat => { cat.style.viewTransitionName = ''; }));
      }));
      requestAnimationFrame(() => placePill(buttons[0]));
      addEventListener('resize', () => placePill(bar.querySelector('[aria-pressed="true"]')));
    }
    const nav = document.querySelector('.menu-catalog__nav');
    if (nav) {
      const navPill = document.createElement('span');
      navPill.className = 'nav-pill';
      navPill.setAttribute('aria-hidden', 'true');
      nav.prepend(navPill);
      nav.classList.add('has-pill');
      const move = () => {
        const current = nav.querySelector('[aria-current="location"]');
        if (!current) return;
        navPill.style.setProperty('--x', `${current.offsetLeft}px`);
        navPill.style.setProperty('--w', `${current.offsetWidth}px`);
      };
      new MutationObserver(move).observe(nav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
      addEventListener('resize', move);
      move();
    }
  }

  /* ---------- Spaces: room ↔ floor plan, counting figures ---------- */
  if (page === 'space') {
    const host = document.querySelector('[data-space-switch]');
    const data = JSON.parse(host?.querySelector('[data-space-data]')?.textContent || '[]');
    const plan = host?.querySelector('[data-plan]');
    const panel = host?.querySelector('#space-panel');
    const tabs = [...(host?.querySelectorAll('[data-space-tab]') || [])];
    const select = document.querySelector('[data-space-select]');
    M.reveal([host?.querySelector('.bp-plan'), document.querySelector('.bp-included')], { threshold: .25, pendingClass: 'js-drawn-pending' });
    if (host && data.length && plan && panel) {
      let current = 0;
      const format = (key, value) => key === 'rate' ? Math.round(value).toLocaleString('en-US') : String(Math.round(value));
      const count = (el, key, from, to) => {
        if (reduced.matches || from === to) { el.textContent = format(key, to); return; }
        const start = performance.now();
        const tick = now => {
          const t = clamp((now - start) / 750);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format(key, from + (to - from) * eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      const choose = (index, focus = false) => {
        if (index === current) return;
        const from = data[current];
        const to = data[index];
        current = index;
        tabs.forEach((tab, i) => {
          tab.setAttribute('aria-selected', String(i === index));
          tab.tabIndex = i === index ? 0 : -1;
        });
        if (focus) tabs[index].focus();
        panel.setAttribute('aria-labelledby', tabs[index].id);
        plan.dataset.planState = to.id;
        plan.querySelector('[data-plan-label]').textContent = `${to.name.toUpperCase()} · ${to.capacity} SEATS`;
        panel.querySelectorAll('[data-space-count]').forEach(el => count(el, el.dataset.spaceCount, from[el.dataset.spaceCount], to[el.dataset.spaceCount]));
        panel.classList.add('is-swapping');
        setTimeout(() => {
          panel.querySelector('[data-space-field="name"]').textContent = to.name;
          panel.querySelector('[data-space-field="best_for"]').textContent = to.best_for.join(', ');
          panel.classList.remove('is-swapping');
        }, reduced.matches ? 0 : 200);
        if (select) select.value = to.name;
      };
      tabs.forEach((tab, i) => tab.addEventListener('click', () => choose(i)));
      host.querySelector('[role="tablist"]').addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        choose(next, true);
      });
      host.querySelector('.bp-panel__cta')?.addEventListener('click', () => { if (select) select.value = data[current].name; });
    }
  }

  /* ---------- Story: name split, timeline rail, values ---------- */
  if (page === 'story') {
    const split = document.querySelector('[data-name-split]');
    const timeline = document.querySelector('[data-timeline]');
    const track = timeline?.querySelector('.timeline__track');
    const items = [...(timeline?.querySelectorAll('[data-tl-item]') || [])];
    const values = document.querySelector('[data-values]');
    const words = [...(values?.querySelectorAll('[data-value]') || [])];
    const counter = values?.querySelector('[data-values-count]');
    let lastValue = -1;
    const setValue = index => {
      if (index === lastValue) return;
      lastValue = index;
      words.forEach((word, i) => {
        word.classList.toggle('is-active', i === index);
        word.classList.toggle('is-past', i < index);
      });
      if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    };
    M.scene({
      read: () => {
        if (calm()) return null;
        return {
          split: split ? M.sectionProgress(split) : 0,
          rect: track?.getBoundingClientRect(),
          offsets: items.map(item => item.offsetTop),
          values: values ? M.sectionProgress(values) : 0,
        };
      },
      write: ({ height }, state) => {
        if (!state) return;
        if (split) split.style.setProperty('--p', state.split.toFixed(4));
        if (track) {
          const p = clamp((height * .62 - state.rect.top) / state.rect.height);
          timeline.style.setProperty('--p', p.toFixed(4));
          items.forEach((item, i) => item.classList.toggle('is-reached', state.offsets[i] <= p * state.rect.height + 4));
        }
        if (values && words.length) setValue(Math.min(words.length - 1, Math.floor(state.values * words.length)));
      },
    });
    setValue(0);
  }

  /* ---------- Visit: live status, 24-hour dial, week bars ---------- */
  if (page === 'contact') {
    const schedule = JSON.parse(document.querySelector('[data-schedule]')?.textContent || '[]');
    const statusEl = document.querySelector('[data-open-status]');
    const statusText = document.querySelector('[data-open-text]');
    const arc = document.querySelector('[data-clock-arc]');
    const hand = document.querySelector('[data-clock-hand]');
    const nowText = document.querySelector('[data-clock-now]');
    const fmt = minutes => {
      const m = ((minutes % 1440) + 1440) % 1440;
      const h = Math.floor(m / 60);
      return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
    };
    const manilaNow = () => {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).map(p => [p.type, p.value]));
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
      return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
    };
    const point = minutes => {
      const angle = (minutes % 1440) / 1440 * Math.PI * 2;
      return [200 + 150 * Math.sin(angle), 200 - 150 * Math.cos(angle)];
    };
    let first = true;
    const render = () => {
      if (schedule.length !== 7 || !statusEl || !arc || !hand) return;
      const { day, minutes } = manilaNow();
      const prevDay = (day + 6) % 7;
      const [prevOpen, prevClose] = schedule[prevDay];
      const [open, close] = schedule[day];
      let windowDay = day;
      let isOpen = false;
      let text;
      if (minutes + 1440 < prevClose) { isOpen = true; windowDay = prevDay; text = `Open now · until ${fmt(prevClose)}`; }
      else if (minutes >= open && minutes < close) { isOpen = true; text = `Open now · until ${fmt(close)}`; }
      else { text = `Closed now · opens ${fmt(open)} today`; }
      statusEl.classList.toggle('is-open', isOpen);
      statusEl.classList.toggle('is-closed', !isOpen);
      statusText.textContent = text;
      const [wOpen, wClose] = windowDay === day ? [open, close] : [prevOpen, prevClose];
      const span = wClose - wOpen;
      const [sx, sy] = point(wOpen);
      const [ex, ey] = point(wClose);
      arc.setAttribute('d', `M${sx.toFixed(2)} ${sy.toFixed(2)} A150 150 0 ${span > 720 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`);
      const length = span / 1440 * Math.PI * 300;
      arc.style.strokeDasharray = `${length}`;
      arc.style.setProperty('--arc-length', `${length}`);
      nowText.textContent = fmt(minutes);
      const angle = minutes / 1440 * 360;
      if (first && !reduced.matches) {
        // Hold the dial until the Thread lands on the opening-hours arc, then draw and set it.
        hand.style.setProperty('--hand', '0deg');
        arc.classList.add('is-thread-waiting');
        land(arc, {
          onLand: () => {
            arc.classList.remove('is-thread-waiting');
            arc.classList.add('is-drawing');
            requestAnimationFrame(() => requestAnimationFrame(() => { hand.classList.add('is-setting'); hand.style.setProperty('--hand', `${angle}deg`); }));
          },
        });
      } else hand.style.setProperty('--hand', `${angle}deg`);
      first = false;
      document.querySelectorAll('.week__row').forEach(row => row.classList.toggle('is-today', Number(row.dataset.day) === windowDay));
    };
    render();
    setInterval(render, 30000);
    M.reveal(document.querySelector('.week'), { threshold: .2, pendingClass: 'js-drawn-pending' });
  }

  /* ---------- Order & Book: tickets, seat request, loyalty stamps ---------- */
  if (page === 'order') {
    M.reveal(document.querySelector('.ob-channels'), { threshold: .2, pendingClass: 'js-drawn-pending' });
    document.querySelectorAll('[data-min-today]').forEach(input => {
      input.min = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());
    });
    const form = document.querySelector('[data-seat-form]');
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const lines = ['Seat reservation request — Space Arabica', ...Array.from(new FormData(form).entries(), ([k, v]) => `${k}: ${String(v).trim()}`)];
      const text = lines.join('\n');
      const statusEl = form.querySelector('.form-status');
      let copied = false;
      try { await navigator.clipboard.writeText(text); copied = true; } catch { copied = false; }
      window.open(form.dataset.messenger, '_blank', 'noopener');
      statusEl.textContent = copied
        ? 'Request copied. Paste it into Messenger and send. Your seat is reserved once we confirm.'
        : `Copy this into Messenger and send: ${text.replace(/\n/g, ' · ')}`;
    });
    const loyalty = document.querySelector('[data-loyalty]');
    const stamps = [...(loyalty?.querySelectorAll('[data-stamp]') || [])];
    const countEl = loyalty?.querySelector('[data-stamp-count]');
    const setStamps = n => {
      stamps.forEach((stamp, i) => stamp.classList.toggle('is-stamped', i < n));
      if (countEl) countEl.textContent = String(n);
    };
    // Wide screens scrub the stamps with a sticky stage; phones stamp once on arrival.
    const sticky = matchMedia('(min-width: 801px)');
    if (loyalty && stamps.length) {
      if (reduced.matches) setStamps(stamps.length);
      else {
        M.scene({
          read: () => (sticky.matches && !calm() ? M.sectionProgress(loyalty) : null),
          write: (view, progress) => { if (progress !== null) setStamps(Math.round(clamp((progress - .08) / .8) * stamps.length)); },
        });
        M.reveal(loyalty.querySelector('.loyalty-card'), {
          threshold: .5,
          className: null,
          onReveal: () => {
            if (sticky.matches) return false;
            stamps.forEach((_, i) => setTimeout(() => setStamps(i + 1), 220 + i * 160));
          },
        });
      }
    }
  }
})();
