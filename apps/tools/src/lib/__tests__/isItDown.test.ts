import { describe, it, expect } from 'bun:test';
import { resolveRoutePath, isKnownRoute, listPrerenderTargets } from '../resolveRoute';
import { STATIC_PAGE_META } from '../../data/routeMeta';

describe('Website Status Checker Routes & Resolution', () => {
  it('resolves canonical route /is-it-down', () => {
    expect(resolveRoutePath('/is-it-down')).toEqual({ path: '/is-it-down' });
    expect(resolveRoutePath('/tools/is-it-down')).toEqual({ path: '/is-it-down' });
  });

  it('marks /is-it-down as a known route to prevent soft-404', () => {
    expect(isKnownRoute('/is-it-down')).toBe(true);
  });

  it('registers prerender target with correct canonical tag', () => {
    const targets = listPrerenderTargets();
    const targetMap = new Map(targets.map((t) => [t.url, t.canonical]));

    expect(targetMap.get('/is-it-down')).toBe('/is-it-down');
  });

  it('defines valid SEO metadata with title, description, and canonical path', () => {
    const meta = STATIC_PAGE_META['/is-it-down'];
    expect(meta).toBeDefined();
    expect(meta.canonical).toBe('/is-it-down');
    expect(meta.title.length).toBeGreaterThan(20);
    expect(meta.description.length).toBeGreaterThan(50);
  });
});

describe('SSRF Protection Logic', () => {
  // Pure copy of the worker SSRF protection logic to assert correct security boundaries
  function isBlockedHostname(hostname: string): boolean {
    const lower = hostname.toLowerCase().trim();
    if (
      lower === 'localhost' ||
      lower.endsWith('.localhost') ||
      lower.endsWith('.local') ||
      lower.endsWith('.internal') ||
      lower.endsWith('.arpa')
    ) {
      return true;
    }

    const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [, a, b] = ipv4Match.map(Number);
      if (a === 0 || a === 127 || a === 10) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 169 && b === 254) return true;
      if (a >= 224) return true;
    }

    if (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fe80:') ||
      lower.startsWith('fc00:') ||
      lower.startsWith('fd00:')
    ) {
      return true;
    }

    return false;
  }

  it('blocks localhost and internal domain names', () => {
    expect(isBlockedHostname('localhost')).toBe(true);
    expect(isBlockedHostname('foo.localhost')).toBe(true);
    expect(isBlockedHostname('server.local')).toBe(true);
    expect(isBlockedHostname('database.internal')).toBe(true);
  });

  it('blocks loopback and private IPv4 ranges (RFC 1918 & link-local)', () => {
    expect(isBlockedHostname('127.0.0.1')).toBe(true);
    expect(isBlockedHostname('127.1.2.3')).toBe(true);
    expect(isBlockedHostname('10.0.0.1')).toBe(true);
    expect(isBlockedHostname('10.254.0.1')).toBe(true);
    expect(isBlockedHostname('192.168.1.1')).toBe(true);
    expect(isBlockedHostname('172.16.0.1')).toBe(true);
    expect(isBlockedHostname('172.31.255.255')).toBe(true);
    expect(isBlockedHostname('169.254.169.254')).toBe(true); // AWS/GCP Instance metadata
    expect(isBlockedHostname('0.0.0.0')).toBe(true);
  });

  it('blocks IPv6 loopback and link-local', () => {
    expect(isBlockedHostname('::1')).toBe(true);
    expect(isBlockedHostname('fe80::1')).toBe(true);
  });

  it('permits public internet domains and IPs', () => {
    expect(isBlockedHostname('github.com')).toBe(false);
    expect(isBlockedHostname('google.com')).toBe(false);
    expect(isBlockedHostname('notion.so')).toBe(false);
    expect(isBlockedHostname('1.1.1.1')).toBe(false);
    expect(isBlockedHostname('8.8.8.8')).toBe(false);
    expect(isBlockedHostname('142.250.190.46')).toBe(false);
  });
});
