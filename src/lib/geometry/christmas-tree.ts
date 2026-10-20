import type { DimensionCheck } from '../fit';
import { MM_PER_FOOT, MM_PER_INCH } from '../units';

/**
 * Christmas-tree height and floor-space model.
 *
 * Vertical stack: extra stand lift + listed tree height + topper height must
 * fit under the ceiling; the user-selected gap is the target margin. Balsam
 * Hill's published guidance (at least 6 in between ceiling and topper; tree
 * height measured from the bottom of the stand) supplies the defaults.
 */

/** Common retail tree heights in feet. */
export const STANDARD_TREE_HEIGHTS_FT = [
  4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9, 10, 12, 14, 15,
] as const;

export const CHRISTMAS_TREE_DEFAULTS = {
  topperHeightMm: Math.round(12 * MM_PER_INCH),
  ceilingGapMm: Math.round(6 * MM_PER_INCH),
  standLiftMm: 0,
  floorClearanceMm: Math.round(6 * MM_PER_INCH),
} as const;

export interface ChristmasTreeInput {
  ceilingHeightMm: number;
  treeHeightMm: number;
  /** Extra height the stand adds when the listed tree height excludes it. */
  standLiftMm: number;
  topperHeightMm: number;
  ceilingGapMm: number;
  checkFloor: boolean;
  treeDiameterMm?: number;
  spaceWidthMm?: number;
  spaceDepthMm?: number;
  floorClearanceMm?: number;
}

export interface ChristmasTreePlan {
  /** Tallest listed tree height that keeps the selected ceiling gap. */
  maxTreeHeightMm: number;
  /** Largest common retail height (ft) not above maxTreeHeightMm, or null. */
  suggestedStandardHeightFt: number | null;
  stackHeightMm: number;
  checks: DimensionCheck[];
}

function assertPositive(value: number | undefined, name: string): asserts value is number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive measurement.`);
  }
}

function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be finite and non-negative.`);
  }
}

export function maxTreeHeightForCeiling(
  ceilingHeightMm: number,
  standLiftMm: number = CHRISTMAS_TREE_DEFAULTS.standLiftMm,
  topperHeightMm: number = CHRISTMAS_TREE_DEFAULTS.topperHeightMm,
  ceilingGapMm: number = CHRISTMAS_TREE_DEFAULTS.ceilingGapMm,
): number {
  return Math.round(ceilingHeightMm - standLiftMm - topperHeightMm - ceilingGapMm);
}

export function suggestedStandardTreeHeightFt(maxTreeHeightMm: number): number | null {
  const maxFt = maxTreeHeightMm / MM_PER_FOOT;
  return [...STANDARD_TREE_HEIGHTS_FT].reverse().find((height) => height <= maxFt + 0.001) ?? null;
}

export function buildChristmasTreePlan(input: ChristmasTreeInput): ChristmasTreePlan {
  assertPositive(input.ceilingHeightMm, 'Ceiling height');
  assertPositive(input.treeHeightMm, 'Tree height');
  assertNonNegative(input.standLiftMm, 'Stand lift');
  assertNonNegative(input.topperHeightMm, 'Topper height');
  assertNonNegative(input.ceilingGapMm, 'Ceiling gap');

  const stackHeightMm = input.standLiftMm + input.treeHeightMm + input.topperHeightMm;
  const checks: DimensionCheck[] = [
    {
      dimension: 'tree_ceiling_height',
      label: 'tree, stand and topper height against the ceiling',
      minimumMm: stackHeightMm,
      recommendedMm: stackHeightMm + input.ceilingGapMm,
      availableMm: input.ceilingHeightMm,
    },
  ];

  if (input.checkFloor) {
    assertPositive(input.treeDiameterMm, 'Tree diameter');
    assertPositive(input.spaceWidthMm, 'Floor space width');
    assertPositive(input.spaceDepthMm, 'Floor space depth');
    const clearance = input.floorClearanceMm ?? CHRISTMAS_TREE_DEFAULTS.floorClearanceMm;
    assertNonNegative(clearance, 'Floor clearance');
    checks.push(
      {
        dimension: 'tree_floor_width',
        label: 'tree diameter against floor space width',
        minimumMm: input.treeDiameterMm,
        recommendedMm: input.treeDiameterMm + clearance * 2,
        availableMm: input.spaceWidthMm,
      },
      {
        dimension: 'tree_floor_depth',
        label: 'tree diameter against floor space depth',
        minimumMm: input.treeDiameterMm,
        recommendedMm: input.treeDiameterMm + clearance * 2,
        availableMm: input.spaceDepthMm,
      },
    );
  }

  const maxTreeHeightMm = maxTreeHeightForCeiling(
    input.ceilingHeightMm,
    input.standLiftMm,
    input.topperHeightMm,
    input.ceilingGapMm,
  );
  return {
    maxTreeHeightMm,
    suggestedStandardHeightFt: suggestedStandardTreeHeightFt(maxTreeHeightMm),
    stackHeightMm,
    checks,
  };
}
