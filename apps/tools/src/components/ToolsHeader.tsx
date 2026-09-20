import React, { useState, useRef, useEffect } from 'react';
import {
  Database,
  ChevronDown,
  FileSpreadsheet,
  Cpu,
  Coins,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { navigateTo } from '../lib/router';

interface ToolsHeaderProps {
  currentPath: string;
}

export function ToolsHeader({ currentPath }: ToolsHeaderProps) {
  const [convertersOpen, setConvertersOpen] = useState(false);
  const [finopsOpen, setFinopsOpen] = useState(false);
  const convertersRef = useRef<HTMLDivElement>(null);
  const finopsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (convertersRef.current && !convertersRef.current.contains(target)) {
        setConvertersOpen(false);
      }
      if (finopsRef.current && !finopsRef.current.contains(target)) {
        setFinopsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-100 tracking-tight text-base">TableView</span>
                <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Data Tools
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">Parquet Viewer & DuckDB SQL Workbench</p>
            </div>
          </button>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-neutral-300">
            <button
              onClick={() => navigateTo('/parquet-viewer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentPath === '/parquet-viewer' || currentPath === '/'
                  ? 'bg-neutral-800 text-cyan-400 font-semibold'
                  : 'hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              Parquet Viewer & SQL
            </button>

            {/* Converters Dropdown */}
            <div className="relative" ref={convertersRef}>
              <button
                onClick={() => setConvertersOpen(!convertersOpen)}
                aria-expanded={convertersOpen}
                aria-haspopup="true"
                aria-controls="converters-menu"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  convertersOpen || currentPath.includes('converter') || currentPath.includes('to-')
                    ? 'bg-neutral-800 text-cyan-400'
                    : 'hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <span>Format Converters</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {convertersOpen && (
                <div id="converters-menu" className="absolute left-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => { navigateTo('/data-converter'); setConvertersOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <span>All Converters Hub</span>
                  </button>
                  <button
                    onClick={() => { navigateTo('/parquet-to-excel'); setConvertersOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Parquet to Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => { navigateTo('/csv-to-parquet'); setConvertersOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    <span>CSV to Parquet</span>
                  </button>
                  <button
                    onClick={() => { navigateTo('/parquet-schema-inspector'); setConvertersOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Schema Inspector</span>
                  </button>
                </div>
              )}
            </div>

            {/* FinOps Dropdown */}
            <div className="relative" ref={finopsRef}>
              <button
                onClick={() => setFinopsOpen(!finopsOpen)}
                aria-expanded={finopsOpen}
                aria-haspopup="true"
                aria-controls="finops-menu"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  finopsOpen || currentPath.includes('calculator')
                    ? 'bg-neutral-800 text-cyan-400'
                    : 'hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <span>Cloud FinOps</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {finopsOpen && (
                <div id="finops-menu" className="absolute left-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => { navigateTo('/parquet-storage-calculator'); setFinopsOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>S3 Storage & Scan Savings</span>
                  </button>
                  <button
                    onClick={() => { navigateTo('/snowflake-cost-calculator'); setFinopsOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <span>Snowflake Warehouse Optimizer</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigateTo('/sql-formatter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentPath === '/sql-formatter' || currentPath === '/json-formatter'
                  ? 'bg-neutral-800 text-cyan-400 font-semibold'
                  : 'hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              SQL / JSON Formatter
            </button>
          </nav>
        </div>

        {/* Right Info & Cross-Domain Link */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DuckDB-Wasm Client CPU</span>
          </div>

          <a
            href="https://tableview.dev"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors border border-neutral-700"
          >
            <span>Financial Suite (Pro)</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
