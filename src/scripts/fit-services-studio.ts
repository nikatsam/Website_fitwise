import {
  buildFitServicePlan,
  getFitServiceDefinition,
  getFitServiceDefaults,
  getFitServiceModeForRoute,
  type FitServiceField,
  type FitServiceMode,
  type FitServiceValues,
} from '../lib/geometry';
import {
  evaluateFit,
  FIT_STATE_BADGE_COPY,
  selectSummaryDimension,
  toDimensionDisplayRows,
  type DimensionDisplayRow,
} from '../lib/fit';
import { formatMeasurement, parseLength } from '../lib/units';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderField(field: FitServiceField, value: string): string {
  const id = `service-${field.name}`;
  const condition = field.showWhen;
  const conditionAttributes = condition
    ? ` data-show-when-name="${escapeHtml(condition.name)}" data-show-when-value="${escapeHtml(condition.value)}" hidden`
    : '';
  const required = field.required === false || field.optional ? '' : ' required';
  let control: string;
  if (field.type === 'select') {
    control = `<select id="${id}" name="${field.name}" data-service-control="select"${required}>${(
      field.options ?? []
    )
      .map(
        (option) =>
          `<option value="${escapeHtml(option.value)}"${option.value === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`,
      )
      .join('')}</select>`;
  } else if (field.type === 'length') {
    control = `<input id="${id}" name="${field.name}" type="text" inputmode="decimal" value="${escapeHtml(value)}" data-service-control="length"${required} aria-describedby="${id}-error" />`;
  } else if (field.type === 'text') {
    control = `<input id="${id}" name="${field.name}" type="text" value="${escapeHtml(value)}" data-service-control="text"${required} aria-describedby="${id}-error" />`;
  } else {
    const step = field.type === 'count' ? '1' : 'any';
    const min = field.min === undefined ? '' : ` min="${field.min}"`;
    const max = field.max === undefined ? '' : ` max="${field.max}"`;
    control = `<input id="${id}" name="${field.name}" type="number" step="${step}"${min}${max} value="${escapeHtml(value)}" data-service-control="${field.type}"${required} aria-describedby="${id}-error" />`;
  }
  return `<div class="field" data-service-field data-name="${field.name}"${conditionAttributes}>
    <label for="${id}">${escapeHtml(field.label)}</label>
    ${control}
    <span class="field__error" id="${id}-error" role="alert"></span>
  </div>`;
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

function updateConditionalFields(): void {
  const form = document.querySelector<HTMLFormElement>('[data-fit-services-form]');
  if (!form) return;
  for (const wrapper of form.querySelectorAll<HTMLElement>('[data-show-when-name]')) {
    const selectName = wrapper.dataset.showWhenName;
    const expectedValue = wrapper.dataset.showWhenValue;
    const current = form.querySelector<HTMLSelectElement>(`[name="${selectName}"]`)?.value;
    wrapper.hidden = current !== expectedValue;
  }
}

function readForm(): { mode: FitServiceMode; values: FitServiceValues } | null {
  const form = document.querySelector<HTMLFormElement>('[data-fit-services-form]');
  const modeControl = document.getElementById('fit-service-mode') as
    HTMLSelectElement | HTMLInputElement | null;
  if (!form || !modeControl) return null;
  const mode = getFitServiceModeForRoute(modeControl.value);
  if (!mode) return null;
  const definition = getFitServiceDefinition(mode);
  const values: FitServiceValues = {};
  let invalid = false;

  for (const field of definition.fields) {
    const wrapper = form.querySelector<HTMLElement>(
      `[data-service-field][data-name="${field.name}"]`,
    );
    if (!wrapper || wrapper.hidden) continue;
    const control = wrapper.querySelector<HTMLInputElement | HTMLSelectElement>(
      '[data-service-control]',
    );
    if (!control) continue;
    const raw = control.value.trim();
    const id = `service-${field.name}`;
    if (!raw && field.optional) {
      values[field.name] =
        field.type === 'length' || field.type === 'decimal' || field.type === 'count' ? 0 : '';
      clearError(id);
      continue;
    }
    if (!raw) {
      setError(id, 'Enter or select a value.');
      invalid = true;
      continue;
    }

    if (field.type === 'length') {
      const parsed = parseLength(raw);
      if (!parsed.ok || (field.required !== false && parsed.valueMm <= 0)) {
        setError(id, parsed.ok ? 'Enter a value greater than zero.' : parsed.error);
        invalid = true;
      } else {
        values[field.name] = parsed.valueMm;
        clearError(id);
      }
      continue;
    }

    if (field.type === 'count' || field.type === 'decimal') {
      const number = Number(raw);
      const invalidNumber =
        !Number.isFinite(number) ||
        (field.type === 'count' && !Number.isInteger(number)) ||
        (field.required !== false && number <= 0) ||
        (field.min !== undefined && number < field.min) ||
        (field.max !== undefined && number > field.max);
      if (invalidNumber) {
        setError(
          id,
          `Enter a valid ${field.type === 'count' ? 'whole number' : 'number'}${field.min === undefined ? '' : ` from ${field.min} to ${field.max ?? 'the maximum'}`}.`,
        );
        invalid = true;
      } else {
        values[field.name] = number;
        clearError(id);
      }
      continue;
    }

    values[field.name] = raw;
    clearError(id);
  }

  return invalid ? null : { mode, values };
}

function formatDimensionRows(rows: DimensionDisplayRow[]): void {
  const tbody = document.querySelector<HTMLTableSectionElement>('#fit-services-table tbody');
  if (!tbody) return;
  tbody.innerHTML = rows
    .map(
      (
        row,
      ) => `<tr data-dimension="${row.dimension}" data-hard-fit="${row.hardFit}" data-recommended-fit="${row.recommendedFit}">
        <th scope="row" data-label="Dimension">${row.label}</th>
        <td data-label="Required">${formatDualUnit(row.requiredMm)}</td>
        <td data-label="Target">${formatDualUnit(row.recommendedMm)}</td>
        <td data-label="Available">${formatDualUnit(row.availableMm)}</td>
        <td data-label="Physical margin"><span>${row.physicalMarginMm > 0 ? '+' : row.physicalMarginMm < 0 ? '−' : ''}</span>${formatDualUnit(Math.abs(row.physicalMarginMm))}</td>
        <td data-label="Target margin"><span>${row.targetMarginMm > 0 ? '+' : row.targetMarginMm < 0 ? '−' : ''}</span>${formatDualUnit(Math.abs(row.targetMarginMm))}</td>
      </tr>`,
    )
    .join('');
}

function formatDualUnit(mm: number): string {
  return `<span class="unit-value"><span data-unit="metric">${formatMeasurement(mm, 'metric')}</span> <span data-unit="imperial">${formatMeasurement(mm, 'imperial')}</span></span>`;
}

function refreshCompatibility(
  compatibility: ReturnType<typeof buildFitServicePlan>['compatibility'],
): void {
  const list = document.querySelector<HTMLUListElement>('[data-fit-service-compatibility]');
  if (!list) return;
  list.innerHTML = compatibility
    .map(
      (check) =>
        `<li data-compatible="${check.compatible}"><strong>${check.compatible ? 'Compatible' : 'Check required'}:</strong> ${escapeHtml(check.label)}. ${escapeHtml(check.detail)}</li>`,
    )
    .join('');
}

function refreshCandidates(candidates: ReturnType<typeof buildFitServicePlan>['candidates']): void {
  const list = document.querySelector<HTMLUListElement>('[data-fit-service-candidates]');
  if (!list) return;
  list.innerHTML = (candidates ?? [])
    .map(
      (candidate) =>
        `<li data-candidate-state="${candidate.state}"><strong>${escapeHtml(candidate.label)}:</strong> ${escapeHtml(candidate.detail)}</li>`,
    )
    .join('');
}

function updateSummary(
  state: 'fits' | 'tight' | 'does_not_fit',
  rows: DimensionDisplayRow[],
  compatibility: ReturnType<typeof buildFitServicePlan>['compatibility'],
  reviewRequired: string[],
): void {
  const summary = document.getElementById('fit-services-summary');
  if (!summary) return;
  const copy = FIT_STATE_BADGE_COPY[state];
  const hardFailures = rows.filter((row) => !row.hardFit);
  const targetFailures = rows.filter((row) => !row.recommendedFit);
  const incompatible = compatibility
    .filter((check) => !check.compatible)
    .map((check) => check.label);
  let detail = 'Fits all checked dimensions.';
  if (state === 'fits') {
    const primary = selectSummaryDimension(rows);
    if (primary) {
      detail = `Tightest constraint: ${primary.label}. Physical space remaining: ${formatDualUnit(primary.physicalMarginMm)}. After your selected target: ${formatDualUnit(primary.targetMarginMm)}.`;
    }
  } else if (state === 'tight') {
    detail =
      reviewRequired.length > 0
        ? `Physical fit is only a partial result. More information is required: ${reviewRequired.map(escapeHtml).join(', ')}`
        : `Physical space remains, but selected targets are short on ${targetFailures.map((row) => `${row.label} by ${formatDualUnit(Math.abs(row.targetMarginMm))}`).join(', ')}.`;
  } else {
    const reasons = hardFailures.map(
      (row) => `${row.label} short by ${formatDualUnit(Math.abs(row.physicalMarginMm))}`,
    );
    detail = `Does not fit or is incompatible: ${[...reasons, ...incompatible].join(', ')}.`;
  }
  summary.dataset.fitState = state;
  summary.querySelector<HTMLElement>('[data-field="icon"]')!.textContent = copy.icon;
  summary.querySelector<HTMLElement>('[data-field="label"]')!.textContent = copy.label;
  summary.querySelector<HTMLElement>('[data-field="detail"]')!.innerHTML = detail;
  const sticky = summary.querySelector<HTMLAnchorElement>('[data-fit-sticky]');
  if (sticky) {
    sticky.dataset.fitState = state;
    sticky.setAttribute(
      'aria-label',
      `Fit services result: ${copy.label}. View dimension details.`,
    );
    sticky.querySelector<HTMLElement>('[data-field="sticky-icon"]')!.textContent = copy.icon;
    sticky.querySelector<HTMLElement>('[data-field="sticky-label"]')!.textContent = copy.label;
    sticky.querySelector<HTMLElement>('[data-field="sticky-detail"]')!.innerHTML =
      reviewRequired.length > 0
        ? 'Manual check required'
        : state === 'fits'
          ? `${formatDualUnit(Math.max(0, selectSummaryDimension(rows)?.targetMarginMm ?? 0))} after target`
          : state === 'tight'
            ? `Target short ${formatDualUnit(Math.abs(selectSummaryDimension(targetFailures)?.targetMarginMm ?? 0))}`
            : hardFailures.length > 0
              ? `Physical short ${formatDualUnit(Math.abs(selectSummaryDimension(hardFailures)?.physicalMarginMm ?? 0))}`
              : 'Compatibility check';
  }
}

function renderFields(mode: FitServiceMode): void {
  const container = document.querySelector<HTMLElement>('[data-fit-service-fields]');
  const description = document.querySelector<HTMLElement>('[data-fit-service-description]');
  if (!container || !description) return;
  const definition = getFitServiceDefinition(mode);
  const defaults = getFitServiceDefaults(mode);
  container.innerHTML = definition.fields
    .map((field) => {
      const value = defaults[field.name] ?? field.defaultValue;
      return renderField(
        field,
        field.type === 'length' && typeof value === 'number'
          ? formatMeasurement(value)
          : String(value),
      );
    })
    .join('');
  description.textContent = definition.description;
  updateConditionalFields();
}

function recompute(): void {
  const form = readForm();
  if (!form) return;
  const plan = buildFitServicePlan(form.mode, form.values);
  const result = evaluateFit(plan.checks, plan.assumptions);
  const incompatible = plan.compatibility.some((check) => !check.compatible);
  const reviewRequired = plan.reviewRequired ?? [];
  const state = incompatible ? 'does_not_fit' : reviewRequired.length > 0 ? 'tight' : result.state;
  const rows = toDimensionDisplayRows(plan.checks, { ...result, state });
  updateSummary(state, rows, plan.compatibility, reviewRequired);
  formatDimensionRows(rows);
  refreshCompatibility(plan.compatibility);
  refreshCandidates(plan.candidates);
  const reviewList = document.querySelector<HTMLUListElement>('[data-fit-service-review]');
  if (reviewList) {
    reviewList.innerHTML = reviewRequired.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }
  const assumptions = document.querySelector<HTMLElement>(
    '#fit-services-assumptions [data-field="items"]',
  );
  if (assumptions) {
    assumptions.innerHTML = plan.assumptions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }
  const extra = document.querySelector<HTMLElement>('[data-fit-service-extra]');
  if (extra) {
    const parts = [plan.extra ?? getFitServiceDefinition(form.mode).description];
    if (plan.capacity !== undefined) {
      parts.push(
        `Estimated single-layer capacity: ${plan.capacity}; requested ${plan.capacityRequested}.`,
      );
    }
    extra.textContent = parts.join(' ');
  }
}

function init(): void {
  const form = document.querySelector<HTMLFormElement>('[data-fit-services-form]');
  const modeControl = document.getElementById('fit-service-mode') as HTMLSelectElement | null;
  if (!form || !modeControl) return;

  const requestedMode = getFitServiceModeForRoute(new URLSearchParams(location.search).get('mode'));
  const pageModes = new Set(
    modeControl.tagName === 'SELECT'
      ? Array.from((modeControl as HTMLSelectElement).options, (option) => option.value)
      : [modeControl.value],
  );
  if (requestedMode && pageModes.has(requestedMode)) modeControl.value = requestedMode;
  const initialMode = getFitServiceModeForRoute(modeControl.value);
  if (!initialMode) return;
  renderFields(initialMode);

  modeControl.addEventListener('change', () => {
    if (modeControl.tagName !== 'SELECT') return;
    const mode = getFitServiceModeForRoute(modeControl.value);
    if (!mode) return;
    renderFields(mode);
    const notice = form.querySelector<HTMLElement>('[data-fit-example-notice]');
    if (notice) notice.hidden = false;
    recompute();
  });

  const handleChange = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id !== 'service-setup') {
      const notice = form.querySelector<HTMLElement>('[data-fit-example-notice]');
      if (notice && target.id.startsWith('service-')) notice.hidden = true;
    }
    updateConditionalFields();
    recompute();
  };
  form.addEventListener('input', handleChange);
  form.addEventListener('change', handleChange);
  form.addEventListener('submit', (event) => event.preventDefault());
  recompute();
}

init();

export {};
