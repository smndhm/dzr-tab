import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

// New Deezer brand icon:
// - Near-black background (#0a0a0a) with deep-purple tint (#1a0a2e)
// - Heart/waveform mark in white, centred with padding
const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2d1060"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#bg)"/>
  <path
    d="M50 82
       C 28 68, 8 53, 8 35
       C 8 22, 18 13, 31 13
       C 39 13, 46 17, 50 26
       C 54 17, 61 13, 69 13
       C 82 13, 92 22, 92 35
       C 92 53, 72 68, 50 82 Z"
    fill="white"
  />
</svg>
`.trim();

function render(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  return resvg.render().asPng();
}

mkdirSync(publicDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const png = render(ICON_SVG, size);
  const dest = resolve(publicDir, `icon${size}.png`);
  writeFileSync(dest, png);
  console.log(`✓ icon${size}.png  (${png.byteLength} bytes)`);
}
