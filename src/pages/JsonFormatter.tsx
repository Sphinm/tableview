import { useState, useMemo, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { updatePageMeta, navigateTo } from '../lib/router';
import { AdSlot } from '../components/AdSlot';

const jsonFormatterSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Free Online JSON Formatter & Validator (100% Client-Side Private)',
    url: 'https://tableview.dev/json-formatter',
    description: 'Fast, 100% private in-browser JSON formatter, validator, and minifier. Zero server uploads. Safe for confidential API keys, JWT tokens, and internal database logs.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }
];

const sampleJson = {
  service: "tableview-gateway",
  version: "1.4.0",
  cluster: "us-east-1",
  active: true,
  connections: 12450,
  features: ["duckdb-wasm", "columnar-projection", "client-side-privacy"],
  config: {
    maxMemoryMB: 2048,
    simdAccelerated: true,
    telemetry: false,
    rateLimit: {
      enabled: true,
      requestsPerMinute: 600
    }
  },
  maintainers: [
    { name: "Core Engineering", email: "dev@tableview.dev", role: "admin" }
  ]
};

export const JsonFormatter = () => {
  useEffect(() => {
    updatePageMeta(
      'Online JSON Formatter & Validator — 100% Private In-Browser Tool',
      'Format, beautify, validate, and minify JSON data directly in your browser. Zero server uploads guarantee security for confidential enterprise payloads and API responses.',
      '/json-formatter',
      jsonFormatterSchemas
    );
  }, []);

  const [inputJson, setInputJson] = useState<string>(JSON.stringify(sampleJson, null, 2));
  const [indentOption, setIndentOption] = useState<'2' | '4' | 'tab'>('2');
  const [copied, setCopied] = useState<boolean>(false);

  // Parse & Validate
  const parseResult = useMemo(() => {
    if (!inputJson.trim()) {
      return { isValid: true, isEmpty: true, error: null, formatted: '', stats: null };
    }

    try {
      const parsed = JSON.parse(inputJson);
      const indent = indentOption === '2' ? 2 : indentOption === '4' ? 4 : '\t';
      const formatted = JSON.stringify(parsed, null, indent);
      
      const byteSize = new Blob([inputJson]).size;
      const keyCount = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 1;

      return {
        isValid: true,
        isEmpty: false,
        error: null,
        formatted,
        parsed,
        stats: {
          bytes: byteSize,
          keys: keyCount,
          lines: formatted.split('\n').length
        }
      };
    } catch (err: any) {
      return {
        isValid: false,
        isEmpty: false,
        error: err.message || 'Invalid JSON syntax',
        formatted: inputJson,
        stats: null
      };
    }
  }, [inputJson, indentOption]);

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
    } catch {
      // Keep as is
    }
  };

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const indent = indentOption === '2' ? 2 : indentOption === '4' ? 4 : '\t';
      setInputJson(JSON.stringify(parsed, null, indent));
    } catch {
      // Keep as is
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(parseResult.formatted || inputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([parseResult.formatted || inputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setInputJson(JSON.stringify(sampleJson, null, 2));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
          <button onClick={() => navigateTo('/')} className="hover:text-indigo-400 transition-colors cursor-pointer">Home</button>
          <span>/</span>
          <button onClick={() => navigateTo('/')} className="hover:text-indigo-400 transition-colors cursor-pointer">Developer Tools</button>
          <span>/</span>
          <span className="text-slate-200">JSON Formatter</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
              <ShieldCheck className="size-3.5" />
              <span>100% Client-Side · Zero Server Telemetry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Online JSON Formatter & Validator
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Format, beautify, and validate JSON payloads instantly. All parsing runs 100% locally in your browser memory—safe for confidential tokens, database dumps, and internal API responses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            >
              Load Sample
            </button>
            <button
              onClick={() => setInputJson('')}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleBeautify}
            className="btn-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Maximize2 className="size-3.5" />
            <span>Beautify</span>
          </button>

          <button
            onClick={handleMinify}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Minimize2 className="size-3.5" />
            <span>Minify (One-Line)</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Indentation Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Indent:</span>
            <select
              value={indentOption}
              onChange={(e) => setIndentOption(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          {parseResult.isEmpty ? (
            <span className="text-xs text-slate-500 font-mono px-2 py-0.5">Awaiting Input...</span>
          ) : parseResult.isValid ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="size-3.5" />
              <span>Valid JSON ({parseResult.stats?.lines} lines)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-lg">
              <AlertCircle className="size-3.5" />
              <span>Invalid Syntax</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="size-3.5" />
            <span>.json</span>
          </button>
        </div>
      </div>

      {/* Error Banner if invalid */}
      {!parseResult.isValid && parseResult.error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-start gap-3">
          <AlertCircle className="size-4.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm mb-0.5 text-rose-300">JSON Parse Error</span>
            <span>{parseResult.error}</span>
          </div>
        </div>
      )}

      {/* Editor & Viewer Split Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Input Pane */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col h-[560px]">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Raw Input (Paste JSON)</span>
            <span>{inputJson.length} chars</span>
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Paste raw JSON here or drop file..."
            spellCheck={false}
            className="w-full flex-1 p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>

        {/* Formatted Output Pane */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col h-[560px]">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Formatted & Validated Output</span>
            {parseResult.stats && (
              <span>{(parseResult.stats.bytes / 1024).toFixed(1)} KB</span>
            )}
          </div>
          <pre className="w-full flex-1 p-4 bg-slate-950/60 text-indigo-300 font-mono text-xs leading-relaxed overflow-auto select-text scrollbar-thin">
            {parseResult.formatted || <span className="text-slate-600">// Formatted output will render here...</span>}
          </pre>
        </div>
      </div>

      <AdSlot className="mt-8" />
    </div>
  );
};
