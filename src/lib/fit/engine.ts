import type { Millimetres } from '../../types';

export type FitState = 'fits' | 'tight' | 'does_not_fit';

/**
 * One clearance/footprint check along a single named dimension (e.g. the
 * desk's overall width, or the recommended left-side margin next to a
 * monitor). `minimumMm` is the hard physical requirement; `recommendedMm`
 * (if present) is the comfortable target and must be >= `minimumMm`.
 * Geometry modules (T008/T009) are responsible for computing these values;
 * this engine only compares them against `availableMm`.
 */
export interface DimensionCheck {
  dimension: string;
  /** Human-readable label for diagnostics, e.g. 'side_clearance'. Defaults to `dimension`. */
  label?: string;
  minimumMm: Millimetres;
  recommendedMm?: Millimetres;
  availableMm: Millimetres;
}

export interface DimensionResult {
  dimension: string;
  label: string;
  hardFit: boolean;
  recommendedFit: boolean;
  /** availableMm - minimumMm. Negative means the hard footprint does not fit. */
  marginMm: Millimetres;
  /** availableMm - recommendedMm (or marginMm if no recommendation was given). */
  recommendedMarginMm: Millimetres;
}

export interface FitResult {
  state: FitState;
  hardFit: boolean;
  recommendedFit: boolean;
  dimensions: DimensionResult[];
  /** dimension -> hard margin, matching specs/ARCHITECTURE.md §4's example shape. */
  marginsMm: Record<string, Millimetres>;
  failedHardConstraints: string[];
  failedRecommendations: string[];
  assumptions: string[];
}

function evaluateDimension(check: DimensionCheck): DimensionResult {
  const recommendedMm = check.recommendedMm ?? check.minimumMm;
  const marginMm = check.availableMm - check.minimumMm;
  const recommendedMarginMm = check.availableMm - recommendedMm;

  return {
    dimension: check.dimension,
    label: check.label ?? check.dimension,
    hardFit: marginMm >= 0,
    recommendedFit: recommendedMarginMm >= 0,
    marginMm,
    recommendedMarginMm,
  };
}

/**
 * Evaluates fit across one or more named dimensions and combines them into a
 * single fit state. The hard physical footprint and the recommended
 * comfortable clearance are tracked separately throughout
 * (specs/ARCHITECTURE.md §4, specs/SPEC.md §9):
 *
 * - `fits`: every dimension satisfies its recommended clearance.
 * - `tight`: every dimension satisfies its hard minimum, but at least one
 *   misses its recommended clearance.
 * - `does_not_fit`: at least one dimension fails its hard minimum.
 */
export function evaluateFit(checks: DimensionCheck[], assumptions: string[] = []): FitResult {
  if (checks.length === 0) throw new RangeError('At least one dimension check is required.');
  for (const check of checks) {
    const recommendedMm = check.recommendedMm ?? check.minimumMm;
    if (
      !check.dimension.trim() ||
      !Number.isFinite(check.minimumMm) ||
      !Number.isFinite(recommendedMm) ||
      !Number.isFinite(check.availableMm) ||
      check.minimumMm < 0 ||
      recommendedMm < check.minimumMm ||
      check.availableMm < 0
    ) {
      throw new RangeError(`Invalid dimensions or recommendation for '${check.dimension}'.`);
    }
  }

  const dimensions = checks.map(evaluateDimension);

  const hardFit = dimensions.every((d) => d.hardFit);
  const recommendedFit = dimensions.every((d) => d.recommendedFit);

  const state: FitState = !hardFit ? 'does_not_fit' : !recommendedFit ? 'tight' : 'fits';

  const marginsMm: Record<string, Millimetres> = {};
  for (const d of dimensions) {
    marginsMm[d.dimension] = d.marginMm;
  }

  return {
    state,
    hardFit,
    recommendedFit,
    dimensions,
    marginsMm,
    failedHardConstraints: dimensions.filter((d) => !d.hardFit).map((d) => d.label),
    failedRecommendations: dimensions.filter((d) => !d.recommendedFit).map((d) => d.label),
    assumptions,
  };
}
