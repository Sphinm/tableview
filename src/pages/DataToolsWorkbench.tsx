import { useEffect } from 'react';
import { PageHeader } from '../components/calculator-kit/PageHeader';
import { DropZone } from '../components/DropZone';
import { SamplePlayground } from '../components/SamplePlayground';
import { CompareSection } from '../components/CompareSection';
import { ToolGrid } from '../components/ToolGrid';
import { SeoSection } from '../components/SeoSection';
import { AdSlot } from '../components/AdSlot';
import { updatePageMeta } from '../lib/router';
import { DATA_TOOLS_META } from '../data/routeMeta';

interface DataToolsWorkbenchProps {
  onFileSelected: (file: File) => void;
  onTrySample: () => void;
  isLoading: boolean;
  loadingStatus: string;
}

export const DataToolsWorkbench = ({
  onFileSelected,
  onTrySample,
  isLoading,
  loadingStatus
}: DataToolsWorkbenchProps) => {
  useEffect(() => {
    updatePageMeta(
      DATA_TOOLS_META.title,
      DATA_TOOLS_META.description,
      DATA_TOOLS_META.canonical,
      [
        {
          '@type': 'WebApplication',
          name: DATA_TOOLS_META.title,
          description: DATA_TOOLS_META.description,
          url: 'https://tableview.dev/data-tools',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any'
        }
      ]
    );
  }, []);

  return (
    <div className="w-full">
      <PageHeader
        breadcrumbs={[
          { label: 'Data Tools', path: '/data-tools' },
          { label: 'In-Browser Workbench' }
        ]}
        badge={{
          label: 'DuckDB-Wasm SIMD · 100% Client-Side',
          tone: 'emerald'
        }}
        title="In-Browser Data Workbench & DuckDB SQL Console"
        description="Drop CSV, Excel (.xlsx), Apache Parquet, or JSON files to inspect millions of rows, execute DuckDB SQL queries, and convert formats with zero server uploads."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* The Core File Drop Zone */}
        <DropZone
          onFileSelected={onFileSelected}
          onTrySample={onTrySample}
          isLoading={isLoading}
          loadingStatus={loadingStatus}
        />

        {/* Ad slot */}
        <div className="max-w-4xl mx-auto px-4 my-6">
          <AdSlot unit="workbenchLeaderboard" format="horizontal" />
        </div>

        {/* Sample Playground */}
        <SamplePlayground onSelectSample={onTrySample} isLoading={isLoading} />

        {/* All Data Tools Grid */}
        <div className="pt-8">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              All In-Browser Data Tools & Converters
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select any specialized viewer or converter to process your files client-side.
            </p>
          </div>
          <ToolGrid onFileSelected={onFileSelected} isLoading={isLoading} />
        </div>

        {/* Privacy & Performance Compare Section */}
        <CompareSection />

        {/* SEO & Knowledge Section */}
        <SeoSection />
      </div>
    </div>
  );
};
