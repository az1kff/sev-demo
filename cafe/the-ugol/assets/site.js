const filters = document.querySelector('.menu-filters');
const dishes = document.querySelector('#menu-items');
const groups = dishes.querySelectorAll('[data-group]');

filters.hidden = false;
filters.addEventListener('click', (event) => {
  const selected = event.target.closest('button[data-filter]');
  if (!selected || selected.getAttribute('aria-pressed') === 'true') return;

  const category = selected.dataset.filter;
  filters.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
  selected.setAttribute('aria-pressed', 'true');
  dishes.classList.toggle('is-filtered', category !== 'all');

  for (const group of groups) {
    group.hidden = category !== 'all' && group.dataset.group !== category;
  }
});
