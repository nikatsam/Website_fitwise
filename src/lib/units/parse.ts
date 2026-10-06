import type { Millimetres } from '../../types';
import { cmToMm, mToMm, inchesToMm, feetInchesToMm } from './convert';

export type ParseLengthResult = { ok: true; valueMm: Millimetres } | { ok: false; error: string };

/**
 * Parses a user-entered length string into millimetres. Supports:
 * - plain numbers, interpreted using `assumeUnit` (default 'mm')
 * - explicit units: "140cm", "1.4m", "55in", "55"", "4ft", "4'"
 * - combined feet+inches: "4'7"", "4ft 7in", "4 ft 7 in"
 *
 * Returns a discriminated result rather than throwing, so callers (including
 * inline form validation) never need try/catch for expected bad input.
 */
export function parseLength(
  input: string,
  options: { assumeUnit?: 'mm' | 'cm' | 'm' | 'in' } = {},
): ParseLengthResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Enter a length.' };
  }

  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');

  // Combined feet + inches: 4'7", 4ft 7in, 4 ft 7 in, 4' 7"
  const feetInchesMatch = normalized.match(
    /^(\d+(?:\.\d+)?)\s*(?:'|ft|feet)\s*(\d+(?:\.\d+)?)\s*(?:"|in|inch(?:es)?)?$/,
  );
  if (feetInchesMatch) {
    const feet = Number(feetInchesMatch[1]);
    const inches = Number(feetInchesMatch[2]);
    return { ok: true, valueMm: feetInchesToMm({ feet, inches }) };
  }

  // Single unit: number + optional unit suffix.
  const singleMatch = normalized.match(
    /^(\d+(?:\.\d+)?)\s*(mm|millimetres?|cm|centimetres?|m|metres?|'|ft|feet|"|in|inch(?:es)?)?$/,
  );
  if (!singleMatch) {
    return { ok: false, error: `Could not parse "${input}" as a length.` };
  }

  const value = Number(singleMatch[1]);
  if (!Number.isFinite(value) || value < 0) {
    return { ok: false, error: `Length must be a non-negative number, got "${input}".` };
  }

  const unit = singleMatch[2];
  const resolvedUnit = unit ?? options.assumeUnit ?? 'mm';

  if (/^(mm|millimetres?)$/.test(resolvedUnit) || resolvedUnit === 'mm') {
    return { ok: true, valueMm: value };
  }
  if (/^(cm|centimetres?)$/.test(resolvedUnit)) {
    return { ok: true, valueMm: cmToMm(value) };
  }
  if (/^(m|metres?)$/.test(resolvedUnit)) {
    return { ok: true, valueMm: mToMm(value) };
  }
  if (/^(ft|feet|')$/.test(resolvedUnit)) {
    return { ok: true, valueMm: feetInchesToMm({ feet: value, inches: 0 }) };
  }
  if (/^(in|inch(?:es)?|")$/.test(resolvedUnit)) {
    return { ok: true, valueMm: inchesToMm(value) };
  }

  return { ok: false, error: `Unrecognized unit in "${input}".` };
}
