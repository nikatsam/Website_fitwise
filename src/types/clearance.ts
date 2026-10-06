import type { Measurement } from './measurement';

export type ClearanceDimension = 'left' | 'right' | 'front' | 'back' | 'top' | 'between';

/**
 * The minimum/recommended split powers the `fits` vs `tight` fit-state distinction
 * (hard footprint fits, but recommended comfortable clearance is not met).
 */
export interface ClearanceRule {
  id: string;
  context: string;
  targetCategory: string;
  dimension: ClearanceDimension;
  minimumMm?: Measurement;
  recommendedMm?: Measurement;
  sourceIds: string[];
  notes?: string;
}
