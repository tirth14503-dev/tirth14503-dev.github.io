'use strict';
// Highlights the header link for the section on screen.
(() => {
  const links = [...document.querySelectorAll('.section-nav a[href^="#"]')];
  const sections = links.map(link => document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;
  const visible = new Map();
  const mark = () => {
    let best = null;
    for (const section of sections) if (visible.get(section) && (!best || visible.get(section) > visible.get(best))) best = section;
    for (const link of links) {
      if (!!best && link.getAttribute('href') === '#' + best.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) visible.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    mark();
  }, {rootMargin: '-90px 0px -45% 0px', threshold: [0, .1, .25, .5, .75, 1]});
  sections.forEach(section => observer.observe(section));
})();

// Below 1100px the links sit behind a Menu button: Tab stays inside the open menu, Esc or a click outside closes it.
(() => {
  const button = document.querySelector('.menu-button');
  const menu = document.getElementById('site-menu');
  if (!button || !menu) return;
  const items = () => [...menu.querySelectorAll('a')].filter(a => a.offsetParent !== null);
  const isOpen = () => button.getAttribute('aria-expanded') === 'true';
  const close = (focusButton) => {
    if (!isOpen()) return;
    button.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    if (focusButton) button.focus();
  };
  const open = () => {
    button.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    const first = items()[0];
    if (first) first.focus();
  };
  button.addEventListener('click', () => (isOpen() ? close(true) : open()));
  menu.addEventListener('click', event => { if (event.target.closest('a')) close(false); });
  document.addEventListener('click', event => { if (isOpen() && !menu.contains(event.target) && !button.contains(event.target)) close(false); });
  document.addEventListener('keydown', event => {
    if (!isOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
    if (event.key !== 'Tab') return;
    const list = items();
    if (!list.length) return;
    const ring = [button, ...list];
    const at = ring.indexOf(document.activeElement);
    const next = at < 0 ? 1 : (at + (event.shiftKey ? -1 : 1) + ring.length) % ring.length;
    event.preventDefault();
    ring[next].focus();
  });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', event => { if (event.matches) close(false); });
})();
