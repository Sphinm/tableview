import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Sparkles,
  Lock,
  Download,
  ArrowRight,
  Landmark,
  BadgeCheck,
  Building2,
  Flame,
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';

interface LenderReadyDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealTitle?: string;
  dealId: string;
  onExportExcel: () => void;
  onPrintOfficialPdf: () => void;
  onOpenBrandingSettings?: () => void;
}

export const LenderReadyDossierModal: React.FC<LenderReadyDossierModalProps> = ({
  isOpen,
  onClose,
  dealTitle = 'Current Loan Scenario',
  dealId,
  onExportExcel,
  onPrintOfficialPdf,
  onOpenBrandingSettings,
}) => {
  const { user, purchaseSinglePass, upgradePlan } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('year');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPro = user?.plan === 'pro';
  const hasPurchasedDeal = user?.purchasedDossiers?.includes(dealId);
  const isUnlocked = isPro || hasPurchasedDeal;

  const handleBuySinglePass = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    await purchaseSinglePass(dealId);
    setIsProcessing(false);
    setSuccessToast('Single Deal Pass unlocked! You can now download both files.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleUpgradePro = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 700));
    await upgradePlan('pro');
    setIsProcessing(false);
    setSuccessToast('🎉 Welcome to TableView Pro! Unlimited exports and white-label branding unlocked.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Landmark className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Institutional Lender-Ready Dossier</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-amber-950">
                  CFPB QM Certified
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official underwriter deliverables for: <span className="font-semibold text-white">{dealTitle}</span>
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

        {/* Success Toast */}
        {successToast && (
          <div className="p-3 bg-emerald-500 text-white text-xs font-semibold text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="size-4" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6">
          {/* Trust Banner: Zero Spam, 100% In-Browser */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>
                <strong>100% In-Browser Privacy:</strong> No telemarketing calls, no email selling, zero data leakage.
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
              Regulation Z & TRID Compliant
            </span>
          </div>

          {/* If already unlocked: Instant Download Hub */}
          {isUnlocked ? (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                  <BadgeCheck className="size-6 text-emerald-600" />
                  <span>Dossier Package Unlocked</span>
                </div>
                {isPro && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-600 text-white flex items-center gap-1">
                    <Sparkles className="size-3" />
                    Pro Member (Unlimited)
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Both institutional files are generated directly in your browser with zero watermarks. You can share or print them for your lender, broker, or client.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => {
                    onPrintOfficialPdf();
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-white border border-emerald-300 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Official Pre-Approval PDF</div>
                      <div className="text-[11px] text-slate-500">CFPB QM 28/43% Stamp & Cash-to-Close</div>
                    </div>
                  </div>
                  <Download className="size-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onExportExcel();
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-white border border-emerald-300 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <FileSpreadsheet className="size-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Full Formula Excel (.xlsx)</div>
                      <div className="text-[11px] text-slate-500">360-month PMT schedule with formulas</div>
                    </div>
                  </div>
                  <Download className="size-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>

              {isPro && onOpenBrandingSettings && (
                <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-indigo-600" />
                    <span>Custom White-Label Branding is <strong>{user?.branding?.enabled ? 'Active' : 'Disabled'}</strong></span>
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBrandingSettings();
                    }}
                    className="text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
                  >
                    Edit Agent Card & Logo →
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Purchase Cards: Single Pass vs Pro */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Single Deal Pass */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                      One-Time Purchase
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      Single Deal
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-1">Single Deal Pass</h4>
                  <p className="text-xs text-slate-600 mb-4">
                    For home buyers or investors closing on this specific property.
                  </p>

                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-black font-mono text-slate-900">$9.99</span>
                    <span className="text-xs text-slate-500 font-medium">one-time payment</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-4 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Official PDF Dossier</strong> without watermark</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Full Formula Excel (.xlsx)</strong> with live PMT formulas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Itemized Cash-to-Close & CFPB QM 28/43% DTI Audit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>30-day re-access & modification window</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400">
                      <Lock className="size-3.5 shrink-0 mt-0.5" />
                      <span>Realtor/Broker White-Label Branding (Pro only)</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleBuySinglePass}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>Get Single Deal Pass ($9.99)</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Card 2: TableView Pro */}
              <div className="relative rounded-2xl border-2 border-indigo-600 bg-gradient-to-b from-indigo-50/50 to-white p-6 flex flex-col justify-between shadow-lg ring-1 ring-indigo-600/20">
                <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Flame className="size-3 text-amber-300" />
                  Most Popular · 71% OFF
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono">
                      Pro Membership
                    </span>
                    {/* Billing Toggle */}
                    <div className="flex items-center p-0.5 rounded-lg bg-indigo-100 text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setBillingCycle('month')}
                        className={`px-2 py-0.5 rounded ${billingCycle === 'month' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-indigo-600'}`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle('year')}
                        className={`px-2 py-0.5 rounded ${billingCycle === 'year' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-indigo-600'}`}
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
                    For real estate agents, loan officers, and active investors.
                  </p>

                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-3xl font-black font-mono text-indigo-950">
                      ${billingCycle === 'year' ? '12.40' : '19'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / month {billingCycle === 'year' && '(billed $149/yr)'}
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-800 border-t border-indigo-100 pt-4 mb-6">
                    <li className="flex items-start gap-2 font-medium">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Unlimited Exports:</strong> All PDF Dossiers & Excel models</span>
                    </li>
                    <li className="flex items-start gap-2 font-medium">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Custom White-Label Branding:</strong> Your logo, photo, NMLS #</span>
                    </li>
                    <li className="flex items-start gap-2 font-medium">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Client Interactive Share Links:</strong> Direct lead conversion</span>
                    </li>
                    <li className="flex items-start gap-2 font-medium">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Unlimited Saved Scenarios:</strong> Multi-deal comparison</span>
                    </li>
                    <li className="flex items-start gap-2 font-medium">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Full access to 1031 Exchange & DSCR Pro models</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleUpgradePro}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <span>Activating Pro...</span>
                  ) : (
                    <>
                      <span>Upgrade to Pro ({billingCycle === 'year' ? '$149/year' : '$19/mo'})</span>
                      <Sparkles className="size-3.5 text-amber-300" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer Guarantee */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>🔒 Secure checkout powered by Stripe. Cancel anytime.</span>
            <div className="flex items-center gap-3">
              <span>Instant Download</span>
              <span>•</span>
              <span>100% Client-Side Privacy</span>
              <span>•</span>
              <span>Zero Spam Calls</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
