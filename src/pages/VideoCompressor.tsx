import { useState, useRef } from 'react';
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

export function VideoCompressor() {
  const { user, openAuthModal, consumeCredit } = useAuth();

  // State
  const [file, setFile] = useState<File | Blob | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Tabs & Options
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [presetPercentage, setPresetPercentage] = useState<number>(70);
  const [customTargetMB, setCustomTargetMB] = useState<string>('');
  const [resolution, setResolution] = useState<'original' | '1080p' | '720p' | '480p'>('original');
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle file selection
  const handleFile = async (selectedFile: File | Blob, name: string = 'video.mp4') => {
    setErrorMessage(null);
    setResult(null);
    setProgress(0);

    try {
      setStatusMessage('Analyzing video stream...');
      const meta = await getVideoMetadata(selectedFile, name);
      setMetadata(meta);
      setFile(selectedFile);

      if (videoUrl) URL.revokeObjectURL(videoUrl);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);

      // Default target size prefill
      const targetBytes = meta.size * 0.3; // 70% smaller default
      setCustomTargetMB((targetBytes / (1024 * 1024)).toFixed(1));
    } catch (err: any) {
      console.error('Error loading video:', err);
      setErrorMessage('Could not load video. Please ensure it is a valid MP4/WebM/MOV file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      handleFile(dropped, dropped.name);
    }
  };

  // Load sample video
  const handleLoadSample = async () => {
    try {
      setStatusMessage('Loading sample video...');
      const response = await fetch('/samples/sample.mp4');
      if (!response.ok) throw new Error('Sample not found');
      const blob = await response.blob();
      await handleFile(blob, 'sample_3mb.mp4');
    } catch {
      setErrorMessage('Failed to load sample video. Please drag and drop a video file.');
    }
  };

  // Run Compression
  const handleStartCompression = async () => {
    if (!file || !metadata) return;

    // Check credits
    if (user && user.credits <= 0) {
      openAuthModal();
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);
    setStatusMessage('Loading WebAssembly engine...');

    const options: CompressOptions = {
      mode: activeTab === 'basic' ? (customTargetMB ? 'target_size' : 'preset') : 'advanced',
      presetPercentage: activeTab === 'basic' ? presetPercentage : undefined,
      targetSizeBytes:
        activeTab === 'basic' && customTargetMB
          ? parseFloat(customTargetMB) * 1024 * 1024
          : undefined,
      resolution: activeTab === 'advanced' ? resolution : undefined,
      crf: activeTab === 'advanced' ? crf : undefined,
      speedPreset,
      muteAudio,
    };

    try {
      setStatusMessage('Compressing frames locally with WebAssembly...');
      const res = await compressVideo(file, metadata, options, (pct) => {
        setProgress(pct);
        if (pct < 20) setStatusMessage('Decoding video stream...');
        else if (pct < 85) setStatusMessage(`Compressing: ${pct}%`);
        else setStatusMessage('Packaging MP4 container...');
      });

      setResult(res);
      consumeCredit(1);
    } catch (err: any) {
      console.error('Compression failed:', err);
      setErrorMessage(
        err?.message || 'Compression failed. Try a smaller video or adjusting the settings.'
      );
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
          mode: activeTab === 'basic' ? (customTargetMB ? 'target_size' : 'preset') : 'advanced',
          presetPercentage,
          targetSizeBytes: customTargetMB ? parseFloat(customTargetMB) * 1024 * 1024 : undefined,
          resolution,
          crf,
          muteAudio,
        },
        metadata.duration
      )
    : 0;

  const estimatedSavedPct = metadata
    ? Math.max(1, Math.round(((metadata.size - estimatedBytes) / metadata.size) * 100))
    : 70;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% In-Browser Privacy • Zero Server Upload</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Free Online Video Compressor
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Fast client-side video compression without watermarks. Reduce MP4, WebM, MOV, and MKV file size with preset quality or exact target MB.
          </p>
        </div>

        {/* Dual-Panel Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {/* Left Panel: Preview & Upload Area (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col min-h-[460px] rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden relative">
            {!file ? (
              // Empty / Dropzone State
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl m-3 relative group"
              >
                {/* Try Sample Button in Top Right */}
                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleLoadSample}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    <Film className="w-3.5 h-3.5 text-blue-500" />
                    <span>Try Sample (3.02MB)</span>
                  </button>
                </div>

                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Drag and drop a video file to start
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
                  Or click to browse from your device. 100% private — your file never leaves your browser.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">MP4</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">WebM</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">MOV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">MKV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">AVI</span>
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
                    <Film className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {metadata?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {result && (
                      <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                        <button
                          onClick={() => setCompareTab('compressed')}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            compareTab === 'compressed'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-900 hover:bg-slate-300/60'
                          }`}
                        >
                          Compressed
                        </button>
                        <button
                          onClick={() => setCompareTab('original')}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            compareTab === 'original'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-900 hover:bg-slate-300/60'
                          }`}
                        >
                          Original
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleReset}
                      disabled={isProcessing}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Choose another video"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Video Player */}
                <div className="relative flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center min-h-[260px] shadow-inner">
                  <video
                    ref={videoRef}
                    src={compareTab === 'compressed' && result ? result.url : videoUrl || ''}
                    controls
                    playsInline
                    className="max-h-[360px] w-full object-contain"
                  />

                  {/* Processing Overlay with Progress Bar */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-4 animate-pulse">
                        <Zap className="w-7 h-7" />
                      </div>
                      <div className="text-xl font-bold text-slate-900 mb-1">{progress}%</div>
                      <div className="text-xs text-blue-600 font-medium mb-4">{statusMessage}</div>

                      {/* Progress bar */}
                      <div className="w-full max-w-xs h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${Math.max(progress, 5)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-3">
                        Running locally via WebAssembly. Do not close this tab.
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata & Result Pills */}
                {metadata && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span>
                        Size: <strong className="text-slate-800 dark:text-slate-200">{formatBytes(metadata.size)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Res: <strong className="text-slate-800 dark:text-slate-200">{metadata.width}×{metadata.height}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Duration: <strong className="text-slate-800 dark:text-slate-200">{Math.round(metadata.duration)}s</strong>
                      </span>
                    </div>

                    {result && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved {result.savedPercentage}% ({formatBytes(result.size)})</span>
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
              {/* Tab Switcher: Basic vs Advanced */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-5">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'basic'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Basic Compression
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'advanced'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Advanced Compression
                </button>
              </div>

              {/* Basic Tab Content */}
              {activeTab === 'basic' ? (
                <div className="space-y-5">
                  {/* Preset Cards */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                      Compression Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { pct: 90, label: '90% Smaller', desc: 'Max savings, 480p' },
                        { pct: 70, label: '70% Smaller', desc: 'Optimal, 720p HD' },
                        { pct: 50, label: '50% Smaller', desc: 'High visual quality' },
                        { pct: 30, label: '30% Smaller', desc: 'Near lossless' },
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
                            presetPercentage === item.pct && !customTargetMB
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {item.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target File Size Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Target File Size (Optional)
                      </label>
                      <span className="text-[11px] text-slate-400">e.g. 25MB for Discord</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        value={customTargetMB}
                        onChange={(e) => setCustomTargetMB(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full pl-3.5 pr-12 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                        MB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Advanced Tab Content */
                <div className="space-y-4">
                  {/* Resolution Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Resolution
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['original', '1080p', '720p', '480p'] as const).map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setResolution(res)}
                          className={`py-2 px-1 text-center text-xs font-semibold rounded-lg border transition-all ${
                            resolution === res
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
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
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Quality (CRF: {crf})
                      </label>
                      <span className="text-slate-400 text-[11px]">
                        {crf < 23 ? 'Ultra High' : crf <= 28 ? 'Balanced' : 'High Compression'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="35"
                      value={crf}
                      onChange={(e) => setCrf(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>18 (Near Lossless)</span>
                      <span>28 (Recommended)</span>
                      <span>35 (Smallest)</span>
                    </div>
                  </div>

                  {/* Encoding Speed Preset */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Encoding Speed
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['veryfast', 'faster', 'ultrafast'] as const).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSpeedPreset(preset)}
                          className={`py-1.5 px-1 text-center text-xs font-semibold rounded-lg border capitalize transition-all ${
                            speedPreset === preset
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Mute Option */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={muteAudio}
                        onChange={(e) => setMuteAudio(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          {muteAudio ? <VolumeX className="w-3.5 h-3.5 text-amber-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>Mute Audio Track</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Remove audio track to save ~15% extra storage space
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Real-time Output File Size Estimate */}
              <div className="mt-5 p-3.5 bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Estimated Output Size:
                  </span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-900 dark:text-white">
                      {metadata ? formatBytes(estimatedBytes) : '—'}
                    </span>
                    {metadata && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        (-{estimatedSavedPct}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
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
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Compressing ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Start Compression</span>
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={result.url}
                  download={`compressed_${metadata?.name || 'video.mp4'}`}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed Video ({formatBytes(result.size)})</span>
                </a>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span>Private client-side processing</span>
                </span>
                <span>Free • No watermark</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">100% In-Browser Privacy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unlike cloud services that require uploading gigabytes of private footage, your video is encoded entirely inside your browser's WebAssembly sandbox.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Custom Target File Size</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need to send a video through Discord (25MB limit) or email (20MB limit)? Enter your target MB and our engine auto-calculates the exact bitrate.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Zero Watermark Guaranteed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export pristine, crystal-clear MP4 videos with zero forced branding, intros, or watermarks. Always clean and ready for sharing.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about video compression on TableView.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Are my videos uploaded to any server?</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                No. We use FFmpeg compiled to WebAssembly. The compression happens locally in your device's memory. No video data ever touches an external server.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">How do I compress a video for Discord?</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Discord imposes a 25MB attachment limit for non-Nitro users. Simply type "25" in the Target File Size box, and the video will be resized to fit.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Which formats can I compress?</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                You can upload MP4, MOV, WebM, MKV, AVI, and WMV files. Output is exported as universally compatible H.264 MP4 with AAC audio.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Does it cost money to compress videos?</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                It is free to use with no watermark. Registered members receive 30 free monthly credits to process longer high-resolution videos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
