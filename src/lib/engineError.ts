/**
 * Error type for "the SQL engine could not be loaded", kept in its own module
 * so that UI code can branch on it WITHOUT importing lib/duckdb — a static
 * import of duckdb from App.tsx would pull the whole engine back into the
 * initial bundle.
 */

export class EngineLoadError extends Error {
  readonly failures: string[];

  constructor(message: string, failures: string[] = []) {
    super(message);
    this.name = 'EngineLoadError';
    this.failures = failures;
  }
}

/**
 * Duck-typed check as well as instanceof, because the error may have crossed a
 * dynamic-import boundary (or been re-created by a bundler) and still be the
 * same logical failure.
 */
export function isEngineLoadError(error: unknown): boolean {
  if (error instanceof EngineLoadError) return true;
  return !!error && typeof error === 'object' && (error as { name?: string }).name === 'EngineLoadError';
}
