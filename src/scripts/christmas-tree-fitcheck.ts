import { evaluateFit, toDimensionDisplayRows } from '../lib/fit';
import { treeAnswerHtml, treeAssumptions } from '../lib/fit/fan-tree-copy';
import { buildChristmasTreePlan, type ChristmasTreeInput } from '../lib/geometry';
import { renderTreeDiagramMarkup } from '../lib/diagram';
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

const DIAGRAM_ID = 'tree-fitcheck-diagram';

function updateConditionalFields(): boolean {
  const checkFloor = (document.getElementById('tree-check-floor') as HTMLInputElement | null)
    ?.checked;
  const floorFields = document.querySelector<HTMLElement>('[data-tree-floor-fields]');
  if (floorFields) floorFields.hidden = !checkFloor;
  return Boolean(checkFloor);
}

function readForm(): ChristmasTreeInput | null {
  const checkFloor = updateConditionalFields();
  const fields: Array<[string, keyof ChristmasTreeInput, boolean]> = [
    ['tree-ceiling-height', 'ceilingHeightMm', true],
    ['tree-height', 'treeHeightMm', true],
    ['tree-stand-lift', 'standLiftMm', false],
    ['tree-topper', 'topperHeightMm', false],
    ['tree-ceiling-gap', 'ceilingGapMm', false],
  ];
  if (checkFloor) {
    fields.push(
      ['tree-diameter', 'treeDiameterMm', true],
      ['tree-space-width', 'spaceWidthMm', true],
      ['tree-space-depth', 'spaceDepthMm', true],
      ['tree-floor-clearance', 'floorClearanceMm', false],
    );
  }
  const values: Record<string, number> = {};
  let invalid = false;
  for (const [id, key, required] of fields) {
    const value = readLength(id, required);
    if (value === undefined) invalid = true;
    else values[key] = value ?? 0;
  }
  if (invalid) return null;
  return { ...(values as unknown as ChristmasTreeInput), checkFloor };
}

function recompute(): void {
  const values = readForm();
  if (!values) return;
  const plan = buildChristmasTreePlan(values);
  const result = evaluateFit(plan.checks, treeAssumptions(locale, values.checkFloor));
  const rows = toDimensionDisplayRows(plan.checks, result).map((row) => ({
    ...row,
    label: translate(locale, row.label),
  }));
  const answer = document.querySelector<HTMLElement>('[data-tree-answer]');
  if (answer) answer.innerHTML = treeAnswerHtml(plan, locale);
  renderRows('tree-fitcheck-table', rows);
  renderSummary('tree-fitcheck-summary', result.state, rows);
  renderAssumptions('tree-fitcheck-assumptions', result.assumptions);
  renderDiagram(
    DIAGRAM_ID,
    renderTreeDiagramMarkup({
      locale,
      ceilingHeightMm: values.ceilingHeightMm,
      treeHeightMm: values.treeHeightMm,
      standLiftMm: values.standLiftMm,
      topperHeightMm: values.topperHeightMm,
      ceilingGapMm: values.ceilingGapMm,
      ...(values.checkFloor && values.treeDiameterMm
        ? { treeDiameterMm: values.treeDiameterMm }
        : {}),
    }),
    translateTemplate(
      locale,
      'Side view of a {tree} tree, stand and topper under a {ceiling} ceiling.',
      {
        tree: formatMeasurement(values.treeHeightMm, 'both'),
        ceiling: formatMeasurement(values.ceilingHeightMm, 'both'),
      },
    ),
  );
}

updateConditionalFields();
bindForm('[data-tree-fitcheck-form]', 'treeInitialized', recompute);
