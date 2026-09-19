import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface InfoTooltipProps {
  content: React.ReactNode;
  title?: string;
  className?: string;
  iconClassName?: string;
  iconType?: 'help' | 'info';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Lightweight, accessible, non-intrusive educational tooltip.
 * Works seamlessly across desktop (hover) and mobile (tap to toggle).
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  title,
  className = '',
  iconClassName = 'size-3.5 text-slate-500 hover:text-indigo-600 transition-colors',
  iconType = 'help',
  side = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const Icon = iconType === 'info' ? Info : HelpCircle;

  // Position classes with safe boundary alignment
  const sideClasses = {
    top: 'bottom-full left-0 mb-2',
    bottom: 'top-full left-0 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="inline-flex items-center justify-center size-4 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200/80 transition-all cursor-help focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        aria-label={title || 'More information'}
        aria-expanded={isOpen}
      >
        <Icon className={iconClassName || "size-2.5"} />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute z-[100] w-64 max-w-[85vw] p-3 text-xs leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 transition-all pointer-events-auto animate-in fade-in zoom-in-95 duration-100 ${sideClasses}`}
        >
          {title && (
            <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span>{title}</span>
            </div>
          )}
          <div className="text-slate-600 leading-normal">{content}</div>
        </div>
      )}
    </span>
  );
};

interface TermTooltipProps {
  term: string;
  definition: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * Text wrapper with subtle dotted underline and educational tooltip on hover.
 */
export const TermTooltip: React.FC<TermTooltipProps> = ({
  term,
  definition,
  title,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="underline decoration-dotted decoration-slate-400 underline-offset-2 hover:text-indigo-600 transition-colors cursor-help">
        {term}
      </span>
      <InfoTooltip content={definition} title={title || term} />
    </span>
  );
};
