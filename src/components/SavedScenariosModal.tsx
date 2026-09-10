import React, { useState } from 'react';
import { Bookmark, X, Trash2, Check, ArrowRight, Layers, Plus, Calendar } from 'lucide-react';

/**
 * Read saved scenarios for a calculator. Corrupt or unavailable storage (private
 * mode, quota errors) degrades to an empty list rather than crashing the modal.
 */
function readScenarios<T>(storageKey: string): SavedScenario<T>[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load saved scenarios:', err);
    return [];
  }
}

export interface SavedScenario<T = any> {
  id: string;
  name: string;
  date: string;
  data: T;
  metrics: {
    headline: string;
    subline: string;
  };
}

interface SavedScenariosModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  calculatorId: string;
  currentData: T;
  currentMetrics: {
    headline: string;
    subline: string;
  };
  onLoadScenario: (data: T) => void;
}

export function SavedScenariosModal<T>({
  isOpen,
  onClose,
  calculatorId,
  currentData,
  currentMetrics,
  onLoadScenario,
}: SavedScenariosModalProps<T>) {
  const storageKey = `tableview_scenarios_${calculatorId}`;
  const [scenarios, setScenarios] = useState<SavedScenario<T>[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Load scenarios from localStorage.
  //
  // Adjusting state during render (rather than in an effect) is React's
  // documented pattern for reacting to a prop change: it avoids the extra
  // render pass an effect would cause, and keeps the read synchronous with the
  // first render that actually displays the data.
  if (isOpen && loadedKey !== storageKey) {
    setLoadedKey(storageKey);
    setScenarios(readScenarios<T>(storageKey));
  }

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newName.trim() || `Scenario ${scenarios.length + 1} (${new Date().toLocaleDateString()})`;
    const newScenario: SavedScenario<T> = {
      id: `sc_${Date.now()}`,
      name: title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      data: currentData,
      metrics: currentMetrics,
    };

    const updated = [newScenario, ...scenarios];
    setScenarios(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewName('');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = scenarios.filter(s => s.id !== id);
    setScenarios(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSelectedForCompare(prev => prev.filter(item => item !== id));
  };

  const handleSelectScenario = (sc: SavedScenario<T>) => {
    onLoadScenario(sc.data);
    onClose();
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const comparedScenarios = scenarios.filter(s => selectedForCompare.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Bookmark className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Saved Deal Scenarios</h3>
              <p className="text-xs text-slate-400">Stored 100% locally in your browser. Zero cloud tracking.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Save Current Form */}
        <form onSubmit={handleSaveCurrent} className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name this scenario (e.g. 750k Property @ 6.5%)..."
            className="flex-1 bg-slate-900 border border-slate-700/70 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            className="btn-primary px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Save Scenario</span>
          </button>
        </form>

        {showSavedToast && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="size-3.5 text-emerald-400" />
            <span>Scenario saved to browser storage!</span>
          </div>
        )}

        {/* Side-by-Side Compare Panel if 2 selected */}
        {comparedScenarios.length === 2 && (
          <div className="p-4 bg-indigo-950/30 border-b border-indigo-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="size-3.5" />
                <span>Side-by-Side Comparison</span>
              </span>
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-[11px] text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
              >
                Clear Compare
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {comparedScenarios.map((sc) => (
                <div key={sc.id} className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30">
                  <div className="font-semibold text-slate-200 text-xs truncate">{sc.name}</div>
                  <div className="text-sm font-black text-indigo-400 mt-1">{sc.metrics.headline}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{sc.metrics.subline}</div>
                  <button
                    onClick={() => handleSelectScenario(sc)}
                    className="mt-2 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Load This</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List of Saved Scenarios */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {scenarios.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Bookmark className="size-8 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs">No saved scenarios yet.</p>
              <p className="text-[11px] text-slate-600">
                Save different deal variations to compare terms or load them back anytime.
              </p>
            </div>
          ) : (
            scenarios.map((sc) => {
              const isComparing = selectedForCompare.includes(sc.id);
              return (
                <div
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className="group p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                        {sc.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                        <Calendar className="size-3" />
                        {sc.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="font-semibold text-slate-100">{sc.metrics.headline}</span>
                      <span className="text-slate-400 text-[11px]">{sc.metrics.subline}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => toggleCompare(sc.id, e)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        isComparing
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                      title="Compare with another scenario"
                    >
                      {isComparing ? 'Comparing' : 'Compare'}
                    </button>
                    <button
                      onClick={(e) => handleDelete(sc.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete saved scenario"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-500">
          <span>{scenarios.length} saved scenario{scenarios.length === 1 ? '' : 's'}</span>
          <span className="text-[11px]">Select any item to instantly load into calculator</span>
        </div>
      </div>
    </div>
  );
}
