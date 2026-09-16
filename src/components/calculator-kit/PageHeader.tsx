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
  breadcrumbs: BreadcrumbItem[];
  badge?: PageBadge;
  title: string | React.ReactNode;
  titleHighlight?: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  presets?: React.ReactNode;
  className?: string;
}

const badgeStyles: Record<'indigo' | 'emerald' | 'cyan' | 'amber' | 'slate', string> = {
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  slate: 'bg-white border-slate-200 text-slate-700 shadow-2xs'
};

export const PageHeader = ({
  breadcrumbs,
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
    <header className={`mb-8 ${className}`}>
      {/* 1. Breadcrumbs Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-800 mb-3.5 flex-wrap">
        <button
          type="button"
          onClick={() => navigateTo('/')}
          className="inline-flex items-center gap-1 text-slate-800 hover:text-slate-900 font-semibold hover:underline transition-colors cursor-pointer"
          title="Back to Home"
        >
          <Home className="size-3.5 text-slate-600" />
          <span>Home</span>
        </button>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="size-3 text-slate-500 shrink-0" />
            {crumb.path ? (
              <button
                type="button"
                onClick={() => navigateTo(crumb.path!)}
                className="text-slate-800 hover:text-slate-900 font-semibold hover:underline transition-colors cursor-pointer"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-slate-900 font-bold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* 2. Main Title Row & Actions Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {badge && (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${toneClass}`}>
              {badge.icon && <badge.icon className="size-3.5 shrink-0" />}
              <span>{badge.label}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] [text-wrap:balance]">
            {title}
            {titleHighlight && <span className="text-indigo-600 ml-2">{titleHighlight}</span>}
          </h1>

          {description && (
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed [text-wrap:pretty]">
              {description}
            </p>
          )}
        </div>

        {/* Action Toolbar */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1">
            {actions}
          </div>
        )}
      </div>

      {/* 3. Presets & Scenarios Bar */}
      {presets && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          {presets}
        </div>
      )}
    </header>
  );
};
