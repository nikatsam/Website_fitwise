import { describe, expect, it } from 'vitest';
import {
  BEDROOM_FIT_PRESETS,
  DEFAULT_BEDROOM_FIT_PRESET_KEY,
  HEMNES_BEDSIDE_PRESET,
  HEMNES_DRAWER_PULL_OUT_MM,
  PAX_DOOR_LEAF_WIDTH_MM,
} from '../../src/lib/fitcheck/presets';

describe('sourced FitCheck presets', () => {
  it('defaults to an editable global mattress example with no assumed frame', () => {
    const preset = BEDROOM_FIT_PRESETS.find((item) => item.key === DEFAULT_BEDROOM_FIT_PRESET_KEY);
    expect(preset?.label).toContain('Custom mattress');
    expect(preset?.market).toBe('global');
    expect(preset?.mattressWidthMm).toBe(1600);
    expect(preset?.mattressLengthMm).toBe(2000);
    expect(preset?.frameAllowanceMm).toEqual({ left: 0, right: 0, head: 0, foot: 0 });
  });

  it('offers US mattress-only presets and UK measured-frame variants separately', () => {
    const usQueen = BEDROOM_FIT_PRESETS.find((item) => item.key === 'ent-bed-us-queen-mattress');
    const ukDouble = BEDROOM_FIT_PRESETS.find((item) => item.key === 'ent-bed-uk-double-frame');
    expect(usQueen?.frameAllowanceMm).toEqual({ left: 0, right: 0, head: 0, foot: 0 });
    expect(ukDouble?.frameAllowanceMm).toEqual({ left: 75, right: 75, head: 45, foot: 45 });
  });

  it('uses sourced bedside, wardrobe-door and dresser-pullout examples', () => {
    expect(HEMNES_BEDSIDE_PRESET.overallWidthMm.valueMm).toBe(460);
    expect(HEMNES_BEDSIDE_PRESET.overallDepthMm.valueMm).toBe(350);
    expect(PAX_DOOR_LEAF_WIDTH_MM).toBe(495);
    expect(HEMNES_DRAWER_PULL_OUT_MM).toBe(294);
  });
});
