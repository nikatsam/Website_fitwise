import type { FitState } from './engine';

export interface FitStateBadgeCopy {
  icon: string;
  label: string;
}

/**
 * Icon + label for each fit state, shared between the server-rendered
 * FitSummary.astro and the client-side recompute script (e.g.
 * src/scripts/workspace-fitcheck.ts) so both always agree, and so state is
 * never communicated by color alone (specs/UX_UI.md §3/§8).
 */
export const FIT_STATE_BADGE_COPY: Record<FitState, FitStateBadgeCopy> = {
  fits: { icon: '✓', label: 'Fits' },
  tight: { icon: '△', label: 'Tight fit' },
  does_not_fit: { icon: '✕', label: 'Does not fit' },
};
