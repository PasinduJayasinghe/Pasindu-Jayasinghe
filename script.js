/* ─── script.js — GSAP-powered neubrutalist interactions ─────────── */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined';

  /* ══ Navbar: mobile toggle + active link ══════════════════════════ */
  var navToggle = document.getElementById('navToggle');
  var navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  var sections = document.querySelectorAll('section[id]');
  var anchorLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  function setActiveLink() {
    var y = window.scrollY;
    sections.forEach(function (s) {
      var top = s.offsetTop - 100;
      if (y >= top && y < top + s.offsetHeight) {
        anchorLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + s.id);
        });
      }
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ══ Footer year ══════════════════════════════════════════════════ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ══ Copy email + toast ═══════════════════════════════════════════ */
  var emailCard = document.getElementById('emailCard');
  if (emailCard) {
    emailCard.addEventListener('click', function (e) {
      if (!navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard.writeText('thisarajayasinghe07@gmail.com').then(function () {
        showToast('Email copied ✓');
      });
    });
  }
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.style.cssText =
        'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
        'background:#101010;color:#F2FAF9;border:3px solid #101010;' +
        'box-shadow:5px 5px 0 #53F2EF;padding:12px 24px;font-weight:700;' +
        'font-family:Space Grotesk,sans-serif;z-index:9999;opacity:0;' +
        'transition:opacity .25s ease;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      setTimeout(function () { toast.style.opacity = '0'; }, 2200);
    });
  }

  /* ══ No GSAP or reduced motion → show everything, stop here ═══════ */
  if (!hasGSAP || reduceMotion) {
    document.querySelectorAll('[data-reveal],[data-hero],[data-sticker]').forEach(function (el) {
      el.style.opacity = '1';
    });
    document.querySelectorAll('.hero-title .line-inner').forEach(function (el) {
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ══ HERO — one orchestrated load timeline ════════════════════════ */
  var heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  heroTl
    .to('.hero-title .line-inner', {
      y: 0, duration: 0.9, stagger: 0.12
    }, 0.15)
    .fromTo('.hero-eyebrow',
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.5 }, 0.1)
    .fromTo('.objective-card',
      { opacity: 0, y: 30, rotate: -2 },
      { opacity: 1, y: 0, rotate: 0, duration: 0.6 }, 0.7)
    .fromTo('.hero-actions',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5 }, 0.85)
    .fromTo('.hero-stats',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5 }, 0.95)
    .fromTo('.hero-photo-frame',
      { opacity: 0, scale: 0.9, rotate: 3 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.4)
    .fromTo('[data-sticker]',
      { opacity: 0, scale: 0, rotate: function (i) { return i % 2 ? 18 : -18; } },
      { opacity: 1, scale: 1,
        rotate: function (i) { return [-4, 3, 2][i] || 0; },
        duration: 0.55, stagger: 0.12, ease: 'back.out(2.2)' }, 0.9);

  // photo frame starts hidden via [data-hero-photo]? give it initial state:
  gsap.set('.hero-photo-frame', { opacity: 0 });

  /* Stat counters */
  document.querySelectorAll('.stat-num').forEach(function (el) {
    var target = parseInt(el.dataset.count, 10);
    gsap.fromTo(el, { innerText: 0 }, {
      innerText: target,
      duration: 1.4,
      delay: 1.1,
      snap: { innerText: 1 },
      ease: 'power2.out'
    });
  });

  /* Ambient float on stickers after entrance */
  gsap.to('.sticker-status', { y: -8, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 });
  gsap.to('.hero-code-card', { y: -10, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 });

  /* ══ MARQUEES — opposite directions, scroll-speed reactive ════════ */
  function marquee(trackId, dir) {
    var track = document.getElementById(trackId);
    if (!track) return;
    var width = track.scrollWidth / 3; // 3 duplicated spans
    var wrap = gsap.utils.wrap(-width, 0);
    var tween = gsap.to(track, {
      x: dir * -width,
      duration: 18,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: function (x) { return wrap(parseFloat(x)) + 'px'; }
      }
    });
    // speed up slightly while scrolling
    var speedTimeout;
    window.addEventListener('scroll', function () {
      tween.timeScale(2.4);
      clearTimeout(speedTimeout);
      speedTimeout = setTimeout(function () {
        gsap.to(tween, { timeScale: 1, duration: 0.6 });
      }, 120);
    }, { passive: true });
  }
  marquee('marqueeA', 1);
  marquee('marqueeB', -1);

  /* ══ SCROLL REVEALS — cards pop in with slight rotation ═══════════ */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      gsap.fromTo(batch,
        {
          opacity: 0,
          y: 44,
          rotate: function (i) { return (i % 2 ? 1 : -1) * 1.6; }
        },
        {
          opacity: 1, y: 0, rotate: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          overwrite: true
        });
    }
  });

  /* ══ TIMELINE SPINE — draws as you scroll ═════════════════════════ */
  var spine = document.getElementById('timelineSpine');
  if (spine) {
    gsap.fromTo(spine, { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 80%',
        end: 'bottom 55%',
        scrub: 0.5
      }
    });
  }

  /* ══ MAGNETIC BUTTONS ═════════════════════════════════════════════ */
  document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
    var xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
    var yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.28);
      yTo((e.clientY - r.top - r.height / 2) * 0.28);
    });
    btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
  });

  /* ══ CONSTRAINT TAGS — wobble on hover ════════════════════════════ */
  document.querySelectorAll('.constraint-tag').forEach(function (tag) {
    tag.addEventListener('mouseenter', function () {
      gsap.fromTo(tag, { rotate: -3 }, { rotate: -1.5, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
  });

})();