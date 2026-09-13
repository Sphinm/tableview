import { Sparkles } from 'lucide-react';

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
  if (!presets || presets.length === 0) return null;

  const currentActiveId = activePresetId !== undefined ? activePresetId : activeId;
  const handleSelect = (preset: CalculatorPreset<T>) => {
    if (onSelectPreset) {
      onSelectPreset(preset);
    } else if (onSelect) {
      onSelect(preset);
    }
  };

  return (
    <div className={`no-print flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-6 ${className}`}>
      <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-400 shrink-0">
        <Sparkles className="size-3.5 text-amber-400" />
        <span>{title}:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {presets.map((preset) => {
          const isActive = currentActiveId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelect(preset)}
              title={preset.description || preset.label}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{preset.label}</span>
              {preset.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
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
