import React, { useState, useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { formatCurrencyValue, parseCurrencyValue } from '../lib/formatNumber';

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix'> {
  value: number;
  onChange: (value: number) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowDecimal?: boolean;
  containerClassName?: string;
}

export const CurrencyInput = ({
  value,
  onChange,
  prefix = <DollarSign className="size-4" />,
  suffix,
  allowDecimal = false,
  placeholder = '0',
  className = '',
  containerClassName = '',
  disabled,
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}: CurrencyInputProps) => {
  const [localValue, setLocalValue] = useState<string>(() => {
    return value === 0 ? '0' : formatCurrencyValue(value, allowDecimal);
  });
  const [prevValue, setPrevValue] = useState<number>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync state during render when external prop changes
  if (value !== prevValue) {
    setPrevValue(value);
    const currentNum = parseCurrencyValue(localValue);
    // Don't overwrite if the input was cleared to empty by the user and the external value is 0
    if (!(localValue === '' && value === 0 && isFocused) && currentNum !== value) {
      setLocalValue(value === 0 ? '0' : formatCurrencyValue(value, allowDecimal));
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? raw.length;

    // Count non-comma characters before cursor for position preservation
    const nonCommasBeforeCursor = raw.slice(0, cursor).replace(/,/g, '').length;

    // User cleared the field or typed '-'
    if (raw === '' || raw === '-') {
      setLocalValue('');
      onChange(0);
      return;
    }

    // Sanitize string
    let clean = raw.replace(/,/g, '');
    if (!allowDecimal) {
      clean = clean.split('.')[0].replace(/[^0-9]/g, '');
    } else {
      const parts = clean.split('.');
      clean = parts[0].replace(/[^0-9]/g, '') + (parts.length > 1 ? '.' + parts.slice(1).join('').replace(/[^0-9]/g, '') : '');
    }

    if (clean === '') {
      setLocalValue('');
      onChange(0);
      return;
    }

    // Format with commas
    let formatted: string;
    if (allowDecimal && clean.includes('.')) {
      const [intPart, ...decParts] = clean.split('.');
      const cleanInt = intPart.replace(/[^0-9]/g, '');
      const cleanDec = decParts.join('').replace(/[^0-9]/g, '');
      const formattedInt = cleanInt ? Number(cleanInt).toLocaleString('en-US') : '0';
      formatted = `${formattedInt}.${cleanDec}`;
    } else {
      formatted = Number(clean).toLocaleString('en-US');
    }

    const num = parseCurrencyValue(clean);
    setLocalValue(formatted);
    onChange(num);

    // Restore cursor position
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      let targetPos = 0;
      let counted = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== ',') {
          counted++;
        }
        if (counted === nonCommasBeforeCursor) {
          targetPos = i + 1;
          break;
        }
      }
      if (nonCommasBeforeCursor === 0) targetPos = 0;
      if (counted < nonCommasBeforeCursor) targetPos = formatted.length;

      inputRef.current.setSelectionRange(targetPos, targetPos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) onKeyDown(e);
    if (e.defaultPrevented) return;

    const input = e.currentTarget;
    const { selectionStart, selectionEnd } = input;

    // Enhanced backspace: if deleting right after a comma, delete the preceding digit
    if (e.key === 'Backspace' && selectionStart === selectionEnd && selectionStart !== null && selectionStart > 0) {
      if (input.value[selectionStart - 1] === ',') {
        e.preventDefault();
        const pos = selectionStart;
        const before = input.value.slice(0, pos - 2);
        const after = input.value.slice(pos);
        const combined = before + after;

        const clean = combined.replace(/[^0-9.]/g, '');
        const num = parseCurrencyValue(clean);
        const formatted = formatCurrencyValue(clean, allowDecimal);
        setLocalValue(formatted);
        onChange(num);

        requestAnimationFrame(() => {
          if (!inputRef.current) return;
          const newPos = Math.max(0, pos - 2);
          inputRef.current.setSelectionRange(newPos, newPos);
        });
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Auto-select text if value is '0' so typing immediately replaces it
    if (localValue === '0') {
      e.target.select();
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // On blur, if user left it completely empty, normalize display to '0'
    if (localValue === '') {
      setLocalValue('0');
      onChange(0);
    }
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`relative flex items-center w-full ${containerClassName}`}>
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 flex items-center">
          {prefix}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        autoComplete="off"
        spellCheck="false"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`w-full ${prefix ? 'pl-9' : 'pl-3.5'} ${suffix ? 'pr-9' : 'pr-3.5'} py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors shadow-2xs ${className}`}
        {...rest}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 flex items-center text-xs font-mono">
          {suffix}
        </div>
      )}
    </div>
  );
};
