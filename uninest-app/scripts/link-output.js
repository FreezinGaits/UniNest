const fs = require('fs');
const path = require('path');

const rootApp = path.resolve(__dirname, '..');
const src = path.join(rootApp, '.next');
const destDir = path.join(rootApp, 'uninest-app');
const dest = path.join(destDir, '.next');

if (fs.existsSync(src)) {
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    if (!fs.existsSync(dest)) {
      try {
        fs.symlinkSync(src, dest, 'junction');
        console.log('✓ Symlinked .next to uninest-app/.next for Vercel compatibility');
      } catch {
        fs.cpSync(src, dest, { recursive: true });
        console.log('✓ Copied .next to uninest-app/.next for Vercel compatibility');
      }
    }
  } catch (err) {
    console.warn('Vercel output directory fallback notice:', err?.message || err);
  }
}
