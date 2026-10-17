import {
  evaluateFit,
  getFitStateBadgeCopy,
  getFitSummaryCopy,
  getFitSummaryResultLabel,
  renderFitSummaryContentHtml,
  toDimensionDisplayRows,
  type DimensionDisplayRow,
} from '../lib/fit';
import { buildDiningFitPlan, type DiningOrientation } from '../lib/geometry';
import { renderDiningDiagramMarkup } from '../lib/diagram';
import { formatMarginMeasurement, formatMeasurement, parseLength } from '../lib/units';
import type { Locale } from '../i18n/locale';
import {
  esDiningUniversalRugCopy as esCopy,
  esDiningUniversalRugTemplates as esTemplates,
} from '../i18n/es-dining-universal-rug-copy';
import { translate as sharedTranslate, translateTemplate as sharedTemplate } from '../i18n/text';

const locale: Locale =
  typeof document === 'undefined'
    ? 'en'
    : document.documentElement.lang.startsWith('es')
      ? 'es'
      : 'en';
const t = (source: string) =>
  locale === 'es' ? (esCopy[source] ?? sharedTranslate(locale, source)) : source;
const tt = (source: string, values: Record<string, string | number>) =>
  locale === 'es'
    ? (esTemplates[source] ?? sharedTemplate(locale, source, values)).replace(
        /\{(\w+)\}/g,
        (_, key: string) => String(values[key] ?? `{${key}}`),
      )
    : sharedTemplate(locale, source, values);

type LengthField =
  | 'dining-room-width'
  | 'dining-room-length'
  | 'dining-table-width'
  | 'dining-table-length'
  | 'dining-chair-width'
  | 'dining-chair-depth'
  | 'dining-walking-clearance';

const DIAGRAM_ID = 'dining-fitcheck-diagram';

function setError(id: string, message: string): void {
  document.getElementById(id)?.setAttribute('aria-invalid', 'true');
  const error = document.getElementById(`${id}-error`);
  if (error) error.textContent = message;
}

function clearError(id: string): void {
  document.getElementById(id)?.removeAttribute('aria-invalid');
  const error = document.getElementById(`${id}-error`);
  if (error) error.textContent = '';
}

function readLength(id: LengthField, required: boolean): number | undefined {
  const input = document.getElementById(id) as HTMLInputElement | null;
  const raw = input?.value.trim() ?? '';
  if (!raw) {
    setError(id, t('Enter a dimension with a unit, such as 90 cm or 36 in.'));
    return undefined;
  }
  const parsed = parseLength(raw);
  if (!parsed.ok || (required && parsed.valueMm <= 0)) {
    setError(id, t(parsed.ok ? 'Enter a value greater than zero.' : parsed.error));
    return undefined;
  }
  clearError(id);
  return parsed.valueMm;
}

function readCount(id: string, min: number, max: number): number | undefined {
  const input = document.getElementById(id) as HTMLInputElement;
  const value = Number(input.value);
  const error = document.getElementById(`${id}-error`);
  if (!Number.isInteger(value) || value < min || value > max) {
    input.setAttribute('aria-invalid', 'true');
    if (error) error.textContent = tt('Enter a whole number from {min} to {max}.', { min, max });
    return undefined;
  }
  input.removeAttribute('aria-invalid');
  if (error) error.textContent = '';
  return value;
}

function readForm() {
  const lengthValues: Record<LengthField, number | undefined> = {
    'dining-room-width': readLength('dining-room-width', true),
    'dining-room-length': readLength('dining-room-length', true),
    'dining-table-width': readLength('dining-table-width', true),
    'dining-table-length': readLength('dining-table-length', true),
    'dining-chair-width': readLength('dining-chair-width', true),
    'dining-chair-depth': readLength('dining-chair-depth', true),
    'dining-walking-clearance': readLength('dining-walking-clearance', false),
  };
  const chairsPerLongSide = readCount('dining-chairs-long', 0, 6);
  const chairsPerEnd = readCount('dining-chairs-end', 0, 2);
  if (
    Object.values(lengthValues).some((value) => value === undefined) ||
    chairsPerLongSide === undefined ||
    chairsPerEnd === undefined
  ) {
    return null;
  }
  return {
    roomWidthMm: lengthValues['dining-room-width']!,
    roomLengthMm: lengthValues['dining-room-length']!,
    tableWidthMm: lengthValues['dining-table-width']!,
    tableLengthMm: lengthValues['dining-table-length']!,
    chairWidthMm: lengthValues['dining-chair-width']!,
    chairEnvelopeDepthMm: lengthValues['dining-chair-depth']!,
    walkingClearanceMm: lengthValues['dining-walking-clearance']!,
    chairsPerLongSide,
    chairsPerEnd,
    orientation: (document.getElementById('dining-orientation') as HTMLSelectElement)
      .value as DiningOrientation,
  };
}

function unitHtml(mm: number, margin = false): string {
  const format = margin ? formatMarginMeasurement : formatMeasurement;
  return `<span class="unit-value"><span data-unit="metric">${format(mm, 'metric')}</span><span data-unit="separator" aria-hidden="true"> / </span><span data-unit="imperial">${format(mm, 'imperial')}</span></span>`;
}

function renderRows(rows: DimensionDisplayRow[]): void {
  const tbody = document.querySelector<HTMLTableSectionElement>('#dining-fitcheck-table tbody');
  if (!tbody) return;
  tbody.innerHTML = rows
    .map(
      (
        row,
      ) => `<tr data-dimension="${row.dimension}" data-hard-fit="${row.hardFit}" data-recommended-fit="${row.recommendedFit}">
        <th scope="row" data-label="Dimension">${row.label}</th>
        <td data-label="Required">${unitHtml(row.requiredMm)}</td>
        <td data-label="Target">${unitHtml(row.recommendedMm)}</td>
        <td data-label="Available">${unitHtml(row.availableMm)}</td>
        <td data-label="Physical margin">${row.physicalMarginMm > 0 ? '+' : row.physicalMarginMm < 0 ? '−' : ''}${unitHtml(Math.abs(row.physicalMarginMm), true)}</td>
        <td data-label="Target margin">${row.targetMarginMm > 0 ? '+' : row.targetMarginMm < 0 ? '−' : ''}${unitHtml(Math.abs(row.targetMarginMm), true)}</td>
      </tr>`,
    )
    .join('');
}

function renderAssumptions(
  values: NonNullable<ReturnType<typeof readForm>>,
  orientation: string,
): string[] {
  return [
    t(
      'The model is a rectangular table with identical rectangular chair envelopes; round/oval tables and chair rotation are not represented.',
    ),
    tt('Selected orientation: {orientation}.', { orientation }),
    tt(
      'The {measurement} chair envelope is user-entered from table edge to pulled-out chair edge.',
      { measurement: formatMeasurement(values.chairEnvelopeDepthMm) },
    ),
    tt(
      'The {measurement} circulation target is user-selected on each side of the occupied layout; it is not a universal minimum.',
      { measurement: formatMeasurement(values.walkingClearanceMm) },
    ),
  ];
}

function updateDiagram(
  values: NonNullable<ReturnType<typeof readForm>>,
  orientation: string,
): void {
  const svg = document.querySelector<SVGSVGElement>(
    `[data-diagram-id="${DIAGRAM_ID}"] .scale-diagram__svg`,
  );
  if (!svg) return;
  const defs = svg.querySelector('defs');
  const markup = renderDiningDiagramMarkup({
    diagramId: DIAGRAM_ID,
    ...values,
    orientation: orientation as 'width-depth' | 'depth-width',
  });
  svg.innerHTML = '';
  if (defs) svg.appendChild(defs);
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  wrapper.innerHTML = markup;
  while (wrapper.firstChild) svg.appendChild(wrapper.firstChild);
  const caption = svg.closest('figure')?.querySelector('figcaption');
  if (caption) {
    const seats = values.chairsPerLongSide * 2 + values.chairsPerEnd * 2;
    caption.textContent = tt(
      '{width} by {length} room, {tableWidth} by {tableLength} rectangular table, {seats} seats, {orientation}, and {clearance} selected walking clearance.',
      {
        width: formatMeasurement(values.roomWidthMm),
        length: formatMeasurement(values.roomLengthMm),
        tableWidth: formatMeasurement(values.tableWidthMm),
        tableLength: formatMeasurement(values.tableLengthMm),
        seats,
        orientation: t(
          orientation === 'width-depth'
            ? 'table width runs along room width'
            : 'table is rotated 90 degrees',
        ),
        clearance: formatMeasurement(values.walkingClearanceMm),
      },
    );
  }
}

function recompute(): void {
  const values = readForm();
  if (!values) return;
  const plan = buildDiningFitPlan(values);
  const assumptions = renderAssumptions(
    values,
    plan.orientation === 'width-depth'
      ? 'table width along room width'
      : 'table rotated 90 degrees',
  );
  const result = evaluateFit(plan.checks, assumptions);
  const rows = toDimensionDisplayRows(plan.checks, result);
  const summaryCopy = getFitSummaryCopy(result.state, rows, { locale });
  const summary = document.getElementById('dining-fitcheck-summary');
  if (summary) {
    const copy = getFitStateBadgeCopy(result.state, locale);
    const resultLabel = getFitSummaryResultLabel(summaryCopy, summary.dataset.fitOrigin);
    summary.dataset.fitState = result.state;
    summary.dataset.fitExact = String(summaryCopy.isExactFit);
    summary.querySelector<HTMLElement>('[data-field="icon"]')!.textContent = copy.icon;
    summary.querySelector<HTMLElement>('[data-field="label"]')!.textContent = resultLabel;
    const content = summary.querySelector<HTMLElement>('[data-fit-summary-content]');
    if (content) content.innerHTML = renderFitSummaryContentHtml(summaryCopy);
    const sticky = summary.querySelector<HTMLAnchorElement>('[data-fit-sticky]');
    if (sticky) {
      sticky.dataset.fitState = result.state;
      sticky.setAttribute(
        'aria-label',
        tt('Fit result: {resultLabel}. View calculation details.', { resultLabel }),
      );
      sticky.querySelector<HTMLElement>('[data-field="sticky-icon"]')!.textContent = copy.icon;
      sticky.querySelector<HTMLElement>('[data-field="sticky-label"]')!.textContent = resultLabel;
      const stickyDetail = sticky.querySelector<HTMLElement>('[data-field="sticky-detail"]');
      if (stickyDetail) {
        stickyDetail.innerHTML = summaryCopy.isExactFit
          ? t('No measurement tolerance remains')
          : summaryCopy.marginMm !== null && summaryCopy.marginLabel
            ? `${unitHtml(summaryCopy.marginMm, true)} ${summaryCopy.marginLabel.toLowerCase()}`
            : t('Check result details');
      }
    }
  }
  renderRows(rows);
  const assumptionsList = document.querySelector<HTMLElement>(
    '#dining-fitcheck-assumptions [data-field="items"]',
  );
  if (assumptionsList) {
    assumptionsList.innerHTML = assumptions.map((item) => `<li>${item}</li>`).join('');
  }
  const orientationText = document.querySelector<HTMLElement>('[data-dining-orientation]');
  if (orientationText) {
    orientationText.textContent = tt('{seats} seats in the selected layout; {orientation}.', {
      seats: plan.seats,
      orientation: t(
        plan.orientation === 'width-depth'
          ? 'table width runs along room width'
          : 'table is rotated 90 degrees',
      ),
    });
  }
  updateDiagram(values, plan.orientation);
}

function init(): void {
  const form = document.querySelector<HTMLFormElement>('[data-dining-fitcheck-form]');
  if (!form) return;
  form.addEventListener('submit', (event) => event.preventDefault());
  const handleChange = () => {
    recompute();
  };
  form.addEventListener('input', handleChange);
  form.addEventListener('change', handleChange);
  recompute();
}

init();

export {};
