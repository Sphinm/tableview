import { useEffect, useRef, useState } from 'react';
import { ADSENSE_CLIENT, AD_UNITS, isPlaceholderSlot, type AdUnitKey } from '../data/adSlots';

type AdFormat = 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

interface AdSlotProps {
  /** Registry key — prefer this over `slot` so IDs live in one file. */
  unit?: AdUnitKey;
  /** Explicit slot id; overrides `unit`. */
  slot?: string;
  format?: AdFormat;
  /** 'in-article' lets AdSense match the surrounding typography. */
  layout?: 'in-article' | 'display';
  className?: string;
  label?: string;
  /**
   * Reserved height in px. Reserving space before the ad arrives is what keeps
   * Cumulative Layout Shift at zero — an ad that pops in and pushes content down
   * directly hurts the Core Web Vitals score that feeds ranking and RPM.
   */
  minHeight?: number;
}

/** Sensible reserved heights per format, used when none is supplied. */
const RESERVED_HEIGHT: Record<AdFormat, number> = {
  auto: 280,
  fluid: 280,
  rectangle: 250,
  horizontal: 100,
  vertical: 600,
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A single responsive AdSense unit.
 *
 * Behaviour that matters for revenue:
 *  - The ad request is fired only once the slot scrolls near the viewport
 *    (IntersectionObserver). Ads requested below the fold are frequently never
 *    seen, and viewability is a direct input to RPM.
 *  - Space is reserved up front so filling the ad cannot shift the layout (CLS).
 *  - Pushing twice for the same <ins> makes AdSense throw
 *    "All ins elements in the DOM with class=adsbygoogle already have ads in
 *    them". React 19 StrictMode double-invokes effects in development, so the
 *    push is guarded both by a ref and by AdSense's own status attribute.
 *  - While the unit id is still the placeholder, nothing is requested at all.
 *  - Marked no-print: AdSense forbids ads appearing in printed/PDF output, and
 *    the calculators all have print-to-PDF flows.
 */
export const AdSlot = ({
  unit,
  slot,
  format = 'auto',
  layout = 'display',
  className = '',
  label = 'Advertisement',
  minHeight,
}: AdSlotProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Browsers without IntersectionObserver load immediately; deciding that at
  // initialisation keeps the effect free of a synchronous setState.
  const [isNearViewport, setIsNearViewport] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );

  const resolvedSlot = slot ?? (unit ? AD_UNITS[unit] : undefined);
  const isConfigured = !isPlaceholderSlot(resolvedSlot);
  const reserved = minHeight ?? RESERVED_HEIGHT[format];

  // Start loading slightly before the slot is on screen so the fill is ready by
  // the time the reader arrives.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !isConfigured) return;
    if (typeof IntersectionObserver === 'undefined') return; // already loading eagerly

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px 0px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isConfigured]);

  useEffect(() => {
    if (!isNearViewport || !isConfigured) return;

    const ins = containerRef.current?.querySelector('ins.adsbygoogle');
    if (!ins) return;

    // AdSense stamps this once a unit has been filled or attempted.
    if (ins.getAttribute('data-adsbygoogle-status')) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // The loader script is blocked by an ad blocker or has not parsed yet;
      // the reserved space simply stays empty, which is the correct fallback.
    }
  }, [isNearViewport, isConfigured]);

  // Nothing to show until a real unit id exists. Rendering an <ins> with the
  // placeholder would submit invalid requests, so keep the DOM clean instead.
  if (!isConfigured) {
    if (import.meta.env.DEV) {
      return (
        <div
          className={`ad-slot no-print my-6 flex items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-[11px] text-slate-500 ${className}`}
          style={{ minHeight: reserved }}
          data-ad-placeholder={unit ?? 'unconfigured'}
        >
          Ad slot "{unit ?? slot ?? 'unknown'}" — set a real unit id in src/data/adSlots.ts
        </div>
      );
    }
    return null;
  }

  return (
    <div
      ref={containerRef}
      // no-print: ads must never appear in a printed page or exported PDF.
      className={`ad-slot no-print my-8 flex flex-col items-center justify-center ${className}`}
    >
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
        {label}
      </span>
      <div
        className="w-full flex items-center justify-center overflow-hidden"
        style={{ minHeight: reserved }}
      >
        <ins
          className="adsbygoogle block w-full text-center"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={resolvedSlot}
          data-ad-format={format}
          data-ad-layout={layout === 'in-article' ? 'in-article' : undefined}
          data-ad-layout-key={undefined}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
