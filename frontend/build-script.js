const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const DIST = path.join(ROOT, 'dist');
const BACKEND_PLACEHOLDER = 'https://your-backend.onrender.com';
const BACKEND_URL = process.env.BACKEND_URL || BACKEND_PLACEHOLDER;

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    let content = fs.readFileSync(src);
    // replace backend placeholder in JS config files
    if (src.endsWith('js' + path.sep + 'config.js')) {
      content = content.toString().replace(BACKEND_PLACEHOLDER, BACKEND_URL);
    }
    fs.writeFileSync(dest, content);
  }
}

// clean dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}

fs.mkdirSync(DIST);

// copy all frontend files into dist, but skip node_modules and dist
const items = fs.readdirSync(ROOT);
for (const item of items) {
  if (item === 'node_modules' || item === 'dist') continue;
  copyRecursive(path.join(ROOT, item), path.join(DIST, item));
}

console.log('Build complete. BACKEND_URL used:', BACKEND_URL);
