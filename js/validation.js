'use strict';
function validateOrder(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Введите имя не короче 2 символов.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Введите корректный e-mail.';
  const phone = values.phone.trim();
  const digits = phone.replace(/\D/g, '');
  if (!/^\+?[\d\s()-]+$/.test(phone) || digits.length !== 11 || !['7', '8'].includes(digits[0])) errors.phone = 'Введите номер из 11 цифр, начинающийся с 7 или 8.';
  if (!values.agree) errors.agree = 'Подтвердите согласие на обработку данных.';
  return errors;
}
function initOrderForm() {
  const form = document.querySelector('.order-form');
  if (!form) return;
  const message = form.querySelector('.form-message');
  const fields = ['name', 'email', 'phone', 'agree'];
  const productSelect = form.querySelector('#order-product');
  for (const product of getAvailableProducts(products)) {
    const option = document.createElement('option');
    option.value = String(product.id);
    option.textContent = `${product.title} — ${formatPrice(product.price)}`;
    productSelect.append(option);
  }
  const params = new URLSearchParams(window.location.search);
  const lines = params.has('cart') ? getCartLines() : [];
  if (lines.length) {
    const summary = document.querySelector('[data-order-cart]');
    summary.hidden = false;
    productSelect.closest('.form-field').hidden = true;
    for (const { product, quantity, subtotal } of lines) {
      const item = document.createElement('li');
      item.textContent = `${product.title} × ${quantity} — ${formatPrice(subtotal)}`;
      summary.querySelector('ul').append(item);
    }
    summary.querySelector('strong').textContent =
      'Итого ' + formatPrice(lines.reduce((sum, line) => sum + line.subtotal, 0));
  }
  const requestedId = Number(params.get('product'));
  const requested = findProductById(products, requestedId);
  if (requested && requested.isAvailable) productSelect.value = String(requestedId);
  function readValues() {
    return { name: form.elements.name.value, email: form.elements.email.value, phone: form.elements.phone.value, agree: form.elements.agree.checked };
  }
  function showFieldError(name, error) {
    const input = form.elements[name];
    form.querySelector(`#${name}-error`).textContent = error || '';
    if (error) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
  fields.forEach(name => form.elements[name].addEventListener(name === 'agree' ? 'change' : 'input', () => {
    showFieldError(name, validateOrder(readValues())[name]);
    message.textContent = '';
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const errors = validateOrder(readValues());
    fields.forEach(name => showFieldError(name, errors[name]));
    if (Object.keys(errors).length) {
      message.textContent = 'Проверьте отмеченные поля формы.';
      form.elements[Object.keys(errors)[0]].focus();
      return;
    }
    message.textContent = 'Форма прошла учебную проверку. Заявка подготовлена, данные не отправлены.';
    form.reset();
  });
}
