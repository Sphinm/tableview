/**
 * Single source of truth for per-route <title>, <meta name="description"> and
 * canonical URL.
 *
 * Scope: media compression routes owned by compress.tableview.dev only.
 * Finance calculators and data tools live in apps/finance and apps/tools.
 */
export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
}

export const HOME_META: PageMeta = {
  title: 'TableView Media Compression Studio — In-Browser Video & Image Compressor',
  description:
    'Compress MP4, WebM, PNG, and JPG 100% in your browser with WebAssembly FFmpeg and Canvas. Zero uploads, no watermarks.',
  canonical: '/',
};

/** Meta for the informational / legal pages. */
export const STATIC_PAGE_META: Record<string, PageMeta> = {
  '/media-tools': {
    title: 'Media Compression Studio: Video & Images | TableView',
    description:
      'Compress videos and batch optimize images 100% in your browser. Wasm-powered MP4, WebM, PNG, and JPG compression with zero server uploads and no watermarks.',
    canonical: '/media-tools',
  },
  '/video-compressor': {
    title: 'Free Online Video Compressor (No Watermark) | TableView',
    description:
      'Fast online video compressor with zero server upload. Reduce MP4, MOV, WebM, and MKV file size with preset quality or exact target MB. 100% private in-browser.',
    canonical: '/video-compressor',
  },
  '/image-compressor': {
    title: 'Batch Online Image Compressor: JPG, PNG, WebP | TableView',
    description:
      'Batch compress images online without quality loss. Supports JPEG, PNG, and WebP with before/after visual comparison and 1-click ZIP packaging.',
    canonical: '/image-compressor',
  },
  '/compress-mp4': {
    title: 'Compress MP4 Video Online Free (No Watermark) | TableView',
    description:
      'Free online MP4 compressor. Shrink MP4 video file size up to 90% in your browser with WebAssembly FFmpeg. Zero uploads, zero watermarks, and custom target MB.',
    canonical: '/compress-mp4',
  },
  '/compress-video-for-discord': {
    title: 'Compress Video for Discord (Under 25MB) | TableView',
    description:
      'Compress video for Discord free online. Easily reduce video size below Discord\'s 25MB or 50MB file size limit with high visual quality and no watermarks.',
    canonical: '/compress-video-for-discord',
  },
  '/compress-png': {
    title: 'Compress PNG Online Free: Lossless & Alpha | TableView',
    description:
      'Compress PNG images online with full transparency support. Reduce PNG file size by up to 70% in your browser tab without uploading photos to external servers.',
    canonical: '/compress-png',
  },
  '/compress-jpg': {
    title: 'Compress JPG & JPEG Images Online Free | TableView',
    description:
      'Compress JPG and JPEG photos online for free. Adjust compression quality, resize dimensions, and batch download optimized images as a ZIP file.',
    canonical: '/compress-jpg',
  },
  '/compress-webp': {
    title: 'Compress WebP Images Online Free & Fast | TableView',
    description:
      'Compress and optimize WebP images directly in your browser. Reduce file size while preserving high visual fidelity and alpha transparency. 100% private.',
    canonical: '/compress-webp',
  },
  '/about': {
    title: 'About TableView.dev: In-Browser Media Compression',
    description: 'Learn about TableView.dev and our 100% client-side compression architecture.',
    canonical: '/about',
  },
  '/contact': {
    title: 'Contact & Feedback | TableView.dev',
    description: 'Contact the TableView engineering team.',
    canonical: '/contact',
  },
  '/privacy': {
    title: 'Privacy Policy | TableView.dev',
    description: 'TableView privacy policy: 100% local processing with zero server file storage.',
    canonical: '/privacy',
  },
  '/terms': {
    title: 'Terms of Service | TableView.dev',
    description: 'TableView terms of service.',
    canonical: '/terms',
  },
  '/disclaimer': {
    title: 'Disclaimer & Disclosure | TableView.dev',
    description:
      'Legal disclaimers and terms of informational use for TableView.dev.',
    canonical: '/disclaimer',
  },
};
