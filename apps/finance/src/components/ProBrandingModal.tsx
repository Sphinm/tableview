import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  Sparkles,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Dialog } from '@tableview/ui';
import { useAuth } from '../lib/useAuth';
import type { BrandingProfile } from '../lib/authTypes';

interface ProBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeToPro?: () => void;
}

export const ProBrandingModal: React.FC<ProBrandingModalProps> = ({
  isOpen,
  onClose,
  onUpgradeToPro,
}) => {
  const { user, updateBranding } = useAuth();
  const isPro = user?.plan === 'pro';

  const [form, setForm] = useState<BrandingProfile>({
    enabled: true,
    agentName: user?.branding?.agentName || user?.name || '',
    companyName: user?.branding?.companyName || 'Apex Capital & Real Estate Group',
    nmlsNumber: user?.branding?.nmlsNumber || 'NMLS #219842',
    phone: user?.branding?.phone || '(415) 555-0188',
    email: user?.branding?.email || user?.email || 'agent@example.com',
    website: user?.branding?.website || 'www.apexrealtygroup.com',
    customDisclaimer:
      user?.branding?.customDisclaimer ||
      'Equal Housing Opportunity. Loan terms, rates, and approval are subject to underwriting guidelines.',
    avatarUrl: user?.branding?.avatarUrl || '',
    logoUrl: user?.branding?.logoUrl || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user?.branding) {
      setForm({
        ...user.branding,
      });
    }
  }, [user?.branding]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog
      onClose={onClose}
      labelledBy="pro-branding-title"
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      panelClassName="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
    >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="pro-branding-title" className="text-base font-bold text-white tracking-tight">Custom White-Label Branding</h3>
                {isPro ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                    PRO ACTIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 flex items-center gap-0.5">
                    <Lock className="size-2.5" />
                    PRO FEATURE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Put your name, brokerage, and NMLS credentials on all official PDF reports & client shares.
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

        {/* Live Header Preview Banner */}
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Eye className="size-3.5 text-indigo-600" />
              Live Report Header Preview (How your clients see it):
            </span>
            <span className="font-mono text-[10px] text-slate-500">PDF Print View</span>
          </div>

          <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center border border-indigo-200 shrink-0">
                  {form.companyName ? form.companyName.charAt(0) : 'A'}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{form.companyName || 'Brokerage Name'}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-slate-800">{form.agentName || 'Your Name'}</span>
                    {form.nmlsNumber && <span className="font-mono text-slate-500">· {form.nmlsNumber}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-600 sm:self-center">
                <div className="font-mono font-medium">{form.phone || '(555) 000-0000'}</div>
                <div className="text-[11px] text-slate-500">{form.email || 'agent@example.com'}</div>
              </div>
            </div>
            {form.customDisclaimer && (
              <p className="mt-2 text-[10px] text-slate-500 italic leading-tight">
                {form.customDisclaimer}
              </p>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {!isPro && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-700 shrink-0" />
                <span>You are currently previewing. Upgrade to <strong>TableView Pro</strong> to activate white-label on all PDF exports.</span>
              </div>
              {onUpgradeToPro && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUpgradeToPro();
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                >
                  Unlock Pro ($19/mo)
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name / Presenter
              </label>
              <div className="relative">
                <User className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.agentName}
                  onChange={(e) => setForm({ ...form, agentName: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brokerage / Lending Firm
              </label>
              <div className="relative">
                <Building2 className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Compass Real Estate / Guaranteed Rate"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NMLS # / License ID
              </label>
              <div className="relative">
                <ShieldCheck className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.nmlsNumber}
                  onChange={(e) => setForm({ ...form, nmlsNumber: e.target.value })}
                  placeholder="e.g. NMLS #198273 / DRE #019283"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Direct Contact Phone
              </label>
              <div className="relative">
                <Phone className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(415) 555-0199"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="agent@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website / Booking Link
              </label>
              <div className="relative">
                <Globe className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="www.yourbrokerage.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Footer Disclaimer (Legal & Compliance)
            </label>
            <textarea
              rows={2}
              value={form.customDisclaimer}
              onChange={(e) => setForm({ ...form, customDisclaimer: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Custom disclaimer appearing at the bottom of the printed dossier..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="size-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">
                Enable White-Label on PDF & Print Reports
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Branding Profile</span>
                )}
              </button>
            </div>
          </div>
        </form>
    </Dialog>
  );
};
