import { useState, useRef } from 'react';
import { Table, Terminal, Download, UploadCloud, CheckCircle2, Play, RefreshCw } from 'lucide-react';

interface ProductShellProps {
  onFileSelected: (file: File) => void;
  onTrySample: () => void;
  isLoading: boolean;
  loadingStatus: string;
}

export const ProductShell = ({
  onFileSelected,
  onTrySample,
  isLoading,
  loadingStatus
}: ProductShellProps) => {
  const [activeTab, setActiveTab] = useState<'table' | 'sql'>('table');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const sampleRows = [
    { id: 'ORD-9821', time: '2026-09-08 14:22', country: '🇺🇸 United States', amount: '$249.50', status: 'COMPLETED', statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { id: 'ORD-9820', time: '2026-09-08 14:18', country: '🇩🇪 Germany', amount: '$1,120.00', status: 'PROCESSING', statusColor: 'bg-slate-800 text-slate-300 border-slate-700' },
    { id: 'ORD-9819', time: '2026-09-08 14:05', country: '🇸🇬 Singapore', amount: '$89.99', status: 'COMPLETED', statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { id: 'ORD-9818', time: '2026-09-08 13:50', country: '🇯🇵 Japan', amount: '$430.25', status: 'COMPLETED', statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { id: 'ORD-9817', time: '2026-09-08 13:33', country: '🇬🇧 United Kingdom', amount: '$612.00', status: 'SHIPPED', statusColor: 'bg-slate-800 text-slate-300 border-slate-700' }
  ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden backdrop-blur-xl ${
        isDragOver
          ? 'border-slate-500 bg-slate-800/40 shadow-xl scale-[1.01]'
          : 'border-slate-800 bg-slate-900/90 shadow-black/60 hover:border-slate-700'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".parquet,.csv,.tsv,.json,.jsonl,.ndjson,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFileSelected(e.target.files[0]);
        }}
      />

      {/* Window Titlebar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
        {/* Left: macOS dots & file tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-yellow-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className="text-xs font-mono font-medium text-slate-300">sales_stream_q3.parquet</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              1,000 rows
            </span>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'table'
                ? 'bg-white text-slate-950 font-semibold shadow-sm border border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/80'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Table className="size-3" />
            <span>Table Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-slate-950 font-semibold shadow-sm border border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/80'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="size-3" />
            <span>SQL Console</span>
          </button>
        </div>

        {/* Right: Wasm Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/50">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Wasm: Ready</span>
        </div>
      </div>

      {/* Main Body Window */}
      <div className="p-4 sm:p-5 min-h-[310px] relative">
        {activeTab === 'table' ? (
          <div>
            {/* Mock Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <span className="text-slate-100 font-semibold">5 columns</span>
                <span>·</span>
                <span>Snappy Compressed</span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">100% In-Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onTrySample}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="size-3" />
                  <span>Export .xlsx</span>
                </button>
              </div>
            </div>

            {/* Stylized Columnar Table */}
            <div className="rounded-xl border border-slate-800/80 overflow-x-auto bg-slate-950/60">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300 text-[11px]">
                    <th className="p-2.5 font-semibold">order_id</th>
                    <th className="p-2.5 font-semibold">created_at</th>
                    <th className="p-2.5 font-semibold">customer_country</th>
                    <th className="p-2.5 font-semibold text-right">amount_usd</th>
                    <th className="p-2.5 font-semibold text-center">status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-[11px]">
                  {sampleRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 text-slate-100 font-semibold">{row.id}</td>
                      <td className="p-2.5 text-slate-400">{row.time}</td>
                      <td className="p-2.5 text-slate-200">{row.country}</td>
                      <td className="p-2.5 text-right font-medium text-emerald-300">{row.amount}</td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300 leading-relaxed overflow-x-auto">
              <div className="text-slate-500 mb-1">// In-browser analytical query running locally on CPU</div>
              <div><span className="text-blue-400">SELECT</span> customer_country,</div>
              <div className="pl-4"><span className="text-cyan-400">COUNT</span>(order_id) <span className="text-blue-400">AS</span> total_orders,</div>
              <div className="pl-4"><span className="text-cyan-400">ROUND</span>(<span className="text-cyan-400">SUM</span>(amount_usd), 2) <span className="text-blue-400">AS</span> total_revenue</div>
              <div><span className="text-blue-400">FROM</span> <span className="text-emerald-400">"sales_stream_q3.parquet"</span></div>
              <div><span className="text-blue-400">WHERE</span> status = <span className="text-emerald-400">'COMPLETED'</span></div>
              <div><span className="text-blue-400">GROUP BY</span> customer_country</div>
              <div><span className="text-blue-400">ORDER BY</span> total_revenue <span className="text-blue-400">DESC</span>;</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5" />
                Query OK · 4.2ms
              </span>
              <span>0 bytes uploaded · 100% Client RAM</span>
            </div>
          </div>
        )}

        {/* Drag overlay state */}
        {isDragOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-indigo-400 animate-in fade-in duration-150 z-20">
            <UploadCloud className="size-12 text-indigo-400 animate-bounce mb-3" />
            <h4 className="text-base font-bold text-slate-100 mb-1">Drop file to open immediately</h4>
            <p className="text-xs text-slate-400">Supports .parquet, .csv, .tsv, .json, and .xlsx</p>
          </div>
        )}
      </div>

      {/* Interactive Bottom Bar */}
      <div className="p-3.5 bg-slate-950/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span>Interactive Live Demo. No file needed to test:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onTrySample}
            disabled={isLoading}
            title={isLoading ? loadingStatus : 'Launch Full Workbench Demo'}
            className="btn-primary px-3.5 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-75 shrink-0 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <RefreshCw className="size-3 animate-spin" />
                <span>Loading Demo...</span>
              </>
            ) : (
              <>
                <Play className="size-3 fill-current text-emerald-400 dark:text-emerald-600" />
                <span>Launch Full Workbench</span>
              </>
            )}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            Upload Own File
          </button>
        </div>
      </div>
    </div>
  );
};
