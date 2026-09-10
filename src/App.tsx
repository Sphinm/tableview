import { useEffect, useState, lazy, Suspense } from 'react';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DropZone } from './components/DropZone';
import { HeroSection } from './components/HeroSection';
import { CompareSection } from './components/CompareSection';
import { SeoSection } from './components/SeoSection';
import { CookieBanner } from './components/CookieBanner';
import { SamplePlayground } from './components/SamplePlayground';
import { PageSkeleton } from './components/PageSkeleton';
import type { SamplePreset } from './lib/duckdb';

// Lazy-loaded heavy components & pages for bundle optimization & instant FCP
const DataView = lazy(() => import('./components/DataView').then(m => ({ default: m.DataView })));
const GuidesHub = lazy(() => import('./pages/GuidesHub').then(m => ({ default: m.GuidesHub })));
const GuideDetail = lazy(() => import('./pages/GuideDetail').then(m => ({ default: m.GuideDetail })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const Disclaimer = lazy(() => import('./pages/Disclaimer').then(m => ({ default: m.Disclaimer })));
const MortgageCalculator = lazy(() => import('./pages/MortgageCalculator').then(m => ({ default: m.MortgageCalculator })));
const RefinanceCalculator = lazy(() => import('./pages/RefinanceCalculator').then(m => ({ default: m.RefinanceCalculator })));
const DscrCalculator = lazy(() => import('./pages/DscrCalculator').then(m => ({ default: m.DscrCalculator })));
const HardMoneyCalculator = lazy(() => import('./pages/HardMoneyCalculator').then(m => ({ default: m.HardMoneyCalculator })));
const SnowflakeCalculator = lazy(() => import('./pages/SnowflakeCalculator').then(m => ({ default: m.SnowflakeCalculator })));
const ParquetSavingsCalculator = lazy(() => import('./pages/ParquetSavingsCalculator').then(m => ({ default: m.ParquetSavingsCalculator })));
const FinanceCalculatorHub = lazy(() => import('./pages/FinanceCalculatorHub').then(m => ({ default: m.FinanceCalculatorHub })));
import { useRouter, navigateTo, updatePageMeta } from './lib/router';
import { TOOLS_CONFIG } from './data/tools';
import { getInitialTheme, applyTheme, type Theme } from './lib/theme';
import { AlertCircle, ArrowLeft, FileQuestion, Mail } from 'lucide-react';
import { getBugReportMailto } from './lib/feedback';
import { describeFile, captureException } from './lib/sentry';
import { isEngineLoadError } from './lib/engineError';
import { HOME_META, GUIDES_HUB_META, STATIC_PAGE_META } from './data/routeMeta';
import { isKnownRoute } from './lib/resolveRoute';

export function App() {
  const { path, slug } = useRouter();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'parquet' | 'csv' | 'json'>('parquet');
  // Populated only for multi-sheet Excel workbooks; drives the sheet switcher.
  const [sheets, setSheets] = useState<{ name: string; tableName: string }[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing engine...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Apply theme class and meta tags on change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Update meta tags based on current route.
  // Text lives in src/data/routeMeta.ts so the prerendered HTML and the SPA agree.
  useEffect(() => {
    if (path === '/tools/:toolSlug' && slug && TOOLS_CONFIG[slug]) {
      const cfg = TOOLS_CONFIG[slug];
      updatePageMeta(cfg.metaTitle, cfg.metaDescription, cfg.path);
      return;
    }

    if (path === '/') {
      updatePageMeta(HOME_META.title, HOME_META.description, HOME_META.canonical);
      return;
    }

    if (path === '/guides') {
      updatePageMeta(GUIDES_HUB_META.title, GUIDES_HUB_META.description, GUIDES_HUB_META.canonical);
      return;
    }

    const staticMeta = STATIC_PAGE_META[path];
    if (staticMeta) {
      updatePageMeta(staticMeta.title, staticMeta.description, staticMeta.canonical);
      return;
    }

    // Any other path is a genuine 404. Tell crawlers not to index it — without
    // this, Cloudflare Pages' SPA fallback would return 200 for every typo and
    // produce soft-404 index bloat.
    if (!isKnownRoute(path)) {
      updatePageMeta(
        'Page Not Found | TableView.dev',
        'The page you are looking for does not exist.',
        '/404',
        [{ '@type': 'WebPage', name: 'Page Not Found' }],
        true
      );
    }
  }, [path, slug]);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus(`Reading ${file.name}...`);

    try {
      setLoadingStatus('Loading the in-browser SQL engine...');
      // Lazy: the DuckDB-Wasm engine + SheetJS are only fetched when a file is actually opened.
      const { loadFileIntoDuckDB } = await import('./lib/duckdb');
      const res = await loadFileIntoDuckDB(file);
      setCurrentTable(res.tableName);
      setFileType(res.fileType);
      setSheets(res.sheets);
    } catch (err: any) {
      console.error('Failed to load file:', err);
      // Privacy: never send the user's file name — only coarse, non-identifying metadata.
      captureException(err, {
        tags: { action: 'load_file' },
        extra: describeFile(file),
      });

      if (isEngineLoadError(err)) {
        // The engine is a ~6 MB CDN download. When it is blocked, blaming the
        // user's file sends them off debugging a perfectly good dataset.
        setErrorMessage(
          'Could not download the in-browser SQL engine (a one-time ~6 MB download from a CDN). ' +
            'This usually means a firewall, proxy, or ad blocker is blocking cdn.jsdelivr.net / unpkg.com. ' +
            'Your file was not uploaded anywhere. Please check your connection and try again.'
        );
      } else {
        setErrorMessage(
          `Failed to open ${file.name}: ${err.message || 'Unknown error'}. Make sure the file is not corrupted.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrySample = async (preset: SamplePreset = 'ecommerce') => {
    setIsLoading(true);
    setErrorMessage(null);
    const label = preset === 'financial' ? 'equity trades' : preset === 'telemetry' ? 'cloud telemetry' : 'e-commerce';
    setLoadingStatus(`Generating 1,000-row sample ${label} dataset in memory...`);

    // If invoked from an informational page, guide, or calculator, navigate to the workbench
    if (path !== '/') {
      navigateTo('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const { generateSampleParquet } = await import('./lib/duckdb');
      const res = await generateSampleParquet(preset);
      setCurrentTable(res.tableName);
      setFileType(res.fileType);
      setSheets(undefined);
    } catch (err: any) {
      console.error('Failed to generate sample:', err);
      captureException(err, { tags: { action: 'generate_sample' } });
      setErrorMessage(`Failed to generate sample dataset: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentTable(null);
    setSheets(undefined);
    setErrorMessage(null);
  };

  const handleAnalyzeScheduleInWorkbench = async (baseName: string, records: Record<string, any>[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus(`Loading ${records.length} schedule rows into DuckDB virtual workspace...`);
    navigateTo('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const { loadJsonDataIntoDuckDB } = await import('./lib/duckdb');
      const res = await loadJsonDataIntoDuckDB(baseName, records);
      setCurrentTable(res.tableName);
      setFileType(res.fileType);
      setSheets(undefined);
    } catch (err: any) {
      console.error('Failed to analyze schedule in DuckDB:', err);
      captureException(err, { tags: { action: 'analyze_schedule' } });
      setErrorMessage(`Failed to open schedule in workbench: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render current view based on route path
  const renderCurrentView = () => {
    // Check if on dedicated tool landing page
    const activeToolConfig = (path === '/tools/:toolSlug' && slug) ? TOOLS_CONFIG[slug] : undefined;

    if (path === '/' || activeToolConfig) {
      return (
        <>
          {errorMessage && (
            <div className="max-w-4xl mx-auto px-4 mt-6 w-full">
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-start gap-3">
                <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-200">Error opening file</p>
                  <p className="text-xs text-red-300/90 mt-0.5">{errorMessage}</p>
                  <div className="mt-2 pt-2 border-t border-red-900/60 flex items-center gap-3">
                    <a
                      href={getBugReportMailto({ errorMessage })}
                      className="inline-flex items-center gap-1.5 text-xs text-red-200 hover:text-white underline font-medium cursor-pointer"
                    >
                      <Mail className="size-3.5" />
                      <span>Report this issue via email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTable ? (
            <DataView
              // Remount per table: otherwise the schema summary, applied search
              // filter and sort from the previous file would leak into the next.
              key={currentTable}
              tableName={currentTable}
              fileType={fileType}
              onReset={handleReset}
              toolConfig={activeToolConfig}
              sheets={sheets}
              onSelectSheet={(nextTable) => {
                setCurrentTable(nextTable);
                // Keep fileType in sync: workbooks are always materialised as CSV.
                setFileType('csv');
              }}
            />
          ) : (
            <>
              {activeToolConfig ? (
                <DropZone
                  onFileSelected={handleFileSelected}
                  onTrySample={handleTrySample}
                  isLoading={isLoading}
                  loadingStatus={loadingStatus}
                  toolConfig={activeToolConfig}
                />
              ) : (
                <HeroSection
                  onFileSelected={handleFileSelected}
                  onTrySample={handleTrySample}
                  isLoading={isLoading}
                  loadingStatus={loadingStatus}
                />
              )}
              <SamplePlayground onSelectSample={handleTrySample} isLoading={isLoading} />
              <CompareSection />
            </>
          )}

          {!currentTable && <SeoSection toolConfig={activeToolConfig} />}
        </>
      );
    }

    switch (path) {

      case '/guides':
        return <GuidesHub />;

      case '/guides/:slug':
        return <GuideDetail slug={slug} />;

      case '/about':
        return <About />;

      case '/contact':
        return <Contact />;

      case '/privacy':
        return <PrivacyPolicy />;

      case '/terms':
        return <TermsOfService />;

      case '/mortgage-calculator':
        return (
          <MortgageCalculator
            onTrySample={handleTrySample}
            onAnalyzeInWorkbench={handleAnalyzeScheduleInWorkbench}
          />
        );

      case '/refinance-calculator':
        return (
          <RefinanceCalculator
            onTrySample={handleTrySample}
            onAnalyzeInWorkbench={handleAnalyzeScheduleInWorkbench}
          />
        );

      case '/dscr-loan-calculator':
        return (
          <DscrCalculator
            onTrySample={handleTrySample}
            onAnalyzeInWorkbench={handleAnalyzeScheduleInWorkbench}
          />
        );

      case '/hard-money-calculator':
        return <HardMoneyCalculator onTrySample={handleTrySample} />;

      case '/snowflake-cost-calculator':
        return <SnowflakeCalculator onTrySample={handleTrySample} />;

      case '/parquet-storage-calculator':
        return <ParquetSavingsCalculator onTrySample={handleTrySample} />;

      case '/finance-calculator':
      case '/calculator':
        return <FinanceCalculatorHub />;

      case '/disclaimer':
        return <Disclaimer />;

      default:
        return (
          <div className="max-w-md mx-auto px-4 py-24 text-center">
            <FileQuestion className="size-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Page Not Found</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              The page you are looking for does not exist or may have been moved.
            </p>
            <button
              onClick={() => navigateTo('/')}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="size-3.5" />
              Return to Workbench
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <div className="print:hidden">
        <Header
          onTrySample={handleTrySample}
          isLoading={isLoading}
          currentPath={path}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </div>

      <main className="flex-1 flex flex-col">
        <Suspense fallback={<PageSkeleton />}>
          {renderCurrentView()}
        </Suspense>
      </main>

      <div className="print:hidden">
        <Footer onTrySample={handleTrySample} />
        <CookieBanner />
      </div>
    </div>
  );
}

export default App;