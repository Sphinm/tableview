import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  Download,
  Trash2,
  Play,
  Square,
  AlertCircle,
  Settings2,
  ArrowRightLeft,
  FileText,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../components/calculator-kit';
import { AdSlot } from '../components/AdSlot';
import { updatePageMeta } from '../lib/router';
import { captureException } from '../lib/sentry';
import {
  checkAiStatus,
  clearStoredGeminiApiKey,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  streamGatewayText,
  type AiStatus,
} from '../lib/gemini';
import { buildPolishPrompt, parsePolishOutput } from '../lib/aiPolishPrompt';
import { diffText, newTextFromTokens, type DiffResult } from '../lib/textDiff';

const aiArticlePolisherSchemas = [
  {
    '@type': 'WebApplication',
    name: 'AI Article Polisher: Remove AI Tone & Polish Prose',
    url: 'https://tableview.dev/ai-article-polisher',
    description:
      'Remove AI tone and polish articles in one pass with Gemini AI. Rules grounded in a 2.83-million-character corpus study. Review every edit with a word-level diff, then copy or export.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
];

/** A short sample so the tool can be tried without pasting anything. */
const SAMPLE_TEXT = [
  'In today\u2019s fast-moving digital landscape, data has become the most valuable asset a company owns \u2014 but it also brings unprecedented challenges.',
  '',
  'It\u2019s worth noting that traditional pipelines are not simply adequate, but are increasingly becoming a bottleneck. Essentially, there are three reasons: first, cost; second, scalability; third, maintenance.',
  '',
  'This acts like a wise mentor \u2014 it does not hand you the answer, but guides you toward it. We believe that only companies who truly understand their data will stand out.',
].join('\n');

type Phase = 'idle' | 'running' | 'done' | 'error';

export const AiArticlePolisher = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [voiceSample, setVoiceSample] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [customApiKey, setCustomApiKey] = useState(() => getStoredGeminiApiKey() || '');
  const [showKeyPanel, setShowKeyPanel] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    updatePageMeta(
      'AI Article Polisher: Remove AI Tone & Polish Prose | TableView.dev',
      'Remove AI tone and polish articles in one pass with Gemini AI. Rules grounded in a 2.83M-character corpus study, with a word-level diff of every edit.',
      '/ai-article-polisher',
      aiArticlePolisherSchemas
    );
    checkAiStatus().then(setAiStatus).catch(() => setAiStatus(null));

    return () => abortRef.current?.abort();
  }, []);

  const parsed = useMemo(() => parsePolishOutput(output), [output]);
  const article = parsed.article;

  const handleRun = useCallback(async () => {
    const text = input.trim();
    if (!text || phase === 'running') return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase('running');
    setError(null);
    setOutput('');
    setDiffResult(null);

    try {
      const { systemInstruction, prompt } = buildPolishPrompt({ text, customInstruction, voiceSample });

      const raw = await streamGatewayText({
        prompt,
        systemInstruction,
        model: 'gemini-3.8-flash',
        // Prose needs more latitude than SQL, plus room for a long article.
        temperature: 0.8,
        maxOutputTokens: Math.min(8192, Math.max(2048, Math.ceil(text.length * 2))),
        customApiKey: customApiKey || undefined,
        signal: controller.signal,
        onChunk: (accumulated) => setOutput(accumulated),
      });

      setOutput(raw);
      const finalParsed = parsePolishOutput(raw);

      if (!finalParsed.article) {
        throw new Error('The model returned an empty article. Please try again.');
      }

      setDiffResult(diffText(text, finalParsed.article));
      setPhase('done');
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setPhase(output ? 'done' : 'idle');
      } else {
        captureException(err, {
          tags: {
            feature: 'ai_article_polisher',
            hasCustomKey: Boolean(customApiKey),
          },
          extra: {
            inputLength: text.length,
            rawErrorMessage: err?.message,
          },
        });
        setError(err?.message || 'The request failed.');
        setPhase('error');
      }
    }
  }, [input, customInstruction, voiceSample, customApiKey, phase, output]);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase('done');
  };

  // Prefer the token-derived text so Copy/Export/Reuse return exactly what the
  // diff view renders (deletions removed), not the raw model payload.
  const finalText = diffResult
    ? newTextFromTokens(diffResult.tokens)
    : article || (phase === 'running' ? '' : output.trim());

  const handleCopy = async () => {
    if (!finalText) return;
    try {
      await navigator.clipboard.writeText(finalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDownload = () => {
    if (!finalText) return;
    const blob = new Blob([finalText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'polished-article.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleReuse = () => {
    if (!finalText) return;
    setInput(finalText);
    setOutput('');
    setDiffResult(null);
    setPhase('idle');
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setInput('');
    setOutput('');
    setDiffResult(null);
    setError(null);
    setPhase('idle');
  };

  const handleSaveKey = () => {
    setStoredGeminiApiKey(customApiKey);
    setShowKeyPanel(false);
    checkAiStatus().then(setAiStatus).catch(() => setAiStatus(null));
  };

  /** Change list: prefer the model rationale, fall back to diff-derived runs. */
  const changeItems = useMemo(() => {
    if (parsed.changes.length > 0) {
      return parsed.changes.map((line) => {
        const parts = line.split('|').map((p) => p.trim());
        return { title: parts[0] || line, detail: parts.slice(1).filter(Boolean).join(' \u00b7 ') };
      });
    }
    if (diffResult) {
      return diffResult.changes
        .filter((c) => c.text.length >= 2)
        .slice(0, 12)
        .map((c) => ({
          title: c.op === 'insert' ? 'Added' : 'Removed',
          detail: c.text.length > 60 ? c.text.slice(0, 60) + '\u2026' : c.text,
        }));
    }
    return [];
  }, [parsed.changes, diffResult]);

  const isRunning = phase === 'running';

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const raw = error.toLowerCase();

    // Rate limit or quota exhausted
    if (
      raw.includes('quota') ||
      raw.includes('rate limit') ||
      raw.includes('rate_limit') ||
      raw.includes('429') ||
      raw.includes('resource_exhausted')
    ) {
      return customApiKey
        ? 'Your Gemini API key quota limit was reached. Please check your Google AI Studio plan or try again shortly.'
        : 'The AI service is experiencing unusually high traffic right now. Please wait a moment and try again, or use your own Gemini API key in Options.';
    }

    // High demand / service busy / 503
    if (
      raw.includes('overload') ||
      raw.includes('503') ||
      raw.includes('high demand') ||
      raw.includes('unavailable') ||
      raw.includes('busy')
    ) {
      return 'The AI service is temporarily busy. Please wait a few moments and try again.';
    }

    // Authentication / key invalid
    if (
      raw.includes('api_key') ||
      raw.includes('api key') ||
      raw.includes('unauthenticated') ||
      raw.includes('401') ||
      raw.includes('403')
    ) {
      return customApiKey
        ? 'The configured Gemini API key is invalid or unauthorized. Please verify your key in Options.'
        : 'AI service authentication is temporarily unavailable. Please try again later or provide your own Gemini API key in Options.';
    }

    // Network / Timeout
    if (
      raw.includes('network') ||
      raw.includes('failed to fetch') ||
      raw.includes('timeout') ||
      raw.includes('offline')
    ) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }

    // Empty response
    if (raw.includes('empty article') || raw.includes('empty response')) {
      return 'The AI could not generate revisions for this text. Please verify your input and try again.';
    }

    // Friendly generic fallback (never dumping raw API strings)
    return 'Unable to complete article polishing right now. Please try again in a few moments.';
  }, [error, customApiKey]);

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <PageHeader
          breadcrumbs={[
            { label: 'Data Tools', path: '/data-tools' },
            { label: 'AI Article Polisher' }
          ]}
          badge={{
            icon: Wand2,
            label: 'Gemini Powered \u00b7 Corpus-Grounded Rules',
            tone: 'indigo'
          }}
          title="AI Article Polisher"
          description="Remove AI tone and polish an article in one pass. Original on the left, result on the right, with every edit shown as a word-level diff."
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                disabled={isRunning}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Options
              </button>
              <span className="text-xs text-slate-500">
                Removes AI-tone patterns and copy-edits in the same pass. Output stays in the article language.
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowKeyPanel((v) => !v)}
                className="p-2 rounded-xl border border-slate-300 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
                title="Gemini API key settings"
                aria-label="Gemini API key settings"
              >
                <Settings2 className="size-4" />
              </button>

              {isRunning ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="h-10 px-5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Square className="size-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={!input.trim()}
                  className="h-10 px-5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  <Play className="size-3.5 fill-current" />
                  <span>Polish Article</span>
                </button>
              )}
            </div>
          </div>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Additional instructions (optional)
                </label>
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="e.g. keep the first person, do not change technical terms, written for investors..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Voice sample (optional)
                </label>
                <textarea
                  value={voiceSample}
                  onChange={(e) => setVoiceSample(e.target.value)}
                  rows={4}
                  placeholder="Paste two or three paragraphs of your own writing. The rewrite will match its rhythm, word choice and punctuation instead of the generic rules."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 resize-y shadow-2xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  When supplied, your sample overrides the pattern rules, including dash frequency.
                </p>
              </div>
            </div>
          )}

          {showKeyPanel && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Server gateway key:</span>
                  <span className={'font-semibold ' + (aiStatus?.hasServerKey ? 'text-emerald-600' : 'text-amber-600')}>
                    {aiStatus?.hasServerKey ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span className="font-mono text-slate-700">gemini-3.8-flash</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Your own Gemini API key (optional)
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-slate-900 shadow-2xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Stored only in your browser local storage; never uploaded.
                  {' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Get a free key at Google AI Studio
                  </a>
                </p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    clearStoredGeminiApiKey();
                    setCustomApiKey('');
                  }}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Clear key
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 animate-fade-in">
            <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 leading-relaxed space-y-1">
              <p className="font-medium text-rose-900">{errorMessage}</p>
              {!aiStatus?.hasServerKey && !customApiKey && (
                <p className="text-rose-700/80 text-[11px]">
                  Tip: You can add your own Gemini API key in Options to bypass shared quota limits.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Dual pane */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Left: source */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Original</span>
                <span className="text-[10px] text-slate-500 font-mono">{input.length} chars</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setInput(SAMPLE_TEXT)}
                  disabled={isRunning}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Load sample
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white cursor-pointer"
                  title="Clear"
                  aria-label="Clear"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isRunning}
              placeholder="Paste the article you want to polish (Chinese or English, Markdown supported)..."
              className="w-full flex-1 min-h-[420px] p-4 text-sm leading-relaxed text-slate-900 placeholder-slate-400 resize-none focus:outline-none disabled:bg-slate-50/60"
            />
          </div>

          {/* Right: polished result */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800">Polished result</span>
                {isRunning && <Loader2 className="size-3.5 text-indigo-500 animate-spin" />}
                {diffResult && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round(diffResult.similarity * 100)}% unchanged
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReuse}
                  disabled={!finalText || isRunning}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40 inline-flex items-center gap-1"
                  title="Use the result as the new input"
                >
                  <ArrowRightLeft className="size-3" />
                  Reuse
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!finalText}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40 inline-flex items-center gap-1"
                >
                  {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!finalText}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white cursor-pointer disabled:opacity-40"
                  title="Export as .txt"
                  aria-label="Export as .txt"
                >
                  <Download className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[420px] p-4 text-sm leading-relaxed text-slate-900 overflow-auto">
              {!output && !isRunning && (
                <p className="text-slate-400">
                  The result appears here. Once finished, additions are highlighted in
                  <span className="mx-1 px-1.5 rounded bg-emerald-100 text-emerald-800 font-medium">green</span>
                  and removals in
                  <span className="mx-1 px-1.5 rounded bg-rose-50 text-rose-500 line-through font-medium">red strikethrough</span>.
                </p>
              )}

              {isRunning && !output && (
                <p className="text-slate-400 inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </p>
              )}

              {/* While streaming show plain text; once finished show the diff. */}
              {diffResult ? (
                <div className="whitespace-pre-wrap break-words">
                  {diffResult.tokens.map((token, index) =>
                    token.op === 'equal' ? (
                      <span key={index}>{token.text}</span>
                    ) : token.op === 'insert' ? (
                      <mark key={index} className="bg-emerald-100 text-emerald-900 rounded px-0.5">
                        {token.text}
                      </mark>
                    ) : (
                      <del
                        key={index}
                        className="bg-rose-50 text-rose-400 line-through decoration-rose-300 rounded px-0.5"
                      >
                        {token.text}
                      </del>
                    )
                  )}
                </div>
              ) : (
                output && <div className="whitespace-pre-wrap break-words">{article || output}</div>
              )}
            </div>

            {diffResult && (
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                <span className="text-emerald-700">+{diffResult.addedChars} chars</span>
                <span className="text-rose-600">-{diffResult.removedChars} chars</span>
                <span>{input.length} to {article.length} chars</span>
              </div>
            )}
          </div>
        </div>

        {/* Change list */}
        {changeItems.length > 0 && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3.5">
              <Wand2 className="size-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Changes ({changeItems.length})
              </h2>
              <span className="text-[10px] text-slate-400">
                {parsed.changes.length > 0 ? 'reported by the model' : 'derived from the word-level diff'}
              </span>
            </div>
            <ul className="space-y-2">
              {changeItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="shrink-0 mt-0.5 inline-flex items-center justify-center size-5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{item.title}</div>
                    {item.detail && (
                      <div className="text-[11px] text-slate-600 mt-0.5 break-words">{item.detail}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ad slot */}
        <div className="max-w-4xl mx-auto my-8">
          <AdSlot unit="toolInArticle" format="horizontal" />
        </div>
      </div>
    </div>
  );
};
