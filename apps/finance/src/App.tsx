import { useEffect, lazy, Suspense } from 'react';
import { SuiteSwitcher } from '@tableview/ui';
import { FinanceHeader } from './components/FinanceHeader';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { GlobalLoading } from './components/GlobalLoading';
import { AuthProvider } from './lib/authContext';
import { AuthModal } from './components/AuthModal';
import { GoogleOneTap } from './components/GoogleOneTap';
import { useRouter, updatePageMeta } from './lib/router';
import { applyTheme } from './lib/theme';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { HOME_META, GUIDES_HUB_META, STATIC_PAGE_META } from './data/routeMeta';
import { SALARY_LONG_TAIL_SLUG_MAP } from './data/salaryLongTail';
import { getCrossSuiteUrl } from '@tableview/shared';

// Lazy-loaded financial pages
const FinanceCalculatorHub = lazy(() => import('./pages/FinanceCalculatorHub').then(m => ({ default: m.FinanceCalculatorHub })));
const MortgageCalculator = lazy(() => import('./pages/MortgageCalculator').then(m => ({ default: m.MortgageCalculator })));
const RefinanceCalculator = lazy(() => import('./pages/RefinanceCalculator').then(m => ({ default: m.RefinanceCalculator })));
const DscrCalculator = lazy(() => import('./pages/DscrCalculator').then(m => ({ default: m.DscrCalculator })));
const HardMoneyCalculator = lazy(() => import('./pages/HardMoneyCalculator').then(m => ({ default: m.HardMoneyCalculator })));
const Section1031Calculator = lazy(() => import('./pages/Section1031Calculator').then(m => ({ default: m.Section1031Calculator })));
const CommercialLoanCalculator = lazy(() => import('./pages/CommercialLoanCalculator').then(m => ({ default: m.CommercialLoanCalculator })));
const LoanComparisonCalculator = lazy(() => import('./pages/LoanComparisonCalculator').then(m => ({ default: m.LoanComparisonCalculator })));
const SalaryCalculator = lazy(() => import('./pages/SalaryCalculator').then(m => ({ default: m.SalaryCalculator })));
const GuidesHub = lazy(() => import('./pages/GuidesHub').then(m => ({ default: m.GuidesHub })));
const GuideDetail = lazy(() => import('./pages/GuideDetail').then(m => ({ default: m.GuideDetail })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const Disclaimer = lazy(() => import('./pages/Disclaimer').then(m => ({ default: m.Disclaimer })));

export function App() {
  const { path, slug, pathname } = useRouter();
  const currentNavPath = pathname || path;

  useEffect(() => {
    applyTheme('light');
  }, []);

  // Update SEO metadata on client navigation
  useEffect(() => {
    if (path === '/') {
      updatePageMeta(HOME_META.title, HOME_META.description, 'https://tableview.dev/');
    } else if (path === '/guides') {
      updatePageMeta(GUIDES_HUB_META.title, GUIDES_HUB_META.description, 'https://tableview.dev/guides');
    } else if (STATIC_PAGE_META[path]) {
      const meta = STATIC_PAGE_META[path];
      updatePageMeta(meta.title, meta.description, `https://tableview.dev${path}`);
    }
  }, [path]);

  const renderContent = () => {
    if (path === '/' || path === '/calculators' || path === '/finance-calculator') {
      return <FinanceCalculatorHub />;
    }
    if (
      path === '/mortgage-calculator' ||
      path === '/amortization-schedule-calculator' ||
      path === '/mortgage-payoff-calculator'
    ) {
      return <MortgageCalculator />;
    }
    if (path === '/refinance-calculator' || path === '/cash-out-refinance-calculator') {
      return <RefinanceCalculator />;
    }
    if (path === '/dscr-loan-calculator') {
      return <DscrCalculator />;
    }
    if (path === '/hard-money-calculator') {
      return <HardMoneyCalculator />;
    }
    if (path === '/section-1031-exchange-calculator' || path === '/1031-exchange-timeline-calculator') {
      return <Section1031Calculator />;
    }
    if (
      path === '/commercial-loan-calculator' ||
      path === '/commercial-real-estate-loan-calculator' ||
      path === '/balloon-payment-calculator'
    ) {
      return <CommercialLoanCalculator />;
    }
    if (path === '/loan-comparison-calculator') {
      return <LoanComparisonCalculator />;
    }
    if (
      path === '/salary-calculator' ||
      path === '/salary-to-hourly-calculator' ||
      (slug && SALARY_LONG_TAIL_SLUG_MAP[slug])
    ) {
      return <SalaryCalculator />;
    }
    if (path === '/guides') {
      return <GuidesHub />;
    }
    if (path.startsWith('/guides/') && slug) {
      return <GuideDetail slug={slug} />;
    }
    if (path === '/about') {
      return <About />;
    }
    if (path === '/contact') {
      return <Contact />;
    }
    if (path === '/privacy-policy' || path === '/privacy') {
      return <PrivacyPolicy />;
    }
    if (path === '/terms-of-service' || path === '/terms') {
      return <TermsOfService />;
    }
    if (path === '/disclaimer') {
      return <Disclaimer />;
    }

    // Default fallback to Finance Hub
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 shadow-xs">
          <FileQuestion className="size-7 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Tool Not Found in Financial Suite</h2>
        <p className="text-slate-600 text-sm max-w-md mb-6 leading-relaxed">
          The requested financial tool is not available on tableview.dev. Looking for Parquet, SQL, or Video tools?
          Visit our specialized standalone web suites.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-xs"
          >
            <ArrowLeft className="size-3.5" />
            Financial Workbench
          </a>
          <a
            href={getCrossSuiteUrl('/parquet-viewer', 'finance')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-800 font-semibold text-xs hover:bg-slate-50 transition border border-slate-300 shadow-2xs"
          >
            Data Workbench
          </a>
          <a
            href={getCrossSuiteUrl('/video-compressor', 'finance')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-800 font-semibold text-xs hover:bg-slate-50 transition border border-slate-300 shadow-2xs"
          >
            Media Compressor
          </a>
        </div>
      </div>
    );
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900">
        <SuiteSwitcher currentSuite="finance" />
        <FinanceHeader currentPath={currentNavPath} />

        <main className="flex-1 w-full min-w-0">
          <Suspense fallback={<GlobalLoading message="Loading underwriting engine..." />}>
            {renderContent()}
          </Suspense>
        </main>

        <Footer currentPath={currentNavPath} />
        <AuthModal />
        <GoogleOneTap />
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}

export default App;
