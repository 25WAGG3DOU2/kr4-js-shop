const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const packageRoot = process.env.SHOP_NODE_MODULES;
const { chromium } = require(packageRoot ? path.join(packageRoot, 'playwright') : 'playwright');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg' })[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage();
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const name of ['index', 'catalog', 'product', 'order', 'contacts']) await page.goto(`${base}/${name}.html`);
    await page.goto(`${base}/catalog.html`);
    assert.equal(await page.locator('[data-products-container] article').count(), 8);
    await page.locator('#catalog-search').fill(' RAZER ');
    assert.equal(await page.locator('[data-products-container] article').count(), 2);
    await page.locator('#catalog-category').selectOption('keyboard');
    assert.equal(await page.locator('[data-catalog-empty]').isVisible(), true);
    await page.locator('[data-reset-filters]').click();
    await page.locator('#catalog-available').check();
    assert.equal(await page.locator('[data-products-container] article').count(), 6);
    await page.locator('#catalog-sort').selectOption('asc');
    assert.equal(await page.locator('[data-products-container] button').first().getAttribute('data-product-id'), '8');
    await page.locator('[data-reset-filters]').click();
    await page.locator('#catalog-sort').selectOption('desc');
    assert.equal(await page.locator('[data-products-container] button').first().isDisabled(), true);
    await page.locator('[data-reset-filters]').click();
    await page.locator('#catalog-search').fill('<img src=x onerror=alert(1)>');
    assert.equal(await page.locator('[data-products-container] img').count(), 0);
    await page.locator('[data-reset-filters]').click();
    await page.locator('button[data-product-id="3"]').click();
    await page.waitForURL('**/order.html?product=3');
    assert.equal(await page.locator('#order-product').inputValue(), '3');
    await page.locator('button[type=submit]').click();
    assert.equal(await page.locator('[aria-invalid=true]').count(), 4);
    await page.locator('#name').fill('Максим');
    await page.locator('#email').fill('max@example.ru');
    await page.locator('#phone').fill('+7 (999) 123-45-67');
    await page.locator('#agree').check();
    await page.locator('button[type=submit]').click();
    assert.match(await page.locator('.form-message').innerText(), /данные не отправлены/);
    const before = await page.locator('html').getAttribute('data-theme');
    await page.locator('[data-theme-toggle]').click();
    await page.reload();
    assert.notEqual(await page.locator('html').getAttribute('data-theme'), before);
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const name of ['index', 'catalog', 'product', 'order', 'contacts']) {
        await page.goto(`${base}/${name}.html`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow, false, `${name}: overflow at ${width}`);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto(`${base}/catalog.html`);
    await page.screenshot({ path: path.join(root, 'Проверка-каталог.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: браузер Edge; 5 страниц, каталог, форма, тема, 3 ширины экрана; ошибок JavaScript нет.');
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
