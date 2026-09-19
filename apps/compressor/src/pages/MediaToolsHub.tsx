import { useEffect } from 'react';
import {
  Video,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Sliders,
  FileArchive,
  Film
} from 'lucide-react';
import { PageHeader } from '../components/calculator-kit/PageHeader';
import { AdSlot } from '../components/AdSlot';
import { navigateTo, updatePageMeta } from '../lib/router';
import { STATIC_PAGE_META } from '../data/routeMeta';

export const MediaToolsHub = () => {
  useEffect(() => {
    const meta = STATIC_PAGE_META['/media-tools'];
    if (meta) {
      updatePageMeta(meta.title, meta.description, meta.canonical);
    }
  }, []);

  const formatShortcuts = [
    {
      title: 'Compress MP4 Video',
      badge: 'Fast H.264',
      path: '/compress-mp4',
      desc: 'Shrink MP4 video file size up to 90% without watermarks.'
    },
    {
      title: 'Compress Video for Discord',
      badge: '<= 25 MB Limit',
      path: '/compress-video-for-discord',
      desc: 'Automatically hit Discord free upload limits with exact bitrate math.'
    },
    {
      title: 'Compress PNG (Alpha)',
      badge: 'Lossless & Lossy',
      path: '/compress-png',
      desc: 'Keep crisp transparent backgrounds while reducing PNG weight by 70%.'
    },
    {
      title: 'Compress JPG / JPEG',
      badge: 'Batch Photos',
      path: '/compress-jpg',
      desc: 'Adjust quality and dimensions on high-resolution camera photos.'
    },
    {
      title: 'Compress & Convert to WebP',
      badge: 'Next-Gen Web',
      path: '/compress-webp',
      desc: 'Modern web image format yielding 25%-35% smaller file sizes than JPEG.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        badge={{
          icon: Sparkles,
          label: 'Client-Side WebAssembly & Codecs · In-Browser',
          tone: 'indigo'
        }}
        title="Media Compression Studio"
        description="High-performance video and image compression running entirely inside your browser. Zero server uploads, zero quality compromise, and no watermarks."
      />

      {/* Main Dual Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Video Compressor */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Video className="size-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                <Zap className="size-3" />
                FFmpeg Wasm
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Online Video Compressor
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Compress massive MP4, WebM, MOV, and MKV video files directly on your machine. Adjust CRF quality presets or set an exact target MB for Discord and email.
              </p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <Sliders className="size-3.5 text-indigo-600 shrink-0" />
                <span>Target MB Mode: hit exact file size limits (25MB, 10MB, etc.)</span>
              </div>
              <div className="flex items-center gap-2">
                <Film className="size-3.5 text-indigo-600 shrink-0" />
                <span>1080p, 720p, and 480p resolution downscaling</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                <span>100% In-Browser Privacy: No files leave your device</span>
              </div>
            </div>

            {/* Supported format tags */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              {['MP4', 'WebM', 'MOV', 'MKV', 'AVI'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigateTo('/video-compressor')}
              className="w-full py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>Launch Video Compressor</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Image Compressor */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <ImageIcon className="size-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                <Zap className="size-3" />
                Batch Engine
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Batch Image Compressor
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Batch compress dozens of JPEG, PNG, and WebP photos concurrently in browser RAM with real-time before/after curtain slider comparison and ZIP download.
              </p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <FileArchive className="size-3.5 text-emerald-600 shrink-0" />
                <span>Batch Processing with 1-Click ZIP Archive Packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Sliders className="size-3.5 text-emerald-600 shrink-0" />
                <span>Interactive Split Comparison Slider to audit quality</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                <span>Lossless PNG Alpha Transparency + WebP/AVIF Export</span>
              </div>
            </div>

            {/* Supported format tags */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              {['JPG', 'PNG', 'WebP', 'AVIF'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigateTo('/image-compressor')}
              className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>Launch Image Compressor</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ad slot */}
      <div className="max-w-4xl mx-auto my-4">
        <AdSlot unit="workbenchLeaderboard" format="horizontal" />
      </div>

      {/* Specialized Single-Format Shortcuts Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Dedicated Single-Format Compression Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formatShortcuts.map((item) => (
            <div
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col justify-between gap-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform gap-1">
                <span>Open Tool</span>
                <ArrowRight className="size-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Guarantee Block */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Zero Server Egress Guarantee</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Every video and image remains in your device RAM. Processing uses local WebAssembly without uploading files to remote servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
