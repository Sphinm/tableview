import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  CheckCircle2,
  Sparkles,
  Flame,
  Lock,
  ArrowRight,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { trackUserClick } from '../lib/sentry';
import { updatePageMeta } from '../lib/router';
import { STATIC_PAGE_META } from '../data/routeMeta';
import { BILLING_CONFIG } from '../config/billing';

export const PricingPage: React.FC = () => {
  const { user, openAuthModal, startCheckout, upgradePlan, purchaseSinglePass, isPro, hasDealPass } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('year');
  const [isProcessing, setIsProcessing] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const meta = STATIC_PAGE_META['/pricing'] || {
      title: 'Pricing & Plans | TableView Institutional Underwriting Suite',
      description:
        'Transparent, value-driven pricing. 10+ free calculators with 100% in-browser privacy, $9.99 Single Deal Pass, or TableView Pro ($19/mo) for unlimited white-label deliverables.',
      canonical: '/pricing',
    };
    updatePageMeta(meta.title, meta.description, `https://tableview.dev/pricing`);
  }, []);

  const handleCheckoutSinglePass = async () => {
    trackUserClick('pricing_page_single_pass_click', { logged_in: Boolean(user) });

    if (BILLING_CONFIG.PUBLIC_BETA_FREE_ACCESS) {
      if (!user) {
        openAuthModal({
          reason: 'Please sign in with Google to claim your free Single Deal Pass during public beta.',
          onSuccess: async () => {
            setIsProcessing(true);
            await purchaseSinglePass('general_deal');
            setIsProcessing(false);
            setSuccessBanner('🎉 Single Deal Pass unlocked free during public beta!');
          },
        });
        return;
      }
      setIsProcessing(true);
      await purchaseSinglePass('general_deal');
      setIsProcessing(false);
      setSuccessBanner('🎉 Single Deal Pass unlocked free during public beta!');
      return;
    }

    if (!user) {
      openAuthModal({
        reason: 'Please sign in with Google to purchase a Single Deal Pass.',
        onSuccess: async () => {
          setIsProcessing(true);
          await startCheckout({ productKey: 'deal_pass', dealId: 'general_deal' });
          setIsProcessing(false);
        },
      });
      return;
    }
    setIsProcessing(true);
    await startCheckout({ productKey: 'deal_pass', dealId: 'general_deal' });
    setIsProcessing(false);
  };

  const handleCheckoutPro = async () => {
    trackUserClick('pricing_page_upgrade_pro_click', { billingCycle, logged_in: Boolean(user) });

    if (BILLING_CONFIG.PUBLIC_BETA_FREE_ACCESS) {
      if (!user) {
        openAuthModal({
          reason: `Please sign in with Google to activate your free TableView Pro (${billingCycle === 'month' ? 'Monthly' : 'Annual'}) access during public beta.`,
          onSuccess: async () => {
            setIsProcessing(true);
            await upgradePlan('pro');
            setIsProcessing(false);
            setSuccessBanner(`🎉 TableView Pro (${billingCycle === 'month' ? 'Monthly' : 'Annual'}) activated free! Full institutional deliverables unlocked during our compliance review period.`);
          },
        });
        return;
      }
      setIsProcessing(true);
      await upgradePlan('pro');
      setIsProcessing(false);
      setSuccessBanner(`🎉 TableView Pro (${billingCycle === 'month' ? 'Monthly' : 'Annual'}) activated free! Full institutional deliverables unlocked during our compliance review period.`);
      return;
    }

    if (!user) {
      openAuthModal({
        reason: `Please sign in with Google to upgrade to TableView Pro (${billingCycle === 'month' ? 'Monthly' : 'Annual'}).`,
        onSuccess: async () => {
          setIsProcessing(true);
          await startCheckout({ productKey: 'pro_membership', interval: billingCycle });
          setIsProcessing(false);
        },
      });
      return;
    }
    setIsProcessing(true);
    await startCheckout({ productKey: 'pro_membership', interval: billingCycle });
    setIsProcessing(false);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'What is the core difference between Free, Single Deal Pass, and Pro?',
      a: 'All 10+ financial calculators and sensitivity models are 100% free to calculate and adjust in your browser. Single Deal Pass ($9.99 one-time) unlocks an official watermark-free 4-page CFPB QM PDF Dossier and dynamic formula Excel sheet for a single deal. TableView Pro ($19/mo or $149/yr) gives loan officers and brokers unlimited exports for all deals, custom white-label branding, interactive client share links, and unlimited deal scenario saving.',
    },
    {
      q: 'Do you store or sell my client financial information?',
      a: 'Never. TableView runs on a 100% client-side WebAssembly and JavaScript architecture. Your purchase prices, borrower income, loan terms, and deal memos execute locally in your browser and are never transmitted to our servers or sold to lead-generation brokers.',
    },
    {
      q: 'How does Custom White-Label Brokerage Branding work?',
      a: 'With TableView Pro, you can upload your brokerage or advisory logo, agent headshot, NMLS license number, phone, email, and custom legal disclosures. These dynamically replace all TableView branding on every printed PDF Dossier, Excel export, and client share page.',
    },
    {
      q: 'Can I purchase just a Single Deal Pass without a monthly subscription?',
      a: 'Yes! Single Deal Pass is a strictly one-time payment of $9.99. It grants lifetime access and re-download rights to the institutional deliverables (PDF Pre-Approval Dossier + Full Formula Excel) for that specific property scenario.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We process payments securely via Dodo Payments with bank-grade 256-bit SSL encryption. We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay.',
    },
    {
      q: 'Can I cancel my TableView Pro subscription anytime?',
      a: 'Yes, with a single click. When you cancel, you will retain full Pro access until the end of your prepaid billing period with zero cancellation penalties or hidden fees.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold tracking-tight shadow-2xs">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Transparent, Practitioner-First Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Enterprise Financial Modeling.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900">
              Zero Subscription Traps.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            All 10+ underwriting calculators are <strong>100% free</strong> with local privacy. Pay only when you need official institutional deliverables, custom white-label branding, or high-volume workflows.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle('month')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'month'
                    ? 'bg-white text-indigo-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('year')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'year'
                    ? 'bg-white text-indigo-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Save 35%
                </span>
              </button>
            </div>
          </div>

          {/* Public Beta Announcement Banner */}
          {BILLING_CONFIG.PUBLIC_BETA_FREE_ACCESS && (
            <div className="pt-3 max-w-xl mx-auto">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-indigo-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">
                    <Sparkles className="size-4 text-amber-300" />
                  </div>
                  <div className="text-left">
                    <span className="font-extrabold text-white text-xs block">
                      🎁 Public Beta: 100% Free Unlocked Access
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Merchant gateway under compliance review. All single passes &amp; Pro deliverables are free to claim!
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400 text-emerald-950 shrink-0">
                  Free During Beta
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main 3-Column Plan Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-10">
        {/* Success Alert */}
        {successBanner && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <span>{successBanner}</span>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* Active Plan Banner */}
        {isPro ? (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs sm:text-sm font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-5 text-amber-500 shrink-0" />
              <div>
                <span>
                  <strong>TableView Pro ({user?.billingInterval === 'year' ? 'Annual Plan' : 'Monthly Plan'}) Active</strong>
                  {' — '}You have unlimited watermark-free PDF dossiers, formula Excel spreadsheets, and custom white-label branding.
                </span>
                {user?.currentPeriodEnd && (
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Current period valid through: {new Date(user.currentPeriodEnd).toLocaleDateString()}
                    {user.cancelAtPeriodEnd ? ' (cancels at period end)' : ' (auto-renews)'}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                  user?.billingInterval === 'year'
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {user?.billingInterval === 'year' ? 'Pro Annual' : 'Pro Monthly'}
              </span>
            </div>
          </div>
        ) : user?.purchasedDossiers && user.purchasedDossiers.length > 0 ? (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div>
                <span>
                  <strong>Single Deal Pass Active ({user.purchasedDossiers.length} deal{user.purchasedDossiers.length > 1 ? 's' : ''})</strong>
                  {' — '}You have lifetime access to official CFPB QM PDFs and dynamic Excel models for your unlocked deals.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-900 border border-emerald-300 shrink-0">
              Deal Pass ($9.99)
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Starter / Free */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Starter Tier
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  Always Free
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">In-Browser Hub</h3>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                For home buyers, property shoppers, and financial students running initial math.
              </p>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl font-black font-mono text-slate-950">$0</span>
                <span className="text-xs text-slate-500 font-medium">forever · no credit card required</span>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Included Free Features:
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>10+ Institutional Calculators:</strong> Mortgage, DSCR, Cap Rate, BRRRR, 1031</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Real-Time Sensitivity Tables:</strong> Unlimited parameter adjustments</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>AI Deal Copilot:</strong> Parse unstructured property memos to numbers</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>100% In-Browser Privacy:</strong> Zero spam calls, zero data selling</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Local Scenario Storage:</strong> Up to 3 saved deals per calculator</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <Lock className="size-3.5 shrink-0 mt-0.5" />
                    <span>Watermark-free institutional PDF dossiers</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <Lock className="size-3.5 shrink-0 mt-0.5" />
                    <span>Full formula Excel spreadsheets (.xlsx)</span>
                  </li>
                </ul>
              </div>
            </div>

            <a
              href="/finance-calculator"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors text-center inline-flex items-center justify-center gap-2"
            >
              <span>Explore All Free Calculators</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>

          {/* Card 2: Single Deal Pass */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Pay-As-You-Go
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-semibold">
                  1 Specific Deal
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Single Deal Pass</h3>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                For home buyers closing on a loan or investors submitting an offer on a single property.
              </p>

              {BILLING_CONFIG.PUBLIC_BETA_FREE_ACCESS ? (
                <div className="flex flex-col gap-0.5 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-mono text-emerald-600">$0</span>
                    <span className="text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Free During Beta
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 line-through">Standard: $9.99 one-time payment</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl font-black font-mono text-slate-950">$9.99</span>
                  <span className="text-xs text-slate-500 font-medium">one-time payment · lifetime access</span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-5 space-y-3 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Included in Single Deal Pass:
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Official 4-Page CFPB QM PDF:</strong> Clean, watermark-free underwriter packet</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Full Formula Excel (.xlsx):</strong> Dynamic 360-month PMT, IPMT & PPMT formulas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>CFPB QM 28/43% DTI Audit:</strong> Qualified mortgage compliance validation</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Itemized Cash-to-Close Audit:</strong> Prepaid interest, points & escrow reserves</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Lifetime Access:</strong> Modify and re-download anytime for this deal</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <Lock className="size-3.5 shrink-0 mt-0.5" />
                    <span>White-label broker branding (Pro only)</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <Lock className="size-3.5 shrink-0 mt-0.5" />
                    <span>Interactive client share links (Pro only)</span>
                  </li>
                </ul>
              </div>
            </div>

            {(() => {
              const hasGeneralDealPass = hasDealPass('general_deal') || Boolean(user?.purchasedDossiers && user.purchasedDossiers.length > 0);
              const isLocked = isPro || hasGeneralDealPass;
              return (
                <button
                  type="button"
                  disabled={isProcessing || isLocked}
                  onClick={isLocked ? undefined : handleCheckoutSinglePass}
                  className={clsx(
                    "w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-colors text-center inline-flex items-center justify-center gap-2",
                    isLocked
                      ? "bg-slate-100 text-slate-500 border border-slate-200 cursor-default"
                      : "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer disabled:opacity-60"
                  )}
                >
                  <span>
                    {isPro
                      ? 'Included in Pro (Unlimited)'
                      : hasGeneralDealPass
                      ? 'Deal Pass Active (Unlocked)'
                      : BILLING_CONFIG.PUBLIC_BETA_FREE_ACCESS
                      ? 'Unlock Free Deal Pass ($0 Beta)'
                      : 'Get Single Deal Pass ($9.99)'}
                  </span>
                  {!isLocked && <ArrowRight className="size-3.5" />}
                </button>
              );
            })()}
          </div>

          {/* Card 3: TableView Pro */}
          <div className="rounded-3xl border-2 border-indigo-600 bg-gradient-to-b from-indigo-50/50 via-white to-white p-7 sm:p-8 flex flex-col justify-between shadow-xl relative ring-1 ring-indigo-600/30">
            <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Flame className="size-3 text-amber-300" />
              Most Popular · Full Suite
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono">
                  Pro Membership
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold">
                  Unlimited Power
                </span>
              </div>
              <h3 className="text-2xl font-black text-indigo-950 mb-2 flex items-center gap-2">
                <span>TableView Pro</span>
                <Sparkles className="size-5 text-indigo-600" />
              </h3>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                For Mortgage Loan Officers, Real Estate Brokers, Wholesalers, and Active Sponsors.
              </p>

              {BILLING_CONFIG.PUBLIC_BETA_FREE_ACCESS ? (
                <div className="flex flex-col gap-0.5 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-mono text-indigo-950">$0</span>
                    <span className="text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Free During Beta
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 line-through">
                    Standard: ${billingCycle === 'year' ? '12.40/mo ($149/yr)' : '$19.00/mo'}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black font-mono text-indigo-950">
                    ${billingCycle === 'year' ? '12.40' : '19.00'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / month {billingCycle === 'year' ? '(billed $149/year)' : '(billed monthly)'}
                  </span>
                </div>
              )}

              <div className="border-t border-indigo-100 pt-5 space-y-3 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                  Everything in Single Pass, Plus:
                </div>
                <ul className="space-y-3 text-xs text-slate-800">
                  <li className="flex items-start gap-2.5 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Unlimited Watermark-Free PDFs:</strong> For every calculator and client deal</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Unlimited Dynamic Excel Models:</strong> Live PMT formulas with no download caps</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>White-Label Brokerage Branding:</strong> Your company logo, headshot, NMLS #</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Interactive Client Share Pages:</strong> Client sliders with your agent card</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Unlimited Saved Scenarios:</strong> Cross-deal comparative portfolio library</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Priority Financial Desk:</strong> Direct support & priority feature requests</span>
                  </li>
                </ul>
              </div>
            </div>

            {(() => {
              const isYearlyPro = isPro && user?.billingInterval === 'year';
              const isMonthlyPro = isPro && user?.billingInterval === 'month';
              const canUpgradeToYearly = isMonthlyPro && billingCycle === 'year';
              const isCurrentPlanActive = isYearlyPro || (isMonthlyPro && billingCycle === 'month') || (isPro && !canUpgradeToYearly);

              return (
                <button
                  type="button"
                  disabled={isProcessing || isCurrentPlanActive}
                  onClick={isCurrentPlanActive ? undefined : handleCheckoutPro}
                  className={clsx(
                    "w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all text-center inline-flex items-center justify-center gap-2",
                    isCurrentPlanActive
                      ? "bg-emerald-600 text-white cursor-default shadow-xs"
                      : canUpgradeToYearly
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-amber-500/25 cursor-pointer disabled:opacity-60"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-500/25 cursor-pointer disabled:opacity-60"
                  )}
                >
                  {isProcessing ? (
                    <span>Activating Pro Access...</span>
                  ) : isYearlyPro ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>Pro Annual Active (Current Plan)</span>
                    </>
                  ) : isMonthlyPro ? (
                    billingCycle === 'year' ? (
                      <>
                        <span>Switch to Annual ($149/yr · Save 35%)</span>
                        <Sparkles className="size-4 text-amber-200" />
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        <span>Pro Monthly Active (Current Plan)</span>
                      </>
                    )
                  ) : isPro ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>Pro Plan Active (Current Plan)</span>
                    </>
                  ) : BILLING_CONFIG.PUBLIC_BETA_FREE_ACCESS ? (
                    <>
                      <span>Activate Free Pro ($0 Beta)</span>
                      <Sparkles className="size-4 text-amber-300" />
                    </>
                  ) : (
                    <>
                      <span>
                        Upgrade to Pro ({billingCycle === 'year' ? '$149/yr' : '$19/mo'})
                      </span>
                      <Sparkles className="size-4 text-amber-300" />
                    </>
                  )}
                </button>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Deep Feature Comparison Matrix */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <Layers className="size-3.5 text-indigo-600" />
            <span>Side-by-Side Breakdown</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Detailed Capability Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Know exactly what you can do for free and when an upgrade empowers your business.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs font-mono uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold">Capabilities & Features</th>
                  <th className="py-4 px-4 font-bold text-center">Free Plan</th>
                  <th className="py-4 px-4 font-bold text-center">Single Deal Pass ($9.99)</th>
                  <th className="py-4 px-4 font-bold text-center text-indigo-700 bg-indigo-50/70">TableView Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {/* Section 1: Financial Engines */}
                <tr className="bg-slate-100/40">
                  <td colSpan={4} className="py-2.5 px-6 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                    1. Core Mathematical Modeling & Engines
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">10+ Conforming & CRE Calculators</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Unlimited Free</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Unlimited Free</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited Free</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Real-Time Amortization & Sensitivity Matrix</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Unlimited Free</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Unlimited Free</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited Free</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">AI Deal Copilot Natural Language Extraction</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Included</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Included</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">100% In-Browser Privacy (No Spam / No Tracking)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Guaranteed</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Guaranteed</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Guaranteed</td>
                </tr>

                {/* Section 2: Scenarios & Comparisons */}
                <tr className="bg-slate-100/40">
                  <td colSpan={4} className="py-2.5 px-6 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                    2. Scenario Storage & Deal Management
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Saved Deal Scenarios (Browser LocalStorage)</td>
                  <td className="py-3 px-4 text-center text-slate-500">Up to 3 / calc</td>
                  <td className="py-3 px-4 text-center text-slate-500">Up to 3 / calc</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Multi-Deal Comparative Switcher</td>
                  <td className="py-3 px-4 text-center text-slate-500">Basic</td>
                  <td className="py-3 px-4 text-center text-slate-500">Basic</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Full Portfolio Desk</td>
                </tr>

                {/* Section 3: Deliverables & Exports */}
                <tr className="bg-slate-100/40">
                  <td colSpan={4} className="py-2.5 px-6 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                    3. Official Deliverables & Export Formats
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Web Print View</td>
                  <td className="py-3 px-4 text-center text-slate-500">TableView Watermarked</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Unbranded Official</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Custom White-Label</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Official CFPB QM 4-Page Pre-Approval Dossier (PDF)</td>
                  <td className="py-3 px-4 text-center text-slate-400">Locked / Watermarked</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">1 Deal (Lifetime)</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited Deals</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Full Formula Dynamic Excel Spreadsheet (.xlsx)</td>
                  <td className="py-3 px-4 text-center text-slate-400">Locked</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">1 Deal (Lifetime)</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited Deals</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Itemized Cash-to-Close & DTI Audit Ledger</td>
                  <td className="py-3 px-4 text-center text-slate-500">Summary Only</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Full Itemized</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Full Itemized</td>
                </tr>

                {/* Section 4: White-Label Branding & Client Links */}
                <tr className="bg-slate-100/40">
                  <td colSpan={4} className="py-2.5 px-6 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                    4. Institutional Branding & Client Experience
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Brokerage Logo, Agent Headshot & NMLS #</td>
                  <td className="py-3 px-4 text-center text-slate-400">—</td>
                  <td className="py-3 px-4 text-center text-slate-400">—</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Full White-Label</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Custom Legal Disclosures & TILA Notices</td>
                  <td className="py-3 px-4 text-center text-slate-400">—</td>
                  <td className="py-3 px-4 text-center text-slate-400">—</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Fully Customizable</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Client Interactive Share Links (/share/:dealId)</td>
                  <td className="py-3 px-4 text-center text-slate-400">—</td>
                  <td className="py-3 px-4 text-center text-slate-400">—</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited Lead Capture</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 font-medium">Priority Support & Feature Request Desk</td>
                  <td className="py-3 px-4 text-center text-slate-500">Community</td>
                  <td className="py-3 px-4 text-center text-slate-500">Standard Email</td>
                  <td className="py-3 px-4 text-center text-indigo-700 font-bold bg-indigo-50/30">Direct Priority 24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROI & Value Highlight */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <BadgeCheck className="size-4 text-emerald-400" />
              <span>Practitioner ROI Reality</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              One Closed Deal Pays for 10+ Years of Pro.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A single mortgage origination or real estate commission generates $3,000 to $10,000+. Presenting your clients with white-labeled, institutional-grade underwriting packages establishes trust and wins more deals against competitors using ugly ad-ridden spreadsheets.
            </p>
          </div>
          <div className="shrink-0 text-center sm:text-right">
            <button
              type="button"
              disabled={isProcessing || isPro}
              onClick={isPro ? undefined : handleCheckoutPro}
              className={clsx(
                "px-6 py-3.5 rounded-xl font-black text-xs transition-all inline-flex items-center gap-2",
                isPro
                  ? "bg-emerald-600 text-white cursor-default shadow-xs"
                  : "bg-white hover:bg-slate-100 text-indigo-950 shadow-lg active:scale-95 cursor-pointer disabled:opacity-60"
              )}
            >
              <span>{isPro ? 'Pro Plan Active (Current Plan)' : BILLING_CONFIG.PUBLIC_BETA_FREE_ACCESS ? 'Activate Free Pro ($0 Beta)' : `Upgrade to Pro (${billingCycle === 'month' ? '$19/mo' : '$12.40/mo'})`}</span>
              {!isPro && <ArrowRight className="size-4 text-indigo-600" />}
            </button>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Cancel anytime with 1 click
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <HelpCircle className="size-3.5 text-indigo-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Common Inquiries & Guarantee
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:bg-slate-50 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="size-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
