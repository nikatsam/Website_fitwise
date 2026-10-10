import {
  evaluateFit,
  FIT_STATE_BADGE_COPY,
  selectSummaryDimension,
  toDimensionDisplayRows,
  type DimensionDisplayRow,
} from '../lib/fit';
import { buildDiningFitPlan, type DiningOrientation } from '../lib/geometry';
import { renderDiningDiagramMarkup } from '../lib/diagram';
import { formatMeasurement, parseLength } from '../lib/units';

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
    setError(id, 'Enter a dimension with a unit, such as 90 cm or 36 in.');
    return undefined;
  }
  const parsed = parseLength(raw);
  if (!parsed.ok || (required && parsed.valueMm <= 0)) {
    setError(id, parsed.ok ? 'Enter a value greater than zero.' : parsed.error);
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
    if (error) error.textContent = `Enter a whole number from ${min} to ${max}.`;
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

function unitHtml(mm: number): string {
  return `<span class="unit-value"><span data-unit="metric">${formatMeasurement(mm, 'metric')}</span> <span data-unit="imperial">${formatMeasurement(mm, 'imperial')}</span></span>`;
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
        <td data-label="Physical margin">${row.physicalMarginMm > 0 ? '+' : row.physicalMarginMm < 0 ? '−' : ''}${unitHtml(Math.abs(row.physicalMarginMm))}</td>
        <td data-label="Target margin">${row.targetMarginMm > 0 ? '+' : row.targetMarginMm < 0 ? '−' : ''}${unitHtml(Math.abs(row.targetMarginMm))}</td>
      </tr>`,
    )
    .join('');
}

function renderDetail(
  state: 'fits' | 'tight' | 'does_not_fit',
  rows: DimensionDisplayRow[],
): string {
  const hardFailures = rows.filter((row) => !row.hardFit);
  const targetFailures = rows.filter((row) => !row.recommendedFit);
  const primary = selectSummaryDimension(rows);
  if (state === 'fits' && primary) {
    return `Tightest constraint: ${primary.label}. Physical space remaining: ${unitHtml(primary.physicalMarginMm)}. After your selected target: ${unitHtml(primary.targetMarginMm)}.`;
  }
  if (state === 'tight') {
    return `The physical table/chair envelope fits, but selected circulation space is short on ${targetFailures.map((row) => `${row.label} by ${unitHtml(Math.abs(row.targetMarginMm))}`).join(', ')}.`;
  }
  return `Does not fit physically: ${hardFailures.map((row) => `${row.label} short by ${unitHtml(Math.abs(row.physicalMarginMm))}`).join(', ')}.`;
}

function renderAssumptions(
  values: NonNullable<ReturnType<typeof readForm>>,
  orientation: string,
): string[] {
  return [
    'The model is a rectangular table with identical rectangular chair envelopes; round/oval tables and chair rotation are not represented.',
    `Selected orientation: ${orientation}. Chairs per side and end are modeled as measured outside chair widths; no extra place-setting or elbow room is inferred.`,
    `The ${formatMeasurement(values.chairEnvelopeDepthMm)} chair envelope is user-entered from table edge to pulled-out chair edge.`,
    `The ${formatMeasurement(values.walkingClearanceMm)} circulation target is user-selected on each side of the occupied layout; it is not a universal minimum.`,
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
    caption.textContent = `${formatMeasurement(values.roomWidthMm)} by ${formatMeasurement(values.roomLengthMm)} room, ${formatMeasurement(values.tableWidthMm)} by ${formatMeasurement(values.tableLengthMm)} rectangular table, ${seats} seats, ${orientation === 'width-depth' ? 'table width along room width' : 'table rotated 90 degrees'}, and ${formatMeasurement(values.walkingClearanceMm)} selected walking clearance.`;
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
  const summary = document.getElementById('dining-fitcheck-summary');
  if (summary) {
    const copy = FIT_STATE_BADGE_COPY[result.state];
    summary.dataset.fitState = result.state;
    summary.querySelector<HTMLElement>('[data-field="icon"]')!.textContent = copy.icon;
    summary.querySelector<HTMLElement>('[data-field="label"]')!.textContent = copy.label;
    summary.querySelector<HTMLElement>('[data-field="detail"]')!.innerHTML = renderDetail(
      result.state,
      rows,
    );
    const sticky = summary.querySelector<HTMLAnchorElement>('[data-fit-sticky]');
    if (sticky) {
      sticky.dataset.fitState = result.state;
      sticky.setAttribute(
        'aria-label',
        `Dining fit result: ${copy.label}. View dimension details.`,
      );
      sticky.querySelector<HTMLElement>('[data-field="sticky-icon"]')!.textContent = copy.icon;
      sticky.querySelector<HTMLElement>('[data-field="sticky-label"]')!.textContent = copy.label;
      sticky.querySelector<HTMLElement>('[data-field="sticky-detail"]')!.innerHTML =
        result.state === 'fits'
          ? `${unitHtml(Math.max(0, selectSummaryDimension(rows)?.targetMarginMm ?? 0))} after target`
          : result.state === 'tight'
            ? `Target short ${unitHtml(Math.abs(selectSummaryDimension(rows)?.targetMarginMm ?? 0))}`
            : `Physical short ${unitHtml(Math.abs(selectSummaryDimension(rows)?.physicalMarginMm ?? 0))}`;
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
    orientationText.textContent = `${plan.seats} seats in the layout; ${plan.orientation === 'width-depth' ? 'table width runs along room width' : 'table is rotated 90 degrees'}.`;
  }
  updateDiagram(values, plan.orientation);
}

function init(): void {
  const form = document.querySelector<HTMLFormElement>('[data-dining-fitcheck-form]');
  if (!form) return;
  form.addEventListener('submit', (event) => event.preventDefault());
  const handleChange = (event: Event) => {
    if (
      (event.target instanceof HTMLInputElement && event.target.type !== 'checkbox') ||
      event.target instanceof HTMLSelectElement
    ) {
      const notice = form.querySelector<HTMLElement>('[data-fit-example-notice]');
      if (notice) notice.hidden = true;
    }
    recompute();
  };
  form.addEventListener('input', handleChange);
  form.addEventListener('change', handleChange);
  recompute();
}

init();

export {};
