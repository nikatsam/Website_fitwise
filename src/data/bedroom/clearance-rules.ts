import type { ClearanceRule } from '../../types';

const sleepFoundationClearance = 'src-sleep-foundation-bedroom-clearance';
const internalConvention = 'src-fitwise-internal-convention';

export const bedroomClearanceRules: ClearanceRule[] = [
  {
    id: 'clr-bed-side-access',
    context: 'bedroom',
    targetCategory: 'bed',
    dimension: 'left',
    minimumMm: {
      valueMm: 0,
      kind: 'recommended',
      sourceId: internalConvention,
      note: 'No universal code minimum is asserted; zero represents a hard mattress-only footprint check.',
    },
    recommendedMm: {
      valueMm: 24 * 25.4,
      kind: 'recommended',
      sourceId: sleepFoundationClearance,
      note: 'Editorial comfort guidance, not a regulation.',
    },
    sourceIds: [sleepFoundationClearance, internalConvention],
    notes: 'Apply the recommendation to each accessible side; actual access needs vary.',
  },
  {
    id: 'clr-bed-foot-access',
    context: 'bedroom',
    targetCategory: 'bed',
    dimension: 'front',
    minimumMm: {
      valueMm: 0,
      kind: 'recommended',
      sourceId: internalConvention,
      note: 'No universal code minimum is asserted; zero represents a hard mattress-only footprint check.',
    },
    recommendedMm: {
      valueMm: 24 * 25.4,
      kind: 'recommended',
      sourceId: internalConvention,
      note: 'FitWise planning assumption of 24 inches at the foot; not a foot-specific source recommendation.',
    },
    sourceIds: [internalConvention],
    notes:
      'FitWise modeling assumption: 24 inches at the foot. Sleep Foundation discusses space around each side; applying that figure at the foot is an extrapolation, not direct source guidance or a code minimum. The geometry engine treats the headboard as against a wall.',
  },
  {
    id: 'clr-bed-furniture-access',
    context: 'bedroom',
    targetCategory: 'bed',
    dimension: 'between',
    minimumMm: {
      valueMm: 0,
      kind: 'recommended',
      sourceId: internalConvention,
      note: 'No universal code minimum is asserted.',
    },
    recommendedMm: {
      valueMm: 900,
      kind: 'recommended',
      sourceId: internalConvention,
      note: 'Fitwise planning convention for a usable walking aisle; not a building-code or accessibility standard.',
    },
    sourceIds: [internalConvention],
    notes:
      'Use for planning between a bed and wardrobe/dresser; door swing and user needs may require more space.',
  },
];
