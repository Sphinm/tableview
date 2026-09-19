/**
 * Helpers for building safe DuckDB SQL from user input.
 *
 * The grid search box turns free text into a LIKE pattern. Without escaping,
 * LIKE metacharacters make the query mean something completely different:
 *   - searching "50%"  -> '%50%%'  -> matches every row
 *   - searching "a_b"  -> '%a_b%'  -> also matches "axb"
 */

/** Escape character used in generated LIKE clauses. */
export const LIKE_ESCAPE_CHAR = '\\';

/**
 * Make a string safe to embed inside a single-quoted LIKE pattern.
 *
 * Handles two distinct concerns:
 *   1. LIKE metacharacters (\, %, _) — escaped so they match literally.
 *   2. SQL string syntax (') — doubled so the literal cannot be broken out of.
 */
export function escapeLikePattern(input: string): string {
  return input
    .replace(/\\/g, LIKE_ESCAPE_CHAR + LIKE_ESCAPE_CHAR) // must run first
    .replace(/%/g, LIKE_ESCAPE_CHAR + '%')
    .replace(/_/g, LIKE_ESCAPE_CHAR + '_')
    .replace(/'/g, "''");
}

/** Quote a SQL identifier, doubling any embedded double quotes. */
export function quoteIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

/**
 * Build a case-insensitive "contains" filter across the given columns.
 * Returns undefined when there is nothing to filter on.
 */
export function buildSearchFilter(
  searchText: string,
  columnNames: string[]
): string | undefined {
  if (!searchText.trim() || columnNames.length === 0) return undefined;

  const pattern = escapeLikePattern(searchText.toLowerCase());

  return columnNames
    .map(
      (name) =>
        `lower(cast(${quoteIdentifier(name)} as varchar)) LIKE '%${pattern}%' ESCAPE '${LIKE_ESCAPE_CHAR}'`
    )
    .join(' OR ');
}
