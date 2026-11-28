/* The recovery calculator (recovery-calculator/). Worked out in the page as the figures are typed; nothing is sent.
   Billed in error = spend × the assumed error rate (0.1% to 0.5%, an assumption, said so on the page).
   A recovery-audit firm's share = that × its share (10% to 40%; 25% by default). You keep the rest with the firm, and all
   of it with MarginGuard during early access. Without this script the page shows the same sums for the default figures. */
(function () {
  'use strict';
  [].forEach.call(document.querySelectorAll('form[data-calc]'), function (form) {
    var ins = { spend: form.elements.spend, rate: form.elements.rate, fee: form.elements.fee };
    var out = function (name) { return form.querySelector('[data-out="' + name + '"]'); };
    var LIMITS = {
      spend: [1, 1e12, 'Enter your yearly supplier spend as a number, such as 5,000,000.'],
      rate: [0.1, 0.5, 'The error rate assumption is between 0.1% and 0.5%.'],
      fee: [10, 40, 'Enter a share between 10% and 40%.']
    };
    var said = 0;
    Object.keys(ins).forEach(function (n) { ins[n].removeAttribute('readonly'); });

    var parse = function (text) {
      var t = String(text).trim().toLowerCase().replace(/[\s,$£€₹]/g, ''), mult = 1;
      if (/k$/.test(t)) { mult = 1e3; t = t.slice(0, -1); } else if (/m$/.test(t)) { mult = 1e6; t = t.slice(0, -1); }
      else if (/%$/.test(t)) t = t.slice(0, -1);
      return /^\d+(\.\d+)?$/.test(t) ? parseFloat(t) * mult : NaN;
    };
    var whole = function (v) { return Math.round(v).toLocaleString('en-US'); };
    var pct = function (v) { return (Math.round(v * 100) / 100).toString(); };

    var run = function () {
      var v = {}, problem = '';
      Object.keys(ins).forEach(function (n) {
        var x = parse(ins[n].value), bad = !(x >= LIMITS[n][0] && x <= LIMITS[n][1]);
        ins[n].setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && !problem) problem = LIMITS[n][2];
        v[n] = x;
      });
      out('err').textContent = problem;
      if (problem) {
        ['found', 'cut', 'keepfirm', 'keepus'].forEach(function (k) { out(k).textContent = '–'; });
        out('range').textContent = 'At 0.1% to 0.5%: –';
        return;
      }
      var found = v.spend * v.rate / 100, cut = found * v.fee / 100;
      out('found').textContent = whole(found);
      out('range').textContent = 'At 0.1% to 0.5%: ' + whole(v.spend * 0.001) + ' to ' + whole(v.spend * 0.005);
      out('feewhy').textContent = pct(v.fee) + '% of what is recovered, found in a later look-back audit';
      out('cut').textContent = whole(cut);
      out('keepfirm').textContent = whole(found - cut);
      out('keepus').textContent = whole(found);
      clearTimeout(said);
      said = setTimeout(function () {
        out('said').textContent = 'Billed in error, estimated: ' + whole(found) + '. A recovery-audit firm’s share: ' + whole(cut) +
          '. You keep ' + whole(found - cut) + ' with the firm, or ' + whole(found) + ' with MarginGuard during early access.';
      }, 700);
    };
    Object.keys(ins).forEach(function (n) { ins[n].addEventListener('input', run); });
    form.querySelector('.rp-reset').addEventListener('click', function () {
      Object.keys(ins).forEach(function (n) { ins[n].value = ins[n].getAttribute('data-def'); });
      run();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    run();
  });
})();
