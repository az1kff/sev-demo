(function () {
  var b = document.querySelector('.burger'), n = document.getElementById('nav');
  if (b && n) b.addEventListener('click', function () {
    var o = n.classList.toggle('open');
    b.setAttribute('aria-expanded', o);
    b.setAttribute('aria-label', o ? 'Закрыть меню' : 'Открыть меню');
  });

  // Заявка: сервера нет, поэтому собираем текст и открываем мессенджер Дмитрия.
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
