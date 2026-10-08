import type { Millimetres, Measurement, AspectRatio, DisplayEntity } from '../../types';
import type { DimensionCheck } from '../fit';
import { inchesToMm } from '../units';

/**
 * Angled/yawed monitor layouts (projected width when monitors are turned
 * toward the user) are explicitly DEFERRED, per tasks/T008 step 3 and
 * specs/ARCHITECTURE.md §4 ("yaw angle when supported"). This module only
 * computes flat, side-by-side configurations. Do not add an angle parameter
 * here without also adding the projected-width formula and its own tests.
 */

export const DERIVE_SCREEN_DIMS_FROM_DIAGONAL_ASPECT = 'derive-screen-dims-from-diagonal-aspect';

export const MONITOR_ASPECT_RATIOS = {
  '16:9': { width: 16, height: 9 },
  '21:9': { width: 21, height: 9 },
  '32:9': { width: 32, height: 9 },
} as const satisfies Record<string, AspectRatio>;

export type MonitorAspectRatioKey = keyof typeof MONITOR_ASPECT_RATIOS;
export const MAX_SIDE_BY_SIDE_MONITORS = 4;

export interface DerivedScreenDimensions {
  screenWidthMm: Measurement;
  screenHeightMm: Measurement;
}

/**
 * Derives SCREEN-only width/height from diagonal size + aspect ratio via the
 * Pythagorean relationship. This is never the overall device width — bezel
 * and stand/arm footprint are separate, sourced measurements
 * (specs/DATA_MODEL.md §5: "Never label this as overall device width.").
 */
export function deriveScreenDimensions(
  diagonalInches: number,
  aspectRatio: AspectRatio,
): DerivedScreenDimensions {
  if (!Number.isFinite(diagonalInches) || !(diagonalInches > 0)) {
    throw new RangeError(`diagonalInches must be > 0, got ${diagonalInches}.`);
  }
  if (
    !Number.isFinite(aspectRatio.width) ||
    !Number.isFinite(aspectRatio.height) ||
    !(aspectRatio.width > 0) ||
    !(aspectRatio.height > 0)
  ) {
    throw new RangeError('aspectRatio width and height must both be > 0.');
  }

  const diagonalMm = inchesToMm(diagonalInches);
  const scale = diagonalMm / Math.sqrt(aspectRatio.width ** 2 + aspectRatio.height ** 2);
  const screenWidthMm = scale * aspectRatio.width;
  const screenHeightMm = scale * aspectRatio.height;
  if (!Number.isFinite(screenWidthMm) || !Number.isFinite(screenHeightMm)) {
    throw new RangeError('Derived screen dimensions must be finite.');
  }

  return {
    screenWidthMm: {
      valueMm: screenWidthMm,
      kind: 'derived',
      derivationId: DERIVE_SCREEN_DIMS_FROM_DIAGONAL_ASPECT,
    },
    screenHeightMm: {
      valueMm: screenHeightMm,
      kind: 'derived',
      derivationId: DERIVE_SCREEN_DIMS_FROM_DIAGONAL_ASPECT,
    },
  };
}

export type MonitorWidthBasis = 'overall' | 'screen_only_approximation';

export interface ResolvedMonitorWidth {
  valueMm: Millimetres;
  basis: MonitorWidthBasis;
  note?: string;
}

/**
 * Resolves the width basis for a footprint calculation. Prefers sourced
 * `overallWidthMm` (includes bezel); otherwise falls back to derived
 * `screenWidthMm` and reports that approximation. `activeWidthMm` is never
 * used as the outer device width.
 */
export function resolveMonitorWidth(
  display: Pick<DisplayEntity, 'overallWidthMm' | 'screenWidthMm' | 'activeWidthMm'>,
): ResolvedMonitorWidth {
  if (display.overallWidthMm) {
    return { valueMm: display.overallWidthMm.valueMm, basis: 'overall' };
  }
  if (display.screenWidthMm) {
    return {
      valueMm: display.screenWidthMm.valueMm,
      basis: 'screen_only_approximation',
      ...(display.activeWidthMm?.note ? { note: display.activeWidthMm.note } : {}),
    };
  }
  throw new Error('Display entity has neither overallWidthMm nor screenWidthMm.');
}

export interface MonitorConfigurationInput {
  /** Resolved physical widths, one per monitor, left to right. */
  widthsMm: Millimetres[];
  /** Gap applied between each adjacent pair (n - 1 gaps for n monitors). */
  gapMm: Millimetres;
}

/** Hard physical footprint width of a row of monitors: sum of widths + gaps. */
export function computeConfigurationWidth(input: MonitorConfigurationInput): Millimetres {
  if (input.widthsMm.length === 0) {
    throw new RangeError('At least one monitor width is required.');
  }
  if (input.widthsMm.some((w) => !Number.isFinite(w) || !(w > 0))) {
    throw new RangeError('Every monitor width must be > 0.');
  }
  if (!Number.isFinite(input.gapMm) || !(input.gapMm >= 0)) {
    throw new RangeError(`gapMm must be >= 0, got ${input.gapMm}.`);
  }

  const totalWidth = input.widthsMm.reduce((sum, w) => sum + w, 0);
  const totalGap = input.gapMm * (input.widthsMm.length - 1);
  const result = totalWidth + totalGap;
  if (!Number.isFinite(result)) throw new RangeError('Configuration width must be finite.');
  return result;
}

export interface WorkspaceWidthCheckInput {
  /** Hard physical footprint from computeConfigurationWidth(). */
  configurationWidthMm: Millimetres;
  /** Recommended clearance desired on each side of the configuration, if any. */
  sideMarginRecommendedMm?: Millimetres;
  /** Desk's available width. */
  deskWidthMm: Millimetres;
}

export interface WorkspaceDepthCheckInput {
  /** Monitor base/stand footprint depth; use an exact model value when known. */
  monitorStandDepthMm: Millimetres;
  /** User-measured cable/plug/vent gap behind the base. */
  rearClearanceMm?: Millimetres;
  /** User-selected keyboard/mouse surface zone in front of the base. */
  keyboardZoneMm?: Millimetres;
  deskDepthMm: Millimetres;
}

/**
 * Builds a single 'width' DimensionCheck ready for src/lib/fit's
 * evaluateFit(): the hard minimum is the bare configuration footprint, the
 * recommendation adds the desired side margins on both sides.
 */
export function buildWorkspaceWidthCheck(input: WorkspaceWidthCheckInput): DimensionCheck {
  const sideMargin = input.sideMarginRecommendedMm ?? 0;
  if (
    !Number.isFinite(input.configurationWidthMm) ||
    !(input.configurationWidthMm > 0) ||
    !Number.isFinite(input.deskWidthMm) ||
    !(input.deskWidthMm > 0) ||
    !Number.isFinite(sideMargin) ||
    sideMargin < 0
  ) {
    throw new RangeError('Workspace width and side clearance must be finite and non-negative.');
  }
  const recommendedMm = input.configurationWidthMm + sideMargin * 2;
  if (!Number.isFinite(recommendedMm))
    throw new RangeError('Recommended desk width must be finite.');
  return {
    dimension: 'width',
    label: 'desk width',
    minimumMm: input.configurationWidthMm,
    recommendedMm,
    availableMm: input.deskWidthMm,
  };
}

/**
 * Builds a desk-depth check from a physical stand footprint and user-selected
 * rear/keyboard zones. Zero zones mean those areas are intentionally excluded;
 * this helper does not set ergonomic clearances or viewing distance.
 */
export function buildWorkspaceDepthCheck(input: WorkspaceDepthCheckInput): DimensionCheck {
  const rearClearanceMm = input.rearClearanceMm ?? 0;
  const keyboardZoneMm = input.keyboardZoneMm ?? 0;
  if (
    !Number.isFinite(input.monitorStandDepthMm) ||
    !(input.monitorStandDepthMm > 0) ||
    !Number.isFinite(input.deskDepthMm) ||
    !(input.deskDepthMm > 0) ||
    !Number.isFinite(rearClearanceMm) ||
    rearClearanceMm < 0 ||
    !Number.isFinite(keyboardZoneMm) ||
    keyboardZoneMm < 0
  ) {
    throw new RangeError(
      'Monitor stand, desk depth and selected depth zones must be finite and non-negative.',
    );
  }

  const minimumMm = input.monitorStandDepthMm + rearClearanceMm;
  const recommendedMm = minimumMm + keyboardZoneMm;
  if (!Number.isFinite(recommendedMm)) {
    throw new RangeError('Selected desk-depth envelope must be finite.');
  }

  return {
    dimension: 'desk_depth',
    label: 'desk depth envelope',
    minimumMm,
    recommendedMm,
    availableMm: input.deskDepthMm,
  };
}
