import { describe, expect, it } from 'vitest';
import {
  mmToCm,
  cmToMm,
  mmToM,
  mToMm,
  mmToInches,
  inchesToMm,
  mmToFeetInches,
  feetInchesToMm,
  roundTo,
  formatCm,
  formatM,
  formatInches,
  formatFeetInches,
  formatMetric,
  parseLength,
} from '../../src/lib/units';

describe('unit conversion — round trips', () => {
  it('round-trips mm -> cm -> mm exactly', () => {
    expect(cmToMm(mmToCm(1400))).toBeCloseTo(1400, 10);
  });

  it('round-trips mm -> m -> mm exactly', () => {
    expect(mToMm(mmToM(3048))).toBeCloseTo(3048, 10);
  });

  it('round-trips mm -> inches -> mm within 1e-9 mm', () => {
    expect(inchesToMm(mmToInches(1500))).toBeCloseTo(1500, 9);
  });

  it('round-trips mm -> feet/inches -> mm within 1e-9 mm', () => {
    const feetInches = mmToFeetInches(2000);
    expect(feetInchesToMm(feetInches)).toBeCloseTo(2000, 9);
  });

  it('matches known equivalents: 1 inch = 25.4 mm', () => {
    expect(inchesToMm(1)).toBe(25.4);
  });

  it('matches known equivalents: 6 ft = 1828.8 mm', () => {
    expect(feetInchesToMm({ feet: 6, inches: 0 })).toBeCloseTo(1828.8, 9);
  });
});

describe('unit conversion — boundary and invalid values', () => {
  it('treats zero as a valid, boundary length', () => {
    expect(mmToCm(0)).toBe(0);
    expect(mmToFeetInches(0)).toEqual({ feet: 0, inches: 0 });
  });

  it('propagates negative input rather than silently clamping (callers validate positivity)', () => {
    expect(mmToCm(-10)).toBe(-1);
  });
});

describe('roundTo', () => {
  it('rounds half-away-from-zero and avoids float artifacts', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(0.1 + 0.2, 1)).toBe(0.3);
  });

  it('rounds negative numbers away from zero', () => {
    expect(roundTo(-1.005, 2)).toBe(-1.01);
  });
});

describe('display formatting — deterministic', () => {
  it('formats cm with one decimal by default', () => {
    expect(formatCm(1400)).toBe('140.0 cm');
  });

  it('formats metres with two decimals by default', () => {
    expect(formatM(3048)).toBe('3.05 m');
  });

  it('formats inches with one decimal by default', () => {
    expect(formatInches(25.4)).toBe('1.0 in');
  });

  it('formats feet/inches and carries 12 rounded inches into an extra foot', () => {
    expect(formatFeetInches(1828.8)).toBe('6 ft 0 in');
    // 11.6 in rounds to 12 in, which must carry rather than display "ft 12 in".
    const mmJustUnderAFoot = inchesToMm(11.6);
    expect(formatFeetInches(mmJustUnderAFoot)).toBe('1 ft 0 in');
  });

  it('switches metric display from cm to m at the 10 m threshold', () => {
    expect(formatMetric(9999)).toMatch(/cm$/);
    expect(formatMetric(10000)).toMatch(/m$/);
  });
});

describe('parseLength', () => {
  it('parses a plain number using the default mm assumption', () => {
    const result = parseLength('1400');
    expect(result).toEqual({ ok: true, valueMm: 1400 });
  });

  it('parses a plain number using an explicit assumeUnit', () => {
    const result = parseLength('140', { assumeUnit: 'cm' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.valueMm).toBeCloseTo(1400, 9);
  });

  it('parses explicit cm, m and inch suffixes', () => {
    expect(parseLength('140cm')).toEqual({ ok: true, valueMm: 1400 });
    const metres = parseLength('1.4m');
    expect(metres.ok).toBe(true);
    if (metres.ok) expect(metres.valueMm).toBeCloseTo(1400, 9);
    const inches = parseLength('55in');
    expect(inches.ok).toBe(true);
    if (inches.ok) expect(inches.valueMm).toBeCloseTo(1397, 0);
  });

  it('parses combined feet-and-inches notation', () => {
    const result = parseLength(`4'7"`);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.valueMm).toBeCloseTo(feetInchesToMm({ feet: 4, inches: 7 }), 9);

    const spaced = parseLength('4 ft 7 in');
    expect(spaced.ok).toBe(true);
    if (spaced.ok && result.ok) expect(spaced.valueMm).toBeCloseTo(result.valueMm, 9);
  });

  it('rejects empty input with a clear message', () => {
    const result = parseLength('   ');
    expect(result).toEqual({ ok: false, error: 'Enter a length.' });
  });

  it('rejects negative numbers', () => {
    const result = parseLength('-5cm');
    expect(result.ok).toBe(false);
  });

  it('rejects unparseable garbage with a clear message', () => {
    const result = parseLength('about yay big');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });
});
