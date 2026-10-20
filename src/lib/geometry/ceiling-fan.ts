import type { DimensionCheck } from '../fit';
import { MM_PER_FOOT, MM_PER_INCH } from '../units';

/**
 * Ceiling-fan sizing and clearance model.
 *
 * The room-area → blade-span chart and the 7 ft floor / 18 in wall minimums
 * are the ENERGY STAR "Ceiling Fan Basics" guidance (chart credited there to
 * the American Lighting Association). Every clearance target remains a
 * user-editable input; the defaults are those published values, not code
 * requirements.
 */

const SQ_MM_PER_SQ_FT = MM_PER_FOOT * MM_PER_FOOT;

export interface FanSpanBand {
  maxAreaSqFt: number;
  minSpanIn: number;
  maxSpanIn: number;
}

/** ENERGY STAR / ALA chart. Rooms above the last band are outside the chart. */
export const FAN_SPAN_BANDS: readonly FanSpanBand[] = [
  { maxAreaSqFt: 75, minSpanIn: 29, maxSpanIn: 36 },
  { maxAreaSqFt: 144, minSpanIn: 36, maxSpanIn: 42 },
  { maxAreaSqFt: 225, minSpanIn: 44, maxSpanIn: 44 },
  { maxAreaSqFt: 400, minSpanIn: 50, maxSpanIn: 54 },
];

/** Common retail downrod lengths in inches. */
export const STANDARD_DOWNROD_LENGTHS_IN = [3, 6, 12, 18, 24, 36, 48, 60, 72] as const;

export const CEILING_FAN_DEFAULTS = {
  minBladeHeightMm: Math.round(7 * MM_PER_FOOT),
  preferredBladeHeightMm: Math.round(8 * MM_PER_FOOT),
  wallClearanceMm: Math.round(18 * MM_PER_INCH),
  fanDropMm: Math.round(10 * MM_PER_INCH),
} as const;

export interface CeilingFanInput {
  roomWidthMm: number;
  roomLengthMm: number;
  ceilingHeightMm: number;
  bladeSpanMm: number;
  /** Ceiling-to-blade drop of the fan body/canopy with no extra downrod. */
  fanDropMm: number;
  /** Extra downrod length; zero for flush/standard mount. */
  downrodMm: number;
  minBladeHeightMm?: number;
  preferredBladeHeightMm?: number;
  wallClearanceMm?: number;
}

export interface CeilingFanPlan {
  roomAreaSqFt: number;
  /** Chart band for the room, or null when the room is larger than the chart. */
  spanBand: { minSpanMm: number; maxSpanMm: number; minSpanIn: number; maxSpanIn: number } | null;
  bladeHeightMm: number;
  /** Downrod that puts the blades at the preferred height (0 when flush is already at/below it). */
  idealDownrodMm: number;
  /** Longest downrod that still keeps the minimum blade height; negative = even flush is too low. */
  maxDownrodMm: number;
  /** Longest standard downrod length (in) that does not exceed the ideal; null when none fits. */
  suggestedStandardDownrodIn: number | null;
  /** True when a flush/hugger mount is needed to reach the minimum blade height. */
  needsLowProfile: boolean;
  checks: DimensionCheck[];
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive measurement.`);
  }
}

function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be finite and non-negative.`);
  }
}

export function roomAreaSqFt(widthMm: number, lengthMm: number): number {
  return (widthMm * lengthMm) / SQ_MM_PER_SQ_FT;
}

export function fanSpanBandForArea(areaSqFt: number): FanSpanBand | null {
  // Round to 0.1 sq ft so a nominal 12×12 ft room converted through mm stays in its band.
  const area = Math.round(areaSqFt * 10) / 10;
  return FAN_SPAN_BANDS.find((band) => area <= band.maxAreaSqFt) ?? null;
}

export function buildCeilingFanPlan(input: CeilingFanInput): CeilingFanPlan {
  assertPositive(input.roomWidthMm, 'Room width');
  assertPositive(input.roomLengthMm, 'Room length');
  assertPositive(input.ceilingHeightMm, 'Ceiling height');
  assertPositive(input.bladeSpanMm, 'Blade span');
  assertNonNegative(input.fanDropMm, 'Fan drop');
  assertNonNegative(input.downrodMm, 'Downrod length');
  const minBlade = input.minBladeHeightMm ?? CEILING_FAN_DEFAULTS.minBladeHeightMm;
  const preferredBlade = Math.max(
    minBlade,
    input.preferredBladeHeightMm ?? CEILING_FAN_DEFAULTS.preferredBladeHeightMm,
  );
  const wallClearance = input.wallClearanceMm ?? CEILING_FAN_DEFAULTS.wallClearanceMm;
  assertPositive(minBlade, 'Minimum blade height');
  assertNonNegative(wallClearance, 'Wall clearance');

  const area = roomAreaSqFt(input.roomWidthMm, input.roomLengthMm);
  const band = fanSpanBandForArea(area);
  const bladeHeightMm = input.ceilingHeightMm - input.fanDropMm - input.downrodMm;
  const idealDownrodMm = Math.max(0, input.ceilingHeightMm - preferredBlade - input.fanDropMm);
  const maxDownrodMm = input.ceilingHeightMm - minBlade - input.fanDropMm;
  const idealIn = idealDownrodMm / MM_PER_INCH;
  const maxIn = maxDownrodMm / MM_PER_INCH;
  const standard = [...STANDARD_DOWNROD_LENGTHS_IN]
    .reverse()
    .find((length) => length <= idealIn + 0.01 && length <= maxIn + 0.01);
  const shorterSideMm = Math.min(input.roomWidthMm, input.roomLengthMm);

  const checks: DimensionCheck[] = [
    {
      dimension: 'fan_blade_floor_height',
      label: 'blade height above the floor',
      minimumMm: minBlade,
      recommendedMm: preferredBlade,
      availableMm: Math.max(0, bladeHeightMm),
    },
    {
      dimension: 'fan_blade_wall_clearance',
      label: 'blade span plus wall clearance across the shorter room side',
      minimumMm: input.bladeSpanMm,
      recommendedMm: input.bladeSpanMm + wallClearance * 2,
      availableMm: shorterSideMm,
    },
  ];

  return {
    roomAreaSqFt: Math.round(area * 10) / 10,
    spanBand: band
      ? {
          minSpanIn: band.minSpanIn,
          maxSpanIn: band.maxSpanIn,
          minSpanMm: Math.round(band.minSpanIn * MM_PER_INCH),
          maxSpanMm: Math.round(band.maxSpanIn * MM_PER_INCH),
        }
      : null,
    bladeHeightMm,
    idealDownrodMm: Math.round(idealDownrodMm),
    maxDownrodMm: Math.round(maxDownrodMm),
    suggestedStandardDownrodIn: maxDownrodMm >= 0 ? (standard ?? null) : null,
    needsLowProfile: maxDownrodMm < 0,
    checks,
  };
}
