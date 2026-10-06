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
    minimumMm: {
      valueMm: 300,
      kind: 'typical',
      sourceId: 'src-fitwise-internal-convention',
      note: 'Typical monitor stand/arm footprint estimate.',
    },
    recommendedMm: {
      valueMm: 800,
      kind: 'recommended',
      sourceId: 'src-osha-monitor-viewing-distance',
      note: 'Stand footprint (300 mm) plus OSHA-cited minimum comfortable eye-to-screen viewing distance (500 mm).',
    },
    sourceIds: ['src-fitwise-internal-convention', 'src-osha-monitor-viewing-distance'],
    notes:
      'Minimum covers the stand footprint only. Recommended adds the OSHA-cited lower bound of comfortable viewing distance (20 in / ~500 mm); the OSHA range extends to 40 in / ~1000 mm for larger/preferred distances.',
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
