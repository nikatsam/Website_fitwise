import {
  evaluateFit,
  toDimensionDisplayRows,
  FIT_STATE_BADGE_COPY,
  selectSummaryDimension,
  type DimensionDisplayRow,
  type FitState,
} from '../lib/fit';
import {
  buildBedRoomChecks,
  buildDoorSwingCheck,
  buildDrawerPullOutCheck,
  computeBedFootprint,
} from '../lib/geometry';
import type { BedOrientation } from '../lib/geometry';
import { renderBedroomDiagramMarkup } from '../lib/diagram';
import { formatMetric, formatFeetInches } from '../lib/units';
import {
  BEDROOM_FIT_PRESETS,
  DEFAULT_BEDROOM_FIT_PRESET_KEY,
  HEMNES_BEDSIDE_PRESET,
} from '../lib/fitcheck/presets';

interface FormValues {
  roomWidthMm: number;
  roomLengthMm: number;
  bedPresetKey: string;
  orientation: BedOrientation;
  sideClearanceMm: number;
  footClearanceMm: number;
  nightstandCount: 0 | 1 | 2;
  nightstandWidthMm: number;
  nightstandDepthMm: number;
  includeWardrobeDoor: boolean;
  wardrobeDoorLeafWidthMm: number;
  wardrobeDoorAngleDegrees: number;
  wardrobeObstacleGapMm: number | null;
  includeDresserDrawer: boolean;
  dresserDrawerPullOutMm: number;
  dresserObstacleGapMm: number | null;
}

interface FieldSpec {
  id: string;
  min: number;
  max?: number;
  required: boolean;
  errorId?: string;
}

const FIELDS: FieldSpec[] = [
  { id: 'room-width', min: 1, required: true, errorId: 'room-width-error' },
  { id: 'room-length', min: 1, required: true, errorId: 'room-length-error' },
  { id: 'side-clearance', min: 0, required: true, errorId: 'side-clearance-error' },
  { id: 'foot-clearance', min: 0, required: true, errorId: 'foot-clearance-error' },
  { id: 'nightstand-width', min: 1, required: false, errorId: 'nightstand-width-error' },
  { id: 'nightstand-depth', min: 1, required: false, errorId: 'nightstand-depth-error' },
  { id: 'wardrobe-door-width', min: 1, required: false, errorId: 'wardrobe-door-width-error' },
  {
    id: 'wardrobe-door-angle',
    min: 0,
    max: 90,
    required: false,
    errorId: 'wardrobe-door-angle-error',
  },
  { id: 'wardrobe-obstacle-gap', min: 0, required: false, errorId: 'wardrobe-obstacle-gap-error' },
  {
    id: 'dresser-drawer-pullout',
    min: 1,
    required: false,
    errorId: 'dresser-drawer-pullout-error',
  },
  { id: 'dresser-obstacle-gap', min: 0, required: false, errorId: 'dresser-obstacle-gap-error' },
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

function readAndValidateForm(): FormValues | null {
  let hasError = false;
  const values: Record<string, number> = {};
  const nightstandCount = Number(
    (document.getElementById('nightstand-count') as HTMLSelectElement | null)?.value ?? '0',
  ) as 0 | 1 | 2;
  const checkWardrobeDoor =
    (document.getElementById('check-wardrobe-door') as HTMLInputElement | null)?.checked ?? false;
  const checkDresserDrawer =
    (document.getElementById('check-dresser-drawer') as HTMLInputElement | null)?.checked ?? false;

  for (const field of FIELDS) {
    if (
      (field.id.startsWith('nightstand-') && nightstandCount === 0) ||
      (field.id.startsWith('wardrobe-') && !checkWardrobeDoor) ||
      (field.id.startsWith('dresser-') && !checkDresserDrawer)
    ) {
      clearFieldError(field);
      continue;
    }
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
    if (Number.isNaN(raw) || raw < field.min || (field.max !== undefined && raw > field.max)) {
      setFieldError(
        field,
        field.max === undefined
          ? `Enter a number of at least ${field.min}.`
          : `Enter a number from ${field.min} to ${field.max}.`,
      );
      hasError = true;
      continue;
    }
    clearFieldError(field);
    values[field.id] = raw;
  }

  const bedPresetSelect = document.getElementById('bed-preset') as HTMLSelectElement | null;
  const orientationSelect = document.getElementById('orientation') as HTMLSelectElement | null;

  const bedPresetKey = bedPresetSelect?.value ?? DEFAULT_BEDROOM_FIT_PRESET_KEY;
  const orientation: BedOrientation =
    orientationSelect?.value === 'landscape' ? 'landscape' : 'portrait';

  if (nightstandCount > 0 && values['nightstand-width'] === undefined) {
    setFieldError(
      FIELDS.find((field) => field.id === 'nightstand-width')!,
      'Enter the measured width.',
    );
    hasError = true;
  }
  if (nightstandCount > 0 && values['nightstand-depth'] === undefined) {
    setFieldError(
      FIELDS.find((field) => field.id === 'nightstand-depth')!,
      'Enter the measured depth.',
    );
    hasError = true;
  }
  if (checkWardrobeDoor && values['wardrobe-obstacle-gap'] === undefined) {
    setFieldError(
      FIELDS.find((field) => field.id === 'wardrobe-obstacle-gap')!,
      'Enter the measured gap.',
    );
    hasError = true;
  }
  if (checkWardrobeDoor && values['wardrobe-door-width'] === undefined) {
    setFieldError(
      FIELDS.find((field) => field.id === 'wardrobe-door-width')!,
      'Enter the measured door leaf width.',
    );
    hasError = true;
  }
  if (checkWardrobeDoor && values['wardrobe-door-angle'] === undefined) {
    setFieldError(
      FIELDS.find((field) => field.id === 'wardrobe-door-angle')!,
      'Enter an opening angle between 0 and 90 degrees.',
    );
    hasError = true;
  }
  if (checkDresserDrawer && values['dresser-obstacle-gap'] === undefined) {
    setFieldError(
      FIELDS.find((field) => field.id === 'dresser-obstacle-gap')!,
      'Enter the measured gap.',
    );
    hasError = true;
  }
  if (checkDresserDrawer && values['dresser-drawer-pullout'] === undefined) {
    setFieldError(
      FIELDS.find((field) => field.id === 'dresser-drawer-pullout')!,
      'Enter the measured drawer pull-out.',
    );
    hasError = true;
  }

  if (!BEDROOM_FIT_PRESETS.some((preset) => preset.key === bedPresetKey)) return null;

  if (hasError) return null;

  return {
    roomWidthMm: values['room-width']!,
    roomLengthMm: values['room-length']!,
    bedPresetKey,
    orientation,
    sideClearanceMm: values['side-clearance']!,
    footClearanceMm: values['foot-clearance']!,
    nightstandCount,
    nightstandWidthMm: values['nightstand-width'] ?? HEMNES_BEDSIDE_PRESET.overallWidthMm.valueMm,
    nightstandDepthMm: values['nightstand-depth'] ?? HEMNES_BEDSIDE_PRESET.overallDepthMm.valueMm,
    includeWardrobeDoor: checkWardrobeDoor,
    wardrobeDoorLeafWidthMm: values['wardrobe-door-width']!,
    wardrobeDoorAngleDegrees: values['wardrobe-door-angle']!,
    wardrobeObstacleGapMm: values['wardrobe-obstacle-gap'] ?? null,
    includeDresserDrawer: checkDresserDrawer,
    dresserDrawerPullOutMm: values['dresser-drawer-pullout']!,
    dresserObstacleGapMm: values['dresser-obstacle-gap'] ?? null,
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

function createDimensionUnitCell(
  row: DimensionDisplayRow,
  key: 'required' | 'recommended' | 'available' | 'margin',
): HTMLTableCellElement {
  const margin = key === 'margin';
  const valueMm = margin ? Math.abs(row.marginMm) : row[`${key}Mm`];
  const label =
    key === 'required'
      ? 'Required'
      : key === 'recommended'
        ? 'Recommended'
        : key === 'available'
          ? 'Available'
          : 'Margin';
  const cell = document.createElement('td');
  cell.dataset.label = label;
  if (margin) {
    const sign = document.createElement('span');
    sign.dataset.field = 'margin-sign';
    sign.textContent = row.marginMm < 0 ? '−' : '';
    cell.append(sign);
  }
  const unit = document.createElement('span');
  unit.className = 'unit-value';
  unit.id = `bedroom-fitcheck-table-${row.dimension}-${key}`;
  const metric = document.createElement('span');
  metric.dataset.unit = 'metric';
  metric.textContent = formatMetric(valueMm);
  const imperial = document.createElement('span');
  imperial.dataset.unit = 'imperial';
  imperial.textContent = formatFeetInches(valueMm);
  unit.append(metric, imperial);
  cell.append(unit);
  return cell;
}

function ensureDimensionRow(
  tbody: HTMLTableSectionElement,
  row: DimensionDisplayRow,
): HTMLTableRowElement {
  let tableRow = tbody.querySelector<HTMLTableRowElement>(`tr[data-dimension="${row.dimension}"]`);
  if (!tableRow) {
    tableRow = document.createElement('tr');
    tableRow.dataset.dimension = row.dimension;
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.dataset.label = 'Dimension';
    tableRow.append(
      heading,
      createDimensionUnitCell(row, 'required'),
      createDimensionUnitCell(row, 'recommended'),
      createDimensionUnitCell(row, 'available'),
      createDimensionUnitCell(row, 'margin'),
    );
    tbody.append(tableRow);
  }
  tableRow.querySelector('th[scope="row"]')!.textContent = row.label;
  tableRow.dataset.hardFit = String(row.hardFit);
  tableRow.dataset.recommendedFit = String(row.recommendedFit);
  const marginSign = tableRow.querySelector<HTMLElement>('[data-field="margin-sign"]');
  if (marginSign) marginSign.textContent = row.marginMm < 0 ? '−' : '';
  return tableRow;
}

function recompute(): void {
  const values = readAndValidateForm();
  if (!values) return;

  const preset = BEDROOM_FIT_PRESETS.find((item) => item.key === values.bedPresetKey);
  if (!preset) return;
  const frameAllowance = preset.frameAllowanceMm;
  const nightstandWidthsMm = Array.from(
    { length: values.nightstandCount },
    () => values.nightstandWidthMm,
  );

  const assumptions = [
    `Bed preset: ${preset.label}. ${preset.note}`,
    `Selected side-clearance target: ${values.sideClearanceMm} mm per side; selected FitWise foot allowance: ${values.footClearanceMm} mm. These are planning inputs, not code minimums.`,
    `Nightstands: ${values.nightstandCount}; UK HEMNES example dimensions ${values.nightstandWidthMm} x ${values.nightstandDepthMm} mm. The count and measurements can be changed.`,
    ...(values.nightstandCount > 0
      ? [
          'Tables are assumed flush beside the bed at the headboard with no gap. Their depth stays within the bed-length envelope unless greater; separate table positions/gaps are not modeled.',
        ]
      : []),
    ...(values.includeWardrobeDoor
      ? [
          `Door swing: ${values.wardrobeDoorLeafWidthMm} mm leaf at ${values.wardrobeDoorAngleDegrees} degrees; compared with your measured ${values.wardrobeObstacleGapMm} mm obstacle gap. This is collision geometry only.`,
        ]
      : []),
    ...(values.includeDresserDrawer
      ? [
          `Drawer extension: ${values.dresserDrawerPullOutMm} mm; compared with your measured ${values.dresserObstacleGapMm} mm obstacle gap. Standing space is not included.`,
        ]
      : []),
    'The scale diagram shows only the bed and bedside-table footprints; wardrobe/drawer interaction checks are listed separately, not drawn as placed furniture.',
  ];

  const roomChecks = buildBedRoomChecks({
    mattressWidthMm: preset.mattressWidthMm,
    mattressLengthMm: preset.mattressLengthMm,
    frameAllowanceMm: frameAllowance,
    orientation: values.orientation,
    sideClearanceRecommendedMm: values.sideClearanceMm,
    footClearanceRecommendedMm: values.footClearanceMm,
    nightstandWidthsMm,
    nightstandDepthMm: values.nightstandCount > 0 ? values.nightstandDepthMm : 0,
    roomWidthMm: values.roomWidthMm,
    roomLengthMm: values.roomLengthMm,
  });
  const interactionChecks = [
    ...(values.includeWardrobeDoor
      ? [
          buildDoorSwingCheck({
            doorLeafWidthMm: values.wardrobeDoorLeafWidthMm,
            openingAngleDegrees: values.wardrobeDoorAngleDegrees,
            obstacleGapMm: values.wardrobeObstacleGapMm!,
          }),
        ]
      : []),
    ...(values.includeDresserDrawer
      ? [
          buildDrawerPullOutCheck({
            drawerPullOutMm: values.dresserDrawerPullOutMm,
            obstacleGapMm: values.dresserObstacleGapMm!,
          }),
        ]
      : []),
  ];
  const checks = [...roomChecks, ...interactionChecks];
  const result = evaluateFit(checks, assumptions);
  const rows = toDimensionDisplayRows(checks, result);
  if (rows.length === 0) return;

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
      detailEl.innerHTML = renderDetailHtml(result.state, rows);
    }
  }

  // Add or remove optional collision rows when their checkboxes change.
  const tableId = 'bedroom-fitcheck-table';
  const tbody = document.querySelector<HTMLTableSectionElement>(`#${tableId} tbody`);
  if (!tbody) return;
  const activeDimensions = new Set(rows.map((row) => row.dimension));
  for (const existing of tbody.querySelectorAll<HTMLTableRowElement>('tr[data-dimension]')) {
    if (!activeDimensions.has(existing.dataset.dimension ?? '')) existing.remove();
  }
  for (const row of rows) {
    ensureDimensionRow(tbody, row);
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
  const footprint = computeBedFootprint(
    preset.mattressWidthMm,
    preset.mattressLengthMm,
    frameAllowance,
  );

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
      bedFootprintWidthMm: footprint.widthMm,
      bedFootprintLengthMm: footprint.lengthMm,
      orientation: values.orientation,
      sideClearanceMm: values.sideClearanceMm,
      footClearanceMm: values.footClearanceMm,
      nightstandWidthsMm,
      nightstandDepthMm: values.nightstandCount > 0 ? values.nightstandDepthMm : 0,
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

function updateFurnitureFieldVisibility(): void {
  const wardrobeEnabled =
    (document.getElementById('check-wardrobe-door') as HTMLInputElement | null)?.checked ?? false;
  const dresserEnabled =
    (document.getElementById('check-dresser-drawer') as HTMLInputElement | null)?.checked ?? false;
  const wardrobeFields = document.querySelector<HTMLElement>('[data-wardrobe-fields]');
  const dresserFields = document.querySelector<HTMLElement>('[data-dresser-fields]');
  if (wardrobeFields) wardrobeFields.hidden = !wardrobeEnabled;
  if (dresserFields) dresserFields.hidden = !dresserEnabled;
}

function initBedroomFitCheck(): void {
  const form = document.querySelector('[data-bedroom-fitcheck-form]');
  if (!form) return;

  updateFurnitureFieldVisibility();
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', recompute);
  form.addEventListener('change', () => {
    updateFurnitureFieldVisibility();
    recompute();
  });
}

initBedroomFitCheck();

export {};
