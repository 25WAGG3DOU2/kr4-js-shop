'use strict';
// Единственная дополнительная функция: тема с сохранением выбора.
function initThemeToggle() {
  let saved;
  try { saved = localStorage.getItem('shop:theme'); } catch { /* Хранилище может быть запрещено. */ }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('is-dark', theme === 'dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.querySelector('.theme-toggle__icon').textContent = theme === 'dark' ? '☀' : '☾';
    });
  }
  applyTheme(saved === 'light' ? 'light' : 'dark');
  document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('shop:theme', next); } catch { /* Переключение работает и без сохранения. */ }
  }));
}
initThemeToggle();
initCatalog();
initOrderForm();
const output = document.querySelector('[data-product-statistics]');
if (output) {
  output.textContent = `Всего товаров: ${products.length}. В наличии: ${countAvailableProducts(products)}. Средняя цена: ${formatPrice(calculateAveragePrice(products))}. Стоимость всех товаров: ${formatPrice(calculateTotalPrice(products))}.`;
}
