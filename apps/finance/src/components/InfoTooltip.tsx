import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, Info } from 'lucide-react';

interface InfoTooltipProps {
  content: React.ReactNode;
  title?: string;
  className?: string;
  iconClassName?: string;
  iconType?: 'help' | 'info';
  /** Preferred placement. Flipped automatically when there is no room. */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

type Placement = 'top' | 'bottom' | 'left' | 'right';

const GAP = 8;
/** Keep the panel this far from the viewport edge. */
const MARGIN = 8;

/**
 * Lightweight, accessible, non-intrusive educational tooltip.
 * Works across desktop (hover, focus) and mobile (tap to toggle).
 *
 * ## Why this renders through a portal
 *
 * The panel used to be an absolutely-positioned child of the trigger. That
 * breaks the moment an ancestor establishes a clipping context: result cards
 * carry `overflow-hidden` to contain their decorative accents, so a tooltip
 * opened on the Cap Rate card was cut to a 13px sliver — 139 of its 152px were
 * clipped away — and tooltips inside `overflow-x-auto` schedule wrappers were
 * clipped the same way. Neither is visible on hover for a sighted user who
 * already knows the number, but it silently destroys the explanation, which is
 * the entire point of the control.
 *
 * Rendering into `document.body` with fixed positioning escapes every ancestor
 * clip and stacking context, so the panel is always fully visible regardless of
 * what the surrounding card does. Placement is then computed against the real
 * viewport: the preferred side is used when it fits, otherwise it flips, and the
 * result is clamped so it can never sit off-screen.
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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Links the tooltip to its trigger for screen readers while it is visible.
  const tooltipId = React.useId();

  /** Measure the trigger and the panel, then choose a side that fits. */
  const reposition = useCallback(() => {
    const trigger = containerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panel = panelRef.current;
    const pw = panel?.offsetWidth ?? 256;
    const ph = panel?.offsetHeight ?? 120;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fits: Record<Placement, boolean> = {
      top: rect.top >= ph + GAP,
      bottom: vh - rect.bottom >= ph + GAP,
      left: rect.left >= pw + GAP,
      right: vw - rect.right >= pw + GAP,
    };

    // Prefer the requested side, then its opposite, then whichever fits.
    const order: Placement[] = [side, side === 'top' ? 'bottom' : 'top', 'bottom', 'right', 'left'];
    const chosen = order.find((p) => fits[p]) ?? side;

    let top: number;
    let left: number;
    if (chosen === 'top' || chosen === 'bottom') {
      top = chosen === 'top' ? rect.top - ph - GAP : rect.bottom + GAP;
      left = rect.left + rect.width / 2 - pw / 2;
    } else {
      left = chosen === 'left' ? rect.left - pw - GAP : rect.right + GAP;
      top = rect.top + rect.height / 2 - ph / 2;
    }

    // Clamp into the viewport so the panel is never partially off-screen.
    left = Math.max(MARGIN, Math.min(left, vw - pw - MARGIN));
    top = Math.max(MARGIN, Math.min(top, vh - ph - MARGIN));

    /*
     * Store DOCUMENT coordinates (viewport position + scroll offset) and render
     * the panel absolutely. It then travels with its trigger while the page
     * scrolls, so no scroll listener is required at all — which also means a
     * stray trackpad movement cannot dismiss the explanation, and the behaviour
     * does not depend on scroll events being delivered.
     */
    setCoords({ top: top + window.scrollY, left: left + window.scrollX });
  }, [side]);

  /*
   * Position synchronously on open, then once more after the panel has
   * measured itself (the first pass runs before it has a size).
   *
   * No coords reset on close: a layout effect runs before the browser paints,
   * so a stale position from a previous open is overwritten in the same frame
   * and is never visible.
   */
  useLayoutEffect(() => {
    if (!isOpen) return;
    reposition();
    const frame = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(frame);
  }, [isOpen, reposition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      // The panel lives in a portal, so it is not inside containerRef.
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    /*
     * A resize reflows the page, which moves the trigger, so the panel is
     * re-anchored. Scroll needs no listener: document-coordinate anchoring
     * already travels with the content.
     */
    let frame = 0;
    const scheduleReposition = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        reposition();
      });
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', scheduleReposition);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', scheduleReposition);
    };
  }, [isOpen, reposition]);

  const Icon = iconType === 'info' ? Info : HelpCircle;

  const panel = isOpen ? (
    <div
      ref={panelRef}
      id={tooltipId}
      role="tooltip"
      style={{
        position: 'absolute',
        top: coords?.top ?? 0,
        left: coords?.left ?? 0,
        // Hide for the single frame before measurement completes, so the panel
        // never flashes at the top-left corner.
        visibility: coords ? 'visible' : 'hidden',
      }}
      className="z-[1000] w-64 max-w-[85vw] p-3 text-xs leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-100"
    >
      {title && (
        <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5 pb-1 border-b border-slate-100">
          <span>{title}</span>
        </div>
      )}
      <div className="text-slate-600 leading-normal">{content}</div>
    </div>
  ) : null;

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
        aria-describedby={isOpen ? tooltipId : undefined}
      >
        <Icon className={iconClassName || 'size-2.5'} />
      </button>

      {typeof document !== 'undefined' && panel ? createPortal(panel, document.body) : null}
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