import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DropZone } from './components/DropZone';
import { HeroSection } from './components/HeroSection';
import { CompareSection } from './components/CompareSection';
import { DataView } from './components/DataView';
import { SeoSection } from './components/SeoSection';
import { GuidesHub } from './pages/GuidesHub';
import { GuideDetail } from './pages/GuideDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { MortgageCalculator } from './pages/MortgageCalculator';
import { RefinanceCalculator } from './pages/RefinanceCalculator';
import { FinanceCalculatorHub } from './pages/FinanceCalculatorHub';
import { loadFileIntoDuckDB, generateSampleParquet } from './lib/duckdb';
import { useRouter, navigateTo, updatePageMeta } from './lib/router';
import { TOOLS_CONFIG } from './data/tools';
import { getInitialTheme, applyTheme, type Theme } from './lib/theme';
import { AlertCircle, ArrowLeft, FileQuestion } from 'lucide-react';

export function App() {
  const { path, slug } = useRouter();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'parquet' | 'csv' | 'json'>('parquet');
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

  // Update meta tags based on current route
  useEffect(() => {
    if (path === '/tools/:toolSlug' && slug && TOOLS_CONFIG[slug]) {
      const cfg = TOOLS_CONFIG[slug];
      updatePageMeta(cfg.metaTitle, cfg.metaDescription, cfg.path);
    } else if (path === '/') {
      updatePageMeta(
        'TableView.dev — Fast, Private In-Browser Parquet Viewer, SQL Workbench & Excel Converter',
        'Fast, 100% private in-browser Apache Parquet inspector, SQL query workbench, and native Excel converter powered by DuckDB-Wasm. Zero server file uploads.',
        '/'
      );
    } else if (path === '/guides') {
      updatePageMeta(
        'Apache Parquet & DuckDB Guides | TableView.dev',
        'In-depth technical guides, architecture comparisons, and performance benchmarks for Apache Parquet, DuckDB-Wasm, and columnar formats.',
        '/guides'
      );
    } else if (path === '/about') {
      updatePageMeta('About TableView.dev — In-Browser Data Processing', 'Learn about TableView.dev and our client-side architecture.', '/about');
    } else if (path === '/contact') {
      updatePageMeta('Contact & Feedback | TableView.dev', 'Contact the TableView engineering team.', '/contact');
    } else if (path === '/privacy') {
      updatePageMeta('Privacy Policy | TableView.dev', 'TableView privacy policy: 100% local processing with zero server file storage.', '/privacy');
    } else if (path === '/terms') {
      updatePageMeta('Terms of Service | TableView.dev', 'TableView terms of service.', '/terms');
    }
  }, [path, slug]);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus(`Reading ${file.name}...`);

    try {
      setLoadingStatus('Registering file in WebAssembly virtual filesystem...');
      const res = await loadFileIntoDuckDB(file);
      setCurrentTable(res.tableName);
      setFileType(res.fileType);
    } catch (err: any) {
      console.error('Failed to load file:', err);
      Sentry.captureException(err, {
        tags: { action: 'load_file' },
        extra: { fileName: file.name, fileSize: file.size, fileType: file.type }
      });
      setErrorMessage(`Failed to open ${file.name}: ${err.message || 'Unknown error'}. Make sure the file is not corrupted.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrySample = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus('Generating 1,000-row sample e-commerce dataset in memory...');

    try {
      const res = await generateSampleParquet();
      setCurrentTable(res.tableName);
      setFileType(res.fileType);
    } catch (err: any) {
      console.error('Failed to generate sample:', err);
      Sentry.captureException(err, { tags: { action: 'generate_sample' } });
      setErrorMessage(`Failed to generate sample dataset: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentTable(null);
    setErrorMessage(null);
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
                <div>
                  <p className="font-semibold text-red-200">Error opening file</p>
                  <p className="text-xs text-red-300/90 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {currentTable ? (
            <DataView
              tableName={currentTable}
              fileType={fileType}
              onReset={handleReset}
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
        return <MortgageCalculator onTrySample={handleTrySample} />;

      case '/refinance-calculator':
        return <RefinanceCalculator onTrySample={handleTrySample} />;

      case '/finance-calculator':
      case '/calculator':
        return <FinanceCalculatorHub />;

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
      <Header
        onTrySample={handleTrySample}
        isLoading={isLoading}
        currentPath={path}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 flex flex-col">
        {renderCurrentView()}
      </main>

      <Footer onTrySample={handleTrySample} />
    </div>
  );
}

export default App;
