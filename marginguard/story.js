'use strict';

// Example audit tabs
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

// Overview film: poster with a play button, native controls once playing
const film = document.querySelector('.film');
const video = document.getElementById('film-video');
const playButton = film.querySelector('.film-play');

playButton.addEventListener('click', () => {
  film.classList.add('is-playing');
  video.controls = true;
  const attempt = video.play();
  if (attempt && attempt.catch) attempt.catch(() => {});
  video.focus({preventScroll: true});
  if (typeof gtag === 'function') gtag('event', 'video_start', {video_title: 'The quiet leak'});
});
video.addEventListener('ended', () => {
  if (typeof gtag === 'function') gtag('event', 'video_complete', {video_title: 'The quiet leak'});
});

// Pause the film when it scrolls out of view
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting && !video.paused) video.pause();
  }, {threshold: .2}).observe(video);
}
