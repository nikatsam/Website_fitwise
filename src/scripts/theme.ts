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
    const lightLabel = button.dataset.themeLightLabel ?? 'Light';
    const darkLabel = button.dataset.themeDarkLabel ?? 'Dark';
    const label = theme === 'dark' ? darkLabel : lightLabel;
    const icon = button.querySelector<HTMLElement>('[data-theme-icon]');
    const text = button.querySelector<HTMLElement>('[data-theme-label]');
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.setAttribute(
      'aria-label',
      (button.dataset.themeAriaLabelTemplate ?? 'Theme: {theme}').replace('{theme}', label),
    );
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    if (text) text.textContent = label;
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
