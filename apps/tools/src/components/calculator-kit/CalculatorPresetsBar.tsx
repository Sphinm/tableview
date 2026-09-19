import { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Check } from 'lucide-react';

export interface CalculatorPreset<T = Record<string, unknown>> {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  values?: Partial<T>;
  apply?: () => void;
}

interface CalculatorPresetsBarProps<T = Record<string, unknown>> {
  presets: CalculatorPreset<T>[];
  activeId?: string | null;
  activePresetId?: string | null;
  onSelect?: (preset: CalculatorPreset<T>) => void;
  onSelectPreset?: (preset: CalculatorPreset<T>) => void;
  title?: string;
  className?: string;
}

export function CalculatorPresetsBar<T = Record<string, unknown>>({
  presets,
  activeId,
  activePresetId,
  onSelect,
  onSelectPreset,
  title = 'Quick Presets',
  className = '',
}: CalculatorPresetsBarProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!presets || presets.length === 0) return null;

  const currentActiveId = activePresetId !== undefined ? activePresetId : activeId;
  const activePreset = presets.find((p) => p.id === currentActiveId) || presets[0];

  const handleSelect = (preset: CalculatorPreset<T>) => {
    if (onSelectPreset) {
      onSelectPreset(preset);
    } else if (onSelect) {
      onSelect(preset);
    }
    setIsOpen(false);
  };

  return (
    <div className={`no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200 mb-6 shadow-2xs ${className}`}>
      <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-900 shrink-0">
        <Sparkles className="size-3.5 text-amber-500" />
        <span>{title}:</span>
      </div>

      {/* Mobile: Dropdown Selector */}
      <div ref={dropdownRef} className="relative sm:hidden w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
        >
          <span className="truncate">{activePreset.label}</span>
          <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30 animate-in fade-in duration-100">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelect(preset)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs ${
                  currentActiveId === preset.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{preset.label}</span>
                {currentActiveId === preset.id && <Check className="size-3.5 text-indigo-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Clean flex-wrap without overflow-x-auto */}
      <div className="hidden sm:flex flex-wrap items-center gap-2">
        {presets.map((preset) => {
          const isActive = currentActiveId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelect(preset)}
              title={preset.description || preset.label}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs border border-indigo-600'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-900 border border-slate-200'
              }`}
            >
              <span>{preset.label}</span>
              {preset.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                  }`}
                >
                  {preset.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
