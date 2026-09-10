import { useState, useRef, type DragEvent } from 'react';
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
  Table
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
  const [dragOverSlug, setDragOverSlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetToolRef = useRef<string | null>(null);

  const toolsList = Object.values(TOOLS_CONFIG);

  // Filter tools based on category and search query
  const filteredTools = toolsList.filter((tool) => {
    const matchesCategory =
      activeCategory === 'all' ? true : tool.category === activeCategory;

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
      default:
        return <Table className={iconSize} />;
    }
  };

  const getColorStyles = (color: ToolConfig['color']) => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          glow: 'group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/10',
          dropGlow: 'border-emerald-400 bg-emerald-950/40 shadow-emerald-500/20'
        };
      case 'green':
        return {
          iconBg: 'bg-green-500/10 text-green-400 border-green-500/30 group-hover:bg-green-500/20 group-hover:border-green-500/50',
          badge: 'bg-green-500/10 text-green-300 border-green-500/20',
          glow: 'group-hover:border-green-500/40 group-hover:shadow-green-500/10',
          dropGlow: 'border-green-400 bg-green-950/40 shadow-green-500/20'
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50',
          badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
          glow: 'group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/10',
          dropGlow: 'border-indigo-400 bg-indigo-950/40 shadow-indigo-500/20'
        };
      case 'cyan':
        return {
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50',
          badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          glow: 'group-hover:border-cyan-500/40 group-hover:shadow-cyan-500/10',
          dropGlow: 'border-cyan-400 bg-cyan-950/40 shadow-cyan-500/20'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 group-hover:bg-amber-500/20 group-hover:border-amber-500/50',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          glow: 'group-hover:border-amber-500/40 group-hover:shadow-amber-500/10',
          dropGlow: 'border-amber-400 bg-amber-950/40 shadow-amber-500/20'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30 group-hover:bg-purple-500/20 group-hover:border-purple-500/50',
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
          glow: 'group-hover:border-purple-500/40 group-hover:shadow-purple-500/10',
          dropGlow: 'border-purple-400 bg-purple-950/40 shadow-purple-500/20'
        };
      default:
        return {
          iconBg: 'bg-slate-800 text-slate-200 border-slate-700',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          glow: 'group-hover:border-slate-600',
          dropGlow: 'border-indigo-400 bg-indigo-950/30'
        };
    }
  };

  const handleCardDragOver = (e: DragEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlug(slug);
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

      {/* Grid Filter Bar: Categories + Search Input (ILovePDF Style) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/80">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Realtime Search Filter Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. CSV, Excel, Parquet)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty State when no tools match query */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
          <SlidersHorizontal className="size-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No tools found matching "{searchQuery}"</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Try searching for "CSV", "Excel", "Parquet", or "SQL".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* The "Small Block Entry Points" Grid (ILovePDF-Style Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredTools.map((tool) => {
          const colors = getColorStyles(tool.color);
          const isDraggingThis = dragOverSlug === tool.slug;

          return (
            <div
              key={tool.slug}
              onClick={() => handleCardClick(tool)}
              onDragOver={(e) => handleCardDragOver(e, tool.slug)}
              onDragLeave={handleCardDragLeave}
              onDrop={(e) => handleCardDrop(e, tool)}
              className={`group relative rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
                isDraggingThis
                  ? `border-2 scale-[1.02] ${colors.dropGlow}`
                  : `border border-slate-800/90 hover:border-slate-700 bg-slate-900/70 hover:bg-slate-900 hover:-translate-y-1 ${colors.glow}`
              }`}
            >
              {/* Card Header: Icon + Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3.5">
                  <div
                    className={`size-11 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-200 shadow-inner ${colors.iconBg}`}
                  >
                    {getToolIcon(tool.iconType)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tool.tag && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-xs uppercase tracking-wider ${colors.badge}`}
                      >
                        {tool.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Title & Short Description */}
                <h3 className="text-base font-bold text-slate-100 group-hover:text-white transition-colors mb-1.5 tracking-tight flex items-center justify-between">
                  <span>{tool.shortTitle || tool.title}</span>
                </h3>

                <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed line-clamp-2 transition-colors mb-4">
                  {tool.subtitle}
                </p>
              </div>

              {/* Card Footer: Accepted Exts & Hover Action Prompt */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-300">
                <span className="font-mono text-[11px] text-slate-400">
                  {tool.acceptExtensions.split(',')[0]}
                  {tool.acceptExtensions.split(',').length > 1 && (
                    <span className="text-slate-400"> +{tool.acceptExtensions.split(',').length - 1}</span>
                  )}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="size-3" />
                </span>
              </div>

              {/* Drag over overlay hint */}
              {isDraggingThis && (
                <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 animate-fade-in">
                  <Sparkles className="size-8 text-amber-400 mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-slate-100">Drop file to open in</p>
                  <p className="text-xs text-indigo-300 font-semibold">{tool.shortTitle || tool.title}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
