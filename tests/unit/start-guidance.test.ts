import { describe, expect, it } from 'vitest';
import { FIT_SERVICE_DEFINITIONS, getFitServiceDefaults } from '../../src/lib/geometry';
import {
  CORE_CALCULATOR_START_GUIDANCE,
  getFitServiceStartGuidance,
} from '../../src/lib/fit/start-guidance';

describe('Before you start guidance', () => {
  it('provides tailored guidance for each core calculator', () => {
    expect(Object.values(CORE_CALCULATOR_START_GUIDANCE)).toHaveLength(4);
    for (const items of Object.values(CORE_CALCULATOR_START_GUIDANCE)) {
      expect(items).toHaveLength(3);
      expect(items.every((item) => item.trim().length > 20)).toBe(true);
    }
  });

  it('provides at least three preparation tips for every service mode', () => {
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const items = getFitServiceStartGuidance(
        definition.mode,
        getFitServiceDefaults(definition.mode),
      );
      expect(items.length, definition.mode).toBeGreaterThanOrEqual(3);
      expect(
        items.every((item) => item.trim().length > 20),
        definition.mode,
      ).toBe(true);
    }
  });

  it('mentions exact model instructions before manufacturer-dependent checks', () => {
    const modes = [
      'appliance-install',
      'workspace-compatibility',
      'home-gym',
      'garden-structure',
      'garden-greenhouse',
      'garden-hot-tub',
      'garden-outdoor-kitchen',
      'garden-play-equipment',
    ] as const;
    for (const mode of modes) {
      expect(getFitServiceStartGuidance(mode, getFitServiceDefaults(mode)).join(' '), mode).toMatch(
        /manual|manufacturer|instructions|specification/i,
      );
    }

    const wallTv = getFitServiceDefaults('tv-fit');
    wallTv.setup = 'wall';
    expect(getFitServiceStartGuidance('tv-fit', wallTv).join(' ')).toMatch(
      /exact TV and mount manuals/i,
    );
  });
});
