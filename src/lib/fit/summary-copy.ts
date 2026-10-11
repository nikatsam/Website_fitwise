import type { FitState } from './engine';
import { FIT_STATE_BADGE_COPY } from './copy';
import { selectSummaryDimension, type DimensionDisplayRow } from './display';
import { formatMeasurement } from '../units';
import type { MissingRequirement } from './missing-requirement';

export interface CompatibilitySummaryCheck {
  label: string;
  compatible: boolean;
}

export interface FitSummaryCopy {
  state: FitState;
  resultLabel: string;
  isExactFit: boolean;
  physicalStatus: 'Yes' | 'No' | 'Not confirmed';
  clearanceStatus: 'Met' | 'Short' | 'Not confirmed';
  compatibilityStatus: 'Compatible' | 'Incompatible' | 'Needs verification' | null;
  bindingLabel: string | null;
  marginLabel:
    | 'Extra space beyond target'
    | 'Remaining target margin'
    | 'Short against selected target'
    | 'Additional physical space needed'
    | null;
  marginMm: number | null;
  explanation: string;
  nextAction: string;
  missingRequirements: MissingRequirement[];
}

function humanizeDimension(dimension?: string): string {
  const words = (dimension ?? 'checked dimension')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;,:]+$/g, '')
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return 'Checked dimension';
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ');
}

function cleanName(value?: string): string {
  return (value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;,:]+$/g, '');
}

function listNames(values: string[], fallback: string): string {
  const names = values.map(cleanName).filter(Boolean);
  if (names.length === 0) return fallback;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function finishSentence(value: string): string {
  const sentence = value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;,:]+$/g, '');
  return sentence ? `${sentence}.` : '';
}

function normalizeMissingRequirement(requirement: MissingRequirement): MissingRequirement {
  return {
    ...requirement,
    label: cleanName(requirement.label) || 'Required information',
    explanation: finishSentence(requirement.explanation),
    action: finishSentence(requirement.action),
  };
}

const fallbackMissingRequirement: MissingRequirement = {
  type: 'manufacturer_source',
  label: 'Required measurements or exact model source',
  explanation:
    'One or more required measurements, source or compatibility details have not been verified.',
  action: 'Enter the missing measurements and verify the exact model source.',
};

export function getFitSummaryCopy(
  state: FitState,
  rows: DimensionDisplayRow[],
  options: {
    missingRequirements?: MissingRequirement[];
    compatibilityChecks?: CompatibilitySummaryCheck[];
  } = {},
): FitSummaryCopy {
  const missingRequirements = options.missingRequirements?.length
    ? options.missingRequirements.map(normalizeMissingRequirement)
    : state === 'needs_information'
      ? [normalizeMissingRequirement(fallbackMissingRequirement)]
      : [];
  const compatibilityChecks = options.compatibilityChecks ?? [];
  const hardFailures = rows.filter((row) => !row.hardFit);
  const targetFailures = rows.filter((row) => !row.recommendedFit);
  const physicalStatus: FitSummaryCopy['physicalStatus'] =
    rows.length === 0 ? 'Not confirmed' : hardFailures.length > 0 ? 'No' : 'Yes';
  const clearanceStatus: FitSummaryCopy['clearanceStatus'] =
    state === 'needs_information' ? 'Not confirmed' : targetFailures.length > 0 ? 'Short' : 'Met';
  const incompatibleChecks = compatibilityChecks.filter((check) => !check.compatible);
  const compatibilityStatus: FitSummaryCopy['compatibilityStatus'] =
    missingRequirements.length > 0
      ? 'Needs verification'
      : incompatibleChecks.length > 0
        ? 'Incompatible'
        : compatibilityChecks.length > 0
          ? 'Compatible'
          : null;
  const primary = rows.length > 0 ? selectSummaryDimension(rows) : undefined;
  const isExactFit = state === 'fits' && primary?.targetMarginMm === 0;
  const resultLabel = isExactFit ? 'Fits exactly' : FIT_STATE_BADGE_COPY[state].label;
  const bindingLabel =
    incompatibleChecks.length > 0 && hardFailures.length === 0
      ? cleanName(incompatibleChecks[0].label) || 'Compatibility check'
      : primary
        ? cleanName(primary.label) || humanizeDimension(primary.dimension)
        : null;

  let marginLabel: FitSummaryCopy['marginLabel'] = null;
  let marginMm: number | null = null;
  if (state === 'fits' && primary) {
    marginLabel = isExactFit ? 'Remaining target margin' : 'Extra space beyond target';
    marginMm = Math.max(0, primary.targetMarginMm);
  } else if (state === 'tight' && primary) {
    marginLabel = 'Short against selected target';
    marginMm = Math.abs(primary.targetMarginMm);
  } else if (state === 'does_not_fit' && hardFailures.length > 0 && primary) {
    marginLabel = 'Additional physical space needed';
    marginMm = Math.abs(primary.physicalMarginMm);
  }

  let explanation: string;
  let nextAction: string;
  if (state === 'fits') {
    explanation = isExactFit
      ? `The measured footprint meets your selected target exactly${bindingLabel ? ` at ${bindingLabel}` : ''}.`
      : bindingLabel
        ? `The measured footprint fits and meets your selected target. The tightest point is ${bindingLabel}.`
        : 'The measured footprint and selected targets pass the checks shown.';
    nextAction = isExactFit
      ? 'Remeasure the actual product and usable space before buying or installing.'
      : 'Recheck the actual product dimensions and any model-specific instructions before buying or installing.';
  } else if (state === 'tight') {
    const shortTargets = listNames(
      targetFailures.map((row) => cleanName(row.label) || humanizeDimension(row.dimension)),
      bindingLabel ?? 'one or more dimensions',
    );
    explanation = `The physical footprint fits, but selected targets are short at ${shortTargets}. The tightest point is ${bindingLabel ?? 'shown in the table'}.`;
    nextAction =
      'Remeasure the binding area or adjust the layout/target you chose, then check again.';
  } else if (state === 'does_not_fit' && hardFailures.length > 0) {
    const failedDimensions = listNames(
      hardFailures.map((row) => cleanName(row.label) || humanizeDimension(row.dimension)),
      bindingLabel ?? 'one or more physical dimensions',
    );
    explanation = `Available space is short on ${failedDimensions}. The tightest point is ${bindingLabel ?? 'shown in the table'}.`;
    nextAction =
      'Remeasure the item and usable opening, then try another orientation or a larger space.';
  } else if (state === 'does_not_fit') {
    const reasons = listNames(
      incompatibleChecks.map((check) => check.label),
      'a product compatibility check',
    );
    explanation = reasons
      ? `The measured dimensions fit, but compatibility checks failed: ${reasons}.`
      : 'A required compatibility check failed even though the dimension table may show a physical fit.';
    nextAction =
      'Verify the exact model specifications or choose compatible products before installing.';
  } else {
    explanation =
      'This result is not confirmed because required information has not been verified.';
    nextAction = 'Complete the verification steps listed below, then run the check again.';
  }

  return {
    state,
    resultLabel,
    isExactFit,
    physicalStatus,
    clearanceStatus,
    compatibilityStatus,
    bindingLabel,
    marginLabel,
    marginMm,
    explanation: finishSentence(explanation),
    nextAction: finishSentence(nextAction),
    missingRequirements,
  };
}

export function getFitSummaryResultLabel(copy: FitSummaryCopy, origin?: string): string {
  if (origin === 'example') return `Example result — ${copy.resultLabel}`;
  if (origin === 'user') return `Your result — ${copy.resultLabel}`;
  return copy.resultLabel;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function unitValueHtml(mm: number): string {
  return `<span class="unit-value"><span data-unit="metric">${escapeHtml(formatMeasurement(mm, 'metric'))}</span> <span data-unit="imperial">${escapeHtml(formatMeasurement(mm, 'imperial'))}</span></span>`;
}

export function renderFitSummaryContentHtml(copy: FitSummaryCopy): string {
  const binding = copy.bindingLabel
    ? `<p class="fit-summary__binding"><strong>Tightest point:</strong> ${escapeHtml(copy.bindingLabel)}</p>`
    : '';
  const margin =
    copy.marginLabel && copy.marginMm !== null
      ? `<p class="fit-summary__margin"><strong>${escapeHtml(copy.marginLabel)}:</strong> ${unitValueHtml(copy.marginMm)}</p>`
      : '';
  const exactFitWarning = copy.isExactFit
    ? '<p class="fit-summary__tolerance-warning"><strong>Fits exactly:</strong> No measurement tolerance remains. Re-check actual dimensions before relying on this result.</p>'
    : '';
  const missingRequirements =
    copy.missingRequirements.length > 0
      ? `<section class="fit-summary__missing" aria-label="Missing or unverified requirements" aria-live="polite" aria-atomic="true"><h3>What is missing</h3><ul>${copy.missingRequirements
          .map(
            (requirement) =>
              `<li><strong>${escapeHtml(requirement.label)}</strong><p>${escapeHtml(requirement.explanation)}</p><p><strong>Action:</strong> ${escapeHtml(requirement.action)}</p></li>`,
          )
          .join('')}</ul></section>`
      : '';
  const compatibility = copy.compatibilityStatus
    ? `<div><dt>Compatibility</dt><dd>${escapeHtml(copy.compatibilityStatus)}</dd></div>`
    : '';
  return `<div class="fit-summary__content"><dl class="fit-summary__facts"><div><dt>Physical fit</dt><dd data-field="physical-status">${escapeHtml(copy.physicalStatus)}</dd></div><div><dt>Selected clearance</dt><dd data-field="clearance-status">${escapeHtml(copy.clearanceStatus)}</dd></div>${compatibility}</dl>${binding}${margin}${exactFitWarning}${missingRequirements}<h3>What this means</h3><p class="fit-summary__detail" data-field="detail" aria-live="polite" aria-atomic="true">${escapeHtml(copy.explanation)}</p><p class="fit-summary__next"><strong>Next:</strong> <span data-field="next-action">${escapeHtml(copy.nextAction)}</span></p></div>`;
}
