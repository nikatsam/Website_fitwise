import { computeScale, mmToPx, labelFontSizePx } from './scale';
import { formatMetric, formatFeetInches } from '../units';

export interface WorkspaceDiagramInput {
  diagramId: string;
  viewportWidthPx: number;
  viewportHeightPx: number;
  paddingPx: number;
  deskWidthMm: number;
  deskDepthMm: number;
  /** Physical width used per monitor (already resolved: override or derived screen width). */
  monitorWidthMm: number;
  monitorDepthMm: number;
  monitorCount: 1 | 2;
  gapMm: number;
  sideMarginMm: number;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

/**
 * Builds the dynamic inner SVG markup (desk outline, monitor(s), side
 * clearance zones, width dimension arrow) for the workspace FitCheck as a
 * plain string. Used both by WorkspaceFitCheck.astro at build time (for the
 * no-JS default answer) and by src/scripts/workspace-fitcheck.ts in the
 * browser (for live recompute) — one implementation, so server and client
 * output can never drift apart. Visual conventions (dashed space outline,
 * solid object fill, dotted clearance zone, always-present text labels)
 * mirror the generic src/components/diagram primitives.
 */
export function renderWorkspaceDiagramMarkup(input: WorkspaceDiagramInput): string {
  const {
    diagramId,
    viewportWidthPx,
    viewportHeightPx,
    paddingPx,
    deskWidthMm,
    deskDepthMm,
    monitorWidthMm,
    monitorDepthMm,
    monitorCount,
    gapMm,
    sideMarginMm,
  } = input;

  const scale = computeScale(
    viewportWidthPx - paddingPx * 2,
    viewportHeightPx - paddingPx * 2,
    deskWidthMm,
    deskDepthMm,
  );
  const originXMm = paddingPx / scale;
  const originYMm = paddingPx / scale;
  const spaceFontSize = labelFontSizePx(scale);
  const objectFontSize = labelFontSizePx(scale);
  const arrowFontSize = labelFontSizePx(scale, 10, 16);

  const configurationWidthMm = monitorWidthMm * monitorCount + gapMm * (monitorCount - 1);
  const configStartXMm = (deskWidthMm - configurationWidthMm) / 2;

  const deskX = mmToPx(originXMm, scale);
  const deskY = mmToPx(originYMm, scale);
  const deskW = mmToPx(deskWidthMm, scale);
  const deskH = mmToPx(deskDepthMm, scale);

  const monitorRects: string[] = [];
  for (let i = 0; i < monitorCount; i += 1) {
    const monitorXMm = originXMm + configStartXMm + i * (monitorWidthMm + gapMm);
    const x = mmToPx(monitorXMm, scale);
    const y = mmToPx(originYMm, scale);
    const w = mmToPx(monitorWidthMm, scale);
    const h = mmToPx(monitorDepthMm, scale);
    monitorRects.push(`
      <g class="diagram-object">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" class="diagram-object__rect" vector-effect="non-scaling-stroke" />
        <text x="${x + w / 2}" y="${y + h / 2}" class="diagram-object__label" font-size="${objectFontSize}" text-anchor="middle" dominant-baseline="middle">${escapeXml(`Monitor ${i + 1}`)}</text>
      </g>`);
  }

  const clearanceY = mmToPx(originYMm, scale);
  const clearanceH = mmToPx(monitorDepthMm, scale);
  const leftClearanceX = mmToPx(originXMm + configStartXMm - sideMarginMm, scale);
  const rightClearanceX = mmToPx(originXMm + configStartXMm + configurationWidthMm, scale);
  const clearanceW = mmToPx(sideMarginMm, scale);

  const clearanceZones =
    sideMarginMm > 0
      ? `
      <g class="diagram-clearance">
        <rect x="${leftClearanceX}" y="${clearanceY}" width="${clearanceW}" height="${clearanceH}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>
      <g class="diagram-clearance">
        <rect x="${rightClearanceX}" y="${clearanceY}" width="${clearanceW}" height="${clearanceH}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>`
      : '';

  const arrowY = mmToPx(originYMm + deskDepthMm, scale) + 24;
  const arrowX1 = deskX;
  const arrowX2 = deskX + deskW;
  const arrowLabelY = arrowY - 10;

  const dimensionArrow = `
    <g class="diagram-arrow">
      <line x1="${arrowX1}" y1="${arrowY}" x2="${arrowX2}" y2="${arrowY}" class="diagram-arrow__line" marker-start="url(#${diagramId}-arrow-start)" marker-end="url(#${diagramId}-arrow-end)" vector-effect="non-scaling-stroke" />
      <text x="${(arrowX1 + arrowX2) / 2}" y="${arrowLabelY}" class="diagram-arrow__label" font-size="${arrowFontSize}" text-anchor="middle">
        <tspan data-unit="metric">${escapeXml(formatMetric(deskWidthMm))}</tspan><tspan data-unit="imperial">${escapeXml(formatFeetInches(deskWidthMm))}</tspan>
      </text>
    </g>`;

  return `
    <g class="diagram-space">
      <rect x="${deskX}" y="${deskY}" width="${deskW}" height="${deskH}" class="diagram-space__rect" vector-effect="non-scaling-stroke" />
      <text x="${deskX + 6}" y="${deskY + spaceFontSize + 4}" class="diagram-space__label" font-size="${spaceFontSize}">Desk</text>
    </g>
    ${clearanceZones}
    ${monitorRects.join('')}
    ${dimensionArrow}
  `.trim();
}
