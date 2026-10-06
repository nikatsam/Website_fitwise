import type { Millimetres } from './units';

/**
 * `exact`/`nominal`/`typical`/`recommended` require provenance (`sourceId`) unless
 * defined by a documented internal standard/rule. `derived` requires `derivationId`.
 * See specs/DATA_MODEL.md §2 and §9 for the build-time invariants that enforce this.
 */
export type MeasurementKind = 'exact' | 'nominal' | 'typical' | 'recommended' | 'derived';

export interface Measurement {
  valueMm: Millimetres;
  kind: MeasurementKind;
  sourceId?: string;
  derivationId?: string;
  note?: string;
}
