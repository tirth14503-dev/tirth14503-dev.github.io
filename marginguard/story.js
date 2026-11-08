'use strict';

const tabList = document.querySelector('.example-tabs');
const tabs = [...tabList.querySelectorAll('[role="tab"]')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

function showExample(index) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
  });
}

panels.forEach((panel, i) => {
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tabs[i].id);
  panel.tabIndex = 0;
  tabs[i].addEventListener('click', () => showExample(i));
});
tabList.addEventListener('keydown', event => {
  const current = tabs.indexOf(event.target);
  if (current < 0) return;
  let next;
  switch (event.key) {
    case 'ArrowLeft': next = (current + tabs.length - 1) % tabs.length; break;
    case 'ArrowRight': next = (current + 1) % tabs.length; break;
    case 'Home': next = 0; break;
    case 'End': next = tabs.length - 1; break;
    default: return;
  }
  event.preventDefault();
  showExample(next);
  tabs[next].focus({preventScroll: true});
});
tabList.hidden = false;

const hero = document.querySelector('.hero');
const grid = document.querySelector('.hero-grid');
const motionButton = document.querySelector('#motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = false;
let heroVisible = true;
let frame = 0;

function queueGrid() {
  if (frame || !heroVisible || document.hidden || document.body.dataset.motion !== 'on') return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    if (!heroVisible || document.hidden || document.body.dataset.motion !== 'on') return;
    const distance = Math.max(0, -hero.getBoundingClientRect().top);
    grid.style.setProperty('--grid-offset', Math.min(50, distance * .12) + 'px');
  });
}

function syncMotion() {
  const enabled = !paused && !reducedMotion.matches;
  document.body.dataset.motion = enabled ? 'on' : 'off';
  motionButton.hidden = reducedMotion.matches;
  motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
  if (enabled) queueGrid();
  else {
    cancelAnimationFrame(frame);
    frame = 0;
    grid.style.removeProperty('--grid-offset');
  }
}

motionButton.addEventListener('click', () => {
  paused = !paused;
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
addEventListener('scroll', queueGrid, {passive: true});
addEventListener('resize', queueGrid, {passive: true});
document.addEventListener('visibilitychange', queueGrid);

if ('IntersectionObserver' in window) {
  const viewport = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    if (heroVisible) queueGrid();
  });
  viewport.observe(hero);
  const chapters = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        chapters.unobserve(entry.target);
      }
    }
  }, {threshold: .24});
  document.querySelectorAll('.chapter').forEach(chapter => chapters.observe(chapter));
}
syncMotion();
