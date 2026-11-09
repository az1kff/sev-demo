(function () {
  // меню на телефоне
  var b = document.querySelector('.burger'), n = document.getElementById('nav');
  if (b && n) b.addEventListener('click', function () {
    var o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o);
  });

  // плавное появление блоков
  var els = document.querySelectorAll('.svc,.steps li,.checks li,.card');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -40px' });
    els.forEach(function (el, i) { el.classList.add('rv'); el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  }

  // заявка: собираем текст и открываем мессенджер (сервера нет)
  document.querySelectorAll('form.req').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var lines = [f.dataset.kind];
      f.querySelectorAll('label').forEach(function (l) {
        var i = l.querySelector('input'); if (i && i.value) lines.push(l.querySelector('span').textContent + ': ' + i.value);
      });
      var text = lines.join('\n');
      if (f.dataset.wa) { location.href = 'https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(text); return; }
      if (f.dataset.tg) {
        if (navigator.clipboard) navigator.clipboard.writeText(text);
        alert('Текст заявки скопирован — вставьте его в чат Telegram.');
        location.href = 'https://t.me/' + f.dataset.tg; return;
      }
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      alert('Это черновик сайта: мессенджер ещё не подключён.\n\n' + text);
    });
  });
})();
