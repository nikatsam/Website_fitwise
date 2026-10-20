import { evaluateFit, toDimensionDisplayRows } from '../lib/fit';
import { fanAnswerHtml, fanAssumptions } from '../lib/fit/fan-tree-copy';
import { buildCeilingFanPlan, type CeilingFanInput } from '../lib/geometry';
import { renderFanDiagramMarkup } from '../lib/diagram';
import { formatMeasurement } from '../lib/units';
import { translate, translateTemplate } from '../i18n/text';
import {
  bindForm,
  pageLocale as locale,
  readLength,
  renderAssumptions,
  renderDiagram,
  renderRows,
  renderSummary,
} from './fitcheck-dom';

const DIAGRAM_ID = 'fan-fitcheck-diagram';

type Values = Required<CeilingFanInput>;

function readForm(): Values | null {
  const fields: Array<[string, keyof Values, boolean]> = [
    ['fan-room-width', 'roomWidthMm', true],
    ['fan-room-length', 'roomLengthMm', true],
    ['fan-ceiling-height', 'ceilingHeightMm', true],
    ['fan-blade-span', 'bladeSpanMm', true],
    ['fan-drop', 'fanDropMm', false],
    ['fan-downrod', 'downrodMm', false],
    ['fan-min-blade', 'minBladeHeightMm', true],
    ['fan-preferred-blade', 'preferredBladeHeightMm', true],
    ['fan-wall-clearance', 'wallClearanceMm', false],
  ];
  const values: Partial<Values> = {};
  let invalid = false;
  for (const [id, key, required] of fields) {
    const value = readLength(id, required);
    if (value === undefined) invalid = true;
    else values[key] = value ?? 0;
  }
  return invalid ? null : (values as Values);
}

function recompute(): void {
  const values = readForm();
  if (!values) return;
  const plan = buildCeilingFanPlan(values);
  const preferred = Math.max(values.minBladeHeightMm, values.preferredBladeHeightMm);
  const result = evaluateFit(plan.checks, fanAssumptions(locale));
  const rows = toDimensionDisplayRows(plan.checks, result).map((row) => ({
    ...row,
    label: translate(locale, row.label),
  }));
  const answer = document.querySelector<HTMLElement>('[data-fan-answer]');
  if (answer) {
    answer.innerHTML = fanAnswerHtml(
      plan,
      {
        bladeSpanMm: values.bladeSpanMm,
        downrodMm: values.downrodMm,
        preferredBladeHeightMm: preferred,
      },
      locale,
    );
  }
  renderRows('fan-fitcheck-table', rows);
  renderSummary('fan-fitcheck-summary', result.state, rows);
  renderAssumptions('fan-fitcheck-assumptions', result.assumptions);
  renderDiagram(
    DIAGRAM_ID,
    renderFanDiagramMarkup({
      locale,
      ceilingHeightMm: values.ceilingHeightMm,
      roomShorterSideMm: Math.min(values.roomWidthMm, values.roomLengthMm),
      bladeSpanMm: values.bladeSpanMm,
      fanDropMm: values.fanDropMm,
      downrodMm: values.downrodMm,
      minBladeHeightMm: values.minBladeHeightMm,
    }),
    translateTemplate(
      locale,
      'Side view of a {ceiling} ceiling with a {span} fan; blades sit {blade} above the floor.',
      {
        ceiling: formatMeasurement(values.ceilingHeightMm, 'both'),
        span: formatMeasurement(values.bladeSpanMm, 'both'),
        blade: formatMeasurement(Math.max(0, plan.bladeHeightMm), 'both'),
      },
    ),
  );
}

bindForm('[data-fan-fitcheck-form]', 'fanInitialized', recompute);
