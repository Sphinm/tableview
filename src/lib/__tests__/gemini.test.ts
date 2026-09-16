import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  cleanGeneratedSql,
  parseSseLine,
  buildDuckDbSqlPrompt,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  clearStoredGeminiApiKey,
  GEMINI_API_KEY_STORAGE_KEY,
} from '../gemini';

describe('Gemini AI SQL Client Engine', () => {
  describe('cleanGeneratedSql', () => {
    it('returns empty string for empty input', () => {
      expect(cleanGeneratedSql('')).toBe('');
    });

    it('strips ```sql code fences and extra whitespace', () => {
      const input = '```sql\nSELECT * FROM tableview_data LIMIT 10;\n```';
      expect(cleanGeneratedSql(input)).toBe('SELECT * FROM tableview_data LIMIT 10;');
    });

    it('strips plain ``` code fences without language tag', () => {
      const input = '```\nSELECT id, count(*) FROM tableview_data GROUP BY 1\n```';
      expect(cleanGeneratedSql(input)).toBe('SELECT id, count(*) FROM tableview_data GROUP BY 1');
    });

    it('preserves raw SQL without code fences untouched', () => {
      const input = 'SELECT "User ID", sum(amount) FROM tableview_data GROUP BY 1 ORDER BY 2 DESC;';
      expect(cleanGeneratedSql(input)).toBe(input);
    });

    it('handles uppercase SQL tags and partial fences', () => {
      const input = '```SQL\nSELECT 1;\n```';
      expect(cleanGeneratedSql(input)).toBe('SELECT 1;');
    });
  });

  describe('parseSseLine', () => {
    it('extracts candidate text parts from Google SSE data format', () => {
      const sseLine = 'data: {"candidates":[{"content":{"parts":[{"text":"SELECT * FROM table"}]}}]}';
      expect(parseSseLine(sseLine)).toBe('SELECT * FROM table');
    });

    it('concatenates multiple parts if present in candidates', () => {
      const sseLine = 'data: {"candidates":[{"content":{"parts":[{"text":"SELECT "},{"text":"* FROM data"}]}}]}';
      expect(parseSseLine(sseLine)).toBe('SELECT * FROM data');
    });

    it('returns empty string for [DONE]', () => {
      expect(parseSseLine('data: [DONE]')).toBe('');
    });

    it('returns empty string for non-data SSE events or ping comments', () => {
      expect(parseSseLine(': ping')).toBe('');
      expect(parseSseLine('event: message')).toBe('');
      expect(parseSseLine('')).toBe('');
    });

    it('safely catches malformed JSON without throwing', () => {
      expect(parseSseLine('data: {malformed_json')).toBe('');
    });
  });

  describe('buildDuckDbSqlPrompt', () => {
    it('constructs schema instructions with quoted column names and types', () => {
      const columns = [
        { name: 'user_id', type: 'BIGINT' },
        { name: 'Full Name', type: 'VARCHAR' },
        { name: 'revenue', type: 'DOUBLE' },
      ];
      const res = buildDuckDbSqlPrompt({
        userPrompt: 'Find top 5 customers by revenue',
        columns,
        tableName: 'tableview_data',
      });

      expect(res.prompt).toBe('Find top 5 customers by revenue');
      expect(res.systemInstruction).toContain('tableview_data');
      expect(res.systemInstruction).toContain('"user_id" (BIGINT)');
      expect(res.systemInstruction).toContain('"Full Name" (VARCHAR)');
      expect(res.systemInstruction).toContain('"revenue" (DOUBLE)');
      expect(res.systemInstruction).toContain('LIMIT 100');
    });

    it('includes sample rows if provided', () => {
      const columns = [{ name: 'status', type: 'VARCHAR' }];
      const sampleRows = [{ status: 'active' }, { status: 'pending' }];

      const res = buildDuckDbSqlPrompt({
        userPrompt: 'Count by status',
        columns,
        sampleRows,
      });

      expect(res.systemInstruction).toContain('Sample rows');
      expect(res.systemInstruction).toContain('"status": "active"');
    });
  });

  describe('Local Gemini API Key Storage', () => {
    let store: Record<string, string>;
    let originalStorage: any;

    beforeEach(() => {
      store = {};
      originalStorage = (globalThis as any).localStorage;
      (globalThis as any).localStorage = {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: (k: string) => {
          delete store[k];
        },
      };
    });

    afterEach(() => {
      (globalThis as any).localStorage = originalStorage;
    });

    it('gets null when no key is set', () => {
      expect(getStoredGeminiApiKey()).toBeNull();
    });

    it('saves, retrieves, and clears key in localStorage', () => {
      setStoredGeminiApiKey('AIzaSyCustomKey123');
      expect(getStoredGeminiApiKey()).toBe('AIzaSyCustomKey123');

      clearStoredGeminiApiKey();
      expect(getStoredGeminiApiKey()).toBeNull();
    });

    it('clears key when empty or whitespace string is set', () => {
      setStoredGeminiApiKey('AIzaSyTest');
      setStoredGeminiApiKey('   ');
      expect(getStoredGeminiApiKey()).toBeNull();
    });
  });
});

