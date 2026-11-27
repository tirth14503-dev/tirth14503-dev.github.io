'use strict';
/* MarginGuard homepage. Three small jobs:
   1. start each exhibit's marks when it comes into view (the motion itself is in home.css);
   2. open the menu on small screens;
   3. play the film where it stands.
   The page works without this file: the marks are simply there, and the film link opens the file. */
(function () {
  var root = document.documentElement, q = new URLSearchParams(location.search);

  /* ---------- 1. the marks ---------- */
  try {
    var seqs = [].slice.call(document.querySelectorAll('[data-seq]'));

    /* A total is written out figure by figure: read out whole, shown one character at a time. */
    [].forEach.call(document.querySelectorAll('[data-write]'), function (el) {
      var text = el.textContent, said = document.createElement('span'), shown = document.createElement('span');
      said.className = 'vh'; said.textContent = text;
      shown.setAttribute('aria-hidden', 'true');
      text.split('').forEach(function (c, i) {
        var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i); s.textContent = c; shown.appendChild(s);
      });
      el.textContent = ''; el.appendChild(said); el.appendChild(shown);
    });
    /* Rows of a ledger and frames of the film follow one another. */
    [].forEach.call(document.querySelectorAll('[data-stagger]'), function (box) {
      var step = +box.getAttribute('data-stagger'), base = +(box.getAttribute('data-base') || 0), i = 0;
      [].forEach.call(box.children, function (el) {
        if (el.hasAttribute('data-a') || el.hasAttribute('data-step')) { el.style.setProperty('--d', (base + i * step) + 'ms'); i++; }
      });
    });
    /* Notes beside a screen are made one after another, top to bottom. */
    [].forEach.call(document.querySelectorAll('[data-notes] .callouts li'), function (li) {
      var i = [].indexOf.call(li.parentNode.children, li);
      li.style.setProperty('--d', (160 + i * 260) + 'ms');
    });

    var go = function (el) { el.classList.add('go'); };
    var start = function () {
      window.mgStarted = true;
      if (!root.classList.contains('m')) return;
      if (q.get('t') !== null) {            /* ?t=1500 freezes every score at that moment, for stills */
        root.style.setProperty('--t', (+q.get('t') || 0) + 'ms'); return;
      }
      var seen = false;
      try { seen = !!localStorage.getItem('mg-seen'); localStorage.setItem('mg-seen', '1'); } catch (e) {}
      root.style.setProperty('--k', seen && !q.get('first') ? '.45' : '1');   /* quicker on later visits */
      if (!('IntersectionObserver' in window)) { seqs.forEach(go); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { go(e.target); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -14% 0px', threshold: 0.12 });
      var begun = false;
      var begin = function () { if (begun) return; begun = true; seqs.forEach(function (el) { io.observe(el); }); };
      var ready = (document.fonts && document.fonts.ready) || Promise.resolve();
      ready.then(function () { setTimeout(begin, 200); });     /* wait for the type, so nothing is marked on a page still settling */
      setTimeout(begin, 2500);                                  /* ...but not for ever */
    };
    start();
  } catch (e) { root.classList.remove('m'); }

  /* ---------- 2. the menu (below 1100 px the links sit behind a button) ---------- */
  var button = document.querySelector('.menu-button'), menu = document.getElementById('site-menu');
  if (button && menu) {
    var isOpen = function () { return button.getAttribute('aria-expanded') === 'true'; };
    var close = function (focusButton) {
      if (!isOpen()) return;
      button.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open');
      if (focusButton) button.focus();
    };
    button.addEventListener('click', function () {
      if (isOpen()) { close(true); return; }
      button.setAttribute('aria-expanded', 'true'); menu.classList.add('is-open');
      var first = menu.querySelector('a'); if (first) first.focus();
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    document.addEventListener('click', function (e) { if (isOpen() && !menu.contains(e.target) && !button.contains(e.target)) close(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(true); } });
    if (window.matchMedia) window.matchMedia('(min-width: 1100px)').addEventListener('change', function (e) { if (e.matches) close(false); });
  }

  /* ---------- 3. the film: loaded only when asked, played where it stands, with sound and the browser's controls ---------- */
  var play = document.getElementById('film-play'), frame = document.getElementById('film-frame');
  if (play && frame) play.addEventListener('click', function (e) {
    var v = document.createElement('video');
    if (!v.canPlayType) return;                                /* no video support: let the link open the file */
    e.preventDefault();
    v.controls = true; v.playsInline = true; v.preload = 'auto';
    v.poster = 'media/home-film-lead.jpg';
    v.setAttribute('aria-label', 'The Quiet Leak, 2 minutes 22 seconds');
    [['media/quiet-leak-v4-1080p.mp4', 'video/mp4'], ['media/quiet-leak-v4-1080p.webm', 'video/webm']].forEach(function (s) {
      var source = document.createElement('source'); source.src = s[0]; source.type = s[1]; v.appendChild(source);
    });
    frame.textContent = ''; frame.classList.add('playing'); frame.appendChild(v);
    var attempt = v.play(); if (attempt && attempt.catch) attempt.catch(function () {});
    v.focus({ preventScroll: true });
    if (typeof gtag === 'function') gtag('event', 'video_start', { video_title: 'The quiet leak' });
    v.addEventListener('ended', function () {
      if (typeof gtag === 'function') gtag('event', 'video_complete', { video_title: 'The quiet leak' });
    });
    if ('IntersectionObserver' in window) {                    /* pause when it scrolls out of view */
      new IntersectionObserver(function (entries) { if (!entries[0].isIntersecting && !v.paused) v.pause(); }, { threshold: 0.2 }).observe(v);
    }
  });
})();
