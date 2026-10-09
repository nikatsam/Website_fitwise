import type { BedOrientation } from '../geometry';
import { computeScale, labelFontSizePx, mmToPx } from './scale';
import { formatFeetInches, formatMetric } from '../units';

export interface BedroomDiagramInput {
  diagramId: string;
  viewportWidthPx: number;
  viewportHeightPx: number;
  paddingPx: number;
  roomWidthMm: number;
  roomLengthMm: number;
  /** Physical bed/frame footprint before adding bedside tables. */
  bedFootprintWidthMm: number;
  bedFootprintLengthMm: number;
  orientation: BedOrientation;
  sideClearanceMm: number;
  footClearanceMm: number;
  /** One width per bedside table, in bed-width-axis order. */
  nightstandWidthsMm: number[];
  nightstandDepthMm: number;
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
 * Draws the bed/frame and measured bedside-table rectangles on the room axes.
 * In landscape orientation, both the bed and the tables rotate with the bed's
 * width axis; clearance bands follow the side/foot axes rather than fixed SVG
 * directions. Tables align with the headboard and have no inter-object gap.
 */
export function renderBedroomDiagramMarkup(input: BedroomDiagramInput): string {
  const {
    diagramId,
    viewportWidthPx,
    viewportHeightPx,
    paddingPx,
    roomWidthMm,
    roomLengthMm,
    bedFootprintWidthMm,
    bedFootprintLengthMm,
    orientation,
    sideClearanceMm,
    footClearanceMm,
    nightstandWidthsMm,
    nightstandDepthMm,
  } = input;

  if (orientation !== 'portrait' && orientation !== 'landscape') {
    throw new RangeError(`Unsupported bed orientation '${orientation}'.`);
  }
  if (
    !Number.isFinite(roomWidthMm) ||
    !Number.isFinite(roomLengthMm) ||
    !Number.isFinite(bedFootprintWidthMm) ||
    !Number.isFinite(bedFootprintLengthMm) ||
    roomWidthMm <= 0 ||
    roomLengthMm <= 0 ||
    bedFootprintWidthMm <= 0 ||
    bedFootprintLengthMm <= 0 ||
    !Number.isFinite(sideClearanceMm) ||
    sideClearanceMm < 0 ||
    !Number.isFinite(footClearanceMm) ||
    footClearanceMm < 0 ||
    !Number.isFinite(nightstandDepthMm) ||
    nightstandDepthMm < 0 ||
    nightstandWidthsMm.length > 2 ||
    nightstandWidthsMm.some((width) => !Number.isFinite(width) || width <= 0) ||
    (nightstandWidthsMm.length > 0 && nightstandDepthMm <= 0)
  ) {
    throw new RangeError('Bedroom diagram dimensions or bedside-table measurements are invalid.');
  }

  const scale = computeScale(
    viewportWidthPx - paddingPx * 2,
    viewportHeightPx - paddingPx * 2,
    roomWidthMm,
    roomLengthMm,
  );
  const originXMm = paddingPx / scale;
  const originYMm = paddingPx / scale;
  const roomFontSize = labelFontSizePx(scale);
  const bedFontSize = labelFontSizePx(scale);
  const arrowFontSize = labelFontSizePx(scale, 10, 16);

  const roomX = mmToPx(originXMm, scale);
  const roomY = mmToPx(originYMm, scale);
  const roomW = mmToPx(roomWidthMm, scale);
  const roomH = mmToPx(roomLengthMm, scale);

  const leftTableWidth = nightstandWidthsMm[0] ?? 0;
  const rightTableWidth = nightstandWidthsMm[1] ?? 0;
  const allTableWidth = leftTableWidth + rightTableWidth;
  const physicalTableDepth = nightstandWidthsMm.length > 0 ? nightstandDepthMm : 0;

  const objectWidthMm =
    orientation === 'portrait'
      ? bedFootprintWidthMm + allTableWidth
      : Math.max(bedFootprintLengthMm, physicalTableDepth);
  const objectLengthMm =
    orientation === 'portrait'
      ? Math.max(bedFootprintLengthMm, physicalTableDepth)
      : bedFootprintWidthMm + allTableWidth;
  const groupX = originXMm + (roomWidthMm - objectWidthMm) / 2;
  const groupY = originYMm + (roomLengthMm - objectLengthMm) / 2;

  const bedWidthMm = orientation === 'portrait' ? bedFootprintWidthMm : bedFootprintLengthMm;
  const bedLengthMm = orientation === 'portrait' ? bedFootprintLengthMm : bedFootprintWidthMm;
  const bedXmm = groupX + (orientation === 'portrait' ? leftTableWidth : 0);
  const bedYmm = groupY + (orientation === 'landscape' ? leftTableWidth : 0);
  const bedX = mmToPx(bedXmm, scale);
  const bedY = mmToPx(bedYmm, scale);
  const bedW = mmToPx(bedWidthMm, scale);
  const bedH = mmToPx(bedLengthMm, scale);

  const bedGroup = `
    <g class="diagram-object">
      <title>Bed and frame footprint</title>
      <rect x="${bedX}" y="${bedY}" width="${bedW}" height="${bedH}" class="diagram-object__rect" vector-effect="non-scaling-stroke" />
      <text x="${bedX + bedW / 2}" y="${bedY + bedH / 2}" class="diagram-object__label" font-size="${bedFontSize}" text-anchor="middle" dominant-baseline="middle">Bed</text>
    </g>`;

  const nightstandGroups: string[] = [];
  const addNightstand = (
    xMm: number,
    yMm: number,
    widthMm: number,
    depthMm: number,
    index: number,
  ) => {
    const width = mmToPx(widthMm, scale);
    const height = mmToPx(depthMm, scale);
    const x = mmToPx(xMm, scale);
    const y = mmToPx(yMm, scale);
    nightstandGroups.push(`
      <g class="diagram-object">
        <title>Bedside table ${index + 1} measured footprint</title>
        <rect x="${x}" y="${y}" width="${width}" height="${height}" class="diagram-object__rect" vector-effect="non-scaling-stroke" />
      </g>`);
  };

  if (orientation === 'portrait') {
    if (leftTableWidth > 0) addNightstand(groupX, groupY, leftTableWidth, physicalTableDepth, 0);
    if (rightTableWidth > 0) {
      addNightstand(bedXmm + bedFootprintWidthMm, groupY, rightTableWidth, physicalTableDepth, 1);
    }
  } else {
    if (leftTableWidth > 0) addNightstand(groupX, groupY, physicalTableDepth, leftTableWidth, 0);
    if (rightTableWidth > 0) {
      addNightstand(groupX, bedYmm + bedFootprintWidthMm, physicalTableDepth, rightTableWidth, 1);
    }
  }

  const sideClearanceZones =
    sideClearanceMm > 0
      ? orientation === 'portrait'
        ? `
      <g class="diagram-clearance">
        <rect x="${mmToPx(groupX - sideClearanceMm, scale)}" y="${mmToPx(groupY, scale)}" width="${mmToPx(sideClearanceMm, scale)}" height="${mmToPx(objectLengthMm, scale)}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>
      <g class="diagram-clearance">
        <rect x="${mmToPx(groupX + objectWidthMm, scale)}" y="${mmToPx(groupY, scale)}" width="${mmToPx(sideClearanceMm, scale)}" height="${mmToPx(objectLengthMm, scale)}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>`
        : `
      <g class="diagram-clearance">
        <rect x="${mmToPx(groupX, scale)}" y="${mmToPx(groupY - sideClearanceMm, scale)}" width="${mmToPx(objectWidthMm, scale)}" height="${mmToPx(sideClearanceMm, scale)}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>
      <g class="diagram-clearance">
        <rect x="${mmToPx(groupX, scale)}" y="${mmToPx(groupY + objectLengthMm, scale)}" width="${mmToPx(objectWidthMm, scale)}" height="${mmToPx(sideClearanceMm, scale)}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>`
      : '';

  const footClearanceZone =
    footClearanceMm > 0
      ? orientation === 'portrait'
        ? `
      <g class="diagram-clearance">
        <rect x="${bedX}" y="${mmToPx(bedYmm + bedFootprintLengthMm, scale)}" width="${mmToPx(bedFootprintWidthMm, scale)}" height="${mmToPx(footClearanceMm, scale)}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>`
        : `
      <g class="diagram-clearance">
        <rect x="${mmToPx(bedXmm + bedFootprintLengthMm, scale)}" y="${bedY}" width="${mmToPx(footClearanceMm, scale)}" height="${mmToPx(bedFootprintWidthMm, scale)}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>`
      : '';

  const arrowY = roomY + roomH + 24;
  const dimensionArrow = `
    <g class="diagram-arrow">
      <line x1="${roomX}" y1="${arrowY}" x2="${roomX + roomW}" y2="${arrowY}" class="diagram-arrow__line" marker-start="url(#${diagramId}-arrow-start)" marker-end="url(#${diagramId}-arrow-end)" vector-effect="non-scaling-stroke" />
      <text x="${roomX + roomW / 2}" y="${arrowY - 10}" class="diagram-arrow__label" font-size="${arrowFontSize}" text-anchor="middle">
        <tspan data-unit="metric">${formatMetric(roomWidthMm)}</tspan> <tspan data-unit="imperial">${formatFeetInches(roomWidthMm)}</tspan>
      </text>
    </g>`;

  return `
    <g class="diagram-space">
      <rect x="${roomX}" y="${roomY}" width="${roomW}" height="${roomH}" class="diagram-space__rect" vector-effect="non-scaling-stroke" />
      <text x="${roomX + 6}" y="${roomY + roomFontSize + 4}" class="diagram-space__label" font-size="${roomFontSize}">${escapeXml(`Room (${orientation})`)}</text>
    </g>
    ${sideClearanceZones}
    ${footClearanceZone}
    ${nightstandGroups.join('')}
    ${bedGroup}
    ${dimensionArrow}
  `.trim();
}
