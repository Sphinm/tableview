import { Menu, Mail, Table, ChevronRight, User } from 'lucide-react';
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
  const { user, openAuthModal } = useAuth();

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

        {/* User profile button */}
        {user ? (
          <div className="size-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <User className="size-3" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
