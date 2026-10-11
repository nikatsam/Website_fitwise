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
    meaning: 'Hard physical requirements and selected or verified targets pass.',
  },
  tight: {
    icon: '△',
    label: 'Tight',
    meaning: 'Physical fit passes, but one or more selected targets do not.',
  },
  does_not_fit: {
    icon: '✕',
    label: 'Does not fit',
    meaning: 'At least one hard physical or access requirement fails.',
  },
  needs_information: {
    icon: '?',
    label: 'Needs information',
    meaning:
      'Required measurement, source, model, manual or compatibility data has not been verified.',
  },
};
