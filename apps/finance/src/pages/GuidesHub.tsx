import { useState, useRef, useEffect } from 'react';
import { guidesData, type GuideItem } from '../data/guides';
import { navigateTo } from '../lib/router';
import { BookOpen, Search, Clock, ArrowRight, Filter, ChevronDown, Check, X } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';

export const GuidesHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    'All',
    ...Array.from(new Set(guidesData.map((g) => g.category)))
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-slate-900">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-900 mb-4 shadow-2xs">
          <BookOpen className="size-3.5 text-indigo-600" />
          <span>Technical & Financial Knowledge Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Engineering & Financial Analysis Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-800 max-w-2xl leading-relaxed">
          Comprehensive, in-depth guides on Apache Parquet file internals, DuckDB WebAssembly analytics, cloud data warehouse FinOps, and real estate mortgage underwriting formulas.
        </p>
      </div>

      {/* Search & Category Dropdown Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        {/* Balanced Search Bar */}
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g. DuckDB, Parquet)..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 focus:border-indigo-500 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown Filter */}
        <div className="relative w-full sm:w-auto shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full sm:w-auto flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer ${
              selectedCategory !== 'All'
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-300 hover:border-slate-400 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className={`size-3.5 ${selectedCategory !== 'All' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{selectedCategory === 'All' ? 'All Categories' : selectedCategory}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory !== 'All' ? 'bg-indigo-200/80 text-indigo-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {selectedCategory === 'All'
                  ? guidesData.length
                  : guidesData.filter((g) => g.category === selectedCategory).length}
              </span>
            </div>
            <ChevronDown
              className={`size-4 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-full sm:w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Filter by Category</span>
                <span className="text-[10px] font-normal text-slate-400">{categories.length - 1} categories</span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
                {categories.map((cat) => {
                  const count = cat === 'All'
                    ? guidesData.length
                    : guidesData.filter((g) => g.category === cat).length;
                  const isSelected = selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSelected ? (
                          <Check className="size-3.5 text-indigo-600 shrink-0" />
                        ) : (
                          <span className="size-3.5 shrink-0" />
                        )}
                        <span className="truncate">{cat === 'All' ? 'All Categories' : cat}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips & Reset */}
      {(selectedCategory !== 'All' || searchQuery) && (
        <div className="flex items-center justify-between flex-wrap gap-2 mb-8 pb-4 border-b border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[11px]">
                <span>Category: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="hover:text-indigo-900 hover:bg-indigo-100/80 p-0.5 rounded transition-colors cursor-pointer"
                  title="Clear category filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium text-[11px]">
                <span>"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 hover:bg-slate-200 p-0.5 rounded transition-colors cursor-pointer"
                  title="Clear search query"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-300 rounded-2xl bg-white shadow-2xs">
          <BookOpen className="size-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No guides found</h3>
          <p className="text-xs text-slate-600">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <article
              key={guide.id}
              onClick={() => handleOpenGuide(guide.slug)}
              className="group p-6 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer shadow-2xs hover:shadow-md"
            >
              <div>
                {/* Meta badge & read time */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {guide.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                    <Clock className="size-3" />
                    <span>{guide.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2.5 line-clamp-2 leading-snug">
                  {guide.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed mb-4">
                  {guide.excerpt}
                </p>
              </div>

              <div>
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {guide.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Card footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">{guide.date}</span>
                  <span className="text-indigo-600 group-hover:text-indigo-700 font-semibold flex items-center gap-1">
                    Read Guide
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdSlot unit="guideInArticle" className="mt-16" />
    </div>
  );
};
