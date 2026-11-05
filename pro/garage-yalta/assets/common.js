(function () {
  var d = document, R = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };

  /* шапка: фон после прокрутки */
  var top = d.querySelector('.top');
  if (top) {
    var onS = function () { top.classList.toggle('sc', scrollY > 40); };
    addEventListener('scroll', onS, { passive: true }); onS();
  }

  /* появление блоков */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-r]').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  /* счётчики: в разметке уже финальное число, анимируем от нуля */
  var cio = 'IntersectionObserver' in window && !R ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, t = el.dataset.to, dec = (t.split(',')[1] || '').length, to = parseFloat(t.replace(',', '.')), t0 = 0;
      var step = function (ts) {
        t0 = t0 || ts; var k = Math.min(1, (ts - t0) / 1300), v = to * (1 - Math.pow(1 - k, 3));
        el.textContent = dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
        if (k < 1) requestAnimationFrame(step); else el.textContent = t;
      };
      requestAnimationFrame(step);
    });
  }, { threshold: .4 }) : null;
  $$('.cu').forEach(function (el) { el.dataset.to = el.textContent.trim(); if (cio && !isNaN(parseFloat(el.dataset.to))) cio.observe(el); });

  /* бесконечные анимации крутятся, только пока блок виден */
  if ('IntersectionObserver' in window) {
    var ao = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('run', e.isIntersecting); }); });
    $$('[data-anim]').forEach(function (el) { ao.observe(el); });
  } else $$('[data-anim]').forEach(function (el) { el.classList.add('run'); });

  /* шкалы и кольца заполняются при появлении */
  $$('[data-fill]').forEach(function (el) { io ? (new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { el.classList.add('on'); o.disconnect(); } }, { threshold: .3 })).observe(el) : el.classList.add('on'); });

  /* открыто / закрыто по московскому времени */
  var hw = d.getElementById('hw');
  if (hw) try {
    var W = JSON.parse(hw.textContent);
    var parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var dm = { 'вс': 0, 'пн': 1, 'вт': 2, 'ср': 3, 'чт': 4, 'пт': 5, 'сб': 6 }, day, h, m;
    parts.forEach(function (x) { if (x.type === 'weekday') day = dm[x.value.replace('.', '').toLowerCase()]; if (x.type === 'hour') h = +x.value % 24; if (x.type === 'minute') m = +x.value; });
    var mins = function (s) { var a = s.split(':'); return a[0] * 60 + +a[1]; }, now = h * 60 + m, t = W[day];
    var open = t && now >= mins(t[0]) && now < mins(t[1]), txt, left = '';
    if (open) { txt = 'Открыто до ' + t[1]; var l = mins(t[1]) - now; left = 'ещё ' + (l >= 60 ? Math.floor(l / 60) + ' ч ' : '') + (l % 60) + ' мин'; }
    else for (var i = 0; i < 7; i++) { var s = W[(day + i) % 7]; if (s && (i > 0 || now < mins(s[0]))) { txt = 'Откроется ' + (i === 0 ? 'сегодня' : i === 1 ? 'завтра' : ['в вс', 'в пн', 'во вт', 'в ср', 'в чт', 'в пт', 'в сб'][(day + i) % 7]) + ' в ' + s[0]; break; } }
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('on', !!open);
      var a = el.querySelector('.stt'), b = el.querySelector('.stl');
      if (a && txt) a.textContent = txt; if (b) b.textContent = left;
    });
    $$('tr[data-days]').forEach(function (r) { if (r.dataset.days.split(',').indexOf(String(day)) > -1) r.classList.add('today'); });
  } catch (e) {}

  /* всплывашка */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = d.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); d.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }
  function copy(t) {
    try { if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(t); } catch (e) {}
    var ta = d.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    d.body.appendChild(ta); ta.select(); try { d.execCommand('copy'); } catch (e) {} ta.remove();
  }

  /* заявка: услуги, машина, время → готовый текст для мастера */
  var bd = d.getElementById('bd');
  if (bd) {
    var cfg = JSON.parse(bd.textContent), sel = [], when = '', car = d.getElementById('ob-car'), out = d.getElementById('ob-msg');
    var msg = function () {
      var s = 'Здравствуйте! Пишу с сайта, хочу записаться в «' + cfg.name + '».';
      if (sel.length) s += '\nНужно: ' + sel.join(', ').toLowerCase() + '.';
      if (car && car.value.trim()) s += '\nМашина: ' + car.value.trim() + '.';
      if (when) s += '\nКогда удобно: ' + when + '.';
      return s;
    };
    var render = function () {
      var t = msg();
      if (out) out.textContent = t;
      $$('[data-add]').forEach(function (b) { b.setAttribute('aria-pressed', sel.indexOf(b.dataset.add) > -1 ? 'true' : 'false'); });
      $$('[data-when]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.when === when ? 'true' : 'false'); });
      $$('[data-oc]').forEach(function (el) { el.textContent = sel.length; el.closest('[data-ocw]') && el.closest('[data-ocw]').classList.toggle('has', sel.length > 0); });
      $$('[data-wa]').forEach(function (a) { a.href = a.dataset.wa + '?text=' + encodeURIComponent(t); });
    };
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]');
      if (b) {
        var v = b.dataset.add, i = sel.indexOf(v);
        if (i > -1) sel.splice(i, 1); else { sel.push(v); if (!b.closest('#order')) toast('«' + v + '» добавлено в заявку'); }
        render(); return;
      }
      var w = e.target.closest('[data-when]');
      if (w) { when = when === w.dataset.when ? '' : w.dataset.when; render(); return; }
      var c = e.target.closest('[data-copy]');
      if (c) { copy(msg()); toast('Текст заявки скопирован. Вставьте его в чат'); }
    });
    car && car.addEventListener('input', render);
    render();
  }

  /* вкладки: зоны машины и любые [data-z] → [data-zp] */
  d.addEventListener('click', function (e) {
    var z = e.target.closest('[data-z]'); if (!z) return;
    var k = z.dataset.z;
    $$('[data-z]').forEach(function (x) { var on = x.dataset.z === k; x.classList.toggle('on', on); if (x.getAttribute('role') === 'tab') x.setAttribute('aria-selected', on); });
    $$('[data-zp]').forEach(function (p) { p.hidden = p.dataset.zp !== k; });
  });

  /* карусель отзывов: точки и автопрокрутка */
  $$('.qs').forEach(function (qs) {
    var track = qs.querySelector('.qt'), dots = $$('.qd button', qs), n = dots.length, cur = 0, user = false;
    if (!track || n < 2) return;
    var go = function (i) { cur = (i + n) % n; track.scrollTo({ left: track.children[cur].offsetLeft - track.offsetLeft, behavior: R ? 'auto' : 'smooth' }); };
    dots.forEach(function (b, i) { b.addEventListener('click', function () { user = true; go(i); }); });
    track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    }, { passive: true });
    track.addEventListener('pointerdown', function () { user = true; });
    if (!R) setInterval(function () { if (!user && !d.hidden) go(cur + 1); }, 6000);
  });

  /* просмотр фото */
  $$('[data-lb]').forEach(function (g) {
    var imgs = $$('img', g); if (!imgs.length) return;
    var dlg = d.createElement('dialog'); dlg.className = 'lb';
    dlg.innerHTML = '<img alt=""><button class="lb-x" aria-label="Закрыть">✕</button><button class="lb-p" aria-label="Предыдущее фото">‹</button><button class="lb-n" aria-label="Следующее фото">›</button><span class="lb-c"></span>';
    d.body.appendChild(dlg);
    var im = dlg.querySelector('img'), cnt = dlg.querySelector('.lb-c'), i = 0, x0 = null;
    var show = function (k) { var live = $$('img', g); i = (k + live.length) % live.length; im.src = live[i].dataset.full || live[i].src; im.alt = live[i].alt; im.referrerPolicy = 'no-referrer'; cnt.textContent = (i + 1) + ' / ' + live.length; };
    imgs.forEach(function (img, k) { img.style.cursor = 'zoom-in'; img.addEventListener('click', function () { show(k); dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); }); });
    dlg.querySelector('.lb-x').onclick = function () { dlg.close(); };
    dlg.querySelector('.lb-p').onclick = function () { show(i - 1); };
    dlg.querySelector('.lb-n').onclick = function () { show(i + 1); };
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
    dlg.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    dlg.addEventListener('pointerup', function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 50) show(i + (e.clientX < x0 ? 1 : -1)); x0 = null; });
  });
})();
