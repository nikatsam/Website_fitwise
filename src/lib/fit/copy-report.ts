import type { DimensionDisplayRow } from './display';
import type { FitSummaryCopy } from './summary-copy';
import { formatMeasurement, formatSignedMeasurement } from '../units';
import { translate, translateTemplate } from '../../i18n/text';

export interface FitReviewReportInput {
  itemName: string;
  stateLabel: string;
  objectWidthMm: number;
  objectDepthMm: number;
  objectHeightMm: number;
  spaceWidthMm: number;
  spaceDepthMm: number;
  spaceHeightMm: number;
  orientation: string;
  quantityCapacity: number;
  summary: FitSummaryCopy;
  rows: DimensionDisplayRow[];
}

const formatDual = (mm: number): string =>
  `${formatMeasurement(mm, 'metric')} / ${formatMeasurement(mm, 'imperial')}`;

function formatDimensionName(row: DimensionDisplayRow, locale: FitSummaryCopy['locale']): string {
  const name = row.label
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;,:]+$/g, '');
  if (name) return translate(locale, name);
  const words = row.dimension.replace(/[_-]+/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return translate(locale, 'Dimension');
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return translate(locale, words.join(' '));
}

export function buildFitReviewReport(input: FitReviewReportInput): string {
  const itemName = input.itemName.trim().replace(/\s+/g, ' ') || 'Item';
  const locale = input.summary.locale;
  return [
    translateTemplate(locale, 'Fitwise review: {itemName}', { itemName }),
    translateTemplate(locale, 'Result: {stateLabel}', { stateLabel: input.stateLabel }),
    translateTemplate(locale, 'What this means: {explanation}', {
      explanation: input.summary.explanation,
    }),
    translateTemplate(locale, 'Next: {nextAction}', { nextAction: input.summary.nextAction }),
    ...input.summary.missingRequirements.flatMap((requirement) => [
      translateTemplate(locale, 'Missing: {label}', { label: requirement.label }),
      translateTemplate(locale, 'Why it matters: {explanation}', {
        explanation: requirement.explanation,
      }),
      translateTemplate(locale, 'Action: {action}', { action: requirement.action }),
    ]),
    `${translate(locale, 'Item')}: ${formatDual(input.objectWidthMm)} ${translate(locale, 'width')} × ${formatDual(input.objectDepthMm)} ${translate(locale, 'depth')} × ${formatDual(input.objectHeightMm)} ${translate(locale, 'height')}`,
    `${translate(locale, 'Space')}: ${formatDual(input.spaceWidthMm)} ${translate(locale, 'width')} × ${formatDual(input.spaceDepthMm)} ${translate(locale, 'depth')} × ${formatDual(input.spaceHeightMm)} ${translate(locale, 'height')}`,
    translateTemplate(
      locale,
      'Floor orientation: {orientation}; estimated single-layer capacity: {quantityCapacity}',
      {
        orientation: translate(locale, input.orientation),
        quantityCapacity: String(input.quantityCapacity),
      },
    ),
    ...input.rows.map((row) => {
      const label = formatDimensionName(row, locale);
      return `${label}: ${translate(locale, 'physical margin')} ${formatSignedMeasurement(row.physicalMarginMm)}; ${translate(locale, 'target margin')} ${formatSignedMeasurement(row.targetMarginMm)}`;
    }),
    translate(locale, 'Screening estimate only; verify measurements and the access route on site.'),
  ].join('\n');
}
