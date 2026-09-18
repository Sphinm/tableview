import React, { useState, useRef } from 'react';
import { parseNumericValue } from '../lib/formatNumber';

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix'> {
  value: number;
  onChange: (value: number) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  min?: number;
  max?: number;
  containerClassName?: string;
}

export const NumericInput = ({
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0',
  className = '',
  containerClassName = '',
  disabled,
  min,
  max,
  onFocus,
  onBlur,
  ...rest
}: NumericInputProps) => {
  const [localValue, setLocalValue] = useState<string>(() => {
    return value === 0 ? '0' : String(value);
  });
  const [prevValue, setPrevValue] = useState<number>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  if (value !== prevValue) {
    setPrevValue(value);
    const currentNum = parseNumericValue(localValue);
    if (!(localValue === '' && value === 0 && isFocused) && currentNum !== value) {
      setLocalValue(value === 0 ? '0' : String(value));
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw === '' || raw === '-') {
      setLocalValue('');
      onChange(0);
      return;
    }

    // Allow digits and at most one decimal point
    const parts = raw.split('.');
    const clean = parts[0].replace(/[^0-9]/g, '') + (parts.length > 1 ? '.' + parts.slice(1).join('').replace(/[^0-9]/g, '') : '');

    if (clean === '') {
      setLocalValue('');
      onChange(0);
      return;
    }

    let num = parseNumericValue(clean);
    if (max !== undefined && num > max) {
      num = max;
    }

    setLocalValue(clean);
    onChange(num);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (localValue === '0') {
      e.target.select();
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (localValue === '') {
      setLocalValue('0');
      onChange(0);
    } else {
      let num = parseNumericValue(localValue);
      if (min !== undefined && num < min) num = min;
      if (max !== undefined && num > max) num = max;
      setLocalValue(String(num));
      onChange(num);
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
        inputMode="decimal"
        autoComplete="off"
        spellCheck="false"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`w-full ${prefix ? 'pl-9' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} py-2 bg-slate-50/80 hover:bg-slate-100/60 focus:bg-white border border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs ${className}`}
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
