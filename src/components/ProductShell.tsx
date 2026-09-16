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
    { id: 'ORD-9821', time: '2026-09-08 14:22', country: '🇺🇸 United States', amount: '$249.50', status: 'COMPLETED', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'ORD-9820', time: '2026-09-08 14:18', country: '🇩🇪 Germany', amount: '$1,120.00', status: 'PROCESSING', statusColor: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'ORD-9819', time: '2026-09-08 14:05', country: '🇸🇬 Singapore', amount: '$89.99', status: 'COMPLETED', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'ORD-9818', time: '2026-09-08 13:50', country: '🇯🇵 Japan', amount: '$430.25', status: 'COMPLETED', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'ORD-9817', time: '2026-09-08 13:33', country: '🇬🇧 United Kingdom', amount: '$612.00', status: 'SHIPPED', statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-xl ${
        isDragOver
          ? 'border-indigo-400 bg-indigo-50/40 shadow-indigo-100 scale-[1.01]'
          : 'border-slate-200 bg-white shadow-slate-200/50 hover:border-slate-300'
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
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
        {/* Left: macOS dots & file tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs font-mono font-medium text-slate-700">sales_stream_q3.parquet</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
              1,000 rows
            </span>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'table'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="size-3" />
            <span>Table Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="size-3" />
            <span>SQL Console</span>
          </button>
        </div>

        {/* Right: Wasm Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Wasm: Ready</span>
        </div>
      </div>

      {/* Main Body Window */}
      <div className="p-4 sm:p-5 min-h-[310px] relative">
        {activeTab === 'table' ? (
          <div>
            {/* Mock Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                <span className="text-slate-900 font-semibold">5 columns</span>
                <span>·</span>
                <span>Snappy Compressed</span>
                <span>·</span>
                <span className="text-emerald-700 font-medium">100% In-Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onTrySample}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="size-3" />
                  <span>Export .xlsx</span>
                </button>
              </div>
            </div>

            {/* Stylized Columnar Table */}
            <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
                    <th className="p-2.5 font-semibold">order_id</th>
                    <th className="p-2.5 font-semibold">created_at</th>
                    <th className="p-2.5 font-semibold">customer_country</th>
                    <th className="p-2.5 font-semibold text-right">amount_usd</th>
                    <th className="p-2.5 font-semibold text-center">status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {sampleRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 text-slate-900 font-semibold">{row.id}</td>
                      <td className="p-2.5 text-slate-500">{row.time}</td>
                      <td className="p-2.5 text-slate-700">{row.country}</td>
                      <td className="p-2.5 text-right font-medium text-emerald-700">{row.amount}</td>
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
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed overflow-x-auto">
              <div className="text-slate-400 mb-1">// In-browser analytical query running locally on CPU</div>
              <div><span className="text-indigo-600 font-semibold">SELECT</span> customer_country,</div>
              <div className="pl-4"><span className="text-cyan-700 font-semibold">COUNT</span>(order_id) <span className="text-indigo-600 font-semibold">AS</span> total_orders,</div>
              <div className="pl-4"><span className="text-cyan-700 font-semibold">ROUND</span>(<span className="text-cyan-700 font-semibold">SUM</span>(amount_usd), 2) <span className="text-indigo-600 font-semibold">AS</span> total_revenue</div>
              <div><span className="text-indigo-600 font-semibold">FROM</span> <span className="text-emerald-700 font-medium">"sales_stream_q3.parquet"</span></div>
              <div><span className="text-indigo-600 font-semibold">WHERE</span> status = <span className="text-emerald-700 font-medium">'COMPLETED'</span></div>
              <div><span className="text-indigo-600 font-semibold">GROUP BY</span> customer_country</div>
              <div><span className="text-indigo-600 font-semibold">ORDER BY</span> total_revenue <span className="text-indigo-600 font-semibold">DESC</span>;</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="size-3.5" />
                Query OK · 4.2ms
              </span>
              <span>0 bytes uploaded · 100% Client RAM</span>
            </div>
          </div>
        )}

        {/* Drag overlay state */}
        {isDragOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-indigo-400 animate-in fade-in duration-150 z-20">
            <UploadCloud className="size-12 text-indigo-600 animate-bounce mb-3" />
            <h4 className="text-base font-bold text-slate-900 mb-1">Drop file to open immediately</h4>
            <p className="text-xs text-slate-500">Supports .parquet, .csv, .tsv, .json, and .xlsx</p>
          </div>
        )}
      </div>

      {/* Interactive Bottom Bar */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Interactive Live Demo. No file needed to test:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onTrySample}
            disabled={isLoading}
            title={isLoading ? loadingStatus : 'Launch Full Workbench Demo'}
            className="btn-primary px-3.5 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-75 shrink-0 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <RefreshCw className="size-3 animate-spin" />
                <span>Loading Demo...</span>
              </>
            ) : (
              <>
                <Play className="size-3 fill-current text-emerald-400" />
                <span>Launch Full Workbench</span>
              </>
            )}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
          >
            Upload Own File
          </button>
        </div>
      </div>
    </div>
  );
};
