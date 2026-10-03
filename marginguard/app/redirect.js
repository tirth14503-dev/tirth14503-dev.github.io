'use strict';
fetch('/marginguard/app-link.json', {cache:'no-store'})
  .then(response => {if(!response.ok) throw new Error();return response.json();})
  .then(data => {
    const url=new URL(data.url);
    if(url.protocol!=='https:' || !/^[a-z0-9-]+\.trycloudflare\.com$/.test(url.hostname)) throw new Error();
    const link=document.getElementById('open');
    link.href=url.href;link.hidden=false;
    document.getElementById('status').textContent='Opening the working prototype. If the app is unavailable, please try again later.';
    window.location.replace(url.href);
  })
  .catch(() => {document.getElementById('status').textContent='The prototype address is currently unavailable. Please try again later.';});
