(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // меню
  var b = document.querySelector('.burger'), n = document.getElementById('nav');
  if (b && n) b.addEventListener('click', function () {
    var o = n.classList.toggle('open');
    b.setAttribute('aria-expanded', o);
    b.setAttribute('aria-label', o ? 'Закрыть меню' : 'Открыть меню');
  });

  // калькулятор переезда: 1500 ₽/ч машина, 1200 ₽/ч грузчик, 80 ₽/км, срочно +10%
  var calc = document.querySelector('.calc-box'), lastText = '';
  if (calc) {
    var fmt = function (v) { return Math.round(v).toLocaleString('ru-RU') + ' ₽'; };
    var word = function (n) { return n === 1 ? 'грузчик' : (n > 1 && n < 5 ? 'грузчика' : 'грузчиков'); };
    var sum = calc.querySelector('[data-sum]');
    var upd = function () {
      var h = +calc.hours.value, l = +calc.loaders.value, km = +calc.km.value, u = calc.urgent.checked;
      var total = h * 1500 + l * 1200 * h + km * 80;
      if (u) total *= 1.1;
      calc.querySelector('[data-for=hours]').textContent = h + ' ч';
      calc.querySelector('[data-for=loaders]').textContent = l;
      calc.querySelector('[data-for=km]').textContent = km + ' км';
      sum.textContent = fmt(total);
      sum.classList.add('bump'); setTimeout(function () { sum.classList.remove('bump'); }, 180);
      lastText = 'Расчёт на сайте: ' + h + ' ч, ' + l + ' ' + word(l) + (km ? ', ' + km + ' км за городом' : '') + (u ? ', срочно' : '') + ' — примерно ' + fmt(total);
    };
    calc.addEventListener('input', upd); upd();
    var go = calc.querySelector('[data-calc-go]');
    if (go) go.addEventListener('click', function () {
      var what = document.querySelector('.req input[name=what]');
      if (what && !what.value) what.value = lastText;
    });
  }

  // фургон наполняется коробками, когда виден
  var van = document.querySelector('.van');
  if (van) {
    if (reduce || !('IntersectionObserver' in window)) van.classList.add('in');
    else new IntersectionObserver(function (es, io) {
      if (es[0].isIntersecting) { van.classList.add('in'); io.disconnect(); }
    }, { threshold: .5 }).observe(van);
  }

  // дней до Нового года
  var dEl = document.querySelector('[data-days]');
  if (dEl) {
    var now = new Date(), ny = new Date(now.getFullYear() + 1, 0, 1);
    var days = Math.ceil((ny - now) / 864e5);
    dEl.textContent = days;
    var m10 = days % 10, m100 = days % 100;
    document.querySelector('[data-word]').textContent =
      (m10 === 1 && m100 !== 11) ? 'день' : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? 'дня' : 'дней';
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
        var i = l.querySelector('input');
        if (i.value) lines.push(l.querySelector('span').firstChild.textContent.trim() + ': ' + i.value);
      });
      var text = lines.join('\n');
      if (f.dataset.wa) { location.href = 'https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(text); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      if (f.dataset.tg) { alert('Текст заявки скопирован. Вставьте его в чат с Дмитрием.'); location.href = 'https://t.me/' + f.dataset.tg; return; }
      alert('Это черновик сайта — мессенджер подключим, когда будут контакты.\n\n' + text);
    });
  });
})();
