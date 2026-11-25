const search = document.querySelector('.search');
if (search) {
  search.hidden = false;
  const field = search.querySelector('input');
  const groups = [...document.querySelectorAll('.group')];
  const normalize = text => text.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е');
  function filter() {
    const query = normalize(field.value);
    for (const group of groups) {
      const categoryMatches = normalize(group.querySelector('h2').textContent).includes(query);
      for (const row of group.querySelectorAll('li')) {
        row.hidden = !categoryMatches && !normalize(row.querySelector('strong').textContent).includes(query);
      }
      group.hidden = !group.querySelector('li:not([hidden])');
    }
    document.querySelector('.empty').hidden = groups.some(group => !group.hidden);
  }
  field.addEventListener('input', filter);
  document.querySelector('aside nav').addEventListener('click', () => { field.value = ''; filter(); });
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
