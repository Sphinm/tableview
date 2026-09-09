import { useEffect } from 'react';

interface AdSlotProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  label?: string;
}

export const AdSlot = ({
  client = 'ca-pub-3414270480046504',
  slot = '0000000000',
  format = 'auto',
  className = '',
  label = 'Advertisement'
}: AdSlotProps) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      // Ignore initial render errors if script hasn't fully loaded
    }
  }, []);

  return (
    <div className={`my-8 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1.5">
        {label}
      </span>
      <div className="w-full min-h-[100px] rounded-xl border border-dashed border-slate-800/80 bg-slate-900/30 flex items-center justify-center p-4 overflow-hidden">
        {/* Google AdSense ins tag */}
        <ins
          className="adsbygoogle block w-full text-center"
          style={{ display: 'block' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
