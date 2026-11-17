(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------------------------------------------------------------
  // Remote media fallbacks (CSP forbids inline onerror handlers)
  // -------------------------------------------------------------------------
  const markBroken = (img) => {
    img.classList.add('img-unavailable');
    img.closest('.panel, .page-hero, .reel-slide')?.classList.add('media-missing');
  };
  document.querySelectorAll('img[data-remote]').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) markBroken(img);
    else img.addEventListener('error', () => markBroken(img), { once: true });
  });

  // -------------------------------------------------------------------------
  // Header: transparent over dark media, frosted white over light content
  // -------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  const toneSections = [...document.querySelectorAll('[data-header]')];
  let headerTicking = false;

  const updateHeader = () => {
    headerTicking = false;
    if (!header) return;
    const probe = header.offsetHeight / 2;
    let tone = 'light';
    for (const section of toneSections) {
      const r = section.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        tone = section.dataset.header;
        break;
      }
    }
    header.dataset.tone = tone;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!headerTicking) {
        headerTicking = true;
        requestAnimationFrame(updateHeader);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', updateHeader, { passive: true });
  updateHeader();

  // -------------------------------------------------------------------------
  // Slide-in menu drawer
  // -------------------------------------------------------------------------
  const drawer = document.getElementById('site-menu');
  const openBtn = document.querySelector('[data-menu-open]');

  if (drawer && openBtn) {
    const panel = drawer.querySelector('.drawer-panel');
    let closeTimer = 0;

    const focusables = () => [...panel.querySelectorAll('a, button')];

    const open = () => {
      clearTimeout(closeTimer);
      drawer.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => drawer.classList.add('is-open')));
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      focusables()[0]?.focus();
    };

    const close = () => {
      drawer.classList.remove('is-open');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      closeTimer = setTimeout(() => (drawer.hidden = true), reduceMotion ? 0 : 350);
      openBtn.focus();
    };

    openBtn.addEventListener('click', open);
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('[data-menu-close]')) close();
    });
    drawer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // -------------------------------------------------------------------------
  // Hero video reel: crossfades between clips with progress indicators
  // -------------------------------------------------------------------------
  const reel = document.querySelector('[data-reel]');
  if (reel) initReel(reel, reel.parentElement);

  function initReel(stage, section) {
    const slides = [...stage.querySelectorAll('.reel-slide')];
    const dots = [...section.querySelectorAll('.reel-dot')];
    const credits = [...section.querySelectorAll('.reel-credit-item')];
    const toggle = section.querySelector('.reel-toggle');
    const duration = Number(stage.dataset.duration) || 8000;
    const FADE = 1400;

    section.style.setProperty('--reel-duration', `${duration}ms`);

    let index = 0;
    let timer = 0;
    let startedAt = 0;
    let remaining = duration;
    let running = false;
    let userPaused = reduceMotion;
    let onScreen = true;

    const video = (i) => slides[i].querySelector('video');

    // A slide whose video cannot play keeps its still image.
    slides.forEach((slide) => {
      const v = slide.querySelector('video');
      if (!v) return;
      const fail = () => slide.classList.add('video-failed');
      v.addEventListener('error', fail);
      v.querySelector('source:last-of-type')?.addEventListener('error', fail);
      v.addEventListener('playing', () => slide.classList.add('video-ready'), { once: true });
    });

    const play = (i) => {
      const v = video(i);
      if (!v || slides[i].classList.contains('video-failed')) return;
      v.preload = 'auto';
      const p = v.play();
      if (p) p.catch(() => {});
    };
    const pause = (i) => video(i)?.pause();

    const warmNext = () => {
      const v = video((index + 1) % slides.length);
      if (v && v.preload === 'none') v.preload = 'auto';
    };

    const schedule = (ms) => {
      clearTimeout(timer);
      remaining = ms;
      startedAt = performance.now();
      timer = setTimeout(() => show(index + 1), ms);
    };

    const restartDot = () => {
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
      const bar = dots[index]?.querySelector('i');
      if (bar) {
        bar.style.animation = 'none';
        void bar.offsetWidth; // reflow so the fill animation restarts
        bar.style.animation = '';
      }
    };

    function show(next) {
      next = (next + slides.length) % slides.length;
      if (next !== index) {
        const prev = index;
        slides[prev].classList.remove('is-active');
        setTimeout(() => prev !== index && pause(prev), FADE);
        index = next;
        const v = video(index);
        if (v && v.readyState > 0) {
          try {
            v.currentTime = 0;
          } catch {
            /* not seekable yet */
          }
        }
        slides[index].classList.add('is-active');
      }
      credits.forEach((c, i) => (c.hidden = i !== index));
      restartDot();
      remaining = duration;
      if (running) {
        play(index);
        schedule(duration);
        warmNext();
      }
    }

    function sync() {
      const shouldRun = !userPaused && onScreen && !document.hidden;
      if (shouldRun === running) return;
      running = shouldRun;
      section.classList.toggle('is-paused', !running);
      if (running) {
        play(index);
        schedule(Math.max(remaining, 600));
        warmNext();
      } else {
        clearTimeout(timer);
        remaining = Math.max(600, remaining - (performance.now() - startedAt));
        pause(index);
      }
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

    toggle?.addEventListener('click', () => {
      userPaused = !userPaused;
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggle.setAttribute('aria-label', userPaused ? 'Play background video' : 'Pause background video');
      sync();
    });
    if (userPaused && toggle) {
      toggle.setAttribute('aria-pressed', 'true');
      toggle.setAttribute('aria-label', 'Play background video');
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        },
        { threshold: 0.15 },
      ).observe(section);
    }
    document.addEventListener('visibilitychange', sync);

    section.classList.add('is-paused');
    slides[0].classList.add('is-active');
    show(0);
    sync();
  }

  // -------------------------------------------------------------------------
  // Scroll-in transitions for panels and cards
  // -------------------------------------------------------------------------
  if ('IntersectionObserver' in window && !reduceMotion) {
    const panelObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            panelObserver.unobserve(e.target);
          }
        }),
      { threshold: 0.3 },
    );
    document.querySelectorAll('.panel, .page-hero').forEach((el) => panelObserver.observe(el));

    const revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('entered');
            revealObserver.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll('.service-card, .sector, .journey li, .triple-grid article, .resource-card, .editorial-panel')
      .forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--reveal-delay', `${(i % 3) * 70}ms`);
        revealObserver.observe(el);
      });
  } else {
    document.querySelectorAll('.panel, .page-hero').forEach((el) => el.classList.add('is-in'));
  }

  // -------------------------------------------------------------------------
  // AJAX forms
  // -------------------------------------------------------------------------
  document.querySelectorAll('form.ajax-form').forEach((form) =>
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type=submit]');
      const status = form.querySelector('.form-status');
      if (!form.reportValidity()) return;

      const label = button.textContent;
      button.disabled = true;
      button.textContent = 'Submitting…';
      status.textContent = '';
      status.className = 'form-status';

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not submit your request.');
        status.textContent = data.message + (data.reference ? ` Reference: ${data.reference}.` : '');
        status.classList.add('success');
        form.reset();
      } catch (err) {
        status.textContent = err.name === 'AbortError' ? 'Request timed out. Please try again.' : err.message;
        status.classList.add('error');
      } finally {
        clearTimeout(timeout);
        button.disabled = false;
        button.textContent = label;
      }
    }),
  );
})();
