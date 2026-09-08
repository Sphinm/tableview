import { useState, useRef, useEffect } from 'react';
import {
  Table,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  BookOpen,
  Info,
  MessageSquare,
  Sun,
  Moon,
  RefreshCw,
  Calculator,
  Home,
  ArrowRightLeft,
  Car,
  TrendingUp,
  ChevronDown,
  ArrowRight,
  FileSpreadsheet,
  FileOutput,
  FileInput,
  FileCode,
  Layers
} from 'lucide-react';
import { navigateTo } from '../lib/router';

interface HeaderProps {
  onTrySample?: () => void;
  isLoading?: boolean;
  currentPath?: string;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header = ({ onTrySample, isLoading, currentPath = '/', theme = 'dark', onToggleTheme }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parquetDropdownOpen, setParquetDropdownOpen] = useState(false);
  const [calcDropdownOpen, setCalcDropdownOpen] = useState(false);
  const [mobileParquetExpanded, setMobileParquetExpanded] = useState(false);
  const [mobileCalcsExpanded, setMobileCalcsExpanded] = useState(false);
  const parquetDropdownRef = useRef<HTMLDivElement>(null);
  const parquetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const calcDropdownRef = useRef<HTMLDivElement>(null);
  const calcTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      const target = e.target as Node;
      if (parquetDropdownRef.current && !parquetDropdownRef.current.contains(target)) {
        setParquetDropdownOpen(false);
      }
      if (calcDropdownRef.current && !calcDropdownRef.current.contains(target)) {
        setCalcDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setParquetDropdownOpen(false);
        setCalcDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (parquetTimeoutRef.current) clearTimeout(parquetTimeoutRef.current);
      if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
    };
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
    setMobileMenuOpen(false);
    setParquetDropdownOpen(false);
    setCalcDropdownOpen(false);
  };

  const toggleParquetDropdown = () => {
    setCalcDropdownOpen(false);
    setParquetDropdownOpen((prev) => !prev);
  };

  const toggleCalcDropdown = () => {
    setParquetDropdownOpen(false);
    setCalcDropdownOpen((prev) => !prev);
  };

  const handleParquetEnter = () => {
    if (parquetTimeoutRef.current) clearTimeout(parquetTimeoutRef.current);
    setCalcDropdownOpen(false);
    setParquetDropdownOpen(true);
  };

  const handleParquetLeave = () => {
    parquetTimeoutRef.current = setTimeout(() => {
      setParquetDropdownOpen(false);
    }, 180);
  };

  const handleCalcEnter = () => {
    if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
    setParquetDropdownOpen(false);
    setCalcDropdownOpen(true);
  };

  const handleCalcLeave = () => {
    calcTimeoutRef.current = setTimeout(() => {
      setCalcDropdownOpen(false);
    }, 180);
  };

  // Active state checkers
  const isParquetSection = currentPath.startsWith('/parquet-') || currentPath.startsWith('/csv-') || currentPath.startsWith('/json-');
  const isWorkbench = !isParquetSection && (currentPath === '/' || currentPath === '');
  const isCalculatorSection = currentPath.includes('calculator') || currentPath.includes('refinance') || currentPath.includes('mortgage');
  const isGuides = currentPath.startsWith('/guides');
  const isAbout = currentPath === '/about';
  const isContact = currentPath === '/contact';

  const parquetItems = [
    {
      title: 'Parquet Viewer Online',
      description: 'Instant in-browser viewer & SQL explorer for .parquet & GeoParquet',
      path: '/parquet-viewer',
      icon: Table,
      badge: 'Instant'
    },
    {
      title: 'Parquet to Excel (.xlsx)',
      description: 'Convert Parquet directly to Microsoft Excel spreadsheets',
      path: '/parquet-to-excel',
      icon: FileSpreadsheet,
      badge: 'Popular'
    },
    {
      title: 'Parquet to CSV',
      description: 'Extract and stream Parquet datasets into plain text CSV files',
      path: '/parquet-to-csv',
      icon: FileOutput
    },
    {
      title: 'CSV to Parquet (ZSTD)',
      description: 'Convert large CSV tables into compressed columnar Parquet',
      path: '/csv-to-parquet',
      icon: FileInput
    },
    {
      title: 'JSON to Parquet',
      description: 'Transform newline-delimited or nested JSON into typed Parquet',
      path: '/json-to-parquet',
      icon: FileCode
    },
    {
      title: 'Schema & Metadata Inspector',
      description: 'Inspect row groups, compression codecs, schemas & null rates',
      path: '/parquet-schema-inspector',
      icon: Layers
    }
  ];

  const calculatorItems = [
    {
      title: 'Mortgage Calculator',
      description: 'P&I, Property Tax, PMI, HOA & Amortization schedule',
      path: '/mortgage-calculator',
      icon: Home,
      badge: 'Popular'
    },
    {
      title: 'Refinance Break-Even',
      description: 'Compare current vs new loan, monthly savings & closing payoff',
      path: '/refinance-calculator',
      icon: ArrowRightLeft,
      badge: 'New'
    },
    {
      title: 'Auto Loan Calculator',
      description: 'Car financing, interest rates, down payments & trade-ins',
      path: '/finance-calculator#auto-calculator',
      icon: Car
    },
    {
      title: 'Compound Interest & Savings',
      description: 'Wealth growth projections, regular deposits & APY compounding',
      path: '/finance-calculator#savings-calculator',
      icon: TrendingUp
    }
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand + Grouped Nav */}
        <div className="flex items-center gap-7">
          <a
            href="/"
            onClick={(e) => handleNav(e, '/')}
            className="flex items-center gap-2.5 group"
          >
            <div className="brand-icon size-8 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
              <Table className="size-4.5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-100 tracking-tight">TableView</span>
              <span className="text-xs text-slate-400 font-mono">.dev</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {/* 1. Workbench */}
            <a
              href="/"
              onClick={(e) => handleNav(e, '/')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isWorkbench
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              Workbench
            </a>

            {/* 2. Parquet Tools Dropdown Menu */}
            <div
              ref={parquetDropdownRef}
              className="relative"
              onMouseEnter={handleParquetEnter}
              onMouseLeave={handleParquetLeave}
            >
              <button
                type="button"
                onClick={toggleParquetDropdown}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer select-none ${
                  isParquetSection || parquetDropdownOpen
                    ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                aria-expanded={parquetDropdownOpen}
              >
                <Table className="size-4 text-emerald-400" />
                <span>Parquet Tools</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 opacity-70 ${
                    parquetDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Parquet Tools Flyout Panel */}
              {parquetDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-[390px] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-2xl backdrop-blur-2xl overflow-hidden p-2">
                    <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                        Parquet & Data Tools
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        DuckDB-Wasm
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {parquetItems.map((tool) => (
                        <a
                          key={tool.path}
                          href={tool.path}
                          onClick={(e) => handleNav(e, tool.path)}
                          className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="size-8 rounded-lg bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <tool.icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {tool.title}
                              </span>
                              {tool.badge && (
                                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                                  tool.badge === 'Popular'
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                }`}>
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug truncate mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Bottom Link: Main Workbench */}
                    <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <a
                        href="/"
                        onClick={(e) => handleNav(e, '/')}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Table className="size-3.5" />
                          <span>Open Main Workbench Studio</span>
                        </span>
                        <ArrowRight className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Calculators Dropdown Menu */}
            <div
              ref={calcDropdownRef}
              className="relative"
              onMouseEnter={handleCalcEnter}
              onMouseLeave={handleCalcLeave}
            >
              <button
                type="button"
                onClick={toggleCalcDropdown}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer select-none ${
                  isCalculatorSection || calcDropdownOpen
                    ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                aria-expanded={calcDropdownOpen}
              >
                <Calculator className="size-4 text-indigo-400" />
                <span>Calculators</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 opacity-70 ${
                    calcDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Calculators Flyout Panel */}
              {calcDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-[380px] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-2xl backdrop-blur-2xl overflow-hidden p-2">
                    <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                        Financial Calculators
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        100% Client-Side
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {calculatorItems.map((calc) => (
                        <a
                          key={calc.path}
                          href={calc.path}
                          onClick={(e) => handleNav(e, calc.path)}
                          className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="size-8 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <calc.icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {calc.title}
                              </span>
                              {calc.badge && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                                  {calc.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug truncate mt-0.5">
                              {calc.description}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Bottom Link: View all */}
                    <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <a
                        href="/finance-calculator"
                        onClick={(e) => handleNav(e, '/finance-calculator')}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Calculator className="size-3.5" />
                          <span>Browse All Calculators Hub</span>
                        </span>
                        <ArrowRight className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Guides */}
            <a
              href="/guides"
              onClick={(e) => handleNav(e, '/guides')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isGuides
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="size-4" />
              Guides
            </a>

            {/* 5. About */}
            <a
              href="/about"
              onClick={(e) => handleNav(e, '/about')}
              className={`hidden lg:flex px-3 py-1.5 rounded-lg transition-colors items-center gap-1.5 ${
                isAbout
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Info className="size-4" />
              About
            </a>

            {/* 6. Contact */}
            <a
              href="/contact"
              onClick={(e) => handleNav(e, '/contact')}
              className={`hidden lg:flex px-3 py-1.5 rounded-lg transition-colors items-center gap-1.5 ${
                isContact
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="size-4" />
              Contact
            </a>
          </nav>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Client Sandbox</span>
          </div>

          {onTrySample && (
            <button
              onClick={onTrySample}
              disabled={isLoading}
              className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-75 shrink-0 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-amber-400 dark:text-amber-500" />
                  <span>Try Sample</span>
                </>
              )}
            </button>
          )}

          {/* Theme Switcher Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme (白色主题)' : 'Switch to Dark Theme (黑色主题)'}
              aria-label="Toggle theme color"
            >
              {theme === 'dark' ? (
                <Sun className="size-4.5 text-amber-400" />
              ) : (
                <Moon className="size-4.5 text-indigo-600 dark:text-slate-400" />
              )}
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800 md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600 dark:text-slate-400" />}
                <span>Theme Mode</span>
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {theme === 'dark' ? 'Dark (黑色)' : 'Light (白色)'}
              </span>
            </button>
          )}

          {/* Workbench */}
          <a
            href="/"
            onClick={(e) => handleNav(e, '/')}
            className={`block px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 ${
              isWorkbench
                ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Table className="size-4 text-slate-400" />
            <span>Workbench (Studio)</span>
          </a>

          {/* Parquet & Data Tools Accordion */}
          <div className="border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/40">
            <button
              onClick={() => setMobileParquetExpanded(!mobileParquetExpanded)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-700 dark:text-slate-200 text-sm font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Table className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Parquet & Data Tools</span>
              </span>
              <ChevronDown className={`size-4 transition-transform duration-200 text-slate-400 ${mobileParquetExpanded ? 'rotate-180' : ''}`} />
            </button>

            {mobileParquetExpanded && (
              <div className="px-2 pb-2 space-y-1 border-t border-slate-200 dark:border-slate-800/60 pt-1.5">
                {parquetItems.map((p) => (
                  <a
                    key={p.path}
                    href={p.path}
                    onClick={(e) => handleNav(e, p.path)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <p.icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{p.title}</span>
                    </div>
                    {p.badge && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                        p.badge === 'Popular'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}>
                        {p.badge}
                      </span>
                    )}
                  </a>
                ))}
                <a
                  href="/"
                  onClick={(e) => handleNav(e, '/')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                >
                  <span>Open Main Workbench Studio</span>
                  <ArrowRight className="size-3" />
                </a>
              </div>
            )}
          </div>

          {/* Calculators Accordion */}
          <div className="border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/40">
            <button
              onClick={() => setMobileCalcsExpanded(!mobileCalcsExpanded)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-700 dark:text-slate-200 text-sm font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Calculator className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span>Financial Calculators</span>
              </span>
              <ChevronDown className={`size-4 transition-transform duration-200 text-slate-400 ${mobileCalcsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {mobileCalcsExpanded && (
              <div className="px-2 pb-2 space-y-1 border-t border-slate-200 dark:border-slate-800/60 pt-1.5">
                {calculatorItems.map((c) => (
                  <a
                    key={c.path}
                    href={c.path}
                    onClick={(e) => handleNav(e, c.path)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <c.icon className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{c.title}</span>
                  </a>
                ))}
                <a
                  href="/finance-calculator"
                  onClick={(e) => handleNav(e, '/finance-calculator')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  <span>All 8+ Calculators Hub</span>
                  <ArrowRight className="size-3" />
                </a>
              </div>
            )}
          </div>

          {/* Guides */}
          <a
            href="/guides"
            onClick={(e) => handleNav(e, '/guides')}
            className={`block px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 ${
              isGuides
                ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="size-4 text-slate-400" />
            <span>Guides & Articles</span>
          </a>

          {/* About */}
          <a
            href="/about"
            onClick={(e) => handleNav(e, '/about')}
            className={`block px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 ${
              isAbout
                ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Info className="size-4 text-slate-400" />
            <span>About TableView</span>
          </a>

          {/* Contact */}
          <a
            href="/contact"
            onClick={(e) => handleNav(e, '/contact')}
            className={`block px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 ${
              isContact
                ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="size-4 text-slate-400" />
            <span>Contact & Support</span>
          </a>

          <div className="pt-2 border-t border-slate-900/80 flex items-center gap-2 text-xs text-emerald-500 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>100% Client-Side Sandbox</span>
          </div>
        </div>
      )}
    </header>
  );
};
