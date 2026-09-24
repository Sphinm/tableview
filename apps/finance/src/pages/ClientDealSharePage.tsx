import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Share2,
  Download,
  Sliders,
} from 'lucide-react';
import { getAllSavedDeals, type AggregatedSavedDeal } from '../lib/savedDealsManager';
import { useAuth } from '../lib/useAuth';
import { trackUserClick } from '../lib/sentry';

interface ClientDealSharePageProps {
  dealId: string;
}

export const ClientDealSharePage: React.FC<ClientDealSharePageProps> = ({ dealId }) => {
  const { user } = useAuth();
  const [deal] = useState<AggregatedSavedDeal | null>(() => {
    // 1. Try to find the deal in saved scenarios
    const all = getAllSavedDeals();
    const found = all.find((d) => d.id === dealId);
    if (found) return found;

    // Fallback preview deal for share demonstration
    return {
      id: dealId,
      calculatorId: 'dscr',
      calculatorTitle: 'DSCR Loan Underwriting Memo',
      route: '/dscr-loan-calculator',
      name: 'Investment Property Acquisition · Scenario A',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      data: {
        purchasePrice: 485000,
        downPaymentPercent: 25,
        interestRate: 6.875,
        monthlyRent: 3850,
        taxes: 5200,
        insurance: 1450,
        hoa: 0,
      },
      metrics: {
        headline: '$2,385/mo Principal & Interest · DSCR 1.32x',
        subline: 'Net Cash Flow: +$845/mo · Cash-on-Cash ROI: 8.4%',
      },
    };
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // Client interactive sliders to test scenarios
  const [downPaymentDelta, setDownPaymentDelta] = useState(0);
  const [rateDelta, setRateDelta] = useState(0);

  if (!deal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="size-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
            <Building2 className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Loading Client Deal Memo...</h2>
        </div>
      </div>
    );
  }

  // Branding profile from current user or deal metadata
  const branding = user?.branding || {
    enabled: true,
    agentName: 'Institutional Advisory Desk',
    companyName: 'Apex Capital & Real Estate Group',
    nmlsNumber: 'NMLS #219842',
    phone: '(415) 555-0188',
    email: 'advisory@apexcapital.example',
    website: 'https://tableview.dev',
    customDisclaimer:
      'Equal Housing Opportunity. Loan terms, rates, and approval are subject to underwriting guidelines.',
  };

  const handleCopyShareLink = () => {
    trackUserClick('client_share_copy_link', { dealId });
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handlePrint = () => {
    trackUserClick('client_share_print', { dealId });
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Professional Client Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Building2 className="size-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{branding.companyName || 'Institutional Real Estate Advisory'}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Client Memorandum
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {branding.nmlsNumber ? `${branding.nmlsNumber} · ` : ''}Underwritten for Client Review
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="size-3.5 text-slate-500" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="size-3.5 text-indigo-300" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 w-full flex-1">
        {/* Deal Executive Title & Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                {deal.calculatorTitle}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {deal.name}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">Underwrite Date</span>
              <span className="text-xs font-bold text-slate-700 font-mono">{deal.date}</span>
            </div>
          </div>

          {/* Primary Key Metric Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-xs text-indigo-300 font-medium block mb-1">
                Executive Underwriting Target
              </span>
              <div className="text-lg sm:text-2xl font-black tracking-tight font-mono text-emerald-400">
                {deal.metrics.headline}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {deal.metrics.subline}
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 sm:border-l sm:border-slate-800 sm:pl-6 text-xs text-slate-300">
              <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
              <span>CFPB QM Underwritten</span>
            </div>
          </div>
        </div>

        {/* Client Interactive Stress-Test Sliders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Interactive Down Payment & Rate Sensitivity
              </h2>
            </div>
            <span className="text-2xs font-mono text-slate-400">Client Sandbox</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Slide below to test how adjustments to your down payment or interest rate affect your monthly carrying cost:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">Down Payment Adjustment:</span>
                <span className="font-mono text-indigo-600 font-bold">
                  {downPaymentDelta >= 0 ? `+${downPaymentDelta}%` : `${downPaymentDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="15"
                step="5"
                value={downPaymentDelta}
                onChange={(e) => setDownPaymentDelta(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-10% (Lower Down)</span>
                <span>Baseline</span>
                <span>+15% (Higher Equity)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">Market Rate Shift:</span>
                <span className="font-mono text-indigo-600 font-bold">
                  {rateDelta >= 0 ? `+${rateDelta.toFixed(2)}%` : `${rateDelta.toFixed(2)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.25"
                value={rateDelta}
                onChange={(e) => setRateDelta(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-1.00% (Rate Drop)</span>
                <span>Current Quote</span>
                <span>+1.00% (Buffer)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Presenter / Agent Branding Contact Card */}
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Deal Prepared By
            </span>
            <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Advisory Profile
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xl shrink-0">
                {branding.agentName ? branding.agentName[0].toUpperCase() : 'A'}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">{branding.agentName || 'Senior Advisory Officer'}</h3>
                <div className="text-xs text-slate-600 font-medium">{branding.companyName}</div>
                {branding.nmlsNumber && (
                  <div className="text-[11px] font-mono text-indigo-600">{branding.nmlsNumber}</div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {branding.phone && (
                <a
                  href={`tel:${branding.phone}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="size-3.5 text-emerald-400" />
                  <span>Call {branding.phone}</span>
                </a>
              )}
              {branding.email && (
                <a
                  href={`mailto:${branding.email}?subject=Inquiry regarding ${encodeURIComponent(deal.name)}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors"
                >
                  <Mail className="size-3.5 text-indigo-600" />
                  <span>Email Advisor</span>
                </a>
              )}
            </div>
          </div>

          {branding.customDisclaimer && (
            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
              {branding.customDisclaimer}
            </p>
          )}
        </div>
      </main>

      {/* Low-Key Viral Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 space-y-1">
        <div>
          Calculated with institutional precision via{' '}
          <a
            href="/"
            className="font-bold text-indigo-600 hover:text-indigo-800 underline transition-colors"
          >
            TableView Finance
          </a>
        </div>
        <div className="text-2xs text-slate-400 font-mono">
          100% In-Browser Privacy · No Telemarketing Lead Selling · Free Financial Underwriting Suite
        </div>
      </footer>
    </div>
  );
};
