import { useState, useEffect, useMemo, useCallback, useRef, type FormEvent } from 'react';
import {
  FileSpreadsheet,
  FileText,
  FileCode,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Terminal,
  Database,
  AlertCircle,
  Play,
  Copy,
  Check,
  TableProperties,
  Sparkles,
  SlidersHorizontal,
  Download
} from 'lucide-react';
import {
  type ColumnSchema,
  type ColumnSummary,
  queryTable,
  runCustomSql,
  exportToCsv,
  exportToExcel,
  exportToJson,
  exportToParquet,
  summarizeTable
} from '../lib/duckdb';

interface DataViewProps {
  tableName: string;
  fileType: 'parquet' | 'csv' | 'json';
  onReset: () => void;
}

export const DataView = ({ tableName, fileType, onReset }: DataViewProps) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'schema' | 'sql'>('grid');
  const [columns, setColumns] = useState<ColumnSchema[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [executionTime, setExecutionTime] = useState<number>(0);

  // Density mode
  const [density, setDensity] = useState<'compact' | 'normal'>('normal');

  // Virtual scrolling refs & state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const columnsRef = useRef<ColumnSchema[]>(columns);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // Copy feedback toast
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  // Schema & Profiling state
  const [summaries, setSummaries] = useState<ColumnSummary[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(false);
  const [ddlCopied, setDdlCopied] = useState<boolean>(false);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(50);

  // Sorting & Filtering
  const [sortCol, setSortCol] = useState<string | undefined>(undefined);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // SQL Console state
  const defaultSql = useMemo(() => {
    let scanExpr = `'${tableName}'`;
    if (fileType === 'parquet') scanExpr = `parquet_scan('${tableName}')`;
    else if (fileType === 'csv') scanExpr = `read_csv_auto('${tableName}')`;
    else if (fileType === 'json') scanExpr = `read_json_auto('${tableName}')`;
    return `SELECT * FROM ${scanExpr} LIMIT 100;`;
  }, [tableName, fileType]);

  const [customSql, setCustomSql] = useState<string>(defaultSql);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Loading & Exporting state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [parquetCodec, setParquetCodec] = useState<'ZSTD' | 'SNAPPY' | 'UNCOMPRESSED'>('ZSTD');
  const [showParquetModal, setShowParquetModal] = useState<boolean>(false);

  // Load initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setSqlError(null);
    try {
      let filterExpr: string | undefined = undefined;
      const currentCols = columnsRef.current;
      if (searchFilter.trim() && currentCols.length > 0) {
        const textCols = currentCols.filter(c => c.type.includes('VARCHAR') || c.type.includes('STRING') || c.type.includes('TEXT'));
        if (textCols.length > 0) {
          filterExpr = textCols
            .map(c => `lower(cast("${c.name}" as varchar)) LIKE '%${searchFilter.toLowerCase().replace(/'/g, "''")}%'`)
            .join(' OR ');
        }
      }

      const res = await queryTable(tableName, fileType, page, pageSize, filterExpr, sortCol, sortAsc);
      setColumns(res.columns);
      setRows(res.rows);
      setTotalRows(res.totalRows);
      setExecutionTime(res.executionTimeMs);
    } catch (err: any) {
      console.error('Query error:', err);
      setSqlError(err.message || 'Error executing query');
    } finally {
      setIsLoading(false);
    }
  }, [tableName, fileType, page, pageSize, searchFilter, sortCol, sortAsc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset scroll on page or sorting changes
  useEffect(() => {
    setScrollTop(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [page, pageSize, sortCol, sortAsc]);

  // Load schema summary when tab is switched to 'schema'
  const loadSchemaSummary = useCallback(async () => {
    if (summaries.length > 0) return;
    setIsLoadingSchema(true);
    try {
      const data = await summarizeTable(tableName, fileType);
      setSummaries(data);
    } catch (err) {
      console.error('Failed to load schema summary:', err);
    } finally {
      setIsLoadingSchema(false);
    }
  }, [summaries.length, tableName, fileType]);

  useEffect(() => {
    if (activeTab === 'schema') {
      loadSchemaSummary();
    }
  }, [activeTab, loadSchemaSummary]);

  const handleExecuteSql = useCallback(async () => {
    setIsLoading(true);
    setSqlError(null);
    try {
      const res = await runCustomSql(customSql);
      setColumns(res.columns);
      setRows(res.rows);
      setTotalRows(res.totalRows);
      setExecutionTime(res.executionTimeMs);
      setActiveTab('grid');
    } catch (err: any) {
      console.error('SQL Execution failed:', err);
      setSqlError(err.message || 'Invalid SQL query');
    } finally {
      setIsLoading(false);
    }
  }, [customSql]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to execute SQL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && activeTab === 'sql') {
        e.preventDefault();
        handleExecuteSql();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleExecuteSql]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchData();
  };

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      if (sortAsc) {
        setSortAsc(false);
      } else {
        setSortCol(undefined);
        setSortAsc(true);
      }
    } else {
      setSortCol(colName);
      setSortAsc(true);
    }
    setPage(0);
  };

  const handleExport = async (type: 'excel' | 'csv' | 'json' | 'parquet') => {
    setIsExporting(type);
    try {
      if (type === 'excel') {
        await exportToExcel(tableName, fileType);
      } else if (type === 'csv') {
        await exportToCsv(tableName, fileType);
      } else if (type === 'json') {
        await exportToJson(tableName, fileType);
      } else if (type === 'parquet') {
        await exportToParquet(tableName, fileType, parquetCodec);
        setShowParquetModal(false);
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  const handleCellClick = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedCell(val);
    setTimeout(() => setCopiedCell(null), 1500);
  };

  const handleCopyDdl = () => {
    if (columns.length === 0) return;
    const cleanTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');
    const colsSql = columns.map(c => `  "${c.name}" ${c.type}`).join(',\n');
    const ddl = `CREATE TABLE ${cleanTableName} (\n${colsSql}\n);`;
    navigator.clipboard.writeText(ddl);
    setDdlCopied(true);
    setTimeout(() => setDdlCopied(false), 2000);
  };

  // SQL Templates
  const applySqlTemplate = (templateType: 'count' | 'top10' | 'nulls' | 'summary') => {
    let scanExpr = `'${tableName}'`;
    if (fileType === 'parquet') scanExpr = `parquet_scan('${tableName}')`;
    else if (fileType === 'csv') scanExpr = `read_csv_auto('${tableName}')`;
    else if (fileType === 'json') scanExpr = `read_json_auto('${tableName}')`;

    const firstCol = columns[0]?.name || 'id';
    const stringCol = columns.find(c => c.type.includes('VARCHAR') || c.type.includes('TEXT'))?.name || firstCol;
    const numCol = columns.find(c => c.type.includes('INT') || c.type.includes('DOUBLE') || c.type.includes('NUMERIC'))?.name || firstCol;

    let sql = '';
    if (templateType === 'count') {
      sql = `SELECT count(*) AS total_rows FROM ${scanExpr};`;
    } else if (templateType === 'top10') {
      sql = `SELECT "${stringCol}", count(*) AS frequency\nFROM ${scanExpr}\nGROUP BY "${stringCol}"\nORDER BY frequency DESC\nLIMIT 10;`;
    } else if (templateType === 'nulls') {
      const nullCols = columns.slice(0, 5).map(c => `count(*) - count("${c.name}") AS null_${c.name}`).join(',\n  ');
      sql = `SELECT\n  ${nullCols}\nFROM ${scanExpr};`;
    } else if (templateType === 'summary') {
      sql = `SELECT\n  min("${numCol}") AS min_val,\n  avg("${numCol}") AS avg_val,\n  max("${numCol}") AS max_val,\n  stddev("${numCol}") AS std_val\nFROM ${scanExpr};`;
    }
    setCustomSql(sql);
    setActiveTab('sql');
  };

  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Copied Cell Toast */}
      {copiedCell && (
        <div className="fixed bottom-6 right-6 z-50 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="size-3.5" />
          <span>Copied value to clipboard</span>
        </div>
      )}

      {/* File Info & Engine Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400">
            <Database className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
                {tableName}
              </h2>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80 uppercase font-semibold">
                {fileType}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-emerald-400 border border-emerald-900/50">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DuckDB Wasm
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              <span className="text-slate-200 font-semibold">{totalRows.toLocaleString()}</span> rows ·{' '}
              <span className="text-slate-200 font-semibold">{columns.length}</span> columns ·{' '}
              <span className="text-emerald-400 font-mono">⚡ {executionTime}ms</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table Density Switcher */}
          {activeTab === 'grid' && (
            <button
              onClick={() => setDensity(d => d === 'compact' ? 'normal' : 'compact')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title="Toggle Compact / Standard Table Row Density"
            >
              <SlidersHorizontal className="size-4 text-slate-400" />
              <span>{density === 'compact' ? 'Compact' : 'Standard'}</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            Open Another File
          </button>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        {/* View mode switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="size-4" />
            Grid View
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableProperties className="size-4" />
            Schema & Profiling
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="size-4" />
            SQL Console
          </button>
        </div>

        {/* Quick Search */}
        {activeTab === 'grid' && (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="size-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search text rows (press Enter)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {searchFilter && (
              <button
                type="button"
                onClick={() => {
                  setSearchFilter('');
                  setPage(0);
                }}
                className="text-sm text-slate-400 hover:text-slate-200 px-2.5 py-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
        )}

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Highlight Parquet export when viewing CSV or JSON */}
          {fileType !== 'parquet' ? (
            <button
              onClick={() => setShowParquetModal(true)}
              disabled={!!isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 border border-slate-800 dark:border-transparent shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Convert this table directly to compressed Apache Parquet (.parquet)"
            >
              <Download className="size-4" />
              {isExporting === 'parquet' ? 'Converting...' : 'Convert to Parquet (ZSTD)'}
            </button>
          ) : (
            <button
              onClick={() => setShowParquetModal(true)}
              disabled={!!isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Export or re-compress to Apache Parquet (.parquet)"
            >
              <Download className="size-4 text-slate-400" />
              {isExporting === 'parquet' ? 'Exporting...' : 'Parquet'}
            </button>
          )}

          <button
            onClick={() => handleExport('excel')}
            disabled={!!isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Download as Microsoft Excel (.xlsx) workbook"
          >
            <FileSpreadsheet className="size-4 text-emerald-400" />
            {isExporting === 'excel' ? 'Exporting...' : 'Export Excel (.xlsx)'}
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={!!isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Download as comma-separated values (.csv)"
          >
            <FileText className="size-4 text-slate-400" />
            {isExporting === 'csv' ? 'Exporting...' : 'CSV'}
          </button>

          <button
            onClick={() => handleExport('json')}
            disabled={!!isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Download as JSON"
          >
            <FileCode className="size-4 text-slate-400" />
            {isExporting === 'json' ? 'Exporting...' : 'JSON'}
          </button>
        </div>
      </div>

      {/* Parquet Export Codec Modal / Popover */}
      {showParquetModal && (
        <div className="mb-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Download className="size-3.5 text-indigo-400" />
              Configure Apache Parquet Export
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              DuckDB writes an optimized columnar file directly into your browser download folder.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px]">Codec:</span>
              <select
                value={parquetCodec}
                onChange={(e) => setParquetCodec(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-indigo-300 font-mono focus:outline-none"
              >
                <option value="ZSTD">ZSTD (High Compression & Fast)</option>
                <option value="SNAPPY">SNAPPY (Hadoop Standard)</option>
                <option value="UNCOMPRESSED">UNCOMPRESSED</option>
              </select>
            </div>

            <button
              onClick={() => handleExport('parquet')}
              disabled={!!isExporting}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 border border-slate-800 dark:border-transparent text-xs font-semibold cursor-pointer shadow-sm"
            >
              Download .parquet
            </button>
            <button
              onClick={() => setShowParquetModal(false)}
              className="px-2 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Schema & Profiling Mode */}
      {activeTab === 'schema' && (
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TableProperties className="size-4 text-indigo-400" />
                Column Schema & Statistical Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Analytical profiling computed locally by DuckDB <code className="text-indigo-300 font-mono">SUMMARIZE</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDdl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
              >
                {ddlCopied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-slate-400" />}
                {ddlCopied ? 'DDL Copied!' : 'Copy SQL DDL (CREATE TABLE)'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Column Name</th>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">Null %</th>
                    <th className="p-3">Approx Unique</th>
                    <th className="p-3">Min Value</th>
                    <th className="p-3">Max Value</th>
                    <th className="p-3">Avg ± Std</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {isLoadingSchema ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <RefreshCw className="size-6 text-indigo-400 animate-spin" />
                          <p className="text-xs">Computing column profiles across dataset...</p>
                        </div>
                      </td>
                    </tr>
                  ) : summaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No schema information available.
                      </td>
                    </tr>
                  ) : (
                    summaries.map((s) => (
                      <tr key={s.columnName} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-semibold text-slate-200">{s.columnName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 text-[11px]">
                            {s.columnType}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          <span className={s.nullPercentage !== '0.0%' ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                            {s.nullPercentage}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{s.approxUnique}</td>
                        <td className="p-3 text-slate-400 truncate max-w-xs">{s.min}</td>
                        <td className="p-3 text-slate-400 truncate max-w-xs">{s.max}</td>
                        <td className="p-3 text-slate-400">
                          {s.avg !== '—' ? `${s.avg} ± ${s.std}` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SQL Console Mode */}
      {activeTab === 'sql' && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="size-3.5 text-indigo-400" />
              DuckDB SQL Console
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">⌘+Enter</kbd> to execute
            </span>
          </div>

          {/* Quick Query Template Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="size-3 text-amber-400" />
              Templates:
            </span>
            <button
              onClick={() => applySqlTemplate('count')}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              COUNT(*)
            </button>
            <button
              onClick={() => applySqlTemplate('top10')}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              Top 10 Frequency
            </button>
            <button
              onClick={() => applySqlTemplate('nulls')}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              Check Nulls
            </button>
            <button
              onClick={() => applySqlTemplate('summary')}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              Numeric Summary (AVG/MIN/MAX)
            </button>
          </div>

          <textarea
            value={customSql}
            onChange={(e) => setCustomSql(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
            placeholder="SELECT * FROM table LIMIT 50;"
          />

          {sqlError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
              <span className="font-mono">{sqlError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1">Insert column:</span>
              {columns.slice(0, 8).map(c => (
                <button
                  key={c.name}
                  onClick={() => setCustomSql(prev => prev.replace(/FROM/i, `"${c.name}" FROM`))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-700 cursor-pointer"
                >
                  {c.name}
                </button>
              ))}
              {columns.length > 8 && (
                <span className="text-[10px] text-slate-400">+{columns.length - 8} more</span>
              )}
            </div>

            <button
              onClick={handleExecuteSql}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 border border-slate-800 dark:border-transparent shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="size-3.5 fill-current text-emerald-400 dark:text-emerald-600" />
              {isLoading ? 'Running...' : 'Execute SQL (⌘+Enter)'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Grid Table Container */}
      {activeTab === 'grid' && (() => {
        // Virtual Table Windowing calculation for silky 60fps scrolling under big data
        const rowHeight = density === 'compact' ? 33 : 45;
        const containerHeight = 600;
        const overscan = 6;
        const totalBatchRows = rows.length;
        const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
        const endIndex = Math.min(totalBatchRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan);
        const visibleRows = rows.slice(startIndex, endIndex);
        const topSpacerHeight = startIndex * rowHeight;
        const bottomSpacerHeight = Math.max(0, (totalBatchRows - endIndex) * rowHeight);

        return (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            <div
              ref={scrollContainerRef}
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
              className="overflow-x-auto max-h-[600px] relative"
            >
              <table className="w-full border-collapse text-left font-mono">
                <thead className="bg-slate-950/90 backdrop-blur sticky top-0 z-20 border-b border-slate-800 shadow-sm">
                  <tr>
                    <th className={`w-14 text-slate-400 border-r border-slate-800/80 select-none text-center ${density === 'compact' ? 'p-1.5 text-xs' : 'p-3.5 text-sm'}`}>
                      #
                    </th>
                    {columns.map((col) => {
                      const isSorted = sortCol === col.name;
                      return (
                        <th
                          key={col.name}
                          onClick={() => handleSort(col.name)}
                          className={`border-r border-slate-800/80 last:border-r-0 hover:bg-slate-900/80 cursor-pointer transition-colors select-none group ${
                            density === 'compact' ? 'p-2 text-xs' : 'p-3.5 text-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                              {col.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-normal text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                                {col.type}
                              </span>
                              {isSorted ? (
                                sortAsc ? (
                                  <ArrowUp className="size-4 text-indigo-400" />
                                ) : (
                                  <ArrowDown className="size-4 text-indigo-400" />
                                )
                              ) : (
                                <ArrowUpDown className="size-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody data-clarity-mask="true" className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <RefreshCw className="size-6 text-indigo-400 animate-spin" />
                          <p className="text-sm">Querying local DuckDB memory...</p>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="py-16 text-center text-slate-400 text-sm">
                        No matching records found.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {topSpacerHeight > 0 && (
                        <tr style={{ height: `${topSpacerHeight}px` }} aria-hidden="true">
                          <td colSpan={columns.length + 1} className="p-0 border-0 pointer-events-none" />
                        </tr>
                      )}
                      {visibleRows.map((row, idx) => {
                        const actualIndex = startIndex + idx;
                        return (
                          <tr key={actualIndex} className="hover:bg-slate-800/50 transition-colors">
                            <td className={`text-center text-slate-400 border-r border-slate-800/50 select-none ${
                              density === 'compact' ? 'p-1.5 text-xs' : 'p-3 text-sm'
                            }`}>
                              {page * pageSize + actualIndex + 1}
                            </td>
                            {columns.map((col) => {
                              const val = row[col.name];
                              const isNull = val === null || val === undefined;
                              const displayVal = isNull
                                ? 'null'
                                : typeof val === 'object'
                                ? JSON.stringify(val)
                                : String(val);

                              return (
                                <td
                                  key={col.name}
                                  onClick={() => !isNull && handleCellClick(displayVal)}
                                  className={`border-r border-slate-800/50 last:border-r-0 truncate max-w-xs cursor-pointer hover:bg-slate-800/60 transition-colors ${
                                    density === 'compact' ? 'p-2 text-xs' : 'p-3 text-sm'
                                  } ${
                                    isNull
                                      ? 'text-slate-400 italic'
                                      : typeof val === 'number'
                                      ? 'text-indigo-300'
                                      : typeof val === 'boolean'
                                      ? 'text-amber-400 font-semibold'
                                      : 'text-slate-200'
                                  }`}
                                  title={`Click to copy: ${displayVal}`}
                                >
                                  {displayVal}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {bottomSpacerHeight > 0 && (
                        <tr style={{ height: `${bottomSpacerHeight}px` }} aria-hidden="true">
                          <td colSpan={columns.length + 1} className="p-0 border-0 pointer-events-none" />
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2.5">
                <span>
                  Showing{' '}
                  <strong className="text-slate-200">
                    {totalRows > 0 ? page * pageSize + 1 : 0}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-slate-200">
                    {Math.min((page + 1) * pageSize, totalRows)}
                  </strong>{' '}
                  of <strong className="text-slate-200">{totalRows.toLocaleString()}</strong> rows
                </span>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="ml-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                  <option value={200}>200 / page</option>
                  <option value={500}>500 / page (Virtual)</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || isLoading}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-4.5" />
                </button>
                <span>
                  Page <strong className="text-slate-200">{page + 1}</strong> of{' '}
                  <strong className="text-slate-200">{Math.max(1, totalPages)}</strong>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || isLoading}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-4.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
