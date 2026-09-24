import React, { useState } from 'react';
import {
  FolderKanban,
  X,
  Search,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { Dialog } from '@tableview/ui';
import {
  getAllSavedDeals,
  deleteSavedDeal,
  renameSavedDeal,
  type AggregatedSavedDeal,
} from '../lib/savedDealsManager';
import { navigateTo } from '../lib/router';
import { useAuth } from '../lib/useAuth';
import { trackUserClick } from '../lib/sentry';

interface MySavedDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradePro?: () => void;
}

export const MySavedDealsModal: React.FC<MySavedDealsModalProps> = ({
  isOpen,
  onClose,
  onUpgradePro,
}) => {
  const { isPro } = useAuth();
  const [deals, setDeals] = useState<AggregatedSavedDeal[]>(() => getAllSavedDeals());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadDeals = () => {
    setDeals(getAllSavedDeals());
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Deals' },
    { id: 'dscr', label: 'DSCR' },
    { id: 'mortgage', label: 'Mortgage' },
    { id: 'refinance', label: 'Refinance' },
    { id: 'caprate', label: 'Cap Rate' },
    { id: 'hardmoney', label: 'Hard Money' },
    { id: 'commercial', label: 'Commercial' },
  ];

  const filteredDeals = deals.filter((deal) => {
    const matchesCategory = selectedCategory === 'all' || deal.calculatorId === selectedCategory;
    const matchesQuery =
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.calculatorTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.metrics.headline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleDelete = (deal: AggregatedSavedDeal) => {
    trackUserClick('my_saved_deals_delete', { dealId: deal.id, calculator: deal.calculatorId });
    deleteSavedDeal(deal.calculatorId, deal.id);
    loadDeals();
  };

  const handleStartRename = (deal: AggregatedSavedDeal) => {
    setEditingId(deal.id);
    setEditingName(deal.name);
  };

  const handleSaveRename = (deal: AggregatedSavedDeal) => {
    if (editingName.trim()) {
      renameSavedDeal(deal.calculatorId, deal.id, editingName.trim());
      loadDeals();
    }
    setEditingId(null);
  };

  const handleOpenDeal = (deal: AggregatedSavedDeal) => {
    trackUserClick('my_saved_deals_open', { dealId: deal.id, route: deal.route });
    try {
      // Store in session storage so calculator can automatically hydrate
      sessionStorage.setItem(`pending_load_scenario_${deal.calculatorId}`, JSON.stringify(deal.data));
    } catch {}
    onClose();
    navigateTo(deal.route);
  };

  const handleShareClientView = (deal: AggregatedSavedDeal) => {
    trackUserClick('my_saved_deals_share_client', { dealId: deal.id });
    const shareUrl = `${window.location.origin}/share/${deal.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(deal.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <Dialog
      onClose={onClose}
      labelledBy="saved-deals-title"
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      panelClassName="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <FolderKanban className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="saved-deals-title" className="text-lg font-bold text-white tracking-tight">
                My Saved Deal Scenarios
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                {deals.length} {deals.length === 1 ? 'Deal' : 'Deals'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Manage, compare, and re-underwrite all your institutional scenarios across TableView calculators.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Pro Upgrade Callout if Free user has 3+ deals */}
        {!isPro && deals.length >= 3 && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-indigo-950 font-medium">
              <Sparkles className="size-4 text-indigo-600 shrink-0" />
              <span>
                You have saved <strong>{deals.length} deals</strong> (Free tier quota: 3 deals per calculator).
                Upgrade to <strong>TableView Pro</strong> for unlimited portfolio archiving and white-label client shares.
              </span>
            </div>
            {onUpgradePro && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpgradePro();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-2xs cursor-pointer"
              >
                Upgrade to Pro →
              </button>
            )}
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title or metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deals List */}
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <FolderKanban className="size-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No saved scenarios found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? 'No deals match your search criteria. Try a different search term.'
                : 'Click "Save Scenario" inside any calculator to preserve your debt parameters and underwriting deliverables.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
            {filteredDeals.map((deal) => {
              const isEditing = editingId === deal.id;
              const isCopied = copiedId === deal.id;

              return (
                <div
                  key={deal.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {deal.calculatorTitle}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{deal.date}</span>
                    </div>

                    {/* Name Edit in place */}
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-indigo-500 rounded font-semibold text-slate-900 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(deal);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(deal)}
                          className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                        >
                          <Check className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group pt-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate pr-2">{deal.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleStartRename(deal)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 transition-opacity cursor-pointer"
                          title="Rename scenario"
                        >
                          <Edit2 className="size-3" />
                        </button>
                      </div>
                    )}

                    {/* Key Metrics Display */}
                    {(deal.metrics.headline || deal.metrics.subline) && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-bold font-mono text-indigo-900 truncate">
                          {deal.metrics.headline}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {deal.metrics.subline}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(deal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete scenario"
                      >
                        <Trash2 className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareClientView(deal)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Copy interactive client share link"
                      >
                        <Share2 className="size-3" />
                        <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDeal(deal)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Load in Calculator</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
};
