import type { Millimetres } from '../../types';
import { mmToCm, mmToM, mmToInches, mmToFeetInches } from './convert';

export type UnitSystem = 'metric' | 'imperial';
export type MeasurementDisplay = 'mm' | 'cm' | 'm' | UnitSystem;

/**
 * Rounds to a fixed number of decimals using a half-away-from-zero rule,
 * avoiding binary floating-point artifacts (e.g. `1.005.toFixed(2)` giving
 * `"1.00"`) by nudging through a small epsilon before rounding.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  const nudged = value * factor + (value >= 0 ? 1 : -1) * Number.EPSILON * factor * 10;
  return Math.round(nudged) / factor;
}

/** Deterministic "140.0 cm" style formatting. */
export function formatCm(mm: Millimetres, decimals = 1): string {
  return `${roundTo(mmToCm(mm), decimals).toFixed(decimals)} cm`;
}

/** Deterministic "1.40 m" style formatting. */
export function formatM(mm: Millimetres, decimals = 2): string {
  return `${roundTo(mmToM(mm), decimals).toFixed(decimals)} m`;
}

/** Deterministic "55.1 in" style formatting. */
export function formatInches(mm: Millimetres, decimals = 1): string {
  return `${roundTo(mmToInches(mm), decimals).toFixed(decimals)} in`;
}

/**
 * Deterministic "4 ft 7 in" style formatting. Inches are rounded to the
 * nearest whole inch; a rounded value of 12 carries into an extra foot so
 * output never reads "4 ft 12 in".
 */
export function formatFeetInches(mm: Millimetres): string {
  const { feet, inches } = mmToFeetInches(mm);
  let roundedInches = Math.round(inches);
  let roundedFeet = feet;
  if (roundedInches === 12) {
    roundedInches = 0;
    roundedFeet += 1;
  }
  return `${roundedFeet} ft ${roundedInches} in`;
}

/** Canonical public dimension formatting; all modes share finite-value validation. */
export function formatMeasurement(mm: Millimetres, display: MeasurementDisplay = 'mm'): string {
  if (!Number.isFinite(mm)) throw new RangeError(`Measurement must be finite, got ${mm}.`);
  if (display === 'cm') return formatCm(mm);
  if (display === 'm') return formatM(mm);
  if (display === 'metric') return formatMetric(mm);
  if (display === 'imperial') return formatFeetInches(mm);
  const rounded = roundTo(mm, 1);
  const value = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${value} mm`;
}

/**
 * Metric display defaults to centimetres under 10 m and metres at/above it,
 * matching how people naturally talk about furniture (cm) vs rooms (m).
 */
export function formatMetric(mm: Millimetres): string {
  return mm >= 10 * 1000 ? formatM(mm) : formatCm(mm);
}

export function formatLength(mm: Millimetres, system: UnitSystem): string {
  return formatMeasurement(mm, system);
}
