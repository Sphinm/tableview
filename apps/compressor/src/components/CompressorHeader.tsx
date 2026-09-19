import React from 'react';
import { Video, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { navigateTo } from '../lib/router';

interface CompressorHeaderProps {
  currentPath: string;
}

export function CompressorHeader({ currentPath }: CompressorHeaderProps) {
  const isImageActive =
    currentPath === '/image-compressor' ||
    currentPath.startsWith('/compress-png') ||
    currentPath.startsWith('/compress-jpg') ||
    currentPath.startsWith('/compress-webp') ||
    currentPath.startsWith('/compress-image');

  const isVideoActive = !isImageActive;

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-100 tracking-tight text-base">TableView</span>
                <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Media
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">100% In-Browser Media Compressor</p>
            </div>
          </button>
        </div>

        {/* Central Pill Tabs for Video / Image */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 shadow-inner">
          <button
            onClick={() => navigateTo('/video-compressor')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isVideoActive
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Compressor</span>
          </button>

          <button
            onClick={() => navigateTo('/image-compressor')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isImageActive
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Compressor</span>
          </button>
        </div>

        {/* Right Info Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Server Uploads</span>
          </div>

          <a
            href="https://tableview.dev"
            className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors hidden lg:inline-block"
          >
            Financial Suite →
          </a>
        </div>
      </div>
    </header>
  );
}
