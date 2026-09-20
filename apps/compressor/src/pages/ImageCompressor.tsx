import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Download,
  Trash2,
  CheckCircle2,
  FileArchive,
  Eye,
  Shield,
  Layers,
  Play,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  compressSingleImage,
  createZipArchive,
  type CompressedImageItem,
  type ImageCompressOptions,
} from '../lib/imageCompressor';
import { formatBytes } from '../lib/ffmpeg';
import { updatePageMeta } from '../lib/router';
import { STATIC_PAGE_META } from '../data/routeMeta';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { analytics, trackEvent } from '../lib/analytics';

export function ImageCompressor() {
  useEffect(() => {
    const meta = STATIC_PAGE_META['/image-compressor'];
    if (meta) {
      updatePageMeta(meta.title, meta.description, meta.canonical);
    }
  }, []);

  const [items, setItems] = useState<CompressedImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  // Settings
  const [mode, setMode] = useState<'quality' | 'target_size'>('quality');
  const [quality, setQuality] = useState<number>(80);
  const [targetSizeKB, setTargetSizeKB] = useState<string>('200');
  const [format, setFormat] = useState<'auto' | 'image/jpeg' | 'image/webp' | 'image/png'>('image/webp');
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  // Split-screen comparison
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeItem = items[activeItemIndex] || items[0] || null;

  // Process incoming files
  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    trackEvent('image_batch_dropped', { count: files.length });
    const startTime = performance.now();

    const options: ImageCompressOptions = {
      quality: quality / 100,
      format,
      maxWidth,
      targetSizeBytes: mode === 'target_size' && targetSizeKB ? parseFloat(targetSizeKB) * 1024 : undefined,
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

    trackEvent('image_batch_completed', {
      count: newItems.length,
      duration_ms: Math.round(performance.now() - startTime),
    });
  };

  // Re-compress existing items when settings change
  const recompressAll = async (
    newQuality: number,
    newFormat: typeof format,
    newMaxWidth?: number,
    newTargetKB?: string,
    newMode: typeof mode = mode
  ) => {
    if (items.length === 0) return;
    setIsProcessing(true);
    const options: ImageCompressOptions = {
      quality: newQuality / 100,
      format: newFormat,
      maxWidth: newMaxWidth,
      targetSizeBytes: newMode === 'target_size' && newTargetKB ? parseFloat(newTargetKB) * 1024 : undefined,
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

  // 1-Click Try Sample Image
  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const res = await fetch('/samples/sample.jpg');
      if (!res.ok) throw new Error('Could not load sample image');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'sample-scenic-landscape.jpg', { type: 'image/jpeg' });
      await processFiles([sampleFile]);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    if (items.length === 0) return;
    analytics.exportClicked({ format: 'zip', rowCount: items.length });
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
    if (activeItemIndex >= items.length - 1) {
      setActiveItemIndex(Math.max(0, items.length - 2));
    }
  };

  const clearAll = () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
    setActiveItemIndex(0);
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

  const faqs = [
    {
      q: 'Why use WebP instead of JPEG or PNG?',
      a: 'WebP provides 25% to 35% smaller file sizes than JPEG at equivalent visual quality, while also supporting alpha transparency like PNG. It is supported by all modern browsers (Chrome, Safari, Edge, Firefox).',
    },
    {
      q: 'How does the Target File Size mode work for images?',
      a: 'When you specify a target size (such as 200 KB for government forms or Discord avatars), our algorithm performs an iterative search to identify the highest quality level that stays comfortably beneath your specified threshold.',
    },
    {
      q: 'Are my uploaded pictures stored anywhere?',
      a: 'No. All images are rendered and compressed using your browser\'s local HTML5 Canvas API and local memory. No files are ever sent across the network to any backend server.',
    },
    {
      q: 'Can I compress hundreds of photos at once?',
      a: 'Yes, you can drag and drop multiple images simultaneously. Once compressed, click "Download All as ZIP" to export all optimized pictures in a single archive.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="size-3.5 text-emerald-600" />
            <span>Fast Client-Side Batch Engine • Zero Quality Compromise • 100% Private</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Online Image Compressor
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
            Batch compress JPG, PNG, and WebP images directly in your browser. Side-by-side visual comparison, target size mode, and 1-click ZIP export.
          </p>
        </div>

        <SuiteSubNav suite="media" />

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/40">
          {/* Left Panel: Preview / Comparison & Batch View (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col min-h-[480px] rounded-2xl bg-slate-100/60 border border-slate-200/70 overflow-hidden relative">
            {items.length === 0 ? (
              // Empty / Dropzone State
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl m-3 bg-white/50 hover:bg-emerald-50/20 transition-all group"
              >
                <div className="size-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 transition-transform">
                  <Upload className="size-8" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  Drag & drop images here, or browse
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-sm">
                  Batch compress multiple images simultaneously. Supports JPG, PNG, WebP, AVIF, and GIF.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    Browse Images
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    disabled={isLoadingSample}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
                  >
                    {isLoadingSample ? (
                      <>
                        <span className="size-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading Sample...</span>
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5 fill-emerald-600 text-emerald-600" />
                        <span>Try Sample Image</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-600 font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">JPG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">PNG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">WebP</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">AVIF</span>
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
            ) : (
              // Active Items & Interactive Comparison
              <div className="flex-1 flex flex-col p-4 space-y-4">
                {/* Header status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Eye className="size-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {activeItem ? activeItem.name : 'Image Comparison'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                    >
                      + Add More
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200/80 text-xs font-semibold transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Split Comparison Slider */}
                {activeItem && (
                  <div
                    ref={sliderRef}
                    onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e.clientX)}
                    onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                    className="relative w-full h-64 sm:h-72 bg-slate-900 rounded-2xl select-none overflow-hidden cursor-ew-resize flex items-center justify-center border border-slate-200 shadow-inner group"
                  >
                    {/* Background: Compressed Image */}
                    <img
                      src={activeItem.compressedUrl}
                      alt="Compressed"
                      className="max-h-full w-auto max-w-full object-contain pointer-events-none"
                    />
                    <div className="absolute top-3 right-3 bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm pointer-events-none">
                      Compressed ({formatBytes(activeItem.compressedSize)})
                    </div>

                    {/* Foreground: Original Image (Clipped by slider position) */}
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                      style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                    >
                      <img
                        src={activeItem.originalUrl}
                        alt="Original"
                        className="max-h-full w-auto max-w-full object-contain"
                      />
                      <div className="absolute top-3 left-3 bg-slate-800/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        Original ({formatBytes(activeItem.originalSize)})
                      </div>
                    </div>

                    {/* Vertical Divider Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)] cursor-ew-resize flex items-center justify-center pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="size-6 rounded-full bg-white text-slate-900 shadow-md flex items-center justify-center text-[11px] font-bold -ml-3">
                        ↔
                      </div>
                    </div>

                    <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
                      <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                        Drag slider ↔ to compare quality
                      </span>
                    </div>
                  </div>
                )}

                {/* Batch Items List */}
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveItemIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        activeItemIndex === idx
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.compressedUrl}
                          alt={item.name}
                          className="size-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-600 flex items-center gap-1.5">
                            <span>{item.width}×{item.height}</span>
                            <span>•</span>
                            <span className="line-through">{formatBytes(item.originalSize)}</span>
                            <span className="text-emerald-700 font-bold">{formatBytes(item.compressedSize)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                          -{item.savedPercentage}%
                        </span>
                        <a
                          href={item.compressedUrl}
                          download={item.name}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="size-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Batch Total Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span className="font-bold text-emerald-950">
                      {items.length} images • Saved {totalSavedPct}% ({formatBytes(totalSavedBytes)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition-all active:scale-95"
                  >
                    <FileArchive className="size-3.5" />
                    <span>Download All (ZIP)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Controls & Settings (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Mode Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('quality');
                    recompressAll(quality, format, maxWidth, targetSizeKB, 'quality');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'quality'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quality Presets
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('target_size');
                    recompressAll(quality, format, maxWidth, targetSizeKB, 'target_size');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'target_size'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Target File Size
                </button>
              </div>

              {/* Mode 1: Quality */}
              {mode === 'quality' ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label className="font-bold text-slate-700">
                        Visual Quality: <strong className="text-emerald-700">{quality}%</strong>
                      </label>
                      <span className="text-slate-500 text-[11px]">
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
                        recompressAll(val, format, maxWidth, targetSizeKB, 'quality');
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* Quality chips */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { q: 90, label: 'High (90%)' },
                      { q: 80, label: 'Optimal (80%)' },
                      { q: 60, label: 'Max (60%)' },
                    ].map((item) => (
                      <button
                        key={item.q}
                        type="button"
                        onClick={() => {
                          setQuality(item.q);
                          recompressAll(item.q, format, maxWidth, targetSizeKB, 'quality');
                        }}
                        className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-all ${
                          quality === item.q
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Mode 2: Target File Size */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Target Max File Size
                    </label>
                    <div className="relative mb-3">
                      <input
                        type="number"
                        step="10"
                        min="10"
                        value={targetSizeKB}
                        onChange={(e) => {
                          setTargetSizeKB(e.target.value);
                          recompressAll(quality, format, maxWidth, e.target.value, 'target_size');
                        }}
                        placeholder="e.g. 200"
                        className="w-full pl-3.5 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                        KB
                      </span>
                    </div>

                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Quick Presets:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['50', '100', '200', '500'].map((kb) => (
                        <button
                          key={kb}
                          type="button"
                          onClick={() => {
                            setTargetSizeKB(kb);
                            recompressAll(quality, format, maxWidth, kb, 'target_size');
                          }}
                          className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-all ${
                            targetSizeKB === kb
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {kb} KB
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Format & Dimensions Controls */}
              <div className="space-y-4 pt-4 border-t border-slate-100 mt-4">
                {/* Output Format */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Convert Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => {
                      const val = e.target.value as typeof format;
                      setFormat(val);
                      recompressAll(quality, val, maxWidth, targetSizeKB, mode);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="image/webp">WebP (Best Compression & Modern Web)</option>
                    <option value="image/jpeg">JPEG / JPG (Universal Compatibility)</option>
                    <option value="image/png">PNG (Lossless / Alpha Transparency)</option>
                    <option value="auto">Original Format</option>
                  </select>
                </div>

                {/* Max Width Resize */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Max Dimension (Resize)
                  </label>
                  <select
                    value={maxWidth || 'none'}
                    onChange={(e) => {
                      const val = e.target.value === 'none' ? undefined : parseInt(e.target.value);
                      setMaxWidth(val);
                      recompressAll(quality, format, val, targetSizeKB, mode);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="none">Original Resolution</option>
                    <option value="2560">2560px (2K QHD)</option>
                    <option value="1920">1920px (Full HD)</option>
                    <option value="1280">1280px (Standard HD)</option>
                    <option value="800">800px (Blog & Web Thumbnails)</option>
                  </select>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Batch Engine:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-emerald-700">Client RAM</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700">0 KB Uploaded</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (items.length > 0) {
                    handleDownloadAllZip();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Compressing Images in RAM...</span>
                  </>
                ) : items.length > 0 ? (
                  <>
                    <FileArchive className="size-4" />
                    <span>Download All ({items.length}) as ZIP</span>
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    <span>Select Images to Compress</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="flex items-center gap-1">
                  <Shield className="size-3 text-emerald-600" />
                  <span>100% In-Browser Privacy</span>
                </span>
                <span>Free • No Watermarks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-2">
            <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Layers className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Batch ZIP Export</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drag in dozens of high-res photos. Adjust quality globally or individually, then download everything packaged in a single ZIP file.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-2">
            <div className="size-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Eye className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Visual Split Comparison</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect compression artifacts with our real-time before/after curtain slider to ensure zero noticeable quality degradation.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-2">
            <div className="size-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Shield className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">In-Browser Memory</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your photos are processed purely using your browser canvas memory. Zero files are uploaded to any server.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about our browser image compressor</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="size-4 text-emerald-500 shrink-0" />
                    {faq.q}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="size-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
