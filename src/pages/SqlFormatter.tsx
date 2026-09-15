import { useState, useMemo, useEffect } from 'react';
import { format as formatSql } from 'sql-formatter';
import {
  Terminal,
  Copy,
  Check,
  Play,
  Trash2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { updatePageMeta, navigateTo } from '../lib/router';
import { AdSlot } from '../components/AdSlot';
import { PageHeader } from '../components/calculator-kit';

const sqlFormatterSchemas = [
  {
    '@type': 'WebApplication',
    name: 'Free Online SQL Formatter & Minifier (Multi-Dialect)',
    url: 'https://tableview.dev/sql-formatter',
    description: 'Format, beautify, indent, and minify SQL queries in DuckDB, PostgreSQL, MySQL, BigQuery, Snowflake, and SQLite. 100% private in-browser tool with zero server logging.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }
];

const sampleSql = `with user_orders as (
select u.id as user_id, u.email, count(o.id) as order_count, sum(o.total_usd) as lifetime_spend, row_number() over (partition by u.region order by sum(o.total_usd) desc) as region_rank
from users u left join orders o on u.id = o.user_id
where o.status in ('COMPLETED', 'SHIPPED') and o.created_at >= '2024-01-01'
group by u.id, u.email, u.region
)
select * from user_orders where region_rank <= 5 order by lifetime_spend desc limit 50;`;

export const SqlFormatter = () => {
  useEffect(() => {
    updatePageMeta(
      'Online SQL Formatter & Minifier: Multi-Dialect Query Beautifier',
      'Format, indent, and minify SQL queries online for DuckDB, PostgreSQL, MySQL, Snowflake, and BigQuery. Free in-browser tool with zero tracking.',
      '/sql-formatter',
      sqlFormatterSchemas
    );
  }, []);

  const [inputSql, setInputSql] = useState<string>(sampleSql);
  const [dialect, setDialect] = useState<string>('postgresql');
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower'>('upper');
  const [indentOption, setIndentOption] = useState<'2' | '4' | 'tab'>('2');
  const [copied, setCopied] = useState<boolean>(false);

  // Formatted SQL
  const formattedSql = useMemo(() => {
    if (!inputSql.trim()) return '';

    try {
      return formatSql(inputSql, {
        language: dialect as any,
        keywordCase,
        tabWidth: indentOption === '4' ? 4 : 2,
        useTabs: indentOption === 'tab'
      });
    } catch {
      return inputSql;
    }
  }, [inputSql, dialect, keywordCase, indentOption]);

  const handleMinify = () => {
    const minified = inputSql
      .replace(/\s+/g, ' ')
      .replace(/\s*([,()=<>+*-])\s*/g, '$1')
      .trim();
    setInputSql(minified);
  };

  const handleBeautify = () => {
    setInputSql(formattedSql);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSql || inputSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunInWorkbench = () => {
    navigateTo('/sql-workbench');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Breadcrumb */}
      <PageHeader
        breadcrumbs={[
          { label: 'Developer Tools', path: '/' },
          { label: 'SQL Formatter' }
        ]}
        badge={{
          icon: Terminal,
          label: 'Multi-Dialect SQL Beautifier & Minifier',
          tone: 'cyan'
        }}
        title="Online SQL Formatter"
        description="Format, indent, and clean complex SQL queries across DuckDB, PostgreSQL, MySQL, BigQuery, and Snowflake. 100% private in-browser processing."
        actions={
          <>
            <button
              type="button"
              onClick={() => setInputSql(sampleSql)}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={() => setInputSql('')}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700/80 transition-all shadow-sm active:scale-95 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="size-3.5" />
              <span>Clear</span>
            </button>
          </>
        }
      />

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

          {/* Dialect Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Dialect:</span>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="postgresql">PostgreSQL / DuckDB</option>
              <option value="mysql">MySQL / MariaDB</option>
              <option value="bigquery">Google BigQuery</option>
              <option value="snowflake">Snowflake</option>
              <option value="sqlite">SQLite</option>
              <option value="sql">Standard ANSI SQL</option>
            </select>
          </div>

          {/* Keyword Casing */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Keywords:</span>
            <select
              value={keywordCase}
              onChange={(e) => setKeywordCase(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
            </select>
          </div>

          {/* Indent Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Indent:</span>
            <select
              value={indentOption}
              onChange={(e) => setIndentOption(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunInWorkbench}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Execute query over local Parquet, CSV, or Excel files"
          >
            <Play className="size-3.5 fill-current" />
            <span>Run in SQL Workbench</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Formatted Split Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Input Pane */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col h-[560px]">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Raw SQL Query</span>
            <span>{inputSql.length} chars</span>
          </div>
          <textarea
            value={inputSql}
            onChange={(e) => setInputSql(e.target.value)}
            placeholder="Paste raw SQL query here..."
            spellCheck={false}
            className="w-full flex-1 p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        {/* Formatted Output Pane */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col h-[560px]">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Formatted SQL ({dialect.toUpperCase()})</span>
            <span>{formattedSql.split('\n').length} lines</span>
          </div>
          <pre className="w-full flex-1 p-4 bg-slate-950/60 text-cyan-300 font-mono text-xs leading-relaxed overflow-auto select-text scrollbar-thin">
            {formattedSql || <span className="text-slate-600">// Formatted SQL will appear here...</span>}
          </pre>
        </div>
      </div>

      <AdSlot className="mt-8" />
    </div>
  );
};
