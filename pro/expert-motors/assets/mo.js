(function () {
  var d = document, w = window, root = d.documentElement;
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var R = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desk = matchMedia('(min-width:1000px)').matches;
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var M = w.Motion, lenis = null;

  /* меню на телефоне */
  var nav = d.getElementById('mnav');
  function menu(open) {
    nav.classList.toggle('open', open); nav.setAttribute('aria-hidden', String(!open));
    d.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  $$('[data-menu]').forEach(function (b) { b.addEventListener('click', function () { menu(!nav.classList.contains('open')); }); });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });

  /* нижняя панель после первого экрана */
  var dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  if (dock && hero && 'IntersectionObserver' in w) new IntersectionObserver(function (es) { dock.classList.toggle('on', !es[0].isIntersecting); }, { threshold: .15 }).observe(hero);
  else if (dock) dock.classList.add('on');

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
    el.setAttribute('role', 'status');
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

  /* услуги: активная строка и фото слева (работает и без анимаций) */
  var frame = d.querySelector('.svc-frame'), items = $$('.svc-i'), cur = d.querySelector('.svc-i.on'), z = 1;
  var nEl = frame && frame.querySelector('[data-n]');
  function act(a) {
    if (a === cur || !frame) return;
    if (cur) cur.classList.remove('on');
    a.classList.add('on'); cur = a;
    var im = frame.querySelector('img[data-k="' + a.dataset.k + '"]');
    if (im) {
      im.style.zIndex = ++z;
      if (M && !R) M.animate(im, { clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'], scale: [1.18, 1] }, { duration: .9, ease: [.16, 1, .3, 1] });
      else im.style.clipPath = 'inset(0)';
    }
    if (nEl) nEl.textContent = ('0' + (items.indexOf(a) + 1)).slice(-2);
  }
  if (frame && desk) {
    if ('IntersectionObserver' in w) {
      var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) act(e.target); }); }, { rootMargin: '-48% 0px -48% 0px' });
      items.forEach(function (a) { sio.observe(a); });
    }
    items.forEach(function (a) { a.addEventListener('mouseenter', function () { act(a); }); a.addEventListener('focus', function () { act(a); }); });
  }

  if (!M || R) { root.classList.add('nomo'); return; }
  root.classList.add('mo');

  var animate = M.animate, scroll = M.scroll, inView = M.inView, stagger = M.stagger, press = M.press;
  var EASE = [.16, 1, .3, 1];
  var below = function (el) { return el.getBoundingClientRect().top > innerHeight * .92; };

  /* плавная прокрутка на компьютере: Lenis, кадры ведёт Motion */
  if (fine && w.Lenis) {
    lenis = new w.Lenis({ autoRaf: false, lerp: .11 });
    M.frame.setup(function (f) { lenis.raf(f.timestamp); }, true);
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a || e.defaultPrevented) return;
      var u = new URL(a.href, location.href);
      if (u.pathname !== location.pathname || !u.hash) return;
      var t = d.querySelector(u.hash);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: -84, duration: 1.4, easing: M.easeInOut });
      history.replaceState(null, '', u.hash);
    });
  }

  /* шапка: прогресс, прячется вниз, возвращается вверх */
  var hdr = d.querySelector('.hdr'), prog = d.querySelector('.prog'), lastY = 0;
  if (prog) scroll(animate(prog, { scaleX: [0, 1] }, { ease: 'linear' }));
  scroll(function (p, info) {
    var y = info.y.current;
    if (Math.abs(y - lastY) < 6) return;
    hdr.classList.toggle('hide', y > lastY && y > 500 && !nav.classList.contains('open'));
    lastY = y;
  });

  /* первый экран: фото проявляется, строки поднимаются, затем текст и цифры */
  if (hero) {
    var hImg = hero.querySelector('.hero-bg img'), hIn = hero.querySelector('.hero-in');
    if (hImg) animate(hImg, { opacity: [0, 1], scale: [1.2, 1] }, { duration: 2.2, ease: EASE });
    animate($$('h1 .ln>span', hero), { y: ['110%', '0%'] }, { duration: 1.2, ease: EASE, delay: stagger(.1, { startDelay: .15 }) });
    animate($$('[data-h]', hero), { opacity: [0, 1], y: [24, 0] }, { duration: 1, ease: EASE, delay: stagger(.09, { startDelay: .55 }) });
    var hOff = { target: hero, offset: ['start start', 'end start'] };
    scroll(animate(hero.querySelector('.hero-bg'), { y: ['0%', '24%'] }, { ease: 'linear' }), hOff);
    scroll(animate(hIn, { y: [0, -110], opacity: [1, .15] }, { ease: 'linear' }), hOff);
  }

  /* заголовки разделов: слова выезжают из-под маски */
  $$('[data-split]').forEach(function (h) {
    var text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(/\s+/).map(function (x) {
      return '<span class="wd" aria-hidden="true"><span>' + x.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</span></span>';
    }).join(' ');
    if (!below(h)) return;
    var ws = $$('.wd>span', h);
    animate(ws, { y: '110%' }, { duration: 0 });
    inView(h, function () { animate(ws, { y: ['110%', '0%'] }, { duration: 1.1, ease: EASE, delay: stagger(.06) }); }, { margin: '0px 0px -8% 0px' });
  });

  /* фото открываются шторкой снизу вверх */
  $$('[data-rv]').forEach(function (el) {
    if (!below(el)) return;
    var im = el.querySelector('img');
    animate(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { duration: 0 });
    inView(el, function () {
      animate(el, { clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'] }, { duration: 1.2, ease: EASE });
      if (im) animate(im, { scale: [1.3, 1] }, { duration: 1.6, ease: EASE });
    }, { margin: '0px 0px -10% 0px' });
  });

  /* манифест: слова загораются по мере прокрутки, фото плывут */
  var man = d.querySelector('[data-man]');
  if (man) {
    var words = $$('span', man), lit = -1;
    scroll(function (p) {
      var n = Math.round(p * words.length);
      if (n === lit) return;
      lit = n;
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
    }, { target: man, offset: ['start .85', 'end .5'] });
    var mg = d.querySelector('.man-g');
    $$('.man-ph figure').forEach(function (f, i) {
      scroll(animate(f, { y: i ? [90, -90] : [30, -30] }, { ease: 'linear' }), { target: mg, offset: ['start end', 'end start'] });
    });
  }

  /* фото раскрывается из карточки на весь экран, затем проявляется цитата */
  var xp = d.querySelector('.xp');
  if (xp) {
    var xm = xp.querySelector('.xp-media'), ins = desk ? 'inset(14% 22% 14% 22% round 28px)' : 'inset(20% 5% 20% 5% round 20px)', full = 'inset(0% 0% 0% 0% round 0px)';
    scroll(animate(xm, { clipPath: [ins, full, full] }, { ease: 'linear', times: [0, .55, 1] }), { target: xp, offset: ['start end', 'end end'] });
    scroll(animate(xm.querySelector('img'), { scale: [1.35, 1] }, { ease: 'linear' }), { target: xp, offset: ['start end', 'end end'] });
    scroll(animate(xp.querySelector('.xp-txt'), { opacity: [0, 0, 1], y: [60, 60, 0] }, { ease: 'linear', times: [0, .62, .9] }), { target: xp, offset: ['start end', 'end end'] });
  }

  /* шаги на компьютере: лента едет вбок, пока блок закреплён */
  var hs = d.querySelector('.hs');
  if (hs && desk) {
    var tr = hs.querySelector('.hs-track'), bar = hs.querySelector('.hs-bar i'), stops = [];
    var setup = function () {
      stops.forEach(function (s) { s(); }); stops = [];
      var dist = Math.max(0, tr.scrollWidth - root.clientWidth);
      hs.style.height = (dist + innerHeight) + 'px';
      stops.push(scroll(animate(tr, { x: [0, -dist] }, { ease: 'linear' }), { target: hs }));
      if (bar) stops.push(scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }), { target: hs }));
    };
    setup();
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(setup, 200); });
    if (d.fonts) d.fonts.ready.then(setup);
  }

  /* марки: две ленты, скорость и направление следуют за прокруткой */
  var mqs = $$('[data-mq]');
  if (mqs.length) {
    var vel = 0, sign = 1;
    scroll(function (p, info) { vel = info.y.velocity; });
    var st = mqs.map(function (m) { return { el: m.querySelector('.mqv-t'), x: 0, dir: +(m.dataset.dir || 1), half: 0, vis: false }; });
    st.forEach(function (s, i) { inView(mqs[i], function () { s.vis = true; return function () { s.vis = false; }; }); });
    M.frame.update(function (f) {
      if (vel > 20) sign = 1; else if (vel < -20) sign = -1;
      var boost = Math.min(Math.abs(vel) / 300, 7);
      vel *= .9;
      var dt = Math.min(f.delta, 50) / 1000;
      for (var i = 0; i < st.length; i++) {
        var s = st[i];
        if (!s.vis) continue;
        if (!s.half) s.half = s.el.scrollWidth / 2;
        s.x -= (36 + 36 * boost) * dt * s.dir * sign;
        if (s.x <= -s.half) s.x += s.half;
        if (s.x > 0) s.x -= s.half;
        s.el.style.transform = 'translate3d(' + s.x.toFixed(1) + 'px,0,0)';
      }
    }, true);
  }

  /* галерея: колонки с разной скоростью */
  var gx = d.querySelector('.gx-g');
  if (gx && desk) $$('.gx-c', gx).forEach(function (c, i) {
    scroll(animate(c, { y: [[40, -40], [150, -150], [90, -90]][i] || [0, 0] }, { ease: 'linear' }), { target: gx, offset: ['start end', 'end start'] });
  });

  /* фон записи плывёт медленнее блока */
  var bk = d.querySelector('.bk');
  if (bk) scroll(animate(bk.querySelector('.bk-bg'), { y: ['-8%', '8%'] }, { ease: 'linear' }), { target: bk, offset: ['start end', 'end start'] });

  /* большое слово в подвале собирается по буквам */
  var wm = d.querySelector('.wm');
  if (wm) {
    var ls = $$('span', wm);
    animate(ls, { y: '105%' }, { duration: 0 });
    inView(wm, function () { animate(ls, { y: ['105%', '0%'] }, { duration: 1.1, ease: EASE, delay: stagger(.035) }); });
  }

  /* кнопки: пружинка при нажатии, на компьютере тянутся к курсору */
  var sp = { type: 'spring', stiffness: 600, damping: 30 };
  press('.btn, .mag, .svc-i .go, .days button, .wl button', function (el) {
    animate(el, { scale: .95 }, sp);
    return function () { animate(el, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 18 }); };
  });
  if (fine) $$('.mag').forEach(function (el) {
    var b = null, mt = { type: 'spring', stiffness: 260, damping: 18, mass: .6 };
    el.addEventListener('pointerenter', function () { b = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', function (e) {
      if (!b) return;
      animate(el, { x: (e.clientX - b.left - b.width / 2) * .22, y: (e.clientY - b.top - b.height / 2) * .32 }, mt);
    });
    el.addEventListener('pointerleave', function () { b = null; animate(el, { x: 0, y: 0 }, mt); });
  });
})();
