import { useState, useRef, useEffect, type DragEvent } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Database,
  FileCode,
  Terminal,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  X,
  SlidersHorizontal,
  Table,
  Building,
  Hammer,
  Server,
  PiggyBank,
  Home,
  ArrowRightLeft,
  Calculator,
  Video,
  Image as ImageIcon,
  FileCode2,
  Filter,
  ChevronDown,
  Check
} from 'lucide-react';
import { type ToolConfig, type ToolCategory, TOOLS_CONFIG } from '../data/tools';
import { navigateTo } from '../lib/router';

interface ToolGridProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export const ToolGrid = ({ onFileSelected, isLoading }: ToolGridProps) => {
  const [activeCategory, setActiveCategory] = useState<'all' | ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dragOverSlug, setDragOverSlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetToolRef = useRef<string | null>(null);
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

  const toolsList = Object.values(TOOLS_CONFIG);

  // Filter tools based on category and search query
  const filteredTools = toolsList.filter((tool) => {
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'sql'
        ? tool.category === 'sql' || tool.category === 'analysis'
        : tool.category === activeCategory;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      tool.title.toLowerCase().includes(q) ||
      tool.shortTitle?.toLowerCase().includes(q) ||
      tool.metaDescription.toLowerCase().includes(q) ||
      tool.slug.toLowerCase().includes(q) ||
      tool.acceptExtensions.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const getToolIcon = (iconType: ToolConfig['iconType']) => {
    const iconSize = 'size-5';
    switch (iconType) {
      case 'csv':
        return <FileText className={iconSize} />;
      case 'excel':
        return <FileSpreadsheet className={iconSize} />;
      case 'parquet':
        return <Database className={iconSize} />;
      case 'json':
        return <FileCode className={iconSize} />;
      case 'sql':
        return <Terminal className={iconSize} />;
      case 'schema':
        return <Layers className={iconSize} />;
      case 'calculator':
        return <Calculator className={iconSize} />;
      case 'building':
        return <Building className={iconSize} />;
      case 'hammer':
        return <Hammer className={iconSize} />;
      case 'server':
        return <Server className={iconSize} />;
      case 'savings':
        return <PiggyBank className={iconSize} />;
      case 'home':
        return <Home className={iconSize} />;
      case 'refinance':
        return <ArrowRightLeft className={iconSize} />;
      case 'video':
        return <Video className={iconSize} />;
      case 'image':
        return <ImageIcon className={iconSize} />;
      case 'file':
        return <FileCode2 className={iconSize} />;
      default:
        return <Table className={iconSize} />;
    }
  };

  const getColorStyles = (color: ToolConfig['color']) => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-100/70',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          glow: 'hover:border-emerald-300',
          dropGlow: 'border-emerald-500 bg-emerald-50 shadow-emerald-500/10'
        };
      case 'green':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-100/70',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          glow: 'hover:border-emerald-300',
          dropGlow: 'border-emerald-500 bg-emerald-50 shadow-emerald-500/10'
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200 group-hover:bg-indigo-100/70',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          glow: 'hover:border-indigo-300',
          dropGlow: 'border-indigo-500 bg-indigo-50 shadow-indigo-500/10'
        };
      case 'cyan':
        return {
          iconBg: 'bg-cyan-50 text-cyan-700 border-cyan-200 group-hover:bg-cyan-100/70',
          badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          glow: 'hover:border-cyan-300',
          dropGlow: 'border-cyan-500 bg-cyan-50 shadow-cyan-500/10'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-100/70',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          glow: 'hover:border-amber-300',
          dropGlow: 'border-amber-500 bg-amber-50 shadow-amber-500/10'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 text-purple-700 border-purple-200 group-hover:bg-purple-100/70',
          badge: 'bg-purple-50 text-purple-800 border-purple-200',
          glow: 'hover:border-purple-300',
          dropGlow: 'border-purple-500 bg-purple-50 shadow-purple-500/10'
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          glow: 'hover:border-slate-300',
          dropGlow: 'border-indigo-500 bg-indigo-50'
        };
    }
  };

  const handleCardDragOver = (e: DragEvent, tool: ToolConfig) => {
    e.preventDefault();
    e.stopPropagation();
    if (tool.category !== 'calculator' && tool.category !== 'media') {
      setDragOverSlug(tool.slug);
    }
  };

  const handleCardDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlug(null);
  };

  const handleCardDrop = (e: DragEvent, tool: ToolConfig) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlug(null);

    if (tool.category === 'calculator' || tool.category === 'media') {
      navigateTo(tool.path);
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Set the path to the tool then process file
      navigateTo(tool.path);
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleCardClick = (tool: ToolConfig) => {
    if (isLoading) return;
    navigateTo(tool.path);
  };

  const categories: { id: 'all' | ToolCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Tools', count: toolsList.length },
    { id: 'viewer', label: 'Viewers', count: toolsList.filter((t) => t.category === 'viewer').length },
    { id: 'converter', label: 'Converters', count: toolsList.filter((t) => t.category === 'converter').length },
    {
      id: 'sql',
      label: 'SQL & Analytics',
      count: toolsList.filter((t) => t.category === 'sql' || t.category === 'analysis').length
    },
    {
      id: 'media',
      label: 'Video & Image',
      count: toolsList.filter((t) => t.category === 'media').length
    },
    {
      id: 'developer',
      label: 'Developer',
      count: toolsList.filter((t) => t.category === 'developer').length
    },
    {
      id: 'calculator',
      label: 'Calculators',
      count: toolsList.filter((t) => t.category === 'calculator').length
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hidden file input for quick direct upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            if (targetToolRef.current) {
              navigateTo(targetToolRef.current);
            }
            onFileSelected(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Grid Filter Bar: Categories Dropdown + Search Input */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        {/* Moderately Sized Search Bar */}
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools & calculators..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 focus:border-indigo-500 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
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
              activeCategory !== 'all'
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-300 hover:border-slate-400 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className={`size-3.5 ${activeCategory !== 'all' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{categories.find((c) => c.id === activeCategory)?.label || 'All Tools'}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeCategory !== 'all' ? 'bg-indigo-200/80 text-indigo-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {categories.find((c) => c.id === activeCategory)?.count ?? toolsList.length}
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
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-full sm:w-60 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Filter by Category</span>
                <span className="text-[10px] font-normal text-slate-400">{categories.length - 1} categories</span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
                {categories.map((cat) => {
                  const isSelected = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
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
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cat.count}
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
      {(activeCategory !== 'all' || searchQuery) && (
        <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            {activeCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[11px]">
                <span>Category: {categories.find((c) => c.id === activeCategory)?.label}</span>
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
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
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Empty State when no tools match query */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
          <SlidersHorizontal className="size-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No tools found matching "{searchQuery}"</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Try searching for "CSV", "Excel", "Parquet", "SQL", or "Calculator".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Clear Filters
          </button>
        </div>
      )}

      {activeCategory === 'calculator' && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-white text-indigo-600 border border-indigo-200 shadow-2xs">
              <Calculator className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Looking for our Full Financial Planning & FinOps Hub?</h4>
              <p className="text-xs text-slate-600">Explore loan underwriting, debt payoff, compound growth, and cloud infrastructure modeling.</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('/finance-calculator')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <span>Launch Calculators Hub</span>
            <ArrowRight className="size-3" />
          </button>
        </div>
      )}

      {/* The "Small Block Entry Points" Grid (ILovePDF-Style Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredTools.map((tool) => {
          const colors = getColorStyles(tool.color);
          const isDraggingThis = dragOverSlug === tool.slug;

          return (
            <a
              key={tool.slug}
              href={tool.path}
              onClick={(e) => {
                e.preventDefault();
                handleCardClick(tool);
              }}
              onDragOver={(e) => handleCardDragOver(e, tool)}
              onDragLeave={handleCardDragLeave}
              onDrop={(e) => handleCardDrop(e, tool)}
              className={`group relative rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden p-4 sm:p-5 ${
                isDraggingThis
                  ? `scale-[1.02] border-indigo-500 ${colors.dropGlow}`
                  : `hover:-translate-y-0.5 ${colors.glow}`
              }`}
            >
              <div>
                {/* Card Header: Icon + Badge */}
                <div className="flex items-start justify-between gap-2 mb-3.5">
                  <div
                    className={`size-11 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-2xs ${colors.iconBg}`}
                  >
                    {getToolIcon(tool.iconType)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tool.tag && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs uppercase tracking-wider ${colors.badge}`}
                      >
                        {tool.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Title & Short Description */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5 tracking-tight flex items-center justify-between">
                  <span>{tool.shortTitle || tool.title}</span>
                </h3>

                <p className="text-xs text-slate-700 leading-relaxed line-clamp-2 mb-4">
                  {tool.subtitle}
                </p>
              </div>

              {/* Card Footer: Accepted Exts & Button-in-Button Action */}
              {tool.category === 'calculator' ? (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <span className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5 truncate pr-2">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{tool.acceptExtensions}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors shrink-0">
                    <span>Launch</span>
                    <span className="size-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:translate-x-0.5 transition-all duration-200">
                      <ArrowRight className="size-2.5" />
                    </span>
                  </span>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-mono text-[11px] text-slate-700 font-medium">
                    {tool.acceptExtensions.split(',')[0]}
                    {tool.acceptExtensions.split(',').length > 1 && (
                      <span className="text-slate-600 font-medium"> +{tool.acceptExtensions.split(',').length - 1}</span>
                    )}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors shrink-0">
                    <span>Open</span>
                    <span className="size-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:translate-x-0.5 transition-all duration-200">
                      <ArrowRight className="size-2.5" />
                    </span>
                  </span>
                </div>
              )}

              {/* Drag over overlay hint (only for file tools) */}
              {isDraggingThis && tool.category !== 'calculator' && (
                <div className="absolute inset-0 bg-indigo-50/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 animate-fade-in rounded-2xl">
                  <Sparkles className="size-8 text-indigo-600 mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-slate-900">Drop file to open in</p>
                  <p className="text-xs text-indigo-600 font-semibold">{tool.shortTitle || tool.title}</p>
                </div>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
};
