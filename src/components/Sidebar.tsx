import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Building,
  Scale,
  Home,
  FileSpreadsheet,
  Database,
  Terminal,
  Zap,
  Video,
  Image as ImageIcon,
  BookOpen,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calculator,
  ArrowRightLeft,
  Info,
  X,
  PiggyBank,
  Search,
  Film,
  Home as HomeIcon,
  Braces,
  Code2,
  FileCode,
  Cpu
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { openCookieSettings } from '../lib/consent';
import { getCanonicalPath, getRouteCategory } from '../lib/resolveRoute';

interface SidebarProps {
  currentPath: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface Level2Item {
  title: string;
  shortTitle?: string;
  path: string;
  icon: any;
}

interface Level1Category {
  id: string;
  title: string;
  shortTitle?: string;
  path: string; // Navigating to this displays ALL feature cards for this module
  icon: any;
  cardCountLabel?: string;
  children?: Level2Item[];
}

const isPathActive = (targetPath: string, current: string): boolean => {
  const canonicalTarget = getCanonicalPath(targetPath);
  const canonicalCurrent = getCanonicalPath(current);

  if (canonicalTarget === '/') return canonicalCurrent === '/';
  if (canonicalTarget === canonicalCurrent) return true;

  // Data Converter parent matching
  if (canonicalTarget === '/data-converter') {
    return [
      '/data-converter',
      '/converters',
      '/csv-to-excel',
      '/csv-to-parquet',
      '/csv-to-json',
      '/parquet-to-csv',
      '/parquet-to-excel',
      '/parquet-to-json',
      '/excel-to-csv',
      '/excel-to-parquet',
      '/excel-to-json',
      '/json-to-csv',
      '/json-to-parquet'
    ].includes(canonicalCurrent);
  }

  // Data Viewer parent matching
  if (canonicalTarget === '/csv-viewer') {
    return [
      '/csv-viewer',
      '/excel-viewer',
      '/parquet-viewer',
      '/json-viewer',
      '/tsv-viewer',
      '/geoparquet-viewer'
    ].includes(canonicalCurrent);
  }

  // Mortgage & Refinance Suite parent matching
  if (canonicalTarget === '/mortgage-calculator') {
    return [
      '/mortgage-calculator',
      '/amortization-schedule-calculator',
      '/mortgage-payoff-calculator',
      '/refinance-calculator',
      '/cash-out-refinance-calculator',
      '/loan-comparison-calculator',
      '/balloon-payment-calculator'
    ].includes(canonicalCurrent);
  }

  // Commercial & Investment Loans parent matching
  if (canonicalTarget === '/dscr-loan-calculator') {
    return [
      '/dscr-loan-calculator',
      '/commercial-loan-calculator',
      '/hard-money-calculator'
    ].includes(canonicalCurrent);
  }

  // Section 1031 Exchange parent matching
  if (canonicalTarget === '/section-1031-exchange-calculator') {
    return [
      '/section-1031-exchange-calculator',
      '/1031-exchange-timeline-calculator'
    ].includes(canonicalCurrent);
  }

  // Personal Finance & Salary parent matching
  if (canonicalTarget === '/salary-to-hourly-calculator') {
    return [
      '/salary-to-hourly-calculator',
      '/finance-calculator',
      '/calculator'
    ].includes(canonicalCurrent);
  }

  // Cloud FinOps parent matching
  if (canonicalTarget === '/snowflake-cost-calculator') {
    return [
      '/snowflake-cost-calculator',
      '/parquet-storage-calculator',
      '/parquet-savings-calculator'
    ].includes(canonicalCurrent);
  }

  return false;
};

const NAV_CATEGORIES: Level1Category[] = [
  {
    id: 'home',
    title: 'Platform Overview',
    shortTitle: 'Home',
    path: '/',
    icon: Home
  },
  {
    id: 'calculators',
    title: 'Financial Calculators',
    shortTitle: 'Calculators',
    path: '/finance-calculator', // Clicking Level 1 shows all Calculator Cards
    icon: Calculator,
    cardCountLabel: '4 Suites',
    children: [
      {
        title: 'Mortgage & Refinance Suite',
        shortTitle: 'Mortgage & Refi',
        path: '/mortgage-calculator',
        icon: HomeIcon
      },
      {
        title: 'Commercial & Investment Loans',
        shortTitle: 'Commercial & DSCR',
        path: '/dscr-loan-calculator',
        icon: Building
      },
      {
        title: 'Section 1031 Exchange & Deadlines',
        shortTitle: '1031 Exchange',
        path: '/section-1031-exchange-calculator',
        icon: Scale
      },
      {
        title: 'Personal Finance & Salary',
        shortTitle: 'Salary & Personal',
        path: '/salary-to-hourly-calculator',
        icon: PiggyBank
      }
    ]
  },
  {
    id: 'data',
    title: 'Data Workbench',
    shortTitle: 'Data Tools',
    path: '/data-tools', // Clicking Level 1 shows all Data Tools Cards
    icon: Database,
    cardCountLabel: '6 Tools',
    children: [
      {
        title: 'Data Viewer & SQL (CSV / Parquet / Excel)',
        shortTitle: 'Data Viewer',
        path: '/csv-viewer',
        icon: FileSpreadsheet
      },
      {
        title: 'Universal Data Converter (All Formats)',
        shortTitle: 'Data Converter',
        path: '/data-converter',
        icon: ArrowRightLeft
      },
      {
        title: 'DuckDB In-Browser SQL Console',
        shortTitle: 'SQL Console',
        path: '/sql-workbench',
        icon: Terminal
      },
      {
        title: 'JSON Beautifier & Validator',
        shortTitle: 'JSON Formatter',
        path: '/json-formatter',
        icon: Braces
      },
      {
        title: 'SQL Query Beautifier & Minifier',
        shortTitle: 'SQL Formatter',
        path: '/sql-formatter',
        icon: Code2
      },
      {
        title: 'Cloud Data FinOps (Snowflake & Parquet)',
        shortTitle: 'Cloud FinOps',
        path: '/snowflake-cost-calculator',
        icon: Zap
      }
    ]
  },
  {
    id: 'media',
    title: 'Media Studio',
    shortTitle: 'Media Tools',
    path: '/media-tools', // Clicking Level 1 shows all Media Cards
    icon: Film,
    cardCountLabel: '2 Tools',
    children: [
      {
        title: 'Video Compressor (Wasm FFmpeg)',
        shortTitle: 'Video Compressor',
        path: '/video-compressor',
        icon: Video
      },
      {
        title: 'Batch Image Compressor (Client)',
        shortTitle: 'Image Compressor',
        path: '/image-compressor',
        icon: ImageIcon
      }
    ]
  },
  {
    id: 'guides',
    title: 'Technical Guides',
    shortTitle: 'Guides',
    path: '/guides', // Clicking Level 1 shows all Guide Cards
    icon: BookOpen,
    cardCountLabel: '20 Guides',
    children: [
      {
        title: 'What is Apache Parquet?',
        shortTitle: 'Apache Parquet',
        path: '/guides/what-is-apache-parquet',
        icon: FileCode
      },
      {
        title: 'DuckDB vs Traditional Data Warehouses',
        shortTitle: 'DuckDB Architecture',
        path: '/guides/duckdb-wasm-in-browser-olap',
        icon: Cpu
      },
      {
        title: 'DSCR Loan Underwriting Guide',
        shortTitle: 'DSCR Guide',
        path: '/guides/dscr-loans-complete-investor-guide',
        icon: Building
      },
      {
        title: 'Section 1031 Exchange Rules & 45/180 Deadlines',
        shortTitle: '1031 Exchange Guide',
        path: '/guides/section-1031-exchange-rules-timeline',
        icon: Scale
      }
    ]
  },
  {
    id: 'system',
    title: 'System & Diagnostics',
    shortTitle: 'Diagnostics',
    path: '/is-it-down',
    icon: Activity
  }
];

export const Sidebar = ({
  currentPath,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [manuallyToggled, setManuallyToggled] = useState<Record<string, boolean>>({});

  const isCurrentActive = (path: string) => isPathActive(path, currentPath);
  const currentCategory = getRouteCategory(currentPath);

  const checkCategoryActive = (cat: Level1Category): boolean => {
    return cat.id === currentCategory;
  };

  const isGroupOpen = (cat: Level1Category): boolean => {
    if (searchQuery) return true;
    if (typeof manuallyToggled[cat.id] === 'boolean') {
      return manuallyToggled[cat.id];
    }
    const hasActiveChild = Boolean(cat.children?.some((child) => isPathActive(child.path, currentPath)));
    return hasActiveChild || cat.id === currentCategory;
  };

  const toggleGroup = (groupId: string, currentlyOpen: boolean) => {
    setManuallyToggled((prev) => ({
      ...prev,
      [groupId]: !currentlyOpen
    }));
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
    onCloseMobile();
  };

  const handleLevel1Click = (e: React.MouseEvent<HTMLAnchorElement>, cat: Level1Category) => {
    e.preventDefault();
    // 1. Navigate to the Level 1 hub (shows all feature cards!)
    navigateTo(cat.path);
    onCloseMobile();
    // 2. Toggle this category's Level 2 submenu in the sidebar (展开 / 收起)
    if (cat.children && cat.children.length > 0) {
      const currentlyOpen = isGroupOpen(cat);
      setManuallyToggled((prev) => ({ ...prev, [cat.id]: !currentlyOpen }));
    }
  };

  // Close mobile drawer on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseMobile]);

  // Filter categories and children when searching
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return NAV_CATEGORIES;

    return NAV_CATEGORIES
      .map((cat): Level1Category | null => {
        const catMatches =
          cat.title.toLowerCase().includes(query) ||
          cat.shortTitle?.toLowerCase().includes(query) ||
          cat.path.toLowerCase().includes(query);

        const matchingChildren = cat.children?.filter(
          (child) =>
            child.title.toLowerCase().includes(query) ||
            child.shortTitle?.toLowerCase().includes(query) ||
            child.path.toLowerCase().includes(query)
        );

        if (catMatches || (matchingChildren && matchingChildren.length > 0)) {
          return {
            ...cat,
            children: matchingChildren && matchingChildren.length > 0 ? matchingChildren : cat.children
          };
        }
        return null;
      })
      .filter((cat): cat is Level1Category => cat !== null);
  }, [searchQuery]);

  const renderSidebar = (isCollapsed: boolean) => (
    <div className="h-full flex flex-col bg-white border-r border-slate-200/90 text-slate-700 select-none">
      {/* 1. Brand Logo & Collapse Toggle */}
      <div
        className={`h-14 px-3.5 flex items-center border-b border-slate-200/80 shrink-0 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!isCollapsed ? (
          <a
            href="/"
            onClick={(e) => handleNav(e, '/')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Table className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                TableView<span className="text-indigo-600">.dev</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                Client-Side Suite
              </span>
            </div>
          </a>
        ) : (
          <a
            href="/"
            onClick={(e) => handleNav(e, '/')}
            className="size-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
            title="TableView.dev Home"
          >
            <Table className="size-4" />
          </a>
        )}

        {/* Desktop Collapse Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex size-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 items-center justify-center transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden size-8 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* 2. Search Tools Input (when expanded) */}
      {!isCollapsed && (
        <div className="p-2 border-b border-slate-100">
          <div className="relative flex items-center">
            <Search className="size-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools... (e.g. dscr, csv)"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200/80 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Hierarchical Level 1 & Level 2 Menu */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-thin">
        {filteredCategories.map((cat) => {
          const hasChildren = Boolean(cat.children && cat.children.length > 0);
          const catActive = checkCategoryActive(cat);
          const isOpen = isGroupOpen(cat);
          const CategoryIcon = cat.icon;

          if (isCollapsed) {
            return (
              <a
                key={cat.id}
                href={cat.path}
                onClick={(e) => handleNav(e, cat.path)}
                title={cat.title}
                className={`size-9 mx-auto rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  catActive
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CategoryIcon className="size-4" />
              </a>
            );
          }

          return (
            <div key={cat.id} className="space-y-0.5">
              {/* Level 1 Parent Item Row */}
              <div
                className={`group flex items-center justify-between rounded-xl transition-all ${
                  catActive
                    ? 'bg-slate-100/90 text-slate-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                {/* Clicking icon + title navigates to Level 1 hub page (shows all cards!) */}
                <a
                  href={cat.path}
                  onClick={(e) => handleLevel1Click(e, cat)}
                  className="flex-1 flex items-center gap-2.5 px-2.5 py-2 min-w-0 cursor-pointer"
                  title={`Open ${cat.title} overview`}
                >
                  <div
                    className={`size-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      catActive
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                    }`}
                  >
                    <CategoryIcon className="size-3.5" />
                  </div>
                  <span className="text-xs truncate font-semibold">
                    {cat.title}
                  </span>
                </a>

                {/* Independent Chevron Toggle Button for Level 2 Accordion */}
                {hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleGroup(cat.id, isOpen);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer mr-1"
                    title={isOpen ? 'Collapse submenu' : 'Expand submenu'}
                  >
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-0 text-slate-600' : '-rotate-90'
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Level 2 Submenu Items (Indented with tree guide line) */}
              {hasChildren && isOpen && (
                <div className="ml-4 pl-3.5 border-l border-slate-200/80 space-y-0.5 py-1">
                  {cat.children!.map((child) => {
                    const isChildActive = isCurrentActive(child.path);
                    const ChildIcon = child.icon;

                    return (
                      <a
                        key={child.path}
                        href={child.path}
                        onClick={(e) => handleNav(e, child.path)}
                        title={child.title}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isChildActive
                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ChildIcon
                            className={`size-3 shrink-0 transition-colors ${
                              isChildActive
                                ? 'text-indigo-600'
                                : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <span className="truncate">
                            {child.shortTitle || child.title}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Legal Links */}
      <div className="p-2.5 border-t border-slate-200/80 shrink-0 bg-slate-50/50">
        {!isCollapsed ? (
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 px-1">
            <a
              href="/about"
              onClick={(e) => handleNav(e, '/about')}
              className="hover:text-slate-600 hover:underline"
            >
              About
            </a>
            <span>·</span>
            <a
              href="/privacy"
              onClick={(e) => handleNav(e, '/privacy')}
              className="hover:text-slate-600 hover:underline"
            >
              Privacy
            </a>
            <span>·</span>
            <button
              type="button"
              onClick={openCookieSettings}
              className="hover:text-slate-600 hover:underline cursor-pointer"
            >
              Cookies
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <a
              href="/about"
              onClick={(e) => handleNav(e, '/about')}
              className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
              title="About & Privacy"
            >
              <Info className="size-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen shrink-0 transition-all duration-300 z-30 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderSidebar(collapsed)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-in">
            {renderSidebar(false)}
          </div>
        </div>
      )}
    </>
  );
};
