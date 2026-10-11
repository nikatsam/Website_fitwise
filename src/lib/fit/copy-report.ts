import type { DimensionDisplayRow } from './display';
import type { FitSummaryCopy } from './summary-copy';
import { formatMeasurement, formatSignedMeasurement } from '../units';

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

function formatDimensionName(row: DimensionDisplayRow): string {
  const name = row.label
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;,:]+$/g, '');
  if (name) return name;
  const words = row.dimension.replace(/[_-]+/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Dimension';
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ');
}

export function buildFitReviewReport(input: FitReviewReportInput): string {
  const itemName = input.itemName.trim().replace(/\s+/g, ' ') || 'Item';
  return [
    `Fitwise review: ${itemName}`,
    `Result: ${input.stateLabel}`,
    `What this means: ${input.summary.explanation}`,
    `Next: ${input.summary.nextAction}`,
    `Item: ${formatDual(input.objectWidthMm)} W × ${formatDual(input.objectDepthMm)} D × ${formatDual(input.objectHeightMm)} H`,
    `Space: ${formatDual(input.spaceWidthMm)} W × ${formatDual(input.spaceDepthMm)} D × ${formatDual(input.spaceHeightMm)} H`,
    `Floor orientation: ${input.orientation}; estimated single-layer capacity: ${input.quantityCapacity}`,
    ...input.rows.map((row) => {
      const label = formatDimensionName(row);
      return `${label}: physical margin ${formatSignedMeasurement(row.physicalMarginMm)}; target margin ${formatSignedMeasurement(row.targetMarginMm)}`;
    }),
    'Screening estimate only; verify measurements and the access route on site.',
  ].join('\n');
}
