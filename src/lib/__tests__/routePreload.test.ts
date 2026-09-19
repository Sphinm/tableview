import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { preloadRoute, preloadRoutes, idlePreloadRoutes, initGlobalHoverPreloader } from '../routePreload';

describe('Route Preloading Engine', () => {
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    (globalThis as any).window = {
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      requestIdleCallback: mock((cb: () => void) => cb()),
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it('safely handles empty or root routes without error', () => {
    expect(() => preloadRoute('')).not.toThrow();
    expect(() => preloadRoute('/')).not.toThrow();
    expect(() => preloadRoute('/#')).not.toThrow();
  });

  it('preloads valid calculator routes without throwing', () => {
    expect(() => preloadRoute('/mortgage-calculator')).not.toThrow();
    expect(() => preloadRoute('/dscr-loan-calculator')).not.toThrow();
    expect(() => preloadRoute('/video-compressor')).not.toThrow();
  });

  it('preloads aliased routes via resolveRoutePath resolution', () => {
    expect(() => preloadRoute('/tools/mortgage-calculator')).not.toThrow();
    expect(() => preloadRoute('/dscr')).not.toThrow();
    expect(() => preloadRoute('/compress-mp4')).not.toThrow();
  });

  it('preloads batch routes with preloadRoutes', () => {
    expect(() =>
      preloadRoutes([
        '/mortgage-calculator',
        '/refinance-calculator',
        '/loan-comparison-calculator'
      ])
    ).not.toThrow();
  });

  it('schedules idle preloading without throwing', () => {
    const idleMock = mock((cb: any) => cb());
    (globalThis as any).window.requestIdleCallback = idleMock;

    idlePreloadRoutes(['/hard-money-calculator', '/commercial-loan-calculator']);

    expect(idleMock).toHaveBeenCalled();
  });

  it('attaches and removes global hover preloader event listeners', () => {
    const addEventListenerMock = mock(() => {});
    const removeEventListenerMock = mock(() => {});
    (globalThis as any).window.addEventListener = addEventListenerMock;
    (globalThis as any).window.removeEventListener = removeEventListenerMock;

    const cleanup = initGlobalHoverPreloader();

    expect(addEventListenerMock).toHaveBeenCalled();
    cleanup();
    expect(removeEventListenerMock).toHaveBeenCalled();
  });
});
