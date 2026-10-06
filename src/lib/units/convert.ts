import type { Millimetres } from '../../types';
import { MM_PER_CM, MM_PER_M, MM_PER_INCH, MM_PER_FOOT } from './constants';

/**
 * Pure, full-precision conversions. No rounding happens here — rounding is a
 * display concern only (specs/DATA_MODEL.md §9: "Round only for display,
 * never during intermediate fit calculation").
 */

export function mmToCm(mm: Millimetres): number {
  return mm / MM_PER_CM;
}

export function cmToMm(cm: number): Millimetres {
  return cm * MM_PER_CM;
}

export function mmToM(mm: Millimetres): number {
  return mm / MM_PER_M;
}

export function mToMm(m: number): Millimetres {
  return m * MM_PER_M;
}

export function mmToInches(mm: Millimetres): number {
  return mm / MM_PER_INCH;
}

export function inchesToMm(inches: number): Millimetres {
  return inches * MM_PER_INCH;
}

export function mmToFeet(mm: Millimetres): number {
  return mm / MM_PER_FOOT;
}

export function feetToMm(feet: number): Millimetres {
  return feet * MM_PER_FOOT;
}

export interface FeetInches {
  feet: number;
  inches: number;
}

/**
 * Decomposes a millimetre value into whole feet + full-precision remaining
 * inches. `inches` is NOT rounded; round only when formatting for display.
 */
export function mmToFeetInches(mm: Millimetres): FeetInches {
  const totalInches = mmToInches(mm);
  const feet = Math.trunc(totalInches / 12);
  const inches = totalInches - feet * 12;
  return { feet, inches };
}

export function feetInchesToMm(feetInches: FeetInches): Millimetres {
  return inchesToMm(feetInches.feet * 12 + feetInches.inches);
}
