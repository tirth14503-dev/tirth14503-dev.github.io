'use strict';
// Motion for the MarginGuard page (site-motion.css holds the rest). Off when the visitor prefers reduced motion.
// Money figures count up once, ending on the exact text the page shipped with, and keep their width while counting.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('motion');
  const number = new Intl.NumberFormat('en-US');

  // Shows 0 straight away (width locked, so nothing shifts), then counts to the shipped text after `wait` ms.
  function count(el, ms = 900, wait = 0) {
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
        if (t < 1) requestAnimationFrame(step); else el.style.minWidth = '';
      };
      requestAnimationFrame(step);
    }, wait);
  }

  // 1. The sample audit: flagged amount pulses, then the finding counts up. Switching tabs replays it.
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

  // 2-4. Things that start when they come into view: tracker figures count, and the fallbacks for browsers without
  // scroll-driven animations (screenshot tilt, step rules).
  if (!('IntersectionObserver' in window)) return;
  const scrolling = CSS.supports('animation-timeline: view()');
  const seen = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    seen.unobserve(entry.target);
    entry.target.classList.add('in');
    if (entry.target.matches('.tracker-figures')) entry.target.querySelectorAll('dd').forEach((dd, i) => setTimeout(() => count(dd), i * 120));
  }), {threshold: .35});
  document.querySelectorAll('.tracker-figures').forEach(el => seen.observe(el));
  if (!scrolling) document.querySelectorAll('.screen-main, .workflow-steps').forEach(el => seen.observe(el));
})();
