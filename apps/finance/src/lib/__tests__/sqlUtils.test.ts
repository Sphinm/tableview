import { describe, it, expect } from 'bun:test';
import { escapeLikePattern, quoteIdentifier, buildSearchFilter, LIKE_ESCAPE_CHAR } from '../sqlUtils';

describe('SQL escaping helpers', () => {
  describe('escapeLikePattern', () => {
    it('escapes the % wildcard so it matches literally', () => {
      expect(escapeLikePattern('50%')).toBe('50\\%');
    });

    it('escapes the _ wildcard so it matches literally', () => {
      expect(escapeLikePattern('a_b')).toBe('a\\_b');
    });

    it('doubles single quotes so the literal cannot be broken out of', () => {
      expect(escapeLikePattern("O'Brien")).toBe("O''Brien");
    });

    it('escapes a backslash before other metacharacters', () => {
      // A lone backslash must become two, and must not double-escape later steps.
      expect(escapeLikePattern('a\\b')).toBe('a\\\\b');
    });

    it('neutralises a classic injection attempt', () => {
      const out = escapeLikePattern("' OR 1=1 --");
      expect(out).toBe("'' OR 1=1 --");
      // The only quotes present are doubled, so the SQL string stays intact.
      expect(out.includes("''")).toBe(true);
    });

    it('escapes a percent sign that follows a backslash exactly once', () => {
      expect(escapeLikePattern('\\%')).toBe('\\\\\\%');
    });

    it('leaves ordinary text untouched', () => {
      expect(escapeLikePattern('revenue')).toBe('revenue');
    });
  });

  describe('quoteIdentifier', () => {
    it('wraps a plain identifier in double quotes', () => {
      expect(quoteIdentifier('amount')).toBe('"amount"');
    });

    it('doubles embedded double quotes', () => {
      expect(quoteIdentifier('we"ird')).toBe('"we""ird"');
    });
  });

  describe('buildSearchFilter', () => {
    it('returns undefined for blank input', () => {
      expect(buildSearchFilter('   ', ['a'])).toBeUndefined();
    });

    it('returns undefined when there are no columns', () => {
      expect(buildSearchFilter('x', [])).toBeUndefined();
    });

    it('lowercases the needle and ORs across columns', () => {
      const filter = buildSearchFilter('AB', ['name', 'city']);
      expect(filter).toContain('"name"');
      expect(filter).toContain('"city"');
      expect(filter).toContain("'%ab%'");
      expect(filter).toContain(' OR ');
    });

    it('declares ESCAPE so the metacharacter escaping takes effect', () => {
      const filter = buildSearchFilter('50%', ['amount']);
      expect(filter).toContain(`ESCAPE '${LIKE_ESCAPE_CHAR}'`);
      expect(filter).toContain('%50\\%%');
    });

    it('cannot be used to terminate the string literal early', () => {
      const filter = buildSearchFilter("' OR 1=1 --", ['name'])!;
      // Quotes from user input are doubled, so no lone quote reaches the SQL.
      expect(filter).not.toContain("'%' OR 1=1");
      expect(filter).toContain("''");
    });
  });
});
