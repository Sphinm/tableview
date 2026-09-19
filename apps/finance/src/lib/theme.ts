export type Theme = 'light';

export const THEME_STORAGE_KEY = 'tableview_theme';

export function getInitialTheme(): Theme {
  return 'light';
}

export function applyTheme(_theme?: Theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('dark');
  root.classList.add('light');

  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // Ignore storage quota or access errors
  }

  // Update theme-color meta tag to clean white
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', '#ffffff');
  }
}
