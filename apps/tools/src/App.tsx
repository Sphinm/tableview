import { useEffect, lazy, Suspense } from 'react';
import { SuiteSwitcher } from '@tableview/ui';
import { ToolsHeader } from './components/ToolsHeader';
import { CookieBanner } from './components/CookieBanner';
import { GlobalLoading } from './components/GlobalLoading';
import { useRouter, updatePageMeta } from './lib/router';
import { applyTheme } from './lib/theme';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { DATA_TOOLS_META, STATIC_PAGE_META } from './data/routeMeta';
import { TOOLS_CONFIG } from './data/tools';

// Lazy-loaded data and developer pages
const DataConverter = lazy(() => import('./pages/DataConverter').then(m => ({ default: m.DataConverter })));
const DataToolsWorkbench = lazy(() => import('./pages/DataToolsWorkbench').then(m => ({ default: m.DataToolsWorkbench })));
const ParquetSavingsCalculator = lazy(() => import('./pages/ParquetSavingsCalculator').then(m => ({ default: m.ParquetSavingsCalculator })));
const SnowflakeCalculator = lazy(() => import('./pages/SnowflakeCalculator').then(m => ({ default: m.SnowflakeCalculator })));
const JsonFormatter = lazy(() => import('./pages/JsonFormatter').then(m => ({ default: m.JsonFormatter })));
const SqlFormatter = lazy(() => import('./pages/SqlFormatter').then(m => ({ default: m.SqlFormatter })));
const WebsiteStatusChecker = lazy(() => import('./pages/WebsiteStatusChecker').then(m => ({ default: m.WebsiteStatusChecker })));
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

  useEffect(() => {
    if (path === '/' || path === '/data-tools') {
      updatePageMeta(DATA_TOOLS_META.title, DATA_TOOLS_META.description, 'https://tools.tableview.dev/');
    } else if (STATIC_PAGE_META[path]) {
      const meta = STATIC_PAGE_META[path];
      updatePageMeta(meta.title, meta.description, `https://tools.tableview.dev${path}`);
    }
  }, [path]);

  const renderContent = () => {
    if (path === '/' || path === '/data-tools') {
      return <DataToolsWorkbench onFileSelected={() => {}} isLoading={false} />;
    }
    if (
      (slug &&
        TOOLS_CONFIG[slug] &&
        TOOLS_CONFIG[slug].category !== 'calculator' &&
        TOOLS_CONFIG[slug].category !== 'media' &&
        TOOLS_CONFIG[slug].category !== 'developer') ||
      path.startsWith('/data-converter')
    ) {
      return <DataConverter />;
    }
    if (path === '/parquet-storage-calculator') {
      return <ParquetSavingsCalculator />;
    }
    if (path === '/snowflake-cost-calculator') {
      return <SnowflakeCalculator />;
    }
    if (path === '/json-formatter') {
      return <JsonFormatter />;
    }
    if (path === '/sql-formatter') {
      return <SqlFormatter />;
    }
    if (path === '/is-it-down') {
      return <WebsiteStatusChecker />;
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
    if (path === '/privacy') {
      return <PrivacyPolicy />;
    }
    if (path === '/terms') {
      return <TermsOfService />;
    }
    if (path === '/disclaimer') {
      return <Disclaimer />;
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
          <FileQuestion className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-100 mb-2">Tool Not Found in Data Suite</h2>
        <p className="text-neutral-400 text-sm max-w-md mb-6">
          Looking for real estate underwriting calculators or video/image compressors?
        </p>
        <div className="flex gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-neutral-950 font-semibold text-sm hover:bg-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Tools Directory
          </a>
          <a
            href="https://tableview.dev"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 font-semibold text-sm hover:bg-neutral-700 transition border border-neutral-700"
          >
            Financial Suite (Pro)
          </a>
          <a
            href="https://compress.tableview.dev"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 font-semibold text-sm hover:bg-neutral-700 transition border border-neutral-700"
          >
            Media Compressor
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <SuiteSwitcher currentSuite="tools" />
      <ToolsHeader currentPath={currentNavPath} />

      {/* Keyboard users can bypass the nav instead of tabbing through it. */}
      <a href="#main-content" className="skip-link">
        Skip to workbench
      </a>

      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none">
        <Suspense fallback={<GlobalLoading message="Loading data workbench..." />}>
          {renderContent()}
        </Suspense>
      </main>

      <CookieBanner />
    </div>
  );
}

export default App;
