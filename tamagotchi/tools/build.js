// Bundles index.html + css + js into one page: dist/tamamiitsu.html
// (the font comes from Google Fonts in the bundle). usage: node tools/build.js
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
css = css.replace(/@font-face\s*{[^}]*}/, '');
html = html.replace('<link rel="stylesheet" href="css/style.css">',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap">\n<style>\n' + css + '\n</style>');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) =>
  '<script>\n' + fs.readFileSync(path.join(root, src), 'utf8').replace(/<\/script/gi, '<\\/script') + '\n</script>');
// the publish host adds its own document skeleton
html = html.replace(/<!doctype html>\s*/i, '').replace(/<html[^>]*>\s*/, '').replace(/<\/html>\s*/, '')
  .replace(/<head>\s*/, '').replace(/<\/head>\s*/, '').replace(/<body>\s*/, '').replace(/<\/body>\s*/, '')
  .replace(/<meta charset="utf-8">\s*/, '').replace(/<meta name="viewport"[^>]*>\s*/, '');
// title first
html = html.replace(/<title>[^<]*<\/title>\s*/, '');
html = '<title>たまみーつ</title>\n' + html;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/tamamiitsu.html'), html);
console.log('dist/tamamiitsu.html', (html.length / 1024).toFixed(0) + 'KB');
