import type { Millimetres } from '../../types';
import type { DimensionCheck } from '../fit';

export interface FrameAllowanceMm {
  left: Millimetres;
  right: Millimetres;
  head: Millimetres;
  foot: Millimetres;
}

export interface BedFootprint {
  widthMm: Millimetres;
  lengthMm: Millimetres;
}

/** Hard physical footprint of mattress + frame allowance on every side. */
export function computeBedFootprint(
  mattressWidthMm: Millimetres,
  mattressLengthMm: Millimetres,
  frameAllowanceMm: FrameAllowanceMm,
): BedFootprint {
  if (!(mattressWidthMm > 0) || !(mattressLengthMm > 0)) {
    throw new RangeError('mattressWidthMm and mattressLengthMm must both be > 0.');
  }
  if (
    !Number.isFinite(mattressWidthMm) ||
    !Number.isFinite(mattressLengthMm) ||
    !Number.isFinite(frameAllowanceMm.left) ||
    !Number.isFinite(frameAllowanceMm.right) ||
    !Number.isFinite(frameAllowanceMm.head) ||
    !Number.isFinite(frameAllowanceMm.foot) ||
    Object.values(frameAllowanceMm).some((value) => !Number.isFinite(value) || value < 0)
  ) {
    throw new RangeError(
      'Mattress dimensions and frame allowances must be finite and non-negative.',
    );
  }
  const footprint = {
    widthMm: mattressWidthMm + frameAllowanceMm.left + frameAllowanceMm.right,
    lengthMm: mattressLengthMm + frameAllowanceMm.head + frameAllowanceMm.foot,
  };
  if (!Number.isFinite(footprint.widthMm) || !Number.isFinite(footprint.lengthMm)) {
    throw new RangeError('Bed footprint dimensions must be finite.');
  }
  return footprint;
}

/**
 * `portrait`: the bed's own width runs along the room's width wall (the
 * usual headboard-against-a-short-wall layout). `landscape`: the bed is
 * rotated 90°, so its width runs along the room's length instead.
 */
export type BedOrientation = 'portrait' | 'landscape';

export interface OrientedFootprint {
  roomWidthRequiredMm: Millimetres;
  roomLengthRequiredMm: Millimetres;
}

/** Maps a bed footprint onto room width/length axes according to orientation. */
export function applyOrientation(
  footprint: BedFootprint,
  orientation: BedOrientation,
): OrientedFootprint {
  if (orientation !== 'portrait' && orientation !== 'landscape') {
    throw new RangeError(`Unsupported bed orientation '${orientation}'.`);
  }
  return orientation === 'portrait'
    ? { roomWidthRequiredMm: footprint.widthMm, roomLengthRequiredMm: footprint.lengthMm }
    : { roomWidthRequiredMm: footprint.lengthMm, roomLengthRequiredMm: footprint.widthMm };
}

export interface BedRoomChecksInput {
  mattressWidthMm: Millimetres;
  mattressLengthMm: Millimetres;
  frameAllowanceMm: FrameAllowanceMm;
  orientation: BedOrientation;
  roomWidthMm: Millimetres;
  roomLengthMm: Millimetres;
  /** Recommended clearance applied on BOTH sides along the bed's width axis. */
  sideClearanceRecommendedMm?: Millimetres;
  /** Recommended clearance applied ONCE at the foot end (head end assumed against a wall). */
  footClearanceRecommendedMm?: Millimetres;
  /** Width of each nightstand placed beside the bed (0–2 entries); added to the hard width footprint. */
  nightstandWidthsMm?: Millimetres[];
  /** Depth of each nightstand at the headboard; included in the physical length envelope. */
  nightstandDepthMm?: Millimetres;
}

/**
 * Builds 'room_width'/'room_length' DimensionChecks ready for
 * src/lib/fit's evaluateFit(). Mirrors the pattern in
 * src/lib/geometry/workspace.ts: this module computes footprint + clearance
 * envelope; evaluateFit decides fits/tight/does_not_fit.
 */
export function buildBedRoomChecks(input: BedRoomChecksInput): DimensionCheck[] {
  if (
    !Number.isFinite(input.roomWidthMm) ||
    !Number.isFinite(input.roomLengthMm) ||
    !(input.roomWidthMm > 0) ||
    !(input.roomLengthMm > 0)
  ) {
    throw new RangeError('roomWidthMm and roomLengthMm must both be > 0.');
  }

  const baseFootprint = computeBedFootprint(
    input.mattressWidthMm,
    input.mattressLengthMm,
    input.frameAllowanceMm,
  );

  const nightstandExtraMm = (input.nightstandWidthsMm ?? []).reduce((sum, w) => sum + w, 0);
  const nightstandDepthMm = input.nightstandDepthMm ?? 0;
  if (
    (input.nightstandWidthsMm ?? []).length > 2 ||
    (input.nightstandWidthsMm ?? []).some((width) => !Number.isFinite(width) || !(width > 0)) ||
    !Number.isFinite(nightstandExtraMm) ||
    !Number.isFinite(nightstandDepthMm) ||
    nightstandDepthMm < 0
  ) {
    throw new RangeError(
      'Use zero to two finite, positive nightstand widths and a finite non-negative depth.',
    );
  }
  const footprintWithNightstands: BedFootprint = {
    widthMm: baseFootprint.widthMm + nightstandExtraMm,
    lengthMm: Math.max(baseFootprint.lengthMm, nightstandDepthMm),
  };

  const oriented = applyOrientation(footprintWithNightstands, input.orientation);
  const sideClearance = input.sideClearanceRecommendedMm ?? 0;
  const footClearance = input.footClearanceRecommendedMm ?? 0;
  if (
    !Number.isFinite(sideClearance) ||
    sideClearance < 0 ||
    !Number.isFinite(footClearance) ||
    footClearance < 0
  ) {
    throw new RangeError('Recommended clearances must be finite and non-negative.');
  }
  const sideAxisIsRoomWidth = input.orientation === 'portrait';
  const recommendedRoomWidthMm =
    oriented.roomWidthRequiredMm + (sideAxisIsRoomWidth ? sideClearance * 2 : footClearance);
  const recommendedRoomLengthMm =
    oriented.roomLengthRequiredMm + (sideAxisIsRoomWidth ? footClearance : sideClearance * 2);
  if (!Number.isFinite(recommendedRoomWidthMm) || !Number.isFinite(recommendedRoomLengthMm)) {
    throw new RangeError('Recommended bedroom dimensions must be finite.');
  }

  return [
    {
      dimension: 'room_width',
      label: 'room width',
      minimumMm: oriented.roomWidthRequiredMm,
      recommendedMm: recommendedRoomWidthMm,
      availableMm: input.roomWidthMm,
    },
    {
      dimension: 'room_length',
      label: 'room length',
      minimumMm: oriented.roomLengthRequiredMm,
      recommendedMm: recommendedRoomLengthMm,
      availableMm: input.roomLengthMm,
    },
  ];
}
