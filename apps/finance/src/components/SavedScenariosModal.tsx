import React, { useState } from 'react';
import { Bookmark, X, Trash2, Check, ArrowRight, Layers, Plus, Calendar, Lock } from 'lucide-react';
import { Dialog } from '@tableview/ui';
import { useAuth } from '../lib/useAuth';

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
  onUpgradePro?: () => void;
}

export function SavedScenariosModal<T>({
  isOpen,
  onClose,
  calculatorId,
  currentData,
  currentMetrics,
  onLoadScenario,
  onUpgradePro,
}: SavedScenariosModalProps<T>) {
  const { user } = useAuth();
  const isPro = user?.plan === 'pro';
  const FREE_LIMIT = 3;

  const storageKey = `tableview_scenarios_${calculatorId}`;
  const [scenarios, setScenarios] = useState<SavedScenario<T>[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [limitWarning, setLimitWarning] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Load scenarios from localStorage
  if (isOpen && loadedKey !== storageKey) {
    setLoadedKey(storageKey);
    setScenarios(readScenarios<T>(storageKey));
  }

  if (!isOpen) return null;

  const isAtLimit = !isPro && scenarios.length >= FREE_LIMIT;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAtLimit) {
      setLimitWarning(true);
      return;
    }

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
    setLimitWarning(false);
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
    <Dialog
      onClose={onClose}
      labelledBy="saved-scenarios-title"
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      panelClassName="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
    >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Bookmark className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="saved-scenarios-title" className="text-base font-bold text-slate-900">Saved Deal Scenarios</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  isPro
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : scenarios.length >= FREE_LIMIT
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {scenarios.length} / {isPro ? '∞ Unlimited' : `${FREE_LIMIT} (Free)`}
                </span>
              </div>
              <p className="text-xs text-slate-600">Stored locally in your browser. Zero cloud tracking.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close saved scenarios"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Limit Warning Banner if at limit */}
        {limitWarning && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <Lock className="size-4 text-amber-700 shrink-0" />
              <span>Free tier is limited to 3 saved scenarios. Upgrade to Pro for unlimited client storage.</span>
            </div>
            {onUpgradePro && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpgradePro();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        )}

        {/* Save Current Form */}
        <form onSubmit={handleSaveCurrent} className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name this scenario (e.g. 750k Property @ 6.5%)..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all shadow-2xs"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="size-3.5" />
            <span>Save Scenario</span>
          </button>
        </form>

        {showSavedToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <Check className="size-3.5 text-emerald-700" />
            <span>Scenario saved to browser storage!</span>
          </div>
        )}

        {/* Side-by-Side Compare Panel if 2 selected */}
        {comparedScenarios.length === 2 && (
          <div className="p-4 bg-indigo-50/50 border-b border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="size-3.5" />
                <span>Side-by-Side Comparison</span>
              </span>
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 underline cursor-pointer font-medium"
              >
                Clear Compare
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {comparedScenarios.map((sc) => (
                <div key={sc.id} className="p-3 rounded-xl bg-white border border-indigo-200 shadow-2xs">
                  <div className="font-semibold text-slate-900 text-xs truncate">{sc.name}</div>
                  <div className="text-sm font-black text-indigo-700 mt-1">{sc.metrics.headline}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{sc.metrics.subline}</div>
                  <button
                    onClick={() => handleSelectScenario(sc)}
                    className="mt-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
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
              <p className="text-xs font-medium">No saved scenarios yet.</p>
              <p className="text-[11px] text-slate-500">
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
                  className="group p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {sc.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                        <Calendar className="size-3" />
                        {sc.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="font-semibold text-slate-900">{sc.metrics.headline}</span>
                      <span className="text-slate-600 text-[11px]">{sc.metrics.subline}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => toggleCompare(sc.id, e)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        isComparing
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
                          : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border-slate-300 font-semibold'
                      }`}
                      title="Compare with another scenario"
                    >
                      {isComparing ? 'Comparing' : 'Compare'}
                    </button>
                    <button
                      onClick={(e) => handleDelete(sc.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
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
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>{scenarios.length} saved scenario{scenarios.length === 1 ? '' : 's'}</span>
          <span className="text-[11px]">Select any item to instantly load into calculator</span>
        </div>
    </Dialog>
  );
}
