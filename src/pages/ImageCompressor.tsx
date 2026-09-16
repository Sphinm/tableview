import { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Download,
  Trash2,
  Sliders,
  CheckCircle2,
  FileArchive,
  Eye,
  X,
  Shield,
  Layers,
} from 'lucide-react';
import {
  compressSingleImage,
  createZipArchive,
  type CompressedImageItem,
  type ImageCompressOptions,
} from '../lib/imageCompressor';
import { formatBytes } from '../lib/ffmpeg';

export function ImageCompressor() {
  const [items, setItems] = useState<CompressedImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<'auto' | 'image/jpeg' | 'image/webp' | 'image/png'>('image/webp');
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  // Comparison modal state
  const [comparingItem, setComparingItem] = useState<CompressedImageItem | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process incoming files
  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const options: ImageCompressOptions = {
      quality: quality / 100,
      format,
      maxWidth,
    };

    const newItems: CompressedImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const item = await compressSingleImage(file, options);
        newItems.push(item);
      } catch (err) {
        console.error('Failed to compress image:', file.name, err);
      }
    }

    setItems((prev) => [...prev, ...newItems]);
    setIsProcessing(false);
  };

  // Re-compress existing items when settings change
  const recompressAll = async (newQuality: number, newFormat: typeof format, newMaxWidth?: number) => {
    if (items.length === 0) return;
    setIsProcessing(true);
    const options: ImageCompressOptions = {
      quality: newQuality / 100,
      format: newFormat,
      maxWidth: newMaxWidth,
    };

    const updated: CompressedImageItem[] = [];
    for (const item of items) {
      try {
        const recompressed = await compressSingleImage(item.file, options);
        updated.push(recompressed);
      } catch {
        updated.push(item);
      }
    }
    setItems(updated);
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    if (items.length === 0) return;
    const zipBlob = await createZipArchive(items);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_images_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (comparingItem?.id === id) setComparingItem(null);
  };

  const clearAll = () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
    setComparingItem(null);
  };

  // Calculate totals
  const totalOriginalBytes = items.reduce((acc, it) => acc + it.originalSize, 0);
  const totalCompressedBytes = items.reduce((acc, it) => acc + it.compressedSize, 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const totalSavedPct =
    totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) : 0;

  // Comparison slider dragging
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(pos, 0), 100));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast Client-Side Batch Engine • Zero Quality Compromise</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Free Online Image Compressor
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Batch compress JPG, PNG, and WebP images directly in your browser. Side-by-side visual comparison, dimension scaling, and 1-click ZIP export.
          </p>
        </div>

        {/* Global Control Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span>Compression Settings</span>
              {isProcessing && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold animate-pulse">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  Compressing...
                </span>
              )}
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={clearAll}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Quality Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Quality: {quality}%
                </label>
                <span className="text-slate-400 text-[11px]">
                  {quality >= 85 ? 'High Visual' : quality >= 65 ? 'Optimal Balance' : 'Max Compression'}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={quality}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setQuality(val);
                  recompressAll(val, format, maxWidth);
                }}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Convert Format
              </label>
              <select
                value={format}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setFormat(val);
                  recompressAll(quality, val, maxWidth);
                }}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="image/webp">WebP (Best Compression & Modern Web)</option>
                <option value="image/jpeg">JPEG (Universal Compatibility)</option>
                <option value="image/png">PNG (Lossless / Transparency)</option>
                <option value="auto">Original Format</option>
              </select>
            </div>

            {/* Max Width Resize */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Dimension (Resize)
              </label>
              <select
                value={maxWidth || 'none'}
                onChange={(e) => {
                  const val = e.target.value === 'none' ? undefined : parseInt(e.target.value);
                  setMaxWidth(val);
                  recompressAll(quality, format, val);
                }}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="none">Original Resolution</option>
                <option value="2560">2560px (2K QHD)</option>
                <option value="1920">1920px (Full HD)</option>
                <option value="1280">1280px (Standard HD)</option>
                <option value="800">800px (Blog & Web Thumbnails)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-all group shadow-sm"
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Drag & drop images here, or click to browse
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
            Batch compress multiple images simultaneously. Supports JPG, PNG, WebP, AVIF, and GIF.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Private • Processed locally in RAM</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFiles(e.target.files);
              }
            }}
          />
        </div>

        {/* Batch Items List */}
        {items.length > 0 && (
          <div className="space-y-4">
            {/* Total Summary Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {items.length} images compressed • Saved {totalSavedPct}% ({formatBytes(totalSavedBytes)})
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(totalOriginalBytes)} ➔ {formatBytes(totalCompressedBytes)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  + Add More Images
                </button>
                <button
                  onClick={handleDownloadAllZip}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </button>
              </div>
            </div>

            {/* Individual Item Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div>
                    {/* Image Preview Thumbnail */}
                    <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                      <img
                        src={item.compressedUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Saved Pill Overlay */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600/90 text-white text-[11px] font-bold rounded-md shadow-sm">
                        -{item.savedPercentage}%
                      </span>

                      {/* Before / After Preview Button */}
                      <button
                        onClick={() => setComparingItem(item)}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors text-xs flex items-center gap-1 font-semibold"
                        title="Compare Before & After"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Compare</span>
                      </button>
                    </div>

                    {/* Filename & Stats */}
                    <div className="space-y-1 mb-3">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{item.width}×{item.height}</span>
                        <span>
                          <span className="line-through mr-1">{formatBytes(item.originalSize)}</span>
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {formatBytes(item.compressedSize)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <a
                      href={item.compressedUrl}
                      download={item.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Split-Screen Comparison Modal */}
        {comparingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white text-sm font-bold truncate">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Before vs After: {comparingItem.name}</span>
                </div>
                <button
                  onClick={() => setComparingItem(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slider Viewport */}
              <div
                ref={sliderRef}
                onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e.clientX)}
                onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                className="relative flex-1 min-h-[380px] bg-slate-950 select-none overflow-hidden cursor-ew-resize flex items-center justify-center"
              >
                {/* Background: Compressed Image */}
                <img
                  src={comparingItem.compressedUrl}
                  alt="Compressed"
                  className="max-h-[65vh] w-auto max-w-full object-contain pointer-events-none"
                />
                <div className="absolute top-4 right-4 bg-emerald-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md pointer-events-none">
                  Compressed ({formatBytes(comparingItem.compressedSize)})
                </div>

                {/* Foreground: Original Image (Clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                  style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                >
                  <img
                    src={comparingItem.originalUrl}
                    alt="Original"
                    className="max-h-[65vh] w-auto max-w-full object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                    Original ({formatBytes(comparingItem.originalSize)})
                  </div>
                </div>

                {/* Vertical Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center text-xs font-bold -ml-3.5">
                    ↔
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Drag slider left/right to compare image fidelity</span>
                <span className="font-semibold text-emerald-400">
                  Savings: -{comparingItem.savedPercentage}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Batch ZIP Export</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag in dozens of high-res photos. Adjust quality globally or individually, then download everything packaged in a single ZIP file.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Visual Split Comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect compression artifacts with our real-time before/after curtain slider to ensure zero noticeable quality degradation.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">100% Client-Side Memory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your photos are processed purely using your GPU and browser canvas memory. Zero files are uploaded to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
