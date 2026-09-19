import { useEffect, useState, lazy, Suspense } from 'react';
import { SuiteSwitcher } from '@tableview/ui';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CookieBanner } from './components/CookieBanner';
import { GlobalLoading } from './components/GlobalLoading';
import { AuthProvider } from './lib/authContext';
import { AuthModal } from './components/AuthModal';
import { GoogleOneTap } from './components/GoogleOneTap';
import { useRouter, updatePageMeta } from './lib/router';
import { applyTheme } from './lib/theme';
import { AlertCircle, ArrowLeft, FileQuestion } from 'lucide-react';
import { HOME_META, GUIDES_HUB_META, STATIC_PAGE_META } from './data/routeMeta';
import { SALARY_LONG_TAIL_SLUG_MAP } from './data/salaryLongTail';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tableview_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('tableview_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

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
    if (path === '/' || path === '/calculators') {
      return <FinanceCalculatorHub />;
    }
    if (path === '/mortgage-calculator') {
      return <MortgageCalculator />;
    }
    if (path === '/refinance-calculator') {
      return <RefinanceCalculator />;
    }
    if (path === '/dscr-loan-calculator') {
      return <DscrCalculator />;
    }
    if (path === '/hard-money-calculator') {
      return <HardMoneyCalculator />;
    }
    if (path === '/section-1031-exchange-calculator') {
      return <Section1031Calculator />;
    }
    if (path === '/commercial-real-estate-loan-calculator') {
      return <CommercialLoanCalculator />;
    }
    if (path === '/loan-comparison-calculator') {
      return <LoanComparisonCalculator />;
    }
    if (path === '/salary-calculator' || (slug && SALARY_LONG_TAIL_SLUG_MAP[slug])) {
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
    if (path === '/privacy-policy') {
      return <PrivacyPolicy />;
    }
    if (path === '/terms-of-service') {
      return <TermsOfService />;
    }
    if (path === '/disclaimer') {
      return <Disclaimer />;
    }

    // Default fallback to Finance Hub
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
          <FileQuestion className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-100 mb-2">Page Not Found in Financial Suite</h2>
        <p className="text-neutral-400 text-sm max-w-md mb-6">
          The requested financial tool does not exist. Looking for Parquet or Data tools? Visit our dedicated data workbench.
        </p>
        <div className="flex gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-neutral-950 font-semibold text-sm hover:bg-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Financial Workbench
          </a>
          <a
            href="https://tools.tableview.dev"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 font-semibold text-sm hover:bg-neutral-700 transition border border-neutral-700"
          >
            Data Tools
          </a>
        </div>
      </div>
    );
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
        <SuiteSwitcher currentSuite="finance" />
        <Header currentPath={currentNavPath} />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentPath={currentNavPath}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          <main className="flex-1 overflow-y-auto min-w-0">
            <Suspense fallback={<GlobalLoading message="Loading underwriting engine..." />}>
              {renderContent()}
            </Suspense>
          </main>
        </div>

        <AuthModal />
        <GoogleOneTap />
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}

export default App;
