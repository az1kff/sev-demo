const shop = document.querySelector('.foodshop');
if (shop) {
  const shelves = [...shop.querySelectorAll('.shelf')];
  const links = [...shop.querySelectorAll('.food-nav a')];
  const search = shop.querySelector('[type="search"]');
  const notice = shop.querySelector('.food-notice');
  const dialog = document.querySelector('.dish-view');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const normalize = text => text.toLocaleLowerCase('ru').replaceAll('ё', 'е').trim();
  const initial = shelves[0].id;
  let selected = initial;
  shop.classList.add('enhanced');
  search.closest('label').hidden = false;

  function render() {
    const query = normalize(search.value);
    let total = 0;
    for (const shelf of shelves) {
      let matches = 0;
      const show = query ? shelf.id !== 'selection' : shelf.id === selected;
      for (const card of shelf.querySelectorAll('.dish')) {
        card.hidden = !show || !normalize(card.textContent).includes(query);
        if (!card.hidden) matches++;
      }
      shelf.hidden = matches === 0;
      total += matches;
    }
    for (const link of links) {
      if (!query && link.hash === '#' + selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    notice.textContent = query ? (total ? 'Найдено блюд: ' + total : 'Ничего не найдено. Измените название или ингредиент.') : '';
  }
  let entrance = [];
  function restore() {
    const url = new URL(window.location.href);
    const requested = url.hash.slice(1);
    selected = shelves.some(item => item.id === requested) ? requested : initial;
    search.value = url.searchParams.get('q') || '';
    render();
    for (const animation of entrance) animation.cancel();
    entrance = [];
    if (!search.value && !reduced.matches && typeof shop.animate === 'function') {
      const active = shelves.find(shelf => shelf.id === selected);
      entrance = [...active.querySelectorAll('.dish:not([hidden])')].slice(0, 6).map((dish, index) =>
        dish.animate([
          { opacity: .2, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 410, delay: index * 42, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
    }
  }
  for (const link of links) {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const url = new URL(window.location.href);
      if (url.hash === link.hash && !url.searchParams.has('q')) return;
      url.searchParams.delete('q');
      url.hash = link.hash;
      history.pushState(null, '', url);
      restore();
    });
  }
  search.addEventListener('input', () => {
    for (const animation of entrance) animation.cancel();
    entrance = [];
    const url = new URL(window.location.href);
    if (search.value) url.searchParams.set('q', search.value);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    render();
  });
  window.addEventListener('popstate', restore);
  for (const button of shop.querySelectorAll('.dish-image')) button.hidden = false;
  restore();
  shop.addEventListener('click', event => {
    const button = event.target.closest('.dish-image');
    if (!button) return;
    const card = button.closest('.dish');
    const image = dialog.querySelector('img');
    image.src = button.querySelector('img').src;
    dialog.querySelector('h2').textContent = card.querySelector('h3').textContent;
    dialog.querySelector('p').textContent = card.querySelector('p').textContent;
    dialog.querySelector('strong').textContent = card.querySelector('strong').textContent + ' · ' + card.querySelector('small').textContent;
    dialog.showModal();
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}
const form = document.querySelector('#request');
if (form) {
  form.hidden = false;
  const fields = form.elements;
  fields.date.min = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Moscow'}).format(new Date());
  form.addEventListener('submit', event => {
    event.preventDefault();
    const date = fields.date.value.split('-').reverse().join('.');
    const text = 'Здравствуйте! Хочу забронировать стол на ' + date + ' в ' + fields.time.value + '. Гостей: ' + fields.guests.value + '. Имя: ' + fields.guest.value.trim() + '. Подтвердите, пожалуйста, есть ли места.';
    const url = new URL(form.dataset.contact);
    url.searchParams.set('text', text);
    window.location.assign(url.href);
  });
}
