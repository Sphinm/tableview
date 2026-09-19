import React, { useState, useRef, useEffect } from 'react';
import {
  Building,
  Building2,
  Home,
  Calculator,
  Scale,
  DollarSign,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  LogOut,
  BookOpen,
  Hammer,
  ShieldCheck
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../lib/useAuth';
import { navigateTo } from '../lib/router';
import { getCrossSuiteUrl } from '@tableview/shared';

interface FinanceHeaderProps {
  currentPath: string;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({ currentPath }) => {
  const { user, openAuthModal, logout } = useAuth();

  // Dropdown states
  const [residentialOpen, setResidentialOpen] = useState(false);
  const [commercialOpen, setCommercialOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile accordion sections
  const [mobileResExpanded, setMobileResExpanded] = useState(true);
  const [mobileCommExpanded, setMobileCommExpanded] = useState(false);
  const [mobileTaxExpanded, setMobileTaxExpanded] = useState(false);

  // Refs for outside click handling
  const resRef = useRef<HTMLDivElement>(null);
  const commRef = useRef<HTMLDivElement>(null);
  const taxRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (resRef.current && !resRef.current.contains(target)) setResidentialOpen(false);
      if (commRef.current && !commRef.current.contains(target)) setCommercialOpen(false);
      if (taxRef.current && !taxRef.current.contains(target)) setTaxOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setResidentialOpen(false);
        setCommercialOpen(false);
        setTaxOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (path: string) => {
    const targetUrl = getCrossSuiteUrl(path, 'finance');
    if (targetUrl.startsWith('http')) {
      window.location.href = targetUrl;
    } else {
      navigateTo(path);
    }
    setResidentialOpen(false);
    setCommercialOpen(false);
    setTaxOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const isResidentialActive = [
    '/mortgage-calculator',
    '/refinance-calculator',
    '/loan-comparison-calculator',
    '/amortization-schedule-calculator',
    '/mortgage-payoff-calculator',
    '/cash-out-refinance-calculator'
  ].includes(currentPath);

  const isCommercialActive = [
    '/cap-rate-calculator',
    '/rental-property-calculator',
    '/rental-cash-flow-calculator',
    '/dscr-loan-calculator',
    '/hard-money-calculator',
    '/commercial-loan-calculator',
    '/commercial-real-estate-loan-calculator',
    '/balloon-payment-calculator'
  ].includes(currentPath);

  const isTaxActive = [
    '/section-1031-exchange-calculator',
    '/1031-exchange-timeline-calculator',
    '/salary-calculator',
    '/salary-to-hourly-calculator',
    '/calculators',
    '/finance-calculator'
  ].includes(currentPath);

  const isGuidesActive = currentPath.startsWith('/guides');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Flagship Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <BrandLogo size={32} className="shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-tight">
                  TableView
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  .dev
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 tracking-wide uppercase">
                Underwriting Suite
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {/* 1. Residential Dropdown */}
            <div className="relative" ref={resRef}>
              <button
                type="button"
                onClick={() => {
                  setResidentialOpen(!residentialOpen);
                  setCommercialOpen(false);
                  setTaxOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isResidentialActive || residentialOpen
                    ? 'bg-slate-100 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Home className="size-3.5 text-indigo-600" />
                <span>Residential</span>
                <ChevronDown
                  className={`size-3.5 text-slate-400 transition-transform ${residentialOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {residentialOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Conforming & Prime Debt
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav('/mortgage-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Home className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Mortgage & PMI Calculator</div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        PITI, auto PMI removal, property tax & amortization schedules
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('/refinance-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Calculator className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Refinance Break-Even</div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        Net break-even months, cash-out equity & reset clock analysis
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('/loan-comparison-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Scale className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Side-by-Side Loan Comparison</div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        Evaluate 15Y vs 30Y, rate buydown points & lifetime interest
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Commercial & Non-QM Dropdown */}
            <div className="relative" ref={commRef}>
              <button
                type="button"
                onClick={() => {
                  setCommercialOpen(!commercialOpen);
                  setResidentialOpen(false);
                  setTaxOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isCommercialActive || commercialOpen
                    ? 'bg-slate-100 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Building className="size-3.5 text-indigo-600" />
                <span>Commercial & Non-QM</span>
                <ChevronDown
                  className={`size-3.5 text-slate-400 transition-transform ${commercialOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {commercialOpen && (
                <div className="absolute left-0 mt-2 w-84 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Investor & Institutional Lending
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav('/cap-rate-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Building className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">Cap Rate & Rental Yield</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Flagship
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        NOI, Cash-on-Cash Return, 1% rule & 10-year wealth projections
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('/dscr-loan-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Building className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">DSCR Loan Underwriting</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Rental
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        1-4 unit investor debt coverage ratio & max qualifying loan
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('/hard-money-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Hammer className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">Hard Money & Fix/Flip</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          70% Rule
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        Draw schedules, interest-only holding costs & net profit ROI
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('/commercial-loan-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Commercial Real Estate Loan</div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        Balloon maturity modeling, 25Y amortization & refinance risk
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Tax & Advisory Dropdown */}
            <div className="relative" ref={taxRef}>
              <button
                type="button"
                onClick={() => {
                  setTaxOpen(!taxOpen);
                  setResidentialOpen(false);
                  setCommercialOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isTaxActive || taxOpen
                    ? 'bg-slate-100 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Scale className="size-3.5 text-indigo-600" />
                <span>Tax & Advisory</span>
                <ChevronDown
                  className={`size-3.5 text-slate-400 transition-transform ${taxOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {taxOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tax Deferral & Wealth
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav('/section-1031-exchange-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Scale className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Section 1031 Exchange</div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        Capital gains deferral, boot liabilities & replacement value
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('/1031-exchange-timeline-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Scale className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">1031 Timeline Calculator</div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        Strict 45-day identification & 180-day closing deadlines
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('/salary-to-hourly-calculator')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Salary to Hourly Calculator</div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        Annual salary to hourly conversion, 26x payroll & overtime
                      </div>
                    </div>
                  </button>

                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <button
                      type="button"
                      onClick={() => handleNav('/calculators')}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Browse All Calculators</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Guides Hub */}
            <button
              type="button"
              onClick={() => handleNav('/guides')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isGuidesActive
                  ? 'bg-slate-100 text-indigo-700 font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="size-3.5 text-indigo-600" />
              <span>Guides</span>
            </button>
          </nav>
        </div>

        {/* Right: Auth Action */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User Profile / Authentication */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="size-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                  {user.name || 'Account'}
                </span>
                {user.plan === 'pro' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                    PRO
                  </span>
                )}
                <ChevronDown className="size-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <div className="py-1">
                    <div className="px-3 py-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Plan Status</span>
                      <span className="font-bold text-indigo-600 uppercase">{user.plan || 'Free'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="size-3.5 text-amber-300" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 1. Residential Accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileResExpanded(!mobileResExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-900 text-left"
            >
              <div className="flex items-center gap-2">
                <Home className="size-4 text-indigo-600" />
                <span>Residential Underwriting</span>
              </div>
              <ChevronDown className={`size-4 text-slate-400 transition-transform ${mobileResExpanded ? 'rotate-180' : ''}`} />
            </button>
            {mobileResExpanded && (
              <div className="p-1 space-y-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => handleNav('/mortgage-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Mortgage & PMI Calculator</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/refinance-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Refinance Break-Even</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/loan-comparison-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Loan Comparison Tool</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Commercial Accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileCommExpanded(!mobileCommExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-900 text-left"
            >
              <div className="flex items-center gap-2">
                <Building className="size-4 text-indigo-600" />
                <span>Commercial & Non-QM</span>
              </div>
              <ChevronDown className={`size-4 text-slate-400 transition-transform ${mobileCommExpanded ? 'rotate-180' : ''}`} />
            </button>
            {mobileCommExpanded && (
              <div className="p-1 space-y-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => handleNav('/cap-rate-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Cap Rate & Cash Flow</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/dscr-loan-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>DSCR Rental Loan Underwriting</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/hard-money-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Hard Money & Fix/Flip</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/commercial-loan-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Commercial Loan & Balloon</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* 3. Tax & Advisory Accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileTaxExpanded(!mobileTaxExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-900 text-left"
            >
              <div className="flex items-center gap-2">
                <Scale className="size-4 text-indigo-600" />
                <span>Tax & Advisory</span>
              </div>
              <ChevronDown className={`size-4 text-slate-400 transition-transform ${mobileTaxExpanded ? 'rotate-180' : ''}`} />
            </button>
            {mobileTaxExpanded && (
              <div className="p-1 space-y-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => handleNav('/section-1031-exchange-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>§1031 Exchange Tax Shield</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/salary-to-hourly-calculator')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Salary to Hourly Wage</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/calculators')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>All Financial Calculators</span>
                  <ArrowRight className="size-3 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* 4. Guides Hub Link */}
          <button
            type="button"
            onClick={() => handleNav('/guides')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-indigo-600" />
              <span>Underwriting Guides & Rules</span>
            </div>
            <ArrowRight className="size-3.5 text-slate-400" />
          </button>

          {/* Client-Side Privacy Callout */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>100% In-Browser Sandbox · Zero sensitive financials stored or transmitted.</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default FinanceHeader;
