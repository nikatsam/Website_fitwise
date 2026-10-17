import type { RugCoverageMode, RugPlacedOrientation } from '../geometry';
import { formatMeasurement } from '../units';
import type { Locale } from '../../i18n/locale';
import { translate } from '../../i18n/text';

export interface RugDiagramInput {
  diagramId: string;
  locale?: Locale;
  roomWidthMm: number;
  roomDepthMm: number;
  rugWidthMm: number;
  rugDepthMm: number;
  wallGapEachSideMm: number;
  orientation: RugPlacedOrientation;
  checkFurniture: boolean;
  coverageMode: RugCoverageMode;
  furnitureWidthMm?: number;
  furnitureDepthMm?: number;
  furnitureMarginEachSideMm: number;
  frontOverlapMm?: number;
  frontExtensionMm?: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
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

function unitText(label: string, widthMm: number, depthMm: number, y: number): string {
  return `<text x="28" y="${y}" class="diagram-space__label" font-size="14">${escapeXml(label)}: <tspan data-unit="metric">${escapeXml(formatMeasurement(widthMm, 'metric'))} × ${escapeXml(formatMeasurement(depthMm, 'metric'))}</tspan><tspan data-unit="separator" aria-hidden="true"> / </tspan><tspan data-unit="imperial">${escapeXml(formatMeasurement(widthMm, 'imperial'))} × ${escapeXml(formatMeasurement(depthMm, 'imperial'))}</tspan></text>`;
}

/** Draws a centered room/rug comparison and a separate furniture coverage relationship sketch. */
export function renderRugDiagramMarkup(input: RugDiagramInput): string {
  const locale = input.locale ?? 'en';
  const copy = (source: string) => translate(locale, source);
  const requiredPositive = [
    input.roomWidthMm,
    input.roomDepthMm,
    input.rugWidthMm,
    input.rugDepthMm,
    ...(input.checkFurniture ? [input.furnitureWidthMm, input.furnitureDepthMm] : []),
  ];
  if (
    requiredPositive.some((value) => value === undefined || !Number.isFinite(value) || value <= 0)
  ) {
    throw new RangeError('Rug diagram dimensions must be finite and positive.');
  }
  if (
    !Number.isFinite(input.wallGapEachSideMm) ||
    input.wallGapEachSideMm < 0 ||
    !Number.isFinite(input.furnitureMarginEachSideMm) ||
    input.furnitureMarginEachSideMm < 0
  ) {
    throw new RangeError('Rug diagram margins must be finite and non-negative.');
  }

  const rotated = input.orientation === 'depth-width';
  const rugWidthMm = rotated ? input.rugDepthMm : input.rugWidthMm;
  const rugDepthMm = rotated ? input.rugWidthMm : input.rugDepthMm;
  const viewWidth = 480;
  const padding = 36;
  const roomShapeHeight = 300;
  const roomBoundsWidth = Math.max(input.roomWidthMm, rugWidthMm + input.wallGapEachSideMm * 2);
  const roomBoundsDepth = Math.max(input.roomDepthMm, rugDepthMm + input.wallGapEachSideMm * 2);
  const roomScale = Math.min(
    (viewWidth - padding * 2) / roomBoundsWidth,
    (roomShapeHeight - padding * 2) / roomBoundsDepth,
  );
  const roomPx = (mm: number) => Math.round(mm * roomScale * 100) / 100;
  const roomCenterX = viewWidth / 2;
  const roomCenterY = 160;
  const roomRect: Rect = {
    x: roomCenterX - roomPx(input.roomWidthMm) / 2,
    y: roomCenterY - roomPx(input.roomDepthMm) / 2,
    width: roomPx(input.roomWidthMm),
    height: roomPx(input.roomDepthMm),
  };
  const rugRect: Rect = {
    x: roomCenterX - roomPx(rugWidthMm) / 2,
    y: roomCenterY - roomPx(rugDepthMm) / 2,
    width: roomPx(rugWidthMm),
    height: roomPx(rugDepthMm),
  };
  const wallTargetRect: Rect = {
    x: roomCenterX - roomPx(rugWidthMm + input.wallGapEachSideMm * 2) / 2,
    y: roomCenterY - roomPx(rugDepthMm + input.wallGapEachSideMm * 2) / 2,
    width: roomPx(rugWidthMm + input.wallGapEachSideMm * 2),
    height: roomPx(rugDepthMm + input.wallGapEachSideMm * 2),
  };

  const roomMarkup = `
    <text x="28" y="20" class="diagram-space__label" font-size="14">${escapeXml(copy('ROOM PLAN | centered dimensional comparison'))}</text>
    <rect class="diagram-space__rect" x="${roomRect.x}" y="${roomRect.y}" width="${roomRect.width}" height="${roomRect.height}" />
    ${input.wallGapEachSideMm > 0 ? `<rect class="diagram-clearance__rect" x="${wallTargetRect.x}" y="${wallTargetRect.y}" width="${wallTargetRect.width}" height="${wallTargetRect.height}" />` : ''}
    <rect class="diagram-object__rect" x="${rugRect.x}" y="${rugRect.y}" width="${rugRect.width}" height="${rugRect.height}" />
    <text x="${roomRect.x + 7}" y="${roomRect.y + 18}" class="diagram-space__label" font-size="13">${escapeXml(copy('ROOM'))}</text>
    <text x="${roomCenterX}" y="${roomCenterY}" class="diagram-object__label" text-anchor="middle" dominant-baseline="middle" font-size="16">${escapeXml(copy('RUG'))}</text>
    ${unitText(copy('Room'), input.roomWidthMm, input.roomDepthMm, 302)}
    ${unitText(copy('Rug on room axes'), rugWidthMm, rugDepthMm, 326)}
    ${input.wallGapEachSideMm > 0 ? `<text x="28" y="348" class="diagram-clearance__label" font-size="13">${escapeXml(copy('Dotted outline adds the user-selected wall border on each side.'))}</text>` : ''}
  `;

  let relationshipMarkup: string;
  if (!input.checkFurniture) {
    relationshipMarkup = `
      <text x="28" y="382" class="diagram-space__label" font-size="14">${escapeXml(copy('FURNITURE COVERAGE | not checked'))}</text>
      <text x="28" y="420" class="diagram-clearance__label" font-size="14">${escapeXml(copy('Enable the measured footprint check to compare furniture and rug dimensions.'))}</text>
    `;
  } else {
    const furnitureWidthMm = input.furnitureWidthMm!;
    const furnitureDepthMm = input.furnitureDepthMm!;
    const relationPadding = 28;
    const relationAreaHeight = 152;
    const relationTop = 397;
    const requiredWidthMm = furnitureWidthMm + input.furnitureMarginEachSideMm * 2;
    const relationBoundsWidthMm = Math.max(rugWidthMm, requiredWidthMm);
    let relationBoundsDepthMm: number;
    let furnitureRect: Rect;
    let relationRugRect: Rect;
    let targetRect: Rect | undefined;

    if (input.coverageMode === 'full-footprint') {
      relationBoundsDepthMm = Math.max(
        rugDepthMm,
        furnitureDepthMm + input.furnitureMarginEachSideMm * 2,
      );
    } else {
      const overlap = input.frontOverlapMm ?? Number.NaN;
      const extension = input.frontExtensionMm ?? 0;
      if (
        !Number.isFinite(overlap) ||
        overlap <= 0 ||
        overlap > furnitureDepthMm ||
        !Number.isFinite(extension) ||
        extension < 0
      ) {
        throw new RangeError('Rug front-edge diagram inputs are invalid.');
      }
      relationBoundsDepthMm = Math.max(
        rugDepthMm,
        furnitureDepthMm + rugDepthMm - overlap,
        furnitureDepthMm + extension,
      );
    }
    if (!Number.isFinite(relationBoundsWidthMm) || !Number.isFinite(relationBoundsDepthMm)) {
      throw new RangeError('Rug relationship diagram dimensions must remain finite.');
    }

    const relationScale = Math.min(
      (viewWidth - relationPadding * 2) / relationBoundsWidthMm,
      (relationAreaHeight - 34) / relationBoundsDepthMm,
    );
    const relationPx = (mm: number) => Math.round(mm * relationScale * 100) / 100;
    const relationCenterX = viewWidth / 2;
    const rugWidthPx = relationPx(rugWidthMm);
    const furnitureWidthPx = relationPx(furnitureWidthMm);
    relationRugRect = {
      x: relationCenterX - rugWidthPx / 2,
      y: relationTop + 24,
      width: rugWidthPx,
      height: relationPx(rugDepthMm),
    };

    if (input.coverageMode === 'full-footprint') {
      const furnitureDepthPx = relationPx(furnitureDepthMm);
      const furnitureMarginPx = relationPx(input.furnitureMarginEachSideMm);
      const furnitureCenterY = relationTop + relationAreaHeight / 2;
      furnitureRect = {
        x: relationCenterX - furnitureWidthPx / 2,
        y: furnitureCenterY - furnitureDepthPx / 2,
        width: furnitureWidthPx,
        height: furnitureDepthPx,
      };
      if (input.furnitureMarginEachSideMm > 0) {
        targetRect = {
          x: furnitureRect.x - furnitureMarginPx,
          y: furnitureRect.y - furnitureMarginPx,
          width: furnitureWidthPx + furnitureMarginPx * 2,
          height: furnitureDepthPx + furnitureMarginPx * 2,
        };
      }
      relationshipMarkup = `
        <text x="28" y="382" class="diagram-space__label" font-size="14">${escapeXml(copy('FURNITURE RELATIONSHIP | full footprint on rug'))}</text>
        ${targetRect ? `<rect class="diagram-clearance__rect" x="${targetRect.x}" y="${targetRect.y}" width="${targetRect.width}" height="${targetRect.height}" />` : ''}
        <rect class="diagram-object__rect" x="${relationRugRect.x}" y="${relationRugRect.y}" width="${relationRugRect.width}" height="${relationRugRect.height}" />
        <rect class="diagram-chair__rect" x="${furnitureRect.x}" y="${furnitureRect.y}" width="${furnitureRect.width}" height="${furnitureRect.height}" />
        ${furnitureRect.width > 95 && furnitureRect.height > 28 ? `<text x="${relationCenterX}" y="${furnitureRect.y + furnitureRect.height / 2}" class="diagram-object__label" text-anchor="middle" dominant-baseline="middle" font-size="13">${escapeXml(copy('USE ZONE'))}</text>` : ''}
        ${unitText(copy('Furniture/use zone'), furnitureWidthMm, furnitureDepthMm, 584)}
      `;
    } else {
      const overlap = input.frontOverlapMm!;
      const extension = input.frontExtensionMm ?? 0;
      const furnitureDepthPx = relationPx(furnitureDepthMm);
      const overlapPx = relationPx(overlap);
      const extensionPx = relationPx(extension);
      const furnitureY = relationTop + 25;
      const frontEdgeY = furnitureY + furnitureDepthPx;
      furnitureRect = {
        x: relationCenterX - furnitureWidthPx / 2,
        y: furnitureY,
        width: furnitureWidthPx,
        height: furnitureDepthPx,
      };
      relationRugRect = {
        x: relationCenterX - rugWidthPx / 2,
        y: frontEdgeY - overlapPx,
        width: rugWidthPx,
        height: relationPx(rugDepthMm),
      };
      const sideMarginPx = relationPx(input.furnitureMarginEachSideMm);
      if (input.furnitureMarginEachSideMm > 0) {
        targetRect = {
          x: furnitureRect.x - sideMarginPx,
          y: furnitureRect.y,
          width: furnitureWidthPx + sideMarginPx * 2,
          height: furnitureDepthPx,
        };
      }
      relationshipMarkup = `
        <text x="28" y="382" class="diagram-space__label" font-size="14">${escapeXml(copy('FURNITURE RELATIONSHIP | front-edge overlap'))}</text>
        <rect class="diagram-object__rect" x="${relationRugRect.x}" y="${relationRugRect.y}" width="${relationRugRect.width}" height="${relationRugRect.height}" />
        ${targetRect ? `<rect class="diagram-clearance__rect" x="${targetRect.x}" y="${targetRect.y}" width="${targetRect.width}" height="${targetRect.height}" />` : ''}
        <rect class="diagram-chair__rect" x="${furnitureRect.x}" y="${furnitureRect.y}" width="${furnitureRect.width}" height="${furnitureRect.height}" />
        <line x1="${relationPadding}" y1="${frontEdgeY}" x2="${viewWidth - relationPadding}" y2="${frontEdgeY}" class="diagram-arrow__line" stroke-dasharray="4 3" />
        <line x1="${relationPadding}" y1="${frontEdgeY + extensionPx}" x2="${viewWidth - relationPadding}" y2="${frontEdgeY + extensionPx}" class="diagram-arrow__line" stroke-dasharray="1 4" />
        ${furnitureRect.width > 95 && furnitureRect.height > 28 ? `<text x="${relationCenterX}" y="${furnitureRect.y + furnitureRect.height / 2}" class="diagram-object__label" text-anchor="middle" dominant-baseline="middle" font-size="13">${escapeXml(copy('FURNITURE'))}</text>` : ''}
        <text x="28" y="584" class="diagram-clearance__label" font-size="13">${escapeXml(copy('Dashed line marks the furniture front; dotted line marks the selected rug extension target.'))}</text>
      `;
    }
  }

  return `<g data-rug-diagram="${escapeXml(input.diagramId)}">
    ${roomMarkup}
    ${relationshipMarkup!}
  </g>`;
}
