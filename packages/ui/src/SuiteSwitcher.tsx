import React from 'react';
import { Building2, Wrench, FileArchive, Sparkles } from 'lucide-react';

export interface SuiteSwitcherProps {
  currentSuite: 'finance' | 'tools' | 'compressor';
}

export function SuiteSwitcher({ currentSuite }: SuiteSwitcherProps) {
  const suites = [
    {
      id: 'finance',
      label: 'Real Estate & Lending Underwriting',
      badge: 'PRO',
      href: 'https://tableview.dev',
      icon: Building2,
      active: currentSuite === 'finance',
    },
    {
      id: 'tools',
      label: 'Data & Parquet Workbench',
      href: 'https://tools.tableview.dev',
      icon: Wrench,
      active: currentSuite === 'tools',
    },
    {
      id: 'compressor',
      label: 'Media Compressor',
      href: 'https://compress.tableview.dev',
      icon: FileArchive,
      active: currentSuite === 'compressor',
    },
  ];

  return (
    <div className="bg-neutral-950 border-b border-neutral-800/80 px-4 py-1.5 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">
          TableView Suite:
        </span>
        <div className="flex items-center gap-1">
          {suites.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.id}
                href={s.href}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors text-xs ${
                  s.active
                    ? 'bg-neutral-800 text-neutral-100 font-medium shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
                {s.badge && (
                  <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {s.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-neutral-400 text-[11px]">
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <span>Institutional-grade Web Calculators & In-Browser Tools</span>
      </div>
    </div>
  );
}
