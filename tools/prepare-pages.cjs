// Служебный скрипт подготовки копии страниц КР №3. Повторно не запускать.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
for (const name of ['index', 'catalog', 'product', 'order', 'contacts']) {
  const filename = path.join(root, name + '.html');
  let html = fs.readFileSync(filename, 'utf8');
  html = html.replace(/    <script>[\s\S]*?<\/script>\s*/, '');
  html = html.replace('    <script src="js/main.js" defer></script>', ['data', 'catalog', 'validation', 'main'].map(file => `    <script src="js/${file}.js" defer></script>`).join('\n'));
  if (name === 'catalog') html = html.replace(/    <main[\s\S]*?<\/main>/, `    <main id="main">
      <div class="section catalog-heading"><h1>Каталог игровой периферии</h1><p>Подберите оборудование для своего игрового места.</p></div>
      <div class="catalog-layout">
        <aside class="catalog-filters" aria-labelledby="filters-title">
          <h2 id="filters-title">Подбор товаров</h2>
          <div class="filters-form">
            <div class="form-field"><label for="catalog-search">Поиск по названию</label><input id="catalog-search" type="search" placeholder="Например, Razer" /></div>
            <div class="form-field"><label for="catalog-category">Категория</label><select id="catalog-category">
              <option value="all">Все товары</option><option value="mouse">Мыши</option><option value="keyboard">Клавиатуры</option><option value="audio">Наушники</option><option value="monitor">Мониторы</option><option value="accessory">Коврики</option>
            </select></div>
            <div class="form-field"><label for="catalog-sort">Сортировка</label><select id="catalog-sort">
              <option value="default">Исходный порядок</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option><option value="title">По названию А–Я</option>
            </select></div>
            <label><input id="catalog-available" type="checkbox" /> Только в наличии</label>
            <button class="button" type="button" data-reset-filters>Сбросить фильтры</button>
          </div>
        </aside>
        <section class="catalog-products" aria-labelledby="products-title">
          <h2 id="products-title">Товары</h2>
          <p data-catalog-count role="status" aria-live="polite"></p>
          <p data-catalog-empty hidden>Ничего не найдено. Измените запрос или сбросьте фильтры.</p>
          <div class="products-grid" data-products-container></div>
          <noscript>Включите JavaScript для просмотра интерактивного каталога.</noscript>
        </section>
      </div>
    </main>`);
  if (name === 'order') html = html.replace(/      <form[\s\S]*?<\/form>/, `      <p>Учебная форма: данные проверяются в браузере и не отправляются на сервер.</p>
      <form class="order-form" action="#" method="post" novalidate>
        <div class="form-field"><label for="name">Имя *</label><input id="name" name="name" autocomplete="given-name" required minlength="2" aria-describedby="name-error" /><span id="name-error" class="field-error"></span></div>
        <div class="form-field"><label for="email">E-mail *</label><input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-error" /><span id="email-error" class="field-error"></span></div>
        <div class="form-field"><label for="phone">Телефон *</label><input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="+7 (999) 123-45-67" required aria-describedby="phone-hint phone-error" /><small id="phone-hint">11 цифр, первая — 7 или 8.</small><span id="phone-error" class="field-error"></span></div>
        <div class="form-field"><label for="order-product">Товар</label><select id="order-product" name="product"><option value="">Консультация по выбору</option></select></div>
        <div class="form-field form-field--wide"><label for="comment">Комментарий</label><textarea id="comment" name="comment" rows="4"></textarea></div>
        <div class="form-field form-field--wide"><label class="consent-label" for="agree"><input id="agree" name="agree" type="checkbox" required aria-describedby="agree-error" /> Я согласен на обработку данных *</label><span id="agree-error" class="field-error"></span></div>
        <div class="form-actions form-field--wide"><button type="submit" class="button">Подготовить заявку</button></div>
        <p class="form-message form-field--wide" role="status" aria-live="polite"></p>
      </form>`);
  if (name === 'index') html = html.replace('      <aside class="aside-info">', '      <section class="section" aria-labelledby="stats-title"><h2 id="stats-title">Каталог в цифрах</h2><p data-product-statistics></p><a class="button" href="catalog.html">Открыть каталог</a></section>\n      <aside class="aside-info">');
  if (name === 'product') html = html.replace('href="order.html"', 'href="order.html?product=3"');
  // На главной ссылки ведут на соответствующий товар в форме.
  if (name === 'index') {
    let index = 0;
    html = html.replace(/href="order.html"/g, () => `href="order.html?product=${[3, 1, 7][index++]}"`);
  }
  fs.writeFileSync(filename, html);
}
fs.appendFileSync(path.join(root, 'css/responsive.css'), `
/* Дополнения КР №4 */
[hidden] { display: none !important; }
.catalog-heading { padding-bottom: 0; width: 100%; }
.catalog-products, .catalog-products .product-card { min-width: 0; width: 100%; }
.catalog-products { overflow-wrap: anywhere; }
.catalog-products .products-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); }
.button:disabled { opacity: .65; cursor: default; transform: none; }
.field-error { color: #b3261e; }
:root[data-theme="dark"] .field-error { color: #ffb4ab; }
[aria-invalid="true"] { border-color: #b3261e; }
.consent-label { display: flex; gap: 8px; align-items: center; }
.consent-label input { width: auto; }
.form-message { margin: 0; }
.form-actions { grid-column: 1 / -1; }
:root[data-theme="dark"] .button, :root[data-theme="dark"] .form-actions button { color: #14251f; }
@media (max-width: 639px) { .catalog-layout { padding-inline: 16px; } }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { transition: none !important; } }
`);
