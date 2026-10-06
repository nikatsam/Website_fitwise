import type { Millimetres } from '../../types';

/**
 * Largest uniform px-per-mm scale that fits a `spaceWidthMm` x `spaceDepthMm`
 * footprint inside a `containerWidthPx` x `containerHeightPx` box, preserving
 * aspect ratio (same approach for any space: desk/monitor or bed/room —
 * "scale is relative within each diagram", specs/ARCHITECTURE.md §4).
 */
export function computeScale(
  containerWidthPx: number,
  containerHeightPx: number,
  spaceWidthMm: Millimetres,
  spaceDepthMm: Millimetres,
): number {
  if (
    !Number.isFinite(containerWidthPx) ||
    !Number.isFinite(containerHeightPx) ||
    !(containerWidthPx > 0) ||
    !(containerHeightPx > 0)
  ) {
    throw new RangeError('containerWidthPx and containerHeightPx must both be > 0.');
  }
  if (
    !Number.isFinite(spaceWidthMm) ||
    !Number.isFinite(spaceDepthMm) ||
    !(spaceWidthMm > 0) ||
    !(spaceDepthMm > 0)
  ) {
    throw new RangeError('spaceWidthMm and spaceDepthMm must both be > 0.');
  }
  return Math.min(containerWidthPx / spaceWidthMm, containerHeightPx / spaceDepthMm);
}

export function mmToPx(valueMm: Millimetres, scale: number): number {
  return valueMm * scale;
}

/**
 * Clamped label font size in px for a given scale, so text stays legible
 * whether the diagram represents a small desk or a large room ("labels
 * remain usable on narrow screens", tasks/T011).
 */
export function labelFontSizePx(scale: number, min = 11, max = 18): number {
  if (
    !Number.isFinite(scale) ||
    scale < 0 ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min > max
  ) {
    throw new RangeError(
      'Scale and font-size bounds must be finite; scale must be non-negative and min <= max.',
    );
  }
  return Math.min(max, Math.max(min, scale * 30));
}
