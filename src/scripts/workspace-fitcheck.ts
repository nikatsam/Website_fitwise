import {
  evaluateFit,
  toDimensionDisplayRows,
  FIT_STATE_BADGE_COPY,
  selectSummaryDimension,
  type DimensionDisplayRow,
  type FitState,
} from '../lib/fit';
import {
  buildWorkspaceConfigurationCheck,
  buildWorkspaceDepthCheck,
  deriveScreenDimensions,
  MAX_SIDE_BY_SIDE_MONITORS,
  MONITOR_ASPECT_RATIOS,
  type MonitorAspectRatioKey,
} from '../lib/geometry';
import { renderWorkspaceDiagramMarkup } from '../lib/diagram';
import { formatMeasurement } from '../lib/units';

interface FormValues {
  deskWidthMm: number;
  deskDepthMm: number;
  monitorCount: number;
  monitorDiagonalIn: number;
  monitorAspectRatio: MonitorAspectRatioKey;
  monitorWidthOverrideMm: number | null;
  monitorStandDepthMm: number;
  rearCableClearanceMm: number;
  keyboardZoneMm: number;
  gapMm: number;
  sideMarginMm: number;
}

interface FieldSpec {
  id: string;
  min: number;
  required: boolean;
  errorId?: string;
}

const FIELDS: FieldSpec[] = [
  { id: 'desk-width', min: 1, required: true, errorId: 'desk-width-error' },
  { id: 'desk-depth', min: 1, required: true, errorId: 'desk-depth-error' },
  { id: 'monitor-depth', min: 1, required: true, errorId: 'monitor-depth-error' },
  { id: 'rear-cable-clearance', min: 0, required: true, errorId: 'rear-cable-clearance-error' },
  { id: 'keyboard-zone', min: 0, required: true, errorId: 'keyboard-zone-error' },
  {
    id: 'monitor-width-override',
    min: 1,
    required: false,
    errorId: 'monitor-width-override-error',
  },
  { id: 'monitor-gap', min: 0, required: true, errorId: 'monitor-gap-error' },
  { id: 'side-margin', min: 0, required: true, errorId: 'side-margin-error' },
];

const DIAGRAM_ID = 'workspace-diagram';
const VIEWPORT_WIDTH_PX = 640;
const VIEWPORT_HEIGHT_PX = 360;
const DIAGRAM_PADDING_PX = 60;

function unitValueHtml(mm: number): string {
  return `<span class="unit-value"><span data-unit="metric">${formatMeasurement(mm, 'metric')}</span> <span data-unit="imperial">${formatMeasurement(mm, 'imperial')}</span></span>`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderDetailHtml(state: FitState, rows: DimensionDisplayRow[]): string {
  const primary = selectSummaryDimension(rows);
  if (!primary) return '';
  if (state === 'fits') {
    return `Fits the selected dimensions — approximately ${unitValueHtml(primary.marginMm)} remains on ${escapeHtml(primary.label)}.`;
  }
  if (state === 'tight') {
    const failures = rows.filter((row) => !row.recommendedFit).map((row) => escapeHtml(row.label));
    return `The physical footprints fit, but selected clearance targets are short on ${failures.join(', ')}. See the table for margins.`;
  }
  const failures = rows.filter((row) => !row.hardFit).map((row) => escapeHtml(row.label));
  return `Does not fit — available space is short for ${failures.join(', ')}. See the table for each dimension's margin.`;
}

function clearFieldError(field: FieldSpec): void {
  const input = document.getElementById(field.id);
  const errorEl = field.errorId ? document.getElementById(field.errorId) : null;
  input?.removeAttribute('aria-invalid');
  if (errorEl) errorEl.textContent = '';
}

function setFieldError(field: FieldSpec, message: string): void {
  const input = document.getElementById(field.id);
  const errorEl = field.errorId ? document.getElementById(field.errorId) : null;
  input?.setAttribute('aria-invalid', 'true');
  if (errorEl) errorEl.textContent = message;
}

function readNumber(id: string): number | null {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input || input.value.trim() === '') return null;
  const value = Number(input.value);
  return Number.isFinite(value) ? value : NaN;
}

/** Validates every field, writing inline errors, and returns parsed values or null if any field is invalid. */
function readAndValidateForm(): FormValues | null {
  let hasError = false;

  const values: Partial<FormValues> = {};

  for (const field of FIELDS) {
    const raw = readNumber(field.id);
    if (raw === null) {
      if (field.required) {
        setFieldError(field, 'Enter a value.');
        hasError = true;
      } else {
        clearFieldError(field);
      }
      continue;
    }
    if (Number.isNaN(raw) || raw < field.min) {
      setFieldError(field, `Enter a number of at least ${field.min}.`);
      hasError = true;
      continue;
    }
    clearFieldError(field);

    switch (field.id) {
      case 'desk-width':
        values.deskWidthMm = raw;
        break;
      case 'desk-depth':
        values.deskDepthMm = raw;
        break;
      case 'monitor-depth':
        values.monitorStandDepthMm = raw;
        break;
      case 'rear-cable-clearance':
        values.rearCableClearanceMm = raw;
        break;
      case 'keyboard-zone':
        values.keyboardZoneMm = raw;
        break;
      case 'monitor-width-override':
        values.monitorWidthOverrideMm = raw;
        break;
      case 'monitor-gap':
        values.gapMm = raw;
        break;
      case 'side-margin':
        values.sideMarginMm = raw;
        break;
    }
  }

  const countSelect = document.getElementById('monitor-count') as HTMLSelectElement | null;
  const diagonalSelect = document.getElementById('monitor-diagonal') as HTMLSelectElement | null;
  const aspectSelect = document.getElementById('monitor-aspect-ratio') as HTMLSelectElement | null;
  const monitorCount = Number(countSelect?.value ?? '2');
  const monitorDiagonalIn = Number(diagonalSelect?.value ?? '27');
  const aspectKey = (aspectSelect?.value ?? '16:9') as MonitorAspectRatioKey;
  if (
    !Number.isInteger(monitorCount) ||
    monitorCount < 1 ||
    monitorCount > MAX_SIDE_BY_SIDE_MONITORS ||
    !Object.hasOwn(MONITOR_ASPECT_RATIOS, aspectKey)
  ) {
    return null;
  }

  if (hasError) return null;

  return {
    deskWidthMm: values.deskWidthMm!,
    deskDepthMm: values.deskDepthMm!,
    monitorCount,
    monitorDiagonalIn,
    monitorAspectRatio: aspectKey,
    monitorWidthOverrideMm: values.monitorWidthOverrideMm ?? null,
    monitorStandDepthMm: values.monitorStandDepthMm!,
    rearCableClearanceMm: values.rearCableClearanceMm!,
    keyboardZoneMm: values.keyboardZoneMm!,
    gapMm: values.gapMm!,
    sideMarginMm: values.sideMarginMm!,
  };
}

function patchUnitValue(id: string, mm: number): void {
  const el = document.getElementById(id);
  if (!el) return;
  const metric = el.querySelector<HTMLElement>('[data-unit="metric"]');
  const imperial = el.querySelector<HTMLElement>('[data-unit="imperial"]');
  if (metric) metric.textContent = formatMeasurement(mm, 'metric');
  if (imperial) imperial.textContent = formatMeasurement(mm, 'imperial');
}

function recompute(): void {
  const values = readAndValidateForm();
  if (!values) return;

  let monitorWidthMm: number;
  let widthAssumption: string;
  if (values.monitorWidthOverrideMm !== null) {
    monitorWidthMm = values.monitorWidthOverrideMm;
    widthAssumption = `Monitor width: using your custom ${formatMeasurement(monitorWidthMm)} override.`;
  } else {
    const derived = deriveScreenDimensions(
      values.monitorDiagonalIn,
      MONITOR_ASPECT_RATIOS[values.monitorAspectRatio],
    );
    monitorWidthMm = Math.round(derived.screenWidthMm.valueMm);
    widthAssumption = `Monitor width: approximate screen-only width derived from a ${values.monitorDiagonalIn}" ${values.monitorAspectRatio} diagonal and rounded to the nearest millimetre; actual device is typically wider due to bezel. Enter an exact overall width below to override.`;
  }

  const assumptions = [
    widthAssumption,
    `Monitor stand/base depth: ${formatMeasurement(values.monitorStandDepthMm)}; replace this initial example with the actual model depth.`,
    `Rear cable/vent clearance: ${formatMeasurement(values.rearCableClearanceMm)}. Zero means it is excluded.`,
    `Keyboard/mouse zone: ${formatMeasurement(values.keyboardZoneMm)}, selected by you. Zero means it is excluded.`,
    'Eye-to-screen viewing distance is separate from desk surface depth and is not added to this envelope.',
    `Gap between monitors: ${formatMeasurement(values.gapMm)}.`,
  ];

  const { check: widthCheck } = buildWorkspaceConfigurationCheck({
    widthsMm: Array.from({ length: values.monitorCount }, () => monitorWidthMm),
    gapMm: values.gapMm,
    sideMarginRecommendedMm: values.sideMarginMm,
    deskWidthMm: values.deskWidthMm,
  });
  const depthCheck = buildWorkspaceDepthCheck({
    monitorStandDepthMm: values.monitorStandDepthMm,
    rearClearanceMm: values.rearCableClearanceMm,
    keyboardZoneMm: values.keyboardZoneMm,
    deskDepthMm: values.deskDepthMm,
  });
  const checks = [widthCheck, depthCheck];
  const result = evaluateFit(checks, assumptions);
  const rows = toDimensionDisplayRows(checks, result);
  if (rows.length === 0) return;
  const summaryRow = selectSummaryDimension(rows);
  if (!summaryRow) return;

  // Patch FitSummary.
  const summaryEl = document.getElementById('workspace-fitcheck-summary');
  if (summaryEl) {
    summaryEl.setAttribute('data-fit-state', result.state);
    const copy = FIT_STATE_BADGE_COPY[result.state];
    const iconEl = summaryEl.querySelector<HTMLElement>('[data-field="icon"]');
    const labelEl = summaryEl.querySelector<HTMLElement>('[data-field="label"]');
    const detailEl = summaryEl.querySelector<HTMLElement>('[data-field="detail"]');
    if (iconEl) iconEl.textContent = copy.icon;
    if (labelEl) labelEl.textContent = copy.label;
    if (detailEl) detailEl.innerHTML = renderDetailHtml(result.state, rows);
  }

  // Patch DimensionTable.
  const tableId = 'workspace-fitcheck-table';
  for (const row of rows) {
    const tr = document.querySelector(`#${tableId} tbody tr[data-dimension="${row.dimension}"]`);
    if (tr) {
      tr.setAttribute('data-hard-fit', String(row.hardFit));
      tr.setAttribute('data-recommended-fit', String(row.recommendedFit));
      const signEl = tr.querySelector<HTMLElement>('[data-field="margin-sign"]');
      if (signEl) signEl.textContent = row.marginMm < 0 ? '−' : '';
    }
    patchUnitValue(`${tableId}-${row.dimension}-required`, row.requiredMm);
    patchUnitValue(`${tableId}-${row.dimension}-recommended`, row.recommendedMm);
    patchUnitValue(`${tableId}-${row.dimension}-available`, row.availableMm);
    patchUnitValue(`${tableId}-${row.dimension}-margin`, Math.abs(row.marginMm));
  }

  // Patch assumptions.
  const assumptionsList = document.querySelector(
    '#workspace-fitcheck-assumptions [data-field="items"]',
  );
  if (assumptionsList) {
    assumptionsList.innerHTML = assumptions.map((a) => `<li>${escapeHtml(a)}</li>`).join('');
  }

  // Patch diagram.
  const diagramContainer = document.querySelector(
    `[data-diagram-id="${DIAGRAM_ID}"] .scale-diagram__svg`,
  );
  if (diagramContainer) {
    const defs = diagramContainer.querySelector('defs');
    const markup = renderWorkspaceDiagramMarkup({
      diagramId: DIAGRAM_ID,
      viewportWidthPx: VIEWPORT_WIDTH_PX,
      viewportHeightPx: VIEWPORT_HEIGHT_PX,
      paddingPx: DIAGRAM_PADDING_PX,
      deskWidthMm: values.deskWidthMm,
      deskDepthMm: values.deskDepthMm,
      monitorWidthMm,
      monitorDepthMm: values.monitorStandDepthMm,
      monitorCount: values.monitorCount,
      gapMm: values.gapMm,
      sideMarginMm: values.sideMarginMm,
    });
    diagramContainer.innerHTML = '';
    if (defs) diagramContainer.appendChild(defs);
    const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wrapper.innerHTML = markup;
    while (wrapper.firstChild) {
      diagramContainer.appendChild(wrapper.firstChild);
    }
  }
}

function initWorkspaceFitCheck(): void {
  const form = document.querySelector('[data-workspace-fitcheck-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', recompute);
  form.addEventListener('change', recompute);
}

initWorkspaceFitCheck();

export {};
