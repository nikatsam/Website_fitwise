import { describe, expect, it } from 'vitest';
import { computeScale, mmToPx, labelFontSizePx } from '../../src/lib/diagram';

describe('computeScale — diagrams scale relative to dimensions', () => {
  it('fits a wider-than-tall space by constraining on width', () => {
    const scale = computeScale(400, 200, 1400, 700);
    expect(scale).toBeCloseTo(400 / 1400, 10);
    expect(1400 * scale).toBeLessThanOrEqual(400 + 1e-9);
    expect(700 * scale).toBeLessThanOrEqual(200 + 1e-9);
  });

  it('fits a taller-than-wide space by constraining on height', () => {
    const scale = computeScale(400, 200, 300, 500);
    expect(scale).toBeCloseTo(200 / 500, 10);
  });

  it('produces a smaller scale for a larger space in the same container', () => {
    const smallRoom = computeScale(400, 400, 3000, 3000);
    const largeRoom = computeScale(400, 400, 6000, 6000);
    expect(largeRoom).toBeLessThan(smallRoom);
  });

  it('rejects non-positive container or space dimensions', () => {
    expect(() => computeScale(0, 100, 1000, 1000)).toThrow(RangeError);
    expect(() => computeScale(100, 100, 0, 1000)).toThrow(RangeError);
    expect(() => computeScale(Number.POSITIVE_INFINITY, 100, 1000, 1000)).toThrow(RangeError);
    expect(() => computeScale(100, 100, 1000, Number.NaN)).toThrow(RangeError);
  });
});

describe('mmToPx', () => {
  it('scales linearly', () => {
    expect(mmToPx(1000, 0.2)).toBe(200);
    expect(mmToPx(0, 0.2)).toBe(0);
  });
});

describe('labelFontSizePx', () => {
  it('clamps to the minimum for very small scales', () => {
    expect(labelFontSizePx(0.001)).toBe(11);
  });

  it('clamps to the maximum for very large scales', () => {
    expect(labelFontSizePx(5)).toBe(18);
  });

  it('scales within the clamp range for moderate scales', () => {
    const size = labelFontSizePx(0.4);
    expect(size).toBeGreaterThanOrEqual(11);
    expect(size).toBeLessThanOrEqual(18);
  });

  it('rejects invalid scales and inverted font-size clamps', () => {
    expect(() => labelFontSizePx(-1)).toThrow(RangeError);
    expect(() => labelFontSizePx(Number.NaN)).toThrow(RangeError);
    expect(() => labelFontSizePx(1, 20, 10)).toThrow(RangeError);
  });
});
