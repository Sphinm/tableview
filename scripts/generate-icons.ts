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
const BRAND = { r: 0x4f, g: 0x46, b: 0xe5 }; // #4f46e5
const STROKE_WIDTH = 2;

const STROKES: { x1: number; y1: number; x2: number; y2: number }[] = [
  { x1: 7, y1: 10, x2: 25, y2: 10 },
  { x1: 7, y1: 16, x2: 25, y2: 16 },
  { x1: 7, y1: 22, x2: 25, y2: 22 },
  { x1: 13, y1: 7, x2: 13, y2: 25 },
  { x1: 19, y1: 7, x2: 19, y2: 25 },
];

/** Distance from point p to segment ab, in viewBox units. */
function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/** Signed-ish coverage of a rounded rectangle: 1 inside, 0 outside. */
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
 *   into the 80% "safe zone", as required for `purpose: maskable`. A rounded,
 *   transparent-cornered icon used as maskable gets its corners cropped into a
 *   circle by Android, clipping the artwork.
 */
function rasterize(size: number, maskable = false, samples = 4): Buffer {
  const rgba = Buffer.alloc(size * size * 4);
  const scale = size / VIEWBOX;
  const radius = maskable ? 0 : CORNER_RADIUS * scale;
  // Maskable artwork is drawn at 60% and centred, keeping it inside the safe zone.
  const glyphScale = maskable ? 0.6 : 1;
  const offset = maskable ? (VIEWBOX * (1 - glyphScale)) / 2 : 0;
  const step = 1 / samples;
  const total = samples * samples;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgHits = 0;
      let strokeHits = 0;

      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = x + (sx + 0.5) * step;
          const py = y + (sy + 0.5) * step;

          if (!insideRoundedRect(px, py, size, radius)) continue;
          bgHits++;

          const ux = px / scale / glyphScale - offset / glyphScale;
          const uy = py / scale / glyphScale - offset / glyphScale;
          for (const s of STROKES) {
            if (distanceToSegment(ux, uy, s.x1, s.y1, s.x2, s.y2) <= STROKE_WIDTH / 2) {
              strokeHits++;
              break;
            }
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
        continue;
      }

      // Composite white strokes over the brand fill, weighted by coverage.
      const strokeRatio = strokeHits / bgHits;
      rgba[i] = Math.round(BRAND.r * (1 - strokeRatio) + 255 * strokeRatio);
      rgba[i + 1] = Math.round(BRAND.g * (1 - strokeRatio) + 255 * strokeRatio);
      rgba[i + 2] = Math.round(BRAND.b * (1 - strokeRatio) + 255 * strokeRatio);
      rgba[i + 3] = Math.round(alpha * 255);
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
 * Needed for two separate reasons:
 *   1. The site declared `twitter:card = summary_large_image` but shipped no
 *      og:image, so every share rendered a blank preview.
 *   2. Google's Article rich result wants an image; the guides' TechArticle
 *      markup had none, making them ineligible.
 *
 * Drawn with the same rasteriser as the icons — geometric only, no text, because
 * rasterising type would mean bundling a font engine for a decorative asset.
 */
function rasterizeOgCard(width: number, height: number, samples = 3): Buffer {
  const rgba = Buffer.alloc(width * height * 4);
  const step = 1 / samples;
  const total = samples * samples;

  // Brand palette, matching src/index.css.
  const BG = { r: 0x05, g: 0x06, b: 0x08 };
  const INDIGO = { r: 0x4f, g: 0x46, b: 0xe5 };
  const ACCENT = { r: 0x81, g: 0x8c, b: 0xf8 };

  // Logo mark, centred: a rounded square with the 3x3 grid motif.
  const markSize = 190;
  const markX = (width - markSize) / 2;
  const markY = (height - markSize) / 2 - 20;
  const markRadius = markSize * 0.22;
  const gridInset = markSize * 0.24;
  const strokeHalf = markSize * 0.022;

  const gridLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const offset = gridInset + ((markSize - gridInset * 2) / 2) * i;
    gridLines.push({ x1: markX + offset, y1: markY + gridInset, x2: markX + offset, y2: markY + markSize - gridInset });
    gridLines.push({ x1: markX + gridInset, y1: markY + offset, x2: markX + markSize - gridInset, y2: markY + offset });
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let markHits = 0;
      let strokeHits = 0;

      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = x + (sx + 0.5) * step;
          const py = y + (sy + 0.5) * step;

          if (!insideRoundedRect(px - markX, py - markY, markSize, markRadius)) continue;
          markHits++;

          for (const l of gridLines) {
            if (distanceToSegment(px, py, l.x1, l.y1, l.x2, l.y2) <= strokeHalf) {
              strokeHits++;
              break;
            }
          }
        }
      }

      const i = (y * width + x) * 4;

      // Subtle radial lift behind the mark so the card is not flat black.
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const lift = (1 - dist) * 0.16;

      let r = BG.r + (INDIGO.r - BG.r) * lift;
      let g = BG.g + (INDIGO.g - BG.g) * lift;
      let b = BG.b + (INDIGO.b - BG.b) * lift;

      if (markHits > 0) {
        const ratio = strokeHits / markHits;
        const t = markHits / total;
        const mr = INDIGO.r * (1 - ratio) + ACCENT.r * ratio;
        const mg = INDIGO.g * (1 - ratio) + ACCENT.g * ratio;
        const mb = INDIGO.b * (1 - ratio) + ACCENT.b * ratio;
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
