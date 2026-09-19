/**
 * URL State & Shareable Link Engine
 * Encodes/decodes calculation inputs directly into URL query parameters
 * for zero-server sharing and viral link distribution.
 */

export function getUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function updateUrlQuery(newParams: Record<string, string | number | boolean | undefined | null>) {
  if (typeof window === 'undefined') return;

  const currentParams = new URLSearchParams(window.location.search);
  
  Object.entries(newParams).forEach(([key, val]) => {
    if (val === undefined || val === null || val === '') {
      currentParams.delete(key);
    } else {
      currentParams.set(key, String(val));
    }
  });

  const search = currentParams.toString();
  const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
  
  window.history.replaceState(null, '', newUrl);
}

export async function copyShareableUrl(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed, falling back to prompt:', err);
    try {
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
