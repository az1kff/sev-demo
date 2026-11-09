(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var num = function (v) { return Math.round(v).toLocaleString('ru-RU').replace(/\s/g, '\u00a0'); };
  var rub = function (v) { return num(v) + '\u00a0<span class="r">₽</span>'; };
  var plural = function (n, a, b, c) { var m10 = n % 10, m100 = n % 100; return (m10 === 1 && m100 !== 11) ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? b : c; };

  // меню
  var b = document.querySelector('.burger'), n = document.getElementById('nav');
  if (b && n) {
    b.addEventListener('click', function () {
      var o = n.classList.toggle('open');
      b.setAttribute('aria-expanded', o);
      b.setAttribute('aria-label', o ? 'Закрыть меню' : 'Открыть меню');
    });
    n.addEventListener('click', function (e) { if (e.target.tagName === 'A') { n.classList.remove('open'); b.setAttribute('aria-expanded', false); } });
  }

  // расчёт по городу. Правило Дмитрия: первый час полностью, дальше по полчаса;
  // 1:05 — это час, 1:06 — уже полтора.
  var billed = function (mins) { return 60 + 30 * Math.ceil(Math.max(0, mins - 65) / 30); };
  var hoursWord = function (h) { return h % 1 ? String(h).replace('.', ',') + ' часа' : h + ' ' + plural(h, 'час', 'часа', 'часов'); };
  var calc = document.getElementById('calc'), lastText = '';
  if (calc) {
    var car = +calc.dataset.car, ld = +calc.dataset.loader, range = calc.mins;
    var total = calc.querySelector('[data-total]');
    var upd = function () {
      var m = +range.value, h = billed(m) / 60, l = +calc.loaders.value;
      var hh = Math.floor(m / 60), mm = m % 60;
      calc.querySelector('#t-out').textContent = (hh ? hh + ' ч ' : '') + (mm ? mm + ' мин' : (hh ? '' : '0 мин'));
      range.setAttribute('aria-valuetext', (hh ? hh + ' ч ' : '') + mm + ' мин');
      calc.querySelector('[data-billed]').textContent = hoursWord(h);
      calc.querySelectorAll('[data-h]').forEach(function (e) { e.textContent = String(h).replace('.', ','); });
      calc.querySelector('[data-ln]').textContent = l;
      calc.querySelector('[data-car-sum]').innerHTML = rub(car * h);
      calc.querySelector('[data-load-sum]').innerHTML = rub(ld * l * h);
      calc.querySelector('[data-lrow]').hidden = !l;
      var sum = car * h + ld * l * h;
      total.innerHTML = rub(sum);
      if (!reduce) { total.classList.remove('bump'); void total.offsetWidth; total.classList.add('bump'); }
      lastText = 'По расчёту на сайте: ' + hoursWord(h) + ', ' + (l ? l + ' ' + plural(l, 'грузчик', 'грузчика', 'грузчиков') : 'без грузчиков') + ' — ' + num(sum).replace(/\u00a0/g, ' ') + ' ₽';
    };
    calc.addEventListener('input', upd);
    calc.querySelectorAll('[data-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        range.value = Math.min(+range.max, Math.max(+range.min, +range.value + +btn.dataset.step)); upd();
      });
    });
    calc.addEventListener('submit', function (e) { e.preventDefault(); });
    upd();
    calc.querySelector('[data-go]').addEventListener('click', function () {
      var f = document.querySelector('form.req');
      if (!f) return;
      f.what.value = lastText;
      f.loaders.selectedIndex = +calc.loaders.value;
    });
  }

  // выгрузка: вес мешка = цена за этаж
  var bags = document.getElementById('bags');
  if (bags) {
    var out = bags.querySelector('output');
    var bu = function () {
      var q = Math.max(1, +bags.n.value || 1), kg = +bags.kg.value, fl = Math.max(1, +bags.fl.value || 1);
      out.innerHTML = q + ' ' + plural(q, 'мешок', 'мешка', 'мешков') + ' × ' + kg + ' ₽ × ' + fl + ' ' + plural(fl, 'этаж', 'этажа', 'этажей') + ' = <b>' + rub(q * kg * fl) + '</b>';
    };
    bags.addEventListener('input', bu);
    bags.addEventListener('submit', function (e) { e.preventDefault(); });
    bu();
  }

  // фургон наполняется коробками, когда виден
  var van = document.querySelector('.van');
  if (van) {
    if (reduce || !('IntersectionObserver' in window)) van.classList.add('in');
    else new IntersectionObserver(function (es, io) {
      if (es[0].isIntersecting) { van.classList.add('in'); io.disconnect(); }
    }, { threshold: .6 }).observe(van);
  }

  // заявка: собираем текст и открываем мессенджер Дмитрия
  document.querySelectorAll('form.req').forEach(function (f) {
    var err = f.querySelector('.err');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var bad = [];
      f.querySelectorAll('input').forEach(function (i) {
        var miss = i.required && !i.value.trim();
        i.setAttribute('aria-invalid', miss);
        if (miss) bad.push(i);
      });
      if (bad.length) { err.hidden = false; bad[0].focus(); return; }
      err.hidden = true;
      var lines = [f.dataset.msg];
      f.querySelectorAll('.f').forEach(function (l) {
        var i = l.querySelector('input,select');
        var v = i.type === 'date' ? i.value.split('-').reverse().join('.') : i.value;
        if (v) lines.push(l.querySelector('span').firstChild.textContent.trim() + ': ' + v);
      });
      var text = lines.join('\n');
      if (f.dataset.wa) { location.href = 'https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(text); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      if (f.dataset.tg) { alert('Текст заявки скопирован. Вставьте его в чат с Дмитрием.'); location.href = 'https://t.me/' + f.dataset.tg; return; }
      alert('Это черновик сайта — мессенджер подключим, когда будут контакты.\n\n' + text);
    });
  });
})();
