import { describe, expect, it } from 'vitest';
import {
  evaluateFit,
  FIT_STATE_BADGE_COPY,
  getFailedDimensionRows,
  selectSummaryDimension,
  toDimensionDisplayRows,
  type DimensionCheck,
} from '../../src/lib/fit';

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

  it('exposes required, target, available, physical margin and target margin', () => {
    expect(rows[0]).toMatchObject({
      requiredMm: 1200,
      recommendedMm: 1300,
      availableMm: 1400,
      physicalMarginMm: 200,
      targetMarginMm: 100,
      hardFit: true,
      recommendedFit: true,
    });
    expect(rows[1]).toMatchObject({
      requiredMm: 0,
      recommendedMm: 38,
      availableMm: 20,
      physicalMarginMm: 20,
      targetMarginMm: -18,
      hardFit: true,
      recommendedFit: false,
    });
  });

  it('defaults recommendedMm to requiredMm when no recommendation was given', () => {
    const noRecCheck: DimensionCheck[] = [{ dimension: 'depth', minimumMm: 600, availableMm: 700 }];
    const noRecResult = evaluateFit(noRecCheck);
    const [row] = toDimensionDisplayRows(noRecCheck, noRecResult);
    expect(row!.recommendedMm).toBe(600);
    expect(row!.targetMarginMm).toBe(100);
  });

  it('throws on a checks/result mismatch rather than silently misaligning rows', () => {
    const otherChecks: DimensionCheck[] = [
      { dimension: 'height', minimumMm: 100, availableMm: 200 },
    ];
    expect(() => toDimensionDisplayRows(otherChecks, result)).toThrow();
  });

  it('prioritizes failed rows and exposes every failed hard constraint for the summary', () => {
    const checks: DimensionCheck[] = [
      { dimension: 'room_width', label: 'room width', minimumMm: 2000, availableMm: 2500 },
      {
        dimension: 'wardrobe_sweep',
        label: 'wardrobe door sweep',
        minimumMm: 495,
        availableMm: 420,
      },
      {
        dimension: 'dresser_drawer',
        label: 'dresser drawer extension',
        minimumMm: 294,
        availableMm: 180,
      },
    ];
    const rows = toDimensionDisplayRows(checks, evaluateFit(checks));

    expect(selectSummaryDimension(rows)?.dimension).toBe('dresser_drawer');
    expect(getFailedDimensionRows(rows).hardFailures.map((row) => row.dimension)).toEqual([
      'wardrobe_sweep',
      'dresser_drawer',
    ]);
  });

  it('chooses the tightest target margin even when physical margins are larger', () => {
    expect(selectSummaryDimension(rows)?.dimension).toBe('left');
  });

  it('has a distinct Needs information label for unverified manual inputs', () => {
    expect(FIT_STATE_BADGE_COPY.needs_information).toEqual({
      icon: '?',
      label: 'Needs information',
    });
  });
});
