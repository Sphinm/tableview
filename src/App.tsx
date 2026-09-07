import { useState } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { DataView } from './components/DataView';
import { SeoSection } from './components/SeoSection';
import { loadFileIntoDuckDB, generateSampleParquet } from './lib/duckdb';
import { AlertCircle } from 'lucide-react';

export function App() {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Header onTrySample={handleTrySample} isLoading={isLoading} />

      <main className="flex-1 flex flex-col">
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
      </main>
    </div>
  );
}

export default App;
