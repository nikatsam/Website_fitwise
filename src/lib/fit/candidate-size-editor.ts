import { parseLength } from '../units';

export interface CandidateSizeInputRow {
  id: number;
  width: string;
  depth: string;
}

export function parseCandidateSizeInput(value: string): CandidateSizeInputRow[] {
  const rows = value
    .split(';')
    .map((candidate) => {
      const match = candidate.trim().match(/^(.+?)\s*[x×]\s*(.+)$/i);
      return match ? { width: match[1].trim(), depth: match[2].trim() } : { width: '', depth: '' };
    })
    .filter((row) => row.width || row.depth)
    .map((row, index) => ({ ...row, id: index + 1 }));
  return rows.length > 0 ? rows : [{ id: 1, width: '', depth: '' }];
}

export function validateCandidateSizeInputRow(row: CandidateSizeInputRow): string | null {
  const width = row.width.trim();
  const depth = row.depth.trim();
  if (!width && !depth) return null;
  if (!width || !depth) return 'Enter both width and depth, or remove this candidate row.';

  const parsedWidth = parseLength(width);
  if (!parsedWidth.ok) return `Width: ${parsedWidth.error}`;
  if (parsedWidth.valueMm <= 0) return 'Enter a width greater than zero.';

  const parsedDepth = parseLength(depth);
  if (!parsedDepth.ok) return `Depth: ${parsedDepth.error}`;
  if (parsedDepth.valueMm <= 0) return 'Enter a depth greater than zero.';
  return null;
}

export function serializeCandidateSizeInput(rows: CandidateSizeInputRow[]): string {
  return rows
    .filter((row) => row.width.trim() && row.depth.trim())
    .map((row) => `${row.width.trim()} x ${row.depth.trim()}`)
    .join('; ');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderCandidateSizeInputRow(fieldId: string, row: CandidateSizeInputRow): string {
  const widthId = `${fieldId}-width-${row.id}`;
  const depthId = `${fieldId}-depth-${row.id}`;
  const errorId = `${fieldId}-row-${row.id}-error`;
  const helpId = `${fieldId}-help`;
  return `<div class="candidate-size-editor__row" data-candidate-size-row data-row-id="${row.id}"><div class="field"><label for="${widthId}">Candidate ${row.id} width</label><input id="${widthId}" type="text" inputmode="text" data-candidate-size-width value="${escapeHtml(row.width)}" placeholder="e.g. 2.4 m" aria-describedby="${helpId} ${errorId}" /></div><div class="field"><label for="${depthId}">Candidate ${row.id} depth</label><input id="${depthId}" type="text" inputmode="text" data-candidate-size-depth value="${escapeHtml(row.depth)}" placeholder="e.g. 1.8 m" aria-describedby="${helpId} ${errorId}" /></div><button type="button" data-candidate-size-remove aria-label="Remove candidate ${row.id}">Remove</button><p class="field__error" id="${errorId}" data-candidate-size-error role="alert"></p></div>`;
}

export function renderCandidateSizeEditorMarkup(
  fieldId: string,
  value: string,
  required: boolean,
  conditionAttributes = '',
  helpMarkup = '',
): string {
  const helpId = `${fieldId}-help`;
  return `<div class="field candidate-size-editor" data-service-field data-name="candidateSizes"${conditionAttributes}><fieldset><legend>Candidate body sizes</legend><div class="candidate-size-editor__rows" data-candidate-size-rows>${parseCandidateSizeInput(
    value,
  )
    .map((row) => renderCandidateSizeInputRow(fieldId, row))
    .join(
      '',
    )}</div><button type="button" class="candidate-size-editor__add" data-candidate-size-add>+ Add another size</button><p class="field__note">Each row is one candidate. Enter its outside width and depth using any accepted units.</p><span class="field__error" id="${fieldId}-error" role="alert"></span><input id="${fieldId}" type="hidden" name="candidateSizes" data-service-control="text" value="${escapeHtml(value)}" aria-required="${required}" aria-describedby="${fieldId}-error ${helpId}" />${helpMarkup}</fieldset></div>`;
}
