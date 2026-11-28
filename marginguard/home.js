'use strict';
/* MarginGuard pages. Small jobs:
   1. start each exhibit's marks when it comes into view (the motion itself is in home.css);
   2. open the menu on small screens, and the Product menu on wide ones;
   3. play the film where it stands;
   4. open the contact form under "The founder".
   The pages work without this file: the marks are simply there, the film link opens the file,
   "Product" goes to the How it works page, and the founder's email address is shown. */
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
      /* in the product grid, the hand goes from one picture to the next */
      [].forEach.call(box.querySelectorAll('[data-mark]'), function (el, n) { el.style.setProperty('--d', (base + n * step) + 'ms'); });
    });
    /* Notes beside a screen are made one after another, top to bottom. */
    [].forEach.call(document.querySelectorAll('[data-notes] .callouts li'), function (li) {
      var i = [].indexOf.call(li.parentNode.children, li);
      li.style.setProperty('--d', (160 + i * 260) + 'ms');
    });

    var pace = function () { return parseFloat(getComputedStyle(root).getPropertyValue('--k')) || 1; };
    var later = function (el, cls) { setTimeout(function () { el.classList.add(cls); }, (+(el.getAttribute('data-d') || 0)) * pace()); };

    /* A running total counts from nought through each step ("150@1050,710@1800": $150 at 1,050 ms, then $710), as a scan finds things. */
    var stepCount = function (el) {
      if (el.getAttribute('data-done') || !window.requestAnimationFrame) return;
      el.setAttribute('data-done', '1');
      var dec = +(el.getAttribute('data-decimals') || 0), pre = el.getAttribute('data-prefix') || '', text = el.textContent, k = pace(), now = 0;
      var width = el.getBoundingClientRect().width, said = document.createElement('span'), shown = document.createElement('span');
      said.className = 'vh'; said.textContent = text; shown.setAttribute('aria-hidden', 'true');
      var fmt = function (v) { return pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      shown.textContent = fmt(0); el.textContent = ''; el.appendChild(said); el.appendChild(shown);
      el.style.minWidth = Math.ceil(width) + 'px';
      var parts = el.getAttribute('data-steps').split(','), end = +parts[parts.length - 1].split('@')[1];
      setTimeout(function () { shown.textContent = text; }, (end + 900) * k);      /* lands on the real figure, whatever the frames did */
      parts.forEach(function (part) {
        var p = part.split('@'), to = +p[0];
        setTimeout(function () {
          var from = now, t0 = 0; now = to;
          var frame = function (t) {
            if (!t0) t0 = t;
            var q = Math.min(1, (t - t0) / (520 * k));
            shown.textContent = q < 1 ? fmt(from + (to - from) * (1 - Math.pow(1 - q, 3))) : fmt(to);
            if (q < 1) requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        }, +p[1] * k);
      });
    };
    /* The scan's status line: "Checking line 1 of 3@450|...". Read out once, whole, by the hidden text beside it. */
    var status = function (el) {
      var k = pace();
      el.getAttribute('data-status').split('|').forEach(function (part) {
        var p = part.split('@');
        setTimeout(function () { el.textContent = p[0]; }, +p[1] * k);
      });
    };
    var go = function (el) {
      if (el.classList.contains('go')) return;
      el.classList.add('go');
      [].forEach.call(el.querySelectorAll('.count[data-steps]'), stepCount);
      [].forEach.call(el.querySelectorAll('[data-status]'), status);
      if (el.id) [].forEach.call(document.querySelectorAll('.rp-note[data-after="' + el.id + '"]'), function (n) { later(n, 'on'); });
    };

    /* A number counts up once from nought, then stays. Read out whole; its width is held so nothing beside it moves. */
    var countUp = function (el) {
      if (el.getAttribute('data-done')) return;
      el.setAttribute('data-done', '1');
      var to = parseFloat(el.getAttribute('data-count')) || 0, dec = +(el.getAttribute('data-decimals') || 0),
          pre = el.getAttribute('data-prefix') || '', text = el.textContent;
      if (!to || !window.requestAnimationFrame) return;
      var width = el.getBoundingClientRect().width, said = document.createElement('span'), shown = document.createElement('span');
      said.className = 'vh'; said.textContent = text; shown.setAttribute('aria-hidden', 'true');
      var fmt = function (v) { return pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      shown.textContent = fmt(0); el.textContent = ''; el.appendChild(said); el.appendChild(shown);
      el.style.minWidth = Math.ceil(width) + 'px';
      var k = parseFloat(getComputedStyle(root).getPropertyValue('--k')) || 1, wait = (+(el.getAttribute('data-delay') || 0)) * k, t0 = 0;
      var frame = function (now) {
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / (1100 * k)), v = to * (1 - Math.pow(1 - p, 3));
        shown.textContent = p < 1 ? fmt(dec ? v : Math.round(v)) : text;
        if (p < 1) requestAnimationFrame(frame);
      };
      setTimeout(function () { requestAnimationFrame(frame); }, wait);
    };
    /* Sections and headings rise into place once as they come into view; members of a group follow one another. */
    var reveal = function () {
      [].forEach.call(document.querySelectorAll('[data-rise-group]'), function (g) {
        [].forEach.call(g.querySelectorAll('[data-rise]'), function (el, i) { el.style.setProperty('--i', i); });
      });
      /* Nothing may wait in view: a section starts to rise a little before it enters the window, and anything
         already in the window, or above it after a long jump, is shown at once. Counts start once they are in view. */
      var items = [].slice.call(document.querySelectorAll('[data-rise], .count:not([data-steps])'));
      if (!items.length) return;
      var show = function (el) { if (el.classList.contains('count')) countUp(el); else el.classList.add('in'); };
      var watch = function (margin) {
        return new IntersectionObserver(function (entries, o) {
          entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); o.unobserve(e.target); } });
        }, { rootMargin: margin, threshold: 0 });
      };
      var early = watch('0px 0px 12% 0px'), onview = watch('0px 0px -6% 0px');
      items.forEach(function (el) { (el.classList.contains('count') ? onview : early).observe(el); });
      var pending = items.slice(), queued = 0;
      var check = function () {
        queued = 0;
        pending = pending.filter(function (el) {
          if (el.classList.contains('in') || el.getAttribute('data-done')) return false;
          if (el.getBoundingClientRect().top < innerHeight * (el.classList.contains('count') ? .94 : 1.05)) { show(el); early.unobserve(el); onview.unobserve(el); return false; }
          return true;
        });
        if (!pending.length) { removeEventListener('scroll', onJump); removeEventListener('resize', onJump); }
      };
      var onJump = function () { if (!queued) queued = requestAnimationFrame(check); };
      addEventListener('scroll', onJump, { passive: true });
      addEventListener('resize', onJump);
      check();
    };
    var start = function () {
      window.mgStarted = true;
      if (!root.classList.contains('m')) return;
      if (q.get('t') !== null) {            /* ?t=1500 freezes every score at that moment, for stills */
        root.style.setProperty('--t', (+q.get('t') || 0) + 'ms');
        [].forEach.call(document.querySelectorAll('[data-rise]'), function (el) { el.classList.add('in'); });
        return;
      }
      var seen = false;
      try { seen = !!localStorage.getItem('mg-seen'); localStorage.setItem('mg-seen', '1'); } catch (e) {}
      root.style.setProperty('--k', seen && !q.get('first') ? '.45' : '1');   /* quicker on later visits */
      if (!('IntersectionObserver' in window)) {
        seqs.forEach(go); [].forEach.call(document.querySelectorAll('[data-rise]'), function (el) { el.classList.add('in'); }); return;
      }
      reveal();                                                 /* sections: at once, without waiting for the type */
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { go(e.target); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -14% 0px', threshold: 0.12 });
      /* A long jump (a link to a section further down, or a fast fling) can carry a short heading past the
         viewport between two frames. Anything already above the bottom of the window is started anyway. */
      var left = seqs.slice(), tick = 0;
      var sweep = function () {
        tick = 0;
        left = left.filter(function (el) {
          if (el.classList.contains('go')) return false;
          if (el.getBoundingClientRect().top < innerHeight) { go(el); io.unobserve(el); return false; }
          return true;
        });
        if (!left.length) removeEventListener('scroll', onScroll);
      };
      var onScroll = function () { if (!tick) tick = requestAnimationFrame(sweep); };
      var begun = false;
      var begin = function () {
        if (begun) return; begun = true;
        seqs.forEach(function (el) { io.observe(el); });
        addEventListener('scroll', onScroll, { passive: true });
        sweep();
      };
      var ready = (document.fonts && document.fonts.ready) || Promise.resolve();
      ready.then(function () { setTimeout(begin, 60); });      /* the marks wait for the type, so nothing is marked on a page still settling */
      setTimeout(begin, 600);                                   /* ...but not for long: the first screen never waits on it */
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

  /* the Product menu (wide screens). Without this script the link simply opens the How it works page. */
  var product = document.getElementById('product-button'), mega = document.getElementById('product-menu');
  if (product && mega) {
    var setMega = function (open) { mega.hidden = !open; product.setAttribute('aria-expanded', String(open)); };
    product.setAttribute('role', 'button');
    product.setAttribute('aria-controls', 'product-menu');
    setMega(false);
    product.addEventListener('click', function (e) { e.preventDefault(); setMega(mega.hidden); });
    product.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); setMega(mega.hidden); } });
    mega.addEventListener('click', function (e) { if (e.target.closest('a')) setMega(false); });
    document.addEventListener('click', function (e) { if (!mega.hidden && !mega.contains(e.target) && !product.contains(e.target)) setMega(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mega.hidden) { e.preventDefault(); setMega(false); product.focus(); } });
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

  /* ---------- 4. the contact form opens in place; a link to #contact (from the app, or from another page) opens it too ---------- */
  var opener = document.getElementById('contact-open'), panel = document.getElementById('contact-panel');
  if (opener && panel) {
    var setPanel = function (open, focus) {
      panel.classList.toggle('is-open', open); opener.setAttribute('aria-expanded', String(open));
      if (open && focus) { var first = panel.querySelector('input'); if (first) first.focus({ preventScroll: true }); }
    };
    opener.setAttribute('role', 'button');
    opener.setAttribute('aria-controls', 'contact-panel');
    setPanel(false, false);
    opener.addEventListener('click', function (e) { e.preventDefault(); setPanel(!panel.classList.contains('is-open'), true); });
    var fromAddress = function () { if (/^#contact(-panel|-form)?$/.test(location.hash)) setPanel(true, false); };
    fromAddress(); window.addEventListener('hashchange', fromAddress);
  }

  /* the masthead's height, for anything that is pinned under it */
  var mast = document.querySelector('.mast');
  var mastH = function () { return mast ? mast.offsetHeight : 0; };
  var setMast = function () { root.style.setProperty('--mast-h', mastH() + 'px'); };
  setMast();

  /* ---------- 5. how it works: one scene. Wide screens pin it and the scroll moves it on a step at a time;
     narrower ones keep the screen at the top while the steps go by. Elements with data-at="n" are marked (.at) from
     step n (to data-to, if given); in each stack of cards (.rp-cards) the cards take turns. The scroll is shared out
     over however many steps there are. Without motion the scene is shown finished. ---------- */
  var scene = document.querySelector('.rp-scene'), placeNotes = function () {};
  if (scene) {
    var sSteps = [].slice.call(scene.querySelectorAll('.rp-step')), sBars = [].slice.call(scene.querySelectorAll('.rp-progress i')),
        sAts = [].slice.call(scene.querySelectorAll('[data-at]')), sBoxes = [].slice.call(scene.querySelectorAll('.rp-cards')),
        sN = sSteps.length, sNow = -1, live = false, sTick = 0;
    var pinMq = matchMedia('(min-width:1100px) and (min-height:600px)'), stackMq = matchMedia('(max-width:1099px) and (min-height:640px)'),
        calm = matchMedia('(prefers-reduced-motion: reduce)');
    [].forEach.call(scene.querySelectorAll('.rp-link'), function (l, i) { l.style.setProperty('--i', i); });
    var setScene = function (n) {
      if (n === sNow) return; sNow = n;
      scene.setAttribute('data-step', n);
      sSteps.forEach(function (s, i) { s.classList.toggle('is-on', i === Math.max(0, n - 1)); });
      sBars.forEach(function (b, i) { b.classList.toggle('is-on', i < n); });
      sAts.forEach(function (el) {
        var a = +el.getAttribute('data-at'), z = +(el.getAttribute('data-to') || 9);
        el.classList.toggle('at', n >= a && n <= z);
      });
      sBoxes.forEach(function (box) {      /* each stack of cards shows its latest card; one with none shows its empty note */
        var card = null, cards = [].filter.call(box.children, function (c) { return c.hasAttribute('data-card'); });
        cards.forEach(function (c) { if (+c.getAttribute('data-card') <= n) card = c; });
        cards.forEach(function (c) { c.classList.toggle('is-on', c === card); });
        var empty = box.querySelector(':scope > .rp-empty');
        if (empty) empty.classList.toggle('is-on', !card);
      });
    };
    var sRead = function () {
      sTick = 0;
      if (!live) return;
      var r = scene.getBoundingClientRect(), h = innerHeight, n = r.top < h * .8 ? 1 : 0;
      if (pinMq.matches) {
        var mh = mastH(), run = r.height - (h - mh), p = run > 0 ? (mh - r.top) / run : 0;
        if (p > 0) n = 1 + Math.min(sN - 1, Math.floor(p * sN));
      } else {
        /* the reading line: halfway down the part of the window the pinned screen leaves free */
        var stage = scene.querySelector('.rp-stage'), free = Math.max(mastH(), Math.min(h * .7, stage.getBoundingClientRect().bottom)), lineY = free + (h - free) * .45;
        sSteps.forEach(function (s, i) { if (i && s.getBoundingClientRect().top < lineY) n = i + 1; });
      }
      setScene(n);
    };
    var sMode = function () {
      var was = live;
      live = root.classList.contains('m') && !calm.matches && (pinMq.matches || stackMq.matches);
      scene.classList.toggle('live', live);
      if (live !== was) { sNow = -1; if (live) sRead(); else setScene(9); }
      placeNotes();
    };
    addEventListener('scroll', function () { if (!sTick) sTick = requestAnimationFrame(sRead); }, { passive: true });
    setScene(9);
    sMode();
    [pinMq, stackMq].forEach(function (m) { if (m.addEventListener) m.addEventListener('change', sMode); });
  }

  /* ---------- 6. the product tabs (ARIA tabs: arrow keys, Home and End; an address like #paygate opens its tab) ---------- */
  var tabs = [].slice.call(document.querySelectorAll('.show-tabs [role="tab"]'));
  if (tabs.length) {
    var select = function (n, focus) {
      tabs.forEach(function (t, i) {
        var on = i === n, p = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        if (p) { p.classList.toggle('is-on', on); if (on) p.removeAttribute('inert'); else p.setAttribute('inert', ''); }
      });
      if (focus) { tabs[n].focus(); tabs[n].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault(); select((n + tabs.length) % tabs.length, true);
      });
    });
    var tabFromAddress = function () {
      var id = location.hash.slice(1);
      tabs.forEach(function (t, i) { if (id && t.getAttribute('aria-controls') === id) select(i, false); });
    };
    select(0, false); tabFromAddress(); window.addEventListener('hashchange', tabFromAddress);
  }

  /* ---------- 7. the film's picture drifts a little as the page goes by (motion on only) ---------- */
  var cinema = document.querySelector('.cinema-frame');
  if (cinema && root.classList.contains('m') && window.requestAnimationFrame) {
    var drifting = 0;
    var place = function () {
      drifting = 0;
      if (cinema.classList.contains('playing')) return;
      var r = cinema.getBoundingClientRect(), h = innerHeight;
      if (r.bottom < 0 || r.top > h) return;
      var p = (r.top + r.height / 2 - h / 2) / (h / 2 + r.height / 2);       /* -1 above the middle, 1 below */
      cinema.style.setProperty('--py', (p * 26).toFixed(1) + 'px');
    };
    addEventListener('scroll', function () { if (!drifting) drifting = requestAnimationFrame(place); }, { passive: true });
    place();
  }

  /* ---------- 8. product pictures grow into place as they come up the window (motion on only) ---------- */
  var growers = [].slice.call(document.querySelectorAll('[data-grow]'));
  if (growers.length && root.classList.contains('m') && window.requestAnimationFrame) {
    var growing = 0;
    var grow = function () {
      growing = 0;
      growers.forEach(function (el) {
        var r = el.getBoundingClientRect(), h = innerHeight;
        if (r.bottom < 0 || r.top > h) return;
        var g = Math.max(0, Math.min(1, (h - r.top) / (h * .55)));
        el.style.setProperty('--g', g.toFixed(3));
      });
    };
    addEventListener('scroll', function () { if (!growing) growing = requestAnimationFrame(grow); }, { passive: true });
    grow();
  }

  /* ---------- 9. notes in the margin. Only wide windows show them (home.css); each is placed level with the figure it is
     about, beside the page, with a hairline back to it. They are written when their figure comes into view, when the
     opening's scan reaches them (data-after), or at their step of the scene (data-at). ---------- */
  var notes = [].slice.call(document.querySelectorAll('.rp-note'));
  if (notes.length) {
    var page = document.querySelector('.page') || document.body;
    placeNotes = function () {
      var spare = (document.documentElement.clientWidth - page.offsetWidth) / 2;
      notes.forEach(function (n) {
        var host = n.offsetParent, a = document.getElementById(n.getAttribute('data-for'));
        if (!host || !a) return;
        var x = 0, y = 0, el = a;
        while (el && el !== host) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
        if (el !== host) return;
        var side = parseFloat(getComputedStyle(host).paddingLeft) || 0, w = Math.max(96, Math.min(200, spare + side - 28 - 18)), edge;
        if (n.classList.contains('l')) {
          edge = side - 46;                                   /* clear of the ledger's red rule */
          n.style.left = (edge - w) + 'px';
          n.style.setProperty('--reach', Math.max(0, x - edge - 12) + 'px');
        } else {
          edge = host.offsetWidth - side + 28;
          n.style.left = edge + 'px';
          n.style.setProperty('--reach', Math.max(0, edge - 12 - (x + a.offsetWidth)) + 'px');
        }
        n.style.top = Math.round(y + a.offsetHeight / 2 - 11) + 'px';
        n.style.setProperty('--nw', w + 'px');
      });
    };
    placeNotes();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeNotes);
    var placing = 0;
    addEventListener('resize', function () {
      if (placing) return;
      placing = requestAnimationFrame(function () { placing = 0; setMast(); placeNotes(); });
    });
    var plain = notes.filter(function (n) { return !n.hasAttribute('data-after') && !n.hasAttribute('data-at'); });
    if (plain.length && root.classList.contains('m') && 'IntersectionObserver' in window) {
      var nio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          plain.forEach(function (n) { if (n.getAttribute('data-for') === e.target.id) later(n, 'on'); });
          nio.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -18% 0px' });
      plain.forEach(function (n) { var a = document.getElementById(n.getAttribute('data-for')); if (a) nio.observe(a); });
    }
  }

  /* ---------- 10. try it: the check on one fictional order, worked out in the page as the figures are typed ---------- */
  var money = function (v) { return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var fig = function (v, d) { return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var qty = function (v) { return fig(v, v % 1 ? 2 : 0); };
  [].forEach.call(document.querySelectorAll('[data-try]'), function (form) {
    var kind = form.getAttribute('data-try'), ins = {},
        finds = form.querySelector('[data-out="finds"]'), total = form.querySelector('[data-out="total"]'),
        also = form.querySelector('[data-out="also"]'), said = form.querySelector('[data-out="said"]'), sayLater = 0;
    [].forEach.call(form.querySelectorAll('.rp-in'), function (i) { ins[i.name] = i; i.readOnly = false; });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    var read = function (name) {
      var i = ins[name], s = i.value.replace(/[,\s$]/g, ''), ok = /^\d{1,7}(\.\d{1,4})?$/.test(s);
      i.setAttribute('aria-invalid', String(!ok));
      return ok ? parseFloat(s) : null;
    };
    var line = function (kindOf, title, why, amount) {
      var li = document.createElement('li'), div = document.createElement('div'), t = document.createElement('p'), w = document.createElement('p');
      t.className = kindOf; t.textContent = title; w.className = 'pc-why'; w.textContent = why;
      div.appendChild(t); div.appendChild(w); li.appendChild(div);
      if (amount !== null) { var b = document.createElement('b'); b.className = 'pc-amt'; b.textContent = money(amount); li.appendChild(b); }
      return li;
    };
    var before = total.textContent;
    var run = function () {
      var out = [], flags = [], main = 0, other = 0, a, v = {}, bad = false;
      Object.keys(ins).forEach(function (n) { v[n] = read(n); if (v[n] === null) bad = true; });
      if (bad) {
        out.push(['info-title', 'Check the figure', 'Type a number, like 12.50', null]);
      } else if (kind === 'buyer') {
        if (v.price > v.po_price) {
          a = v.billed * (v.price - v.po_price); main += a; flags.push('price', 'po_price');
          out.push(['finding-title', 'Unit price differs', 'Ordered at ' + fig(v.po_price, 2) + ', billed at ' + fig(v.price, 2) + ': ' + qty(v.billed) + ' × ' + fig(v.price - v.po_price, 2), a]);
        }
        if (v.billed > v.received) {
          a = (v.billed - v.received) * v.po_price; main += a; flags.push('billed', 'received');
          out.push(['finding-title', 'Billed, not received', qty(v.billed) + ' billed, ' + qty(v.received) + ' kept: ' + qty(v.billed - v.received) + ' × ' + fig(v.po_price, 2), a]);
        }
        if (v.price < v.po_price) out.push(['info-title', 'Billed below the order price', 'Nothing to claim on the price', null]);
        if (!out.length) out.push(['ok-title', 'No difference', 'The invoice agrees with the order and the receipt', null]);
      } else {
        var both = Math.min(v.billed, v.shipped);
        if (v.billed > v.shipped) {
          a = (v.billed - v.shipped) * v.price; main += a; flags.push('billed', 'shipped');
          out.push(['finding-title', 'Billed for more than you shipped', qty(v.billed) + ' billed, ' + qty(v.shipped) + ' shipped: ' + qty(v.billed - v.shipped) + ' × ' + fig(v.price, 2), a]);
        }
        if (v.price > v.agreed) {
          a = both * (v.price - v.agreed); main += a; flags.push('price', 'agreed');
          out.push(['finding-title', 'Priced above the agreed price', 'Agreed ' + fig(v.agreed, 2) + ', invoiced at ' + fig(v.price, 2) + ': ' + qty(both) + ' × ' + fig(v.price - v.agreed, 2), a]);
        }
        if (v.shipped > v.billed) {
          a = (v.shipped - v.billed) * v.agreed; other += a; flags.push('billed', 'shipped');
          out.push(['finding-title', 'Shipped, not invoiced', qty(v.shipped) + ' shipped, ' + qty(v.billed) + ' billed: ' + qty(v.shipped - v.billed) + ' × ' + fig(v.agreed, 2) + ' you’d miss', a]);
        }
        if (v.price < v.agreed) {
          a = both * (v.agreed - v.price); other += a; flags.push('price', 'agreed');
          out.push(['finding-title', 'Priced below the agreed price', 'Agreed ' + fig(v.agreed, 2) + ', invoiced at ' + fig(v.price, 2) + ': ' + qty(both) + ' × ' + fig(v.agreed - v.price, 2) + ' you’d miss', a]);
        }
        if (!out.length) out.push(['ok-title', 'Ready to send', 'It matches the order, the shipment and the agreed price', null]);
      }
      Object.keys(ins).forEach(function (n) { ins[n].classList.toggle('flagged', flags.indexOf(n) >= 0); });
      finds.textContent = '';
      out.forEach(function (o) { finds.appendChild(line(o[0], o[1], o[2], o[3])); });
      var now = bad ? '–' : money(main);
      if (now !== before) {
        total.textContent = now; before = now;
        total.classList.remove('bump'); void total.offsetWidth; total.classList.add('bump');
      }
      if (also) also.textContent = bad ? '' : 'and ' + money(other) + ' you’d miss';
      clearTimeout(sayLater);
      sayLater = setTimeout(function () {
        said.textContent = out.map(function (o) { return o[1] + (o[3] !== null ? ', ' + money(o[3]) : ''); }).join('. ') + '. Total ' + now + '.';
      }, 700);
    };
    Object.keys(ins).forEach(function (n) { ins[n].addEventListener('input', run); });
    var reset = form.querySelector('.rp-reset');
    if (reset) reset.addEventListener('click', function () {
      Object.keys(ins).forEach(function (n) { ins[n].value = ins[n].getAttribute('data-def'); });
      run();
    });
    run();
  });

  /* ---------- 11. the drop zone (buyers homepage). The free scan runs on MarginGuard's own site, and this page can't
     hand files across to it. So files dropped anywhere on the page are only named here, never read and never sent,
     and the next step says what to do: open the scan and drop them there. ---------- */
  var drop = document.getElementById('drop'), dropNext = document.getElementById('drop-next');
  if (drop && dropNext) {
    var READS = /\.(csv|tsv|txt|xlsx|xls|ods|pdf|xml|json)$/i, depth = 0;
    var withFiles = function (e) { return e.dataTransfer && [].indexOf.call(e.dataTransfer.types || [], 'Files') >= 0; };
    var listNames = function (names) {
      return names.length <= 4 ? names.join(', ') : names.slice(0, 3).join(', ') + ' and ' + (names.length - 3) + ' more';
    };
    var named = function (files) {
      var names = [].map.call(files, function (f) { return f.name; }),
          good = names.filter(function (n) { return READS.test(n); }), other = names.filter(function (n) { return !READS.test(n); });
      document.getElementById('drop-files').textContent = good.length
        ? (good.length === 1 ? '1 file ready: ' : good.length + ' files ready: ') + listNames(good)
        : 'The scan doesn’t read ' + (names.length === 1 ? 'this file.' : 'these files.');
      var skip = document.getElementById('drop-skip');
      skip.hidden = !other.length || !good.length;
      skip.textContent = other.length ? 'Not read by the scan: ' + listNames(other) + '. It takes CSV, Excel, PDF and e-invoice files.' : '';
      drop.hidden = true; dropNext.hidden = false;
      dropNext.querySelector('.btn').focus({ preventScroll: true });
      dropNext.scrollIntoView({ block: 'nearest' });
    };
    addEventListener('dragenter', function (e) { if (withFiles(e)) { depth++; drop.classList.add('over'); } });
    addEventListener('dragleave', function (e) { if (withFiles(e) && --depth <= 0) { depth = 0; drop.classList.remove('over'); } });
    addEventListener('dragover', function (e) { if (withFiles(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
    addEventListener('drop', function (e) {
      if (!withFiles(e)) return;
      e.preventDefault(); depth = 0; drop.classList.remove('over');
      if (e.dataTransfer.files && e.dataTransfer.files.length) named(e.dataTransfer.files);
    });
    document.getElementById('drop-clear').addEventListener('click', function () { dropNext.hidden = true; drop.hidden = false; drop.focus(); });
  }

  /* ---------- 12. phones: the slim bar at the bottom steps aside while the page's own main action is in view ---------- */
  var bar = document.getElementById('scan-bar');
  if (bar && window.IntersectionObserver) {
    var mains = [].slice.call(document.querySelectorAll('#drop, #drop-next, .opening .act, .rp-call .act')), inView = [];
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = inView.indexOf(e.target);
        if (e.isIntersecting && i < 0) inView.push(e.target);
        if (!e.isIntersecting && i >= 0) inView.splice(i, 1);
      });
      bar.classList.toggle('off', inView.length > 0);
    });
    mains.forEach(function (el) { bio.observe(el); });
  } else if (bar) bar.classList.remove('off');
})();
