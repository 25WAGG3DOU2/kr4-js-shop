'use strict';
function getProductTitles(items) { return items.map(product => product.title); }
function getAvailableProducts(items) { return items.filter(product => product.isAvailable); }
function searchProducts(items, query) {
  const normalized = query.trim().toLowerCase();
  return items.filter(product => product.title.toLowerCase().includes(normalized));
}
function filterProductsByCategory(items, category) {
  return category === 'all' ? [...items] : items.filter(product => product.category === category);
}
function sortProductsByPrice(items, direction = 'asc') {
  return [...items].sort((a, b) => direction === 'desc' ? b.price - a.price : a.price - b.price);
}
function findProductById(items, id) { return items.find(product => product.id === id); }
function calculateTotalPrice(items) { return items.reduce((sum, product) => sum + product.price, 0); }
function countAvailableProducts(items) { return getAvailableProducts(items).length; }
function calculateAveragePrice(items) { return items.length ? Math.round(calculateTotalPrice(items) / items.length) : 0; }
function formatPrice(price) { return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price); }
function getPreparedProducts(items, query = '', category = 'all', sortDirection = 'default', availableOnly = false) {
  let result = filterProductsByCategory(searchProducts(items, query), category);
  if (availableOnly) result = getAvailableProducts(result);
  if (sortDirection === 'asc' || sortDirection === 'desc') result = sortProductsByPrice(result, sortDirection);
  if (sortDirection === 'title') result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  return result;
}
function createProductCard(product) {
  const card = document.createElement('article');
  card.classList.add('product-card');
  const title = document.createElement('h3');
  title.classList.add('product-card__title');
  title.textContent = product.title;
  const description = document.createElement('p');
  description.textContent = product.description;
  const price = document.createElement('p');
  price.classList.add('product-card__price');
  price.textContent = formatPrice(product.price);
  const availability = document.createElement('p');
  availability.textContent = product.isAvailable ? 'В наличии' : 'Нет в наличии';
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('button');
  button.dataset.productId = String(product.id);
  button.textContent = product.isAvailable ? 'Оформить заявку' : 'Недоступен';
  button.disabled = !product.isAvailable;
  card.append(title, description, availability, price, button);
  if (product.isAvailable) {
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.classList.add('button');
    addButton.dataset.productId = String(product.id);
    addButton.dataset.action = 'add-to-cart';
    addButton.textContent = 'В корзину';
    card.append(addButton);
  }
  return card;
}
function initCatalog() {
  const container = document.querySelector('[data-products-container]');
  if (!container) return;
  const search = document.querySelector('#catalog-search');
  const category = document.querySelector('#catalog-category');
  const sort = document.querySelector('#catalog-sort');
  const available = document.querySelector('#catalog-available');
  const state = { query: '', category: 'all', sort: 'default', availableOnly: false };
  function render() {
    const result = getPreparedProducts(products, state.query, state.category, state.sort, state.availableOnly);
    container.replaceChildren(...result.map(createProductCard));
    document.querySelector('[data-catalog-count]').textContent = `Найдено товаров: ${result.length}`;
    document.querySelector('[data-catalog-empty]').hidden = result.length !== 0;
  }
  search.addEventListener('input', () => { state.query = search.value; render(); });
  category.addEventListener('change', () => { state.category = category.value; render(); });
  sort.addEventListener('change', () => { state.sort = sort.value; render(); });
  available.addEventListener('change', () => { state.availableOnly = available.checked; render(); });
  document.querySelector('[data-reset-filters]').addEventListener('click', () => {
    search.value = ''; category.value = 'all'; sort.value = 'default'; available.checked = false;
    Object.assign(state, { query: '', category: 'all', sort: 'default', availableOnly: false });
    render();
  });
  // Один обработчик обслуживает и заново созданные кнопки.
  container.addEventListener('click', event => {
    const button = event.target.closest('button[data-product-id]');
    if (!button || button.disabled) return;
    const product = findProductById(products, Number(button.dataset.productId));
    if (!product?.isAvailable) return;
    if (button.dataset.action === 'add-to-cart') {
      const quantity = cart.find(item => item.productId === product.id)?.quantity || 0;
      const feedback = document.querySelector('[data-cart-feedback]');
      if (quantity >= MAX_CART_QUANTITY) {
        feedback.textContent = 'Достигнут предел количества для этого товара.';
        return;
      }
      changeCartQuantity(product.id, quantity + 1);
      feedback.textContent = `В корзине: ${product.title} — ${quantity + 1} шт.`;
      return;
    }
    window.location.href = `order.html?product=${product.id}`;
  });
  render();
}
