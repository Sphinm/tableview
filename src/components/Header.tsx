import { useState } from 'react';
import { Table, ShieldCheck, Sparkles, Menu, X, BookOpen, Info, MessageSquare } from 'lucide-react';
import { navigateTo } from '../lib/router';

interface HeaderProps {
  onTrySample?: () => void;
  isLoading?: boolean;
  currentPath?: string;
}

export const Header = ({ onTrySample, isLoading, currentPath = '/' }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Workbench', path: '/', isHome: true },
    { label: 'Guides', path: '/guides', icon: BookOpen },
    { label: 'About', path: '/about', icon: Info },
    { label: 'Contact', path: '/contact', icon: MessageSquare }
  ];

  const isCurrent = (path: string, isHome?: boolean) => {
    if (isHome) return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(path);
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            onClick={(e) => handleNav(e, '/')}
            className="flex items-center gap-2.5 group"
          >
            <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-500 transition-colors">
              <Table className="size-4.5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-white tracking-tight">TableView</span>
              <span className="text-xs text-slate-400 font-mono">.dev</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            {navItems.map((item) => {
              const active = isCurrent(item.path, item.isHome);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNav(e, item.path)}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {item.icon && <item.icon className="size-3.5" />}
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[11px] font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Client Sandbox</span>
          </div>

          {onTrySample && (
            <button
              onClick={onTrySample}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="size-3.5 text-indigo-400" />
              <span>Try Sample</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-900 bg-slate-950 px-4 pt-3 pb-5 space-y-2 text-sm animate-in fade-in duration-150">
          {navItems.map((item) => {
            const active = isCurrent(item.path, item.isHome);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNav(e, item.path)}
                className={`block px-3 py-2 rounded-xl flex items-center gap-2.5 ${
                  active
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.icon && <item.icon className="size-4 text-indigo-400" />}
                {item.label}
              </a>
            );
          })}
          <div className="pt-2 border-t border-slate-900/80 flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>100% Client-Side Sandbox</span>
          </div>
        </div>
      )}
    </header>
  );
};
