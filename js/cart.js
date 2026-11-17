'use strict';

const CART_KEY = 'shop:cart';
const MAX_CART_QUANTITY = 99;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(saved)) return [];
    const seen = new Set();
    return saved.filter(item => {
      if (!item || !Number.isInteger(item.quantity) || item.quantity < 1 ||
          item.quantity > MAX_CART_QUANTITY || seen.has(item.productId)) return false;
      if (!findProductById(products, item.productId)?.isAvailable) return false;
      seen.add(item.productId);
      return true;
    });
  } catch {
    return [];
  }
}

let cart = readCart();

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach(element => {
    element.textContent = count ? ` (${count})` : '';
  });
}

function changeCartQuantity(productId, quantity) {
  if (!findProductById(products, productId)?.isAvailable) return;
  cart = cart.filter(item => item.productId !== productId || quantity > 0);
  const item = cart.find(entry => entry.productId === productId);
  if (item) item.quantity = Math.min(quantity, MAX_CART_QUANTITY);
  else if (quantity > 0) cart.push({ productId, quantity: Math.min(quantity, MAX_CART_QUANTITY) });
  updateCartCount();
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    document.querySelectorAll('[data-cart-storage]').forEach(element => {
      element.hidden = false;
    });
  }
}

function getCartLines() {
  return cart.map(item => {
    const product = findProductById(products, item.productId);
    return { product, quantity: item.quantity, subtotal: product.price * item.quantity };
  });
}

function initCart() {
  updateCartCount();
  const list = document.querySelector('[data-cart-items]');
  if (!list) return;
  const empty = document.querySelector('[data-cart-empty]');
  const summary = document.querySelector('[data-cart-summary]');
  const template = document.querySelector('#cart-item-template');

  function renderCart() {
    const lines = getCartLines();
    const rows = lines.map(({ product, quantity, subtotal }) => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.dataset.productId = product.id;
      row.querySelector('[data-title]').textContent = product.title;
      row.querySelector('[data-unit-price]').textContent = `${formatPrice(product.price)} за шт.`;
      row.querySelector('[data-quantity]').textContent = quantity;
      row.querySelector('[data-subtotal]').textContent = formatPrice(subtotal);
      row.querySelector('[data-action="increase"]').disabled = quantity >= MAX_CART_QUANTITY;
      row.querySelector('[data-action="decrease"]').disabled = quantity <= 1;
      return row;
    });
    list.replaceChildren(...rows);
    empty.hidden = rows.length > 0;
    summary.hidden = rows.length === 0;
    summary.querySelector('[data-cart-total]').textContent =
      formatPrice(lines.reduce((sum, line) => sum + line.subtotal, 0));
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const row = button.closest('[data-product-id]');
    const productId = Number(row.dataset.productId);
    const item = cart.find(entry => entry.productId === productId);
    if (!item) return;
    const action = button.dataset.action;
    const quantity = action === 'remove' ? 0 : item.quantity + (action === 'increase' ? 1 : -1);
    changeCartQuantity(productId, quantity);
    renderCart();
    const updatedRow = list.querySelector(`[data-product-id="${productId}"]`);
    const sameButton = updatedRow?.querySelector(`[data-action="${action}"]:not(:disabled)`);
    (sameButton || updatedRow?.querySelector('[data-action="remove"]') ||
      list.querySelector('button[data-action="remove"]') ||
      document.querySelector('[data-cart-back]')).focus();
  });

  renderCart();
}
