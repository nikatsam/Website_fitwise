import type { ClearanceRule } from '../../types';

export const clearanceRules: ClearanceRule[] = [
  {
    id: 'clr-desk-side-margin',
    context: 'workspace',
    targetCategory: 'desk',
    dimension: 'left',
    minimumMm: { valueMm: 0, kind: 'recommended', sourceId: 'src-fitwise-internal-convention' },
    recommendedMm: {
      valueMm: 38,
      kind: 'recommended',
      sourceId: 'src-fitwise-internal-convention',
    },
    sourceIds: ['src-fitwise-internal-convention'],
    notes:
      'Comfortable side margin beyond a monitor configuration; a convention, not a regulation.',
  },
  {
    id: 'clr-desk-depth-for-monitor',
    context: 'workspace',
    targetCategory: 'desk',
    dimension: 'front',
    sourceIds: ['src-fitwise-internal-convention', 'src-ccohs-monitor-positioning'],
    notes:
      'No universal total desk-depth minimum is asserted. Show model-specific stand footprint separately from viewing distance, cable/plug space and the user-selected keyboard/mouse zone. CCOHS states that viewing-distance guidance varies and should be adjusted to the person/task.',
  },
  {
    id: 'clr-monitor-gap',
    context: 'workspace',
    targetCategory: 'display',
    dimension: 'between',
    minimumMm: { valueMm: 0, kind: 'typical', sourceId: 'src-fitwise-internal-convention' },
    recommendedMm: {
      valueMm: 20,
      kind: 'recommended',
      sourceId: 'src-fitwise-internal-convention',
    },
    sourceIds: ['src-fitwise-internal-convention'],
    notes: 'Typical gap left between adjacent monitors in a multi-monitor configuration.',
  },
];
