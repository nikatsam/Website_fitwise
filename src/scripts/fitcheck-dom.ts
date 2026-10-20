/**
 * Shared browser helpers for the single-panel fit checks (ceiling fan,
 * Christmas tree). Mirrors the summary/table rendering used by the rug tool.
 */
import {
  getFitStateBadgeCopy,
  getFitSummaryCopy,
  getFitSummaryResultLabel,
  renderFitSummaryContentHtml,
  type DimensionDisplayRow,
  type FitState,
} from '../lib/fit';
import { formatMarginMeasurement, formatMeasurement, parseLength } from '../lib/units';
import type { Locale } from '../i18n/locale';
import { translate, translateTemplate } from '../i18n/text';
import { announceFitStateChange } from '../lib/fit/summary-announcement';

export const pageLocale: Locale =
  typeof document === 'undefined'
    ? 'en'
    : document.documentElement.lang.startsWith('es')
      ? 'es'
      : 'en';

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setError(id: string, message: string): void {
  document.getElementById(id)?.setAttribute('aria-invalid', 'true');
  const error = document.getElementById(`${id}-error`);
  if (error) error.textContent = translate(pageLocale, message);
}

function clearError(id: string): void {
  document.getElementById(id)?.removeAttribute('aria-invalid');
  const error = document.getElementById(`${id}-error`);
  if (error) error.textContent = '';
}

/** Parses a length input. Returns undefined when invalid (error shown), null when empty+optional. */
export function readLength(id: string, required: boolean): number | null | undefined {
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

function unitHtml(mm: number, margin = false): string {
  const format = margin ? formatMarginMeasurement : formatMeasurement;
  return `<span class="unit-value"><span data-unit="metric">${format(mm, 'metric')}</span><span data-unit="separator" aria-hidden="true"> / </span><span data-unit="imperial">${format(mm, 'imperial')}</span></span>`;
}

function signed(mm: number): string {
  return `<span>${mm > 0 ? '+' : mm < 0 ? '−' : ''}</span>${unitHtml(Math.abs(mm), true)}`;
}

export function renderRows(tableId: string, rows: DimensionDisplayRow[]): void {
  const tbody = document.querySelector<HTMLTableSectionElement>(`#${tableId} tbody`);
  if (!tbody) return;
  const t = (source: string) => translate(pageLocale, source);
  tbody.innerHTML = rows
    .map(
      (
        row,
      ) => `<tr data-dimension="${row.dimension}" data-hard-fit="${row.hardFit}" data-recommended-fit="${row.recommendedFit}">
        <th scope="row" data-label="${t('Dimension')}">${escapeHtml(row.label)}</th>
        <td data-label="${t('Required')}">${unitHtml(row.requiredMm)}</td>
        <td data-label="${t('Target')}">${unitHtml(row.recommendedMm)}</td>
        <td data-label="${t('Available')}">${unitHtml(row.availableMm)}</td>
        <td data-label="${t('Physical margin')}">${signed(row.physicalMarginMm)}</td>
        <td data-label="${t('Target margin')}">${signed(row.targetMarginMm)}</td>
      </tr>`,
    )
    .join('');
}

export function renderSummary(
  summaryId: string,
  state: FitState,
  rows: DimensionDisplayRow[],
): void {
  const summary = document.getElementById(summaryId);
  if (!summary) return;
  const locale = pageLocale;
  const summaryCopy = getFitSummaryCopy(state, rows, { locale });
  const label = getFitSummaryResultLabel(summaryCopy, summary.dataset.fitOrigin);
  const previousState = summary.dataset.fitState ?? state;
  announceFitStateChange(summary, previousState, state, label);
  summary.setAttribute('data-fit-state', state);
  summary.dataset.fitExact = String(summaryCopy.isExactFit);
  const icon = getFitStateBadgeCopy(state, locale).icon;
  const iconEl = summary.querySelector<HTMLElement>('[data-field="icon"]');
  if (iconEl) iconEl.textContent = icon;
  const labelEl = summary.querySelector<HTMLElement>('[data-field="label"]');
  if (labelEl) labelEl.textContent = label;
  const content = summary.querySelector<HTMLElement>('[data-fit-summary-content]');
  if (content) content.innerHTML = renderFitSummaryContentHtml(summaryCopy);
  const sticky = summary.querySelector<HTMLAnchorElement>('[data-fit-sticky]');
  if (!sticky) return;
  sticky.dataset.fitState = state;
  sticky.setAttribute(
    'aria-label',
    translateTemplate(locale, 'Fit result: {resultLabel}. View calculation details.', {
      resultLabel: label,
    }),
  );
  const stickyIcon = sticky.querySelector<HTMLElement>('[data-field="sticky-icon"]');
  if (stickyIcon) stickyIcon.textContent = icon;
  const stickyLabel = sticky.querySelector<HTMLElement>('[data-field="sticky-label"]');
  if (stickyLabel) stickyLabel.textContent = label;
  const detail = sticky.querySelector<HTMLElement>('[data-field="sticky-detail"]');
  if (detail) {
    detail.innerHTML = summaryCopy.isExactFit
      ? translate(locale, 'No measurement tolerance remains')
      : summaryCopy.marginMm !== null && summaryCopy.marginLabel
        ? `${unitHtml(summaryCopy.marginMm, true)} ${summaryCopy.marginLabel.toLowerCase()}`
        : state === 'needs_information'
          ? translate(locale, 'Measurement data needed')
          : translate(locale, 'Check result details');
  }
}

export function renderAssumptions(containerId: string, assumptions: string[]): void {
  const list = document.querySelector(`#${containerId} [data-field="items"]`);
  if (list) list.innerHTML = assumptions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

/** Replaces diagram content while keeping the arrow-marker <defs>. */
export function renderDiagram(diagramId: string, markup: string, summary: string): void {
  const svg = document.querySelector<SVGSVGElement>(
    `[data-diagram-id="${diagramId}"] .scale-diagram__svg`,
  );
  if (svg) {
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);
    const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wrapper.innerHTML = markup;
    while (wrapper.firstChild) svg.appendChild(wrapper.firstChild);
  }
  const caption = document.getElementById(`${diagramId}-caption`);
  if (caption) caption.textContent = summary;
}

/** Wires input/change events, ignoring the display-unit radio buttons. */
export function bindForm(selector: string, flag: string, recompute: () => void): void {
  const form = document.querySelector<HTMLFormElement>(selector);
  if (!form || form.dataset[flag] === 'true') return;
  form.dataset[flag] = 'true';
  const update = (event: Event) => {
    if (event.target instanceof HTMLInputElement && event.target.hasAttribute('data-unit-choice')) {
      return;
    }
    recompute();
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
}
