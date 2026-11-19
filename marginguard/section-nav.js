'use strict';
// Highlights the header link for the section on screen, and keeps it in view in the phone menu row.
(() => {
  const links = [...document.querySelectorAll('.section-nav a[href^="#"]')];
  const sections = links.map(link => document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;
  const visible = new Map();
  const mark = () => {
    let best = null;
    for (const section of sections) if (visible.get(section) && (!best || visible.get(section) > visible.get(best))) best = section;
    for (const link of links) {
      const on = !!best && link.getAttribute('href') === '#' + best.id;
      if (on) {
        if (link.getAttribute('aria-current') !== 'true') {
          link.setAttribute('aria-current', 'true');
          const row = link.parentElement;
          if (row.scrollWidth > row.clientWidth) row.scrollTo({left: link.offsetLeft - 16, behavior: 'smooth'});
        }
      } else link.removeAttribute('aria-current');
    }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) visible.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    mark();
  }, {rootMargin: '-90px 0px -45% 0px', threshold: [0, .1, .25, .5, .75, 1]});
  sections.forEach(section => observer.observe(section));
})();
