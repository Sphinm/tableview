import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Copy,
  Check,
  Table,
  Braces,
  Code2,
  Download,
  ListFilter
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';

export interface JsonViewProps {
  data: any;
  rawText?: string;
  fileName?: string;
  onOpenTable?: (subPath: string, items: any[]) => void;
  initialExpandedDepth?: number;
}

interface TreeNodeProps {
  keyName?: string;
  value: any;
  path: string;
  depth: number;
  expandedPaths: Set<string>;
  togglePath: (path: string) => void;
  onCopyPath: (path: string) => void;
  onCopyValue: (val: any) => void;
  onOpenTable?: (subPath: string, items: any[]) => void;
  searchFilter: string;
}

/**
 * Format string preview, truncating extremely long values
 */
function formatStringPreview(str: string, maxLength: number = 80): { preview: string; isTruncated: boolean } {
  if (str.length <= maxLength) {
    return { preview: str, isTruncated: false };
  }
  return { preview: str.slice(0, maxLength) + '…', isTruncated: true };
}

/**
 * Recursive Tree Node Component
 */
const JsonTreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  value,
  path,
  depth,
  expandedPaths,
  togglePath,
  onCopyPath,
  onCopyValue,
  onOpenTable,
  searchFilter
}) => {
  const [showFullString, setShowFullString] = useState(false);
  const [arrayLimit, setArrayLimit] = useState(100);

  const isExpanded = expandedPaths.has(path);
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object' && !isArray;
  const isExpandable = isArray || isObject;

  // Check if an array contains objects that can be flattened into a table
  const isTabularArray = useMemo(() => {
    if (!isArray || value.length === 0) return false;
    // Check first few items
    const sample = value.slice(0, 5);
    return sample.every((item: any) => item !== null && typeof item === 'object' && !Array.isArray(item));
  }, [isArray, value]);

  // Match indicator
  const isMatch = useMemo(() => {
    if (!searchFilter) return false;
    const filter = searchFilter.toLowerCase();
    if (keyName && keyName.toLowerCase().includes(filter)) return true;
    if (typeof value === 'string' && value.toLowerCase().includes(filter)) return true;
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value).toLowerCase().includes(filter);
    }
    return false;
  }, [keyName, value, searchFilter]);

  // Render Primitive values
  if (!isExpandable) {
    return (
      <div
        className={`flex items-baseline gap-2 py-0.5 px-1.5 rounded hover:bg-slate-100/70 group font-mono text-xs transition-colors ${
          isMatch ? 'bg-amber-500/15 ring-1 ring-amber-500/30' : ''
        }`}
        style={{ paddingLeft: `${Math.max(depth * 18, 6)}px` }}
      >
        {keyName !== undefined && (
          <span className="text-indigo-600 font-semibold select-none flex-shrink-0">
            "{keyName}":
          </span>
        )}

        {/* Primitive Value Representation */}
        {value === null ? (
          <span className="text-rose-600 font-medium italic">null</span>
        ) : value === undefined ? (
          <span className="text-slate-400 italic">undefined</span>
        ) : typeof value === 'string' ? (
          (() => {
            const { preview, isTruncated } = formatStringPreview(value);
            return (
              <span className="text-emerald-700 break-all">
                "{showFullString ? value : preview}"
                {isTruncated && (
                  <button
                    onClick={() => setShowFullString(!showFullString)}
                    className="ml-1 text-[10px] text-slate-400 hover:text-indigo-600 underline cursor-pointer"
                  >
                    {showFullString ? 'less' : `+${value.length - 80} chars`}
                  </button>
                )}
              </span>
            );
          })()
        ) : typeof value === 'number' ? (
          <span className="text-amber-700 font-medium">{value}</span>
        ) : typeof value === 'boolean' ? (
          <span className="text-purple-700 font-bold">{value ? 'true' : 'false'}</span>
        ) : (
          <span className="text-slate-800">{String(value)}</span>
        )}

        {/* Hover Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto text-[10px] text-slate-400 pl-2">
          <button
            onClick={() => onCopyValue(value)}
            title="Copy Value"
            className="hover:text-slate-900 p-0.5 rounded hover:bg-slate-200/70 cursor-pointer"
          >
            Copy
          </button>
          <button
            onClick={() => onCopyPath(path)}
            title={`Copy JSON Path (${path})`}
            className="hover:text-indigo-600 p-0.5 rounded hover:bg-slate-200/70 cursor-pointer"
          >
            Path
          </button>
        </div>
      </div>
    );
  }

  // Complex Node: Object or Array
  const childKeys = isObject ? Object.keys(value) : [];
  const itemCount = isArray ? value.length : childKeys.length;

  return (
    <div className="font-mono text-xs select-text">
      {/* Node Header */}
      <div
        className={`flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-slate-100/70 group transition-colors cursor-pointer ${
          isMatch ? 'bg-amber-500/15 ring-1 ring-amber-500/30' : ''
        }`}
        style={{ paddingLeft: `${Math.max(depth * 18, 6)}px` }}
        onClick={() => togglePath(path)}
      >
        <span className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-transform">
          {isExpanded ? (
            <ChevronDown className="size-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="size-3.5 text-slate-400" />
          )}
        </span>

        {keyName !== undefined && (
          <span className="text-indigo-600 font-semibold">
            "{keyName}":
          </span>
        )}

        {/* Structural badges */}
        {isArray ? (
          <span className="text-slate-500">
            [
            {!isExpanded && (
              <span className="text-slate-500 px-1.5 py-0.2 rounded bg-slate-100 text-[11px] mx-1 border border-slate-200">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
            {!isExpanded && ']'}
          </span>
        ) : (
          <span className="text-slate-500">
            {'{'}
            {!isExpanded && (
              <span className="text-slate-500 px-1.5 py-0.2 rounded bg-slate-100 text-[11px] mx-1 border border-slate-200">
                {itemCount} {itemCount === 1 ? 'key' : 'keys'}
              </span>
            )}
            {!isExpanded && '}'}
          </span>
        )}

        {/* Tabular Extract Button for array of objects */}
        {isTabularArray && onOpenTable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTable(keyName || path, value);
            }}
            className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-sans font-medium transition-colors cursor-pointer"
            title={`View ${keyName || 'this array'} as relational table in Grid View`}
          >
            <Table className="size-3 text-indigo-600" />
            <span>View as Table</span>
          </button>
        )}

        {/* Hover Quick Actions */}
        <div
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ml-auto text-[10px] text-slate-400 pl-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onCopyValue(value)}
            title="Copy formatted JSON subtree"
            className="hover:text-slate-900 p-0.5 rounded hover:bg-slate-200/70 cursor-pointer"
          >
            Copy
          </button>
          <button
            onClick={() => onCopyPath(path)}
            title={`Copy JSON Path: ${path}`}
            className="hover:text-indigo-600 p-0.5 rounded hover:bg-slate-200/70 cursor-pointer"
          >
            Path
          </button>
        </div>
      </div>

      {/* Expanded Children */}
      {isExpanded && (
        <div className="relative border-l border-slate-200 ml-3.5 my-0.5">
          {isArray ? (
            <>
              {value.slice(0, arrayLimit).map((item: any, idx: number) => (
                <JsonTreeNode
                  key={idx}
                  keyName={String(idx)}
                  value={item}
                  path={`${path}[${idx}]`}
                  depth={depth + 1}
                  expandedPaths={expandedPaths}
                  togglePath={togglePath}
                  onCopyPath={onCopyPath}
                  onCopyValue={onCopyValue}
                  onOpenTable={onOpenTable}
                  searchFilter={searchFilter}
                />
              ))}
              {value.length > arrayLimit && (
                <div
                  className="py-1 px-4 text-xs font-sans text-indigo-600"
                  style={{ paddingLeft: `${Math.max((depth + 1) * 18, 12)}px` }}
                >
                  <button
                    onClick={() => setArrayLimit(prev => prev + 100)}
                    className="hover:underline font-semibold cursor-pointer"
                  >
                    + Show next 100 items ({value.length - arrayLimit} remaining)
                  </button>
                  <button
                    onClick={() => setArrayLimit(value.length)}
                    className="ml-3 text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Show all {value.length} items
                  </button>
                </div>
              )}
              <div
                className="text-slate-400 py-0.5"
                style={{ paddingLeft: `${Math.max(depth * 18, 6)}px` }}
              >
                ]
              </div>
            </>
          ) : (
            <>
              {childKeys.map((k) => (
                <JsonTreeNode
                  key={k}
                  keyName={k}
                  value={value[k]}
                  path={path ? `${path}.${k}` : k}
                  depth={depth + 1}
                  expandedPaths={expandedPaths}
                  togglePath={togglePath}
                  onCopyPath={onCopyPath}
                  onCopyValue={onCopyValue}
                  onOpenTable={onOpenTable}
                  searchFilter={searchFilter}
                />
              ))}
              <div
                className="text-slate-400 py-0.5"
                style={{ paddingLeft: `${Math.max(depth * 18, 6)}px` }}
              >
                {'}'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const JsonView: React.FC<JsonViewProps> = ({
  data,
  rawText,
  fileName = 'document.json',
  onOpenTable,
  initialExpandedDepth = 2
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Compute all paths up to initial depth for default expansion
  const defaultExpanded = useMemo(() => {
    const paths = new Set<string>();

    const traverse = (node: any, currentPath: string, currentDepth: number) => {
      if (currentDepth <= initialExpandedDepth) {
        paths.add(currentPath);
      }
      if (currentDepth >= initialExpandedDepth || node === null || typeof node !== 'object') {
        return;
      }
      if (Array.isArray(node)) {
        // Only expand the array itself and first 5 elements to keep memory nimble
        node.slice(0, 5).forEach((item, idx) => {
          traverse(item, `${currentPath}[${idx}]`, currentDepth + 1);
        });
      } else {
        Object.keys(node).forEach((k) => {
          traverse(node[k], currentPath ? `${currentPath}.${k}` : k, currentDepth + 1);
        });
      }
    };

    traverse(data, 'root', 1);
    return paths;
  }, [data, initialExpandedDepth]);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(defaultExpanded);

  // Toggle single path
  const togglePath = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  // Expand All (up to 4 levels)
  const handleExpandAll = useCallback(() => {
    const all = new Set<string>();
    const traverse = (node: any, path: string, depth: number) => {
      if (depth > 4 || node === null || typeof node !== 'object') return;
      all.add(path);
      if (Array.isArray(node)) {
        node.slice(0, 30).forEach((item, idx) => traverse(item, `${path}[${idx}]`, depth + 1));
      } else {
        Object.keys(node).forEach((k) => traverse(node[k], path ? `${path}.${k}` : k, depth + 1));
      }
    };
    traverse(data, 'root', 1);
    setExpandedPaths(all);
  }, [data]);

  // Collapse All
  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set(['root']));
  }, []);

  // Copy feedback helper
  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 2000);
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    showToast(`Copied path: ${path}`);
  };

  const handleCopyValue = (val: any) => {
    const text = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
    navigator.clipboard.writeText(text);
    showToast('Copied value to clipboard');
  };

  const handleCopyAll = () => {
    const text = rawText || JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    showToast('Copied full JSON to clipboard');
  };

  const handleDownload = () => {
    const text = rawText || JSON.stringify(data, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  // Stringified formatted text for Raw mode
  const formattedRawJson = useMemo(() => {
    if (viewMode !== 'raw') return '';
    if (rawText) {
      try {
        // Re-indent for clean aesthetics
        return JSON.stringify(JSON.parse(rawText), null, 2);
      } catch {
        return rawText;
      }
    }
    return JSON.stringify(data, null, 2);
  }, [viewMode, rawText, data]);

  // Stats
  const stats = useMemo(() => {
    if (Array.isArray(data)) {
      return { type: 'Array', count: `${data.length.toLocaleString()} items` };
    } else if (data !== null && typeof data === 'object') {
      return { type: 'Object', count: `${Object.keys(data).length.toLocaleString()} keys` };
    }
    return { type: typeof data, count: '1 primitive' };
  }, [data]);

  return (
    // data-sentry-mask: this view renders the user's raw JSON — keys, values and
    // the source text pane. None of it may reach session recording.
    <div
      data-sentry-mask="true"
      className="relative rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col min-h-[500px]"
    >
      {/* Toast Notification */}
      {copiedToast && (
        <div className="absolute top-4 right-4 z-50 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="size-3.5" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* JSON Viewer Toolbar */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Left: View Mode Tabs & Quick Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Braces className="size-3.5 text-indigo-600" />
              <span>Interactive Tree</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code2 className="size-3.5 text-emerald-600" />
              <span>Raw JSON Code</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-600 px-2.5 py-1 rounded-lg bg-white border border-slate-200">
            <span className="text-slate-800 font-semibold">{stats.type}</span>
            <span>·</span>
            <span>{stats.count}</span>
          </div>
        </div>

        {/* Center: Search Filter in Tree Mode */}
        {viewMode === 'tree' && (
          <div className="relative flex-1 max-w-xs">
            <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter keys or values..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs transition-colors"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {viewMode === 'tree' && (
            <>
              <button
                onClick={handleExpandAll}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                title="Expand up to 4 levels"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
              >
                Collapse All
              </button>
            </>
          )}

          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
            title="Copy formatted JSON to clipboard"
          >
            <Copy className="size-3.5 text-slate-500" />
            <span>Copy JSON</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
            title="Download formatted JSON file"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 overflow-auto max-h-[680px] bg-white font-mono">
        {viewMode === 'tree' ? (
          <div className="space-y-0.5">
            <JsonTreeNode
              value={data}
              path="root"
              depth={0}
              expandedPaths={expandedPaths}
              togglePath={togglePath}
              onCopyPath={handleCopyPath}
              onCopyValue={handleCopyValue}
              onOpenTable={onOpenTable}
              searchFilter={searchFilter}
            />
          </div>
        ) : (
          <div className="relative min-h-[420px] -m-4">
            <CodeEditor
              language="json"
              value={formattedRawJson}
              readOnly={true}
              placeholder="// No JSON data available"
            />
          </div>
        )}
      </div>

      {/* Tree View Footer Hint */}
      {viewMode === 'tree' && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-sans">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              "string"
            </span>
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-amber-500" />
              number
            </span>
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-purple-500" />
              boolean
            </span>
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-rose-500" />
              null
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <ListFilter className="size-3 text-indigo-600" />
            <span>Click any node to expand/collapse · Click "Path" to copy selector</span>
          </div>
        </div>
      )}
    </div>
  );
};
