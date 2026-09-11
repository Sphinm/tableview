import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { sizeBucket, fileExtension } from '../analytics';

const root = path.join(import.meta.dir, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') walk(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const sources = walk(root);

describe('Analytics parameter helpers', () => {
  it('buckets sizes coarsely rather than reporting exact bytes', () => {
    // An exact byte count plus a timestamp is close to a fingerprint.
    expect(sizeBucket(500)).toBe('<1MB');
    expect(sizeBucket(5 * 1024 * 1024)).toBe('1-10MB');
    expect(sizeBucket(50 * 1024 * 1024)).toBe('10-100MB');
    expect(sizeBucket(500 * 1024 * 1024)).toBe('100MB-1GB');
    expect(sizeBucket(5 * 1024 * 1024 * 1024)).toBe('>1GB');
  });

  it('treats a boundary as belonging to the lower bucket', () => {
    expect(sizeBucket(1024 * 1024)).toBe('1-10MB');
  });

  it('extracts a lowercased extension', () => {
    expect(fileExtension('Report.CSV')).toBe('csv');
    expect(fileExtension('a.b.PARQUET')).toBe('parquet');
  });

  it('handles names with no usable extension', () => {
    expect(fileExtension('README')).toBe('none');
    expect(fileExtension('trailing.')).toBe('none');
  });

  it('caps a pathological extension length', () => {
    expect(fileExtension('x.' + 'a'.repeat(50)).length).toBe(8);
  });
});

describe('Session replay privacy', () => {
  const sentrySource = fs.readFileSync(path.join(root, 'lib', 'sentry.ts'), 'utf8');

  it('masks all text, all inputs and all media', () => {
    expect(sentrySource).toContain('maskAllText: true');
    expect(sentrySource).toContain('maskAllInputs: true');
    expect(sentrySource).toContain('blockAllMedia: true');
  });

  it('never captures request or response bodies', () => {
    expect(sentrySource).toContain('networkDetailAllowUrls: []');
  });

  it('keeps the session sample rate a named, deliberate constant', () => {
    // The rate trades replay coverage against the Sentry quota (50 replays/month
    // on the free plan), so it must be a single obvious dial rather than a bare
    // number buried in init().
    expect(sentrySource).toContain('export const REPLAY_SESSION_SAMPLE_RATE');
    expect(sentrySource).toContain('replaysSessionSampleRate: REPLAY_SESSION_SAMPLE_RATE');
  });

  it('keeps the sample rate within 0..1', async () => {
    const { REPLAY_SESSION_SAMPLE_RATE } = await import('../sentry');
    expect(REPLAY_SESSION_SAMPLE_RATE).toBeGreaterThanOrEqual(0);
    expect(REPLAY_SESSION_SAMPLE_RATE).toBeLessThanOrEqual(1);
  });

  it('always samples sessions that raise an error', () => {
    // Lowering this would mean errors go unrecorded whenever their session
    // missed the sampling roll.
    expect(sentrySource).toContain('replaysOnErrorSampleRate: 1.0');
  });

  it('gates the replay bundle behind consent', () => {
    // The import must be dynamic, or every visitor downloads replay regardless.
    expect(sentrySource).toContain("await import('@sentry/replay')");
    expect(sentrySource).toContain('hasAnalyticsConsent()');
  });

  it('does not preload the SDK before consent', () => {
    // @sentry/react re-exports @sentry/replay, so an unconditional preload also
    // downloads the recorder. Measured in a cold browser profile before this
    // guard existed: the replay chunk was fetched without consent.
    const schedule = sentrySource.slice(sentrySource.indexOf('export function scheduleSentryInit'));
    expect(schedule).toContain('if (!hasAnalyticsConsent()) return;');
    // The early return must come before the idle scheduling.
    const guardAt = schedule.indexOf('if (!hasAnalyticsConsent()) return;');
    const idleAt = schedule.indexOf('requestIdleCallback');
    expect(guardAt).toBeGreaterThan(-1);
    expect(idleAt).toBeGreaterThan(guardAt);
  });
});

describe('Recording mask coverage', () => {
  /**
   * These pages render the user's own files or financial figures. If one loses
   * its mask attribute, that content starts flowing into session recordings —
   * the exact thing the product promises never leaves the device.
   */
  const mustBeMasked = [
    'components/DataView.tsx',
    'components/JsonView.tsx',
    'pages/MortgageCalculator.tsx',
    'pages/RefinanceCalculator.tsx',
    'pages/DscrCalculator.tsx',
    'pages/HardMoneyCalculator.tsx',
    'pages/SnowflakeCalculator.tsx',
    'pages/ParquetSavingsCalculator.tsx',
    'pages/Section1031Calculator.tsx',
  ];

  it('marks every data-bearing view with data-sentry-mask', () => {
    const unmasked = mustBeMasked.filter(
      (rel) => !fs.readFileSync(path.join(root, ...rel.split('/')), 'utf8').includes('data-sentry-mask')
    );
    expect(unmasked).toEqual([]);
  });

  it('has no leftover Clarity mask attributes', () => {
    // Clarity was removed; a stale data-clarity-mask would silently do nothing.
    const stale = sources.filter((f) => fs.readFileSync(f, 'utf8').includes('data-clarity-mask'));
    expect(stale.map((f) => path.relative(root, f))).toEqual([]);
  });
});

describe('Analytics event hygiene', () => {
  it('never sends a raw file name to analytics', () => {
    // trackEvent call sites must not pass name/filename keys.
    const offenders: string[] = [];
    for (const file of sources) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(/trackEvent\([^)]*\)/g)) {
        if (/\b(file_?name|filename)\s*:/.test(m[0])) offenders.push(path.relative(root, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('does not mention any removed third-party recorder', () => {
    const offenders = sources.filter((f) => /clarity\.ms|clarity\(/i.test(fs.readFileSync(f, 'utf8')));
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });
});
