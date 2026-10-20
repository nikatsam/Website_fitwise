import { formatMeasurement } from '../units';
import type { Locale } from '../../i18n/locale';
import { translate } from '../../i18n/text';

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 360;
const PAD = 36;

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (char) =>
    char === '<'
      ? '&lt;'
      : char === '>'
        ? '&gt;'
        : char === '&'
          ? '&amp;'
          : char === '"'
            ? '&quot;'
            : '&#39;',
  );
}

function unitTspans(mm: number): string {
  return `<tspan data-unit="metric">${escapeXml(formatMeasurement(mm, 'metric'))}</tspan><tspan data-unit="separator" aria-hidden="true"> / </tspan><tspan data-unit="imperial">${escapeXml(formatMeasurement(mm, 'imperial'))}</tspan>`;
}

function label(x: number, y: number, text: string, mm?: number, anchor = 'start'): string {
  const value = mm === undefined ? '' : `: ${unitTspans(mm)}`;
  return `<text x="${x}" y="${y}" class="diagram-space__label" font-size="13" text-anchor="${anchor}">${escapeXml(text)}${value}</text>`;
}

function positive(values: number[]): void {
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError('Diagram dimensions must be finite and non-negative.');
  }
}

export interface FanDiagramInput {
  locale?: Locale;
  ceilingHeightMm: number;
  roomShorterSideMm: number;
  bladeSpanMm: number;
  fanDropMm: number;
  downrodMm: number;
  minBladeHeightMm: number;
}

/** Side elevation: ceiling, floor, fan drop/downrod, blades, minimum-height line. */
export function renderFanDiagramMarkup(input: FanDiagramInput): string {
  const copy = (source: string) => translate(input.locale ?? 'en', source);
  positive([
    input.ceilingHeightMm,
    input.roomShorterSideMm,
    input.bladeSpanMm,
    input.fanDropMm,
    input.downrodMm,
    input.minBladeHeightMm,
  ]);
  const scale = Math.min(
    (VIEW_WIDTH - PAD * 2) / Math.max(input.roomShorterSideMm, input.bladeSpanMm),
    (VIEW_HEIGHT - PAD * 2) / input.ceilingHeightMm,
  );
  const px = (mm: number) => Math.round(mm * scale * 100) / 100;
  const roomW = px(Math.max(input.roomShorterSideMm, input.bladeSpanMm));
  const left = (VIEW_WIDTH - roomW) / 2;
  const ceilingY = PAD;
  const floorY = PAD + px(input.ceilingHeightMm);
  const cx = VIEW_WIDTH / 2;
  const bladeY = Math.min(floorY, ceilingY + px(input.fanDropMm + input.downrodMm));
  const minY = floorY - px(input.minBladeHeightMm);
  const half = px(input.bladeSpanMm) / 2;
  return [
    `<rect x="${left}" y="${ceilingY}" width="${roomW}" height="${floorY - ceilingY}" class="diagram-space__rect"></rect>`,
    `<line x1="${cx}" y1="${ceilingY}" x2="${cx}" y2="${bladeY}" class="diagram-object__rect" stroke-width="4"></line>`,
    `<rect x="${cx - half}" y="${bladeY - 3}" width="${half * 2}" height="6" class="diagram-object__rect"></rect>`,
    minY > ceilingY
      ? `<line x1="${left}" y1="${minY}" x2="${left + roomW}" y2="${minY}" class="diagram-clearance__rect" stroke-dasharray="4 4"></line>`
      : '',
    // Ceiling label sits above the room box; blades label above the blade bar, right of
    // the rod; minimum-height label below its dashed line, so the three never overlap.
    label(left, ceilingY - 8, copy('Ceiling'), input.ceilingHeightMm),
    label(
      cx + 8,
      Math.max(ceilingY + 14, bladeY - 8),
      copy('Blades'),
      Math.max(0, input.ceilingHeightMm - input.fanDropMm - input.downrodMm),
    ),
    minY > ceilingY
      ? label(
          left + 6,
          Math.min(floorY - 6, minY + 16),
          copy('Minimum blade height'),
          input.minBladeHeightMm,
        )
      : '',
    label(cx, floorY + 22, copy('Floor'), undefined, 'middle'),
  ].join('');
}

export interface TreeDiagramInput {
  locale?: Locale;
  ceilingHeightMm: number;
  treeHeightMm: number;
  standLiftMm: number;
  topperHeightMm: number;
  ceilingGapMm: number;
  treeDiameterMm?: number;
}

/** Side elevation: stand lift, tree cone, topper and target ceiling gap. */
export function renderTreeDiagramMarkup(input: TreeDiagramInput): string {
  const copy = (source: string) => translate(input.locale ?? 'en', source);
  positive([
    input.ceilingHeightMm,
    input.treeHeightMm,
    input.standLiftMm,
    input.topperHeightMm,
    input.ceilingGapMm,
  ]);
  const stack = input.standLiftMm + input.treeHeightMm + input.topperHeightMm;
  const diameter = input.treeDiameterMm ?? input.treeHeightMm * 0.58;
  const scale = (VIEW_HEIGHT - PAD * 2) / Math.max(input.ceilingHeightMm, stack);
  const px = (mm: number) => Math.round(mm * scale * 100) / 100;
  const floorY = PAD + px(Math.max(input.ceilingHeightMm, stack));
  const ceilingY = floorY - px(input.ceilingHeightMm);
  const cx = VIEW_WIDTH / 2;
  const baseY = floorY - px(input.standLiftMm);
  const tipY = baseY - px(input.treeHeightMm);
  const topY = tipY - px(input.topperHeightMm);
  const gapY = ceilingY + px(input.ceilingGapMm);
  const half = Math.min(px(diameter) / 2, VIEW_WIDTH / 2 - PAD);
  return [
    `<line x1="${PAD}" y1="${ceilingY}" x2="${VIEW_WIDTH - PAD}" y2="${ceilingY}" class="diagram-space__rect" stroke-width="2"></line>`,
    `<line x1="${PAD}" y1="${gapY}" x2="${VIEW_WIDTH - PAD}" y2="${gapY}" class="diagram-clearance__rect" stroke-dasharray="4 4"></line>`,
    `<line x1="${PAD}" y1="${floorY}" x2="${VIEW_WIDTH - PAD}" y2="${floorY}" class="diagram-space__rect" stroke-width="2"></line>`,
    input.standLiftMm > 0
      ? `<rect x="${cx - 18}" y="${baseY}" width="36" height="${floorY - baseY}" class="diagram-chair__rect"></rect>`
      : '',
    `<polygon points="${cx},${tipY} ${cx - half},${baseY} ${cx + half},${baseY}" class="diagram-object__rect"></polygon>`,
    input.topperHeightMm > 0
      ? `<rect x="${cx - 8}" y="${topY}" width="16" height="${tipY - topY}" class="diagram-clearance__rect"></rect>`
      : '',
    label(PAD + 4, ceilingY - 8, copy('Ceiling'), input.ceilingHeightMm),
    label(VIEW_WIDTH - PAD - 4, gapY + 16, copy('Target gap'), input.ceilingGapMm, 'end'),
    label(cx + half / 2 + 10, (tipY + baseY) / 2, copy('Tree'), input.treeHeightMm),
    label(cx, floorY + 22, copy('Floor'), undefined, 'middle'),
  ].join('');
}
