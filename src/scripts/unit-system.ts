const STORAGE_KEY = 'fitwise-unit-system';

type UnitSystem = 'metric' | 'imperial';

function applyUnitSystem(system: UnitSystem): void {
  document.documentElement.setAttribute('data-unit-system', system);
}

function currentUnitSystem(): UnitSystem {
  return document.documentElement.getAttribute('data-unit-system') === 'imperial'
    ? 'imperial'
    : 'metric';
}

function initUnitToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-unit-toggle]');
  if (!button) return;

  const sync = (): void => {
    const system = currentUnitSystem();
    const nextSystem = system === 'imperial' ? 'metric' : 'imperial';
    button.setAttribute('aria-pressed', String(system === 'imperial'));
    button.textContent = `Show ${nextSystem} results`;
    button.setAttribute(
      'aria-label',
      `Show ${nextSystem} results. Entered measurements will not change.`,
    );
  };

  sync();

  button.addEventListener('click', () => {
    const next: UnitSystem = currentUnitSystem() === 'imperial' ? 'metric' : 'imperial';
    applyUnitSystem(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private browsing); preference still applies for this view.
    }
    sync();
  });
}

initUnitToggle();

// Force module scope so this file's top-level declarations don't collide
// with other same-named script files under isolated-modules type checking.
export {};
