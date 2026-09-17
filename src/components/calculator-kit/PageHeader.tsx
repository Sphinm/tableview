import React from 'react';
import { Home, ChevronRight, type LucideIcon } from 'lucide-react';
import { navigateTo } from '../../lib/router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PageBadge {
  icon?: LucideIcon;
  label: string;
  tone?: 'indigo' | 'emerald' | 'cyan' | 'amber' | 'slate';
}

export interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  badge?: PageBadge;
  title: string | React.ReactNode;
  titleHighlight?: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  presets?: React.ReactNode;
  className?: string;
}

const badgeStyles: Record<'indigo' | 'emerald' | 'cyan' | 'amber' | 'slate', string> = {
  indigo: 'bg-indigo-50 border-indigo-200/80 text-indigo-700',
  emerald: 'bg-emerald-50 border-emerald-200/80 text-emerald-700',
  cyan: 'bg-cyan-50 border-cyan-200/80 text-cyan-700',
  amber: 'bg-amber-50 border-amber-200/80 text-amber-800',
  slate: 'bg-white border-slate-200 text-slate-700 shadow-2xs'
};

export const PageHeader = ({
  breadcrumbs,
  showBreadcrumbs = false,
  badge,
  title,
  titleHighlight,
  description,
  actions,
  presets,
  className = ''
}: PageHeaderProps) => {
  const toneClass = badgeStyles[badge?.tone || 'indigo'];

  return (
    <header className={`mb-6 ${className}`}>
      {/* 1. Optional Breadcrumbs Trail (TopBar already provides global breadcrumbs) */}
      {showBreadcrumbs && breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold hover:underline transition-colors cursor-pointer"
            title="Back to Home"
          >
            <Home className="size-3.5 text-slate-500" />
            <span>Home</span>
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="size-3 text-slate-400 shrink-0" />
              {crumb.path ? (
                <button
                  type="button"
                  onClick={() => navigateTo(crumb.path!)}
                  className="text-slate-600 hover:text-slate-900 font-semibold hover:underline transition-colors cursor-pointer"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-slate-900 font-bold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* 2. Main Title Row & Actions Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          {badge && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs ${toneClass}`}>
              {badge.icon && <badge.icon className="size-3 shrink-0" />}
              <span>{badge.label}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-snug [text-wrap:balance]">
            {title}
            {titleHighlight && <span className="text-indigo-600 ml-2">{titleHighlight}</span>}
          </h1>

          {description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed [text-wrap:pretty]">
              {description}
            </p>
          )}
        </div>

        {/* Action Toolbar */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-0.5">
            {actions}
          </div>
        )}
      </div>

      {/* 3. Presets & Scenarios Bar */}
      {presets && (
        <div className="mt-5 pt-4 border-t border-slate-200/80">
          {presets}
        </div>
      )}
    </header>
  );
};
