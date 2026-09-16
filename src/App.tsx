import { useEffect, useState, lazy, Suspense } from 'react';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DropZone } from './components/DropZone';
import { FinancialHero } from './components/FinancialHero';
import { QuickModelerWidget } from './components/QuickModelerWidget';
import { FinancialBentoGrid } from './components/FinancialBentoGrid';
import { DataWorkbenchBanner } from './components/DataWorkbenchBanner';
import { CompareSection } from './components/CompareSection';
import { SeoSection } from './components/SeoSection';
import { CookieBanner } from './components/CookieBanner';
import { AdSlot } from './components/AdSlot';
import { SamplePlayground } from './components/SamplePlayground';
import { GlobalLoading } from './components/GlobalLoading';
import type { SamplePreset } from './lib/duckdb';

// Lazy-loaded heavy components & pages for bundle optimization & instant FCP
const DataView = lazy(() => import('./components/DataView').then(m => ({ default: m.DataView })));
const DataToolsWorkbench = lazy(() => import('./pages/DataToolsWorkbench').then(m => ({ default: m.DataToolsWorkbench })));
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
const Section1031Calculator = lazy(() => import('./pages/Section1031Calculator').then(m => ({ default: m.Section1031Calculator })));
const LoanComparisonCalculator = lazy(() => import('./pages/LoanComparisonCalculator').then(m => ({ default: m.LoanComparisonCalculator })));
const CommercialLoanCalculator = lazy(() => import('./pages/CommercialLoanCalculator').then(m => ({ default: m.CommercialLoanCalculator })));
const SalaryCalculator = lazy(() => import('./pages/SalaryCalculator').then(m => ({ default: m.SalaryCalculator })));
const JsonFormatter = lazy(() => import('./pages/JsonFormatter').then(m => ({ default: m.JsonFormatter })));
const SqlFormatter = lazy(() => import('./pages/SqlFormatter').then(m => ({ default: m.SqlFormatter })));
const VideoCompressor = lazy(() => import('./pages/VideoCompressor').then(m => ({ default: m.VideoCompressor })));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor').then(m => ({ default: m.ImageCompressor })));
const WebsiteStatusChecker = lazy(() => import('./pages/WebsiteStatusChecker').then(m => ({ default: m.WebsiteStatusChecker })));
const AiArticlePolisher = lazy(() => import('./pages/AiArticlePolisher').then(m => ({ default: m.AiArticlePolisher })));
import { AuthProvider } from './lib/authContext';
import { AuthModal } from './components/AuthModal';
import { useRouter, navigateTo, updatePageMeta } from './lib/router';
import { TOOLS_CONFIG } from './data/tools';
import { applyTheme } from './lib/theme';
import { AlertCircle, ArrowLeft, FileQuestion, Mail } from 'lucide-react';
import { getBugReportMailto } from './lib/feedback';
import { describeFile, captureException } from './lib/sentry';
import { isEngineLoadError } from './lib/engineError';
import { analytics, sizeBucket, fileExtension } from './lib/analytics';
import { HOME_META, GUIDES_HUB_META, STATIC_PAGE_META } from './data/routeMeta';
import { isKnownRoute } from './lib/resolveRoute';
import { SALARY_LONG_TAIL_SLUG_MAP } from './data/salaryLongTail';

export function App() {
  const { path, slug } = useRouter();
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'parquet' | 'csv' | 'json'>('parquet');
  // Populated only for multi-sheet Excel workbooks; drives the sheet switcher.
  const [sheets, setSheets] = useState<{ name: string; tableName: string }[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing engine...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Apply light theme
  useEffect(() => {
    applyTheme();
  }, []);

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

    // Funnel step 1. Records only the extension and a coarse size bucket.
    const ext = fileExtension(file.name);
    const bucket = sizeBucket(file.size);
    const startedAt = performance.now();
    analytics.fileDropped({ name: file.name, size: file.size });

    try {
      setLoadingStatus('Loading the in-browser SQL engine...');
      // Lazy: the DuckDB-Wasm engine + SheetJS are only fetched when a file is actually opened.
      const { loadFileIntoDuckDB } = await import('./lib/duckdb');
      const res = await loadFileIntoDuckDB(file);
      setCurrentTable(res.tableName);
      setFileType(res.fileType);
      setSheets(res.sheets);

      // Funnel step 3. rowCount is unknown here, so report 0 and let the grid
      // report the real count once it has queried the table.
      analytics.fileOpened({
        extension: ext,
        sizeBucket: bucket,
        rowCount: 0,
        durationMs: performance.now() - startedAt,
      });
    } catch (err: any) {
      console.error('Failed to load file:', err);
      // Privacy: never send the user's file name — only coarse, non-identifying metadata.
      captureException(err, {
        tags: { action: 'load_file' },
        extra: describeFile(file),
      });

      if (isEngineLoadError(err)) {
        analytics.engineLoadFailed(String(err?.message ?? 'unknown'));
        // The engine is a ~6 MB CDN download. When it is blocked, blaming the
        // user's file sends them off debugging a perfectly good dataset.
        setErrorMessage(
          'Could not download the in-browser SQL engine (a one-time ~6 MB download from a CDN). ' +
            'This usually means a firewall, proxy, or ad blocker is blocking cdn.jsdelivr.net / unpkg.com. ' +
            'Your file was not uploaded anywhere. Please check your connection and try again.'
        );
      } else {
        analytics.fileOpenFailed({
          extension: ext,
          sizeBucket: bucket,
          reason: String(err?.message ?? 'unknown'),
        });
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

  // Render current view based on route path
  const renderCurrentView = () => {
    // Check if on dedicated tool landing page
    const activeToolConfig = (path === '/tools/:toolSlug' && slug) ? TOOLS_CONFIG[slug] : undefined;

    // Common error banner component
    const errorBanner = errorMessage && (
      <div className="max-w-4xl mx-auto px-4 mt-6 w-full">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Error opening file</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
            <div className="mt-2 pt-2 border-t border-red-200 flex items-center gap-3">
              <a
                href={getBugReportMailto({ errorMessage })}
                className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900 underline font-medium cursor-pointer"
              >
                <Mail className="size-3.5" />
                <span>Report this issue via email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );

    // If a file is opened anywhere in the application, mount the DuckDB DataView
    if (currentTable) {
      return (
        <>
          {errorBanner}
          <DataView
            key={currentTable}
            tableName={currentTable}
            fileType={fileType}
            onReset={handleReset}
            toolConfig={activeToolConfig}
            sheets={sheets}
            onSelectSheet={(nextTable) => {
              setCurrentTable(nextTable);
              setFileType('csv');
            }}
          />
        </>
      );
    }

    // 1. Primary Homepage: Financial & Commercial Modeling Engine
    if (path === '/') {
      return (
        <>
          {errorBanner}
          <FinancialHero />
          <QuickModelerWidget />
          <FinancialBentoGrid />
          <div className="max-w-4xl mx-auto px-4 my-6">
            <AdSlot unit="workbenchLeaderboard" format="horizontal" />
          </div>
          <DataWorkbenchBanner />
        </>
      );
    }

    // 2. Secondary In-Browser Data Workbench Hub (/data-tools)
    if (path === '/data-tools') {
      return (
        <>
          {errorBanner}
          <DataToolsWorkbench
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
          />
        </>
      );
    }

    // 2b. Dedicated single-page tools that are listed in the /data-tools grid but
    // must NOT render the generic file-drop landing page (they take text input,
    // not files).
    if (path === '/tools/:toolSlug' && slug === 'ai-article-polisher') {
      return (
        <>
          {errorBanner}
          <AiArticlePolisher />
        </>
      );
    }

    // 3. Specialized Single-Format Tool Landing Pages (/csv-viewer, /excel-viewer, etc.)
    if (activeToolConfig) {
      return (
        <>
          {errorBanner}
          <DropZone
            onFileSelected={handleFileSelected}
            onTrySample={handleTrySample}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
            toolConfig={activeToolConfig}
          />
          <div className="max-w-4xl mx-auto px-4">
            <AdSlot unit="workbenchLeaderboard" format="horizontal" />
          </div>
          <SamplePlayground onSelectSample={handleTrySample} isLoading={isLoading} />
          <CompareSection />
          <SeoSection toolConfig={activeToolConfig} />
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
        return <MortgageCalculator />;

      case '/amortization-schedule-calculator':
        return <MortgageCalculator />;

      case '/mortgage-payoff-calculator':
        return <MortgageCalculator />;

      case '/refinance-calculator':
        return <RefinanceCalculator />;

      case '/cash-out-refinance-calculator':
        return <RefinanceCalculator />;

      case '/dscr-loan-calculator':
        return <DscrCalculator />;

      case '/hard-money-calculator':
        return <HardMoneyCalculator />;

      case '/snowflake-cost-calculator':
        return <SnowflakeCalculator />;

      case '/parquet-storage-calculator':
        return <ParquetSavingsCalculator />;

      case '/section-1031-exchange-calculator':
        return <Section1031Calculator />;

      case '/1031-exchange-timeline-calculator':
        return <Section1031Calculator />;

      case '/loan-comparison-calculator':
        return <LoanComparisonCalculator />;

      case '/commercial-loan-calculator':
        return <CommercialLoanCalculator />;

      case '/balloon-payment-calculator':
        return <CommercialLoanCalculator />;

      case '/salary-to-hourly-calculator': {
        const longTailConfig = slug ? SALARY_LONG_TAIL_SLUG_MAP[slug] : undefined;
        return (
          <SalaryCalculator
            key={slug || 'default'}
            initialSalary={longTailConfig?.salary}
            customTitle={longTailConfig?.title || longTailConfig?.metaTitle}
            customDescription={longTailConfig?.metaDescription}
            canonicalPath={longTailConfig?.path}
          />
        );
      }

      case '/json-formatter':
        return <JsonFormatter />;

      case '/sql-formatter':
        return <SqlFormatter />;

      case '/video-compressor':
        return <VideoCompressor />;

      case '/compress-mp4':
        return <VideoCompressor />;

      case '/compress-video-for-discord':
        return <VideoCompressor />;

      case '/image-compressor':
        return <ImageCompressor />;

      case '/compress-png':
        return <ImageCompressor />;

      case '/compress-jpg':
        return <ImageCompressor />;

      case '/compress-webp':
        return <ImageCompressor />;

      case '/is-it-down':
        return <WebsiteStatusChecker />;

      case '/finance-calculator':
      case '/calculator':
        return <FinanceCalculatorHub />;

      case '/data-tools':
        return (
          <DataToolsWorkbench
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
          />
        );

      case '/disclaimer':
        return <Disclaimer />;

      default:
        return (
          <div className="max-w-md mx-auto px-4 py-24 text-center">
            <FileQuestion className="size-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
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
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* Global Loading Top Bar (active during background DuckDB queries or file processing) */}
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-slate-200/80 overflow-hidden pointer-events-none">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 animate-top-progress shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          </div>
        )}

        <div className="print:hidden">
          <Header
            onTrySample={handleTrySample}
            isLoading={isLoading}
            currentPath={path}
          />
        </div>

        <main className="flex-1 flex flex-col">
          <Suspense fallback={<GlobalLoading />}>
            {renderCurrentView()}
          </Suspense>
        </main>

        <div className="print:hidden">
          <Footer onTrySample={handleTrySample} currentPath={path} />
          <CookieBanner />
        </div>

        <AuthModal />
      </div>
    </AuthProvider>
  );
}

export default App;