import type { Millimetres } from '../../types';
import type { DimensionCheck } from '../fit';

export type DiningOrientation = 'auto' | 'width-depth' | 'depth-width';
export type DiningPlacedOrientation = Exclude<DiningOrientation, 'auto'>;

export interface DiningFitInput {
  roomWidthMm: Millimetres;
  roomLengthMm: Millimetres;
  tableWidthMm: Millimetres;
  tableLengthMm: Millimetres;
  chairWidthMm: Millimetres;
  chairEnvelopeDepthMm: Millimetres;
  chairsPerLongSide: number;
  chairsPerEnd: number;
  walkingClearanceMm?: Millimetres;
  orientation?: DiningOrientation;
}

export interface DiningFitPlan {
  orientation: DiningPlacedOrientation;
  tableWidthOnRoomWidthMm: Millimetres;
  tableLengthOnRoomLengthMm: Millimetres;
  occupiedRoomWidthMm: Millimetres;
  occupiedRoomLengthMm: Millimetres;
  seats: number;
  checks: DimensionCheck[];
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive measurement.`);
  }
}

function assertCount(value: number, min: number, max: number, name: string): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be a whole number from ${min} to ${max}.`);
  }
}

function buildCandidate(input: DiningFitInput, orientation: DiningPlacedOrientation) {
  const rotated = orientation === 'depth-width';
  const tableWidth = rotated ? input.tableLengthMm : input.tableWidthMm;
  const tableLength = rotated ? input.tableWidthMm : input.tableLengthMm;
  const clearance = input.walkingClearanceMm ?? 0;
  const occupiedWidth =
    tableWidth + (input.chairsPerLongSide > 0 ? input.chairEnvelopeDepthMm * 2 : 0);
  const occupiedLength =
    tableLength + (input.chairsPerEnd > 0 ? input.chairEnvelopeDepthMm * 2 : 0);
  const checks: DimensionCheck[] = [
    {
      dimension: 'dining_room_width',
      label: 'room width for table and pulled-out chairs',
      minimumMm: occupiedWidth,
      recommendedMm: occupiedWidth + clearance * 2,
      availableMm: input.roomWidthMm,
    },
    {
      dimension: 'dining_room_length',
      label: 'room length for table and pulled-out chairs',
      minimumMm: occupiedLength,
      recommendedMm: occupiedLength + clearance * 2,
      availableMm: input.roomLengthMm,
    },
  ];

  if (input.chairsPerLongSide > 0) {
    checks.push({
      dimension: 'dining_long_side_seats',
      label: 'width available along each long table side',
      minimumMm: input.chairsPerLongSide * input.chairWidthMm,
      availableMm: tableLength,
    });
  }
  if (input.chairsPerEnd > 0) {
    checks.push({
      dimension: 'dining_end_seats',
      label: 'width available along each short table end',
      minimumMm: input.chairsPerEnd * input.chairWidthMm,
      availableMm: tableWidth,
    });
  }

  for (const check of checks) {
    if (
      !Number.isFinite(check.minimumMm) ||
      !Number.isFinite(check.recommendedMm ?? check.minimumMm)
    ) {
      throw new RangeError('Dining fit calculations must remain finite.');
    }
  }

  const hardFailures = checks.filter((check) => check.minimumMm > check.availableMm).length;
  const recommendedFailures = checks.filter(
    (check) => (check.recommendedMm ?? check.minimumMm) > check.availableMm,
  ).length;
  const totalMargin = checks.reduce((sum, check) => sum + check.availableMm - check.minimumMm, 0);
  if (!Number.isFinite(totalMargin)) {
    throw new RangeError('Dining fit margins must remain finite.');
  }

  return {
    orientation,
    tableWidthOnRoomWidthMm: tableWidth,
    tableLengthOnRoomLengthMm: tableLength,
    occupiedRoomWidthMm: occupiedWidth,
    occupiedRoomLengthMm: occupiedLength,
    seats: input.chairsPerLongSide * 2 + input.chairsPerEnd * 2,
    checks,
    hardFailures,
    recommendedFailures,
    totalMargin,
  };
}

/** Models a rectangular table, measured chair envelopes, and a user-selected walking target. */
export function buildDiningFitPlan(input: DiningFitInput): DiningFitPlan {
  for (const [name, value] of [
    ['roomWidthMm', input.roomWidthMm],
    ['roomLengthMm', input.roomLengthMm],
    ['tableWidthMm', input.tableWidthMm],
    ['tableLengthMm', input.tableLengthMm],
    ['chairWidthMm', input.chairWidthMm],
    ['chairEnvelopeDepthMm', input.chairEnvelopeDepthMm],
  ] as const) {
    assertPositive(value, name);
  }
  assertCount(input.chairsPerLongSide, 0, 6, 'chairsPerLongSide');
  assertCount(input.chairsPerEnd, 0, 2, 'chairsPerEnd');

  const clearance = input.walkingClearanceMm ?? 0;
  if (!Number.isFinite(clearance) || clearance < 0) {
    throw new RangeError('walkingClearanceMm must be finite and non-negative.');
  }
  if (
    input.orientation !== undefined &&
    !['auto', 'width-depth', 'depth-width'].includes(input.orientation)
  ) {
    throw new RangeError(`Unsupported dining table orientation '${input.orientation}'.`);
  }

  const orientations: DiningPlacedOrientation[] =
    input.orientation === 'width-depth'
      ? ['width-depth']
      : input.orientation === 'depth-width'
        ? ['depth-width']
        : ['width-depth', 'depth-width'];
  const candidates = orientations.map((orientation) => buildCandidate(input, orientation));
  candidates.sort(
    (a, b) =>
      a.hardFailures - b.hardFailures ||
      a.recommendedFailures - b.recommendedFailures ||
      b.totalMargin - a.totalMargin,
  );
  const best = candidates[0]!;
  return {
    orientation: best.orientation,
    tableWidthOnRoomWidthMm: best.tableWidthOnRoomWidthMm,
    tableLengthOnRoomLengthMm: best.tableLengthOnRoomLengthMm,
    occupiedRoomWidthMm: best.occupiedRoomWidthMm,
    occupiedRoomLengthMm: best.occupiedRoomLengthMm,
    seats: best.seats,
    checks: best.checks,
  };
}
