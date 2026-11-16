const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const context = vm.createContext({ Intl });
for (const name of ['data', 'catalog', 'validation']) vm.runInContext(fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8'), context);
function check(code) { assert.equal(vm.runInContext(code, context), true, code); }
check('products.length === 8 && new Set(products.map(p => p.id)).size === 8');
check('products.every(p => Object.keys(p).join() === Object.keys(products[0]).join())');
check('searchProducts(products, "  RAZER  ").length === 2');
check('searchProducts(products, "несуществующий").length === 0');
check('searchProducts(products, " ").length === 8');
check('filterProductsByCategory(products, "keyboard").length === 2');
check('getAvailableProducts(products).length === 6');
check('sortProductsByPrice(products)[0].id === 8 && products[0].id === 1');
check('sortProductsByPrice(products, "desc")[0].id === 6');
check('findProductById(products, 3).title.includes("DeathAdder") && findProductById(products, 999) === undefined');
check('calculateTotalPrice(products) === 163930 && calculateAveragePrice(products) === 20491');
check('calculateAveragePrice([]) === 0 && calculateTotalPrice([]) === 0');
check('getPreparedProducts(products, "razer", "mouse", "asc", true)[0].id === 5');
check('Object.keys(validateOrder({name:"Максим", email:"max@example.ru", phone:"+7 (999) 123-45-67", agree:true})).length === 0');
check('Object.keys(validateOrder({name:" ", email:"x@", phone:"123", agree:false})).length === 4');
check('Boolean(validateOrder({name:"Максим", email:"max@example.ru", phone:"abc79991234567", agree:true}).phone)');
// Все локальные ссылки и ресурсы должны существовать.
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert(!/\son\w+\s*=/.test(html), 'Inline handler: ' + file);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#)/.test(match[1])) continue;
    const target = match[1].split(/[?#]/)[0];
    assert(fs.existsSync(path.join(root, target)), file + ': ' + target);
  }
}
console.log('PASS: 15 проверок данных и валидации; ссылки и ресурсы пяти страниц.');
