import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  Flame,
  FileSpreadsheet,
  FileText,
  Building2,
  Share2,
  Layers,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Dialog } from '@tableview/ui';
import { useAuth } from '../lib/useAuth';
import { trackUserClick } from '../lib/sentry';

interface PricingUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId?: string;
  dealTitle?: string;
  initialInterval?: 'month' | 'year';
  onOpenBrandingSettings?: () => void;
}

export const PricingUpgradeModal: React.FC<PricingUpgradeModalProps> = ({
  isOpen,
  onClose,
  dealId = 'general_deal',
  dealTitle,
  initialInterval = 'year',
  onOpenBrandingSettings,
}) => {
  const { user, openAuthModal, startCheckout, isPro } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>(initialInterval);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  if (!isOpen) return null;

  const handleBuySinglePass = async () => {
    trackUserClick('modal_pricing_buy_single_pass_click', { dealId, logged_in: Boolean(user) });
    if (!user) {
      openAuthModal({
        reason: 'Please sign in with Google to purchase a Single Deal Pass.',
        onSuccess: async () => {
          setIsProcessing(true);
          await startCheckout({ productKey: 'deal_pass', dealId });
          setIsProcessing(false);
        },
      });
      return;
    }
    setIsProcessing(true);
    await startCheckout({ productKey: 'deal_pass', dealId });
    setIsProcessing(false);
  };

  const handleUpgradePro = async () => {
    trackUserClick('modal_pricing_upgrade_pro_click', { billingCycle, logged_in: Boolean(user) });
    if (!user) {
      openAuthModal({
        reason: 'Please sign in with Google to upgrade to TableView Pro.',
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

  return (
    <Dialog
      onClose={onClose}
      labelledBy="pricing-modal-title"
      overlayClassName="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center animate-in fade-in duration-200"
      panelClassName="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
    >
      {/* Modal Top Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="size-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="pricing-modal-title" className="text-lg font-bold text-white tracking-tight">
                Unlock Institutional Underwriting
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-amber-950">
                Transparent Pricing
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {dealTitle
                ? `Deliverables & Pro upgrade for: ${dealTitle}`
                : '100% In-Browser Privacy · No Hidden Fees · Cancel Anytime'}
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

      <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Core Value Notice: What is Free vs Paid */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <Zap className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">How TableView Pricing Works:</span>
              <p className="text-slate-600 mt-0.5">
                All <strong>10+ core financial calculators</strong> and math modeling are <strong>100% Free</strong>. You only pay for institutional deliverables (PDF Pre-Approval Dossiers, live formula Excel models, and custom white-label branding).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Single Deal Pass */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  One-Time Purchase
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  Single Property
                </span>
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-1">Single Deal Pass</h4>
              <p className="text-xs text-slate-600 mb-4">
                For home buyers or investors closing on one specific property.
              </p>

              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-3xl font-black font-mono text-slate-900">$9.99</span>
                <span className="text-xs text-slate-500 font-medium">one-time payment (no recurring fees)</span>
              </div>

              <div className="border-t border-slate-100 pt-4 mb-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  What You Get:
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Official 4-Page PDF Dossier</strong> with zero watermark</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Full Formula Excel (.xlsx)</strong> with live 360-month PMT formulas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>CFPB QM 28/43% DTI Audit</strong> & Itemized Cash-to-Close breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Lifetime re-access & download for this deal</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-400">
                    <Lock className="size-3.5 shrink-0 mt-0.5" />
                    <span>Custom White-Label Brokerage Branding (Pro only)</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleBuySinglePass}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Connecting to Secure Checkout...</span>
              ) : (
                <>
                  <span>Get Single Deal Pass ($9.99)</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Option 2: TableView Pro */}
          <div className="relative rounded-2xl border-2 border-indigo-600 bg-gradient-to-b from-indigo-50/40 via-white to-white p-6 flex flex-col justify-between shadow-lg ring-1 ring-indigo-600/20">
            <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Flame className="size-3 text-amber-300" />
              Most Popular · Save 35%
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono">
                  Pro Membership
                </span>
                {/* Billing Cycle Toggle */}
                <div className="flex items-center p-0.5 rounded-lg bg-indigo-100 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('month')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      billingCycle === 'month' ? 'bg-white text-indigo-900 shadow-2xs font-bold' : 'text-indigo-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('year')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      billingCycle === 'year' ? 'bg-white text-indigo-900 shadow-2xs font-bold' : 'text-indigo-600'
                    }`}
                  >
                    Annual (-35%)
                  </button>
                </div>
              </div>

              <h4 className="text-xl font-black text-indigo-950 mb-1 flex items-center gap-1.5">
                <span>TableView Pro</span>
                <Sparkles className="size-4 text-indigo-600" />
              </h4>
              <p className="text-xs text-slate-600 mb-4">
                For loan officers, real estate agents, and active investors.
              </p>

              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl font-black font-mono text-indigo-950">
                  ${billingCycle === 'year' ? '12.40' : '19.00'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / month {billingCycle === 'year' && '(billed $149/year)'}
                </span>
              </div>

              <div className="border-t border-indigo-100 pt-4 mb-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 mb-2">
                  Everything in Single Pass, Plus:
                </div>
                <ul className="space-y-2.5 text-xs text-slate-800">
                  <li className="flex items-start gap-2 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Unlimited PDF Dossiers:</strong> Zero watermarks on any calculation</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Unlimited Excel Models:</strong> Live dynamic PMT formula spreadsheets</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Custom White-Label Branding:</strong> Your logo, headshot, NMLS #</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Client Interactive Share Links:</strong> Direct lead-conversion memos</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Unlimited Saved Scenarios:</strong> Multi-deal comparison library</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleUpgradePro}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Connecting to Secure Checkout...</span>
              ) : (
                <>
                  <span>
                    {isPro ? 'Manage Membership' : `Upgrade to Pro (${billingCycle === 'year' ? '$149/yr' : '$19/mo'})`}
                  </span>
                  <Sparkles className="size-3.5 text-amber-300" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Comparison Accordion */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-indigo-600" />
              <span>Compare Free vs Single Deal Pass vs Pro (Detailed Feature Breakdown)</span>
            </div>
            {showMatrix ? <ChevronUp className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
          </button>

          {showMatrix && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-4 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                      <th className="py-2.5 px-3 font-semibold">Features & Capabilities</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Free ($0)</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Single Pass ($9.99)</th>
                      <th className="py-2.5 px-3 font-semibold text-center text-indigo-700 bg-indigo-50/50 rounded-t-lg">TableView Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">10+ Institutional Calculators & Modeling</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">Unlimited</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">Unlimited</td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">AI Deal Copilot Natural Language Extraction</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">Included</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">Included</td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">Included</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">100% In-Browser Privacy (Zero Data Selling)</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">Guaranteed</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">Guaranteed</td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">Guaranteed</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Saved Deal Scenarios (Local Storage)</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">Up to 3 / calc</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">Up to 3 / calc</td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Official CFPB QM PDF Dossier (Watermark-Free)</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">Locked / Watermarked</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">1 Deal (Lifetime)</td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited All Deals</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Full Formula Excel Spreadsheet (.xlsx)</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">Locked</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">1 Deal (Lifetime)</td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited All Deals</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">White-Label Branding (Brokerage Logo, NMLS, Card)</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">Full White-Label</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Client Interactive Share Links (/share/:dealId)</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">Unlimited Leads</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Trust & Guarantee Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>🔒 Bank-grade 256-bit encryption. Powered by Dodo Payments.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Cards, Apple Pay & Google Pay</span>
            <span>•</span>
            <span>Instant Access</span>
            <span>•</span>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PricingUpgradeModal;
