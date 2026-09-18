/**
 * Generates the PWA raster icons from the same geometry as public/favicon.svg.
 *
 * Why: the manifest only shipped an SVG icon, so Chrome refused the install
 * prompt (it requires 192px and 512px PNGs) and iOS — which does not support SVG
 * apple-touch-icons at all — rendered a blank tile when added to the home screen.
 *
 * Writes PNGs with a minimal hand-rolled encoder (zlib is in Node's stdlib), so
 * no image dependency is added to the project.
 *
 * Run: bun run scripts/generate-icons.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const publicDir = path.join(rootDir, 'public');

// --- Geometry (identical to favicon.svg, expressed in a 32x32 viewBox) --------
const VIEWBOX = 32;
const CORNER_RADIUS = 8;

interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  color: { r: number; g: number; b: number; a: number };
}

const CELLS: Cell[] = [
  // Table Header Bar
  { x: 6, y: 6, w: 20, h: 4.5, r: 2.2, color: { r: 255, g: 255, b: 255, a: 1.0 } },
  // Left Data Column Pillar
  { x: 6, y: 13.5, w: 8.5, h: 12.5, r: 2.2, color: { r: 255, g: 255, b: 255, a: 0.95 } },
  // Right Top Cell (Active calculation / Sky blue #38bdf8)
  { x: 17.5, y: 13.5, w: 8.5, h: 5, r: 2.2, color: { r: 0x38, g: 0xbd, b: 0xf8, a: 1.0 } },
  // Right Bottom Cell
  { x: 17.5, y: 21, w: 8.5, h: 5, r: 2.2, color: { r: 255, g: 255, b: 255, a: 0.65 } },
];

/** Checks whether point (px, py) is inside rounded rectangle (x, y, w, h, r). */
function insideBox(px: number, py: number, x: number, y: number, w: number, h: number, r: number): boolean {
  if (px < x || px > x + w || py < y || py > y + h) return false;
  const clampedX = Math.min(Math.max(px, x + r), x + w - r);
  const clampedY = Math.min(Math.max(py, y + r), y + h - r);
  if (px >= x + r && px <= x + w - r) return true;
  if (py >= y + r && py <= y + h - r) return true;
  return Math.hypot(px - clampedX, py - clampedY) <= r;
}

/** Signed-ish coverage of a rounded rectangle: true inside, false outside. */
function insideRoundedRect(px: number, py: number, size: number, radius: number): boolean {
  const r = radius;
  const clampedX = Math.min(Math.max(px, r), size - r);
  const clampedY = Math.min(Math.max(py, r), size - r);
  if (px >= r && px <= size - r) return py >= 0 && py <= size;
  if (py >= r && py <= size - r) return px >= 0 && px <= size;
  return Math.hypot(px - clampedX, py - clampedY) <= r;
}

/**
 * Supersampled RGBA rasteriser.
 *
 * @param maskable when true, paints a full-bleed square with the glyph scaled
 *   into the 80% "safe zone", as required for `purpose: maskable`.
 */
function rasterize(size: number, maskable = false, samples = 4): Buffer {
  const rgba = Buffer.alloc(size * size * 4);
  const scale = size / VIEWBOX;
  const radius = maskable ? 0 : CORNER_RADIUS * scale;
  const glyphScale = maskable ? 0.6 : 1;
  const offset = maskable ? (VIEWBOX * (1 - glyphScale)) / 2 : 0;
  const step = 1 / samples;
  const total = samples * samples;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgHits = 0;
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;

      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = x + (sx + 0.5) * step;
          const py = y + (sy + 0.5) * step;

          if (!insideRoundedRect(px, py, size, radius)) continue;
          bgHits++;

          const ux = px / scale / glyphScale - offset / glyphScale;
          const uy = py / scale / glyphScale - offset / glyphScale;

          // Diagonal gradient background (#4f46e5 to #3730a3)
          const gradT = Math.max(0, Math.min(1, (ux + uy) / 64));
          const bgR = 0x4f * (1 - gradT) + 0x37 * gradT;
          const bgG = 0x46 * (1 - gradT) + 0x30 * gradT;
          const bgB = 0xe5 * (1 - gradT) + 0xa3 * gradT;

          let hitCell: Cell | null = null;
          for (const cell of CELLS) {
            if (insideBox(ux, uy, cell.x, cell.y, cell.w, cell.h, cell.r)) {
              hitCell = cell;
              break;
            }
          }

          if (hitCell) {
            const ca = hitCell.color.a;
            totalR += hitCell.color.r * ca + bgR * (1 - ca);
            totalG += hitCell.color.g * ca + bgG * (1 - ca);
            totalB += hitCell.color.b * ca + bgB * (1 - ca);
          } else {
            totalR += bgR;
            totalG += bgG;
            totalB += bgB;
          }
        }
      }

      const i = (y * size + x) * 4;
      const alpha = bgHits / total;

      if (alpha === 0) {
        rgba[i] = 0;
        rgba[i + 1] = 0;
        rgba[i + 2] = 0;
        rgba[i + 3] = 0;
      } else {
        rgba[i] = Math.round(totalR / total);
        rgba[i + 1] = Math.round(totalG / total);
        rgba[i + 2] = Math.round(totalB / total);
        rgba[i + 3] = Math.round(alpha * 255);
      }
    }
  }

  return rgba;
}

// --- Minimal PNG encoder ------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(rgba: Buffer, size: number, height: number = size): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * A 1200x630 social card.
 *
 * Renders the centered brand mark with ambient background radial glow.
 */
function rasterizeOgCard(width: number, height: number, samples = 3): Buffer {
  const rgba = Buffer.alloc(width * height * 4);
  const step = 1 / samples;
  const total = samples * samples;

  const BG = { r: 0x05, g: 0x06, b: 0x08 };
  const INDIGO = { r: 0x4f, g: 0x46, b: 0xe5 };

  // Centered logo tile: 192x192
  const markSize = 192;
  const markX = (width - markSize) / 2;
  const markY = (height - markSize) / 2 - 20;
  const markRadius = (markSize / VIEWBOX) * CORNER_RADIUS;
  const scale = markSize / VIEWBOX;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let markHits = 0;
      let totalMarkR = 0;
      let totalMarkG = 0;
      let totalMarkB = 0;

      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = x + (sx + 0.5) * step;
          const py = y + (sy + 0.5) * step;

          const localX = px - markX;
          const localY = py - markY;

          if (!insideRoundedRect(localX, localY, markSize, markRadius)) continue;
          markHits++;

          const ux = localX / scale;
          const uy = localY / scale;

          const gradT = Math.max(0, Math.min(1, (ux + uy) / 64));
          const bgR = 0x4f * (1 - gradT) + 0x37 * gradT;
          const bgG = 0x46 * (1 - gradT) + 0x30 * gradT;
          const bgB = 0xe5 * (1 - gradT) + 0xa3 * gradT;

          let hitCell: Cell | null = null;
          for (const cell of CELLS) {
            if (insideBox(ux, uy, cell.x, cell.y, cell.w, cell.h, cell.r)) {
              hitCell = cell;
              break;
            }
          }

          if (hitCell) {
            const ca = hitCell.color.a;
            totalMarkR += hitCell.color.r * ca + bgR * (1 - ca);
            totalMarkG += hitCell.color.g * ca + bgG * (1 - ca);
            totalMarkB += hitCell.color.b * ca + bgB * (1 - ca);
          } else {
            totalMarkR += bgR;
            totalMarkG += bgG;
            totalMarkB += bgB;
          }
        }
      }

      const i = (y * width + x) * 4;

      // Radial background glow
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const lift = (1 - dist) * 0.18;

      let r = BG.r + (INDIGO.r - BG.r) * lift;
      let g = BG.g + (INDIGO.g - BG.g) * lift;
      let b = BG.b + (INDIGO.b - BG.b) * lift;

      if (markHits > 0) {
        const t = markHits / total;
        const mr = totalMarkR / markHits;
        const mg = totalMarkG / markHits;
        const mb = totalMarkB / markHits;
        r = r * (1 - t) + mr * t;
        g = g * (1 - t) + mg * t;
        b = b * (1 - t) + mb * t;
      }

      rgba[i] = Math.round(r);
      rgba[i + 1] = Math.round(g);
      rgba[i + 2] = Math.round(b);
      rgba[i + 3] = 255;
    }
  }

  return rgba;
}

const TARGETS: { file: string; size: number; maskable?: boolean }[] = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size, maskable } of TARGETS) {
  const png = encodePng(rasterize(size, !!maskable), size);
  fs.writeFileSync(path.join(publicDir, file), png);
  console.log(`[icons] wrote public/${file} (${size}x${size}, ${(png.length / 1024).toFixed(1)} kB)`);
}

// Social card. 1200x630 is the size Open Graph consumers expect.
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const ogPng = encodePng(rasterizeOgCard(OG_WIDTH, OG_HEIGHT), OG_WIDTH, OG_HEIGHT);
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPng);
console.log(
  `[icons] wrote public/og-image.png (${OG_WIDTH}x${OG_HEIGHT}, ${(ogPng.length / 1024).toFixed(1)} kB)`
);
