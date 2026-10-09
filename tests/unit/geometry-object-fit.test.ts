import { describe, expect, it } from 'vitest';
import { evaluateFit } from '../../src/lib/fit';
import { buildObjectFitPlan } from '../../src/lib/geometry';

const base = {
  objectWidthMm: 1000,
  objectDepthMm: 600,
  objectHeightMm: 900,
  spaceWidthMm: 800,
  spaceDepthMm: 1200,
  spaceHeightMm: 2400,
};

describe('generic object fit calculations', () => {
  it('selects the rotated footprint when only that orientation fits', () => {
    const plan = buildObjectFitPlan(base);
    expect(plan.orientation).toBe('depth-width');
    expect(evaluateFit(plan.checks).hardFit).toBe(true);
  });

  it('reports clearance targets separately from the physical footprint', () => {
    const plan = buildObjectFitPlan({
      ...base,
      spaceWidthMm: 1100,
      spaceDepthMm: 700,
      clearanceEachSideMm: 100,
      orientation: 'width-depth',
    });
    expect(evaluateFit(plan.checks).state).toBe('tight');
    expect(plan.checks[0]?.minimumMm).toBe(1000);
    expect(plan.checks[0]?.recommendedMm).toBe(1200);
  });

  it('checks upright doorway and corridor envelopes without assuming tilt', () => {
    const plan = buildObjectFitPlan({
      ...base,
      spaceWidthMm: 1500,
      doorwayWidthMm: 650,
      doorwayHeightMm: 950,
      corridorWidthMm: 580,
    });
    const result = evaluateFit(plan.checks);
    expect(result.state).toBe('does_not_fit');
    expect(result.failedHardConstraints).toContain('corridor width (upright, narrow face)');
    expect(result.failedHardConstraints).not.toContain('upright doorway width (narrow face)');
  });

  it('estimates a single-layer quantity with both rectangular grid orientations', () => {
    const plan = buildObjectFitPlan({
      ...base,
      spaceWidthMm: 2200,
      spaceDepthMm: 1800,
      requestedQuantity: 4,
      itemGapMm: 100,
    });
    expect(plan.quantityCapacity).toBe(4);
    expect(plan.requestedQuantity).toBe(4);
  });

  it('reports zero floor capacity when the item exceeds the available height', () => {
    const plan = buildObjectFitPlan({ ...base, objectHeightMm: 2500 });
    expect(plan.quantityCapacity).toBe(0);
    expect(evaluateFit(plan.checks).hardFit).toBe(false);
  });

  it('rejects impossible dimensions and malformed access inputs', () => {
    expect(() => buildObjectFitPlan({ ...base, spaceWidthMm: 0 })).toThrow(RangeError);
    expect(() => buildObjectFitPlan({ ...base, doorwayWidthMm: 800 })).toThrow(RangeError);
    expect(() => buildObjectFitPlan({ ...base, requestedQuantity: 1.5 })).toThrow(RangeError);
  });
});
