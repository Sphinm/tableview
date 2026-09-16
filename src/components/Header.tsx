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
  Calculator,
  Home,
  ArrowRightLeft,
  ChevronDown,
  ArrowRight,
  FileSpreadsheet,
  FileOutput,
  FileInput,
  FileCode,
  Layers,
  Building,
  Hammer,
  Server,
  Zap,
  FileText,
  Terminal,
  Database,
  Scale,
  Building2,
  DollarSign,
  Video,
  Image as ImageIcon,
  LogOut,
  Activity
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { isCalculatorRoute, isCompressionRoute } from '../lib/resolveRoute';
import { useAuth } from '../lib/useAuth';

interface HeaderProps {
  onTrySample?: () => void;
  isLoading?: boolean;
  currentPath?: string;
}

export const Header = ({ onTrySample: _onTrySample, isLoading: _isLoading, currentPath = '/' }: HeaderProps) => {
  const { user, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parquetDropdownOpen, setParquetDropdownOpen] = useState(false);
  const [calcDropdownOpen, setCalcDropdownOpen] = useState(false);
  const [compressDropdownOpen, setCompressDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileParquetExpanded, setMobileParquetExpanded] = useState(false);
  const [mobileCalcsExpanded, setMobileCalcsExpanded] = useState(false);
  const [mobileCompressExpanded, setMobileCompressExpanded] = useState(false);
  const parquetDropdownRef = useRef<HTMLDivElement>(null);
  const parquetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const calcDropdownRef = useRef<HTMLDivElement>(null);
  const calcTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const compressDropdownRef = useRef<HTMLDivElement>(null);
  const compressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      if (compressDropdownRef.current && !compressDropdownRef.current.contains(target)) {
        setCompressDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setParquetDropdownOpen(false);
        setCalcDropdownOpen(false);
        setCompressDropdownOpen(false);
        setUserMenuOpen(false);
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
      if (compressTimeoutRef.current) clearTimeout(compressTimeoutRef.current);
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
    setCompressDropdownOpen(false);
    setCalcDropdownOpen((prev) => !prev);
  };

  const toggleCompressDropdown = () => {
    setParquetDropdownOpen(false);
    setCalcDropdownOpen(false);
    setCompressDropdownOpen((prev) => !prev);
  };

  const handleParquetEnter = () => {
    if (parquetTimeoutRef.current) clearTimeout(parquetTimeoutRef.current);
    setCalcDropdownOpen(false);
    setCompressDropdownOpen(false);
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
    setCompressDropdownOpen(false);
    setCalcDropdownOpen(true);
  };

  const handleCalcLeave = () => {
    calcTimeoutRef.current = setTimeout(() => {
      setCalcDropdownOpen(false);
    }, 180);
  };

  const handleCompressEnter = () => {
    if (compressTimeoutRef.current) clearTimeout(compressTimeoutRef.current);
    setParquetDropdownOpen(false);
    setCalcDropdownOpen(false);
    setCompressDropdownOpen(true);
  };

  const handleCompressLeave = () => {
    compressTimeoutRef.current = setTimeout(() => {
      setCompressDropdownOpen(false);
    }, 180);
  };

  // Active state checkers
  const isToolsSection =
    currentPath.startsWith('/data-tools') ||
    currentPath.startsWith('/csv-') ||
    currentPath.startsWith('/excel-') ||
    currentPath.startsWith('/parquet-') ||
    currentPath.startsWith('/json-') ||
    currentPath.startsWith('/sql-') ||
    currentPath.startsWith('/tools');
  const isCalculatorSection = isCalculatorRoute(currentPath);
  const isCompressSection = isCompressionRoute(currentPath);
  const isGuides = currentPath.startsWith('/guides');
  const isAbout = currentPath === '/about';
  const isContact = currentPath === '/contact';

  const viewerItems = [
    {
      title: 'CSV Viewer',
      description: 'Open & search CSV without Excel',
      path: '/csv-viewer',
      icon: FileText,
      badge: 'Popular'
    },
    {
      title: 'Excel Viewer',
      description: 'View .xlsx/.xls spreadsheets online',
      path: '/excel-viewer',
      icon: FileSpreadsheet,
      badge: 'Popular'
    },
    {
      title: 'Parquet Viewer',
      description: 'Instant Wasm viewer & SQL explorer',
      path: '/parquet-viewer',
      icon: Table,
      badge: 'Core'
    },
    {
      title: 'JSON & NDJSON Viewer',
      description: 'Collapsible tree & table grid',
      path: '/json-viewer',
      icon: FileCode
    }
  ];

  const converterItems = [
    {
      title: 'CSV to Excel (.xlsx)',
      description: 'Direct native Excel workbook generator',
      path: '/csv-to-excel',
      icon: FileSpreadsheet,
      badge: 'Popular'
    },
    {
      title: 'Parquet to Excel',
      description: 'Columnar tables to formatted Excel',
      path: '/parquet-to-excel',
      icon: FileSpreadsheet,
      badge: 'Popular'
    },
    {
      title: 'Parquet to CSV',
      description: 'Extract and stream Parquet to CSV',
      path: '/parquet-to-csv',
      icon: FileOutput
    },
    {
      title: 'CSV to Parquet',
      description: 'Compress CSV into high-speed Parquet',
      path: '/csv-to-parquet',
      icon: FileInput,
      badge: 'ZSTD'
    },
    {
      title: 'Excel to CSV',
      description: 'Extract Excel sheets to clean CSV',
      path: '/excel-to-csv',
      icon: FileOutput
    },
    {
      title: 'Excel to Parquet',
      description: 'Excel spreadsheets to columnar Parquet',
      path: '/excel-to-parquet',
      icon: Database
    },
    {
      title: 'CSV to JSON',
      description: 'Convert CSV into JSON arrays/NDJSON',
      path: '/csv-to-json',
      icon: FileCode
    },
    {
      title: 'JSON to Parquet',
      description: 'JSON/NDJSON to columnar Parquet',
      path: '/json-to-parquet',
      icon: FileCode
    }
  ];

  const analyticsItems = [
    {
      title: 'SQL on CSV / Parquet',
      description: 'Run DuckDB SQL queries in browser',
      path: '/sql-workbench',
      icon: Terminal,
      badge: 'SQL'
    },
    {
      title: 'JSON Formatter',
      description: 'Prettify, validate & fix JSON syntax',
      path: '/json-formatter',
      icon: FileCode
    },
    {
      title: 'SQL Formatter',
      description: 'Beautify & format SQL queries',
      path: '/sql-formatter',
      icon: Terminal
    },
    {
      title: 'Schema & Profiling',
      description: 'Inspect schemas, null rates & DDL',
      path: '/parquet-schema-inspector',
      icon: Layers
    },
    {
      title: 'Storage & Query Savings',
      description: 'Calculate S3 & Athena cost cuts',
      path: '/parquet-storage-calculator',
      icon: Zap,
      badge: 'Savings'
    },
    {
      title: 'Website Status Checker',
      description: 'Check if website is down right now',
      path: '/is-it-down',
      icon: Activity,
      badge: 'Live'
    }
  ];

  const realEstateCalcs = [
    {
      title: 'DSCR Loan Calculator',
      description: 'Rental cash flow, DSCR ratio & qualification tiers',
      path: '/dscr-loan-calculator',
      icon: Building,
      badge: 'Rental ROI'
    },
    {
      title: 'Commercial Loan & Balloon',
      description: 'Amortization, balloon balance & debt coverage',
      path: '/commercial-loan-calculator',
      icon: Building2,
      badge: 'Commercial'
    },
    {
      title: '1031 Exchange Tax Shield',
      description: 'Capital gains deferral & replacement boot analysis',
      path: '/section-1031-exchange-calculator',
      icon: Scale,
      badge: 'Tax Deferral'
    },
    {
      title: 'Loan Comparison (Side-by-Side)',
      description: 'Compare 2 loans: APR, monthly & lifetime interest',
      path: '/loan-comparison-calculator',
      icon: Scale,
      badge: 'Compare'
    },
    {
      title: 'Mortgage Calculator',
      description: 'P&I, Property Tax, PMI, HOA & Amortization schedule',
      path: '/mortgage-calculator',
      icon: Home,
      badge: 'Popular'
    },
    {
      title: 'Refinance Break-Even',
      description: 'Compare current vs new loan & closing payoff',
      path: '/refinance-calculator',
      icon: ArrowRightLeft,
      badge: 'Refinance'
    },
    {
      title: 'Hard Money & Fix-Flip',
      description: 'Fix & flip points, holding costs & 70% rule MAO',
      path: '/hard-money-calculator',
      icon: Hammer,
      badge: '70% Rule'
    }
  ];

  const payrollCalcs = [
    {
      title: 'Salary to Hourly & Payroll',
      description: 'Convert annual salary to hourly, bi-weekly & overtime',
      path: '/salary-to-hourly-calculator',
      icon: DollarSign,
      badge: 'Payroll'
    }
  ];

  const cloudFinOpsCalcs = [
    {
      title: 'Snowflake Warehouse Cost',
      description: 'Warehouse compute credits & autoscaling suspend savings',
      path: '/snowflake-cost-calculator',
      icon: Server,
      badge: 'FinOps'
    },
    {
      title: 'Parquet Cloud Savings',
      description: 'S3 byte reduction & Athena / BigQuery scan cut',
      path: '/parquet-storage-calculator',
      icon: Zap,
      badge: 'S3 & Athena'
    }
  ];

  const compressItems = [
    {
      title: 'Video Compressor',
      description: '100% in-browser video compression with target MB & presets',
      path: '/video-compressor',
      icon: Video,
      badge: 'Wasm • No Watermark'
    },
    {
      title: 'Image Compressor',
      description: 'Batch compress JPG, PNG, and WebP with visual slider & ZIP',
      path: '/image-compressor',
      icon: ImageIcon,
      badge: 'Batch • ZIP'
    }
  ];

  const calculatorItems = [...realEstateCalcs, ...payrollCalcs, ...cloudFinOpsCalcs];

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand + Grouped Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <a
            href="/"
            onClick={(e) => handleNav(e, '/')}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="brand-icon size-8.5 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-all bg-indigo-600 text-white shadow-indigo-600/20">
              <Table className="size-4.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">TableView</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">.dev</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {/* 1. Calculators Dropdown Menu (Primary Focus) */}
            <div
              ref={calcDropdownRef}
              className="relative"
              onMouseEnter={handleCalcEnter}
              onMouseLeave={handleCalcLeave}
            >
              <button
                type="button"
                onClick={toggleCalcDropdown}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer select-none whitespace-nowrap ${
                  isCalculatorSection || calcDropdownOpen
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-900 hover:bg-slate-100'
                }`}
                aria-expanded={calcDropdownOpen}
              >
                <span>Calculators</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 text-slate-700 ${
                    calcDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Calculators Flyout Panel */}
              {calcDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-[680px] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl overflow-hidden p-3.5">
                    <div className="px-3 pt-1 pb-2.5 flex items-center justify-between border-b border-slate-100">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold">
                        Financial, Real Estate & FinOps Calculators
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        100% Client-Side · Zero Server Math
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-2">
                      {/* Column 1: Real Estate & Commercial Loans */}
                      <div className="space-y-0.5">
                        <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                          Real Estate & Commercial Debt
                        </div>
                        {realEstateCalcs.map((calc) => (
                          <a
                            key={calc.path}
                            href={calc.path}
                            onClick={(e) => handleNav(e, calc.path)}
                            className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="size-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                              <calc.icon className="size-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {calc.title}
                                </span>
                                {calc.badge && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                    {calc.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-700 leading-snug truncate mt-0.5">
                                {calc.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Column 2: Payroll, Compensation & Cloud FinOps */}
                      <div className="space-y-3">
                        {/* Payroll & Compensation */}
                        <div className="space-y-0.5">
                          <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                            Payroll & Compensation
                          </div>
                          {payrollCalcs.map((calc) => (
                            <a
                              key={calc.path}
                              href={calc.path}
                              onClick={(e) => handleNav(e, calc.path)}
                              className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              <div className="size-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                <calc.icon className="size-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                    {calc.title}
                                  </span>
                                  {calc.badge && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                      {calc.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-700 leading-snug truncate mt-0.5">
                                  {calc.description}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>

                        {/* Cloud FinOps */}
                        <div className="space-y-0.5 pt-2 border-t border-slate-100">
                          <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                            Cloud & Data FinOps
                          </div>
                          {cloudFinOpsCalcs.map((calc) => (
                            <a
                              key={calc.path}
                              href={calc.path}
                              onClick={(e) => handleNav(e, calc.path)}
                              className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              <div className="size-7 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                <calc.icon className="size-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                                    {calc.title}
                                  </span>
                                  {calc.badge && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200/60">
                                      {calc.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-700 leading-snug truncate mt-0.5">
                                  {calc.description}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>

                        {/* Trust card */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 leading-relaxed">
                          <span className="font-semibold text-slate-900 block mb-0.5">100% Private In-Browser</span>
                          Interest amortization, tax deferral, and wage math run client-side in WebAssembly. No sensitive numbers touch a server.
                        </div>
                      </div>
                    </div>

                    {/* Bottom Link: View all */}
                    <div className="pt-2 border-t border-slate-100">
                      <a
                        href="/finance-calculator"
                        onClick={(e) => handleNav(e, '/finance-calculator')}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Calculator className="size-3.5" />
                          <span>Browse All 10+ Financial & FinOps Calculators</span>
                        </span>
                        <ArrowRight className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Data Tools Dropdown Menu (Secondary Focus) */}
            <div
              ref={parquetDropdownRef}
              className="relative"
              onMouseEnter={handleParquetEnter}
              onMouseLeave={handleParquetLeave}
            >
              <button
                type="button"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) return;
                  toggleParquetDropdown();
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer select-none whitespace-nowrap ${
                  isToolsSection || parquetDropdownOpen
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-900 hover:bg-slate-100'
                }`}
                aria-expanded={parquetDropdownOpen}
              >
                <span>Data Tools</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 text-slate-700 ${
                    parquetDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Data Tools Mega Dropdown Panel */}
              {parquetDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-[760px] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl overflow-hidden p-3.5">
                    <div className="px-3 pt-1 pb-2.5 flex items-center justify-between border-b border-slate-100">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                        All In-Browser Data Tools & Workbench
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        DuckDB-Wasm SIMD · 100% Client-Side
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 py-2">
                      {/* Column 1: Viewers */}
                      <div className="space-y-1">
                        <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Viewers
                        </p>
                        {viewerItems.map((tool) => (
                          <a
                            key={tool.path}
                            href={tool.path}
                            onClick={(e) => handleNav(e, tool.path)}
                            className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="size-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                              <tool.icon className="size-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                  {tool.title}
                                </span>
                                {tool.badge && (
                                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-700 truncate mt-0.5">
                                {tool.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Column 2: Converters */}
                      <div className="space-y-1">
                        <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Converters
                        </p>
                        {converterItems.map((tool) => (
                          <a
                            key={tool.path}
                            href={tool.path}
                            onClick={(e) => handleNav(e, tool.path)}
                            className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="size-7 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center shrink-0 mt-0.5">
                              <tool.icon className="size-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {tool.title}
                                </span>
                                {tool.badge && (
                                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-700 truncate mt-0.5">
                                {tool.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Column 3: SQL & Analytics */}
                      <div className="space-y-1">
                        <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          SQL & Analytics
                        </p>
                        {analyticsItems.map((tool) => (
                          <a
                            key={tool.path}
                            href={tool.path}
                            onClick={(e) => handleNav(e, tool.path)}
                            className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="size-7 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200/60 flex items-center justify-center shrink-0 mt-0.5">
                              <tool.icon className="size-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                                  {tool.title}
                                </span>
                                {tool.badge && (
                                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200/60">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-700 truncate mt-0.5">
                                {tool.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Link: Main Workbench */}
                    <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between px-3">
                      <a
                        href="/data-tools"
                        onClick={(e) => handleNav(e, '/data-tools')}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="size-3.5" />
                        <span>Open In-Browser Data Workbench</span>
                        <ArrowRight className="size-3" />
                      </a>

                      <span className="text-[11px] text-slate-600 font-mono font-medium">
                        Zero server telemetry
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Media Compress Dropdown Menu */}
            <div
              ref={compressDropdownRef}
              className="relative"
              onMouseEnter={handleCompressEnter}
              onMouseLeave={handleCompressLeave}
            >
              <button
                type="button"
                onClick={toggleCompressDropdown}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer select-none whitespace-nowrap ${
                  isCompressSection || compressDropdownOpen
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-900 hover:bg-slate-100'
                }`}
                aria-expanded={compressDropdownOpen}
              >
                <span>Compress</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 text-slate-700 ${
                    compressDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Compress Dropdown Panel */}
              {compressDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-[380px] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl overflow-hidden p-3 space-y-1">
                    <div className="px-3 pt-1 pb-2 flex items-center justify-between border-b border-slate-100 mb-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold">
                        In-Browser Media Compression
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        100% Client-Side
                      </span>
                    </div>

                    {compressItems.map((item) => (
                      <a
                        key={item.path}
                        href={item.path}
                        onClick={(e) => handleNav(e, item.path)}
                        className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="size-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <item.icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-700 leading-snug mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Guides */}
            <a
              href="/guides"
              onClick={(e) => handleNav(e, '/guides')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                isGuides
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-900 hover:bg-slate-100'
              }`}
            >
              Guides
            </a>
          </nav>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          {/* Auth: User Account / Sign In */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 py-1 px-2 sm:px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-xs hover:border-slate-300"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User avatar'}
                    className="size-6 rounded-full object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="size-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="max-w-[120px] truncate font-bold text-slate-900 hidden sm:inline">
                  {user.name || user.email.split('@')[0]}
                </span>
                <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95 divide-y divide-slate-100">
                  {/* User Identity Section */}
                  <div className="pb-3 flex items-start gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || 'User avatar'}
                        className="size-11 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="size-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {user.name || 'User'}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                        {user.email}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          <ShieldCheck className="size-3 text-emerald-600" />
                          Google Account
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="py-2 space-y-0.5 text-xs">
                    <a
                      href="/video-compressor"
                      onClick={(e) => handleNav(e, '/video-compressor')}
                      className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Video className="size-3.5 text-blue-600" />
                        <span className="font-medium">Video Compressor</span>
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                        Wasm
                      </span>
                    </a>
                    <a
                      href="/image-compressor"
                      onClick={(e) => handleNav(e, '/image-compressor')}
                      className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ImageIcon className="size-3.5 text-emerald-600" />
                        <span className="font-medium">Image Compressor</span>
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Batch
                      </span>
                    </a>
                    <a
                      href="/data-tools"
                      onClick={(e) => handleNav(e, '/data-tools')}
                      className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Database className="size-3.5 text-purple-600" />
                        <span className="font-medium">Data Tools Workbench</span>
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60">
                        DuckDB
                      </span>
                    </a>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 1. Calculators Accordion (Primary Focus) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={() => setMobileCalcsExpanded(!mobileCalcsExpanded)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-900 text-sm font-bold cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Calculator className="size-4 text-indigo-600" />
                <span>Financial & FinOps Calculators</span>
              </span>
              <ChevronDown className={`size-4 transition-transform duration-200 text-slate-600 ${mobileCalcsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {mobileCalcsExpanded && (
              <div className="px-2 pb-2 space-y-1 border-t border-slate-200/80 pt-1.5 max-h-72 overflow-y-auto">
                {calculatorItems.map((c) => (
                  <a
                    key={c.path}
                    href={c.path}
                    onClick={(e) => handleNav(e, c.path)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-900 hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <c.icon className="size-3.5 text-indigo-600" />
                      <span>{c.title}</span>
                    </div>
                    {c.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded border bg-indigo-50 text-indigo-700 border-indigo-200/60">
                        {c.badge}
                      </span>
                    )}
                  </a>
                ))}
                <a
                  href="/finance-calculator"
                  onClick={(e) => handleNav(e, '/finance-calculator')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <span>Browse All Calculators Hub</span>
                  <ArrowRight className="size-3" />
                </a>
              </div>
            )}
          </div>

          {/* 2. Data Tools Accordion (Secondary Focus) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={() => setMobileParquetExpanded(!mobileParquetExpanded)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-900 text-sm font-bold cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Table className="size-4 text-emerald-600" />
                <span>Data Tools (Viewers, Converters, SQL)</span>
              </span>
              <ChevronDown className={`size-4 transition-transform duration-200 text-slate-600 ${mobileParquetExpanded ? 'rotate-180' : ''}`} />
            </button>

            {mobileParquetExpanded && (
              <div className="px-2 pb-2 space-y-1 border-t border-slate-200/80 pt-1.5 max-h-72 overflow-y-auto">
                <a
                  href="/data-tools"
                  onClick={(e) => handleNav(e, '/data-tools')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 transition-colors mb-1"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5" />
                    <span>Open Data Workbench</span>
                  </div>
                  <ArrowRight className="size-3" />
                </a>
                {[...viewerItems, ...converterItems, ...analyticsItems].map((p) => (
                  <a
                    key={p.path}
                    href={p.path}
                    onClick={(e) => handleNav(e, p.path)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-900 hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <p.icon className="size-3.5 text-emerald-600" />
                      <span>{p.title}</span>
                    </div>
                    {p.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded border bg-emerald-50 text-emerald-700 border-emerald-200/60">
                        {p.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* 3. Media Compress Accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={() => setMobileCompressExpanded(!mobileCompressExpanded)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-900 text-sm font-bold cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Video className="size-4 text-blue-600" />
                <span>Media Compress (Video & Image)</span>
              </span>
              <ChevronDown className={`size-4 transition-transform duration-200 text-slate-600 ${mobileCompressExpanded ? 'rotate-180' : ''}`} />
            </button>

            {mobileCompressExpanded && (
              <div className="px-2 pb-2 space-y-1 border-t border-slate-200/80 pt-1.5">
                {compressItems.map((p) => (
                  <a
                    key={p.path}
                    href={p.path}
                    onClick={(e) => handleNav(e, p.path)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-900 hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <p.icon className="size-3.5 text-blue-600" />
                      <span>{p.title}</span>
                    </div>
                    {p.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded border bg-blue-50 text-blue-700 border-blue-200/60">
                        {p.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Guides */}
          <a
            href="/guides"
            onClick={(e) => handleNav(e, '/guides')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-semibold transition-colors ${
              isGuides
                ? 'bg-slate-100 text-slate-900 border border-slate-200'
                : 'text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="size-4 text-slate-700" />
            <span>Guides & Articles</span>
          </a>

          {/* About */}
          <a
            href="/about"
            onClick={(e) => handleNav(e, '/about')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-semibold transition-colors ${
              isAbout
                ? 'bg-slate-100 text-slate-900 border border-slate-200'
                : 'text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Info className="size-4 text-slate-700" />
            <span>About TableView</span>
          </a>

          {/* Contact */}
          <a
            href="/contact"
            onClick={(e) => handleNav(e, '/contact')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-semibold transition-colors ${
              isContact
                ? 'bg-slate-100 text-slate-900 border border-slate-200'
                : 'text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="size-4 text-slate-700" />
            <span>Contact & Support</span>
          </a>

          {/* Mobile Auth button */}
          <div className="pt-2">
            {user ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="size-4" />
                <span>Sign In to TableView</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700">
            <ShieldCheck className="size-4" />
            <span>100% Client-Side Sandbox</span>
          </div>
        </div>
      )}
    </header>
  );
};
