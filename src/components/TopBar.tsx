import { Menu, Mail, Table, ChevronRight, User } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useAuth } from '../lib/useAuth';
import { getBugReportMailto } from '../lib/feedback';
import { isCalculatorRoute, isCompressionRoute } from '../lib/resolveRoute';
import { TOOLS_CONFIG } from '../data/tools';

interface TopBarProps {
  currentPath: string;
  onOpenMobileMenu: () => void;
}

export const TopBar = ({ currentPath, onOpenMobileMenu }: TopBarProps) => {
  const { user, openAuthModal } = useAuth();

  const getBreadcrumbs = () => {
    if (currentPath === '/') {
      return [
        { label: 'Home', path: '/' },
        { label: 'Financial Modeling Engine', path: '/' }
      ];
    }

    if (isCalculatorRoute(currentPath)) {
      const slug = currentPath.slice(1);
      const tool = TOOLS_CONFIG[slug];
      return [
        { label: 'Calculators', path: '/finance-calculator' },
        { label: tool?.shortTitle || tool?.title || slug.replace(/-/g, ' '), path: currentPath }
      ];
    }

    if (isCompressionRoute(currentPath)) {
      const isVideo = currentPath.includes('video') || currentPath.includes('mp4');
      return [
        { label: 'Compression', path: isVideo ? '/video-compressor' : '/image-compressor' },
        { label: isVideo ? 'Video Compressor' : 'Image Compressor', path: currentPath }
      ];
    }

    if (currentPath.startsWith('/guides')) {
      return [
        { label: 'Guides Hub', path: '/guides' },
        ...(currentPath !== '/guides' ? [{ label: 'Guide Detail', path: currentPath }] : [])
      ];
    }

    if (currentPath.startsWith('/data-tools') || TOOLS_CONFIG[currentPath.slice(1)]) {
      const slug = currentPath.slice(1);
      const tool = TOOLS_CONFIG[slug];
      return [
        { label: 'Data Workbench', path: '/data-tools' },
        ...(currentPath !== '/data-tools'
          ? [{ label: tool?.shortTitle || tool?.title || slug, path: currentPath }]
          : [])
      ];
    }

    const staticLabels: Record<string, string> = {
      '/about': 'About Us',
      '/contact': 'Contact & Support',
      '/privacy': 'Privacy Policy',
      '/terms': 'Terms of Service',
      '/disclaimer': 'Legal Disclaimer',
      '/is-it-down': 'Website Status Checker'
    };

    return [
      { label: 'Platform', path: '/' },
      { label: staticLabels[currentPath] || 'Tool', path: currentPath }
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-12 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger + Desktop breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden size-8 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
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
        <nav className="hidden md:flex items-center gap-1.5 text-xs text-slate-700 min-w-0">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={crumb.path + idx} className="flex items-center gap-1.5 min-w-0">
                {idx > 0 && <ChevronRight className="size-3.5 text-slate-700 shrink-0" />}
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
                    className="hover:text-indigo-600 transition-colors truncate cursor-pointer"
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
      <div className="flex items-center gap-3 shrink-0">
        {/* Privacy badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>100% In-Browser · Zero Server Egress</span>
        </div>

        {/* Bug report */}
        <a
          href={getBugReportMailto()}
          className="text-slate-700 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs"
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
