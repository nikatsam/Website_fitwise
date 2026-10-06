import {
  evaluateFit,
  toDimensionDisplayRows,
  FIT_STATE_BADGE_COPY,
  type FitState,
} from '../lib/fit';
import { buildBedRoomChecks, applyOrientation, computeBedFootprint } from '../lib/geometry';
import type { BedOrientation } from '../lib/geometry';
import { renderBedroomDiagramMarkup } from '../lib/diagram';
import { formatMetric, formatFeetInches } from '../lib/units';

const BED_PRESETS: Record<string, { label: string; widthMm: number; lengthMm: number }> = {
  'uk-double': { label: 'UK Double', widthMm: 1350, lengthMm: 1900 },
  'uk-king': { label: 'UK King', widthMm: 1500, lengthMm: 2000 },
  'us-queen': { label: 'US Queen', widthMm: 1530, lengthMm: 2030 },
  'us-king': { label: 'US King', widthMm: 1930, lengthMm: 2030 },
};

interface FormValues {
  roomWidthMm: number;
  roomLengthMm: number;
  bedPresetKey: string;
  orientation: BedOrientation;
  frameAllowanceMm: number;
  sideClearanceMm: number;
  footClearanceMm: number;
  nightstandCount: 0 | 1 | 2;
  nightstandWidthMm: number;
}

interface FieldSpec {
  id: string;
  min: number;
  required: boolean;
  errorId?: string;
}

const FIELDS: FieldSpec[] = [
  { id: 'room-width', min: 1, required: true, errorId: 'room-width-error' },
  { id: 'room-length', min: 1, required: true, errorId: 'room-length-error' },
  { id: 'frame-allowance', min: 0, required: true, errorId: 'frame-allowance-error' },
  { id: 'side-clearance', min: 0, required: true, errorId: 'side-clearance-error' },
  { id: 'foot-clearance', min: 0, required: true, errorId: 'foot-clearance-error' },
  { id: 'nightstand-width', min: 1, required: true, errorId: 'nightstand-width-error' },
];

const DIAGRAM_ID = 'bedroom-diagram';
const VIEWPORT_WIDTH_PX = 640;
const VIEWPORT_HEIGHT_PX = 480;
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

function readAndValidateForm(): FormValues | null {
  let hasError = false;
  const values: Record<string, number> = {};

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
    values[field.id] = raw;
  }

  const bedPresetSelect = document.getElementById('bed-preset') as HTMLSelectElement | null;
  const orientationSelect = document.getElementById('orientation') as HTMLSelectElement | null;
  const nightstandCountSelect = document.getElementById(
    'nightstand-count',
  ) as HTMLSelectElement | null;

  const bedPresetKey = bedPresetSelect?.value ?? 'uk-king';
  const orientation: BedOrientation =
    orientationSelect?.value === 'landscape' ? 'landscape' : 'portrait';
  const nightstandCount = Number(nightstandCountSelect?.value ?? '0') as 0 | 1 | 2;

  if (hasError) return null;

  return {
    roomWidthMm: values['room-width']!,
    roomLengthMm: values['room-length']!,
    bedPresetKey,
    orientation,
    frameAllowanceMm: values['frame-allowance']!,
    sideClearanceMm: values['side-clearance']!,
    footClearanceMm: values['foot-clearance']!,
    nightstandCount,
    nightstandWidthMm: values['nightstand-width']!,
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

  const preset = BED_PRESETS[values.bedPresetKey] ?? BED_PRESETS['uk-king']!;
  const frameAllowance = {
    left: values.frameAllowanceMm,
    right: values.frameAllowanceMm,
    head: values.frameAllowanceMm,
    foot: values.frameAllowanceMm,
  };
  const nightstandWidthsMm = Array.from(
    { length: values.nightstandCount },
    () => values.nightstandWidthMm,
  );

  const assumptions = [
    `Bed size: ${preset.label} — a typical nominal mattress size, not a specific product. Actual products vary slightly.`,
    `Frame allowance: ${values.frameAllowanceMm} mm on every side (frame overhang beyond the mattress).`,
    `Recommended clearance: ${values.sideClearanceMm} mm each side, ${values.footClearanceMm} mm at the foot of the bed. Adjust to taste.`,
  ];

  const checks = buildBedRoomChecks({
    mattressWidthMm: preset.widthMm,
    mattressLengthMm: preset.lengthMm,
    frameAllowanceMm: frameAllowance,
    orientation: values.orientation,
    sideClearanceRecommendedMm: values.sideClearanceMm,
    footClearanceRecommendedMm: values.footClearanceMm,
    nightstandWidthsMm,
    roomWidthMm: values.roomWidthMm,
    roomLengthMm: values.roomLengthMm,
  });
  const result = evaluateFit(checks, assumptions);
  const rows = toDimensionDisplayRows(checks, result);
  const primaryRow = rows.find((r) => r.dimension === 'room_width') ?? rows[0];
  if (!primaryRow) return;

  // Patch FitSummary.
  const summaryEl = document.getElementById('bedroom-fitcheck-summary');
  if (summaryEl) {
    summaryEl.setAttribute('data-fit-state', result.state);
    const copy = FIT_STATE_BADGE_COPY[result.state];
    const iconEl = summaryEl.querySelector<HTMLElement>('[data-field="icon"]');
    const labelEl = summaryEl.querySelector<HTMLElement>('[data-field="label"]');
    const detailEl = summaryEl.querySelector<HTMLElement>('[data-field="detail"]');
    if (iconEl) iconEl.textContent = copy.icon;
    if (labelEl) labelEl.textContent = copy.label;
    if (detailEl) {
      detailEl.innerHTML = renderDetailHtml(result.state, primaryRow.label, primaryRow.marginMm);
    }
  }

  // Patch DimensionTable (both room_width and room_length rows).
  const tableId = 'bedroom-fitcheck-table';
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
    '#bedroom-fitcheck-assumptions [data-field="items"]',
  );
  if (assumptionsList) {
    assumptionsList.innerHTML = assumptions.map((a) => `<li>${escapeHtml(a)}</li>`).join('');
  }

  // Patch diagram.
  const footprint = computeBedFootprint(preset.widthMm, preset.lengthMm, frameAllowance);
  const nightstandTotalMm = nightstandWidthsMm.reduce((sum, w) => sum + w, 0);
  const footprintWithNightstands = {
    widthMm: footprint.widthMm + nightstandTotalMm,
    lengthMm: footprint.lengthMm,
  };
  const oriented = applyOrientation(footprintWithNightstands, values.orientation);

  const diagramContainer = document.querySelector(
    `[data-diagram-id="${DIAGRAM_ID}"] .scale-diagram__svg`,
  );
  if (diagramContainer) {
    const defs = diagramContainer.querySelector('defs');
    const markup = renderBedroomDiagramMarkup({
      diagramId: DIAGRAM_ID,
      viewportWidthPx: VIEWPORT_WIDTH_PX,
      viewportHeightPx: VIEWPORT_HEIGHT_PX,
      paddingPx: DIAGRAM_PADDING_PX,
      roomWidthMm: values.roomWidthMm,
      roomLengthMm: values.roomLengthMm,
      bedRoomWidthMm: oriented.roomWidthRequiredMm,
      bedRoomLengthMm: oriented.roomLengthRequiredMm,
      sideClearanceMm: values.sideClearanceMm,
      footClearanceMm: values.footClearanceMm,
      nightstandWidthsMm,
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

function initBedroomFitCheck(): void {
  const form = document.querySelector('[data-bedroom-fitcheck-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', recompute);
  form.addEventListener('change', recompute);
}

initBedroomFitCheck();

export {};
