import { useEffect } from 'react';
import { PageHeader } from '../components/calculator-kit/PageHeader';
import { ToolGrid } from '../components/ToolGrid';
import { SeoSection } from '../components/SeoSection';
import { AdSlot } from '../components/AdSlot';
import { updatePageMeta } from '../lib/router';
import { DATA_TOOLS_META } from '../data/routeMeta';

interface DataToolsWorkbenchProps {
  onFileSelected?: (file: File) => void;
  isLoading?: boolean;
}

export const DataToolsWorkbench = ({
  onFileSelected = () => {},
  isLoading = false
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
      {/* Compact header: breadcrumbs, badge, title, single-line description. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <PageHeader
          breadcrumbs={[
            { label: 'Data Tools', path: '/data-tools' },
            { label: 'In-Browser Workbench' }
          ]}
          badge={{
            label: 'DuckDB-Wasm SIMD · In-Browser Processing',
            tone: 'emerald'
          }}
          title="In-Browser Data Workbench & DuckDB SQL Console"
          description="Drop CSV, Excel, Parquet, or JSON to inspect, query, and convert — 100% in your browser."
        />

        {/* Ad slot */}
        <div className="max-w-4xl mx-auto my-6">
          <AdSlot unit="workbenchLeaderboard" format="horizontal" />
        </div>
      </div>

      {/* Primary content: the tool entry cards (search + category filters + drop targets). */}
      <ToolGrid onFileSelected={onFileSelected} isLoading={isLoading} />

      {/* SEO & Knowledge Section (FAQ + FAQPage structured data) */}
      <SeoSection />
    </div>
  );
};
