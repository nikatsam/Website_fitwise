import { describe, expect, it } from 'vitest';
import {
  buildDoorSwingCheck,
  buildDrawerPullOutCheck,
  calculateDoorSwingProjection,
} from '../../src/lib/geometry';
import { evaluateFit } from '../../src/lib/fit';

describe('measured furniture collision checks', () => {
  it('projects a hinged door leaf by its width at 90 degrees', () => {
    expect(calculateDoorSwingProjection(495, 90)).toBeCloseTo(495, 6);
    expect(calculateDoorSwingProjection(495, 0)).toBe(0);
    expect(calculateDoorSwingProjection(495, 30)).toBeCloseTo(247.5, 1);
    expect(() => calculateDoorSwingProjection(495, 91)).toThrow(RangeError);
  });

  it('checks the door swing against a user-measured obstacle gap', () => {
    const check = buildDoorSwingCheck({
      doorLeafWidthMm: 495,
      openingAngleDegrees: 90,
      obstacleGapMm: 450,
    });
    const result = evaluateFit([check]);
    expect(result.state).toBe('does_not_fit');
    expect(result.failedHardConstraints).toContain('wardrobe door sweep');
    expect(() =>
      buildDoorSwingCheck({ doorLeafWidthMm: 495, openingAngleDegrees: 90, obstacleGapMm: -1 }),
    ).toThrow(RangeError);
  });

  it('uses the sourced drawer pull-out as a collision envelope, not a walkway allowance', () => {
    const check = buildDrawerPullOutCheck({ drawerPullOutMm: 294, obstacleGapMm: 300 });
    expect(evaluateFit([check]).state).toBe('fits');
    expect(check.recommendedMm).toBe(294);
    expect(() => buildDrawerPullOutCheck({ drawerPullOutMm: 0, obstacleGapMm: 300 })).toThrow(
      RangeError,
    );
  });
});
