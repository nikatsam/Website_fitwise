import {
  evaluateFit,
  toDimensionDisplayRows,
  getFitStateBadgeCopy,
  getFitSummaryCopy,
  getFitSummaryResultLabel,
  renderFitSummaryContentHtml,
  buildFitReviewReport,
  type DimensionDisplayRow,
  type FitState,
} from '../lib/fit';
import { buildObjectFitPlan, type ObjectOrientation } from '../lib/geometry';
import { renderUniversalDiagramMarkup } from '../lib/diagram';
import { formatMarginMeasurement, formatMeasurement, parseLength } from '../lib/units';
import type { Locale } from '../i18n/locale';
import { translate, translateTemplate } from '../i18n/text';
import { announceFitStateChange } from '../lib/fit/summary-announcement';

const locale: Locale =
  typeof document === 'undefined'
    ? 'en'
    : document.documentElement.lang.startsWith('es')
      ? 'es'
      : 'en';

const DIAGRAM_ID = 'universal-fitcheck-diagram';

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
  if (error) error.textContent = translate(locale, message);
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
    if (quantityError)
      quantityError.textContent = translate(locale, 'Enter a whole number greater than zero.');
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
    itemName:
      (document.getElementById('fit-item-name') as HTMLInputElement).value.trim() ||
      translate(locale, 'Item'),
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

function unitHtml(mm: number, margin = false): string {
  const format = margin ? formatMarginMeasurement : formatMeasurement;
  return `<span class="unit-value"><span data-unit="metric">${format(mm, 'metric')}</span><span data-unit="separator" aria-hidden="true"> / </span><span data-unit="imperial">${format(mm, 'imperial')}</span></span>`;
}

function renderRows(rows: DimensionDisplayRow[]): void {
  const tbody = document.querySelector<HTMLTableSectionElement>('#universal-fit-table tbody');
  if (!tbody) return;
  const labels = {
    dimension: translate(locale, 'Dimension'),
    required: translate(locale, 'Required'),
    target: translate(locale, 'Target'),
    available: translate(locale, 'Available'),
    physical: translate(locale, 'Physical margin'),
    targetMargin: translate(locale, 'Target margin'),
  };
  tbody.innerHTML = rows
    .map(
      (
        row,
      ) => `<tr data-dimension="${row.dimension}" data-hard-fit="${row.hardFit}" data-recommended-fit="${row.recommendedFit}">
        <th scope="row" data-label="${labels.dimension}">${translate(locale, row.label)}</th>
        <td data-label="${labels.required}">${unitHtml(row.requiredMm)}</td>
        <td data-label="${labels.target}">${unitHtml(row.recommendedMm)}</td>
        <td data-label="${labels.available}">${unitHtml(row.availableMm)}</td>
        <td data-label="${labels.physical}"><span>${row.physicalMarginMm > 0 ? '+' : row.physicalMarginMm < 0 ? '−' : ''}</span>${unitHtml(Math.abs(row.physicalMarginMm), true)}</td>
        <td data-label="${labels.targetMargin}"><span>${row.targetMarginMm > 0 ? '+' : row.targetMarginMm < 0 ? '−' : ''}</span>${unitHtml(Math.abs(row.targetMarginMm), true)}</td>
      </tr>`,
    )
    .join('');
}

function renderSummary(state: FitState, rows: DimensionDisplayRow[]): void {
  const summary = document.getElementById('universal-fit-summary');
  if (!summary) return;
  const summaryCopy = getFitSummaryCopy(state, rows, { locale });
  const resultLabel = getFitSummaryResultLabel(summaryCopy, summary.dataset.fitOrigin);
  const previousState = summary.dataset.fitState ?? state;
  announceFitStateChange(summary, previousState, state, resultLabel);
  summary.setAttribute('data-fit-state', state);
  summary.dataset.fitExact = String(summaryCopy.isExactFit);
  summary.querySelector<HTMLElement>('[data-field="icon"]')!.textContent = getFitStateBadgeCopy(
    state,
    locale,
  ).icon;
  summary.querySelector<HTMLElement>('[data-field="label"]')!.textContent = resultLabel;
  const content = summary.querySelector<HTMLElement>('[data-fit-summary-content]');
  if (content) content.innerHTML = renderFitSummaryContentHtml(summaryCopy);
  const sticky = summary.querySelector<HTMLAnchorElement>('[data-fit-sticky]');
  if (sticky) {
    sticky.dataset.fitState = state;
    sticky.setAttribute(
      'aria-label',
      translateTemplate(locale, 'Fit result: {resultLabel}. View calculation details.', {
        resultLabel,
      }),
    );
    sticky.querySelector<HTMLElement>('[data-field="sticky-icon"]')!.textContent =
      getFitStateBadgeCopy(state, locale).icon;
    sticky.querySelector<HTMLElement>('[data-field="sticky-label"]')!.textContent = resultLabel;
    const stickyDetail = sticky.querySelector<HTMLElement>('[data-field="sticky-detail"]');
    if (stickyDetail) {
      stickyDetail.innerHTML = summaryCopy.isExactFit
        ? translate(locale, 'No measurement tolerance remains')
        : summaryCopy.marginMm !== null && summaryCopy.marginLabel
          ? `${unitHtml(summaryCopy.marginMm, true)} ${summaryCopy.marginLabel.toLowerCase()}`
          : translate(locale, 'Check result details');
    }
  }
}

function renderDiagram(
  values: NonNullable<ReturnType<typeof readForm>>,
  orientation: Exclude<ObjectOrientation, 'auto'>,
): void {
  const svg = document.querySelector<SVGSVGElement>(
    `[data-diagram-id="${DIAGRAM_ID}"] .scale-diagram__svg`,
  );
  if (!svg) return;
  const defs = svg.querySelector('defs');
  const markup = renderUniversalDiagramMarkup({
    diagramId: DIAGRAM_ID,
    spaceWidthMm: values.spaceWidthMm,
    spaceDepthMm: values.spaceDepthMm,
    objectWidthMm: values.objectWidthMm,
    objectDepthMm: values.objectDepthMm,
    clearanceEachSideMm: values.clearanceEachSideMm,
    orientation,
  });
  svg.innerHTML = '';
  if (defs) svg.appendChild(defs);
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  wrapper.innerHTML = markup;
  while (wrapper.firstChild) svg.appendChild(wrapper.firstChild);

  const orientationText = translate(
    locale,
    orientation === 'width-depth' ? 'width by depth' : 'depth by width',
  );
  const caption = document.getElementById(`${DIAGRAM_ID}-caption`);
  if (caption) {
    caption.textContent = translateTemplate(
      locale,
      'Proportional top-down comparison: {spaceWidth} by {spaceDepth} inside space and {itemWidth} by {itemDepth} item footprint, arranged {orientation}. The optional planning margin is {margin} on each side. Height, doorway/corridor and multi-item checks are not drawn here.',
      {
        spaceWidth: formatMeasurement(values.spaceWidthMm),
        spaceDepth: formatMeasurement(values.spaceDepthMm),
        itemWidth: formatMeasurement(values.objectWidthMm),
        itemDepth: formatMeasurement(values.objectDepthMm),
        orientation: orientationText,
        margin: formatMeasurement(values.clearanceEachSideMm),
      },
    );
  }
}

function recompute(): void {
  const values = readForm();
  if (!values) return;
  const plan = buildObjectFitPlan(values);
  const result = evaluateFit(plan.checks);
  const rows = toDimensionDisplayRows(plan.checks, result);
  renderDiagram(values, plan.orientation);
  renderSummary(result.state, rows);
  renderRows(rows);
  const orientation = translate(
    locale,
    plan.orientation === 'width-depth' ? 'width by depth' : 'depth by width',
  );
  const quantityOrientation = translate(
    locale,
    plan.quantityOrientation === 'width-depth' ? 'width by depth' : 'depth by width',
  );
  const orientationText = document.querySelector<HTMLElement>('[data-fit-orientation]');
  if (orientationText) {
    const quantityText =
      locale === 'es'
        ? `${plan.quantityCapacity} ${plan.quantityCapacity === 1 ? 'objeto' : 'objetos'}`
        : `${plan.quantityCapacity} item(s)`;
    orientationText.textContent = translateTemplate(
      locale,
      '{itemName}: best floor orientation is {orientation}. Estimated maximum: {quantityText} in a single layer ({grid} grid).{requested}',
      {
        itemName: values.itemName,
        orientation,
        quantityText,
        grid: quantityOrientation,
        requested:
          plan.requestedQuantity && plan.quantityCapacity < plan.requestedQuantity
            ? ` ${translateTemplate(locale, 'This is fewer than the {quantity} requested.', { quantity: plan.requestedQuantity })}`
            : '',
      },
    );
  }
  const assumptions = document.querySelector<HTMLElement>(
    '#universal-fit-assumptions [data-field="items"]',
  );
  if (assumptions) {
    assumptions.innerHTML = [
      translate(
        locale,
        'All dimensions are user-entered; the calculation does not identify a product or assume a local standard.',
      ),
      translateTemplate(
        locale,
        values.clearanceEachSideMm
          ? 'Room placement selected {orientation} orientation. A {margin} planning margin is requested on each side.'
          : 'Room placement selected {orientation} orientation. No extra clearance margin was added.',
        {
          orientation,
          margin: formatMeasurement(values.clearanceEachSideMm, 'metric'),
        },
      ),
      ...(values.doorwayWidthMm
        ? [
            translate(
              locale,
              'Access checks use the narrowest upright face and object height; no diagonal or tilted passage is modeled.',
            ),
          ]
        : []),
      translate(
        locale,
        'Quantity is a rectangular single-layer grid estimate. Stacking, irregular geometry, access lanes and obstacles are excluded.',
      ),
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
  const summary = getFitSummaryCopy(result.state, rows, { locale });
  return buildFitReviewReport({
    itemName: values.itemName,
    stateLabel: getFitSummaryResultLabel(
      summary,
      document.getElementById('universal-fit-summary')?.dataset.fitOrigin,
    ),
    objectWidthMm: values.objectWidthMm,
    objectDepthMm: values.objectDepthMm,
    objectHeightMm: values.objectHeightMm,
    spaceWidthMm: values.spaceWidthMm,
    spaceDepthMm: values.spaceDepthMm,
    spaceHeightMm: values.spaceHeightMm,
    orientation: plan.orientation,
    quantityCapacity: plan.quantityCapacity,
    summary,
    rows,
  });
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
  const handleChange = () => {
    recompute();
  };
  form.addEventListener('input', handleChange);
  form.addEventListener('change', () => {
    updateRouteVisibility();
    handleChange();
  });
  form.addEventListener('submit', (event) => event.preventDefault());
  document.querySelector('[data-copy-fit-report]')?.addEventListener('click', async () => {
    const status = document.querySelector<HTMLElement>('[data-copy-fit-status]');
    const report = createReport();
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      if (status) status.textContent = translate(locale, 'Fit review copied to clipboard.');
    } catch {
      if (status)
        status.textContent = translate(locale, 'Clipboard access is unavailable in this browser.');
    }
  });
  updateRouteVisibility();
  recompute();
}

init();

export {};
