import { useState } from 'react';
import { Table, ShieldCheck, Sparkles, Menu, X, BookOpen, Info, MessageSquare, Sun, Moon } from 'lucide-react';
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
            <div className="size-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-700/60 dark:border-transparent flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
              <Table className="size-4.5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-100 tracking-tight">TableView</span>
              <span className="text-xs text-slate-400 font-mono">.dev</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            {navItems.map((item) => {
              const active = isCurrent(item.path, item.isHome);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNav(e, item.path)}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon && <item.icon className="size-4" />}
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Client Sandbox</span>
          </div>

          {onTrySample && (
            <button
              onClick={onTrySample}
              disabled={isLoading}
              className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="size-4 text-amber-400 dark:text-amber-500" />
              <span>Try Sample</span>
            </button>
          )}

          {/* Theme Switcher Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme (白色主题)' : 'Switch to Dark Theme (黑色主题)'}
              aria-label="Toggle theme color"
            >
              {theme === 'dark' ? (
                <Sun className="size-4.5 text-amber-400" />
              ) : (
                <Moon className="size-4.5 text-slate-700" />
              )}
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800 md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-700" />}
                <span>Theme Mode</span>
              </span>
              <span className="text-xs text-slate-200 font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {theme === 'dark' ? 'Dark (黑色)' : 'Light (白色)'}
              </span>
            </button>
          )}

          {navItems.map((item) => {
            const active = isCurrent(item.path, item.isHome);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNav(e, item.path)}
                className={`block px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 ${
                  active
                    ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                {item.icon && <item.icon className="size-4 text-slate-400" />}
                {item.label}
              </a>
            );
          })}
          <div className="pt-2 border-t border-slate-900/80 flex items-center gap-2 text-xs text-emerald-500 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>100% Client-Side Sandbox</span>
          </div>
        </div>
      )}
    </header>
  );
};
