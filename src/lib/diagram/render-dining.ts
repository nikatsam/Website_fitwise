import type { DiningPlacedOrientation } from '../geometry';

export interface DiningDiagramInput {
  diagramId: string;
  roomWidthMm: number;
  roomLengthMm: number;
  tableWidthMm: number;
  tableLengthMm: number;
  chairWidthMm: number;
  chairEnvelopeDepthMm: number;
  chairsPerLongSide: number;
  chairsPerEnd: number;
  walkingClearanceMm: number;
  orientation: DiningPlacedOrientation;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Produces a scale-proportional top-down dining layout with table, chair and circulation envelopes. */
export function renderDiningDiagramMarkup(input: DiningDiagramInput): string {
  const viewWidth = 640;
  const viewHeight = 440;
  const padding = 28;
  const rotated = input.orientation === 'depth-width';
  const tableWidthMm = rotated ? input.tableLengthMm : input.tableWidthMm;
  const tableLengthMm = rotated ? input.tableWidthMm : input.tableLengthMm;
  const sideEnvelopeMm = input.chairsPerLongSide > 0 ? input.chairEnvelopeDepthMm * 2 : 0;
  const endEnvelopeMm = input.chairsPerEnd > 0 ? input.chairEnvelopeDepthMm * 2 : 0;
  const occupiedWidthMm = tableWidthMm + (rotated ? endEnvelopeMm : sideEnvelopeMm);
  const occupiedLengthMm = tableLengthMm + (rotated ? sideEnvelopeMm : endEnvelopeMm);
  const clearanceWidthMm = occupiedWidthMm + input.walkingClearanceMm * 2;
  const clearanceLengthMm = occupiedLengthMm + input.walkingClearanceMm * 2;
  const drawingWidthMm = Math.max(input.roomWidthMm, clearanceWidthMm) + 300;
  const drawingLengthMm = Math.max(input.roomLengthMm, clearanceLengthMm) + 300;
  const scale = Math.min(
    (viewWidth - padding * 2) / drawingWidthMm,
    (viewHeight - padding * 2) / drawingLengthMm,
  );
  const px = (value: number) => Math.round(value * scale * 100) / 100;
  const drawingWidthPx = px(drawingWidthMm);
  const drawingLengthPx = px(drawingLengthMm);
  const left = (viewWidth - drawingWidthPx) / 2;
  const top = (viewHeight - drawingLengthPx) / 2;
  const room: Rect = {
    x: left + px((drawingWidthMm - input.roomWidthMm) / 2),
    y: top + px((drawingLengthMm - input.roomLengthMm) / 2),
    width: px(input.roomWidthMm),
    height: px(input.roomLengthMm),
  };
  const table: Rect = {
    x: room.x + (room.width - px(tableWidthMm)) / 2,
    y: room.y + (room.height - px(tableLengthMm)) / 2,
    width: px(tableWidthMm),
    height: px(tableLengthMm),
  };
  const clearance: Rect = {
    x: table.x - px((occupiedWidthMm - tableWidthMm) / 2 + input.walkingClearanceMm),
    y: table.y - px((occupiedLengthMm - tableLengthMm) / 2 + input.walkingClearanceMm),
    width: px(clearanceWidthMm),
    height: px(clearanceLengthMm),
  };

  const chairs: Rect[] = [];
  for (let index = 0; index < input.chairsPerLongSide; index += 1) {
    const segment = tableLengthMm / input.chairsPerLongSide;
    const along = px(segment * index + (segment - input.chairWidthMm) / 2);
    const alongSize = px(input.chairWidthMm);
    for (const side of [-1, 1]) {
      if (!rotated) {
        chairs.push({
          x: side < 0 ? table.x - px(input.chairEnvelopeDepthMm) : table.x + table.width,
          y: table.y + along,
          width: px(input.chairEnvelopeDepthMm),
          height: alongSize,
        });
      } else {
        chairs.push({
          x: table.x + along,
          y: side < 0 ? table.y - px(input.chairEnvelopeDepthMm) : table.y + table.height,
          width: alongSize,
          height: px(input.chairEnvelopeDepthMm),
        });
      }
    }
  }
  for (let index = 0; index < input.chairsPerEnd; index += 1) {
    const segment = tableWidthMm / input.chairsPerEnd;
    const along = px(segment * index + (segment - input.chairWidthMm) / 2);
    const alongSize = px(input.chairWidthMm);
    for (const end of [-1, 1]) {
      if (!rotated) {
        chairs.push({
          x: table.x + along,
          y: end < 0 ? table.y - px(input.chairEnvelopeDepthMm) : table.y + table.height,
          width: alongSize,
          height: px(input.chairEnvelopeDepthMm),
        });
      } else {
        chairs.push({
          x: end < 0 ? table.x - px(input.chairEnvelopeDepthMm) : table.x + table.width,
          y: table.y + along,
          width: px(input.chairEnvelopeDepthMm),
          height: alongSize,
        });
      }
    }
  }

  const rectMarkup = (rect: Rect, className: string) =>
    `<rect class="${className}" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="3" />`;
  const tableLabelX = table.x + table.width / 2;
  const tableLabelY = table.y + table.height / 2;
  return `<g data-dining-diagram="${input.diagramId}">
    ${rectMarkup(room, 'diagram-space__rect')}
    <text class="diagram-space__label" x="${room.x + 6}" y="${room.y + 18}" font-size="14">ROOM</text>
    ${input.walkingClearanceMm > 0 ? rectMarkup(clearance, 'diagram-clearance__rect') : ''}
    ${chairs.map((chair) => rectMarkup(chair, 'diagram-chair__rect')).join('')}
    ${rectMarkup(table, 'diagram-object__rect')}
    <text class="diagram-object__label" x="${tableLabelX}" y="${tableLabelY}" text-anchor="middle" dominant-baseline="middle" font-size="16">TABLE</text>
  </g>`;
}
