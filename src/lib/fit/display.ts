import type { Millimetres } from '../../types';
import type { DimensionCheck, FitResult } from './engine';

export interface DimensionDisplayRow {
  dimension: string;
  label: string;
  requiredMm: Millimetres;
  recommendedMm: Millimetres;
  availableMm: Millimetres;
  physicalMarginMm: Millimetres;
  targetMarginMm: Millimetres;
  hardFit: boolean;
  recommendedFit: boolean;
}

/** Selects a representative failing row so summaries do not blame a fitting dimension. */
export function selectSummaryDimension(
  rows: DimensionDisplayRow[],
): DimensionDisplayRow | undefined {
  const hardFailures = rows.filter((row) => !row.hardFit);
  if (hardFailures.length > 0) {
    return hardFailures.reduce((tightest, row) =>
      row.physicalMarginMm < tightest.physicalMarginMm ? row : tightest,
    );
  }
  const targetFailures = rows.filter((row) => !row.recommendedFit);
  if (targetFailures.length > 0) {
    return targetFailures.reduce((tightest, row) =>
      row.targetMarginMm < tightest.targetMarginMm ? row : tightest,
    );
  }
  return rows.reduce((tightest, row) =>
    row.targetMarginMm < tightest.targetMarginMm ? row : tightest,
  );
}

export function getFailedDimensionRows(rows: DimensionDisplayRow[]) {
  return {
    hardFailures: rows.filter((row) => !row.hardFit),
    recommendationFailures: rows.filter((row) => !row.recommendedFit),
  };
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
      physicalMarginMm: dimensionResult.marginMm,
      targetMarginMm: dimensionResult.recommendedMarginMm,
      hardFit: dimensionResult.hardFit,
      recommendedFit: dimensionResult.recommendedFit,
    };
  });
}
