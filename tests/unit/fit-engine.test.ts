import { describe, expect, it } from 'vitest';
import { evaluateFit, type DimensionCheck } from '../../src/lib/fit';

describe('evaluateFit — core semantics', () => {
  it('requires at least one dimension check', () => {
    expect(() => evaluateFit([])).toThrow(RangeError);
  });

  it('rejects non-finite dimensions and recommendations below the hard minimum', () => {
    expect(() =>
      evaluateFit([{ dimension: 'width', minimumMm: 100, recommendedMm: 99, availableMm: 120 }]),
    ).toThrow(RangeError);
    expect(() =>
      evaluateFit([{ dimension: 'width', minimumMm: 100, availableMm: Number.POSITIVE_INFINITY }]),
    ).toThrow(RangeError);
    expect(() =>
      evaluateFit([{ dimension: 'width', minimumMm: Number.NaN, availableMm: 120 }]),
    ).toThrow(RangeError);
  });

  it('hard fit + recommended fit => fits', () => {
    const checks: DimensionCheck[] = [
      { dimension: 'width', minimumMm: 1200, recommendedMm: 1300, availableMm: 1400 },
    ];
    const result = evaluateFit(checks);
    expect(result.state).toBe('fits');
    expect(result.hardFit).toBe(true);
    expect(result.recommendedFit).toBe(true);
    expect(result.failedRecommendations).toEqual([]);
    expect(result.failedHardConstraints).toEqual([]);
  });

  it('hard fit + failed recommendation => tight', () => {
    const checks: DimensionCheck[] = [
      {
        dimension: 'left',
        label: 'side_clearance',
        minimumMm: 0,
        recommendedMm: 38,
        availableMm: 20,
      },
    ];
    const result = evaluateFit(checks);
    expect(result.state).toBe('tight');
    expect(result.hardFit).toBe(true);
    expect(result.recommendedFit).toBe(false);
    expect(result.failedRecommendations).toEqual(['side_clearance']);
    expect(result.failedHardConstraints).toEqual([]);
  });

  it('failed hard fit => does_not_fit, even if other dimensions are comfortable', () => {
    const checks: DimensionCheck[] = [
      { dimension: 'width', minimumMm: 1200, recommendedMm: 1300, availableMm: 1000 },
      { dimension: 'depth', minimumMm: 600, recommendedMm: 650, availableMm: 800 },
    ];
    const result = evaluateFit(checks);
    expect(result.state).toBe('does_not_fit');
    expect(result.hardFit).toBe(false);
    expect(result.failedHardConstraints).toEqual(['width']);
  });

  it('combines multiple dimensions, taking the worst state across all of them', () => {
    const checks: DimensionCheck[] = [
      { dimension: 'width', minimumMm: 1200, recommendedMm: 1300, availableMm: 1400 },
      { dimension: 'depth', minimumMm: 600, recommendedMm: 700, availableMm: 650 },
    ];
    const result = evaluateFit(checks);
    expect(result.state).toBe('tight');
    expect(result.failedRecommendations).toEqual(['depth']);
  });

  it('uses minimumMm as the recommendation when none is given', () => {
    const checks: DimensionCheck[] = [{ dimension: 'width', minimumMm: 1200, availableMm: 1200 }];
    const result = evaluateFit(checks);
    expect(result.state).toBe('fits');
  });

  it('carries assumptions through unchanged', () => {
    const result = evaluateFit(
      [{ dimension: 'width', minimumMm: 100, availableMm: 200 }],
      ['monitor_stands_included'],
    );
    expect(result.assumptions).toEqual(['monitor_stands_included']);
  });

  it('reports hard margins in marginsMm keyed by dimension', () => {
    const result = evaluateFit([
      { dimension: 'left', minimumMm: 0, availableMm: 38 },
      { dimension: 'right', minimumMm: 0, availableMm: 38 },
    ]);
    expect(result.marginsMm).toEqual({ left: 38, right: 38 });
  });
});

describe('evaluateFit — equality and ±1 mm boundaries', () => {
  it('available exactly equal to minimum is a hard fit (>=, not >)', () => {
    const result = evaluateFit([{ dimension: 'width', minimumMm: 1400, availableMm: 1400 }]);
    expect(result.hardFit).toBe(true);
    expect(result.state).not.toBe('does_not_fit');
    expect(result.marginsMm.width).toBe(0);
  });

  it('available 1 mm under minimum fails the hard fit', () => {
    const result = evaluateFit([{ dimension: 'width', minimumMm: 1400, availableMm: 1399 }]);
    expect(result.hardFit).toBe(false);
    expect(result.state).toBe('does_not_fit');
    expect(result.marginsMm.width).toBe(-1);
  });

  it('available 1 mm over minimum passes the hard fit', () => {
    const result = evaluateFit([{ dimension: 'width', minimumMm: 1400, availableMm: 1401 }]);
    expect(result.hardFit).toBe(true);
    expect(result.marginsMm.width).toBe(1);
  });

  it('available exactly equal to recommendedMm satisfies the recommendation (>=, not >)', () => {
    const result = evaluateFit([
      { dimension: 'width', minimumMm: 1200, recommendedMm: 1300, availableMm: 1300 },
    ]);
    expect(result.recommendedFit).toBe(true);
    expect(result.state).toBe('fits');
  });

  it('available 1 mm under recommendedMm is tight, not fits', () => {
    const result = evaluateFit([
      { dimension: 'width', minimumMm: 1200, recommendedMm: 1300, availableMm: 1299 },
    ]);
    expect(result.hardFit).toBe(true);
    expect(result.recommendedFit).toBe(false);
    expect(result.state).toBe('tight');
  });

  it('available 1 mm over recommendedMm fits', () => {
    const result = evaluateFit([
      { dimension: 'width', minimumMm: 1200, recommendedMm: 1300, availableMm: 1301 },
    ]);
    expect(result.state).toBe('fits');
  });
});
