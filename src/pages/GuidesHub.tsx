import { useState } from 'react';
import { guidesData, type GuideItem } from '../data/guides';
import { navigateTo } from '../lib/router';
import { BookOpen, Search, Clock, ArrowRight } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';

export const GuidesHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Storage Architecture',
    'File Conversion',
    'WebAssembly & SQL',
    'Metadata & Schema',
    'Benchmarks',
    'Troubleshooting'
  ];

  const filteredGuides = guidesData.filter((guide: GuideItem) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || guide.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenGuide = (slug: string) => {
    navigateTo(`/guides/${slug}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-slate-300">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 mb-4 shadow-sm">
          <BookOpen className="size-3.5" />
          <span>Technical Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight mb-4">
          Parquet & Columnar Data Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Comprehensive developer guides on Apache Parquet file internals, DuckDB in-browser execution, metadata schema inspection, and lossless format conversions.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g. DuckDB, Excel)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'btn-primary font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <BookOpen className="size-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300 mb-1">No guides found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <article
              key={guide.id}
              onClick={() => handleOpenGuide(guide.slug)}
              className="group p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl"
            >
              <div>
                {/* Meta badge & read time */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                    {guide.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="size-3" />
                    <span>{guide.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-100 group-hover:text-slate-300 transition-colors mb-2.5 line-clamp-2 leading-snug">
                  {guide.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {guide.excerpt}
                </p>
              </div>

              <div>
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {guide.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Card footer */}
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{guide.date}</span>
                  <span className="text-indigo-400 group-hover:text-indigo-300 font-medium flex items-center gap-1">
                    Read Guide
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdSlot className="mt-16" />
    </div>
  );
};
