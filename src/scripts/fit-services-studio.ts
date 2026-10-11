import {
  buildFitServicePlan,
  getFitServiceDefinition,
  getFitServiceDefaults,
  getFitServiceModeForRoute,
  evaluateFitServicePlan,
  getFitServiceSteps,
  type FitServiceStep,
  type FitServiceField,
  type FitServiceMode,
  type FitServiceValues,
} from '../lib/geometry';
import {
  FIT_STATE_BADGE_COPY,
  getFitSummaryCopy,
  getFitSummaryResultLabel,
  renderFitSummaryContentHtml,
  toDimensionDisplayRows,
  type DimensionDisplayRow,
  type FitState,
} from '../lib/fit';
import { renderFitServiceAsciiPreview } from '../lib/diagram/render-fit-service-ascii';
import { renderFitServiceSvgPlan } from '../lib/diagram/render-fit-service-svg';
import {
  getFitServiceMeasurementGuidance,
  renderMeasurementHelpMarkup,
} from '../lib/fit/measurement-guidance';
import {
  renderCandidateSizeEditorMarkup,
  renderCandidateSizeInputRow,
  serializeCandidateSizeInput,
  validateCandidateSizeInputRow,
} from '../lib/fit/candidate-size-editor';
import { getFitServiceStartGuidance } from '../lib/fit/start-guidance';
import { formatMarginMeasurement, formatMeasurement, parseLength } from '../lib/units';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const mobileStepperQuery = '(max-width: 61.999rem)';
let activeServiceStep = 0;
let activeServiceMode: FitServiceMode | null = null;
let activeServiceSteps: FitServiceStep[] = [];

function renderServiceStepMarkup(
  mode: FitServiceMode,
  steps: FitServiceStep[],
  fields: FitServiceField[],
  values: FitServiceValues,
): string {
  const markupByName = new Map(
    fields.map((field) => {
      const value = values[field.name] ?? field.defaultValue;
      return [
        field.name,
        renderField(
          field,
          mode,
          field.type === 'length' && typeof value === 'number'
            ? formatMeasurement(value)
            : String(value),
        ),
      ];
    }),
  );
  return steps
    .map((step, index) => {
      const headingId = `fit-service-step-${mode}-${step.id}-heading`;
      const fieldsMarkup = step.fields.map((field) => markupByName.get(field.name) ?? '').join('');
      return `<section class="fit-services__step" data-fit-service-step data-calculator-step data-step-index="${index}" aria-labelledby="${headingId}"><h2 id="${headingId}" data-step-heading tabindex="-1">Step ${index + 1} of ${steps.length}: ${escapeHtml(step.title)}</h2><div class="fit-services__step-fields field-grid">${fieldsMarkup}</div></section>`;
    })
    .join('');
}

function applyMobileServiceStep(focusHeading = false): void {
  const fields = document.querySelector<HTMLElement>('[data-fit-service-fields]');
  const stepper = document.querySelector<HTMLElement>('[data-fit-service-stepper]');
  if (!fields || !stepper) return;
  const mobile = window.matchMedia(mobileStepperQuery).matches;
  const sections = [...fields.querySelectorAll<HTMLElement>('[data-fit-service-step]')];
  const hasSteps = activeServiceSteps.length > 0 && sections.length > 0;
  stepper.hidden = !mobile || !hasSteps;
  sections.forEach((section, index) => {
    section.hidden = mobile && hasSteps && index !== activeServiceStep;
    const heading = section.querySelector<HTMLElement>('[data-step-heading]');
    if (index === activeServiceStep && hasSteps) heading?.setAttribute('aria-current', 'step');
    else heading?.removeAttribute('aria-current');
  });
  if (!hasSteps) return;
  const status = stepper.querySelector<HTMLElement>('[data-step-status]');
  const previous = stepper.querySelector<HTMLButtonElement>('[data-step-action="previous"]');
  const next = stepper.querySelector<HTMLButtonElement>('[data-step-action="next"]');
  const current = activeServiceSteps[activeServiceStep];
  if (status && current) {
    status.textContent = `Step ${activeServiceStep + 1} of ${activeServiceSteps.length}: ${current.title}`;
  }
  if (previous) previous.disabled = activeServiceStep === 0;
  if (next) next.disabled = activeServiceStep === activeServiceSteps.length - 1;
  if (focusHeading && mobile) {
    sections[activeServiceStep]?.querySelector<HTMLElement>('[data-step-heading]')?.focus();
  }
}

function renderMobileServiceStepper(mode: FitServiceMode, steps: FitServiceStep[]): void {
  const stepper = document.querySelector<HTMLElement>('[data-fit-service-stepper]');
  if (!stepper) return;
  if (activeServiceMode !== mode) activeServiceStep = 0;
  activeServiceMode = mode;
  activeServiceSteps = steps;
  activeServiceStep = Math.min(activeServiceStep, steps.length - 1);
  stepper.innerHTML = `<button type="button" data-step-action="previous" aria-label="Previous step">Previous</button><p role="status" aria-live="polite" data-step-status></p><button type="button" data-step-action="next" aria-label="Next step">Next</button>`;
  applyMobileServiceStep();
}

function revealStepForField(fieldId: string): void {
  const field = document.getElementById(fieldId)?.closest<HTMLElement>('[data-service-field]');
  const section = field?.closest<HTMLElement>('[data-fit-service-step]');
  const index = Number(section?.dataset.stepIndex);
  if (!section || !Number.isInteger(index) || index < 0) return;
  activeServiceStep = index;
  applyMobileServiceStep(true);
}

function renderField(field: FitServiceField, mode: FitServiceMode, value: string): string {
  const id = `service-${field.name}`;
  const condition = field.showWhen;
  const help = getFitServiceMeasurementGuidance(mode, field.name);
  const descriptionIds = `${id}-error${help ? ` ${id}-help` : ''}${field.type === 'length' ? ' fit-service-unit-note' : ''}`;
  const helpMarkup = help ? renderMeasurementHelpMarkup(`${id}-help`, help) : '';
  const conditionAttributes = condition
    ? ` data-show-when-name="${escapeHtml(condition.name)}" data-show-when-value="${escapeHtml(condition.value)}" hidden`
    : '';
  const required = field.required === false || field.optional ? '' : ' required';
  if (field.name === 'candidateSizes') {
    return renderCandidateSizeEditorMarkup(
      id,
      value,
      field.required !== false && !field.optional,
      conditionAttributes,
      helpMarkup,
    );
  }
  let control: string;
  if (field.type === 'select') {
    control = `<select id="${id}" name="${field.name}" data-service-control="select"${required} aria-describedby="${descriptionIds}">${(
      field.options ?? []
    )
      .map(
        (option) =>
          `<option value="${escapeHtml(option.value)}"${option.value === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`,
      )
      .join('')}</select>`;
  } else if (field.type === 'length') {
    control = `<input id="${id}" name="${field.name}" type="text" inputmode="text" value="${escapeHtml(value)}" data-service-control="length"${required} aria-describedby="${descriptionIds}" />`;
  } else if (field.type === 'text') {
    control = `<input id="${id}" name="${field.name}" type="text" value="${escapeHtml(value)}" data-service-control="text"${required} aria-describedby="${descriptionIds}" />`;
  } else {
    const step = field.type === 'count' ? '1' : 'any';
    const min = field.min === undefined ? '' : ` min="${field.min}"`;
    const max = field.max === undefined ? '' : ` max="${field.max}"`;
    control = `<input id="${id}" name="${field.name}" type="number" step="${step}"${min}${max} value="${escapeHtml(value)}" data-service-control="${field.type}"${required} aria-describedby="${descriptionIds}" />`;
  }
  return `<div class="field" data-service-field data-name="${field.name}"${conditionAttributes}>
    <label for="${id}">${escapeHtml(field.label)}</label>
    ${control}
    <span class="field__error" id="${id}-error" role="alert"></span>
    ${helpMarkup}
  </div>`;
}

function setError(id: string, message: string): void {
  document.getElementById(id)?.setAttribute('aria-invalid', 'true');
  const error = document.getElementById(`${id}-error`);
  if (error) error.textContent = message;
  revealStepForField(id);
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
  updateUnitNote(form);
}

function syncCandidateSizeRows(): void {
  const wrapper = document.querySelector<HTMLElement>(
    '[data-service-field][data-name="candidateSizes"]',
  );
  if (!wrapper || wrapper.hidden) return;
  const rows = [...wrapper.querySelectorAll<HTMLElement>('[data-candidate-size-row]')].map(
    (row) => {
      const width = row.querySelector<HTMLInputElement>('[data-candidate-size-width]');
      const depth = row.querySelector<HTMLInputElement>('[data-candidate-size-depth]');
      return {
        element: row,
        row: {
          id: Number(row.dataset.rowId),
          width: width?.value ?? '',
          depth: depth?.value ?? '',
        },
        width,
        depth,
      };
    },
  );
  let invalid = false;
  for (const item of rows) {
    const error = validateCandidateSizeInputRow(item.row);
    const errorElement = item.element.querySelector<HTMLElement>('[data-candidate-size-error]');
    if (error) {
      invalid = true;
      item.width?.setAttribute('aria-invalid', 'true');
      item.depth?.setAttribute('aria-invalid', 'true');
      if (errorElement) errorElement.textContent = error;
    } else {
      item.width?.removeAttribute('aria-invalid');
      item.depth?.removeAttribute('aria-invalid');
      if (errorElement) errorElement.textContent = '';
    }
  }
  const hidden = wrapper.querySelector<HTMLInputElement>('#service-candidateSizes');
  if (hidden) hidden.value = invalid ? '' : serializeCandidateSizeInput(rows.map(({ row }) => row));
}

function handleCandidateSizeClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;
  const add = event.target.closest<HTMLButtonElement>('[data-candidate-size-add]');
  const remove = event.target.closest<HTMLButtonElement>('[data-candidate-size-remove]');
  const container = document.querySelector<HTMLElement>('[data-candidate-size-rows]');
  if (!container) return;
  if (add) {
    const rowIds = [...container.querySelectorAll<HTMLElement>('[data-candidate-size-row]')].map(
      (row) => Number(row.dataset.rowId),
    );
    const nextId = Math.max(0, ...rowIds) + 1;
    container.insertAdjacentHTML(
      'beforeend',
      renderCandidateSizeInputRow('service-candidateSizes', {
        id: nextId,
        width: '',
        depth: '',
      }),
    );
    syncCandidateSizeRows();
    container
      .querySelector<HTMLElement>(`[data-row-id="${nextId}"] [data-candidate-size-width]`)
      ?.focus();
  } else if (remove) {
    const row = remove.closest<HTMLElement>('[data-candidate-size-row]');
    const rowId = Number(row?.dataset.rowId);
    const rowElements = [...container.querySelectorAll<HTMLElement>('[data-candidate-size-row]')];
    if (row && rowElements.length === 1) {
      row
        .querySelectorAll<HTMLInputElement>(
          'input[data-candidate-size-width], input[data-candidate-size-depth]',
        )
        .forEach((input) => (input.value = ''));
    } else {
      row?.remove();
    }
    syncCandidateSizeRows();
    const nextRow =
      container.querySelector<HTMLElement>(`[data-row-id="${rowId}"]`) ??
      container.querySelector<HTMLElement>('[data-candidate-size-row]');
    nextRow?.querySelector<HTMLInputElement>('[data-candidate-size-width]')?.focus();
  } else {
    return;
  }
  updateConditionalFields();
  recompute();
}

function updateUnitNote(form: HTMLFormElement): void {
  const note = form.querySelector<HTMLElement>('[data-fit-service-unit-note]');
  if (!note) return;
  const controls = [...form.querySelectorAll<HTMLElement>('[data-service-field]')]
    .filter((wrapper) => !wrapper.hidden)
    .map((wrapper) => wrapper.querySelector<HTMLElement>('[data-service-control]'))
    .filter((control): control is HTMLElement => control !== null);
  const hints = [
    ...(controls.some((control) => control.dataset.serviceControl === 'decimal')
      ? ['Weight fields use kg.']
      : []),
  ];
  note.textContent = hints.join(' ');
  note.hidden = hints.length === 0;
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
      setError(
        id,
        field.name === 'candidateSizes'
          ? 'Add at least one complete candidate size row.'
          : 'Enter or select a value.',
      );
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
        <td data-label="Physical margin"><span>${row.physicalMarginMm > 0 ? '+' : row.physicalMarginMm < 0 ? '−' : ''}</span>${formatDualUnit(Math.abs(row.physicalMarginMm), true)}</td>
        <td data-label="Target margin"><span>${row.targetMarginMm > 0 ? '+' : row.targetMarginMm < 0 ? '−' : ''}</span>${formatDualUnit(Math.abs(row.targetMarginMm), true)}</td>
      </tr>`,
    )
    .join('');
}

function formatDualUnit(mm: number, margin = false): string {
  const format = margin ? formatMarginMeasurement : formatMeasurement;
  return `<span class="unit-value"><span data-unit="metric">${format(mm, 'metric')}</span><span data-unit="separator" aria-hidden="true"> / </span><span data-unit="imperial">${format(mm, 'imperial')}</span></span>`;
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
  state: FitState,
  rows: DimensionDisplayRow[],
  compatibility: ReturnType<typeof buildFitServicePlan>['compatibility'],
  missingRequirements: NonNullable<ReturnType<typeof buildFitServicePlan>['missingRequirements']>,
): void {
  const summary = document.getElementById('fit-services-summary');
  if (!summary) return;
  const copy = FIT_STATE_BADGE_COPY[state];
  const summaryCopy = getFitSummaryCopy(state, rows, {
    missingRequirements,
    compatibilityChecks: compatibility,
  });
  const resultLabel = getFitSummaryResultLabel(summaryCopy, summary.dataset.fitOrigin);
  summary.dataset.fitState = state;
  summary.dataset.fitExact = String(summaryCopy.isExactFit);
  summary.querySelector<HTMLElement>('[data-field="icon"]')!.textContent = copy.icon;
  summary.querySelector<HTMLElement>('[data-field="label"]')!.textContent = resultLabel;
  const content = summary.querySelector<HTMLElement>('[data-fit-summary-content]');
  if (content) content.innerHTML = renderFitSummaryContentHtml(summaryCopy);
  const sticky = summary.querySelector<HTMLAnchorElement>('[data-fit-sticky]');
  if (sticky) {
    sticky.dataset.fitState = state;
    sticky.setAttribute(
      'aria-label',
      `Fit services result: ${resultLabel}. View calculation details.`,
    );
    sticky.querySelector<HTMLElement>('[data-field="sticky-icon"]')!.textContent = copy.icon;
    sticky.querySelector<HTMLElement>('[data-field="sticky-label"]')!.textContent = resultLabel;
    const stickyDetail = sticky.querySelector<HTMLElement>('[data-field="sticky-detail"]');
    if (stickyDetail) {
      stickyDetail.innerHTML = summaryCopy.isExactFit
        ? 'No measurement tolerance remains'
        : summaryCopy.marginMm !== null && summaryCopy.marginLabel
          ? `${formatDualUnit(summaryCopy.marginMm, true)} ${escapeHtml(summaryCopy.marginLabel.toLowerCase())}`
          : summaryCopy.compatibilityStatus === 'Incompatible'
            ? 'Compatibility failed'
            : state === 'needs_information'
              ? 'Verification needed'
              : 'Physical fit failed';
    }
  }
}

function renderFields(mode: FitServiceMode): void {
  const container = document.querySelector<HTMLElement>('[data-fit-service-fields]');
  const description = document.querySelector<HTMLElement>('[data-fit-service-description]');
  if (!container || !description) return;
  const definition = getFitServiceDefinition(mode);
  const defaults = getFitServiceDefaults(mode);
  const steps = getFitServiceSteps(mode, definition.fields);
  container.innerHTML = renderServiceStepMarkup(mode, steps, definition.fields, defaults);
  renderMobileServiceStepper(mode, steps);
  description.textContent = definition.description;
  refreshStartGuidance(mode, defaults);
  updateConditionalFields();
}

function refreshStartGuidance(mode: FitServiceMode, values: FitServiceValues): void {
  const list = document.querySelector<HTMLUListElement>('[data-before-you-start-items]');
  if (!list) return;
  const importanceLabel = {
    required: 'Required',
    optional: 'Optional',
    verification: 'For verification',
  } as const;
  const items = getFitServiceStartGuidance(mode, values).map(({ type, text }) => {
    const item = document.createElement('li');
    item.dataset.preparationType = type;
    const label = document.createElement('span');
    label.className = 'before-you-start__type';
    label.textContent = importanceLabel[type];
    const content = document.createElement('span');
    content.textContent = text;
    item.append(label, content);
    return item;
  });
  list.replaceChildren(...items);
}

function recompute(): void {
  const form = readForm();
  if (!form) return;
  refreshStartGuidance(form.mode, form.values);
  const plan = buildFitServicePlan(form.mode, form.values);
  const { result, state } = evaluateFitServicePlan(plan);
  const rows = toDimensionDisplayRows(plan.checks, { ...result, state });
  const preferredDisplay = document.documentElement.dataset.unitSystem;
  const display =
    preferredDisplay === 'imperial' || preferredDisplay === 'both' ? preferredDisplay : 'metric';
  const preview = renderFitServiceAsciiPreview(form.mode, form.values, display);
  const svgPlan = renderFitServiceSvgPlan(rows, state, display);
  const previewSvg = document.querySelector<HTMLElement>('[data-fit-service-preview-svg]');
  const previewArt = document.querySelector<HTMLElement>('[data-fit-service-preview-ascii]');
  const previewSummary = document.querySelector<HTMLElement>('[data-fit-service-preview-summary]');
  if (previewSvg) previewSvg.innerHTML = svgPlan;
  if (previewArt) {
    previewArt.textContent = preview.art;
    previewArt.setAttribute('aria-label', preview.description);
  }
  if (previewSummary) previewSummary.textContent = preview.summary;
  const missingRequirements = plan.missingRequirements ?? [];
  updateSummary(state, rows, plan.compatibility, missingRequirements);
  formatDimensionRows(rows);
  refreshCompatibility(plan.compatibility);
  refreshCandidates(plan.candidates);
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
  updateUnitNote(form);
  const stepper = form.querySelector<HTMLElement>('[data-fit-service-stepper]');
  stepper?.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-step-action]');
    if (!button || button.disabled) return;
    activeServiceStep += button.dataset.stepAction === 'next' ? 1 : -1;
    applyMobileServiceStep(true);
  });
  window.addEventListener('resize', () => applyMobileServiceStep());

  modeControl.addEventListener('change', () => {
    if (modeControl.tagName !== 'SELECT') return;
    const mode = getFitServiceModeForRoute(modeControl.value);
    if (!mode) return;
    renderFields(mode);
    const summary = document.getElementById('fit-services-summary');
    if (summary) summary.dataset.fitOrigin = 'example';
    const notice = form.querySelector<HTMLElement>('[data-fit-example-notice]');
    if (notice) notice.hidden = false;
    recompute();
    if (summary) {
      const label = summary.querySelector<HTMLElement>('[data-field="label"]');
      const stateLabel = label?.textContent
        ?.trim()
        .replace(/^(Example result|Your result)\s*—\s*/, '');
      const resultLabel = `Example result — ${stateLabel ?? 'Fit result'}`;
      if (label) label.textContent = resultLabel;
      const sticky = summary.querySelector<HTMLAnchorElement>('[data-fit-sticky]');
      const stickyLabel = sticky?.querySelector<HTMLElement>('[data-field="sticky-label"]');
      if (stickyLabel) stickyLabel.textContent = resultLabel;
      if (sticky) {
        sticky.setAttribute(
          'aria-label',
          `Fit services result: ${resultLabel}. View calculation details.`,
        );
      }
    }
  });

  const handleChange = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches('[data-candidate-size-width], [data-candidate-size-depth]')) {
      syncCandidateSizeRows();
    }
    updateConditionalFields();
    recompute();
  };
  form.addEventListener('input', handleChange);
  form.addEventListener('change', handleChange);
  form.addEventListener('click', handleCandidateSizeClick);
  form.addEventListener('submit', (event) => event.preventDefault());
  recompute();
}

init();

export {};
