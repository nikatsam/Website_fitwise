import { describe, expect, it } from 'vitest';
import { evaluateFit } from '../../src/lib/fit';
import { buildRugFitPlan } from '../../src/lib/geometry';

const sample = {
  roomWidthMm: 4000,
  roomDepthMm: 5000,
  rugWidthMm: 2400,
  rugDepthMm: 3000,
  wallGapEachSideMm: 100,
  checkFurniture: true,
  coverageMode: 'full-footprint' as const,
  furnitureWidthMm: 1800,
  furnitureDepthMm: 2000,
  furnitureMarginEachSideMm: 100,
};

describe('Rug Fit geometry', () => {
  it('checks rug-to-room and full furniture-use footprint as separate dimensions', () => {
    const plan = buildRugFitPlan(sample);
    const result = evaluateFit(plan.checks);

    expect(plan.orientation).toBe('width-depth');
    expect(plan.checks.map((check) => check.dimension)).toEqual([
      'rug_room_width',
      'rug_room_depth',
      'rug_furniture_width',
      'rug_furniture_depth',
    ]);
    expect(plan.checks[0]?.recommendedMm).toBe(2600);
    expect(plan.checks[2]?.recommendedMm).toBe(2000);
    expect(result.state).toBe('fits');
  });

  it('tries the rug rotated by 90 degrees when the chosen orientation does not fit', () => {
    const plan = buildRugFitPlan({
      ...sample,
      roomWidthMm: 3100,
      roomDepthMm: 2500,
      rugWidthMm: 2400,
      rugDepthMm: 3000,
      wallGapEachSideMm: 0,
      checkFurniture: false,
    });

    expect(plan.orientation).toBe('depth-width');
    expect(evaluateFit(plan.checks).state).toBe('fits');
  });

  it('returns tight when physical dimensions fit but a user-selected border does not', () => {
    const plan = buildRugFitPlan({
      ...sample,
      roomWidthMm: 2500,
      wallGapEachSideMm: 100,
    });

    expect(evaluateFit(plan.checks).state).toBe('tight');
  });

  it('returns does-not-fit when the rug or fully covered footprint exceeds its bounds', () => {
    const rugOutsideRoom = buildRugFitPlan({ ...sample, roomWidthMm: 2000 });
    const furnitureOutsideRug = buildRugFitPlan({ ...sample, furnitureWidthMm: 3200 });

    expect(evaluateFit(rugOutsideRoom.checks).state).toBe('does_not_fit');
    expect(evaluateFit(furnitureOutsideRug.checks).state).toBe('does_not_fit');
  });

  it('checks a user-measured front-edge overlap and optional forward projection', () => {
    const plan = buildRugFitPlan({
      ...sample,
      rugWidthMm: 2200,
      rugDepthMm: 800,
      furnitureWidthMm: 1800,
      furnitureDepthMm: 900,
      coverageMode: 'front-edge',
      furnitureMarginEachSideMm: 100,
      frontOverlapMm: 150,
      frontExtensionMm: 500,
    });
    const relation = plan.checks.find((check) => check.dimension === 'rug_front_edge_coverage');

    expect(relation?.minimumMm).toBe(150);
    expect(relation?.recommendedMm).toBe(650);
    expect(relation?.availableMm).toBe(800);
    expect(evaluateFit(plan.checks).state).toBe('fits');
  });

  it('keeps the front overlap distinct from a user-selected extension', () => {
    const plan = buildRugFitPlan({
      ...sample,
      rugWidthMm: 2200,
      rugDepthMm: 500,
      furnitureDepthMm: 900,
      coverageMode: 'front-edge',
      frontOverlapMm: 150,
      frontExtensionMm: 500,
    });

    expect(evaluateFit(plan.checks).state).toBe('tight');
  });

  it('omits furniture relationship checks when the user selects room-only fit', () => {
    const plan = buildRugFitPlan({ ...sample, checkFurniture: false });
    expect(plan.checks.map((check) => check.dimension)).toEqual([
      'rug_room_width',
      'rug_room_depth',
    ]);
  });

  it('validates dimensions, margins, overlap and orientation', () => {
    expect(() => buildRugFitPlan({ ...sample, rugWidthMm: 0 })).toThrow(RangeError);
    expect(() => buildRugFitPlan({ ...sample, wallGapEachSideMm: -1 })).toThrow(RangeError);
    expect(() => buildRugFitPlan({ ...sample, furnitureMarginEachSideMm: -1 })).toThrow(RangeError);
    expect(() =>
      buildRugFitPlan({
        ...sample,
        coverageMode: 'front-edge',
        frontOverlapMm: 1000,
        furnitureDepthMm: 900,
      }),
    ).toThrow(RangeError);
    expect(() => buildRugFitPlan({ ...sample, orientation: 'diagonal' as never })).toThrow(
      RangeError,
    );
  });
});
