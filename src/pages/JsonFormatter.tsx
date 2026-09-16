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
import { updatePageMeta } from '../lib/router';
import { AdSlot } from '../components/AdSlot';
import { PageHeader } from '../components/calculator-kit';

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
      'Online JSON Formatter & Validator: 100% Private In-Browser Tool',
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
      <PageHeader
        breadcrumbs={[
          { label: 'Developer Tools', path: '/' },
          { label: 'JSON Formatter' }
        ]}
        badge={{
          icon: ShieldCheck,
          label: '100% Client-Side · Zero Server Telemetry',
          tone: 'emerald'
        }}
        title="Online JSON Formatter & Validator"
        description="Format, beautify, and validate JSON payloads instantly. All parsing runs 100% locally in your browser memory: safe for confidential tokens, database dumps, and internal API responses."
        actions={
          <>
            <button
              type="button"
              onClick={handleLoadSample}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={() => setInputJson('')}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-all shadow-2xs active:scale-95 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="size-3.5" />
              <span>Clear</span>
            </button>
          </>
        }
      />

      {/* Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleBeautify}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
          >
            <Maximize2 className="size-3.5" />
            <span>Beautify</span>
          </button>

          <button
            onClick={handleMinify}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Minimize2 className="size-3.5" />
            <span>Minify (One-Line)</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Indentation Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Indent:</span>
            <select
              value={indentOption}
              onChange={(e) => setIndentOption(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
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
            <span className="text-xs text-slate-400 font-mono px-2 py-0.5">Awaiting Input...</span>
          ) : parseResult.isValid ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="size-3.5" />
              <span>Valid JSON ({parseResult.stats?.lines} lines)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
              <AlertCircle className="size-3.5" />
              <span>Invalid Syntax</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="size-3.5" />
            <span>.json</span>
          </button>
        </div>
      </div>

      {/* Error Banner if invalid */}
      {!parseResult.isValid && parseResult.error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-start gap-3">
          <AlertCircle className="size-4.5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm mb-0.5 text-rose-900">JSON Parse Error</span>
            <span>{parseResult.error}</span>
          </div>
        </div>
      )}

      {/* Editor & Viewer Split Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Input Pane */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col h-[560px] shadow-2xs">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono font-medium">
            <span>Raw Input (Paste JSON)</span>
            <span>{inputJson.length} chars</span>
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Paste raw JSON here or drop file..."
            spellCheck={false}
            className="w-full flex-1 p-4 bg-transparent text-slate-800 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>

        {/* Formatted Output Pane */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col h-[560px] shadow-2xs">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono font-medium">
            <span>Formatted & Validated Output</span>
            {parseResult.stats && (
              <span>{(parseResult.stats.bytes / 1024).toFixed(1)} KB</span>
            )}
          </div>
          <pre className="w-full flex-1 p-4 bg-slate-50/50 text-slate-800 font-mono text-xs leading-relaxed overflow-auto select-text scrollbar-thin">
            {parseResult.formatted || <span className="text-slate-400">// Formatted output will render here...</span>}
          </pre>
        </div>
      </div>

      <AdSlot className="mt-8" />
    </div>
  );
};
