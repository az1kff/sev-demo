(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var go = function (el) { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };

  // меню
  var b = document.querySelector('.burger'), n = document.getElementById('nav');
  if (b && n) b.addEventListener('click', function () {
    var o = n.classList.toggle('open');
    b.setAttribute('aria-expanded', o);
    b.setAttribute('aria-label', o ? 'Закрыть меню' : 'Открыть меню');
  });

  // дней до Нового года
  var now = new Date(), ny = new Date(now.getFullYear() + 1, 0, 1);
  var days = Math.ceil((ny - now) / 864e5), m10 = days % 10, m100 = days % 100;
  var word = (m10 === 1 && m100 !== 11) ? 'день' : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? 'дня' : 'дней';
  document.querySelectorAll('[data-days]').forEach(function (e) { e.textContent = days; });
  document.querySelectorAll('[data-word]').forEach(function (e) { e.textContent = word; });

  var form = document.querySelector('form.req');

  // афиша: нажали на праздник — подставили в заявку
  document.querySelectorAll('.bill button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!form) return;
      form.event.value = btn.dataset.event;
      go(document.getElementById('zayavka'));
      setTimeout(function () { form.date.focus({ preventScroll: true }); }, reduce ? 0 : 500);
    });
  });

  // календарь и билеты Деда Мороза
  var bk = document.getElementById('booking');
  if (bk) {
    var chosen = bk.querySelector('.chosen'), label = bk.querySelector('[data-chosen]');
    bk.addEventListener('submit', function (e) { e.preventDefault(); });
    bk.addEventListener('change', function (e) {
      if (e.target.name === 'day') {
        bk.querySelectorAll('.tickets').forEach(function (t) { t.hidden = t.dataset.day !== e.target.value; });
        bk.querySelectorAll('input[name=opt]').forEach(function (o) { o.checked = false; });
        chosen.hidden = true;
        if (form) form.pick.value = '';
      } else if (e.target.name === 'opt') {
        var price = (+e.target.dataset.price).toLocaleString('ru-RU') + ' ₽';
        label.textContent = e.target.value + ' — ' + price;
        chosen.hidden = false;
        if (form) form.pick.value = e.target.value + ' — ' + price.replace(/\s/g, ' ');
      }
    });
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
