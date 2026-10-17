import type { FitState } from './engine';
import { FIT_STATE_BADGE_COPY } from './copy';
import { selectSummaryDimension, type DimensionDisplayRow } from './display';
import { formatMarginMeasurement, formatMeasurement } from '../units';
import type { MissingRequirement } from './missing-requirement';
import { fitStateBadgeEs } from '../../i18n/es-family-copy';
import type { Locale } from '../../i18n/locale';
import { translate, translateRequired, translateTemplate } from '../../i18n/text';

export interface CompatibilitySummaryCheck {
  label: string;
  compatible: boolean;
}

export interface FitSummaryCopy {
  locale: Locale;
  state: FitState;
  resultLabel: string;
  isExactFit: boolean;
  physicalStatus: string;
  clearanceStatus: string;
  compatibilityStatus: string | null;
  bindingLabel: string | null;
  marginLabel: string | null;
  marginMm: number | null;
  explanation: string;
  nextAction: string;
  missingRequirements: MissingRequirement[];
}

function humanizeDimension(dimension: string | undefined, locale: Locale): string {
  const words = (dimension ?? 'checked dimension')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;,:]+$/g, '')
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return translateRequired(locale, 'Checked dimension');
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return translateRequired(locale, words.join(' '));
}

function cleanName(value?: string): string {
  return (value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;,:]+$/g, '');
}

function listNames(values: string[], fallback: string, locale: Locale): string {
  const names = values.map(cleanName).filter(Boolean);
  if (names.length === 0) return translateRequired(locale, fallback);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} ${locale === 'es' ? 'y' : 'and'} ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} ${locale === 'es' ? 'y' : 'and'} ${names.at(-1)}`;
}

function finishSentence(value: string): string {
  const sentence = value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;,:]+$/g, '');
  return sentence ? `${sentence}.` : '';
}

function normalizeMissingRequirement(
  requirement: MissingRequirement,
  locale: Locale,
): MissingRequirement {
  return {
    ...requirement,
    label: translate(locale, cleanName(requirement.label) || 'Required information'),
    explanation: finishSentence(translate(locale, requirement.explanation)),
    action: finishSentence(translate(locale, requirement.action)),
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
    locale?: Locale;
  } = {},
): FitSummaryCopy {
  const locale = options.locale ?? 'en';
  const missingRequirements = options.missingRequirements?.length
    ? options.missingRequirements.map((requirement) =>
        normalizeMissingRequirement(requirement, locale),
      )
    : state === 'needs_information'
      ? [normalizeMissingRequirement(fallbackMissingRequirement, locale)]
      : [];
  const compatibilityChecks = options.compatibilityChecks ?? [];
  const hardFailures = rows.filter((row) => !row.hardFit);
  const targetFailures = rows.filter((row) => !row.recommendedFit);
  const physicalStatus = translateRequired(
    locale,
    rows.length === 0 ? 'Not confirmed' : hardFailures.length > 0 ? 'No' : 'Yes',
  );
  const clearanceStatus = translateRequired(
    locale,
    state === 'needs_information' ? 'Not confirmed' : targetFailures.length > 0 ? 'Short' : 'Met',
  );
  const incompatibleChecks = compatibilityChecks.filter((check) => !check.compatible);
  const compatibilityStatus =
    missingRequirements.length > 0
      ? translateRequired(locale, 'Needs verification')
      : incompatibleChecks.length > 0
        ? translateRequired(locale, 'Incompatible')
        : compatibilityChecks.length > 0
          ? translateRequired(locale, 'Compatible')
          : null;
  const primary = rows.length > 0 ? selectSummaryDimension(rows) : undefined;
  const isExactFit = state === 'fits' && primary?.targetMarginMm === 0;
  const badge = locale === 'es' ? fitStateBadgeEs[state] : FIT_STATE_BADGE_COPY[state];
  const resultLabel = isExactFit ? translateRequired(locale, 'Fits exactly') : badge.label;
  const bindingLabel =
    incompatibleChecks.length > 0 && hardFailures.length === 0
      ? translate(locale, cleanName(incompatibleChecks[0].label) || 'Compatibility check')
      : primary
        ? translate(
            locale,
            cleanName(primary.label) || humanizeDimension(primary.dimension, locale),
          )
        : null;

  let marginLabel: FitSummaryCopy['marginLabel'] = null;
  let marginMm: number | null = null;
  if (state === 'fits' && primary) {
    marginLabel = translateRequired(
      locale,
      isExactFit ? 'Remaining target margin' : 'Extra space beyond target',
    );
    marginMm = Math.max(0, primary.targetMarginMm);
  } else if (state === 'tight' && primary) {
    marginLabel = translateRequired(locale, 'Short against selected target');
    marginMm = Math.abs(primary.targetMarginMm);
  } else if (state === 'does_not_fit' && hardFailures.length > 0 && primary) {
    marginLabel = translateRequired(locale, 'Additional physical space needed');
    marginMm = Math.abs(primary.physicalMarginMm);
  }

  let explanation: string;
  let nextAction: string;
  if (state === 'fits') {
    explanation = isExactFit
      ? bindingLabel
        ? translateTemplate(
            locale,
            'The measured footprint meets your selected target exactly at {binding}.',
            { binding: bindingLabel },
          )
        : translateRequired(locale, 'The measured footprint meets your selected target exactly.')
      : bindingLabel
        ? translateTemplate(
            locale,
            'The measured footprint fits and meets your selected target. The tightest point is {binding}.',
            { binding: bindingLabel },
          )
        : translateRequired(
            locale,
            'The measured footprint and selected targets pass the checks shown.',
          );
    nextAction = isExactFit
      ? translateRequired(
          locale,
          'Remeasure the actual product and usable space before buying or installing.',
        )
      : translateRequired(
          locale,
          'Recheck the actual product dimensions and any model-specific instructions before buying or installing.',
        );
  } else if (state === 'tight') {
    const shortTargets = listNames(
      targetFailures.map((row) =>
        translate(locale, cleanName(row.label) || humanizeDimension(row.dimension, locale)),
      ),
      bindingLabel ?? 'one or more dimensions',
      locale,
    );
    explanation = translateTemplate(
      locale,
      'The physical footprint fits, but selected targets are short at {shortTargets}. The tightest point is {binding}.',
      {
        shortTargets,
        binding: bindingLabel ?? translateRequired(locale, 'shown in the table'),
      },
    );
    nextAction = translateRequired(
      locale,
      'Remeasure the binding area or adjust the layout/target you chose, then check again.',
    );
  } else if (state === 'does_not_fit' && hardFailures.length > 0) {
    const failedDimensions = listNames(
      hardFailures.map((row) =>
        translate(locale, cleanName(row.label) || humanizeDimension(row.dimension, locale)),
      ),
      bindingLabel ?? 'one or more physical dimensions',
      locale,
    );
    explanation = translateTemplate(
      locale,
      'Available space is short on {failedDimensions}. The tightest point is {binding}.',
      {
        failedDimensions,
        binding: bindingLabel ?? translateRequired(locale, 'shown in the table'),
      },
    );
    nextAction = translateRequired(
      locale,
      'Remeasure the item and usable opening, then try another orientation or a larger space.',
    );
  } else if (state === 'does_not_fit') {
    const reasons = listNames(
      incompatibleChecks.map((check) => translate(locale, check.label)),
      'a product compatibility check',
      locale,
    );
    explanation =
      incompatibleChecks.length > 0
        ? translateTemplate(
            locale,
            'The measured dimensions fit, but compatibility checks failed: {reasons}.',
            { reasons },
          )
        : translateRequired(
            locale,
            'A required compatibility check failed even though the dimension table may show a physical fit.',
          );
    nextAction = translateRequired(
      locale,
      'Verify the exact model specifications or choose compatible products before installing.',
    );
  } else {
    explanation = translateRequired(
      locale,
      'This result is not confirmed because required information has not been verified.',
    );
    nextAction = translateRequired(
      locale,
      'Complete the verification steps listed below, then run the check again.',
    );
  }

  return {
    locale,
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

export function getFitStateBadgeCopy(state: FitState, locale: Locale = 'en') {
  return locale === 'es' ? fitStateBadgeEs[state] : FIT_STATE_BADGE_COPY[state];
}

export function getFitSummaryResultLabel(copy: FitSummaryCopy, origin?: string): string {
  if (origin === 'example')
    return translateTemplate(copy.locale, 'Example result — {label}', { label: copy.resultLabel });
  if (origin === 'user')
    return translateTemplate(copy.locale, 'Your result — {label}', { label: copy.resultLabel });
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

function unitValueHtml(mm: number, margin = false): string {
  const format = margin ? formatMarginMeasurement : formatMeasurement;
  return `<span class="unit-value"><span data-unit="metric">${escapeHtml(format(mm, 'metric'))}</span><span data-unit="separator" aria-hidden="true"> / </span><span data-unit="imperial">${escapeHtml(format(mm, 'imperial'))}</span></span>`;
}

export function renderFitSummaryContentHtml(copy: FitSummaryCopy): string {
  const t = (source: string) => translateRequired(copy.locale, source);
  const binding = copy.bindingLabel
    ? `<p class="fit-summary__binding"><strong>${escapeHtml(t('Tightest point'))}:</strong> ${escapeHtml(copy.bindingLabel)}</p>`
    : '';
  const margin =
    copy.marginLabel && copy.marginMm !== null
      ? `<p class="fit-summary__margin"><strong>${escapeHtml(copy.marginLabel)}:</strong> ${unitValueHtml(copy.marginMm, true)}</p>`
      : '';
  const exactFitWarning = copy.isExactFit
    ? `<p class="fit-summary__tolerance-warning"><strong>${escapeHtml(t('Fits exactly'))}:</strong> ${escapeHtml(t('No measurement tolerance remains. Re-check actual dimensions before relying on this result.'))}</p>`
    : '';
  const missingRequirements =
    copy.missingRequirements.length > 0
      ? `<section class="fit-summary__missing" aria-label="${escapeHtml(t('Missing or unverified requirements'))}" aria-live="polite" aria-atomic="true"><h3>${escapeHtml(t('What is missing'))}</h3><ul>${copy.missingRequirements
          .map(
            (requirement) =>
              `<li><strong>${escapeHtml(requirement.label)}</strong><p>${escapeHtml(requirement.explanation)}</p><p><strong>${escapeHtml(t('Action'))}:</strong> ${escapeHtml(requirement.action)}</p></li>`,
          )
          .join('')}</ul></section>`
      : '';
  const compatibility = copy.compatibilityStatus
    ? `<div><dt>${escapeHtml(t('Compatibility'))}</dt><dd>${escapeHtml(copy.compatibilityStatus)}</dd></div>`
    : '';
  return `<div class="fit-summary__content"><dl class="fit-summary__facts"><div><dt>${escapeHtml(t('Physical fit'))}</dt><dd data-field="physical-status">${escapeHtml(copy.physicalStatus)}</dd></div><div><dt>${escapeHtml(t('Selected clearance'))}</dt><dd data-field="clearance-status">${escapeHtml(copy.clearanceStatus)}</dd></div>${compatibility}</dl>${binding}${margin}${exactFitWarning}${missingRequirements}<h3>${escapeHtml(t('What this means'))}</h3><p class="fit-summary__detail" data-field="detail" aria-live="polite" aria-atomic="true">${escapeHtml(copy.explanation)}</p><p class="fit-summary__next"><strong>${escapeHtml(t('Next'))}:</strong> <span data-field="next-action">${escapeHtml(copy.nextAction)}</span></p></div>`;
}
