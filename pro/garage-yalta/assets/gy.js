/* Garage Yalta: ползунок «Было — стало». Работает и без Motion. */
(function () {
  [].forEach.call(document.querySelectorAll('[data-ba]'), function (b) {
    var r = b.querySelector('input');
    var set = function () { b.style.setProperty('--p', r.value + '%'); };
    r.addEventListener('input', set);
    set();
    /* подсказка: при первом появлении ползунок слегка «гуляет» */
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        var t0 = performance.now();
        (function step(t) {
          var k = Math.min(1, (t - t0) / 1600);
          if (r.dataset.touched) return;
          r.value = 50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k); set();
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      }, { threshold: .6 });
      io.observe(b);
      r.addEventListener('pointerdown', function () { r.dataset.touched = 1; });
    }
  });
})();
