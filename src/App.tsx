import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DropZone } from './components/DropZone';
import { DataView } from './components/DataView';
import { SeoSection } from './components/SeoSection';
import { GuidesHub } from './pages/GuidesHub';
import { GuideDetail } from './pages/GuideDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { loadFileIntoDuckDB, generateSampleParquet } from './lib/duckdb';
import { useRouter, navigateTo } from './lib/router';
import { AlertCircle, ArrowLeft, FileQuestion } from 'lucide-react';

export function App() {
  const { path, slug } = useRouter();
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'parquet' | 'csv' | 'json'>('parquet');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing engine...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus(`Reading ${file.name}...`);

    try {
      setLoadingStatus('Registering file in WebAssembly virtual filesystem...');
      const res = await loadFileIntoDuckDB(file);
      setCurrentTable(res.tableName);
      setFileType(res.fileType);
      // Ensure we are viewing the home/workbench
      if (path !== '/') {
        navigateTo('/');
      }
    } catch (err: any) {
      console.error('Failed to load file:', err);
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
      if (path !== '/') {
        navigateTo('/');
      }
    } catch (err: any) {
      console.error('Failed to generate sample:', err);
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
    switch (path) {
      case '/':
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
              <DropZone
                onFileSelected={handleFileSelected}
                onTrySample={handleTrySample}
                isLoading={isLoading}
                loadingStatus={loadingStatus}
              />
            )}

            {!currentTable && <SeoSection />}
          </>
        );

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

      default:
        return (
          <div className="max-w-md mx-auto px-4 py-24 text-center">
            <FileQuestion className="size-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              The page you are looking for does not exist or may have been moved.
            </p>
            <button
              onClick={() => navigateTo('/')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
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
      />

      <main className="flex-1 flex flex-col">
        {renderCurrentView()}
      </main>

      <Footer />
    </div>
  );
}

export default App;
