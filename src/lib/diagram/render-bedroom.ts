import { computeScale, mmToPx, labelFontSizePx } from './scale';
import { formatMetric, formatFeetInches } from '../units';

export interface BedroomDiagramInput {
  diagramId: string;
  viewportWidthPx: number;
  viewportHeightPx: number;
  paddingPx: number;
  roomWidthMm: number;
  roomLengthMm: number;
  /** Bed footprint WIDTH as oriented onto the room (room_width axis). */
  bedRoomWidthMm: number;
  /** Bed footprint LENGTH as oriented onto the room (room_length axis). */
  bedRoomLengthMm: number;
  sideClearanceMm: number;
  footClearanceMm: number;
  nightstandWidthsMm: number[];
}

/**
 * Builds the dynamic inner SVG markup for the bedroom FitCheck (room outline,
 * bed footprint, optional nightstands, side/foot clearance zones, a width
 * dimension arrow) as a plain string — the bedroom counterpart of
 * src/lib/diagram/render-workspace.ts, used both for the build-time default
 * answer and the browser's live recompute so they can never drift apart.
 */
export function renderBedroomDiagramMarkup(input: BedroomDiagramInput): string {
  const {
    diagramId,
    viewportWidthPx,
    viewportHeightPx,
    paddingPx,
    roomWidthMm,
    roomLengthMm,
    bedRoomWidthMm,
    bedRoomLengthMm,
    sideClearanceMm,
    footClearanceMm,
    nightstandWidthsMm,
  } = input;

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

  // nightstandWidthsMm[0] sits left of the bed, [1] sits right, matching
  // src/lib/geometry/bedroom.ts's assumption that nightstand width is added
  // to the hard width footprint (buildBedRoomChecks' footprintWithNightstands).
  const nightstandTotalMm = nightstandWidthsMm.reduce((sum, w) => sum + w, 0);
  const leftNightstandWidthMm = nightstandWidthsMm[0] ?? 0;
  const rightNightstandWidthMm = nightstandWidthsMm[1] ?? 0;
  const bedOnlyWidthMm = bedRoomWidthMm - nightstandTotalMm;

  const groupStartXMm = originXMm + (roomWidthMm - bedRoomWidthMm) / 2;
  const bedStartXMm = groupStartXMm + leftNightstandWidthMm;

  const bedX = mmToPx(bedStartXMm, scale);
  const bedY = mmToPx(originYMm, scale);
  const bedW = mmToPx(bedOnlyWidthMm, scale);
  const bedH = mmToPx(bedRoomLengthMm, scale);

  const bedGroup = `
    <g class="diagram-object">
      <rect x="${bedX}" y="${bedY}" width="${bedW}" height="${bedH}" class="diagram-object__rect" vector-effect="non-scaling-stroke" />
      <text x="${bedX + bedW / 2}" y="${bedY + bedH / 2}" class="diagram-object__label" font-size="${bedFontSize}" text-anchor="middle" dominant-baseline="middle">Bed</text>
    </g>`;

  const nightstandHeightMm = Math.min(
    bedRoomLengthMm * 0.25,
    Math.max(leftNightstandWidthMm, rightNightstandWidthMm),
  );
  const nightstandGroups: string[] = [];
  if (leftNightstandWidthMm > 0) {
    const x = mmToPx(groupStartXMm, scale);
    const w = mmToPx(leftNightstandWidthMm, scale);
    const h = mmToPx(nightstandHeightMm, scale);
    nightstandGroups.push(`
      <g class="diagram-object">
        <rect x="${x}" y="${bedY}" width="${w}" height="${h}" class="diagram-object__rect" vector-effect="non-scaling-stroke" />
      </g>`);
  }
  if (rightNightstandWidthMm > 0) {
    const x = mmToPx(bedStartXMm + bedOnlyWidthMm, scale);
    const w = mmToPx(rightNightstandWidthMm, scale);
    const h = mmToPx(nightstandHeightMm, scale);
    nightstandGroups.push(`
      <g class="diagram-object">
        <rect x="${x}" y="${bedY}" width="${w}" height="${h}" class="diagram-object__rect" vector-effect="non-scaling-stroke" />
      </g>`);
  }

  const sideClearanceY = mmToPx(originYMm, scale);
  const sideClearanceH = mmToPx(bedRoomLengthMm, scale);
  const leftClearanceX = mmToPx(groupStartXMm - sideClearanceMm, scale);
  const rightClearanceX = mmToPx(groupStartXMm + bedRoomWidthMm, scale);
  const clearanceW = mmToPx(sideClearanceMm, scale);

  const sideClearanceZones =
    sideClearanceMm > 0
      ? `
      <g class="diagram-clearance">
        <rect x="${leftClearanceX}" y="${sideClearanceY}" width="${clearanceW}" height="${sideClearanceH}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>
      <g class="diagram-clearance">
        <rect x="${rightClearanceX}" y="${sideClearanceY}" width="${clearanceW}" height="${sideClearanceH}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>`
      : '';

  const footClearanceY = mmToPx(originYMm + bedRoomLengthMm, scale);
  const footClearanceH = mmToPx(footClearanceMm, scale);
  const footClearanceZone =
    footClearanceMm > 0
      ? `
      <g class="diagram-clearance">
        <rect x="${bedX}" y="${footClearanceY}" width="${bedW}" height="${footClearanceH}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />
      </g>`
      : '';

  const arrowY = roomY + roomH + 24;
  const dimensionArrow = `
    <g class="diagram-arrow">
      <line x1="${roomX}" y1="${arrowY}" x2="${roomX + roomW}" y2="${arrowY}" class="diagram-arrow__line" marker-start="url(#${diagramId}-arrow-start)" marker-end="url(#${diagramId}-arrow-end)" vector-effect="non-scaling-stroke" />
      <text x="${roomX + roomW / 2}" y="${arrowY - 10}" class="diagram-arrow__label" font-size="${arrowFontSize}" text-anchor="middle">
        <tspan data-unit="metric">${formatMetric(roomWidthMm)}</tspan><tspan data-unit="imperial">${formatFeetInches(roomWidthMm)}</tspan>
      </text>
    </g>`;

  return `
    <g class="diagram-space">
      <rect x="${roomX}" y="${roomY}" width="${roomW}" height="${roomH}" class="diagram-space__rect" vector-effect="non-scaling-stroke" />
      <text x="${roomX + 6}" y="${roomY + roomFontSize + 4}" class="diagram-space__label" font-size="${roomFontSize}">Room</text>
    </g>
    ${sideClearanceZones}
    ${footClearanceZone}
    ${nightstandGroups.join('')}
    ${bedGroup}
    ${dimensionArrow}
  `.trim();
}
