import { describe, expect, it } from 'vitest';
import { evaluateFit, toDimensionDisplayRows, type DimensionCheck } from '../../src/lib/fit';

describe('toDimensionDisplayRows', () => {
  const checks: DimensionCheck[] = [
    {
      dimension: 'width',
      label: 'Desk width',
      minimumMm: 1200,
      recommendedMm: 1300,
      availableMm: 1400,
    },
    {
      dimension: 'left',
      label: 'side_clearance',
      minimumMm: 0,
      recommendedMm: 38,
      availableMm: 20,
    },
  ];
  const result = evaluateFit(checks);
  const rows = toDimensionDisplayRows(checks, result);

  it('produces one row per check, preserving order and labels', () => {
    expect(rows).toHaveLength(2);
    expect(rows[0]!.label).toBe('Desk width');
    expect(rows[1]!.label).toBe('side_clearance');
  });

  it('exposes required (minimum), recommended, available and margin for each row', () => {
    expect(rows[0]).toMatchObject({
      requiredMm: 1200,
      recommendedMm: 1300,
      availableMm: 1400,
      marginMm: 200,
      hardFit: true,
      recommendedFit: true,
    });
    expect(rows[1]).toMatchObject({
      requiredMm: 0,
      recommendedMm: 38,
      availableMm: 20,
      marginMm: 20,
      hardFit: true,
      recommendedFit: false,
    });
  });

  it('defaults recommendedMm to requiredMm when no recommendation was given', () => {
    const noRecCheck: DimensionCheck[] = [{ dimension: 'depth', minimumMm: 600, availableMm: 700 }];
    const noRecResult = evaluateFit(noRecCheck);
    const [row] = toDimensionDisplayRows(noRecCheck, noRecResult);
    expect(row!.recommendedMm).toBe(600);
  });

  it('throws on a checks/result mismatch rather than silently misaligning rows', () => {
    const otherChecks: DimensionCheck[] = [
      { dimension: 'height', minimumMm: 100, availableMm: 200 },
    ];
    expect(() => toDimensionDisplayRows(otherChecks, result)).toThrow();
  });
});
