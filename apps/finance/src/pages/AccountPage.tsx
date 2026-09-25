import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  FolderKanban,
  Sparkles,
  RotateCw,
  LogOut,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Search,
  Trash2,
  Edit2,
  Check,
  Share2,
  ArrowRight,
  Lock,
  Eye,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { updatePageMeta, navigateTo, useRouter } from '../lib/router';
import { STATIC_PAGE_META } from '../data/routeMeta';
import { trackUserClick } from '../lib/sentry';
import {
  getAllSavedDeals,
  deleteSavedDeal,
  renameSavedDeal,
  type AggregatedSavedDeal,
} from '../lib/savedDealsManager';
import type { BrandingProfile } from '../lib/authTypes';
import { DossierSamplePreviewModal } from '../components/DossierSamplePreviewModal';

const DEFAULT_BRANDING_PROFILE: BrandingProfile = {
  enabled: true,
  agentName: 'Sarah Jenkins',
  companyName: 'Apex Capital & Real Estate Group',
  nmlsNumber: 'NMLS #219842',
  phone: '(415) 555-0188',
  email: 'advisory@apexcapital.example',
  website: 'www.apexrealtygroup.com',
  customDisclaimer:
    'Equal Housing Opportunity. Loan terms, rates, and approval are subject to underwriting guidelines.',
  avatarUrl: '',
  logoUrl: '',
};

export const AccountPage: React.FC = () => {
  const { user, openAuthModal, logout, syncUserStatus, startCheckout, updateBranding, isPro } = useAuth();
  const { path } = useRouter();

  // Active Tab: 'billing' | 'branding' | 'deals'
  const [activeTab, setActiveTab] = useState<'billing' | 'branding' | 'deals'>('billing');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showSampleModal, setShowSampleModal] = useState(false);

  // Saved deals state
  const [deals, setDeals] = useState<AggregatedSavedDeal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Branding form state
  const [brandingForm, setBrandingForm] = useState<BrandingProfile>(() => {
    const saved = user?.branding;
    return {
      enabled: saved?.enabled ?? DEFAULT_BRANDING_PROFILE.enabled,
      agentName:
        saved?.agentName && saved.agentName !== user?.name
          ? saved.agentName
          : (saved?.agentName || DEFAULT_BRANDING_PROFILE.agentName),
      companyName: saved?.companyName || DEFAULT_BRANDING_PROFILE.companyName,
      nmlsNumber: saved?.nmlsNumber || DEFAULT_BRANDING_PROFILE.nmlsNumber,
      phone: saved?.phone || DEFAULT_BRANDING_PROFILE.phone,
      email:
        saved?.email && saved.email !== user?.email
          ? saved.email
          : (saved?.email || DEFAULT_BRANDING_PROFILE.email),
      website: saved?.website || DEFAULT_BRANDING_PROFILE.website,
      customDisclaimer: saved?.customDisclaimer || DEFAULT_BRANDING_PROFILE.customDisclaimer,
      avatarUrl: saved?.avatarUrl || '',
      logoUrl: saved?.logoUrl || '',
    };
  });
  const [brandingSaved, setBrandingSaved] = useState(false);

  // Handle URL hash or query param for tab routing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'billing' || hash === 'branding' || hash === 'deals') {
        setActiveTab(hash);
      }
    }
  }, [path]);

  // Set page SEO meta
  useEffect(() => {
    const meta = STATIC_PAGE_META['/account'] || {
      title: 'My Account & Subscriptions | TableView.dev',
      description: 'Manage your TableView membership, billing, unlocked deals, and broker white-label branding profile.',
      canonical: '/account',
    };
    updatePageMeta(meta.title, meta.description, `https://tableview.dev/account`);
  }, []);

  // Hydrate saved deals on mount and user change
  useEffect(() => {
    setDeals(getAllSavedDeals());
  }, [user]);

  // Synchronize branding form when user branding updates
  useEffect(() => {
    if (user?.branding) {
      setBrandingForm((prev) => ({
        ...prev,
        ...user.branding,
      }));
    }
  }, [user?.branding]);

  const handleManualSync = async () => {
    trackUserClick('account_manual_sync');
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const updated = await syncUserStatus();
      if (updated) {
        setSyncFeedback('Account synchronized with live billing records.');
      } else {
        setSyncFeedback('Account status is up to date.');
      }
    } catch {
      setSyncFeedback('Sync failed. Please check your network connection.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    trackUserClick('account_save_branding');
    updateBranding(brandingForm);
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 2500);
  };

  const handleResetBrandingDefaults = () => {
    trackUserClick('account_reset_branding_defaults');
    setBrandingForm(DEFAULT_BRANDING_PROFILE);
    updateBranding(DEFAULT_BRANDING_PROFILE);
  };

  const handleDeleteDeal = (deal: AggregatedSavedDeal) => {
    trackUserClick('account_deal_delete', { dealId: deal.id, calculator: deal.calculatorId });
    deleteSavedDeal(deal.calculatorId, deal.id);
    setDeals(getAllSavedDeals());
  };

  const handleStartRename = (deal: AggregatedSavedDeal) => {
    setEditingId(deal.id);
    setEditingName(deal.name);
  };

  const handleSaveRename = (deal: AggregatedSavedDeal) => {
    if (editingName.trim()) {
      renameSavedDeal(deal.calculatorId, deal.id, editingName.trim());
      setDeals(getAllSavedDeals());
    }
    setEditingId(null);
  };

  const handleOpenDeal = (deal: AggregatedSavedDeal) => {
    trackUserClick('account_deal_open', { dealId: deal.id, route: deal.route });
    try {
      sessionStorage.setItem(`pending_load_scenario_${deal.calculatorId}`, JSON.stringify(deal.data));
    } catch {}
    navigateTo(deal.route);
  };

  const handleShareClientView = (deal: AggregatedSavedDeal) => {
    trackUserClick('account_deal_share', { dealId: deal.id });
    const shareUrl = `${window.location.origin}/share/${deal.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(deal.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

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

  // ---------------------------------------------------------------------------
  // Unauthenticated State
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in duration-200">
          <div className="size-16 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <UserIcon className="size-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account &amp; Subscriptions</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in with your Google Account to view active memberships, manage billing, access saved deal models, and configure your broker white-label profile.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                trackUserClick('account_page_signin_click');
                openAuthModal({
                  reason: 'Sign in with Google to access your TableView account dashboard.',
                });
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="size-4 text-amber-300" />
              <span>Sign In with Google</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              100% In-Browser Privacy
            </span>
            <span>•</span>
            <span>Zero Server File Storage</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Authenticated Dashboard
  // ---------------------------------------------------------------------------
  const isAnnualPro = user.plan === 'pro' && user.billingInterval === 'year';
  const isMonthlyPro = user.plan === 'pro' && user.billingInterval === 'month';
  const hasPurchasedDossiers = user.purchasedDossiers && user.purchasedDossiers.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner / Hero Profile Card */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Identity & Badges */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border border-indigo-400/40 shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User'}
                    className="size-full rounded-2xl object-cover"
                  />
                ) : (
                  <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                    {user.name || 'Financial Analyst'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <ShieldCheck className="size-3 text-emerald-400" />
                    Google Verified
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 truncate">
                  {user.email}
                </div>

                {/* Membership Badge */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {isAnnualPro ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 uppercase tracking-tight flex items-center gap-1.5 shadow-xs">
                      <Sparkles className="size-3 fill-amber-950" />
                      TableView Pro · Annual Member
                    </span>
                  ) : isMonthlyPro ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white uppercase tracking-tight flex items-center gap-1.5 shadow-xs">
                      <Sparkles className="size-3 text-amber-300" />
                      TableView Pro · Monthly Member
                    </span>
                  ) : hasPurchasedDossiers ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-emerald-950 uppercase tracking-tight flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="size-3" />
                      Single Deal Pass Active ({user.purchasedDossiers?.length})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-tight">
                      Free Starter Plan
                    </span>
                  )}

                  <span className="text-xs text-slate-400">
                    {user.credits ?? 30} / 30 Free AI Copilot Credits Remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Sync & Logout) */}
            <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Sync latest subscription status with Cloudflare D1 & Dodo Payments"
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-bold border border-slate-700/80 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RotateCw className={`size-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Status'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  trackUserClick('account_sign_out');
                  logout();
                  navigateTo('/');
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Sync notification feedback */}
          {syncFeedback && (
            <div className="mt-4 p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveTab('billing');
              window.location.hash = 'billing';
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'billing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="size-4" />
            <span>Subscription &amp; Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('branding');
              window.location.hash = 'branding';
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'branding'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="size-4" />
            <span>Broker White-Label Branding</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('deals');
              window.location.hash = 'deals';
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'deals'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderKanban className="size-4" />
            <span>Saved Scenarios &amp; Deals</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeTab === 'deals' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {deals.length}
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: SUBSCRIPTION & INVOICES */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'billing' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Active Plan Overview Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Current Membership Status
                  </span>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {isAnnualPro
                        ? 'TableView Pro (Annual Plan)'
                        : isMonthlyPro
                        ? 'TableView Pro (Monthly Plan)'
                        : hasPurchasedDossiers
                        ? `Single Deal Pass (${user.purchasedDossiers?.length} Deals Unlocked)`
                        : 'Free Starter Plan'}
                    </h2>
                    {isPro ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-tight flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tight">
                        Free Access
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {isPro && user.currentPeriodEnd
                      ? `Your subscription is active and valid through ${new Date(user.currentPeriodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
                      : isPro
                      ? 'Unlimited access to all institutional dossiers, vector PDFs, Excel models, and custom branding.'
                      : hasPurchasedDossiers
                      ? 'You have permanent, lifetime re-download and revision rights for your purchased deal passes.'
                      : 'Free in-browser analytical calculators with 30 free monthly AI Deal Copilot credits.'}
                  </p>
                </div>

                {/* Self-Service Billing Portal / Upgrade Link */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  {isMonthlyPro && (
                    <button
                      type="button"
                      onClick={() => {
                        trackUserClick('account_switch_to_annual_click');
                        startCheckout({ productKey: 'pro_membership', interval: 'year' });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="size-3.5 text-amber-200" />
                      <span>Switch to Annual (Save $79)</span>
                    </button>
                  )}

                  {!isPro && (
                    <button
                      type="button"
                      onClick={() => {
                        trackUserClick('account_upgrade_pro_click');
                        navigateTo('/pricing');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="size-3.5 text-amber-300" />
                      <span>Upgrade to TableView Pro</span>
                    </button>
                  )}

                  {/* Customer Portal Link for Subscriptions & Invoices */}
                  <a
                    href="https://customer.dodopayments.com/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackUserClick('account_dodo_portal_click')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Manage Invoices &amp; Billing</span>
                    <ExternalLink className="size-3 text-slate-500" />
                  </a>
                </div>
              </div>

              {/* Feature Entitlements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <FileText className="size-4 text-indigo-600" />
                    <span>Official PDF Dossiers</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {isPro
                      ? 'Unlimited 4-page CFPB QM audits, Cash-to-Close, & Amortization vectors.'
                      : hasPurchasedDossiers
                      ? 'Unlocked for your purchased deal passes with lifetime revisions.'
                      : 'Watermarked sample preview available; upgrade for official PDF exports.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <FileSpreadsheet className="size-4 text-emerald-600" />
                    <span>Excel Financial Models</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {isPro
                      ? 'Live dynamic formulas (.xlsx) without password protection.'
                      : 'Standard exports available with in-browser Excel inspection.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Building2 className="size-4 text-amber-600" />
                    <span>Broker White-Label</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {isPro
                      ? 'Custom NMLS #, firm logo, direct phone, and legal disclaimers active.'
                      : 'Configure your profile; unlocks on official reports with Pro.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Sparkles className="size-4 text-indigo-600" />
                    <span>AI Deal Copilot</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {user.credits ?? 30} credits available this month. Auto-renews every 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Lifetime Revision Archive (Single Deal Passes) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="size-5 text-indigo-600" />
                    <span>Lifetime Revision Archive (Single Deal Passes)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our Lifetime Revision Guarantee ensures any deal pass purchased can be revised and re-downloaded at any time.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Eye className="size-3.5 text-indigo-600" />
                  <span>Preview 4-Page Dossier Sample</span>
                </button>
              </div>

              {hasPurchasedDossiers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.purchasedDossiers?.map((dealId, idx) => (
                    <div
                      key={dealId || idx}
                      className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            Deal Pass: {dealId.replace(/_/g, ' ')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-200 text-emerald-950 uppercase tracking-tight">
                            Lifetime Active
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Permanent re-downloads &amp; parameter revisions unlocked.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigateTo('/finance-calculator')}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs shrink-0 cursor-pointer"
                      >
                        Open Deal
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-600">
                    No single deal passes purchased yet. When you purchase a $9.99 Single Deal Pass, it will be stored here with permanent revision rights.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => navigateTo('/pricing')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore Pricing &amp; Passes</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: BROKER WHITE-LABEL BRANDING */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            {/* Left: Branding Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="size-5 text-indigo-600" />
                    <span>Brokerage Credential &amp; Brand Settings</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize the letterhead, NMLS license info, and contact card shown on exported PDF reports.
                  </p>
                </div>

                {!isPro && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-tight flex items-center gap-1">
                    <Lock className="size-2.5" />
                    Pro Feature
                  </span>
                )}
              </div>

              {!isPro && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold block">White-Label Branding unlocks with TableView Pro</span>
                    <span className="text-amber-800">
                      You can configure your branding now. It will appear live on all official PDF dossiers once upgraded.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('/pricing')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs shrink-0 cursor-pointer active:scale-95"
                  >
                    Upgrade to Pro ($19/mo)
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveBranding} className="space-y-4">
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Apply Branding to Client Deliverables</span>
                    <span className="text-[11px] text-slate-500">
                      Embed your brokerage card on PDF dossier cover pages and client share views.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="branding-toggle"
                    checked={brandingForm.enabled}
                    onChange={(e) => setBrandingForm({ ...brandingForm, enabled: e.target.checked })}
                    className="size-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="agent-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Broker / Advisor Name
                    </label>
                    <input
                      type="text"
                      id="agent-name"
                      value={brandingForm.agentName}
                      onChange={(e) => setBrandingForm({ ...brandingForm, agentName: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="company-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Brokerage / Firm Name
                    </label>
                    <input
                      type="text"
                      id="company-name"
                      value={brandingForm.companyName}
                      onChange={(e) => setBrandingForm({ ...brandingForm, companyName: e.target.value })}
                      placeholder="e.g. Apex Capital Advisory"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="nmls-number" className="block text-xs font-bold text-slate-700 mb-1">
                      NMLS / Broker License #
                    </label>
                    <input
                      type="text"
                      id="nmls-number"
                      value={brandingForm.nmlsNumber || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, nmlsNumber: e.target.value })}
                      placeholder="e.g. NMLS #219842"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                      Direct Phone
                    </label>
                    <input
                      type="text"
                      id="phone"
                      value={brandingForm.phone}
                      onChange={(e) => setBrandingForm({ ...brandingForm, phone: e.target.value })}
                      placeholder="e.g. (415) 555-0188"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                      Client Contact Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={brandingForm.email}
                      onChange={(e) => setBrandingForm({ ...brandingForm, email: e.target.value })}
                      placeholder="e.g. advisory@firm.example"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-xs font-bold text-slate-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      id="website"
                      value={brandingForm.website || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, website: e.target.value })}
                      placeholder="e.g. www.apexrealtygroup.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="disclaimer" className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Compliance Disclaimer
                  </label>
                  <textarea
                    id="disclaimer"
                    rows={2}
                    value={brandingForm.customDisclaimer || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, customDisclaimer: e.target.value })}
                    placeholder="Equal Housing Opportunity. Loan terms, rates, and approval are subject to underwriting guidelines."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetBrandingDefaults}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    Reset to Defaults
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {brandingSaved ? (
                      <>
                        <Check className="size-3.5 text-emerald-300" />
                        <span>Saved Successfully!</span>
                      </>
                    ) : (
                      <span>Save Branding Profile</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Live Interactive Deliverable Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-300">
                    <Eye className="size-3.5" />
                    <span>Real-Time PDF Dossier Preview</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    Page 1 Header
                  </span>
                </div>

                {/* Simulated Document Preview Card */}
                <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-md border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                        TV
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase text-slate-900 tracking-tight">
                          Institutional Underwriting Dossier
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          Prepared for Primary Underwriter
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      CFPB QM AUDIT
                    </span>
                  </div>

                  {/* Broker Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider block">
                      Underwriter / Originating Broker
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {brandingForm.agentName || 'Your Name'}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          {brandingForm.companyName || 'Your Brokerage'}
                        </div>
                        {brandingForm.nmlsNumber && (
                          <div className="text-[10px] text-indigo-700 font-mono font-semibold">
                            {brandingForm.nmlsNumber}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-[10px] text-slate-500 space-y-0.5">
                        {brandingForm.phone && <div>{brandingForm.phone}</div>}
                        {brandingForm.email && <div className="truncate max-w-[120px]">{brandingForm.email}</div>}
                        {brandingForm.website && <div className="text-indigo-600 truncate max-w-[120px]">{brandingForm.website}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Simulated Metric Callout */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <div className="text-[9px] text-slate-500 uppercase font-semibold">DTI Audit</div>
                      <div className="text-xs font-bold text-slate-900">24.2% / 36.8%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100">
                      <div className="text-[9px] text-slate-500 uppercase font-semibold">Cash to Close</div>
                      <div className="text-xs font-bold text-slate-900">$128,450</div>
                    </div>
                  </div>

                  {/* Footer Disclaimer */}
                  <p className="text-[8px] text-slate-400 italic leading-snug border-t border-slate-100 pt-2">
                    {brandingForm.customDisclaimer || DEFAULT_BRANDING_PROFILE.customDisclaimer}
                  </p>
                </div>

                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  This card appears prominently on the cover of all official PDF deliverables and in shared client underwriting links.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: SAVED SCENARIOS & DEALS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'deals' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FolderKanban className="size-5 text-indigo-600" />
                  <span>My Saved Calculation Scenarios ({deals.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved underwriting models across Mortgage, Refinance, DSCR, Cap Rate, and CRE calculators.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="size-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Deals Grid */}
            {filteredDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeals.map((deal) => {
                  const isEditing = editingId === deal.id;
                  const isCopied = copiedId === deal.id;

                  return (
                    <div
                      key={deal.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            {deal.calculatorTitle}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {deal.date}
                          </span>
                        </div>

                        {/* Title or Editable Title */}
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-2.5 py-1 text-xs rounded-lg border border-indigo-500 focus:outline-none flex-1 font-bold"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(deal)}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              <Check className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {deal.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleStartRename(deal)}
                              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              title="Rename scenario"
                            >
                              <Edit2 className="size-3" />
                            </button>
                          </div>
                        )}

                        {/* Headline Metrics */}
                        {deal.metrics.headline && (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{deal.metrics.headline}</span>
                            <span className="text-slate-500 text-[11px]">{deal.metrics.subline}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleShareClientView(deal)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copy client share link"
                          >
                            <Share2 className="size-3" />
                            <span>{isCopied ? 'Link Copied!' : 'Share Link'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDeal(deal)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete scenario"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenDeal(deal)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <span>Open in Calculator</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FolderKanban className="size-10 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">No saved scenarios found</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Save your deal parameters in any calculator to store them for quick recall, comparison, and client sharing.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTo('/mortgage-calculator')}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer"
                  >
                    Open Mortgage Calculator
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('/dscr-loan-calculator')}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-2xs cursor-pointer"
                  >
                    Open DSCR Calculator
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4-Page Dossier Sample Preview Modal */}
      <DossierSamplePreviewModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
      />
    </div>
  );
};
