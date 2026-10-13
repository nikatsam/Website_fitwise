import {
  evaluateFit,
  toDimensionDisplayRows,
  FIT_STATE_BADGE_COPY,
  getFitSummaryCopy,
  getFitSummaryResultLabel,
  renderFitSummaryContentHtml,
  type DimensionDisplayRow,
  type FitState,
} from '../lib/fit';
import { buildRugFitPlan, type RugCoverageMode, type RugOrientation } from '../lib/geometry';
import { renderRugDiagramMarkup } from '../lib/diagram';
import { formatMarginMeasurement, formatMeasurement, parseLength } from '../lib/units';

const DIAGRAM_ID = 'rug-fitcheck-diagram';

type LengthField =
  | 'rug-room-width'
  | 'rug-room-depth'
  | 'rug-width'
  | 'rug-depth'
  | 'rug-wall-gap'
  | 'rug-furniture-width'
  | 'rug-furniture-depth'
  | 'rug-furniture-margin'
  | 'rug-front-overlap'
  | 'rug-front-extension';

interface RugFormValues {
  roomWidthMm: number;
  roomDepthMm: number;
  rugWidthMm: number;
  rugDepthMm: number;
  wallGapEachSideMm: number;
  orientation: RugOrientation;
  checkFurniture: boolean;
  coverageMode: RugCoverageMode;
  furnitureWidthMm?: number;
  furnitureDepthMm?: number;
  furnitureMarginEachSideMm: number;
  frontOverlapMm?: number;
  frontExtensionMm?: number;
}

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

function readLength(id: LengthField, required: boolean): number | null | undefined {
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
  if (!parsed.ok || (required && parsed.valueMm <= 0) || (!required && parsed.valueMm < 0)) {
    setError(
      id,
      parsed.ok
        ? required
          ? 'Enter a value greater than zero.'
          : 'Enter zero or a positive value.'
        : parsed.error,
    );
    return undefined;
  }
  clearError(id);
  return parsed.valueMm;
}

function updateConditionalFields(): void {
  const checkFurniture = (document.getElementById('rug-check-furniture') as HTMLInputElement)
    .checked;
  const mode = (document.getElementById('rug-coverage-mode') as HTMLSelectElement)
    .value as RugCoverageMode;
  const controls = document.querySelector<HTMLElement>('[data-rug-furniture-controls]');
  const frontFields = document.querySelector<HTMLElement>('[data-rug-front-fields]');
  const marginLabel = document.getElementById('rug-furniture-margin-label');
  if (controls) controls.hidden = !checkFurniture;
  if (frontFields) frontFields.hidden = !checkFurniture || mode !== 'front-edge';
  if (marginLabel) {
    marginLabel.textContent =
      mode === 'front-edge'
        ? 'Extra side margin beside furniture width (optional)'
        : 'Extra rug border around the full footprint (optional)';
  }
}

function readForm(): RugFormValues | null {
  const checkFurniture = (document.getElementById('rug-check-furniture') as HTMLInputElement)
    .checked;
  const coverageMode = (document.getElementById('rug-coverage-mode') as HTMLSelectElement)
    .value as RugCoverageMode;
  const orientation = (document.getElementById('rug-orientation') as HTMLSelectElement)
    .value as RugOrientation;
  const fieldIds: Array<[LengthField, boolean]> = [
    ['rug-room-width', true],
    ['rug-room-depth', true],
    ['rug-width', true],
    ['rug-depth', true],
    ['rug-wall-gap', false],
  ];
  if (checkFurniture) {
    fieldIds.push(
      ['rug-furniture-width', true],
      ['rug-furniture-depth', true],
      ['rug-furniture-margin', false],
    );
    if (coverageMode === 'front-edge') {
      fieldIds.push(['rug-front-overlap', true], ['rug-front-extension', false]);
    }
  }

  const values = new Map<LengthField, number | null>();
  let invalid = false;
  for (const [id, required] of fieldIds) {
    const value = readLength(id, required);
    if (value === undefined) invalid = true;
    else values.set(id, value);
  }
  if (
    !invalid &&
    checkFurniture &&
    coverageMode === 'front-edge' &&
    (values.get('rug-front-overlap') ?? 0) > (values.get('rug-furniture-depth') ?? 0)
  ) {
    setError(
      'rug-front-overlap',
      'Front-edge overlap cannot exceed the furniture footprint depth.',
    );
    invalid = true;
  }
  if (invalid) return null;
  const get = (id: LengthField) => values.get(id) ?? 0;
  return {
    roomWidthMm: get('rug-room-width'),
    roomDepthMm: get('rug-room-depth'),
    rugWidthMm: get('rug-width'),
    rugDepthMm: get('rug-depth'),
    wallGapEachSideMm: get('rug-wall-gap'),
    orientation,
    checkFurniture,
    coverageMode,
    ...(checkFurniture
      ? {
          furnitureWidthMm: get('rug-furniture-width'),
          furnitureDepthMm: get('rug-furniture-depth'),
          furnitureMarginEachSideMm: get('rug-furniture-margin'),
          ...(coverageMode === 'front-edge'
            ? {
                frontOverlapMm: get('rug-front-overlap'),
                frontExtensionMm: get('rug-front-extension'),
              }
            : {}),
        }
      : { furnitureMarginEachSideMm: 0 }),
  };
}

function unitHtml(mm: number, margin = false): string {
  const format = margin ? formatMarginMeasurement : formatMeasurement;
  return `<span class="unit-value"><span data-unit="metric">${format(mm, 'metric')}</span><span data-unit="separator" aria-hidden="true"> / </span><span data-unit="imperial">${format(mm, 'imperial')}</span></span>`;
}

function renderRows(rows: DimensionDisplayRow[]): void {
  const tbody = document.querySelector<HTMLTableSectionElement>('#rug-fitcheck-table tbody');
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
        <td data-label="Physical margin"><span>${row.physicalMarginMm > 0 ? '+' : row.physicalMarginMm < 0 ? '−' : ''}</span>${unitHtml(Math.abs(row.physicalMarginMm), true)}</td>
        <td data-label="Target margin"><span>${row.targetMarginMm > 0 ? '+' : row.targetMarginMm < 0 ? '−' : ''}</span>${unitHtml(Math.abs(row.targetMarginMm), true)}</td>
      </tr>`,
    )
    .join('');
}

function renderSummary(state: FitState, rows: DimensionDisplayRow[]): void {
  const summary = document.getElementById('rug-fitcheck-summary');
  if (!summary) return;
  const summaryCopy = getFitSummaryCopy(state, rows);
  const label = getFitSummaryResultLabel(summaryCopy, summary.dataset.fitOrigin);
  summary.setAttribute('data-fit-state', state);
  summary.dataset.fitExact = String(summaryCopy.isExactFit);
  summary.querySelector<HTMLElement>('[data-field="icon"]')!.textContent =
    FIT_STATE_BADGE_COPY[state].icon;
  summary.querySelector<HTMLElement>('[data-field="label"]')!.textContent = label;
  const content = summary.querySelector<HTMLElement>('[data-fit-summary-content]');
  if (content) content.innerHTML = renderFitSummaryContentHtml(summaryCopy);
  const sticky = summary.querySelector<HTMLAnchorElement>('[data-fit-sticky]');
  if (sticky) {
    sticky.dataset.fitState = state;
    sticky.setAttribute('aria-label', `Fit result: ${label}. View calculation details.`);
    sticky.querySelector<HTMLElement>('[data-field="sticky-icon"]')!.textContent =
      FIT_STATE_BADGE_COPY[state].icon;
    sticky.querySelector<HTMLElement>('[data-field="sticky-label"]')!.textContent = label;
    const detail = sticky.querySelector<HTMLElement>('[data-field="sticky-detail"]');
    if (detail) {
      detail.innerHTML = summaryCopy.isExactFit
        ? 'No measurement tolerance remains'
        : summaryCopy.marginMm !== null && summaryCopy.marginLabel
          ? `${unitHtml(summaryCopy.marginMm, true)} ${summaryCopy.marginLabel.toLowerCase()}`
          : state === 'needs_information'
            ? 'Measurement data needed'
            : 'Check result details';
    }
  }
}

function makeAssumptions(values: RugFormValues): string[] {
  return [
    'The room and rug are treated as axis-aligned rectangles; the orientation control tests the rug rotated 90 degrees.',
    `The ${formatMeasurement(values.wallGapEachSideMm)} room border is an extra user-selected target on every rug edge, not a universal design rule.`,
    values.checkFurniture
      ? values.coverageMode === 'full-footprint'
        ? `The complete ${formatMeasurement(values.furnitureWidthMm!)} by ${formatMeasurement(values.furnitureDepthMm!)} furniture/use footprint is compared with the rug, plus the user-selected ${formatMeasurement(values.furnitureMarginEachSideMm)} border.`
        : `The front-edge check compares the entered ${formatMeasurement(values.frontOverlapMm!)} overlap and ${formatMeasurement(values.frontExtensionMm ?? 0)} extension. It does not infer actual furniture leg positions.`
      : 'Furniture coverage is disabled; only rug-to-room dimensions are checked.',
    'The diagram centers the rug in the room for a proportional comparison. It does not choose furniture placement, style, colors, irregular shapes or diagonal orientations.',
  ];
}

function renderDiagram(values: RugFormValues, orientation: 'width-depth' | 'depth-width'): void {
  const svg = document.querySelector<SVGSVGElement>(
    `[data-diagram-id="${DIAGRAM_ID}"] .scale-diagram__svg`,
  );
  if (!svg) return;
  const defs = svg.querySelector('defs');
  const markup = renderRugDiagramMarkup({
    diagramId: DIAGRAM_ID,
    ...values,
    orientation,
  });
  svg.innerHTML = '';
  if (defs) svg.appendChild(defs);
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  wrapper.innerHTML = markup;
  while (wrapper.firstChild) svg.appendChild(wrapper.firstChild);

  const summary = document.getElementById(`${DIAGRAM_ID}-caption`);
  if (summary) {
    const rugWidthOnRoomWidthMm =
      orientation === 'width-depth' ? values.rugWidthMm : values.rugDepthMm;
    const rugDepthOnRoomDepthMm =
      orientation === 'width-depth' ? values.rugDepthMm : values.rugWidthMm;
    const relationship = !values.checkFurniture
      ? 'Furniture coverage is not checked.'
      : values.coverageMode === 'full-footprint'
        ? `Full furniture/use footprint ${formatMeasurement(values.furnitureWidthMm!)} by ${formatMeasurement(values.furnitureDepthMm!)} is checked against the rug.`
        : `Front-edge overlap ${formatMeasurement(values.frontOverlapMm!)} and forward extension ${formatMeasurement(values.frontExtensionMm ?? 0)} are user-selected.`;
    summary.textContent = `Centered rectangular room and rug comparison. Room ${formatMeasurement(values.roomWidthMm)} by ${formatMeasurement(values.roomDepthMm)}. Rug ${formatMeasurement(rugWidthOnRoomWidthMm)} by ${formatMeasurement(rugDepthOnRoomDepthMm)} in the selected orientation. ${relationship} This is not a complete floor-plan placement tool.`;
  }
}

function recompute(): void {
  const values = readForm();
  if (!values) return;
  const plan = buildRugFitPlan(values);
  const result = evaluateFit(plan.checks, makeAssumptions(values));
  const rows = toDimensionDisplayRows(plan.checks, result);
  const orientation = document.querySelector<HTMLElement>('[data-rug-orientation]');
  if (orientation) {
    orientation.textContent =
      plan.orientation === 'width-depth'
        ? 'Rug width runs along the room width.'
        : 'Rug is rotated 90 degrees against the room axes.';
  }
  const assumptions = document.querySelector('#rug-fitcheck-assumptions [data-field="items"]');
  if (assumptions) {
    assumptions.innerHTML = result.assumptions
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');
  }
  renderRows(rows);
  renderSummary(result.state, rows);
  renderDiagram(values, plan.orientation);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function initRugFitCheck(): void {
  const form = document.querySelector<HTMLFormElement>('[data-rug-fitcheck-form]');
  if (!form || form.dataset.rugInitialized === 'true') return;
  form.dataset.rugInitialized = 'true';
  updateConditionalFields();
  const update = (event: Event) => {
    if (event.target instanceof HTMLInputElement && event.target.hasAttribute('data-unit-choice')) {
      return;
    }
    updateConditionalFields();
    recompute();
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
}

initRugFitCheck();
