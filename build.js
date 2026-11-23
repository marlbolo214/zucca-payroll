const { mkdirSync, copyFileSync } = require('node:fs');
const { buildSync } = require('esbuild');

mkdirSync('public', { recursive: true });
for (const file of ['index.html', 'tax-2027.js']) {
  copyFileSync(file, 'public/' + file);
}
buildSync({
  entryPoints: ['pdf-export.js'],
  bundle: true,
  minify: true,
  outfile: 'public/pdf-export.bundle.js',
  target: ['safari15']
});
