(function () {
  var d = document, $$ = function (s) { return [].slice.call(d.querySelectorAll(s)); };

  /* мобильное меню */
  var nav = d.getElementById('mnav');
  $$('[data-menu]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open); nav.setAttribute('aria-hidden', String(!open));
      d.body.style.overflow = open ? 'hidden' : '';
    });
  });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); d.body.style.overflow = ''; }); });

  /* онлайн-запись: собираем текст и открываем WhatsApp */
  var cfg = {}; try { cfg = JSON.parse(d.getElementById('bkcfg').textContent); } catch (e) {}
  var ask = [];
  function form() { return d.querySelector('[data-book]'); }
  function text(f) {
    var svc = f.querySelector('#bk-svc').value, car = f.querySelector('#bk-car').value.trim();
    var day = f.querySelector('[data-day][aria-pressed=true]');
    var s = 'Здравствуйте! Пишу с сайта, хочу записаться в «' + cfg.name + '».';
    if (svc) s += '\nУслуга: ' + svc + '.';
    if (ask.length) s += '\nХочу узнать цену: ' + ask.join(', ').toLowerCase() + '.';
    if (car) s += '\nАвтомобиль: ' + car + '.';
    if (day) s += '\nКогда удобно: ' + day.dataset.day + '.';
    return s;
  }
  d.addEventListener('click', function (e) {
    var day = e.target.closest('[data-day]');
    if (day) {
      var on = day.getAttribute('aria-pressed') !== 'true';
      $$('[data-day]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      day.setAttribute('aria-pressed', String(on)); return;
    }
    var q = e.target.closest('[data-ask]');
    if (q) {
      var w = q.dataset.ask;
      if (ask.indexOf(w) < 0) ask.push(w);
      q.textContent = 'В заявке';
      return;
    }
    var send = e.target.closest('[data-send]');
    if (send) {
      var f = send.closest('[data-book]') || form(), t = text(f);
      if (cfg.wa) window.open(cfg.wa + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
      else location.href = 'tel:' + cfg.tel;
    }
  });
})();
