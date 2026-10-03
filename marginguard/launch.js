'use strict';
fetch('/marginguard/app-link.json?v=' + Date.now(), {cache:'no-store'})
  .then(response => {if(!response.ok) throw new Error('App link unavailable');return response.json();})
  .then(data => {
    const url = new URL(data.url);
    if(url.protocol !== 'https:' || url.username || url.password || url.port || !/^(?:[a-z0-9-]+\.trycloudflare\.com|app\.tirthalkothari\.com)$/.test(url.hostname)) return;
    document.querySelectorAll('[data-launch]').forEach(link => {link.href=url.href;});
  })
  .catch(() => {/* Keep the portfolio's app launch page as the fallback. */});
