import React, { useEffect, useRef } from 'react';

/**
 * Elements that can receive keyboard focus inside a modal. Kept intentionally
 * close to the HTML spec rather than pulling in a focus-management library —
 * the suite bundle budget is a product requirement.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface DialogProps {
  /** Called on Escape, backdrop click, or an explicit close button. */
  onClose: () => void;
  children: React.ReactNode;
  /** id of the element that names the dialog (preferred over ariaLabel). */
  labelledBy?: string;
  /** Accessible name when no visible heading can be referenced. */
  ariaLabel?: string;
  /** Overlay classes. Defaults to a centred, blurred scrim. */
  overlayClassName?: string;
  /** Panel classes. Controls width, radius and scrolling. */
  panelClassName?: string;
  /**
   * Block Escape and backdrop-click dismissal. Use for destructive
   * confirmations where an accidental click must not discard state.
   */
  dismissible?: boolean;
  /** Element focused when the dialog opens; defaults to the first focusable. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Accessible modal shell shared across every TableView suite.
 *
 * Before this existed each modal re-implemented its own scrim and close button,
 * and only one of the four finance modals declared itself a dialog at all.
 * Keyboard users could tab straight through a modal into the page behind it,
 * Escape did nothing, and the page kept scrolling underneath the overlay.
 *
 * This component owns the four behaviours a modal is expected to have:
 *
 *   1. Semantics  — role="dialog" + aria-modal, labelled by its heading.
 *   2. Focus      — moved in on open, trapped while open, restored on close.
 *   3. Dismissal  — Escape and backdrop click (unless dismissible is false).
 *   4. Inert page — body scroll is locked, with scrollbar-width compensation so
 *                   the layout does not jump when the bar disappears.
 */
export function Dialog({
  onClose,
  children,
  labelledBy,
  ariaLabel,
  overlayClassName = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200',
  panelClassName = 'relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl',
  dismissible = true,
  initialFocusRef,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Read the latest onClose inside document listeners without re-subscribing.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const initialFocusRefStable = useRef(initialFocusRef);
  initialFocusRefStable.current = initialFocusRef;
  // Captured on mount so focus can be handed back to the trigger on unmount.
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Lock background scroll for as long as the dialog is mounted.
  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  // Move focus in, trap Tab, wire Escape, and restore focus on close.
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const getFocusable = (): HTMLElement[] => {
      if (!panel) return [];
      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
    };

    // Defer one frame so the panel has painted and layout is final.
    const frame = requestAnimationFrame(() => {
      const explicit = initialFocusRefStable.current?.current;
      if (explicit) {
        explicit.focus();
        return;
      }
      const focusable = getFocusable();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        panel?.focus();
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        // Nothing to cycle through: keep focus on the panel itself.
        event.preventDefault();
        panel?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [dismissible]);

  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dismissible) return;
    // Pointer-down (not click) and a strict target check mean a drag that
    // starts inside the panel and ends on the scrim does not close the modal.
    if (event.target === event.currentTarget) {
      onCloseRef.current();
    }
  };

  return (
    <div className={overlayClassName} onMouseDown={handleOverlayMouseDown}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        tabIndex={-1}
        className={panelClassName}
      >
        {children}
      </div>
    </div>
  );
}

export default Dialog;
