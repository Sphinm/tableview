import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Mail,
  Table,
  ChevronRight,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useAuth } from '../lib/useAuth';
import { getBugReportMailto } from '../lib/feedback';
import { getCanonicalPath, getRouteCategory } from '../lib/resolveRoute';
import { TOOLS_CONFIG } from '../data/tools';

interface TopBarProps {
  currentPath: string;
  onOpenMobileMenu: () => void;
}

export const TopBar = ({ currentPath, onOpenMobileMenu }: TopBarProps) => {
  const { user, openAuthModal, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const getBreadcrumbs = () => {
    const canonical = getCanonicalPath(currentPath);
    const category = getRouteCategory(currentPath);

    if (category === 'home' || canonical === '/') {
      return [
        { label: 'Platform', path: '/' },
        { label: 'Financial Modeling Engine', path: '/' }
      ];
    }

    if (category === 'guides') {
      if (canonical === '/guides') {
        return [
          { label: 'Platform', path: '/' },
          { label: 'Technical Guides', path: '/guides' }
        ];
      }
      const slug = canonical.replace('/guides/', '');
      const formattedTitle = slug
        .split('-')
        .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(' ');
      return [
        { label: 'Technical Guides', path: '/guides' },
        { label: formattedTitle || 'Guide Detail', path: currentPath }
      ];
    }

    if (category === 'calculators') {
      if (canonical === '/finance-calculator') {
        return [
          { label: 'Platform', path: '/' },
          { label: 'Financial Calculators', path: '/finance-calculator' }
        ];
      }
      const slug = canonical.slice(1);
      const tool = TOOLS_CONFIG[slug];
      return [
        { label: 'Financial Calculators', path: '/finance-calculator' },
        { label: tool?.shortTitle || tool?.title || slug.replace(/-/g, ' '), path: currentPath }
      ];
    }

    if (category === 'media') {
      if (canonical === '/media-tools') {
        return [
          { label: 'Platform', path: '/' },
          { label: 'Media Compression Studio', path: '/media-tools' }
        ];
      }
      const slug = canonical.slice(1);
      const tool = TOOLS_CONFIG[slug];
      return [
        { label: 'Media Studio', path: '/media-tools' },
        { label: tool?.shortTitle || tool?.title || slug.replace(/-/g, ' '), path: currentPath }
      ];
    }

    if (category === 'data') {
      if (canonical === '/data-tools') {
        return [
          { label: 'Platform', path: '/' },
          { label: 'Data Workbench', path: '/data-tools' }
        ];
      }
      const slug = canonical.slice(1);
      const tool = TOOLS_CONFIG[slug];
      const fallbackTitle =
        slug === 'json-formatter'
          ? 'JSON Formatter'
          : slug === 'sql-formatter'
          ? 'SQL Formatter'
          : slug.replace(/-/g, ' ');
      return [
        { label: 'Data Workbench', path: '/data-tools' },
        { label: tool?.shortTitle || tool?.title || fallbackTitle, path: currentPath }
      ];
    }

    if (category === 'system' || canonical === '/is-it-down') {
      return [
        { label: 'Platform', path: '/' },
        { label: 'System & Diagnostics', path: '/is-it-down' }
      ];
    }

    const staticLabels: Record<string, string> = {
      '/about': 'About Us',
      '/contact': 'Contact & Support',
      '/privacy': 'Privacy Policy',
      '/terms': 'Terms of Service',
      '/disclaimer': 'Legal Disclaimer'
    };

    if (staticLabels[canonical]) {
      return [
        { label: 'Platform', path: '/' },
        { label: staticLabels[canonical], path: canonical }
      ];
    }

    return [
      { label: 'Platform', path: '/' },
      { label: canonical.slice(1).replace(/-/g, ' ') || 'Overview', path: currentPath }
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-12 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger + Desktop breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden size-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Open Navigation Menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="size-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Table className="size-3.5" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">
            TableView<span className="text-indigo-600">.dev</span>
          </span>
        </div>

        {/* Desktop Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={crumb.path + idx} className="flex items-center gap-1.5 min-w-0">
                {idx > 0 && <ChevronRight className="size-3 text-slate-400 shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-slate-900 truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <a
                    href={crumb.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo(crumb.path);
                    }}
                    className="hover:text-slate-900 transition-colors truncate cursor-pointer"
                  >
                    {crumb.label}
                  </a>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right: Privacy badge, Report bug, User profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Privacy badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>100% Client-Side</span>
        </div>

        {/* Bug report */}
        <a
          href={getBugReportMailto()}
          className="text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Report Bug / Feedback"
        >
          <Mail className="size-3.5" />
          <span className="hidden lg:inline">Feedback</span>
        </a>

        {/* User profile dropdown or Sign in button */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border transition-all cursor-pointer ${
                isDropdownOpen
                  ? 'border-indigo-300 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/10'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
              }`}
              title={`Signed in as ${user.email}`}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || user.email}
                  className="size-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="size-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="hidden sm:inline-block max-w-[100px] truncate text-xs font-medium text-slate-700">
                {user.name || user.email.split('@')[0]}
              </span>
              <ChevronDown
                className={`size-3 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-2xl bg-white p-2 text-slate-800 shadow-xl border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {/* User Info Header */}
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || user.email}
                      className="size-9 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {user.name || user.email.split('@')[0]}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate" title={user.email}>
                      {user.email}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-indigo-100 text-indigo-700">
                        <Sparkles className="size-2.5" />
                        {user.plan || 'Free'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {user.credits ?? 10} credits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions & Privacy Info */}
                <div className="my-1.5 border-t border-slate-100 px-1 py-1 space-y-0.5">
                  <a
                    href={getBugReportMailto()}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Mail className="size-3.5 text-slate-400" />
                    <span>Send Feedback / Support</span>
                  </a>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 rounded-lg bg-slate-50/50">
                    <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] text-slate-500">
                      Local sandbox · Zero telemetry
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="size-3.5 text-red-500" />
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <User className="size-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
