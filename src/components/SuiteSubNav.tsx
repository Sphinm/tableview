import { useState, useRef, useEffect } from 'react';
import {
  Home,
  Building,
  Scale,
  Zap,
  PiggyBank,
  ChevronDown,
  Check,
  Layers,
  Video,
  Database
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { getCanonicalPath } from '../lib/resolveRoute';
import { preloadRoute, idlePreloadRoutes } from '../lib/routePreload';

export type SuiteType = 'mortgage' | 'commercial' | '1031' | 'finops' | 'personal' | 'media' | 'data';

interface SubToolItem {
  label: string;
  path: string;
  badge?: string;
}

const SUITE_CONFIG: Record<
  SuiteType,
  {
    title: string;
    icon: any;
    items: SubToolItem[];
  }
> = {
  mortgage: {
    title: 'Mortgage & Refinance Suite',
    icon: Home,
    items: [
      { label: 'Mortgage & PMI', path: '/mortgage-calculator' },
      { label: 'Amortization Schedule', path: '/amortization-schedule-calculator' },
      { label: 'Early Payoff', path: '/mortgage-payoff-calculator' },
      { label: 'Refinance', path: '/refinance-calculator' },
      { label: 'Cash-Out Refi', path: '/cash-out-refinance-calculator' },
      { label: 'Compare Loans', path: '/loan-comparison-calculator' },
      { label: 'Balloon Payoff', path: '/balloon-payment-calculator' }
    ]
  },
  commercial: {
    title: 'Commercial & Investment Suite',
    icon: Building,
    items: [
      { label: 'DSCR Loan Underwriting', path: '/dscr-loan-calculator', badge: 'Rental' },
      { label: 'Commercial Loan & Balloon', path: '/commercial-loan-calculator', badge: 'Commercial' },
      { label: 'Hard Money & Flip Deal', path: '/hard-money-calculator', badge: '70% Rule' }
    ]
  },
  '1031': {
    title: 'Section 1031 Exchange Suite',
    icon: Scale,
    items: [
      { label: '1031 Capital Gain & Boot', path: '/section-1031-exchange-calculator' },
      { label: '45/180-Day Deadlines', path: '/1031-exchange-timeline-calculator' }
    ]
  },
  finops: {
    title: 'Cloud Data FinOps Suite',
    icon: Zap,
    items: [
      { label: 'Snowflake Warehouse Cost', path: '/snowflake-cost-calculator', badge: 'Credits' },
      { label: 'Parquet Storage Savings', path: '/parquet-storage-calculator', badge: 'S3 / Athena' }
    ]
  },
  personal: {
    title: 'Personal Finance & Salary Suite',
    icon: PiggyBank,
    items: [
      { label: 'Salary to Hourly Wage', path: '/salary-to-hourly-calculator' },
      { label: 'Auto & Personal Loans', path: '/finance-calculator' }
    ]
  },
  media: {
    title: 'Private Media & Utility Suite',
    icon: Video,
    items: [
      { label: 'Video Compressor', path: '/video-compressor', badge: 'Wasm' },
      { label: 'Image Compressor', path: '/image-compressor', badge: 'WebP' }
    ]
  },
  data: {
    title: 'Client-Side Data Workbench',
    icon: Database,
    items: [
      { label: 'Data Viewer', path: '/' },
      { label: 'Data Converter', path: '/data-converter' },
      { label: 'JSON Formatter', path: '/json-formatter' },
      { label: 'SQL Formatter', path: '/sql-formatter' }
    ]
  }
};

interface SuiteSubNavProps {
  suite: SuiteType;
  currentPath?: string;
  className?: string;
}

export const SuiteSubNav = ({ suite, currentPath, className = '' }: SuiteSubNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const suiteData = SUITE_CONFIG[suite];
  const SuiteIcon = suiteData.icon;

  const activePath = getCanonicalPath(currentPath || (typeof window !== 'undefined' ? window.location.pathname : ''));
  const currentItem = suiteData.items.find((item) => getCanonicalPath(item.path) === activePath) || suiteData.items[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Preload sibling tabs in this suite during browser idle time so tab switching is instant
  useEffect(() => {
    const siblingPaths = suiteData.items.map((item) => item.path);
    idlePreloadRoutes(siblingPaths);
  }, [suiteData.items]);

  const handleNavigate = (path: string) => {
    navigateTo(path);
    setIsOpen(false);
  };

  return (
    <div className={`no-print mb-6 ${className}`}>
      {/* Mobile: Compact Dropdown Menu */}
      <div ref={dropdownRef} className="sm:hidden relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-800 cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <SuiteIcon className="size-3.5" />
            </div>
            <span className="text-slate-500 font-normal truncate">Tool:</span>
            <span className="text-slate-900 font-bold truncate">{currentItem.label}</span>
          </div>
          <ChevronDown className={`size-4 text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {suiteData.title}
            </div>
            {suiteData.items.map((item) => {
              const isActive = getCanonicalPath(item.path) === activePath;
              return (
                <button
                  key={item.path}
                  type="button"
                  onMouseEnter={() => preloadRoute(item.path)}
                  onFocus={() => preloadRoute(item.path)}
                  onTouchStart={() => preloadRoute(item.path)}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {isActive && <Check className="size-3.5 text-indigo-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: Horizontal Pill Bar */}
      <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/90 flex-wrap shadow-2xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 text-xs font-medium shrink-0">
          <Layers className="size-3.5 text-indigo-600" />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Suite:
          </span>
        </div>

        {suiteData.items.map((item) => {
          const isActive = getCanonicalPath(item.path) === activePath;
          return (
            <button
              key={item.path}
              type="button"
              onMouseEnter={() => preloadRoute(item.path)}
              onFocus={() => preloadRoute(item.path)}
              onTouchStart={() => preloadRoute(item.path)}
              onClick={() => handleNavigate(item.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80 ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-200/60 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
