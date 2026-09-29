const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [,, dir, list, out] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1180, height: 400 } });
  await p.goto('file://' + dir + '/sheet.html?f=' + list);
  await p.waitForTimeout(500);
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
})();
