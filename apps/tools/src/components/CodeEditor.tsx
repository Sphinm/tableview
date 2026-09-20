import React, { useRef, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';

export interface CodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  language: 'json' | 'sql';
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  showLineNumbers?: boolean;
  dark?: boolean;
  wrapLines?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  readOnly = false,
  placeholder = '',
  className = '',
  showLineNumbers = true,
  dark = false,
  wrapLines = false,
  onKeyDown
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Prism highlighted HTML
  const highlightedCode = useMemo(() => {
    if (!value) return '';
    try {
      const grammar = language === 'json' ? Prism.languages.json : Prism.languages.sql;
      return Prism.highlight(value, grammar, language);
    } catch {
      // Fallback escape
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [value, language]);

  const lineCount = useMemo(() => {
    if (!value) return 1;
    return value.split('\n').length;
  }, [value]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const top = e.currentTarget.scrollTop;
    const left = e.currentTarget.scrollLeft;

    if (preRef.current) {
      preRef.current.scrollTop = top;
      preRef.current.scrollLeft = left;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = top;
    }
  };

  const handleReadOnlyScroll = (e: React.UIEvent<HTMLPreElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) onKeyDown(e);
    if (e.defaultPrevented) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange?.(nextVal);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  const whiteSpaceClass = wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre';

  if (readOnly) {
    return (
      <div
        className={`code-editor-root relative flex w-full h-full font-mono text-xs leading-[20px] overflow-hidden ${
          dark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'
        } ${className}`}
      >
        {showLineNumbers && (
          <div
            ref={gutterRef}
            className={`select-none text-right py-[14px] px-3 font-mono text-xs leading-[20px] shrink-0 overflow-hidden min-w-[44px] ${
              dark ? 'bg-slate-950/80 text-slate-600 border-r border-slate-800' : 'bg-slate-50 text-slate-500 border-r border-slate-200'
            }`}
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}

        <pre
          onScroll={handleReadOnlyScroll}
          className={`code-highlight flex-1 m-0 p-[14px] ${whiteSpaceClass} font-mono text-xs leading-[20px] overflow-auto select-text scrollbar-thin ${
            dark ? 'dark-editor' : ''
          }`}
          dangerouslySetInnerHTML={{
            __html: highlightedCode || `<span class="text-slate-500">${placeholder || '// Empty'}</span>`
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`code-editor-root relative flex w-full h-full font-mono text-xs leading-[20px] overflow-hidden ${
        dark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'
      } ${className}`}
    >
      {showLineNumbers && (
        <div
          ref={gutterRef}
          className={`select-none text-right py-[14px] px-3 font-mono text-xs leading-[20px] shrink-0 overflow-hidden min-w-[44px] pointer-events-none ${
            dark ? 'bg-slate-950/80 text-slate-600 border-r border-slate-800' : 'bg-slate-50 text-slate-500 border-r border-slate-200'
          }`}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}

      <div className="relative flex-1 h-full overflow-hidden">
        {/* Highlighted text rendered in background */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className={`code-highlight pointer-events-none absolute inset-0 m-0 p-[14px] ${whiteSpaceClass} font-mono text-xs leading-[20px] overflow-hidden select-none ${
            dark ? 'dark-editor' : ''
          }`}
          dangerouslySetInnerHTML={{
            __html: highlightedCode + (value.endsWith('\n') ? '\n ' : '')
          }}
        />

        {/* Foreground transparent textarea for typing & selection */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap={wrapLines ? 'soft' : 'off'}
          className={`absolute inset-0 w-full h-full m-0 p-[14px] bg-transparent resize-none font-mono text-xs leading-[20px] border-0 outline-none ${whiteSpaceClass} overflow-auto select-text scrollbar-thin placeholder:text-slate-500 ${
            dark
              ? 'caret-white text-transparent selection:bg-indigo-500/40'
              : 'caret-indigo-600 text-transparent selection:bg-indigo-500/25'
          }`}
        />
      </div>
    </div>
  );
};
