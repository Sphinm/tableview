import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { STATIC_PAGE_META, type PageMeta } from '../src/data/routeMeta';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const distDir = path.join(rootDir, 'dist');
const SITE = 'https://compress.tableview.dev';

interface FaqItem {
  q: string;
  a: string;
}

interface ResolvedPage {
  title: string;
  description: string;
  canonical: string;
  route: string;
  h1: string;
  intro: string;
  faqs: FaqItem[];
  articleHtml: string;
  jsonLd: Record<string, any>[];
}

const MEDIA_HOME_META = {
  title: 'TableView Media Compressor — 100% In-Browser Video & Image Compression',
  description:
    'Compress large MP4, WebM, PNG, JPG, and WebP files directly in your web browser with WebAssembly FFmpeg. Zero uploads, 100% private.',
  canonical: '/',
};


function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}



function publisherNodes() {
  return [
    {
      '@type': 'Organization',
      name: 'TableView.dev',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` },
    },
    {
      '@type': 'WebSite',
      name: 'TableView Media Compressor',
      url: SITE,
    },
  ];
}


function breadcrumb(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE}${item.url}`,
    })),
  };
}



/** Render universal semantic header (media). */
function generateHeaderHtml(): string {
  return `
    <header style="background: #0f172a; padding: 1rem 1.5rem;">
      <nav style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 1.25rem; align-items: center; font-size: 0.9rem; font-weight: 600;">
        <a href="/" style="color: #ffffff; text-decoration: none; font-weight: 800;">TableView Media Compressor</a>
        <a href="/video-compressor" style="color: #cbd5e1; text-decoration: none;">Video Compressor</a>
        <a href="/image-compressor" style="color: #cbd5e1; text-decoration: none;">Image Compressor</a>
        <a href="/media-tools" style="color: #cbd5e1; text-decoration: none;">All Tools</a>
        <span style="flex: 1;"></span>
        <a href="https://tableview.dev" style="color: #cbd5e1; text-decoration: none;">Financial Suite</a>
        <a href="https://tools.tableview.dev" style="color: #cbd5e1; text-decoration: none;">Data Tools</a>
      </nav>
    </header>
  `;
}


/** Render universal semantic footer (media). */
function generateFooterHtml(): string {
  return `
    <footer style="background: #0f172a; color: #cbd5e1; padding: 3rem 1.5rem; margin-top: 3rem;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; font-size: 0.88rem;">
        <div>
          <h4 style="color: #fff; margin-bottom: 0.75rem;">Video</h4>
          <a href="/video-compressor" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Video Compressor</a>
          <a href="/compress-mp4" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Compress MP4</a>
          <a href="/compress-video-for-discord" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">For Discord</a>
        </div>
        <div>
          <h4 style="color: #fff; margin-bottom: 0.75rem;">Image</h4>
          <a href="/image-compressor" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Image Compressor</a>
          <a href="/compress-png" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Compress PNG</a>
          <a href="/compress-jpg" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Compress JPG</a>
          <a href="/compress-webp" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Compress WebP</a>
        </div>
        <div>
          <h4 style="color: #fff; margin-bottom: 0.75rem;">TableView</h4>
          <a href="https://tableview.dev" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Financial Suite</a>
          <a href="https://tools.tableview.dev" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Data Tools</a>
        </div>
        <div>
          <h4 style="color: #fff; margin-bottom: 0.75rem;">Company</h4>
          <a href="/about" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">About</a>
          <a href="/contact" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Contact</a>
          <a href="/privacy" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Privacy</a>
          <a href="/terms" style="color: #94a3b8; text-decoration: none; display: block; margin-bottom: 0.5rem;">Terms</a>
        </div>
      </div>
      <p style="max-width: 1200px; margin: 2rem auto 0; color: #64748b; font-size: 0.8rem; border-top: 1px solid #1e293b; padding-top: 1.5rem;">
        TableView Media Compressor runs 100% client-side in WebAssembly FFmpeg. Your media never leaves your device.
      </p>
    </footer>
  `;
}


const VIDEO_COMPRESSOR_FAQS = [
  {
    q: 'How does in-browser video compression work without uploading to a server?',
    a: 'TableView uses FFmpeg compiled directly to WebAssembly (Wasm). When you drop a video into the browser, the WebAssembly engine runs inside a local sandbox using your device CPU and RAM. The video data is decoded, re-encoded using H.264/AAC, and exported as a new MP4 or WebM file without a single byte ever being transmitted across the network.',
  },
  {
    q: 'Will TableView add a watermark to my compressed video?',
    a: 'No. TableView provides 100% clean video export without watermarks, branding frames, intro/outro cards, or quality downgrades. Unlike cloud services that insert watermarks to force you into paid subscriptions, TableView runs locally on your machine for free.',
  },
  {
    q: 'Is there a file size limit for video compression?',
    a: 'Because video processing occurs entirely client-side without consuming expensive cloud server bandwidth, TableView does not enforce artificial 100MB or 500MB upload limits. You can compress any video that your local device memory (RAM) can accommodate.',
  },
  {
    q: 'How can I compress a video to an exact target size (e.g. 25MB for Discord or 16MB for WhatsApp)?',
    a: 'Switch to the Target Size mode in our right-hand control panel and enter your desired target megabytes (e.g. 25MB for Discord or 16MB for WhatsApp). The engine dynamically calculates the required video bitrate based on the exact duration of your clip to ensure the output matches your target threshold.',
  },
  {
    q: 'Which video formats and resolutions are supported?',
    a: 'TableView accepts MP4, MOV, WebM, AVI, and MKV files. You can maintain original resolution or downscale to 1080p Full HD, 720p HD, or 480p SD, adjust Constant Rate Factor (CRF 18-35), and optionally remove or compress audio tracks.',
  },
];

const COMPRESS_MP4_FAQS = [
  {
    q: 'How much can I compress an MP4 file without noticeable quality loss?',
    a: 'Using H.264 video encoding with a Constant Rate Factor (CRF) between 23 and 28, you can typically reduce MP4 file sizes by 50% to 75% while keeping visual compression artifacts virtually imperceptible on standard 1080p and 4K displays.',
  },
  {
    q: 'Is it safe to compress private or sensitive MP4 videos here?',
    a: 'Yes, 100%. Unlike cloud video converters, TableView uses in-browser WebAssembly FFmpeg. Your video file never leaves your computer, and zero bytes are transmitted across any network.',
  },
  {
    q: 'How does WebAssembly FFmpeg compare to server-side converters?',
    a: 'Because processing is local, you avoid multi-minute upload queues and server wait times. Encoding speed depends purely on your local machine CPU cores, and there are no artificial file size caps or watermarks.',
  },
  {
    q: 'Can I change MP4 resolution or frame rate?',
    a: 'Yes. You can preserve the original resolution or downscale to 1080p Full HD, 720p HD, or 480p SD, and customize audio bitrates or mute audio tracks entirely to maximize compression.',
  },
];

const COMPRESS_VIDEO_FOR_DISCORD_FAQS = [
  {
    q: 'What is the maximum file size for free Discord uploads?',
    a: "Discord allows free users to upload files up to 25MB (previously 8MB, and occasionally 10MB during A/B tests). Nitro Basic expands this to 50MB, and Nitro Classic/Pro allows up to 500MB. TableView defaults to a 24MB target to guarantee your video uploads successfully on any free Discord account.",
  },
  {
    q: 'How does TableView guarantee the compressed video is under 25MB?',
    a: 'Our engine computes the exact mathematical bitrate required based on your clip duration: Target Bitrate (kbps) = (Target MB × 8,192) / Duration (seconds) - Audio Bitrate. FFmpeg encodes with rate control buffers so the final file stays strictly below your target threshold.',
  },
  {
    q: 'Will compressing for Discord desync my audio?',
    a: 'No. TableView maintains constant frame rate (CFR) and synchronizes audio presentation timestamps (PTS) using standard AAC stereo encoding at 128 kbps, preventing the common audio drift issues found in cheap online tools.',
  },
  {
    q: 'Can I compress Discord screen recordings or game clips from OBS/GeForce Experience?',
    a: 'Yes. TableView accepts raw MP4, MKV, MOV, and WebM clips from OBS, GeForce Experience, AMD Radeon ReLive, and phone screen recorders.',
  },
];

const IMAGE_COMPRESSOR_FAQS = [
  {
    q: 'How does batch image compression work in TableView?',
    a: 'TableView uses high-performance HTML5 Canvas rendering and browser-native image codecs. You can drag and drop dozens of JPEG, PNG, or WebP images at once; each image is processed concurrently in browser memory, with real-time compression ratio calculation and a 1-click ZIP export.',
  },
  {
    q: 'How does the interactive before-and-after curtain slider help evaluate quality?',
    a: 'The visual curtain comparison slider lets you scrub horizontally across the image to compare the original uncompressed source directly against the compressed result. This allows you to verify that text remains crisp and details are preserved without compression artifacts before downloading.',
  },
  {
    q: 'Which format should I choose: WebP, JPEG, or PNG?',
    a: 'WebP provides superior compression efficiency, yielding 25%–35% smaller file sizes than JPEG at equivalent visual quality while supporting transparency. JPEG is best for universal compatibility across legacy platforms, and PNG is recommended for graphics with sharp geometric edges, logos, and alpha transparency.',
  },
  {
    q: 'Are my images uploaded to any cloud server or stored online?',
    a: 'Never. All image rendering, downscaling, compression, and ZIP packaging take place strictly within your local browser sandbox. No image data or metadata is ever sent to any remote server or third party.',
  },
  {
    q: 'Can I resize image dimensions in pixels during compression?',
    a: 'Yes. You can preserve the original aspect ratio while capping maximum dimensions to presets such as 1920px (Full HD), 1280px (HD), 800px (Web standard), or keeping original dimensions.',
  },
];

const COMPRESS_PNG_FAQS = [
  {
    q: 'How does PNG compression preserve transparent backgrounds?',
    a: 'TableView uses HTML5 canvas 2D contexts with alpha channel preservation. It cleans up redundant metadata chunks, optimizes color indexing, and applies lossless or near-lossless quantization without corrupting transparent pixels or producing halo artifacts.',
  },
  {
    q: 'Should I compress PNG or convert it to WebP?',
    a: 'If you need universal legacy compatibility or strictly lossless graphic assets (like UI icons, vector logos, and design mockups), PNG is optimal. If your goal is website loading speed and smaller bandwidth, WebP offers up to 40% smaller file sizes while still supporting transparency.',
  },
  {
    q: 'Can I compress multiple PNG screenshots at once?',
    a: 'Yes. TableView supports batch dragging and dropping. Drop dozens of PNG screenshots into the browser, review the compressed size reduction for each, and download all optimized files in a single organized ZIP archive.',
  },
  {
    q: 'Are my confidential company screenshots uploaded to a server?',
    a: 'Never. All image parsing and compression execute inside your browser local memory sandbox. No telemetry, image payloads, or logs are transmitted to any remote server.',
  },
];

const COMPRESS_JPG_FAQS = [
  {
    q: 'How does JPEG compression reduce photo file sizes?',
    a: 'JPEG utilizes discrete cosine transform (DCT) lossy compression. By adjusting the quality parameter between 70% and 85%, TableView eliminates high-frequency image data imperceptible to the human eye, reducing typical 8MB–15MB DSLR/smartphone photos to 400KB–900KB.',
  },
  {
    q: 'Does compressing JPG photos strip private EXIF GPS metadata?',
    a: 'Yes. When re-rendering photos via the browser HTML5 Canvas, unnecessary EXIF headers, camera serial numbers, and sensitive GPS geolocation coordinates are naturally stripped, protecting your personal privacy before sharing photos online.',
  },
  {
    q: 'Can I resize large 4K photos down to standard web dimensions?',
    a: 'Yes. TableView includes resolution constraint presets: you can cap maximum width or height to 1920px (Full HD), 1280px (HD), or 800px (blog standard), which drastically cuts file size while maintaining pristine visual sharpness.',
  },
  {
    q: 'Is there a limit on how many JPGs I can compress at once?',
    a: 'No server-imposed limit exists. Because compression utilizes your local machine multi-core CPU and memory, you can batch compress dozens of photos in a single session and download them all via 1-click ZIP.',
  },
];

const COMPRESS_WEBP_FAQS = [
  {
    q: 'Why is WebP better than JPEG and PNG for websites?',
    a: 'WebP was developed by Google to provide superior compression for web images. WebP lossy images are 25% to 34% smaller than comparable JPEG images, and WebP lossless images are 26% smaller than PNGs. Furthermore, WebP natively supports transparent alpha channels in both lossy and lossless modes.',
  },
  {
    q: 'Do all modern web browsers support WebP images?',
    a: 'Yes. Over 97% of global web browsers support WebP, including Google Chrome, Apple Safari (iOS 14+ and macOS Big Sur+), Mozilla Firefox, Microsoft Edge, and Opera.',
  },
  {
    q: 'Can I convert existing JPG and PNG files into compressed WebP files?',
    a: 'Yes. Simply drop your JPG or PNG files into TableView, select WebP as your target output format, set your desired compression quality, and the engine will instantly convert and compress them into modern WebP format.',
  },
  {
    q: 'How can I verify the image quality before downloading?',
    a: 'TableView includes an interactive before-and-after curtain slider. You can scrub across the image at 100% zoom to inspect fine details, text edges, and textures to ensure zero compression degradation.',
  },
];

function generateVideoCompressorContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #a7f3d0;">Pure Client-Side WebAssembly · Zero Server Upload</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">Free Online Video Compressor: 100% In-Browser &amp; No Watermark</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Compress MP4, MOV, WebM, and MKV video files directly inside your browser using WebAssembly FFmpeg. Reduce file sizes by up to 90% without uploading bytes to remote servers, without watermarks, and with synchronized before-and-after video playback preview.</p>
      </header>

      <aside style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #0284c7; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Answer (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #0c4a6e; font-size: 0.95rem; line-height: 1.6;">TableView.dev Video Compressor is a 100% free, privacy-first web utility powered by WebAssembly FFmpeg. It compresses MP4, MOV, WebM, and MKV video files up to 85% with zero watermarks, zero server uploads (0 KB network egress), and custom target MB output (e.g. 25MB for Discord, 16MB for WhatsApp). No account or software installation required.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Why In-Browser Video Compression Changes Everything</h2>
        <p>Traditional online video compressors (like Clideo, VideoCompress.ai, or FreeConvert) require you to upload large multi-gigabyte video files to remote cloud servers. This introduces three critical bottlenecks: slow upload times on limited connections, severe privacy risks for confidential footage or personal family videos, and aggressive paywalls with watermarks on free tiers.</p>
        <p><strong>TableView solves this entirely on the client side:</strong> By compiling the industry-standard FFmpeg multimedia framework to WebAssembly (Wasm), video decoding, bitrate optimization, and H.264 re-encoding execute 100% inside your browser tab on your local CPU and GPU. Your video never leaves your machine.</p>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">In-Browser WebAssembly vs. Traditional Cloud Video Compressors</h2>
        <div style="overflow-x: auto; margin: 1.5rem 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f8fafc; color: #0f172a;">
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left;">Feature / Metric</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; color: #059669;">TableView.dev (Wasm)</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; color: #e11d48;">Traditional Cloud Compressors</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600;">Data Privacy &amp; Security</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">100% Private (0 bytes uploaded)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #64748b;">Uploaded to third-party cloud/S3 storage</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600;">Watermark Policy</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">Zero Watermarks (Clean Video Export)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #64748b;">Branding watermark forced on free tiers</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600;">File Size Limitations</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">No artificial cloud file caps</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #64748b;">Strict 100 MB – 500 MB upload limits</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600;">Processing Latency</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">Immediate local encoding (No upload delay)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #64748b;">Slow upload + cloud queue wait + download</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600;">Target File Size (MB)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">Exact target MB with auto-bitrate calculation</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #64748b;">Coarse percentage estimates only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Optimized Compression Presets for Popular Platforms</h2>
        <ul style="line-height: 2;">
          <li><strong>Discord (25 MB / 50 MB limits):</strong> Set custom target to 24 MB to safely bypass Discord free attachment limits without losing 1080p visual sharpness.</li>
          <li><strong>WhatsApp (16 MB limit):</strong> Compress smartphone 4K or 1080p videos down to 15 MB for instant messaging delivery.</li>
          <li><strong>Email Attachments (20 MB / 25 MB):</strong> Shrink corporate presentations, screen recordings, and demos into lightweight email-ready MP4 files.</li>
          <li><strong>Twitter / X (512 MB &amp; fast web streaming):</strong> Encode with web-optimized MP4 container flags for immediate video playback without buffering.</li>
        </ul>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${VIDEO_COMPRESSOR_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

function generateImageCompressorContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #a7f3d0;">High-Speed In-Browser Canvas · Batch Processing &amp; ZIP</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">Free Online Image Compressor: Batch JPG, PNG, WebP &amp; ZIP Export</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Batch compress photos and graphics directly in your browser with 100% privacy. Features an interactive before-and-after curtain comparison slider, custom quality adjustments, pixel resizing, and one-click ZIP packaging.</p>
      </header>

      <aside style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #0284c7; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Answer (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #0c4a6e; font-size: 0.95rem; line-height: 1.6;">TableView.dev Image Compressor provides client-side batch compression for JPG, PNG, and WebP using HTML5 Canvas &amp; WebCodecs. It achieves up to 80% size reduction with interactive before/after visual inspection, zero server uploads (100% in-browser RAM), and instant 1-click bulk ZIP archive downloads. Completely free with no file limits.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Batch Compression Engine Powered by HTML5 Canvas</h2>
        <p>Whether preparing product catalogs for e-commerce, optimizing web assets for Google PageSpeed Insights, or reducing smartphone photo storage, TableView provides an instant batch image optimization workstation. Drag and drop dozens of JPEG, PNG, or WebP files simultaneously; our canvas engine processes them in parallel directly in browser memory without sending a single pixel across the internet.</p>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Format Comparison: WebP vs. JPEG vs. PNG</h2>
        <div style="overflow-x: auto; margin: 1.5rem 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f8fafc; color: #0f172a;">
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left;">Format</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left;">Recommended Use Cases</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left;">Typical Size Savings</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left;">Transparency Support</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600; color: #0284c7;">WebP (Recommended)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">Modern websites, mobile apps, e-commerce stores</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">30% – 80% smaller than original</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">Yes (Full Alpha Channel)</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600; color: #0f172a;">JPEG (.jpg)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">Photographs, legacy platforms, email newsletters</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">40% – 70% reduction</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">No</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600; color: #0f172a;">PNG (.png)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">Logos, icons, UI screenshots with text</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">20% – 45% lossless optimization</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">Yes (Full Alpha Channel)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Visual Curtain Split-Screen Inspection</h2>
        <p>Lossy compression algorithms can introduce micro-artifacts, blurry edges, or banding in gradients. TableView includes an interactive horizontal curtain slider allowing you to scrub across the image at 100% zoom. Inspect pixels, text edges, and fine gradients before deciding to download.</p>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${IMAGE_COMPRESSOR_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

function generateCompressMp4ContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #a7f3d0;">H.264 / AAC WebAssembly · 0 KB Server Egress</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">Compress MP4 Video Online: Reduce File Size Without Quality Loss</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Shrink heavy MP4 videos by up to 80% while retaining pristine 1080p and 4K visual clarity. Encoded client-side using WebAssembly FFmpeg — zero watermarks, zero server uploads, and instant synchronized playback preview.</p>
      </header>

      <aside style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #0284c7; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Summary (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #0c4a6e; font-size: 0.95rem; line-height: 1.6;">TableView.dev Compress MP4 is a free browser-based video optimizer. It reduces MP4 file sizes through calibrated H.264 Constant Rate Factor (CRF) encoding and AAC audio compression. All processing runs in a local WebAssembly sandbox with no file uploads, no watermarks, and no software installation required.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">The Science of MP4 Bitrate &amp; Constant Rate Factor (CRF)</h2>
        <p>The MP4 container format combined with the H.264 (AVC) codec remains the universal standard for video playback across iOS, Android, Windows, macOS, and web platforms. However, high-bitrate phone recordings and screen captures frequently generate bloated files (500 MB to 2 GB) that cannot be easily shared.</p>
        <p>Instead of traditional lossy re-encoding that degrades sharpness, TableView applies intelligent CRF rate control. Lower CRF values (18–23) preserve visually lossless quality for high-motion footage, while values around 24–28 deliver massive 60%–80% size reductions ideal for web streaming and sharing.</p>
      </section>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Recommended MP4 Compression Profiles</h2>
        <div style="overflow-x: auto; margin: 1.5rem 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f8fafc; color: #0f172a;">
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left;">Use Case</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left;">Resolution</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left;">CRF Target</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; color: #059669;">Typical Size Reduction</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600;">Web &amp; Email Delivery</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">1080p / 720p</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">CRF 26–28</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">70% – 85%</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600;">Social Media (X, IG, TikTok)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">1080p</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">CRF 23–25</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">55% – 70%</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; font-weight: 600;">High-Fidelity Archiving</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">Original (4K/1080p)</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem;">CRF 19–22</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.75rem; color: #059669; font-weight: 600;">35% – 50%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${COMPRESS_MP4_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

function generateCompressVideoForDiscordContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #a7f3d0;">Discord 25MB &amp; 10MB Auto-Bitrate Engine</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">Compress Video for Discord: Fit 25MB Free Limit Without Nitro</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Automatically calculate exact video bitrate to compress clips down to under 25MB (or 10MB/8MB) for free Discord uploads. Runs 100% in your browser with zero server uploads, clean audio sync, and no watermarks.</p>
      </header>

      <aside style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #0284c7; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Summary (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #0c4a6e; font-size: 0.95rem; line-height: 1.6;">TableView.dev Discord Video Compressor lets you bypass Discord's 25MB upload limit without paying for Nitro. Our WebAssembly engine reads your video duration, computes the exact maximum bitrate, and encodes an MP4 clip guaranteed to stay under 24MB. 100% free with no watermarks and no server transmission.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Discord Upload Tiers &amp; Bitrate Math Formulation</h2>
        <p>Discord enforces strict file size boundaries depending on user tier:</p>
        <ul style="line-height: 2;">
          <li><strong>Free Users:</strong> 25 MB standard upload limit (previously 8 MB, occasionally 10 MB in select regions).</li>
          <li><strong>Nitro Basic:</strong> 50 MB upload limit.</li>
          <li><strong>Nitro Pro:</strong> 500 MB upload limit.</li>
        </ul>
        <p>To safely fit within the 25MB boundary without upload rejection, TableView targets 24 MB and dynamically solves for video bitrate:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem 1.5rem; font-family: monospace; font-size: 0.9rem; color: #0f172a; margin: 1rem 0;">
          Target Bitrate (kbps) = [(24 MB &times; 8,192 kb/MB) / Duration (seconds)] - 128 kbps (Audio)
        </div>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${COMPRESS_VIDEO_FOR_DISCORD_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

function generateCompressPngContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #a7f3d0;">Alpha Transparency Preservation · 100% In-Browser</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">Compress PNG Images Online: Lossless &amp; Transparency Preserved</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Optimize PNG graphics, transparent logos, and UI screenshots directly in your browser. Reduce file sizes by up to 70% without sacrificing alpha transparency, introducing color banding, or transmitting data over the web.</p>
      </header>

      <aside style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #0284c7; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Summary (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #0c4a6e; font-size: 0.95rem; line-height: 1.6;">TableView.dev PNG Compressor cleans redundant metadata, deflates image chunks, and preserves transparent alpha channels using client-side HTML5 canvas pipelines. Batch compress dozens of PNG assets simultaneously and download all results in a single 1-click ZIP archive.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Why Transparent PNG Assets Need Specialized Compression</h2>
        <p>Unlike JPEG which discards alpha information entirely, PNG stores full 8-bit or 16-bit transparency per pixel. Standard compressors often ruin delicate antialiasing around transparent borders, creating unsightly gray or white halos.</p>
        <p>TableView's rendering engine preserves 32-bit RGBA color pipelines, stripping non-essential color profiles and ancillary metadata chunks (tEXt, zTXt, iTXt) to deliver minimal payload sizes without fringe artifacts.</p>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${COMPRESS_PNG_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

function generateCompressJpgContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #a7f3d0;">EXIF GPS Sanitization · Batch 1-Click ZIP</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">Compress JPG &amp; JPEG Photos: Reduce MB to KB Online</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Batch compress smartphone and camera JPEG photographs from 10MB+ down to web-friendly sizes under 500KB. Automatically strips privacy-sensitive EXIF location metadata with interactive before-and-after visual inspection.</p>
      </header>

      <aside style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #0284c7; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Summary (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #0c4a6e; font-size: 0.95rem; line-height: 1.6;">TableView.dev JPG Compressor re-quantizes JPEG discrete cosine transform (DCT) coefficients client-side. It yields 50% to 80% file size reductions, sanitizes private camera EXIF GPS data, and supports batch processing with instant ZIP download. No server uploads or software installations required.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">DCT Quantization &amp; Privacy-First EXIF Stripping</h2>
        <p>Digital cameras and smartphones embed extensive metadata into JPEG headers: GPS latitude and longitude, camera serial numbers, exposure settings, and timestamps. When compressing photos with TableView, rendering through an isolated HTML5 Canvas automatically discards unnecessary EXIF tags, protecting your privacy prior to public distribution.</p>
        <p>Our quantization matrix balances luminance and chrominance fidelity, ensuring that skin tones, textures, and subtle gradients remain smooth without the pixelated block artifacts common to aggressive online tools.</p>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${COMPRESS_JPG_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

function generateCompressWebpContentHtml(): string {
  return `
    <article style="max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <span style="background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #a7f3d0;">Google Next-Gen Format · 30% Smaller Than JPEG</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-top: 0.75rem; margin-bottom: 1rem;">Compress WebP Images: Maximize Website Loading Speed</h1>
        <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7;">Optimize modern WebP graphics and convert JPG/PNG into high-efficiency WebP format. Improve Google Core Web Vitals and Largest Contentful Paint (LCP) scores with 100% private in-browser compression.</p>
      </header>

      <aside style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 1.25rem 1.5rem; border-radius: 0 0.75rem 0.75rem 0; margin-bottom: 2.5rem;">
        <strong style="color: #0284c7; display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Quick Summary (GEO / TL;DR)</strong>
        <p style="margin: 0; color: #0c4a6e; font-size: 0.95rem; line-height: 1.6;">TableView.dev WebP Compressor provides client-side batch optimization and format conversion to Google WebP. Achieve up to 85% bandwidth reduction compared to uncompressed images with full alpha channel support, zero server uploads, and bulk ZIP export.</p>
      </aside>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Core Web Vitals &amp; Modern Web Performance</h2>
        <p>Google Search ranking factors heavily prioritize page load velocity via Core Web Vitals metrics, specifically Largest Contentful Paint (LCP). Large hero images and uncompressed banners are the #1 cause of slow page scores.</p>
        <p>By leveraging predictive VP8 intra-frame block coding, WebP achieves superior compression efficiency over JPEG and PNG without sacrificing visual clarity or transparency. Modern browsers (Chrome, Safari, Firefox, Edge) provide 97%+ global native decoding support.</p>
      </section>

      <section style="margin-top: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${COMPRESS_WEBP_FAQS.map(
          (f) => `
          <div style="margin-bottom: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3>
            <p style="color: #64748b; line-height: 1.7; margin: 0;">${escapeHtml(f.a)}</p>
          </div>
        `
        ).join('')}
      </section>
    </article>
  `;
}

/** Render Homepage semantic content */

function generateMediaToolsHubContentHtml(): string {
  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 3.5rem 1.5rem;">
      <header style="text-align: center; margin-bottom: 3.5rem;">
        <span style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 1rem;">100% Client-Side WebAssembly Studio</span>
        <h1 style="font-size: 2.75rem; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 1rem;">Media Compression Studio</h1>
        <p style="font-size: 1.2rem; color: #64748b; max-width: 820px; margin: 0 auto; line-height: 1.7;">Compress MP4, MOV, WebM videos and batch optimize JPG, PNG, and WebP images directly in your browser. Powered by WebAssembly FFmpeg and canvas codecs. Zero server uploads, no watermarks.</p>
      </header>

      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Video Compression Tools</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/video-compressor" style="color: #0f172a; text-decoration: none;">Free Video Compressor</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Compress MP4, MOV, WebM, and MKV files locally with CRF quality presets or exact target MB limits.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/compress-mp4" style="color: #0f172a; text-decoration: none;">Compress MP4 Online</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Shrink MP4 video file size up to 90% in your browser without watermarks or quality degradation.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/compress-video-for-discord" style="color: #0f172a; text-decoration: none;">Compress Video for Discord</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Quickly downscale and compress clips under Discord's 25MB or 50MB attachment limit.</p>
          </div>
        </div>
      </section>

      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem;">Image Compression Tools</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/image-compressor" style="color: #0f172a; text-decoration: none;">Batch Image Compressor</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Batch optimize JPEG, PNG, and WebP images with interactive before/after preview and 1-click ZIP export.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/compress-png" style="color: #0f172a; text-decoration: none;">Compress PNG Online</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Shrink transparent PNG files while maintaining sharp line-art and clean alpha channels.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/compress-jpg" style="color: #0f172a; text-decoration: none;">Compress JPG Online</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Reduce JPG photo size with fine-grained visual quality control and EXIF options.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="/compress-webp" style="color: #0f172a; text-decoration: none;">Compress WebP Online</a></h3>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">Create highly optimized modern WebP images for web performance and Google Core Web Vitals.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

/** Render static legal & E-E-A-T pages (media flavor). */
function generateStaticPageContentHtml(canonical: string): string {
  if (canonical === '/about') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">About TableView Media Compressor</h1>
        <p>TableView Media Compressor (compress.tableview.dev) compresses video and images entirely inside your browser using WebAssembly FFmpeg and canvas codecs. Your files are never uploaded — compression happens on-device, so nothing is stored, logged, or shared.</p>
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 1.75rem;">Why client-side matters</h2>
        <p>Private photos and video recordings should not leave your device. Local WebAssembly encoding eliminates the petabyte-scale storage and data-broker risk of server-side compression services.</p>
      </article>
    `;
  }
  if (canonical === '/contact') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Contact TableView Media Compressor</h1>
        <p>Questions, format support, or technical help: <a href="mailto:feedback@tableview.dev" style="color: #0284c7;">feedback@tableview.dev</a>. We respond within 24–48 business hours.</p>
      </article>
    `;
  }
  if (canonical === '/privacy') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Privacy Policy</h1>
        <p>All compression runs locally in your browser. We never view, store, or transmit your files. Standard hosting metadata (IP, user-agent, timestamps) is logged for security, and advertising uses Google Consent Mode v2 with a denied-by-default posture.</p>
      </article>
    `;
  }
  if (canonical === '/terms') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Terms of Service</h1>
        <p>By using TableView Media Compressor you agree to these terms. The tools are provided "as is" without warranty. You are responsible for holding the rights to any media you process.</p>
      </article>
    `;
  }
  if (canonical === '/disclaimer') {
    return `
      <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; color: #334155; line-height: 1.8;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Disclaimer</h1>
        <p>Compression results depend on source quality and selected settings. Estimated file-size savings are approximations and may vary by codec and content.</p>
      </article>
    `;
  }
  return '';
}


/** Map one prerender target to its route-specific page model (media only). */
function resolvePage(url: string, canonical: string): ResolvedPage {
  const route = url;

  const handlers: Record<string, { gen: () => string; faqs: FaqItem[]; label: string }> = {
    '/': { gen: generateVideoCompressorContentHtml, faqs: VIDEO_COMPRESSOR_FAQS, label: 'Free In-Browser Video Compressor' },
    '/media-tools': { gen: generateMediaToolsHubContentHtml, faqs: [], label: 'Media Compression Studio' },
    '/video-compressor': { gen: generateVideoCompressorContentHtml, faqs: VIDEO_COMPRESSOR_FAQS, label: 'Free Online Video Compressor' },
    '/compress-mp4': { gen: generateCompressMp4ContentHtml, faqs: COMPRESS_MP4_FAQS, label: 'Compress MP4 Video' },
    '/compress-video-for-discord': { gen: generateCompressVideoForDiscordContentHtml, faqs: COMPRESS_VIDEO_FOR_DISCORD_FAQS, label: 'Compress Video for Discord' },
    '/image-compressor': { gen: generateImageCompressorContentHtml, faqs: IMAGE_COMPRESSOR_FAQS, label: 'Batch Image Compressor' },
    '/compress-png': { gen: generateCompressPngContentHtml, faqs: COMPRESS_PNG_FAQS, label: 'Compress PNG Images' },
    '/compress-jpg': { gen: generateCompressJpgContentHtml, faqs: COMPRESS_JPG_FAQS, label: 'Compress JPG Images' },
    '/compress-webp': { gen: generateCompressWebpContentHtml, faqs: COMPRESS_WEBP_FAQS, label: 'Compress WebP Images' },
  };

  const handler = handlers[canonical];
  if (handler) {
    const meta = canonical === '/' ? MEDIA_HOME_META : STATIC_PAGE_META[canonical];
    return {
      title: meta.title,
      description: meta.description,
      canonical,
      route,
      h1: handler.label,
      intro: meta.description,
      faqs: handler.faqs,
      articleHtml: handler.gen(),
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: handler.label,
          url: `${SITE}${canonical === '/' ? '' : canonical}`,
          description: meta.description,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'All',
          browserRequirements: 'Requires WebAssembly support.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        ...(handler.faqs.length
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: handler.faqs.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              },
            ]
          : []),
        breadcrumb([
          { name: 'Home', url: '/' },
          { name: handler.label, url: canonical === '/' ? '/' : canonical },
        ]),
      ],
    };
  }

  const staticMeta = STATIC_PAGE_META[canonical];
  if (staticMeta) {
    return {
      ...staticMeta,
      route,
      faqs: [],
      h1: staticMeta.title,
      intro: staticMeta.description,
      articleHtml: generateStaticPageContentHtml(canonical),
      jsonLd: [
        {
          '@type': 'WebPage',
          name: staticMeta.title,
          description: staticMeta.description,
          url: `${SITE}${staticMeta.canonical}`,
        },
        breadcrumb([
          { name: 'Home', url: '/' },
          { name: staticMeta.title, url: staticMeta.canonical },
        ]),
      ],
    };
  }

  throw new Error(`No metadata defined for canonical route "${canonical}" (from ${url})`);
}


/** Scoped prerender targets for this app (media + legal). */
function listPrerenderTargets(): { url: string; canonical: string }[] {
  const targets = new Map<string, string>();
  const add = (url: string, canonical: string) => {
    if (!targets.has(url)) targets.set(url, canonical);
  };

  add('/', '/');
  add('/media-tools', '/media-tools');
  add('/media', '/media-tools');
  add('/compression-tools', '/media-tools');

  add('/video-compressor', '/video-compressor');
  add('/compress-video', '/video-compressor');
  add('/video-compress', '/video-compressor');
  add('/reduce-video-size', '/video-compressor');

  add('/compress-mp4', '/compress-mp4');
  add('/mp4-compressor', '/compress-mp4');
  add('/mp4-compress', '/compress-mp4');

  add('/compress-video-for-discord', '/compress-video-for-discord');
  add('/discord-video-compressor', '/compress-video-for-discord');

  add('/image-compressor', '/image-compressor');
  add('/compress-image', '/image-compressor');
  add('/image-compress', '/image-compressor');
  add('/photo-compressor', '/image-compressor');
  add('/reduce-image-size', '/image-compressor');

  add('/compress-png', '/compress-png');
  add('/png-compressor', '/compress-png');
  add('/png-compress', '/compress-png');

  add('/compress-jpg', '/compress-jpg');
  add('/compress-jpeg', '/compress-jpg');
  add('/jpeg-compressor', '/compress-jpg');
  add('/jpg-compressor', '/compress-jpg');

  add('/compress-webp', '/compress-webp');
  add('/webp-compressor', '/compress-webp');
  add('/webp-compress', '/compress-webp');

  add('/about', '/about');
  add('/about-us', '/about');
  add('/contact', '/contact');
  add('/contact-us', '/contact');
  add('/support', '/contact');
  add('/privacy', '/privacy');
  add('/privacy-policy', '/privacy');
  add('/terms', '/terms');
  add('/terms-of-service', '/terms');
  add('/tos', '/terms');
  add('/disclaimer', '/disclaimer');

  return [...targets.entries()].map(([url, canonical]) => ({ url, canonical }));
}


function renderHtml(template: string, page: ResolvedPage): string {
  const url = `${SITE}${page.canonical}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);

  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /<meta name="title" content="[^"]*" \/>/,
    `<meta name="title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${description}" />`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`
  );

  // Open Graph
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${description}" />`
  );

  // Twitter
  html = html.replace(/<meta property="twitter:url" content="[^"]*" \/>/, `<meta property="twitter:url" content="${url}" />`);
  html = html.replace(/<meta property="twitter:title" content="[^"]*" \/>/, `<meta property="twitter:title" content="${title}" />`);
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:description" content="${description}" />`
  );

  // Swap the homepage WebApplication JSON-LD for route-specific structured data.
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(
      { '@context': 'https://schema.org', '@graph': [...publisherNodes(), ...page.jsonLd] },
      null,
      2
    )}\n    </script>`
  );

  // Social preview image.
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    (match) =>
      `${match}\n    <meta property="og:image" content="${SITE}/og-image.png" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="TableView.dev — private in-browser media compression" />`
  );

  html = html.replace(
    /<meta property="twitter:url" content="[^"]*" \/>/,
    (match) => `${match}\n    <meta property="twitter:image" content="${SITE}/og-image.png" />`
  );

  // Construct full semantic HTML content
  const pageMainContent = page.articleHtml || `
    <article style="max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem;">
      <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">${page.h1 ? escapeHtml(page.h1) : ''}</h1>
      <p style="font-size: 1.15rem; color: #64748b; line-height: 1.7; margin-bottom: 2rem;">${page.intro ? escapeHtml(page.intro) : ''}</p>
      ${
        page.faqs.length
          ? `<h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem; margin-bottom: 1rem;">Frequently asked questions</h2>${page.faqs
              .map((f) => `<h3 style="font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">${escapeHtml(f.q)}</h3><p style="color: #64748b; line-height: 1.7; margin-bottom: 1.5rem;">${escapeHtml(f.a)}</p>`)
              .join('')}`
          : ''
      }
    </article>
  `;

  const fullSemanticHtml = `
    <div class="tableview-static-shell" style="background: #f8fafc; color: #1e293b; min-height: 100vh; display: flex; flex-direction: column;">
      ${generateHeaderHtml()}
      <main style="flex: 1;">
        ${pageMainContent}
      </main>
      ${generateFooterHtml()}
    </div>
  `;

  // Inject into BOTH <div id="root"> and <noscript>
  // When JS is disabled or during bot crawls, the full rich content is immediately visible.
  // When React boots, createRoot overwrites #root with the interactive SPA cleanly.
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${fullSemanticHtml}</div>\n    <noscript>${fullSemanticHtml}</noscript>`
  );

  return html;
}

function writePage(outPath: string, html: string, written: Set<string>) {
  const normalised = path.normalize(outPath);
  if (written.has(normalised)) return;
  written.add(normalised);
  fs.mkdirSync(path.dirname(normalised), { recursive: true });
  fs.writeFileSync(normalised, html);
}

function priorityFor(canonical: string): { priority: string; changefreq: string } {
  if (canonical === '/') return { priority: '1.0', changefreq: 'daily' };
  if (canonical.startsWith('/guides')) return { priority: '0.85', changefreq: 'monthly' };
  if (['/about', '/contact', '/privacy', '/terms', '/disclaimer'].includes(canonical)) {
    return { priority: '0.5', changefreq: 'yearly' };
  }
  if (canonical.endsWith('-calculator')) return { priority: '0.95', changefreq: 'weekly' };
  return { priority: '0.90', changefreq: 'weekly' };
}

function writeSitemap(canonicals: string[]) {
  const unique = [...new Set(canonicals)].sort((a, b) => {
    const pa = Number(priorityFor(a).priority);
    const pb = Number(priorityFor(b).priority);
    return pb - pa || a.localeCompare(b);
  });

  const today = new Date().toISOString().slice(0, 10);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map((canonical) => {
    const { priority, changefreq } = priorityFor(canonical);
    return `  <url>
    <loc>${SITE}${canonical}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml);
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    for (const f of ['llms.txt', 'llms-full.txt', 'robots.txt']) {
      const src = path.join(publicDir, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(distDir, f));
      }
    }
  }
  console.log(`[prerender] sitemap.xml regenerated with ${unique.length} canonical URLs`);
}

function main() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found — run `vite build` first.');
  }
  let template = fs.readFileSync(templatePath, 'utf8');

  const assetsDir = path.join(distDir, 'assets');
  const interFont = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir).find((f) => f.startsWith('inter-latin-var-') && f.endsWith('.woff2'))
    : undefined;

  if (interFont) {
    template = template.replace(
      '<link rel="stylesheet"',
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${interFont}" />\n    <link rel="stylesheet"`
    );
  }

  const targets = listPrerenderTargets();
  const written = new Set<string>();

  const titleByCanonical = new Map<string, string>();
  const duplicates: string[] = [];

  for (const { url, canonical } of targets) {
    const page = resolvePage(url, canonical);
    const html = renderHtml(template, page);

    if (url === '/') {
      writePage(templatePath, html, written);
    } else {
      writePage(path.join(distDir, url, 'index.html'), html, written);
      writePage(path.join(distDir, `${url}.html`), html, written);
    }

    const owner = titleByCanonical.get(page.title);
    if (owner && owner !== page.canonical) {
      duplicates.push(`${owner} and ${page.canonical} share the title "${page.title}"`);
    } else {
      titleByCanonical.set(page.title, page.canonical);
    }
  }

  writeSitemap(targets.map((t) => resolvePage(t.url, t.canonical).canonical));

  console.log(`[prerender] wrote ${written.size} files for ${targets.length} URLs`);
  if (duplicates.length) {
    console.warn(`[prerender] ${duplicates.length} duplicate <title> value(s):`);
    for (const d of duplicates) console.warn(`  - ${d}`);
  }
}

main();
