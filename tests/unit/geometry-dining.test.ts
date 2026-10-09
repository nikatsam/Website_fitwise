import { describe, expect, it } from 'vitest';
import { evaluateFit } from '../../src/lib/fit';
import { buildDiningFitPlan } from '../../src/lib/geometry';

const sample = {
  roomWidthMm: 4000,
  roomLengthMm: 4500,
  tableWidthMm: 900,
  tableLengthMm: 1800,
  chairWidthMm: 450,
  chairEnvelopeDepthMm: 550,
  chairsPerLongSide: 2,
  chairsPerEnd: 1,
  walkingClearanceMm: 600,
  orientation: 'auto' as const,
};

describe('Dining Fit geometry', () => {
  it('separates hard table/chair envelopes from user-selected circulation targets', () => {
    const plan = buildDiningFitPlan(sample);
    const result = evaluateFit(plan.checks);
    const roomWidth = plan.checks.find((check) => check.dimension === 'dining_room_width');
    const roomLength = plan.checks.find((check) => check.dimension === 'dining_room_length');

    expect(plan.orientation).toBe('width-depth');
    expect(plan.seats).toBe(6);
    expect(roomWidth?.minimumMm).toBe(2000);
    expect(roomWidth?.recommendedMm).toBe(3200);
    expect(roomLength?.minimumMm).toBe(2900);
    expect(roomLength?.recommendedMm).toBe(4100);
    expect(result.state).toBe('fits');
  });

  it('chooses the 90-degree layout when that orientation reduces hard failures', () => {
    const plan = buildDiningFitPlan({
      ...sample,
      roomWidthMm: 3000,
      roomLengthMm: 2500,
      walkingClearanceMm: 0,
      orientation: 'auto',
    });
    expect(plan.orientation).toBe('depth-width');
    expect(evaluateFit(plan.checks).hardFit).toBe(true);
  });

  it('reports tight when furniture fits but a selected walking target does not', () => {
    const plan = buildDiningFitPlan({
      ...sample,
      roomWidthMm: 2100,
      roomLengthMm: 3000,
      walkingClearanceMm: 100,
      orientation: 'width-depth',
    });
    expect(evaluateFit(plan.checks).state).toBe('tight');
  });

  it('checks chair widths along table edges as hard constraints', () => {
    const plan = buildDiningFitPlan({
      ...sample,
      chairsPerLongSide: 5,
    });
    const sideSeats = plan.checks.find((check) => check.dimension === 'dining_long_side_seats');
    expect(sideSeats?.minimumMm).toBe(2250);
    expect(sideSeats?.availableMm).toBe(1800);
    expect(evaluateFit(plan.checks).hardFit).toBe(false);
  });

  it('validates positive dimensions, chair counts and circulation values', () => {
    expect(() => buildDiningFitPlan({ ...sample, tableWidthMm: 0 })).toThrow(RangeError);
    expect(() => buildDiningFitPlan({ ...sample, chairsPerEnd: 3 })).toThrow(RangeError);
    expect(() => buildDiningFitPlan({ ...sample, walkingClearanceMm: -1 })).toThrow(RangeError);
    expect(() => buildDiningFitPlan({ ...sample, orientation: 'sideways' as never })).toThrow(
      RangeError,
    );
  });
});
