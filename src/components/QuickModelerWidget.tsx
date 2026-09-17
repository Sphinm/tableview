import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Home,
  ArrowRight,
  Zap,
  Percent,
  Video,
  Image as ImageIcon,
  Database,
  ChevronDown,
  Check,
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { CodeEditor } from './CodeEditor';

export const QuickModelerWidget = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'mortgage' | 'sql'>('video');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const PLAYGROUND_OPTIONS = [
    {
      id: 'video' as const,
      label: 'Video Compress',
      icon: Video,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      desc: 'Wasm H.264 video compression',
    },
    {
      id: 'image' as const,
      label: 'Image Compress',
      icon: ImageIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      desc: 'Canvas batch image optimizer',
    },
    {
      id: 'mortgage' as const,
      label: 'Mortgage Math',
      icon: Home,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      desc: 'Amortization & PMI calculator',
    },
    {
      id: 'sql' as const,
      label: 'DuckDB SQL',
      icon: Database,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      desc: 'In-browser analytical SQL engine',
    },
  ];

  const currentOption = PLAYGROUND_OPTIONS.find((opt) => opt.id === activeTab) || PLAYGROUND_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  // --- Tab 1: Video Compressor Simulation State ---
  const [videoSourceSize, setVideoSourceSize] = useState<number>(120); // in MB
  const [videoPreset, setVideoPreset] = useState<'discord' | 'email' | 'web' | 'balanced'>('balanced');
  const [videoCodec, setVideoCodec] = useState<'h264' | 'webm'>('h264');

  const videoMetrics = useMemo(() => {
    let ratio = 0.22; // default ~78% reduction
    let targetLabel = 'High Quality 1080p (CRF 23)';
    let bitrate = '1,800 kbps';
    let ssim = '98.5%';

    if (videoPreset === 'discord') {
      ratio = Math.min(0.065, 8 / videoSourceSize);
      targetLabel = 'Discord Upload Limit (<= 8 MB)';
      bitrate = '750 kbps';
      ssim = '95.2%';
    } else if (videoPreset === 'email') {
      ratio = Math.min(0.20, 25 / videoSourceSize);
      targetLabel = 'Email Attachment (<= 25 MB)';
      bitrate = '1,200 kbps';
      ssim = '97.1%';
    } else if (videoPreset === 'web') {
      ratio = 0.15;
      targetLabel = 'Web Fast Streaming (720p CRF 28)';
      bitrate = '1,000 kbps';
      ssim = '96.4%';
    }

    const outputSize = Math.max(1.2, videoSourceSize * ratio);
    const savingsPercent = Math.max(5, Math.round((1 - outputSize / videoSourceSize) * 100));
    const estimatedTime = (videoSourceSize * 0.035).toFixed(1);

    return {
      outputSize,
      savingsPercent,
      targetLabel,
      bitrate,
      ssim,
      estimatedTime
    };
  }, [videoSourceSize, videoPreset]);

  // --- Tab 2: Image Compressor Simulation State ---
  const [imageQuality, setImageQuality] = useState<number>(80);
  const [imageFormat, setImageFormat] = useState<'webp' | 'avif' | 'jpeg'>('webp');
  const [imageBatchCount, setImageBatchCount] = useState<number>(1);

  const imageMetrics = useMemo(() => {
    const singleSourceSize = 4.8; // 4.8 MB high-res photo
    let factor = 0.15;

    if (imageFormat === 'webp') {
      factor = 0.08 + (imageQuality / 100) * 0.12; // ~15% - 20%
    } else if (imageFormat === 'avif') {
      factor = 0.05 + (imageQuality / 100) * 0.10; // ~10% - 15%
    } else {
      factor = 0.18 + (imageQuality / 100) * 0.22; // ~30% - 40%
    }

    const singleOutput = singleSourceSize * factor;
    const totalSource = singleSourceSize * imageBatchCount;
    const totalOutput = singleOutput * imageBatchCount;
    const savingsPercent = Math.round((1 - totalOutput / totalSource) * 100);

    return {
      singleSourceSize,
      singleOutput,
      totalSource,
      totalOutput,
      savingsPercent
    };
  }, [imageQuality, imageFormat, imageBatchCount]);

  // --- Tab 3: Mortgage Inputs ---
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPercent, setDownPercent] = useState<number>(20);
  const [mortgageRate, setMortgageRate] = useState<number>(6.75);
  const [mortgageTermYears, setMortgageTermYears] = useState<number>(30);

  const mortgageMath = useMemo(() => {
    const downAmount = (homePrice * downPercent) / 100;
    const loanAmount = Math.max(0, homePrice - downAmount);
    const monthlyRate = mortgageRate / 100 / 12;
    const totalMonths = mortgageTermYears * 12;

    let monthlyPI = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      monthlyPI =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else if (loanAmount > 0 && totalMonths > 0) {
      monthlyPI = loanAmount / totalMonths;
    }

    const totalPaid = monthlyPI * totalMonths;
    const totalInterest = Math.max(0, totalPaid - loanAmount);

    return {
      loanAmount,
      downAmount,
      monthlyPI,
      totalInterest,
      totalPaid
    };
  }, [homePrice, downPercent, mortgageRate, mortgageTermYears]);

  // --- Tab 4: SQL & Analytics Queries ---
  const [selectedSqlIndex, setSelectedSqlIndex] = useState<number>(0);
  const sqlQueries = [
    {
      title: 'Top 5 Customers by Revenue',
      query: `SELECT customer_name, SUM(total_amount) AS revenue\nFROM parquet_scan('orders.parquet')\nGROUP BY 1 ORDER BY 2 DESC LIMIT 5;`,
      time: '2.1 ms',
      rows: [
        { col1: 'Acme Corp', col2: '$84,200.00' },
        { col1: 'Starlight Media', col2: '$62,150.00' },
        { col1: 'Nexus Dynamics', col2: '$49,820.00' },
        { col1: 'HyperScale AI', col2: '$38,900.00' },
        { col1: 'Beacon Health', col2: '$31,450.00' }
      ]
    },
    {
      title: 'Monthly Volume Aggregation',
      query: `SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS total_events\nFROM parquet_scan('telemetry.parquet')\nGROUP BY 1 ORDER BY 1 DESC;`,
      time: '1.8 ms',
      rows: [
        { col1: '2026-03-01', col2: '1,420,890 events' },
        { col1: '2026-02-01', col2: '1,289,340 events' },
        { col1: '2026-01-01', col2: '1,154,200 events' },
        { col1: '2025-12-01', col2: '980,100 events' },
        { col1: '2025-11-01', col2: '895,430 events' }
      ]
    }
  ];

  const fmtCurrency = (val: number, decimals = 0) =>
    val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      {/* Outer Card Container with double-bezel styling */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-md p-5 sm:p-7 md:p-8 transition-all">
        {/* Header Bar: Title + Tab Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 mb-2">
              <Zap className="size-3 text-indigo-600" />
              <span>Interactive Flagship Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live In-Browser Interactive Playground
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Test compression ratios, run DuckDB SQL queries, or compute mortgage amortizations directly in your browser.
            </p>
          </div>

          {/* Dropdown Menu for Playground Categories */}
          <div ref={dropdownRef} className="relative self-start md:self-auto min-w-[200px] sm:min-w-[220px]">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs transition-all cursor-pointer text-slate-800"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`size-6 rounded-md ${currentOption.bg} flex items-center justify-center shrink-0`}>
                  <CurrentIcon className={`size-3.5 ${currentOption.color}`} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {currentOption.label}
                </span>
              </div>
              <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Interactive Tool
                </div>
                {PLAYGROUND_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = activeTab === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(opt.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-50/60 text-indigo-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`size-7 rounded-lg ${opt.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`size-4 ${opt.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="size-4 text-indigo-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Body Grid: Inputs on Left, Output KPIs on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6">
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* TAB 1: Video Compressor */}
            {activeTab === 'video' && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="font-bold text-slate-900">Source Video Size</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {videoSourceSize} MB
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={600}
                    step={10}
                    value={videoSourceSize}
                    onChange={(e) => setVideoSourceSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 font-medium mt-1">
                    <span>20 MB (Short clip)</span>
                    <span>250 MB</span>
                    <span>600 MB (4K recording)</span>
                  </div>
                </div>

                {/* Target Preset Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    Target Compression Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'balanced', label: 'Balanced 1080p', desc: 'CRF 23 · Lossless look' },
                      { id: 'discord', label: 'Discord (<= 8 MB)', desc: 'Fit free limit' },
                      { id: 'email', label: 'Email (<= 25 MB)', desc: 'Gmail / Outlook ready' },
                      { id: 'web', label: 'Fast Web Stream', desc: '720p lightweight' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setVideoPreset(item.id as any)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          videoPreset === item.id
                            ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Codec Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Output Codec Format
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'h264', label: 'MP4 (H.264 / AAC)', badge: 'Universal' },
                      { id: 'webm', label: 'WebM (VP9 / Opus)', badge: 'Web Optimized' }
                    ].map((codec) => (
                      <button
                        key={codec.id}
                        type="button"
                        onClick={() => setVideoCodec(codec.id as any)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                          videoCodec === codec.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{codec.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          videoCodec === codec.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {codec.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Image Compressor */}
            {activeTab === 'image' && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="font-bold text-slate-900">Compression Quality</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {imageQuality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={imageQuality}
                    onChange={(e) => setImageQuality(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 font-medium mt-1">
                    <span>10% (Maximum compression)</span>
                    <span>80% (Sweet spot)</span>
                    <span>100% (Lossless)</span>
                  </div>
                </div>

                {/* Target Format */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Target Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'webp', label: 'WebP', badge: 'Popular -85%' },
                      { id: 'avif', label: 'AVIF', badge: 'Next-Gen -90%' },
                      { id: 'jpeg', label: 'JPEG', badge: 'Standard -60%' }
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setImageFormat(fmt.id as any)}
                        className={`py-2 px-3 rounded-xl text-center border transition-all cursor-pointer ${
                          imageFormat === fmt.id
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{fmt.label}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{fmt.badge}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Batch Count Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Simulate Batch Size
                  </label>
                  <div className="flex gap-2">
                    {[
                      { count: 1, label: 'Single Photo' },
                      { count: 5, label: 'Batch 5 Photos' },
                      { count: 20, label: 'Batch 20 Photos' }
                    ].map((b) => (
                      <button
                        key={b.count}
                        type="button"
                        onClick={() => setImageBatchCount(b.count)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                          imageBatchCount === b.count
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: Mortgage Math */}
            {activeTab === 'mortgage' && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="font-bold text-slate-900">Property Purchase Price</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {fmtCurrency(homePrice)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={2000000}
                    step={10000}
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 font-medium mt-1">
                    <span>$100k</span>
                    <span>$1.0M</span>
                    <span>$2.0M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="font-bold text-slate-900">Down Payment ({downPercent}%)</span>
                    <span className="font-mono text-slate-700 font-semibold text-xs">
                      {fmtCurrency(mortgageMath.downAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[10, 15, 20, 25, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDownPercent(pct)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                          downPercent === pct
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 font-bold shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Interest Rate (APR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={0.125}
                        min={2.0}
                        max={15.0}
                        value={mortgageRate}
                        onChange={(e) => setMortgageRate(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                      />
                      <Percent className="size-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Loan Term
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[15, 30].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setMortgageTermYears(term)}
                          className={`py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                            mortgageTermYears === term
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 font-bold shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {term} Yrs
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 4: DuckDB SQL */}
            {activeTab === 'sql' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Select Sample Query
                  </label>
                  <div className="flex gap-2 mb-3">
                    {sqlQueries.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSqlIndex(idx)}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer truncate ${
                          selectedSqlIndex === idx
                            ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {q.title}
                      </button>
                    ))}
                  </div>

                  {/* Code Editor Box */}
                  <div className="rounded-xl overflow-hidden shadow-2xs border border-slate-200">
                    <CodeEditor
                      language="sql"
                      value={sqlQueries[selectedSqlIndex].query}
                      readOnly={true}
                      showLineNumbers={false}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1.5">
                    <span>Engine: DuckDB-Wasm (SIMD)</span>
                    <span className="text-emerald-600 font-bold">Execution: ~{sqlQueries[selectedSqlIndex].time}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Live Output KPI Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6 shadow-2xs">
            {/* Output KPI for Video */}
            {activeTab === 'video' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                    Estimated Compression
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Wasm Multithreaded
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {videoMetrics.outputSize.toFixed(1)} MB
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    -{videoMetrics.savingsPercent}% Space Saved
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4 font-medium">
                  {videoMetrics.targetLabel}
                </p>

                {/* Breakdown Matrix */}
                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Original File:</span>
                    <span className="font-mono font-semibold text-slate-900">{videoSourceSize} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Estimated Process Time:</span>
                    <span className="font-mono font-semibold text-blue-600">~{videoMetrics.estimatedTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Visual Quality Score:</span>
                    <span className="font-mono font-semibold text-emerald-600">{videoMetrics.ssim} SSIM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Server Uploads:</span>
                    <span className="font-mono font-semibold text-slate-900">0 Bytes (100% Local)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Output KPI for Image */}
            {activeTab === 'image' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                    Image Output Size
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    WebCodecs + Canvas
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {imageMetrics.totalOutput < 1
                      ? `${(imageMetrics.totalOutput * 1024).toFixed(0)} KB`
                      : `${imageMetrics.totalOutput.toFixed(2)} MB`}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    -{imageMetrics.savingsPercent}% Saved
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4 font-medium">
                  Optimized to {imageFormat.toUpperCase()} at {imageQuality}% quality
                </p>

                {/* Breakdown Matrix */}
                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Original Total:</span>
                    <span className="font-mono font-semibold text-slate-900">{imageMetrics.totalSource.toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Files Processed:</span>
                    <span className="font-mono font-semibold text-slate-900">{imageBatchCount} image{imageBatchCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Speed:</span>
                    <span className="font-mono font-semibold text-emerald-600">Instant (&lt; 0.2s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Privacy:</span>
                    <span className="font-mono font-semibold text-slate-900">Zero Server Storage</span>
                  </div>
                </div>
              </div>
            )}

            {/* Output KPI for Mortgage */}
            {activeTab === 'mortgage' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                    Estimated Monthly P&I
                  </span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    {mortgageTermYears}Y Fixed @ {mortgageRate}%
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight mb-4">
                  {fmtCurrency(mortgageMath.monthlyPI, 2)}
                  <span className="text-xs text-slate-600 font-sans font-medium ml-1.5">/ month</span>
                </div>

                {/* Breakdown Matrix */}
                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Total Loan Amount:</span>
                    <span className="font-mono font-semibold text-slate-900">{fmtCurrency(mortgageMath.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Lifetime Interest:</span>
                    <span className="font-mono font-semibold text-indigo-700">{fmtCurrency(mortgageMath.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Total Cost of Loan:</span>
                    <span className="font-mono font-semibold text-slate-900">{fmtCurrency(mortgageMath.totalPaid)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Output KPI for SQL */}
            {activeTab === 'sql' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                    Live Query Result
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    DuckDB-Wasm
                  </span>
                </div>

                {/* Mini Result Table */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs mb-4">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase">
                      <tr>
                        <th className="px-3 py-1.5 font-semibold">Column A</th>
                        <th className="px-3 py-1.5 font-semibold text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {sqlQueries[selectedSqlIndex].rows.slice(0, 4).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/60">
                          <td className="px-3 py-1.5 text-slate-800 font-medium">{row.col1}</td>
                          <td className="px-3 py-1.5 text-right font-bold text-slate-900">{row.col2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Scan Rate:</span>
                    <span className="font-mono font-semibold text-emerald-600">1.2M rows / sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cloud Data Ingestion:</span>
                    <span className="font-mono font-semibold text-slate-900">0 KB (Zero cloud egress)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action CTA Button */}
            <div className="pt-5 mt-4 border-t border-slate-200">
              {activeTab === 'video' && (
                <button
                  type="button"
                  onClick={() => navigateTo('/video-compressor')}
                  className="group w-full h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Video className="size-4 text-blue-200" />
                    <span>Open Video Compressor (Wasm)</span>
                  </span>
                  <span className="size-6 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-3" />
                  </span>
                </button>
              )}

              {activeTab === 'image' && (
                <button
                  type="button"
                  onClick={() => navigateTo('/image-compressor')}
                  className="group w-full h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="size-4 text-emerald-200" />
                    <span>Open Image Compressor (Batch Mode)</span>
                  </span>
                  <span className="size-6 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-3" />
                  </span>
                </button>
              )}

              {activeTab === 'mortgage' && (
                <button
                  type="button"
                  onClick={() => navigateTo('/mortgage-calculator')}
                  className="group w-full h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                >
                  <span>Open Full Amortization in Mortgage Calculator</span>
                  <span className="size-6 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-3" />
                  </span>
                </button>
              )}

              {activeTab === 'sql' && (
                <button
                  type="button"
                  onClick={() => navigateTo('/data-tools')}
                  className="group w-full h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Database className="size-4 text-purple-200" />
                    <span>Open Full Data Tools Workbench</span>
                  </span>
                  <span className="size-6 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-3" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
