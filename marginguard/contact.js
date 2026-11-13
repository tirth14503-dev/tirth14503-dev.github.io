'use strict';
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');
  const button = form.querySelector('button[type="submit"]');
  const ENDPOINT = 'https://app.tirthalkothari.com/api/public/sales-request';
  const EMAIL = 'tirth14503@gmail.com';
  let started = 0;

  const begin = () => { if (!started) started = Date.now(); };
  form.addEventListener('focusin', begin);
  form.addEventListener('input', begin);

  function say(message, tone) {
    status.textContent = message;
    status.dataset.tone = tone || '';
  }

  function fallback(data) {
    const body = `Name: ${data.name}\nCompany: ${data.company}\nRole: ${data.role}\nTeam size: ${data.team_size}\nInterested in: ${data.topic}\n\n${data.message}`;
    const link = document.createElement('a');
    link.href = `mailto:${EMAIL}?subject=${encodeURIComponent('MarginGuard sales request')}&body=${encodeURIComponent(body)}`;
    link.textContent = 'send it by email instead';
    link.className = 'text-link';
    status.textContent = 'The request couldn’t be sent just now. You can ';
    status.append(link, '.');
    status.dataset.tone = 'error';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    for (const key of Object.keys(data)) data[key] = String(data[key]).trim();
    const missing = ['name', 'email', 'company'].filter(k => !data[k]);
    if (missing.length) {
      say('Please add your name, work email and company.', 'error');
      form.querySelector(`[name="${missing[0]}"]`).focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      say('Please check the email address.', 'error');
      form.querySelector('[name="email"]').focus();
      return;
    }
    data.elapsed_ms = started ? Date.now() - started : 0;
    button.disabled = true;
    say('Sending…');
    try {
      const response = await fetch(form.dataset.endpoint || ENDPOINT, {
        method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
        headers: {'Content-Type': 'text/plain;charset=UTF-8'},
        body: JSON.stringify(data),
      });
      if (response.ok) {
        form.reset();
        form.querySelectorAll('.field-row, label, .form-foot').forEach(el => { el.hidden = true; });
        say('Thanks. Your request has been received, and you’ll get a reply by email.', 'success');
        status.tabIndex = -1;
        status.focus();
        if (typeof gtag === 'function') gtag('event', 'generate_lead', {form: 'contact_sales'});
        return;
      }
      if (response.status === 422) say('Please check the form: name, a valid work email and company are needed.', 'error');
      else if (response.status === 429) fallback(data);
      else fallback(data);
    } catch (error) {
      fallback(data);
    } finally {
      button.disabled = false;
    }
  });
})();
