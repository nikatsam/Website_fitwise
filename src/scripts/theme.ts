const STORAGE_KEY = 'fitwise-theme';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function initThemeToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button) return;

  const sync = (): void => {
    const theme = currentTheme();
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  };

  sync();

  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private browsing); theme still applies for this view.
    }
    sync();
  });
}

initThemeToggle();

// Force module scope so this file's top-level declarations don't collide
// with other same-named script files under isolated-modules type checking.
export {};
