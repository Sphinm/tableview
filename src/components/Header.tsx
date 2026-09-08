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
        <div className="flex items-center gap-2">
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

          <a
            href="https://github.com/Sphinm/tableview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <svg className="size-3.5 fill-currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="hidden sm:inline">Star on GitHub</span>
          </a>

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
