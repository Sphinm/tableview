import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { parseCurrentLocation } from '../router';

describe('Router Routing & Aliases Engine (media suite)', () => {
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    let currentPath = '/';
    (globalThis as any).window = {
      location: {
        get pathname() {
          return currentPath;
        },
        hash: ''
      },
      history: {
        replaceState: (_: any, __: any, url: string) => {
          currentPath = url;
        }
      }
    };
    (globalThis as any).sessionStorage = {
      getItem: () => null,
      removeItem: () => null
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  const setPath = (path: string) => {
    (globalThis as any).window.history.replaceState({}, '', path);
  };

  it('routes root / to the home compressor', () => {
    setPath('/');
    expect(parseCurrentLocation().path).toBe('/');
  });

  it('routes media tools to their canonical paths', () => {
    setPath('/video-compressor');
    expect(parseCurrentLocation().path).toBe('/video-compressor');

    setPath('/compress-mp4');
    expect(parseCurrentLocation().path).toBe('/compress-mp4');

    setPath('/image-compressor');
    expect(parseCurrentLocation().path).toBe('/image-compressor');

    setPath('/media-tools');
    expect(parseCurrentLocation().path).toBe('/media-tools');
  });

  it('resolves media aliases properly', () => {
    setPath('/compress-video');
    expect(parseCurrentLocation().path).toBe('/video-compressor');

    setPath('/mp4-compressor');
    expect(parseCurrentLocation().path).toBe('/compress-mp4');

    setPath('/compress-image');
    expect(parseCurrentLocation().path).toBe('/image-compressor');

    setPath('/png-compress');
    expect(parseCurrentLocation().path).toBe('/compress-png');
  });

  it('resolves informational pages and aliases', () => {
    setPath('/about');
    expect(parseCurrentLocation().path).toBe('/about');

    setPath('/about-us');
    expect(parseCurrentLocation().path).toBe('/about');

    setPath('/privacy-policy');
    expect(parseCurrentLocation().path).toBe('/privacy');

    setPath('/terms-of-service');
    expect(parseCurrentLocation().path).toBe('/terms');
  });
});
