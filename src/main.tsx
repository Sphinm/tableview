import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { scheduleSentryInit } from './lib/sentry'
import { initConsent } from './lib/consent'

// Polyfill BigInt.prototype.toJSON to prevent "Do not know how to serialize a BigInt" TypeError
if (typeof (BigInt.prototype as any).toJSON !== 'function') {
  (BigInt.prototype as any).toJSON = function () {
    return this <= Number.MAX_SAFE_INTEGER && this >= Number.MIN_SAFE_INTEGER
      ? Number(this)
      : this.toString();
  };
}

// Re-apply a previously granted cookie choice (and load Clarity if granted).
initConsent();

// Sentry is loaded lazily on idle to keep it off the critical path;
// errors thrown before it loads are buffered and flushed.
scheduleSentryInit();

// Register PWA service worker for offline app capability
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => {
        console.warn('PWA ServiceWorker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
