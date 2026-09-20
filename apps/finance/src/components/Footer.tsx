import { navigateTo } from '../lib/router';
import { openCookieSettings } from '../lib/consent';
import { getCrossSuiteUrl } from '@tableview/shared';
import {
  Building,
  Home,
  DollarSign,
  ShieldCheck,
  ArrowUp,
  ArrowRight,
} from 'lucide-react';

interface FooterProps {
  onTrySample?: () => void;
  currentPath?: string;
}

export const Footer = ({ onTrySample: _onTrySample, currentPath: _currentPath }: FooterProps) => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    const targetUrl = getCrossSuiteUrl(path, 'finance');
    if (targetUrl.startsWith('http')) {
      window.location.href = targetUrl;
    } else {
      navigateTo(path);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 text-slate-700 relative transition-colors mt-12 sm:mt-16 pt-10 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-6 py-8 text-sm">
          {/* Column 1: Commercial & Investment */}
          <div>
            <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
              <Building className="size-3.5 text-indigo-600" />
              Commercial & CRE
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/cap-rate-calculator"
                  onClick={(e) => handleNav(e, '/cap-rate-calculator')}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Cap Rate & Cash Flow</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    Flagship
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="/dscr-loan-calculator"
                  onClick={(e) => handleNav(e, '/dscr-loan-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  DSCR Loan Calculator
                </a>
              </li>
              <li>
                <a
                  href="/hard-money-calculator"
                  onClick={(e) => handleNav(e, '/hard-money-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Hard Money & Flip Deal
                </a>
              </li>
              <li>
                <a
                  href="/commercial-loan-calculator"
                  onClick={(e) => handleNav(e, '/commercial-loan-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Commercial Loan & Balloon
                </a>
              </li>
              <li>
                <a
                  href="/balloon-payment-calculator"
                  onClick={(e) => handleNav(e, '/balloon-payment-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Balloon Payment Calculator
                </a>
              </li>
              <li>
                <a
                  href="/section-1031-exchange-calculator"
                  onClick={(e) => handleNav(e, '/section-1031-exchange-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  1031 Exchange Tax Shield
                </a>
              </li>
              <li>
                <a
                  href="/1031-exchange-timeline-calculator"
                  onClick={(e) => handleNav(e, '/1031-exchange-timeline-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  1031 Timeline (45/180 Days)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Residential & Mortgages */}
          <div>
            <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
              <Home className="size-3.5 text-indigo-600" />
              Residential Debt
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/mortgage-calculator"
                  onClick={(e) => handleNav(e, '/mortgage-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Mortgage & PMI Calculator
                </a>
              </li>
              <li>
                <a
                  href="/refinance-calculator"
                  onClick={(e) => handleNav(e, '/refinance-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Refinance Break-Even
                </a>
              </li>
              <li>
                <a
                  href="/loan-comparison-calculator"
                  onClick={(e) => handleNav(e, '/loan-comparison-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Side-by-Side Loan Comparison
                </a>
              </li>
              <li>
                <a
                  href="/amortization-schedule-calculator"
                  onClick={(e) => handleNav(e, '/amortization-schedule-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Amortization Schedule
                </a>
              </li>
              <li>
                <a
                  href="/mortgage-payoff-calculator"
                  onClick={(e) => handleNav(e, '/mortgage-payoff-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Accelerated Early Payoff
                </a>
              </li>
              <li>
                <a
                  href="/cash-out-refinance-calculator"
                  onClick={(e) => handleNav(e, '/cash-out-refinance-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Cash-Out Refinance
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Personal Finance & Salary */}
          <div>
            <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
              <DollarSign className="size-3.5 text-indigo-600" />
              Salary & Planning
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/salary-to-hourly-calculator"
                  onClick={(e) => handleNav(e, '/salary-to-hourly-calculator')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Salary to Hourly Wage
                </a>
              </li>
              <li>
                <a
                  href="/60000-a-year-is-how-much-an-hour"
                  onClick={(e) => handleNav(e, '/60000-a-year-is-how-much-an-hour')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  $60k/yr is How Much/Hour?
                </a>
              </li>
              <li>
                <a
                  href="/100000-a-year-is-how-much-an-hour"
                  onClick={(e) => handleNav(e, '/100000-a-year-is-how-much-an-hour')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  $100k/yr is How Much/Hour?
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="/finance-calculator"
                  onClick={(e) => handleNav(e, '/finance-calculator')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <span>All 10+ Calculators</span>
                  <ArrowRight className="size-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Legal */}
          <div>
            <h4 className="text-slate-900 font-semibold uppercase tracking-wider text-xs mb-3.5 flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-slate-700" />
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/guides"
                  onClick={(e) => handleNav(e, '/guides')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Technical Guides Hub
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleNav(e, '/about')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  About TableView
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleNav(e, '/contact')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Contact & Feedback
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleNav(e, '/privacy')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block text-left cursor-pointer"
                >
                  Cookie Settings
                </button>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleNav(e, '/terms')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/disclaimer"
                  onClick={(e) => handleNav(e, '/disclaimer')}
                  className="text-slate-800 hover:text-slate-900 font-medium hover:underline transition-colors block"
                >
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/*
          Regulatory disclosure. A modelling tool that prints dollar figures and
          underwriting verdicts must say plainly, next to them, that the output
          is an estimate and not advice — otherwise users reasonably read a
          "Qualifies at 1.28x" badge as a lending decision.
        */}
        <div className="pt-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-relaxed text-slate-600 space-y-1.5">
            <p>
              Every figure is an estimate derived solely from
              the assumptions you enter and does not constitute a loan commitment, rate quote, appraisal
              or underwriting decision.
            </p>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-6 mt-6 border-t border-slate-200 text-xs text-slate-700 font-medium flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} TableView.dev. All rights reserved.</span>
          </div>

          <div className="text-slate-500 text-center text-[11px] font-medium">
            Institutional Real Estate & Lending Underwriting Suite · 100% In-Browser Privacy
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs transition-colors cursor-pointer text-xs font-semibold"
            title="Scroll back to top"
          >
            <ArrowUp className="size-3" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
