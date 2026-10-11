import type { ObjectOrientation } from '../geometry';
import { formatMeasurement } from '../units';

export interface UniversalDiagramInput {
  diagramId: string;
  spaceWidthMm: number;
  spaceDepthMm: number;
  objectWidthMm: number;
  objectDepthMm: number;
  clearanceEachSideMm: number;
  orientation: Exclude<ObjectOrientation, 'auto'>;
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

/** Renders a proportional top-down footprint comparison for the Universal FitCheck. */
export function renderUniversalDiagramMarkup(input: UniversalDiagramInput): string {
  const dimensions = [
    input.spaceWidthMm,
    input.spaceDepthMm,
    input.objectWidthMm,
    input.objectDepthMm,
    input.clearanceEachSideMm,
  ];
  if (
    dimensions.some((dimension) => !Number.isFinite(dimension)) ||
    input.spaceWidthMm <= 0 ||
    input.spaceDepthMm <= 0 ||
    input.objectWidthMm <= 0 ||
    input.objectDepthMm <= 0 ||
    input.clearanceEachSideMm < 0 ||
    (input.orientation !== 'width-depth' && input.orientation !== 'depth-width')
  ) {
    throw new RangeError('Universal diagram dimensions or orientation are invalid.');
  }

  const rotated = input.orientation === 'depth-width';
  const objectWidthMm = rotated ? input.objectDepthMm : input.objectWidthMm;
  const objectDepthMm = rotated ? input.objectWidthMm : input.objectDepthMm;
  const targetWidthMm = objectWidthMm + input.clearanceEachSideMm * 2;
  const targetDepthMm = objectDepthMm + input.clearanceEachSideMm * 2;
  const boundsWidthMm = Math.max(input.spaceWidthMm, targetWidthMm);
  const boundsDepthMm = Math.max(input.spaceDepthMm, targetDepthMm);
  const viewWidth = 640;
  const padding = 36;
  const shapeHeight = 270;
  const scale = Math.min(
    (viewWidth - padding * 2) / boundsWidthMm,
    (shapeHeight - padding * 2) / boundsDepthMm,
  );
  const centerX = viewWidth / 2;
  const centerY = padding + (shapeHeight - padding * 2) / 2;
  const px = (mm: number) => Math.round(mm * scale * 100) / 100;
  const rect = (widthMm: number, depthMm: number) => ({
    x: centerX - px(widthMm) / 2,
    y: centerY - px(depthMm) / 2,
    width: px(widthMm),
    height: px(depthMm),
  });
  const space = rect(input.spaceWidthMm, input.spaceDepthMm);
  const target = rect(targetWidthMm, targetDepthMm);
  const object = rect(objectWidthMm, objectDepthMm);
  const orientationLabel = rotated ? 'depth by width' : 'width by depth';
  const measurementLine = (label: string, widthMm: number, depthMm: number, y: number) =>
    `<text x="${padding}" y="${y}" class="diagram-space__label" font-size="14">${label}: <tspan data-unit="metric">${escapeXml(formatMeasurement(widthMm, 'metric'))} × ${escapeXml(formatMeasurement(depthMm, 'metric'))}</tspan><tspan data-unit="separator" aria-hidden="true"> / </tspan><tspan data-unit="imperial">${escapeXml(formatMeasurement(widthMm, 'imperial'))} × ${escapeXml(formatMeasurement(depthMm, 'imperial'))}</tspan></text>`;

  return `
    <g data-universal-diagram="${escapeXml(input.diagramId)}">
      <text x="${padding}" y="20" class="diagram-space__label" font-size="14">Top-down plan | ${orientationLabel}</text>
      <rect x="${space.x}" y="${space.y}" width="${space.width}" height="${space.height}" class="diagram-space__rect" vector-effect="non-scaling-stroke" />
      ${input.clearanceEachSideMm > 0 ? `<rect x="${target.x}" y="${target.y}" width="${target.width}" height="${target.height}" class="diagram-clearance__rect" vector-effect="non-scaling-stroke" />` : ''}
      <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" class="diagram-object__rect" vector-effect="non-scaling-stroke" />
      <text x="${centerX}" y="${centerY}" class="diagram-object__label" font-size="14" text-anchor="middle" dominant-baseline="middle">ITEM</text>
      ${measurementLine('Space', input.spaceWidthMm, input.spaceDepthMm, 330)}
      ${measurementLine('Item footprint', objectWidthMm, objectDepthMm, 356)}
      ${input.clearanceEachSideMm > 0 ? `<text x="${padding}" y="382" class="diagram-clearance__label" font-size="13">Dotted outline: <tspan data-unit="metric">${escapeXml(formatMeasurement(input.clearanceEachSideMm, 'metric'))}</tspan><tspan data-unit="separator" aria-hidden="true"> / </tspan><tspan data-unit="imperial">${escapeXml(formatMeasurement(input.clearanceEachSideMm, 'imperial'))}</tspan> planning margin on each side</text>` : ''}
    </g>
  `.trim();
}
