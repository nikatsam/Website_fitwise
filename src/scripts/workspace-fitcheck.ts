import {
  evaluateFit,
  toDimensionDisplayRows,
  FIT_STATE_BADGE_COPY,
  type FitState,
} from '../lib/fit';
import { buildWorkspaceWidthCheck, deriveScreenDimensions } from '../lib/geometry';
import { renderWorkspaceDiagramMarkup } from '../lib/diagram';
import { formatMetric, formatFeetInches } from '../lib/units';

interface FormValues {
  deskWidthMm: number;
  deskDepthMm: number;
  monitorCount: 1 | 2;
  monitorDiagonalIn: number;
  monitorWidthOverrideMm: number | null;
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
  { id: 'desk-depth', min: 1, required: true },
  {
    id: 'monitor-width-override',
    min: 1,
    required: false,
    errorId: 'monitor-width-override-error',
  },
  { id: 'monitor-gap', min: 0, required: true, errorId: 'monitor-gap-error' },
  { id: 'side-margin', min: 0, required: true, errorId: 'side-margin-error' },
];

const MONITOR_DEPTH_MM = 200;
const DIAGRAM_ID = 'workspace-diagram';
const VIEWPORT_WIDTH_PX = 640;
const VIEWPORT_HEIGHT_PX = 360;
const DIAGRAM_PADDING_PX = 60;

function unitValueHtml(mm: number): string {
  return `<span class="unit-value"><span data-unit="metric">${formatMetric(mm)}</span><span data-unit="imperial">${formatFeetInches(mm)}</span></span>`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderDetailHtml(state: FitState, primaryLabel: string, marginMm: number): string {
  if (state === 'fits') {
    return `Fits comfortably — approximately ${unitValueHtml(marginMm)} remains on ${escapeHtml(primaryLabel)}.`;
  }
  if (state === 'tight') {
    return `It fits physically, but the recommended clearance on ${escapeHtml(primaryLabel)} is not fully met.`;
  }
  return `Does not fit — ${escapeHtml(primaryLabel)} is approximately ${unitValueHtml(Math.abs(marginMm))} over the available space.`;
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
  const monitorCount = countSelect?.value === '1' ? 1 : 2;
  const monitorDiagonalIn = Number(diagonalSelect?.value ?? '27');

  if (hasError) return null;

  return {
    deskWidthMm: values.deskWidthMm!,
    deskDepthMm: values.deskDepthMm!,
    monitorCount,
    monitorDiagonalIn,
    monitorWidthOverrideMm: values.monitorWidthOverrideMm ?? null,
    gapMm: values.gapMm!,
    sideMarginMm: values.sideMarginMm!,
  };
}

function patchUnitValue(id: string, mm: number): void {
  const el = document.getElementById(id);
  if (!el) return;
  const metric = el.querySelector<HTMLElement>('[data-unit="metric"]');
  const imperial = el.querySelector<HTMLElement>('[data-unit="imperial"]');
  if (metric) metric.textContent = formatMetric(mm);
  if (imperial) imperial.textContent = formatFeetInches(mm);
}

function recompute(): void {
  const values = readAndValidateForm();
  if (!values) return;

  let monitorWidthMm: number;
  let widthAssumption: string;
  if (values.monitorWidthOverrideMm !== null) {
    monitorWidthMm = values.monitorWidthOverrideMm;
    widthAssumption = `Monitor width: using your custom ${monitorWidthMm} mm override.`;
  } else {
    const derived = deriveScreenDimensions(values.monitorDiagonalIn, { width: 16, height: 9 });
    monitorWidthMm = Math.round(derived.screenWidthMm.valueMm);
    widthAssumption = `Monitor width: approximate screen-only width derived from a ${values.monitorDiagonalIn}" 16:9 diagonal; actual device is typically wider due to bezel. Enter an exact width below to override.`;
  }

  const configurationWidthMm =
    monitorWidthMm * values.monitorCount + values.gapMm * (values.monitorCount - 1);

  const assumptions = [
    widthAssumption,
    `Monitor depth (incl. stand) assumed at ${MONITOR_DEPTH_MM} mm.`,
    `Gap between monitors: ${values.gapMm} mm.`,
  ];

  const check = buildWorkspaceWidthCheck({
    configurationWidthMm,
    sideMarginRecommendedMm: values.sideMarginMm,
    deskWidthMm: values.deskWidthMm,
  });
  const result = evaluateFit([check], assumptions);
  const [row] = toDimensionDisplayRows([check], result);
  if (!row) return;

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
    if (detailEl) detailEl.innerHTML = renderDetailHtml(result.state, row.label, row.marginMm);
  }

  // Patch DimensionTable.
  const tableId = 'workspace-fitcheck-table';
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
      monitorDepthMm: MONITOR_DEPTH_MM,
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
