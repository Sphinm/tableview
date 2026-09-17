import { useEffect } from 'react';
import {
  Table,
  Building,
  Building2,
  Hammer,
  Scale,
  Home,
  ArrowRightLeft,
  DollarSign,
  FileText,
  FileSpreadsheet,
  Database,
  FileCode,
  Terminal,
  Layers,
  Zap,
  Video,
  Image as ImageIcon,
  BookOpen,
  Activity,
  ChevronLeft,
  ChevronRight,
  Calculator,
  LogOut,
  User,
  Info,
  X,
  PiggyBank
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useAuth } from '../lib/useAuth';
import { openCookieSettings } from '../lib/consent';

interface SidebarProps {
  currentPath: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  title: string;
  shortTitle?: string;
  path: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: any;
  items: NavItem[];
}

export const Sidebar = ({
  currentPath,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}: SidebarProps) => {
  const { user, openAuthModal, logout } = useAuth();

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

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
    onCloseMobile();
  };

  const navGroups: NavGroup[] = [
    {
      id: 'financial',
      label: 'Financial & Debt Models',
      icon: Calculator,
      items: [
        {
          title: 'Financial Engine',
          shortTitle: 'Engine',
          path: '/',
          icon: Home,
          badge: 'Core',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        },
        {
          title: 'DSCR Loan Underwriting',
          shortTitle: 'DSCR Loan',
          path: '/dscr-loan-calculator',
          icon: Building,
          badge: 'Rental ROI',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        {
          title: 'Commercial Loan & Balloon',
          shortTitle: 'Commercial Loan',
          path: '/commercial-loan-calculator',
          icon: Building2,
          badge: 'Commercial',
          badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
        },
        {
          title: '1031 Exchange Tax Shield',
          shortTitle: '1031 Exchange',
          path: '/section-1031-exchange-calculator',
          icon: Scale,
          badge: 'Tax',
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
        },
        {
          title: 'Mortgage & Amortization',
          shortTitle: 'Mortgage',
          path: '/mortgage-calculator',
          icon: Home,
          badge: 'PITI',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        {
          title: 'Refinance Break-Even',
          shortTitle: 'Refinance',
          path: '/refinance-calculator',
          icon: ArrowRightLeft
        },
        {
          title: 'Hard Money (70% Rule)',
          shortTitle: 'Hard Money',
          path: '/hard-money-calculator',
          icon: Hammer
        },
        {
          title: 'Loan Comparison',
          shortTitle: 'Compare Loans',
          path: '/loan-comparison-calculator',
          icon: Scale
        },
        {
          title: 'Balloon Payment',
          shortTitle: 'Balloon Payoff',
          path: '/balloon-payment-calculator',
          icon: PiggyBank
        },
        {
          title: 'Salary to Hourly Matrix',
          shortTitle: 'Salary/Hourly',
          path: '/salary-to-hourly-calculator',
          icon: DollarSign
        },
        {
          title: 'Browse All Calculators',
          shortTitle: 'All Calculators',
          path: '/finance-calculator',
          icon: Calculator,
          badge: '14 Tools',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        }
      ]
    },
    {
      id: 'data',
      label: 'Data Workbench (DuckDB)',
      icon: Database,
      items: [
        {
          title: 'Data Workbench Studio',
          shortTitle: 'Workbench',
          path: '/data-tools',
          icon: Table,
          badge: 'Wasm',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        {
          title: 'CSV Viewer & Search',
          shortTitle: 'CSV Viewer',
          path: '/csv-viewer',
          icon: FileText
        },
        {
          title: 'Excel Viewer (.xlsx)',
          shortTitle: 'Excel Viewer',
          path: '/excel-viewer',
          icon: FileSpreadsheet
        },
        {
          title: 'Parquet Viewer & OLAP',
          shortTitle: 'Parquet Viewer',
          path: '/parquet-viewer',
          icon: Database
        },
        {
          title: 'DuckDB SQL Console',
          shortTitle: 'SQL Console',
          path: '/sql-workbench',
          icon: Terminal,
          badge: 'SQL',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
        },
        {
          title: 'Schema & DDL Inspector',
          shortTitle: 'Schema DDL',
          path: '/parquet-schema-inspector',
          icon: Layers
        },
        {
          title: 'JSON Formatter & Validator',
          shortTitle: 'JSON Format',
          path: '/json-formatter',
          icon: FileCode
        },
        {
          title: 'SQL Formatter & Beautifier',
          shortTitle: 'SQL Format',
          path: '/sql-formatter',
          icon: Terminal
        },
        {
          title: 'Parquet Storage Savings',
          shortTitle: 'Parquet FinOps',
          path: '/parquet-storage-calculator',
          icon: Zap
        },
        {
          title: 'Snowflake Warehouse Cost',
          shortTitle: 'Snowflake Cost',
          path: '/snowflake-cost-calculator',
          icon: Zap
        }
      ]
    },
    {
      id: 'media',
      label: 'Media Compression Studio',
      icon: Video,
      items: [
        {
          title: 'Video Compressor (Wasm)',
          shortTitle: 'Video Comp',
          path: '/video-compressor',
          icon: Video,
          badge: 'Wasm',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        {
          title: 'Image Compressor (Batch)',
          shortTitle: 'Image Comp',
          path: '/image-compressor',
          icon: ImageIcon,
          badge: 'Batch',
          badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
        }
      ]
    },
    {
      id: 'resources',
      label: 'Guides & Diagnostics',
      icon: BookOpen,
      items: [
        {
          title: 'Technical Guides (20)',
          shortTitle: 'Guides',
          path: '/guides',
          icon: BookOpen,
          badge: 'E-E-A-T',
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
        },
        {
          title: 'Is It Down? (Status)',
          shortTitle: 'Uptime Check',
          path: '/is-it-down',
          icon: Activity
        }
      ]
    }
  ];

  const isCurrentActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const renderSidebar = (isCollapsed: boolean) => (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 text-slate-700 select-none">
      {/* 1. Header: Brand Logo & Collapse Toggle */}
      <div className={`h-14 px-4 flex items-center border-b border-slate-200 shrink-0 ${
        isCollapsed ? 'justify-center' : 'justify-between'
      }`}>
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
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Local Sandbox
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

        {/* Desktop Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex size-7 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 items-center justify-center transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden size-8 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* 2. Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-5 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5">
                <group.icon className="size-3 text-slate-700" />
                <span>{group.label}</span>
              </div>
            ) : (
              <div className="w-full h-px bg-slate-200 my-2" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isCurrentActive(item.path);
                const Icon = item.icon;

                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => handleNav(e, item.path)}
                    title={isCollapsed ? item.title : undefined}
                    className={`group flex items-center rounded-xl transition-all cursor-pointer ${
                      isCollapsed
                        ? 'size-10 justify-center mx-auto'
                        : 'px-2.5 py-2 justify-between gap-2 text-xs'
                    } ${
                      active
                        ? 'bg-indigo-50/90 text-indigo-700 font-semibold border border-indigo-200/80 shadow-2xs'
                        : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          active
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      {!isCollapsed && (
                        <span className="truncate text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.shortTitle || item.title}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                          item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom Widget: Engine Health, User Profile & Legal Popover */}
      <div className="p-2.5 border-t border-slate-200 shrink-0 space-y-2 bg-slate-50/60">
        {/* Engine status indicator */}
        {!isCollapsed ? (
          <div className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px] shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Active</span>
            </div>
            <span className="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              0 B Egress
            </span>
          </div>
        ) : (
          <div className="flex justify-center" title="Engine Operational · 0 B Server Egress">
            <span className="size-2.5 rounded-full bg-emerald-500" />
          </div>
        )}

        {/* User Account / Auth */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            {user ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs text-slate-900 font-medium truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="text-slate-700 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="size-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="w-full text-xs font-semibold text-slate-900 hover:text-indigo-600 flex items-center justify-center gap-1.5 py-1 cursor-pointer"
              >
                <User className="size-3.5" />
                <span>Sign In / Sync</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={user ? logout : openAuthModal}
            className="size-10 mx-auto rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
            title={user ? `Signed in as ${user.email} (Click to logout)` : 'Sign in'}
          >
            {user ? <LogOut className="size-4" /> : <User className="size-4" />}
          </button>
        )}

        {/* Legal & Compliance Mini Menu */}
        {!isCollapsed ? (
          <div className="pt-1.5 text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap text-[10px] text-slate-700">
              <a
                href="/about"
                onClick={(e) => handleNav(e, '/about')}
                className="hover:text-slate-900 hover:underline"
              >
                About
              </a>
              <span>·</span>
              <a
                href="/privacy"
                onClick={(e) => handleNav(e, '/privacy')}
                className="hover:text-slate-900 hover:underline"
              >
                Privacy
              </a>
              <span>·</span>
              <a
                href="/terms"
                onClick={(e) => handleNav(e, '/terms')}
                className="hover:text-slate-900 hover:underline"
              >
                Terms
              </a>
              <span>·</span>
              <a
                href="/disclaimer"
                onClick={(e) => handleNav(e, '/disclaimer')}
                className="hover:text-slate-900 hover:underline"
              >
                Disclaimer
              </a>
              <span>·</span>
              <button
                type="button"
                onClick={openCookieSettings}
                className="hover:text-slate-900 hover:underline cursor-pointer"
              >
                Cookies
              </button>
            </div>
            <div className="mt-1 text-[9px] text-slate-700 font-mono">
              © 2026 TableView.dev
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <a
              href="/about"
              onClick={(e) => handleNav(e, '/about')}
              className="size-8 rounded-lg text-slate-700 hover:text-slate-900 flex items-center justify-center"
              title="About & Legal Policies"
            >
              <Info className="size-3.5" />
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

          {/* Drawer Panel: Always expanded for mobile readability */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-in">
            {renderSidebar(false)}
          </div>
        </div>
      )}
    </>
  );
};
