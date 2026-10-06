import type { Millimetres } from '../../types';
import type { DimensionCheck, FitResult } from './engine';

export interface DimensionDisplayRow {
  dimension: string;
  label: string;
  requiredMm: Millimetres;
  recommendedMm: Millimetres;
  availableMm: Millimetres;
  marginMm: Millimetres;
  hardFit: boolean;
  recommendedFit: boolean;
}

/**
 * Zips the DimensionChecks fed into evaluateFit() with its FitResult to
 * produce UI-ready rows (required/recommended/available/margin), so display
 * components never need to know anything about the fit engine itself.
 * `checks` and `result` must come from the same evaluateFit() call.
 */
export function toDimensionDisplayRows(
  checks: DimensionCheck[],
  result: FitResult,
): DimensionDisplayRow[] {
  return checks.map((check, index) => {
    const dimensionResult = result.dimensions[index];
    if (!dimensionResult || dimensionResult.dimension !== check.dimension) {
      throw new Error(
        `toDimensionDisplayRows: checks/result mismatch at index ${index}. Pass the same checks array used to call evaluateFit().`,
      );
    }
    return {
      dimension: check.dimension,
      label: check.label ?? check.dimension,
      requiredMm: check.minimumMm,
      recommendedMm: check.recommendedMm ?? check.minimumMm,
      availableMm: check.availableMm,
      marginMm: dimensionResult.marginMm,
      hardFit: dimensionResult.hardFit,
      recommendedFit: dimensionResult.recommendedFit,
    };
  });
}
