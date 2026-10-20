import { describe, expect, it } from 'vitest';
import {
  buildCeilingFanPlan,
  buildChristmasTreePlan,
  fanSpanBandForArea,
  maxTreeHeightForCeiling,
  suggestedStandardTreeHeightFt,
} from '../../src/lib/geometry';
import { evaluateFit } from '../../src/lib/fit';
import { feetToMm, inchesToMm } from '../../src/lib/units';

const ft = (value: number) => Math.round(feetToMm(value));
const inch = (value: number) => Math.round(inchesToMm(value));

describe('ceiling fan model', () => {
  it('maps room areas to the ENERGY STAR / ALA blade-span chart', () => {
    expect(fanSpanBandForArea(70)).toMatchObject({ minSpanIn: 29, maxSpanIn: 36 });
    expect(fanSpanBandForArea(144)).toMatchObject({ minSpanIn: 36, maxSpanIn: 42 });
    expect(fanSpanBandForArea(145)).toMatchObject({ minSpanIn: 44, maxSpanIn: 44 });
    expect(fanSpanBandForArea(225)).toMatchObject({ minSpanIn: 44, maxSpanIn: 44 });
    expect(fanSpanBandForArea(300)).toMatchObject({ minSpanIn: 50, maxSpanIn: 54 });
    expect(fanSpanBandForArea(401)).toBeNull();
  });

  it('keeps a nominal 12×12 ft room in the 36–42 in band after mm conversion', () => {
    const plan = buildCeilingFanPlan({
      roomWidthMm: ft(12),
      roomLengthMm: ft(12),
      ceilingHeightMm: ft(8),
      bladeSpanMm: inch(42),
      fanDropMm: inch(12),
      downrodMm: 0,
    });
    expect(plan.roomAreaSqFt).toBe(144);
    expect(plan.spanBand).toMatchObject({ minSpanIn: 36, maxSpanIn: 42 });
  });

  it('computes blade height, ideal downrod and a standard downrod length', () => {
    const plan = buildCeilingFanPlan({
      roomWidthMm: ft(12),
      roomLengthMm: ft(14),
      ceilingHeightMm: ft(10),
      bladeSpanMm: inch(52),
      fanDropMm: inch(12),
      downrodMm: 0,
    });
    expect(plan.bladeHeightMm).toBe(ft(10) - inch(12));
    // 120 in ceiling − 96 in preferred blade height − 12 in fan drop = 12 in.
    expect(plan.idealDownrodMm).toBe(Math.round(ft(10) - ft(8) - inch(12)));
    expect(plan.suggestedStandardDownrodIn).toBe(12);
    expect(plan.needsLowProfile).toBe(false);
  });

  it('flags a low ceiling where even a flush fan breaks the 7 ft minimum', () => {
    const plan = buildCeilingFanPlan({
      roomWidthMm: ft(10),
      roomLengthMm: ft(10),
      ceilingHeightMm: ft(7.5),
      bladeSpanMm: inch(36),
      fanDropMm: inch(12),
      downrodMm: 0,
    });
    expect(plan.needsLowProfile).toBe(true);
    expect(plan.suggestedStandardDownrodIn).toBeNull();
    expect(evaluateFit(plan.checks).state).toBe('does_not_fit');
  });

  it('reports tight when the blades clear 7 ft but not the 8 ft target', () => {
    const plan = buildCeilingFanPlan({
      roomWidthMm: ft(12),
      roomLengthMm: ft(12),
      ceilingHeightMm: ft(8),
      bladeSpanMm: inch(42),
      fanDropMm: inch(10),
      downrodMm: 0,
    });
    expect(plan.bladeHeightMm).toBe(ft(8) - inch(10));
    expect(evaluateFit(plan.checks).state).toBe('tight');
  });

  it('checks blade tips against the 18 in wall clearance on the shorter side', () => {
    const plan = buildCeilingFanPlan({
      roomWidthMm: ft(6),
      roomLengthMm: ft(12),
      ceilingHeightMm: ft(9),
      bladeSpanMm: inch(52),
      fanDropMm: inch(12),
      downrodMm: 0,
    });
    const wall = plan.checks.find((check) => check.dimension === 'fan_blade_wall_clearance');
    expect(wall?.availableMm).toBe(ft(6));
    expect(wall?.recommendedMm).toBe(inch(52) + inch(18) * 2);
  });

  it('rejects invalid measurements', () => {
    expect(() =>
      buildCeilingFanPlan({
        roomWidthMm: 0,
        roomLengthMm: ft(12),
        ceilingHeightMm: ft(8),
        bladeSpanMm: inch(42),
        fanDropMm: 0,
        downrodMm: 0,
      }),
    ).toThrow(RangeError);
  });
});

describe('christmas tree model', () => {
  it('matches the Balsam Hill example: 9 ft ceiling + 12 in topper → 7.5 ft tree', () => {
    const max = maxTreeHeightForCeiling(ft(9));
    expect(max).toBe(ft(9) - inch(12) - inch(6));
    expect(suggestedStandardTreeHeightFt(max)).toBe(7.5);
  });

  it.each([
    [8, 6.5],
    [9, 7.5],
    [10, 8],
    [12, 10],
  ])('suggests a standard tree height for a %s ft ceiling', (ceiling, expected) => {
    expect(suggestedStandardTreeHeightFt(maxTreeHeightForCeiling(ft(ceiling)))).toBe(expected);
  });

  it('counts stand lift and topper in the vertical stack', () => {
    const plan = buildChristmasTreePlan({
      ceilingHeightMm: ft(8),
      treeHeightMm: ft(7),
      standLiftMm: inch(4),
      topperHeightMm: inch(10),
      ceilingGapMm: inch(6),
      checkFloor: false,
    });
    expect(plan.stackHeightMm).toBe(ft(7) + inch(4) + inch(10));
    expect(evaluateFit(plan.checks).state).toBe('does_not_fit');
  });

  it('returns tight when the tree fits but eats the ceiling gap', () => {
    const plan = buildChristmasTreePlan({
      ceilingHeightMm: ft(9),
      treeHeightMm: ft(8),
      standLiftMm: 0,
      topperHeightMm: inch(10),
      ceilingGapMm: inch(6),
      checkFloor: false,
    });
    expect(evaluateFit(plan.checks).state).toBe('tight');
  });

  it('adds floor-space checks only when enabled', () => {
    const base = {
      ceilingHeightMm: ft(9),
      treeHeightMm: ft(7.5),
      standLiftMm: 0,
      topperHeightMm: inch(12),
      ceilingGapMm: inch(6),
    };
    expect(buildChristmasTreePlan({ ...base, checkFloor: false }).checks).toHaveLength(1);
    const withFloor = buildChristmasTreePlan({
      ...base,
      checkFloor: true,
      treeDiameterMm: inch(52),
      spaceWidthMm: inch(66),
      spaceDepthMm: inch(66),
      floorClearanceMm: inch(6),
    });
    expect(withFloor.checks).toHaveLength(3);
    expect(evaluateFit(withFloor.checks).state).toBe('fits');
  });

  it('returns null when no standard height fits', () => {
    expect(suggestedStandardTreeHeightFt(ft(3))).toBeNull();
  });
});
