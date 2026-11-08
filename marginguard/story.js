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
const documentRunway = document.querySelector('.hero-visual');
const documentScene = document.querySelector('.document-scene');
const documentStack = document.querySelector('.document-stack');
const motionButton = document.querySelector('#motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const documentPath = [
  {x: .027, y: 9, z: 8, pitch: 29, turn: -38, roll: -15, spread: 1.08},
  {x: .005, y: -7, z: 42, pitch: 47, turn: 8, roll: -8, spread: 1.42},
  {x: .12, y: 9, z: -24, pitch: 18, turn: 57, roll: 13, spread: .88},
];
let paused = false;
let heroVisible = true;
let frame = 0;

function moveDocuments(bounds) {
  // The position in the page, rather than time, owns the pose. Scrolling back reverses it.
  if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
  const runway = documentRunway.getBoundingClientRect();
  const top = runway.top + scrollY;
  const start = Math.max(0, top - innerHeight * .81);
  const end = Math.max(top + bounds.height * .55, runway.bottom + scrollY - bounds.height);
  const progress = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
  const step = progress * (documentPath.length - 1);
  const segment = Math.min(Math.floor(step), documentPath.length - 2);
  const fraction = step - segment;
  const eased = fraction * fraction * (3 - 2 * fraction);
  const from = documentPath[segment];
  const to = documentPath[segment + 1];
  const value = name => from[name] + (to[name] - from[name]) * eased;
  const x = (value('x') * bounds.width).toFixed(2);
  const y = value('y').toFixed(2);
  const z = value('z').toFixed(2);
  const pitch = value('pitch').toFixed(2);
  const turn = value('turn').toFixed(2);
  const roll = value('roll').toFixed(2);
  documentStack.style.setProperty('--pose', `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateX(${pitch}deg) rotateY(${turn}deg) rotateZ(${roll}deg)`);
  documentStack.style.setProperty('--pose-spread', value('spread').toFixed(3));
}

function queueScene() {
  if (frame || !heroVisible || document.hidden || document.body.dataset.motion !== 'on') return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    if (!heroVisible || document.hidden || document.body.dataset.motion !== 'on') return;
    const distance = Math.max(0, -hero.getBoundingClientRect().top);
    const bounds = documentScene.getBoundingClientRect();
    grid.style.setProperty('--grid-offset', Math.min(50, distance * .12) + 'px');
    moveDocuments(bounds);
  });
}

function syncMotion() {
  const enabled = !paused && !reducedMotion.matches;
  document.body.dataset.motion = enabled ? 'on' : 'off';
  motionButton.hidden = reducedMotion.matches;
  motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
  if (enabled) queueScene();
  else {
    cancelAnimationFrame(frame);
    frame = 0;
    grid.style.removeProperty('--grid-offset');
    if (reducedMotion.matches) {
      documentStack.style.removeProperty('--pose');
      documentStack.style.removeProperty('--pose-spread');
    }
  }
}

motionButton.addEventListener('click', () => {
  paused = !paused;
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
addEventListener('scroll', queueScene, {passive: true});
addEventListener('resize', queueScene, {passive: true});
document.addEventListener('visibilitychange', queueScene);

if ('IntersectionObserver' in window) {
  const viewport = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    if (heroVisible) queueScene();
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
