import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { announceFitStateChange } from '../../src/lib/fit/summary-announcement';

describe('announceFitStateChange', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('announces only a changed state and debounces rapid edits', () => {
    const status = { textContent: '' } as HTMLElement;
    const summary = {
      querySelector: (selector: string) =>
        selector === '[data-fit-state-announcement]' ? status : null,
    } as unknown as HTMLElement;

    announceFitStateChange(summary, 'fits', 'tight', 'Tight fit');
    vi.advanceTimersByTime(250);
    announceFitStateChange(summary, 'tight', 'does_not_fit', 'Does not fit');
    vi.advanceTimersByTime(399);
    expect(status.textContent).toBe('');
    vi.advanceTimersByTime(1);
    expect(status.textContent).toBe('Does not fit');

    announceFitStateChange(summary, 'does_not_fit', 'does_not_fit', 'Does not fit');
    vi.advanceTimersByTime(500);
    expect(status.textContent).toBe('Does not fit');
  });

  it('does not announce initial state when it has not changed', () => {
    const status = { textContent: '' } as HTMLElement;
    const summary = {
      querySelector: () => status,
    } as unknown as HTMLElement;

    announceFitStateChange(summary, 'fits', 'fits', 'Fits');
    vi.advanceTimersByTime(500);
    expect(status.textContent).toBe('');
  });
});
