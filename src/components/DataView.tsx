import { useState, useEffect, useMemo, type FormEvent } from 'react';
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
  Play
} from 'lucide-react';
import {
  type ColumnSchema,
  queryTable,
  runCustomSql,
  exportToCsv,
  exportToExcel,
  exportToJson
} from '../lib/duckdb';

interface DataViewProps {
  tableName: string;
  fileType: 'parquet' | 'csv' | 'json';
  onReset: () => void;
}

export const DataView = ({ tableName, fileType, onReset }: DataViewProps) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'sql'>('grid');
  const [columns, setColumns] = useState<ColumnSchema[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [executionTime, setExecutionTime] = useState<number>(0);

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

  // Load initial data
  const fetchData = async () => {
    setIsLoading(true);
    setSqlError(null);
    try {
      // Build filter SQL if search provided
      let filterExpr: string | undefined = undefined;
      if (searchFilter.trim() && columns.length > 0) {
        // Search across string columns
        const textCols = columns.filter(c => c.type.includes('VARCHAR') || c.type.includes('STRING') || c.type.includes('TEXT'));
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
  };

  useEffect(() => {
    fetchData();
  }, [tableName, fileType, page, pageSize, sortCol, sortAsc]);

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

  const handleExecuteSql = async () => {
    setIsLoading(true);
    setSqlError(null);
    try {
      const res = await runCustomSql(customSql);
      setColumns(res.columns);
      setRows(res.rows);
      setTotalRows(res.totalRows);
      setExecutionTime(res.executionTimeMs);
    } catch (err: any) {
      console.error('SQL Execution failed:', err);
      setSqlError(err.message || 'Invalid SQL query');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: 'excel' | 'csv' | 'json') => {
    setIsExporting(type);
    try {
      if (type === 'excel') {
        await exportToExcel(tableName, fileType);
      } else if (type === 'csv') {
        await exportToCsv(tableName, fileType);
      } else if (type === 'json') {
        await exportToJson(tableName, fileType);
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* File Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800 text-indigo-400">
            <Database className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {tableName}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase font-semibold">
                {fileType}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="text-slate-200 font-semibold">{totalRows.toLocaleString()}</span> rows ·{' '}
              <span className="text-slate-200 font-semibold">{columns.length}</span> columns ·{' '}
              <span className="text-emerald-400 font-mono">⚡ {executionTime}ms</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            Open Another File
          </button>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* View mode switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="size-3.5" />
            Grid View
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="size-3.5" />
            SQL Console
          </button>
        </div>

        {/* Quick Search */}
        {activeTab === 'grid' && (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search rows (press Enter)..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {searchFilter && (
              <button
                type="button"
                onClick={() => {
                  setSearchFilter('');
                  setPage(0);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Clear
              </button>
            )}
          </form>
        )}

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={!!isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Download as Microsoft Excel (.xlsx) workbook"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-400" />
            {isExporting === 'excel' ? 'Exporting...' : 'Export to Excel (.xlsx)'}
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={!!isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Download as comma-separated values (.csv)"
          >
            <FileText className="size-3.5 text-slate-400" />
            {isExporting === 'csv' ? 'Exporting...' : 'CSV'}
          </button>

          <button
            onClick={() => handleExport('json')}
            disabled={!!isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Download as JSON"
          >
            <FileCode className="size-3.5 text-slate-400" />
            {isExporting === 'json' ? 'Exporting...' : 'JSON'}
          </button>
        </div>
      </div>

      {/* SQL Console Mode */}
      {activeTab === 'sql' && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="size-3.5 text-indigo-400" />
              DuckDB SQL Query
            </span>
            <span className="text-[11px] text-slate-400">
              Query runs directly in WebAssembly over local memory
            </span>
          </div>

          <textarea
            value={customSql}
            onChange={(e) => setCustomSql(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
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
              <span className="text-[11px] text-slate-400 mr-1">Columns:</span>
              {columns.slice(0, 8).map(c => (
                <button
                  key={c.name}
                  onClick={() => setCustomSql(prev => prev.replace(/FROM/i, `"${c.name}" FROM`))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-700"
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="size-3.5 fill-white" />
              {isLoading ? 'Running...' : 'Execute SQL'}
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead className="bg-slate-950/90 backdrop-blur sticky top-0 z-20 border-b border-slate-800 shadow-sm">
              <tr>
                <th className="p-3 w-12 text-slate-400 border-r border-slate-800/80 select-none text-center">
                  #
                </th>
                {columns.map((col) => {
                  const isSorted = sortCol === col.name;
                  return (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className="p-3 border-r border-slate-800/80 last:border-r-0 hover:bg-slate-900/80 cursor-pointer transition-colors select-none group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-200 group-hover:text-indigo-300">
                          {col.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-normal text-slate-400 px-1 rounded bg-slate-900 border border-slate-800">
                            {col.type}
                          </span>
                          {isSorted ? (
                            sortAsc ? (
                              <ArrowUp className="size-3.5 text-indigo-400" />
                            ) : (
                              <ArrowDown className="size-3.5 text-indigo-400" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="size-6 text-indigo-400 animate-spin" />
                      <p className="text-xs">Querying local DuckDB memory...</p>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-16 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-2.5 text-center text-slate-400 border-r border-slate-800/50 select-none text-[11px]">
                      {page * pageSize + idx + 1}
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
                          className={`p-2.5 border-r border-slate-800/50 last:border-r-0 truncate max-w-xs ${
                            isNull
                              ? 'text-slate-400 italic'
                              : typeof val === 'number'
                              ? 'text-indigo-300'
                              : typeof val === 'boolean'
                              ? 'text-purple-300'
                              : 'text-slate-200'
                          }`}
                          title={displayVal}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
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
              className="ml-2 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={200}>200 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span>
              Page <strong className="text-slate-200">{page + 1}</strong> of{' '}
              <strong className="text-slate-200">{Math.max(1, totalPages)}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
