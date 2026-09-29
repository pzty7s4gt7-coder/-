// usage: node tools/shot.js <html> <out.png> [width] [height] [scriptAfterLoad]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [,, page, out, w = 1300, h = 1400, js] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const logs = [];
  p.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  const [f, hash] = page.split('#');
  await p.goto('file://' + require('path').resolve(f) + (hash ? '#' + hash : ''));
  await p.waitForTimeout(800);
  if (js) { await p.evaluate(js); await p.waitForTimeout(600); }
  await p.screenshot({ path: out, fullPage: true });
  console.log(logs.filter(l => !l.includes('ERR_FILE_NOT_FOUND') && !l.includes('Failed to load resource')).join('\n'));
  await b.close();
})();
