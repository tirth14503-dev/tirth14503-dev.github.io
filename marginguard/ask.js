'use strict';
/* Ask MarginGuard: the box in the opening, and the panel its answers open in.

   The engine is one function, answer(question), on window.MGAsk. Today it matches the question to the answers in
   ask-buyers.js or ask-sellers.js by keyword and synonym scoring, in the browser: nothing the visitor types is sent
   anywhere, stored or logged. A real model can replace it later; the panel takes whatever answer() returns, or a
   promise of it:
     { type: 'answer', item, related: [item, item], score }   item = one entry of MG_ASK.answers
     { type: 'none', related: [...] }                          nothing matched well enough: say so, honestly
   Without this script the box is not shown (home.css), and the page is unchanged. */
(function () {
  var D = window.MG_ASK, form = document.getElementById('ask');
  if (!D || !form || !window.HTMLDialogElement) return;

  /* ---------- the engine ---------- */
  var STOP = ('a an the is are am was were be been i im my me mine we our us you your it its this that these those to of for in on at by ' +
    'with and or but do does did doing can could will would should shall may might must how what which whom when there ' +
    'here have has had any anything some something about from as if so not no yes please tell want wanted need know get got give ' +
    'show let one ones use using just also very really much many more most than then them they their he she his her all every').split(' ');
  var SYN = {
    secure: 'safe', security: 'safe', protect: 'safe', protected: 'safe', safety: 'safe', privacy: 'private', confidential: 'private',
    pricing: 'cost', priced: 'price', costing: 'cost', fee: 'cost', fees: 'cost', vendor: 'supplier', vendors: 'supplier',
    overpaying: 'overpay', overpaid: 'overpay', overcharging: 'overcharge', overcharged: 'overcharge', overbilled: 'overcharge',
    bills: 'invoice', invoicing: 'invoice', invoiced: 'invoice', login: 'sign', logon: 'sign', signup: 'register',
    erase: 'delete', remove: 'delete', export: 'download', spreadsheet: 'excel', spreadsheets: 'excel', xlsx: 'excel', xls: 'excel',
    duplicated: 'duplicate', double: 'duplicate', twice: 'duplicate', refunds: 'refund', disputes: 'dispute', claims: 'claim',
    inventory: 'stock', carrier: 'freight', carriers: 'freight', shipping: 'freight', ai: 'ai', ml: 'ai', gpt: 'ai', chatgpt: 'ai'
  };
  /* synonyms first, then a rough stem, so "prices", "priced" and "pricing" all meet "price" */
  var stem = function (w) {
    w = SYN[w] || w;
    if (w.length > 4 && /ies$/.test(w)) w = w.slice(0, -3) + 'y';
    else if (w.length > 5 && /ing$/.test(w)) w = w.slice(0, -3);
    else if (w.length > 4 && /ed$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 4 && /(s|x|sh|ch)es$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 3 && /[^s]s$/.test(w)) w = w.slice(0, -1);
    if (w.length > 4 && /[^e]e$/.test(w)) w = w.slice(0, -1);
    return w;
  };
  var words = function (text) {
    return String(text).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ')
      .filter(function (w) { return w && STOP.indexOf(w) < 0; }).map(stem);
  };
  var byId = {}, N = D.answers.length, df = {};
  D.answers.forEach(function (it) {
    byId[it.id] = it;
    it._k = {}; words(it.k).forEach(function (w) { it._k[w] = 1; });
    it._q = {}; words(it.q).forEach(function (w) { it._q[w] = 1; });
    var seen = {};
    Object.keys(it._k).concat(Object.keys(it._q)).forEach(function (w) { if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1; } });
  });
  var weight = function (w) { return 1 + Math.log(N / (df[w] || 0.5)); };
  var norm = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
  var pick = function (ids) { return (ids || []).map(function (id) { return byId[id]; }).filter(Boolean); };

  var answer = function (question) {
    var q = String(question || '').slice(0, 300);
    for (var i = 0; i < N; i++) {                                     /* a chip, or a related question asked as written */
      if (norm(D.answers[i].q) === norm(q)) return { type: 'answer', item: D.answers[i], related: pick(D.answers[i].rel), score: 99 };
    }
    var ws = words(q).filter(function (w, j, all) { return all.indexOf(w) === j; });
    if (!ws.length) return { type: 'none', related: pick(D.chips) };
    var total = 0;
    ws.forEach(function (w) { total += weight(w); });
    var ranked = D.answers.map(function (it) {
      var s = 0;
      ws.forEach(function (w) { if (it._k[w]) s += (it._q[w] ? 1.3 : 1) * weight(w); else if (it._q[w]) s += 0.6 * weight(w); });
      return { it: it, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
    var best = ranked[0];
    if (best.s >= 2 && best.s / total >= 0.34) return { type: 'answer', item: best.it, related: pick(best.it.rel), score: best.s };
    var near = ranked.filter(function (r) { return r.s > 0; }).slice(0, 2).map(function (r) { return r.it; });
    return { type: 'none', related: near.length ? near : pick(D.chips) };
  };
  window.MGAsk = { answer: answer };

  /* ---------- the panel ---------- */
  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  var link = function (label, href, launch) {
    var a = el('a', 'ask-act', label);
    a.href = href;
    if (launch) a.setAttribute('data-launch', launch);
    if (/^https?:/.test(href)) a.rel = 'noopener';
    return a;
  };
  var money = function (v) { return '$' + Math.round(v).toLocaleString('en-US'); };
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var panel = el('dialog', 'ask-panel');
  panel.setAttribute('aria-labelledby', 'ask-title');
  var head = el('div', 'ask-head'), title = el('h2', '', 'Ask ' + D.product), close = el('button', 'ask-close', 'Close');
  title.id = 'ask-title'; close.type = 'button';
  head.appendChild(title); head.appendChild(close);
  var log = el('div', 'ask-log');
  log.setAttribute('aria-live', 'polite');
  var more = el('form', 'ask-more'), moreLabel = el('label', 'vh', 'Ask another question'), moreIn = el('input'), moreGo = el('button', '', 'Ask');
  moreIn.id = 'ask-more'; moreLabel.htmlFor = 'ask-more'; moreIn.type = 'text'; moreIn.maxLength = 300; moreIn.autocomplete = 'off';
  moreIn.placeholder = 'Ask another question…'; moreGo.type = 'submit';
  more.appendChild(moreLabel); more.appendChild(moreIn); more.appendChild(moreGo);
  var note = el('p', 'ask-note', 'Answers come from this site’s own pages and are matched in your browser. Nothing you type is sent anywhere.');
  panel.appendChild(head); panel.appendChild(log); panel.appendChild(more); panel.appendChild(note);
  document.body.appendChild(panel);

  var shut = function () {
    if (!panel.open || panel.classList.contains('closing')) return;
    document.documentElement.classList.remove('ask-open');
    if (calm) { panel.close(); return; }
    panel.classList.add('closing');
    setTimeout(function () { panel.classList.remove('closing'); panel.close(); }, 220);
  };
  var open = function () {
    if (panel.open) return;
    panel.showModal();
    document.documentElement.classList.add('ask-open');
  };
  close.addEventListener('click', shut);
  panel.addEventListener('cancel', function (e) { e.preventDefault(); shut(); });
  panel.addEventListener('click', function (e) {
    if (e.target === panel) {                                         /* a click on the dimmed page beside the panel */
      var r = panel.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) shut();
    }
    var a = e.target.closest && e.target.closest('a');
    if (a && /^#/.test(a.getAttribute('href') || '')) shut();          /* a link to this page: go there with the panel closed */
  });

  var body = function (box, paras) {
    var list = null;
    paras.forEach(function (p) {
      if (/^- /.test(p)) {
        if (!list) { list = el('ul'); box.appendChild(list); }
        list.appendChild(el('li', '', p.slice(2)));
      } else { list = null; box.appendChild(el('p', '', p)); }
    });
  };
  var relatedBox = function (box, items, label) {
    if (!items.length) return;
    var r = el('div', 'ask-rel');
    r.appendChild(el('p', 'ask-rel-h', label));
    items.forEach(function (it) {
      var b = el('button', 'ask-chip', it.q);
      b.type = 'button';
      b.addEventListener('click', function () { ask(it.q); });
      r.appendChild(b);
    });
    box.appendChild(r);
  };
  var actions = function (box, list) {
    if (!list || !list.length) return;
    var p = el('p', 'ask-acts');
    list.forEach(function (x) { p.appendChild(link(x[0], x[1], x[2])); });
    box.appendChild(p);
  };

  /* the personal estimate: two questions, a range, the assumption, and the checks that matter most */
  var parse = function (s) {
    var t = String(s).toLowerCase().replace(/[\s,$£€]/g, ''), m = t.match(/^(\d+(?:\.\d+)?)(k|m|million|thousand)?$/);
    if (!m) return null;
    var v = parseFloat(m[1]) * ({ k: 1e3, thousand: 1e3, m: 1e6, million: 1e6 }[m[2]] || 1);
    return v > 0 && v < 1e11 ? v : null;
  };
  var estimate = function (box) {
    var E = D.estimate, f = el('form', 'ask-est'), n = Date.now();
    f.noValidate = true;
    f.appendChild(el('p', 'ask-est-h', E.ask));
    var field = function (label, ph, id, money) {
      var l = el('label', 'ask-field'), wrap = el('span', 'ask-in'), i = el('input');
      l.appendChild(el('span', 'ask-field-l', label));
      if (money) wrap.appendChild(el('span', 'ask-unit', '$'));
      i.type = 'text'; i.inputMode = money ? 'decimal' : 'numeric'; i.autocomplete = 'off'; i.placeholder = ph; i.id = id + n;
      wrap.appendChild(i); l.appendChild(wrap); f.appendChild(l);
      return i;
    };
    var amount = field(E.amount, 'e.g. 250,000', 'ask-amt', true), count = field(E.count, 'e.g. 40', 'ask-cnt', false);
    var go = el('button', 'ask-est-go', 'Show my range'); go.type = 'submit';
    f.appendChild(go);
    var out = el('div', 'ask-est-out'); out.setAttribute('aria-live', 'polite');
    f.appendChild(out);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = parse(amount.value), c = parse(count.value);
      amount.setAttribute('aria-invalid', String(!m)); count.setAttribute('aria-invalid', String(!c));
      out.textContent = '';
      if (!m || !c) { out.appendChild(el('p', 'ask-warn', 'Please type both as numbers, like 250,000 and 40.')); return; }
      var year = m * 12;
      var r = el('p', 'ask-range');
      r.appendChild(el('span', 'ask-range-l', 'A rough range'));
      r.appendChild(el('b', '', money(year * E.low) + ' to ' + money(year * E.high) + ' ' + E.period));
      out.appendChild(r);
      out.appendChild(el('p', 'ask-assume', 'Assumption: ' + (E.low * 100) + '% to ' + (E.high * 100) + '% ' + E.what + ', on ' + money(year) + ' ' + E.period + '. ' + E.note));
      out.appendChild(el('p', 'ask-rel-h', 'The checks that matter most for you'));
      var list = el('ul', 'ask-recs');
      D.recs.forEach(function (x) {
        var hit = x.when === 'always' || (x.when === 'many' && c >= 25) || (x.when === 'few' && c < 25) || (x.when === 'big' && m >= 100000);
        if (hit) list.appendChild(el('li', '', x.t));
      });
      out.appendChild(list);
      actions(out, [E.cta]);
    });
    box.appendChild(f);
  };

  var ask = function (question) {
    var q = String(question || '').trim().slice(0, 300);
    if (!q) return;
    open();
    Promise.resolve(window.MGAsk.answer(q)).then(function (res) {
      var turn = el('div', 'ask-turn'), you = el('p', 'ask-you');
      you.appendChild(el('span', 'vh', 'You asked: '));
      you.appendChild(document.createTextNode(q));
      turn.appendChild(you);
      var box = el('div', 'ask-a');
      if (res && res.type === 'answer') {
        var it = res.item;
        box.appendChild(el('h3', '', it.q));
        body(box, it.a);
        if (it.href) {
          var src = el('p', 'ask-src', 'From ');
          var page = D.pages[it.href] || D.pages[it.href.split('#')[0]] || D.pages['#' + it.href.split('#')[1]] || 'this site';
          var a = el('a', '', page); a.href = it.href;
          src.appendChild(a);
          box.appendChild(src);
        }
        actions(box, it.actions);
        if (it.est) estimate(box);
        relatedBox(box, res.related || [], 'Related questions');
      } else {
        box.classList.add('ask-none');
        box.appendChild(el('h3', '', 'I don’t know that one'));
        box.appendChild(el('p', '', D.fallback.text));
        actions(box, D.fallback.actions);
        relatedBox(box, (res && res.related) || [], 'Questions I can answer');
      }
      turn.appendChild(box);
      log.appendChild(turn);
      log.scrollTo({ top: turn.offsetTop - log.offsetTop - 4, behavior: calm ? 'auto' : 'smooth' });   /* the panel scrolls, the page behind it doesn't */
    });
  };

  var heroIn = document.getElementById('ask-q');
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(heroIn.value); heroIn.value = ''; });
  more.addEventListener('submit', function (e) { e.preventDefault(); ask(moreIn.value); moreIn.value = ''; });
  [].forEach.call(form.querySelectorAll('[data-ask]'), function (b) {
    b.addEventListener('click', function () { var it = byId[b.getAttribute('data-ask')]; ask(it ? it.q : b.textContent); });
  });
})();
