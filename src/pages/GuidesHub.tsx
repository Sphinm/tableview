import { useState } from 'react';
import { guidesData, type GuideItem } from '../data/guides';
import { navigateTo } from '../lib/router';
import { BookOpen, Search, Clock, ArrowRight, Sparkles } from 'lucide-react';
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
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/60 border border-indigo-800 text-indigo-400 mb-4">
          <Sparkles className="size-3.5" />
          <span>Technical Knowledge Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          Parquet & In-Browser Analytics Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Comprehensive, field-tested technical guides on Apache Parquet, DuckDB-Wasm internals, columnar optimization, and data engineering best practices.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides by title, keyword, or tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
              className="group p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-950/20"
            >
              <div>
                {/* Meta badge & read time */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
                    {guide.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="size-3" />
                    <span>{guide.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2.5 line-clamp-2 leading-snug">
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
