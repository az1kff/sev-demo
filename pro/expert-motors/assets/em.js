(function () {
  var d = document, w = window, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var R = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* меню на телефоне */
  var nav = d.getElementById('mnav');
  $$('[data-menu]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open); nav.setAttribute('aria-hidden', String(!open));
      d.body.style.overflow = open ? 'hidden' : '';
    });
  });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); d.body.style.overflow = ''; }); });

  /* нижняя панель появляется после первого экрана */
  var dock = d.querySelector('.dock'), hero = d.querySelector('.hero,.ph');
  if (dock && hero && 'IntersectionObserver' in w) new IntersectionObserver(function (es) { dock.classList.toggle('on', !es[0].isIntersecting); }, { threshold: .15 }).observe(hero);
  else if (dock) dock.classList.add('on');

  /* параллакс одного слоя: фон первого экрана и широкая фотография */
  var layers = $$('[data-px]');
  if (!R && layers.length) {
    var tick = false;
    var run = function () {
      tick = false;
      var vh = w.innerHeight;
      layers.forEach(function (el) {
        var box = el.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        var k = parseFloat(el.dataset.px), mid = box.top + box.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-mid * k).toFixed(1) + 'px,0)';
      });
    };
    w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* манифест: слова загораются по мере прокрутки */
  var man = d.querySelector('[data-man]');
  if (man) {
    var words = $$('span', man), mt = false;
    var lit = function () {
      mt = false;
      var b = man.getBoundingClientRect(), vh = w.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * .85 - b.top) / (b.height + vh * .35)));
      var n = Math.round(p * words.length);
      words.forEach(function (s, i) { s.classList.toggle('on', i < n); });
    };
    if (R) words.forEach(function (s) { s.classList.add('on'); });
    else { w.addEventListener('scroll', function () { if (!mt) { mt = true; requestAnimationFrame(lit); } }, { passive: true }); lit(); }
  }

  /* строки услуг: фото следует за курсором */
  var peek = d.querySelector('.peek');
  if (peek && matchMedia('(hover:hover)').matches) {
    var pimg = peek.querySelector('img'), px = 0, py = 0, raf = 0;
    $$('.row[data-img]').forEach(function (r) {
      r.addEventListener('mouseenter', function () { pimg.src = r.dataset.img; peek.classList.add('on'); });
      r.addEventListener('mouseleave', function () { peek.classList.remove('on'); });
    });
    d.addEventListener('mousemove', function (e) {
      px = e.clientX + 190; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; peek.style.left = px + 'px'; peek.style.top = py + 'px'; });
    }, { passive: true });
  }

  /* подсветка карточек преимуществ под курсором */
  $$('.bc').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var b = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - b.left) + 'px'); c.style.setProperty('--my', (e.clientY - b.top) + 'px');
    });
  });

  /* карусель отзывов */
  $$('[data-car]').forEach(function (wrap) {
    var car = wrap.querySelector('.car');
    $$('[data-dir]', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var card = car.querySelector('.rc'), step = card ? card.getBoundingClientRect().width + 14 : 300;
        car.scrollBy({ left: step * (+b.dataset.dir), behavior: R ? 'auto' : 'smooth' });
      });
    });
  });

  /* онлайн-запись → готовый текст в WhatsApp */
  var cfg = {}; try { cfg = JSON.parse(d.getElementById('bkcfg').textContent); } catch (e) {}
  var ask = [];
  function msg(f) {
    var svc = f.querySelector('#bk-svc').value, car = f.querySelector('#bk-car').value.trim(), day = f.querySelector('[data-day][aria-pressed=true]');
    var s = 'Здравствуйте! Пишу с сайта, хочу записаться в «' + cfg.name + '».';
    if (svc) s += '\nУслуга: ' + svc + '.';
    if (ask.length) s += '\nХочу узнать цену: ' + ask.join(', ').toLowerCase() + '.';
    if (car) s += '\nАвтомобиль: ' + car + '.';
    if (day) s += '\nКогда удобно: ' + day.dataset.day + '.';
    return s;
  }
  function toast(t) {
    var el = d.querySelector('.toast') || d.body.appendChild(Object.assign(d.createElement('div'), { className: 'toast' }));
    el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('show'); }, 2400);
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
      var v = q.dataset.ask, i = ask.indexOf(v);
      if (i > -1) { ask.splice(i, 1); q.setAttribute('aria-pressed', 'false'); q.textContent = 'Узнать цену'; }
      else { ask.push(v); q.setAttribute('aria-pressed', 'true'); q.textContent = 'В заявке'; toast('«' + v + '» добавлено в заявку'); }
      return;
    }
    var send = e.target.closest('[data-send]');
    if (send) {
      var f = send.closest('[data-book]');
      if (cfg.wa) w.open(cfg.wa + '?text=' + encodeURIComponent(msg(f)), '_blank', 'noopener');
      else location.href = 'tel:' + cfg.tel;
    }
  });
})();
