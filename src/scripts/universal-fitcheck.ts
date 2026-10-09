import {
  evaluateFit,
  toDimensionDisplayRows,
  FIT_STATE_BADGE_COPY,
  selectSummaryDimension,
  type DimensionDisplayRow,
} from '../lib/fit';
import { buildObjectFitPlan, type ObjectOrientation } from '../lib/geometry';
import { formatFeetInches, formatMetric, parseLength } from '../lib/units';

type LengthField =
  | 'fit-item-width'
  | 'fit-item-depth'
  | 'fit-item-height'
  | 'fit-space-width'
  | 'fit-space-depth'
  | 'fit-space-height'
  | 'fit-clearance'
  | 'fit-door-width'
  | 'fit-door-height'
  | 'fit-corridor-width'
  | 'fit-item-gap';

function setError(id: string, message: string): void {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  input?.setAttribute('aria-invalid', 'true');
  if (error) error.textContent = message;
}

function clearError(id: string): void {
  document.getElementById(id)?.removeAttribute('aria-invalid');
  const error = document.getElementById(`${id}-error`);
  if (error) error.textContent = '';
}

function readLength(id: LengthField, required = true): number | null | undefined {
  const input = document.getElementById(id) as HTMLInputElement | null;
  const value = input?.value.trim() ?? '';
  if (!value) {
    if (required) {
      setError(id, 'Enter a dimension with a unit, such as 80 cm or 31.5 in.');
      return undefined;
    }
    clearError(id);
    return null;
  }
  const parsed = parseLength(value);
  if (!parsed.ok || (required && parsed.valueMm <= 0)) {
    setError(id, parsed.ok ? 'Enter a value greater than zero.' : parsed.error);
    return undefined;
  }
  clearError(id);
  return parsed.valueMm;
}

function readForm() {
  const routeEnabled = (document.getElementById('fit-check-route') as HTMLInputElement).checked;
  const ids: LengthField[] = [
    'fit-item-width',
    'fit-item-depth',
    'fit-item-height',
    'fit-space-width',
    'fit-space-depth',
    'fit-space-height',
    'fit-clearance',
    ...(routeEnabled ? (['fit-door-width', 'fit-door-height', 'fit-corridor-width'] as const) : []),
    'fit-item-gap',
  ];
  const values = new Map<LengthField, number | null>();
  let invalid = false;
  for (const id of ids) {
    const optional = id === 'fit-clearance' || id === 'fit-item-gap';
    const value = readLength(id, !optional);
    if (value === undefined) invalid = true;
    else values.set(id, value);
  }

  const quantityInput = document.getElementById('fit-quantity') as HTMLInputElement;
  const requestedQuantity = Number(quantityInput.value);
  const quantityError = document.getElementById('fit-quantity-error');
  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    quantityInput.setAttribute('aria-invalid', 'true');
    if (quantityError) quantityError.textContent = 'Enter a whole number greater than zero.';
    invalid = true;
  } else {
    quantityInput.removeAttribute('aria-invalid');
    if (quantityError) quantityError.textContent = '';
  }

  if (invalid) return null;
  const get = (id: LengthField) => values.get(id) ?? 0;
  const route = routeEnabled
    ? {
        doorwayWidthMm: get('fit-door-width'),
        doorwayHeightMm: get('fit-door-height'),
        corridorWidthMm: get('fit-corridor-width'),
      }
    : {};
  return {
    itemName: (document.getElementById('fit-item-name') as HTMLInputElement).value.trim() || 'Item',
    objectWidthMm: get('fit-item-width'),
    objectDepthMm: get('fit-item-depth'),
    objectHeightMm: get('fit-item-height'),
    spaceWidthMm: get('fit-space-width'),
    spaceDepthMm: get('fit-space-depth'),
    spaceHeightMm: get('fit-space-height'),
    clearanceEachSideMm: get('fit-clearance'),
    orientation: (document.getElementById('fit-orientation') as HTMLSelectElement)
      .value as ObjectOrientation,
    requestedQuantity,
    itemGapMm: get('fit-item-gap'),
    ...route,
  };
}

function unitHtml(mm: number): string {
  return `<span class="unit-value"><span data-unit="metric">${formatMetric(mm)}</span> <span data-unit="imperial">${formatFeetInches(mm)}</span></span>`;
}

function renderRows(rows: DimensionDisplayRow[]): void {
  const tbody = document.querySelector<HTMLTableSectionElement>('#universal-fit-table tbody');
  if (!tbody) return;
  tbody.innerHTML = rows
    .map(
      (
        row,
      ) => `<tr data-dimension="${row.dimension}" data-hard-fit="${row.hardFit}" data-recommended-fit="${row.recommendedFit}">
        <th scope="row" data-label="Dimension">${row.label}</th>
        <td data-label="Required">${unitHtml(row.requiredMm)}</td>
        <td data-label="Recommended">${unitHtml(row.recommendedMm)}</td>
        <td data-label="Available">${unitHtml(row.availableMm)}</td>
        <td data-label="Margin"><span data-field="margin-sign">${row.marginMm < 0 ? '−' : ''}</span>${unitHtml(Math.abs(row.marginMm))}</td>
      </tr>`,
    )
    .join('');
}

function renderSummary(
  state: 'fits' | 'tight' | 'does_not_fit',
  rows: DimensionDisplayRow[],
): void {
  const summary = document.getElementById('universal-fit-summary');
  if (!summary) return;
  const primary = selectSummaryDimension(rows);
  const failures = rows
    .filter((row) => (state === 'does_not_fit' ? !row.hardFit : !row.recommendedFit))
    .map((row) => row.label);
  let detail = 'Fits all checked dimensions.';
  if (state === 'fits' && primary) {
    detail = `Fits the selected dimensions — approximately ${unitHtml(Math.max(0, primary.marginMm))} remains on ${primary.label}.`;
  } else if (state === 'tight') {
    detail = `Physical dimensions fit, but selected clearance targets are short on ${failures.join(', ')}.`;
  } else if (state === 'does_not_fit') {
    detail = `Does not fit the checked dimensions: ${failures.join(', ')}.`;
  }
  summary.setAttribute('data-fit-state', state);
  summary.querySelector<HTMLElement>('[data-field="icon"]')!.textContent =
    FIT_STATE_BADGE_COPY[state].icon;
  summary.querySelector<HTMLElement>('[data-field="label"]')!.textContent =
    FIT_STATE_BADGE_COPY[state].label;
  summary.querySelector<HTMLElement>('[data-field="detail"]')!.innerHTML = detail;
}

function recompute(): void {
  const values = readForm();
  if (!values) return;
  const plan = buildObjectFitPlan(values);
  const result = evaluateFit(plan.checks);
  const rows = toDimensionDisplayRows(plan.checks, result);
  renderSummary(result.state, rows);
  renderRows(rows);
  const orientation = plan.orientation === 'width-depth' ? 'width by depth' : 'depth by width';
  const orientationText = document.querySelector<HTMLElement>('[data-fit-orientation]');
  if (orientationText) {
    orientationText.textContent = `${values.itemName}: best floor orientation is ${orientation}. Estimated maximum: ${plan.quantityCapacity} item(s) in a single layer (${plan.quantityOrientation === 'width-depth' ? 'width by depth' : 'depth by width'} grid).${plan.requestedQuantity && plan.quantityCapacity < plan.requestedQuantity ? ` This is fewer than the ${plan.requestedQuantity} requested.` : ''}`;
  }
  const assumptions = document.querySelector<HTMLElement>(
    '#universal-fit-assumptions [data-field="items"]',
  );
  if (assumptions) {
    assumptions.innerHTML = [
      'All dimensions are user-entered; the calculation does not identify a product or assume a local standard.',
      `Room placement selected ${orientation} orientation. ${values.clearanceEachSideMm ? `A ${formatMetric(values.clearanceEachSideMm)} planning margin is requested on each side.` : 'No extra clearance margin was added.'}`,
      ...(values.doorwayWidthMm
        ? [
            'Access checks use the narrowest upright face and object height; no diagonal or tilted passage is modeled.',
          ]
        : []),
      'Quantity is a rectangular single-layer grid estimate. Stacking, irregular geometry, access lanes and obstacles are excluded.',
    ]
      .map((item) => `<li>${item}</li>`)
      .join('');
  }
}

function createReport(): string {
  const values = readForm();
  if (!values) return '';
  const plan = buildObjectFitPlan(values);
  const result = evaluateFit(plan.checks);
  const rows = toDimensionDisplayRows(plan.checks, result);
  return [
    `Fitwise review: ${values.itemName}`,
    `Result: ${FIT_STATE_BADGE_COPY[result.state].label}`,
    `Item: ${formatMetric(values.objectWidthMm)} / ${formatFeetInches(values.objectWidthMm)} W × ${formatMetric(values.objectDepthMm)} / ${formatFeetInches(values.objectDepthMm)} D × ${formatMetric(values.objectHeightMm)} / ${formatFeetInches(values.objectHeightMm)} H`,
    `Space: ${formatMetric(values.spaceWidthMm)} / ${formatFeetInches(values.spaceWidthMm)} W × ${formatMetric(values.spaceDepthMm)} / ${formatFeetInches(values.spaceDepthMm)} D × ${formatMetric(values.spaceHeightMm)} / ${formatFeetInches(values.spaceHeightMm)} H`,
    `Best floor orientation: ${plan.orientation}; estimated single-layer capacity: ${plan.quantityCapacity}`,
    ...rows.map(
      (row) =>
        `${row.label}: ${row.marginMm < 0 ? 'short by' : 'spare'} ${formatMetric(Math.abs(row.marginMm))} / ${formatFeetInches(Math.abs(row.marginMm))}`,
    ),
    'Screening estimate only; verify measurements and access route on site.',
  ].join('\n');
}

function init(): void {
  const form = document.querySelector<HTMLFormElement>('[data-universal-fitcheck-form]');
  if (!form) return;
  const routeToggle = document.getElementById('fit-check-route') as HTMLInputElement;
  const routeFields = document.querySelector<HTMLElement>('[data-fit-route-fields]');
  const updateRouteVisibility = () => {
    if (routeFields) routeFields.hidden = !routeToggle.checked;
    if (!routeToggle.checked) {
      clearError('fit-door-width');
      clearError('fit-door-height');
      clearError('fit-corridor-width');
    }
  };
  form.addEventListener('input', recompute);
  form.addEventListener('change', () => {
    updateRouteVisibility();
    recompute();
  });
  form.addEventListener('submit', (event) => event.preventDefault());
  document.querySelector('[data-copy-fit-report]')?.addEventListener('click', async () => {
    const status = document.querySelector<HTMLElement>('[data-copy-fit-status]');
    const report = createReport();
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      if (status) status.textContent = 'Fit review copied to clipboard.';
    } catch {
      if (status) status.textContent = 'Clipboard access is unavailable in this browser.';
    }
  });
  updateRouteVisibility();
  recompute();
}

init();

export {};
