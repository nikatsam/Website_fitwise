import { type DimensionDisplayRow, type FitState } from '../fit';
import { getFitStateBadgeCopy } from '../fit/summary-copy';
import { formatMeasurement, type MeasurementDisplay } from '../units';
import type { Locale } from '../../i18n/locale';
import { translate } from '../../i18n/text';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

function rowState(row: DimensionDisplayRow, locale: Locale): { className: string; label: string } {
  if (!row.hardFit)
    return {
      className: 'fit-service-plan-svg__target--fail',
      label: translate(locale, 'Hard limit fails'),
    };
  if (!row.recommendedFit)
    return {
      className: 'fit-service-plan-svg__target--tight',
      label: translate(locale, 'Target short'),
    };
  return { className: 'fit-service-plan-svg__target--fit', label: translate(locale, 'Target met') };
}

export function renderFitServiceSvgPlan(
  rows: DimensionDisplayRow[],
  state: FitState,
  display: MeasurementDisplay = 'metric',
  locale: Locale = 'en',
): string {
  const dimensionRows = rows
    .filter((row) => /width|depth|length|height/i.test(row.dimension))
    .slice(0, 4);
  const chartRows = dimensionRows.length > 0 ? dimensionRows : rows.slice(0, 4);
  const rowHeight = 60;
  const chartWidth = 360;
  const chartHeight = 56 + chartRows.length * rowHeight;
  const barLeft = 12;
  const barWidth = 234;
  const description = [
    `${getFitStateBadgeCopy(state, locale).label}. ${translate(locale, 'Filled bars show selected target dimensions; vertical markers show available dimensions.')}`,
    ...chartRows.map((row) => {
      const status = rowState(row, locale).label.toLowerCase();
      return `${row.label}: ${translate(locale, 'target')} ${formatMeasurement(row.recommendedMm, display)}, ${translate(locale, 'available')} ${formatMeasurement(row.availableMm, display)}, ${status}.`;
    }),
    translate(
      locale,
      'Schematic, not to scale. See the adjacent result and calculation table for source verification and exact values.',
    ),
  ].join(' ');

  const rowsMarkup = chartRows
    .map((row, index) => {
      const top = 24 + index * rowHeight;
      const scaleMax = Math.max(row.availableMm, row.recommendedMm, 1);
      const targetWidth = (row.recommendedMm / scaleMax) * barWidth;
      const availablePosition = barLeft + (row.availableMm / scaleMax) * barWidth;
      const label = row.label.length > 34 ? `${row.label.slice(0, 31)}...` : row.label;
      const rowStatus = rowState(row, locale);
      return `<g class="fit-service-plan-svg__row"><text x="${barLeft}" y="${top + 12}" class="fit-service-plan-svg__label">${escapeHtml(label)}</text><rect x="${barLeft}" y="${top + 20}" width="${barWidth}" height="12" rx="6" class="fit-service-plan-svg__track"/><rect x="${barLeft}" y="${top + 20}" width="${targetWidth}" height="12" rx="6" class="fit-service-plan-svg__target ${rowStatus.className}"/><line x1="${availablePosition}" y1="${top + 16}" x2="${availablePosition}" y2="${top + 36}" class="fit-service-plan-svg__available"/><text x="${barLeft}" y="${top + 49}" class="fit-service-plan-svg__status">${rowStatus.label}</text></g>`;
    })
    .join('');

  const legendY = chartHeight - 8;
  const legend = `<g class="fit-service-plan-svg__legend"><rect x="${barLeft}" y="${legendY - 11}" width="14" height="10" rx="2" class="fit-service-plan-svg__target fit-service-plan-svg__target--fit"/><text x="32" y="${legendY - 2}">${translate(locale, 'Target')}</text><line x1="100" y1="${legendY - 11}" x2="100" y2="${legendY - 1}" class="fit-service-plan-svg__available"/><text x="110" y="${legendY - 2}">${translate(locale, 'Available')}</text></g>`;
  return `<svg class="fit-service-plan-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-labelledby="fit-service-plan-svg-title fit-service-plan-svg-description"><title id="fit-service-plan-svg-title">${translate(locale, 'Fit dimension comparison')}</title><desc id="fit-service-plan-svg-description">${escapeHtml(description)}</desc>${rowsMarkup}${legend}</svg>`;
}
