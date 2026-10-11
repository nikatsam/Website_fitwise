import type { FitState } from './engine';

export interface FitStateBadgeCopy {
  icon: string;
  label: string;
  meaning: string;
}

/**
 * Icon + label for each fit state, shared between the server-rendered
 * FitSummary.astro and the client-side recompute script (e.g.
 * src/scripts/workspace-fitcheck.ts) so both always agree, and so state is
 * never communicated by color alone (specs/UX_UI.md §3/§8).
 */
export const FIT_STATE_BADGE_COPY: Record<FitState, FitStateBadgeCopy> = {
  fits: {
    icon: '✓',
    label: 'Fits',
    meaning: 'All hard dimensions and every selected or verified clearance target pass.',
  },
  tight: {
    icon: '△',
    label: 'Tight',
    meaning: 'The hard physical fit passes, but one or more selected clearance targets are short.',
  },
  does_not_fit: {
    icon: '✕',
    label: 'Does not fit',
    meaning:
      'At least one hard physical or enabled access requirement exceeds the available space.',
  },
  needs_information: {
    icon: '?',
    label: 'Needs information',
    meaning:
      'A required measurement, model/manual reference or verification detail is missing, so fit cannot be confirmed.',
  },
};
