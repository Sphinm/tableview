import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureException } from '../lib/sentry';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Marks that we already auto-reloaded for a stale chunk, to avoid a reload loop. */
const RELOAD_GUARD_KEY = 'tableview_chunk_reload_attempted';

/**
 * Browsers report a missing JS chunk differently, and the wording varies by
 * engine. All of these mean the same thing: the HTML referenced a bundle that no
 * longer exists on the server, which happens to a tab left open across a deploy.
 */
const STALE_CHUNK_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk \d+ failed|Unable to preload CSS/i;

function isStaleChunkError(error: Error): boolean {
  return STALE_CHUNK_PATTERN.test(error.message || '');
}

/**
 * Catches render-time errors so a single failure cannot leave the user staring
 * at a blank page — which on an ad-supported site also means zero impressions
 * for that session.
 *
 * The most common real-world cause is a stale chunk: a tab open across a deploy
 * lazily imports a hashed bundle that has since been replaced. A reload fixes
 * that outright, so we do it once automatically and fall back to a manual
 * button if it happens again.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException(error, {
      tags: { action: 'render_error', staleChunk: String(isStaleChunkError(error)) },
      contexts: { react: { componentStack: info.componentStack } },
    });

    if (isStaleChunkError(error)) {
      try {
        if (!sessionStorage.getItem(RELOAD_GUARD_KEY)) {
          sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
          window.location.reload();
        }
      } catch {
        // sessionStorage unavailable — fall through to the manual recovery UI.
      }
    }
  }

  handleReload = () => {
    try {
      sessionStorage.removeItem(RELOAD_GUARD_KEY);
    } catch {
      // Ignore.
    }
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const staleChunk = isStaleChunkError(error);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center">
          <h1 className="text-xl font-bold text-slate-100 mb-2">
            {staleChunk ? 'This page needs a refresh' : 'Something went wrong'}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            {staleChunk
              ? 'TableView was updated while this tab was open, so part of the app is out of date. Reloading will fix it — your files were never uploaded and nothing was lost.'
              : 'An unexpected error stopped this page from rendering. Your files stay on your device and were not uploaded. Reloading usually resolves it.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            >
              Reload page
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              Back to workbench
            </a>
          </div>

          {import.meta.env.DEV && (
            <pre className="mt-6 p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-[11px] text-rose-300 overflow-auto max-h-48">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
