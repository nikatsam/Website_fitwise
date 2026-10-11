const STORAGE_KEY = 'fitwise-unit-system';
const unitSystems = ['metric', 'imperial', 'both'] as const;
type UnitSystem = (typeof unitSystems)[number];

function currentUnitSystem(): UnitSystem {
  const value = document.documentElement.getAttribute('data-unit-system');
  return unitSystems.find((system) => system === value) ?? 'metric';
}

function syncUnitChoices(): void {
  const current = currentUnitSystem();
  document.querySelectorAll<HTMLInputElement>('[data-unit-choice]').forEach((choice) => {
    choice.checked = choice.value === current;
  });
}

document.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.matches('[data-unit-choice]')) return;
  if (!unitSystems.some((system) => system === target.value)) return;

  const system = target.value as UnitSystem;
  document.documentElement.setAttribute('data-unit-system', system);
  try {
    localStorage.setItem(STORAGE_KEY, system);
  } catch {
    // Storage may be unavailable (private browsing); preference still applies for this view.
  }
  syncUnitChoices();
});

syncUnitChoices();

export {};
