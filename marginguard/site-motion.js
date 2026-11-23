'use strict';
// Motion for the MarginGuard page (site-motion.css holds the rest). Off when the visitor prefers reduced motion.
// Only blocks still below the fold when this runs are hidden for a reveal, so nothing already on screen disappears.
// Money figures count up and always end on the exact text the page shipped with, keeping their width while counting.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('motion');
  document.addEventListener('touchstart', () => {}, {passive: true});   // lets iOS Safari show :active, so a tapped tile's image grows
  const number = new Intl.NumberFormat('en-US');

  // Shows 0 straight away (width locked, so nothing shifts), then counts to the shipped text after `wait` ms.
  function count(el, ms = 900, wait = 0, landed) {
    if (!el || document.visibilityState !== 'visible') return;
    const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!node) return;
    el.mgShipped ??= node.textContent;   // a replay mid-count still counts to the real figure
    const parts = /^(\D*)(\d[\d,]*)(.*)$/s.exec(el.mgShipped);
    if (!parts) return;
    const shipped = el.mgShipped, target = Number(parts[2].replace(/,/g, '')), run = (el.mgRun || 0) + 1;
    el.mgRun = run;
    node.textContent = shipped;
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    node.textContent = parts[1] + '0' + parts[3];
    setTimeout(() => {
      if (el.mgRun !== run) return;
      const start = performance.now();
      const step = now => {
        if (el.mgRun !== run) return;
        const t = Math.min(1, (now - start) / ms);
        node.textContent = t < 1 ? parts[1] + number.format(Math.round(target * (1 - (1 - t) ** 4))) + parts[3] : shipped;
        if (t < 1) return requestAnimationFrame(step);
        el.style.minWidth = '';
        if (landed) { el.classList.remove('mg-landed'); void el.offsetWidth; el.classList.add('mg-landed'); }
      };
      requestAnimationFrame(step);
    }, wait);
  }

  // 1. Hero: the flagged price pulses, then the finding counts up. Switching tabs replays it.
  function reconcile(panel, delay) {
    if (!panel) return;
    count(panel.querySelector('.finding-value'), 800, delay + 280);
    setTimeout(() => {
      const flagged = panel.querySelector('.ledger tr.flag .num');
      if (flagged) { flagged.classList.remove('mg-pulse'); void flagged.offsetWidth; flagged.classList.add('mg-pulse'); }
    }, delay);
  }
  const panels = () => [...document.querySelectorAll('.example-panel')];
  reconcile(panels().find(p => !p.hidden), 650);
  document.querySelector('.example-tabs')?.addEventListener('click', event => {
    if (event.target.closest('[role="tab"]')) requestAnimationFrame(() => reconcile(panels().find(p => !p.hidden), 0));
  });

  if (!('IntersectionObserver' in window)) return;

  // 2. Reveals. Mark only what is still below the fold, so nothing on screen at load is hidden.
  const fold = innerHeight * 0.92, marked = [];
  const below = el => el.getBoundingClientRect().top > fold;
  const mark = (el, delay) => { el.classList.add('rv'); el.style.setProperty('--d', delay + 'ms'); marked.push(el); };
  document.querySelectorAll('main section:not(.hero) h2').forEach(h => {
    if (!below(h)) return;
    if ([...h.childNodes].some(n => n.nodeType !== 3)) return mark(h, 0);
    const words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      span.style.setProperty('--d', Math.min(i, 10) * 55 + 'ms');
      h.append(span, i < words.length - 1 ? ' ' : '');
    });
    h.classList.add('rv-words');
    marked.push(h);
  });
  const groups = ['.intro > p', '.audience-grid > div', '.cap-grid > .cap', '.assistant-note', '.module-grid > .module',
    '.workflow-steps > li', '.workflow-bottom', '.templates', '.tracker', '.trust-grid > div', '.trust-more', '.faq-list > details',
    '.check-table tbody tr', '.table-note', '.change-list > li', '.contact-copy', '.contact-form', '.price-card', '.founder'];
  document.querySelectorAll(groups.join(',')).forEach(el => {
    if (!below(el)) return;
    const siblings = [...el.parentNode.children].filter(c => c.matches(groups.join(',')));
    const base = el.matches('.intro > p') ? 220 : el.matches('tr') ? 0 : 80;
    mark(el, base + Math.min(siblings.indexOf(el), 8) * (el.matches('tr') ? 35 : 90));
  });
  const scrolling = CSS.supports('animation-timeline: view()');
  if (!scrolling) document.querySelectorAll('.screens .screen').forEach(el => { if (below(el)) marked.push(el); });
  root.classList.add('motion-ready');

  const seen = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    seen.unobserve(entry.target);
    entry.target.classList.add('in');
  }), {rootMargin: '0px 0px -12% 0px'});
  marked.forEach(el => seen.observe(el));
  if (!scrolling) document.querySelectorAll('.workflow-steps li').forEach(li => seen.observe(li));
  addEventListener('beforeprint', () => marked.forEach(el => el.classList.add('in')));

  // 3. Money that counts: tracker figures and sample totals count up once they are well into view.
  const money = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    money.unobserve(entry.target);
    const figures = entry.target.matches('.tracker-figures') ? [...entry.target.querySelectorAll('dd')] : [entry.target];
    figures.forEach((el, i) => count(el, 1500, 250 + i * 220, true));
  }), {rootMargin: '0px 0px -30% 0px'});
  document.querySelectorAll('.tracker-figures, .mini-table tr.total td.num').forEach(el => money.observe(el));
})();
