const sharp = require('sharp');
const fs = require('fs');

const svg = fs.readFileSync('Logo.svg');

async function make(size, name) {
  await sharp(svg)
    .resize(size, size, { fit: 'contain', background: { r: 8, g: 8, b: 8, alpha: 1 } })
    .png()
    .toFile(name);
  console.log('Created', name);
}

(async () => {
  await make(192, 'icon-192.png');
  await make(512, 'icon-512.png');
})();
