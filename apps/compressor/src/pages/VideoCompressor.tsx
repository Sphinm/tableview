import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Zap,
  VolumeX,
  Volume2,
  Shield,
  Film,
  Play,
  HelpCircle,
  Clock,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getVideoMetadata,
  compressVideo,
  estimateOutputSize,
  formatBytes,
  type VideoMetadata,
  type CompressOptions,
  type CompressResult,
} from '../lib/ffmpeg';
import { useAuth } from '../lib/useAuth';
import { updatePageMeta } from '../lib/router';
import { STATIC_PAGE_META } from '../data/routeMeta';
import { SuiteSubNav } from '../components/SuiteSubNav';
import { InfoTooltip } from '../components/InfoTooltip';
import { analytics, trackEvent } from '../lib/analytics';

export function VideoCompressor() {
  const { consumeCredit } = useAuth();

  useEffect(() => {
    const meta = STATIC_PAGE_META['/video-compressor'];
    if (meta) {
      updatePageMeta(meta.title, meta.description, meta.canonical);
    }
  }, []);

  // Video and file state
  const [file, setFile] = useState<File | Blob | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  // Compression Modes & Options
  const [activeTab, setActiveTab] = useState<'smart' | 'target_size' | 'advanced'>('smart');
  const [presetPercentage, setPresetPercentage] = useState<number>(70);
  const [customTargetMB, setCustomTargetMB] = useState<string>('15');
  const [resolution, setResolution] = useState<'original' | '1080p' | '720p' | '480p' | '360p'>('original');
  const [crf, setCrf] = useState<number>(28);
  const [speedPreset, setSpeedPreset] = useState<'veryfast' | 'faster' | 'ultrafast'>('veryfast');
  const [muteAudio, setMuteAudio] = useState<boolean>(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [result, setResult] = useState<CompressResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Comparison view
  const [compareTab, setCompareTab] = useState<'compressed' | 'original'>('compressed');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle file selection
  const handleFile = async (selectedFile: File | Blob, name: string = 'video.mp4') => {
    setErrorMessage(null);
    setResult(null);
    setProgress(0);

    try {
      setStatusMessage('Analyzing video stream...');
      analytics.fileDropped({ name, size: selectedFile.size });
      const meta = await getVideoMetadata(selectedFile, name);
      setMetadata(meta);
      setFile(selectedFile);

      if (videoUrl) URL.revokeObjectURL(videoUrl);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);

      // Default target size prefill based on file size
      const targetBytes = meta.size * 0.3; // 70% reduction
      setCustomTargetMB((targetBytes / (1024 * 1024)).toFixed(1));
    } catch (err: unknown) {
      console.error('Error loading video:', err);
      setErrorMessage('Could not load video. Please ensure it is a valid MP4, WebM, MOV, or MKV file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      handleFile(dropped, dropped.name);
    }
  };

  // Try sample video with 1-click
  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    setErrorMessage(null);
    try {
      setStatusMessage('Loading sample video...');
      const res = await fetch('/samples/sample.mp4');
      if (!res.ok) throw new Error('Sample file could not be loaded');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'sample-nature-clip.mp4', { type: 'video/mp4' });
      await handleFile(sampleFile, sampleFile.name);
    } catch (err: unknown) {
      console.error('Failed to load sample video:', err);
      setErrorMessage('Could not load sample video. Please upload your own video file.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Run Compression
  const handleStartCompression = async () => {
    if (!file || !metadata) return;

    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);
    setStatusMessage('Initializing WebAssembly video core...');

    const options: CompressOptions = {
      mode: activeTab === 'target_size' ? 'target_size' : activeTab === 'smart' ? 'preset' : 'advanced',
      presetPercentage: activeTab === 'smart' ? presetPercentage : undefined,
      targetSizeBytes:
        activeTab === 'target_size' && customTargetMB
          ? parseFloat(customTargetMB) * 1024 * 1024
          : undefined,
      resolution: activeTab === 'advanced' ? (resolution === '360p' ? '480p' : resolution) : undefined,
      crf: activeTab === 'advanced' ? crf : undefined,
      speedPreset,
      muteAudio,
    };

    const compressStart = performance.now();
    trackEvent('video_compress_started', {
      mode: activeTab,
      resolution: resolution || 'auto',
    });

    try {
      setStatusMessage('Compressing frames locally with WebAssembly...');
      const res = await compressVideo(file, metadata, options, (pct) => {
        setProgress(pct);
        if (pct < 15) setStatusMessage('Step 1/3: Decoding video stream...');
        else if (pct < 85) setStatusMessage(`Step 2/3: Encoding frames (${pct}%)...`);
        else setStatusMessage('Step 3/3: Packaging MP4 container...');
      });

      trackEvent('video_compress_completed', {
        duration_ms: Math.round(performance.now() - compressStart),
        savings_pct: res.savedPercentage,
      });

      setResult(res);
      setCompareTab('compressed');
      consumeCredit(1);
    } catch (err: unknown) {
      console.error('Compression failed:', err);
      const msg = err instanceof Error ? err.message : 'Compression failed. Try choosing 720p or adjusting the settings.';
      trackEvent('video_compress_failed', {
        reason: msg.slice(0, 80),
      });
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setMetadata(null);
    setResult(null);
    setProgress(0);
    setErrorMessage(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
  };

  // Calculate dynamic estimated size
  const estimatedBytes = metadata
    ? estimateOutputSize(
        metadata.size,
        {
          mode: activeTab === 'target_size' ? 'target_size' : activeTab === 'smart' ? 'preset' : 'advanced',
          presetPercentage,
          targetSizeBytes: customTargetMB ? parseFloat(customTargetMB) * 1024 * 1024 : undefined,
          resolution: resolution === '360p' ? '480p' : resolution,
          crf,
          muteAudio,
        },
        metadata.duration
      )
    : 0;

  const estimatedSavedPct = metadata
    ? Math.max(1, Math.round(((metadata.size - estimatedBytes) / metadata.size) * 100))
    : 70;

  const quickDiscordTargets = [
    { label: 'Discord (8MB)', mb: 8 },
    { label: 'Discord (25MB)', mb: 25 },
    { label: 'Nitro (50MB)', mb: 50 },
    { label: 'Email (10MB)', mb: 10 },
    { label: 'Email (20MB)', mb: 20 },
    { label: 'WhatsApp (16MB)', mb: 16 },
  ];

  const faqs = [
    {
      q: 'How does client-side video compression work?',
      a: 'This tool runs the full FFmpeg H.264 engine compiled to WebAssembly directly inside your browser. All decoding, downscaling, and encoding happen purely in your device RAM and CPU without uploading a single byte to an external server.',
    },
    {
      q: 'How do I compress a video to fit under Discord upload limits?',
      a: 'Select the "Target File Size" mode and click the "Discord (25MB)" or "Discord (8MB)" button. Our algorithm automatically calculates the exact video and audio bitrates based on duration so the exported file complies with Discord limits.',
    },
    {
      q: 'Are my videos kept private?',
      a: 'Yes, 100%. Because processing is 100% client-side WebAssembly, your video never touches our servers. You can even disconnect your internet after the page loads and the compressor will still work seamlessly.',
    },
    {
      q: 'Which video formats are supported?',
      a: 'We support all major video containers including MP4, MOV (iPhone/QuickTime), WebM, MKV, AVI, and FLV. Compressed files are packaged into universal MP4 (H.264 + AAC) with faststart flags for instant web playback.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>100% In-Browser Privacy • WebAssembly FFmpeg • Zero Uploads</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Online Video Compressor
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
            Shrink MP4, WebM, MOV, and MKV video files directly on your computer. Hit exact file sizes for Discord, email, and web sharing with zero watermarks.
          </p>
        </div>

        <SuiteSubNav suite="media" />

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/40">
          {/* Left Panel: Preview & Player Area (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col min-h-[480px] rounded-2xl bg-slate-100/60 border border-slate-200/70 overflow-hidden relative">
            {!file ? (
              // Empty / Dropzone State
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl m-3 bg-white/50 hover:bg-indigo-50/20 transition-all group"
              >
                <div className="size-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 transition-transform">
                  <Upload className="size-8" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  Drag and drop a video file to compress
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-sm">
                  Or choose a file from your device. 100% private — your video stays on your computer.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    Browse Video Files
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    disabled={isLoadingSample}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
                  >
                    {isLoadingSample ? (
                      <>
                        <span className="size-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading Sample...</span>
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5 fill-indigo-600 text-indigo-600" />
                        <span>Try Sample Video</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Format Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">MP4</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">WebM</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">MOV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">MKV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/70">AVI</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,.mkv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      handleFile(f, f.name);
                    }
                  }}
                />
              </div>
            ) : (
              // Active Video Player / Comparison State
              <div className="flex-1 flex flex-col p-4">
                {/* Top status bar above player */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Film className="size-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate" title={metadata?.name}>
                      {metadata?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {result && (
                      <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setCompareTab('compressed')}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            compareTab === 'compressed'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          Compressed
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompareTab('original')}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            compareTab === 'original'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          Original
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/80 text-xs font-semibold transition-colors"
                      title="Choose another video"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Change</span>
                    </button>
                  </div>
                </div>

                {/* Video Player Container */}
                <div className="relative flex-1 bg-black/90 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center min-h-[280px] max-h-[380px] shadow-inner">
                  <video
                    ref={videoRef}
                    key={compareTab === 'compressed' && result ? result.url : videoUrl || 'empty'}
                    src={compareTab === 'compressed' && result ? result.url : videoUrl || ''}
                    controls
                    playsInline
                    className="max-h-[360px] w-full object-contain"
                  />

                  {/* Processing Overlay with Live Multi-Step Indicator */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                      <div className="size-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4 shadow-sm animate-pulse">
                        <Zap className="size-7" />
                      </div>
                      <div className="text-2xl font-black text-slate-900 mb-1">{progress}%</div>
                      <div className="text-xs font-semibold text-indigo-700 mb-4">{statusMessage}</div>

                      {/* Progress bar */}
                      <div className="w-full max-w-xs h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${Math.max(progress, 5)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-3 font-medium">
                        Encoding locally via WebAssembly. Zero data leaves your device.
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata & Result Pills */}
                {metadata && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <div className="flex flex-wrap items-center gap-2.5 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Film className="size-3 text-slate-400" />
                        <strong className="text-slate-800">{formatBytes(metadata.size)}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="size-3 text-slate-400" />
                        <strong className="text-slate-800">{metadata.width}×{metadata.height}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-slate-400" />
                        <strong className="text-slate-800">{Math.round(metadata.duration)}s</strong>
                      </span>
                    </div>

                    {result && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-bold">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Saved {result.savedPercentage}% ({formatBytes(metadata.size)} ➔ {formatBytes(result.size)})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Controls & Options (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Tab Switcher: Smart Auto, Target Size, Advanced */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('smart')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'smart'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Smart Auto
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('target_size')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'target_size'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Target Size
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('advanced')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'advanced'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Custom CRF
                </button>
              </div>

              {/* Mode 1: Smart Auto */}
              {activeTab === 'smart' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Compression Reduction Level
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { pct: 85, label: '85% Smaller', desc: 'Maximum compression' },
                        { pct: 70, label: '70% Smaller', desc: 'Optimal (Recommended)' },
                        { pct: 50, label: '50% Smaller', desc: 'High visual fidelity' },
                        { pct: 30, label: '30% Smaller', desc: 'Near lossless trim' },
                      ].map((item) => (
                        <button
                          key={item.pct}
                          type="button"
                          onClick={() => {
                            setPresetPercentage(item.pct);
                            if (metadata) {
                              const ratio = (100 - item.pct) / 100;
                              setCustomTargetMB(((metadata.size * ratio) / (1024 * 1024)).toFixed(1));
                            }
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            presetPercentage === item.pct
                              ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-500 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: Target File Size */}
              {activeTab === 'target_size' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Target File Size Limit
                    </label>
                    <div className="relative mb-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        value={customTargetMB}
                        onChange={(e) => setCustomTargetMB(e.target.value)}
                        placeholder="e.g. 25"
                        className="w-full pl-3.5 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                        MB
                      </span>
                    </div>

                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Quick Presets:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {quickDiscordTargets.map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setCustomTargetMB(t.mb.toString())}
                          className={`px-2 py-1.5 text-center text-xs font-medium rounded-lg border transition-all ${
                            customTargetMB === t.mb.toString()
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 3: Advanced / Resolution & CRF */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  {/* Resolution Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Output Resolution
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['original', '1080p', '720p', '480p'] as const).map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setResolution(res)}
                          className={`py-2 px-1 text-center text-xs font-semibold rounded-lg border transition-all ${
                            resolution === res
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {res === 'original' ? 'Original' : res}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CRF Quality Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <div className="flex items-center gap-1">
                        <label className="font-bold text-slate-700">
                          CRF Quality: <strong className="text-indigo-600">{crf}</strong>
                        </label>
                        <InfoTooltip
                          title="Constant Rate Factor (CRF)"
                          content="Controls visual quality vs file size. Lower values (18-22) retain near-lossless detail; higher values (28-35) drastically reduce file size."
                        />
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {crf < 23 ? 'Ultra High Quality' : crf <= 28 ? 'Balanced' : 'High Compression'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="35"
                      value={crf}
                      onChange={(e) => setCrf(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>18 (Near Lossless)</span>
                      <span>28 (Balanced)</span>
                      <span>35 (Smallest)</span>
                    </div>
                  </div>

                  {/* Encoding Speed Preset */}
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Encoding Speed Preset
                      </label>
                      <InfoTooltip
                        title="Encoding Speed vs Compression"
                        content="Controls CPU encoding effort. 'ultrafast' completes in seconds in your browser; 'veryfast' produces smaller file sizes at identical quality."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['veryfast', 'faster', 'ultrafast'] as const).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSpeedPreset(preset)}
                          className={`py-1.5 px-1 text-center text-xs font-semibold rounded-lg border capitalize transition-all ${
                            speedPreset === preset
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Mute Option */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={muteAudio}
                        onChange={(e) => setMuteAudio(e.target.checked)}
                        className="size-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {muteAudio ? <VolumeX className="size-3.5 text-amber-500" /> : <Volume2 className="size-3.5 text-indigo-600" />}
                          <span>Mute / Remove Audio Track</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Saves up to 15%-25% additional space for silent or gameplay clips
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Dynamic Estimated Output Box */}
              <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Estimated Output:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-900">
                      {metadata ? formatBytes(estimatedBytes) : '—'}
                    </span>
                    {metadata && (
                      <span className="text-emerald-600">
                        (-{estimatedSavedPct}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {!result ? (
                <button
                  type="button"
                  onClick={handleStartCompression}
                  disabled={!file || isProcessing}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Compressing Video ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="size-4 fill-white" />
                      <span>Compress Video</span>
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={result.url}
                  download={`compressed_${metadata?.name || 'video.mp4'}`}
                  onClick={() => analytics.exportClicked({ format: 'mp4', rowCount: 1 })}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Download className="size-4" />
                  <span>Download Compressed Video ({formatBytes(result.size)})</span>
                </a>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
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
            <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Shield className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">In-Browser Privacy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Never upload your private videos to a remote server. FFmpeg compiles to WebAssembly and processes everything in your browser RAM.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-2">
            <div className="size-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Sliders className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Exact Target Size</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Target Discord 25MB limits, email 10MB caps, or custom file sizes with intelligent bitrate mathematical calculation.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-2">
            <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Zero Watermarks & Free</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export clean, pristine MP4 videos without stamps, logos, or arbitrary file size limits.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about our browser video compressor</p>
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
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="size-4 text-indigo-500 shrink-0" />
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
