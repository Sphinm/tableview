import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry } from './lib/sentry'

// Polyfill BigInt.prototype.toJSON to prevent "Do not know how to serialize a BigInt" TypeError
if (typeof (BigInt.prototype as any).toJSON !== 'function') {
  (BigInt.prototype as any).toJSON = function () {
    return this <= Number.MAX_SAFE_INTEGER && this >= Number.MIN_SAFE_INTEGER
      ? Number(this)
      : this.toString();
  };
}

// Initialize Sentry error monitoring & lightweight tracing
initSentry();

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
