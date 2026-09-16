/**
 * Gemini AI Client & SQL Generator
 *
 * Connects to the TableView Cloudflare Worker Gemini AI gateway (/api/ai/generate)
 * with streaming Server-Sent Events (SSE) support and DuckDB schema-aware prompt engineering.
 */

export const GEMINI_API_KEY_STORAGE_KEY = 'tableview_gemini_api_key';

export interface ColumnContext {
  name: string;
  type: string;
}

export interface AiStatus {
  available: boolean;
  model: string;
  hasServerKey: boolean;
}

export interface GenerateSqlParams {
  userPrompt: string;
  columns: ColumnContext[];
  tableName?: string;
  sampleRows?: Array<Record<string, any>>;
  customApiKey?: string;
  signal?: AbortSignal;
  onChunk?: (accumulatedSql: string, newChunk: string) => void;
}

/**
 * Get locally stored user Gemini API key (if set by user in UI)
 */
export function getStoredGeminiApiKey(): string | null {
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Store user custom Gemini API key locally
 */
export function setStoredGeminiApiKey(key: string): void {
  try {
    const clean = key.trim();
    if (clean) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, clean);
    } else {
      clearStoredGeminiApiKey();
    }
  } catch {
    // Ignore localStorage failures
  }
}

/**
 * Clear stored user Gemini API key
 */
export function clearStoredGeminiApiKey(): void {
  try {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Check if Gemini AI is available (either server-side GEMINI_API_KEY or local key)
 */
export async function checkAiStatus(): Promise<AiStatus> {
  const localKey = getStoredGeminiApiKey();

  try {
    const res = await fetch('/api/ai/status', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = (await res.json()) as { available?: boolean; model?: string; hasServerKey?: boolean };
      const hasServerKey = Boolean(data.hasServerKey || data.available);
      return {
        available: hasServerKey || Boolean(localKey),
        model: data.model || 'gemini-3.8-flash',
        hasServerKey,
      };
    }
  } catch {
    // Worker offline or local static dev without API route
  }

  return {
    available: Boolean(localKey),
    model: 'gemini-3.8-flash',
    hasServerKey: false,
  };
}

/**
 * Strips markdown code block delimiters (```sql ... ```) and leading/trailing whitespace
 */
export function cleanGeneratedSql(raw: string): string {
  if (!raw) return '';

  let cleaned = raw.trim();

  // Strip opening ```sql or ```
  cleaned = cleaned.replace(/^```(?:sql)?\s*\n?/i, '');

  // Strip closing ```
  cleaned = cleaned.replace(/\n?```\s*$/i, '');

  return cleaned.trim();
}

/**
 * Parses a single SSE line (e.g. data: {"candidates": [...]}) and extracts text part
 */
export function parseSseLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return '';

  const jsonStr = trimmed.slice(5).trim();
  if (!jsonStr || jsonStr === '[DONE]') return '';

  try {
    const data = JSON.parse(jsonStr);
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      return parts.map((p: any) => (typeof p.text === 'string' ? p.text : '')).join('');
    }
  } catch {
    // Incomplete or non-JSON chunk
  }

  return '';
}

/**
 * Builds schema-aware system instruction and prompt for DuckDB
 */
export function buildDuckDbSqlPrompt(params: {
  userPrompt: string;
  columns: ColumnContext[];
  tableName?: string;
  sampleRows?: Array<Record<string, any>>;
}): { prompt: string; systemInstruction: string } {
  const table = params.tableName || 'tableview_data';
  const schemaList = params.columns
    .map(c => `  - "${c.name}" (${c.type || 'VARCHAR'})`)
    .join('\n');

  let sampleText = '';
  if (params.sampleRows && params.sampleRows.length > 0) {
    const safeSample = params.sampleRows.slice(0, 3).map(r => {
      const copy: Record<string, any> = {};
      for (const [k, v] of Object.entries(r)) {
        if (typeof v === 'string' && v.length > 100) {
          copy[k] = v.slice(0, 97) + '...';
        } else {
          copy[k] = v;
        }
      }
      return copy;
    });
    sampleText = `\nSample rows (first ${safeSample.length}):\n${JSON.stringify(safeSample, null, 2)}\n`;
  }

  const systemInstruction = `You are an expert DuckDB SQL data analyst.
The active DuckDB table is named "${table}".
Table Columns:
${schemaList}
${sampleText}
Instructions:
1. Write a single, highly optimized DuckDB SQL query answering the user's question.
2. Output ONLY the raw SQL query. Do NOT explain your answer, do NOT write markdown code blocks, do NOT write comments.
3. Always query from "${table}".
4. Quote column names that contain spaces, numbers, or special symbols using double quotes (e.g., "Revenue ($)", "User ID").
5. Use DuckDB functions when appropriate (e.g. UNNEST() for arrays, date_trunc() for dates, regexp_matches(), SUM, AVG).
6. If the request does not specify a row limit and does not aggregate, default to LIMIT 100 to keep the query fast.`;

  return {
    prompt: params.userPrompt.trim(),
    systemInstruction,
  };
}

/**
 * Streams SQL query generation from Gemini via Cloudflare Worker
 */
export async function streamGenerateDuckDbSql(params: GenerateSqlParams): Promise<string> {
  const { prompt, systemInstruction } = buildDuckDbSqlPrompt({
    userPrompt: params.userPrompt,
    columns: params.columns,
    tableName: params.tableName,
    sampleRows: params.sampleRows,
  });

  const apiKey = params.customApiKey?.trim() || getStoredGeminiApiKey() || undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-Gemini-Api-Key'] = apiKey;
  }

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers,
    signal: params.signal,
    body: JSON.stringify({
      prompt,
      systemInstruction,
      stream: true,
      model: 'gemini-3.8-flash',
      generationConfig: {
        temperature: 0.1, // Low temperature for deterministic, correct SQL syntax
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    let errMsg = `AI Generation failed (${response.status})`;
    try {
      const errJson = (await response.json()) as any;
      errMsg = errJson.error || errJson.message || errMsg;
    } catch {
      const errTxt = await response.text();
      if (errTxt) errMsg = errTxt;
    }
    throw new Error(errMsg);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by response');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulatedRaw = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const textChunk = parseSseLine(line);
      if (textChunk) {
        accumulatedRaw += textChunk;
        const currentClean = cleanGeneratedSql(accumulatedRaw);
        params.onChunk?.(currentClean, textChunk);
      }
    }
  }

  // Flush remaining buffer if present
  if (buffer.trim()) {
    const textChunk = parseSseLine(buffer);
    if (textChunk) {
      accumulatedRaw += textChunk;
      const currentClean = cleanGeneratedSql(accumulatedRaw);
      params.onChunk?.(currentClean, textChunk);
    }
  }

  const finalSql = cleanGeneratedSql(accumulatedRaw);
  if (!finalSql) {
    throw new Error('AI returned an empty response. Please try rephrasing your request.');
  }

  return finalSql;
}
