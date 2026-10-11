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
      expect(items.every((item) => item.text.trim().length > 20)).toBe(true);
      expect(items.some((item) => item.type === 'required')).toBe(true);
      expect(
        items.every((item) => ['required', 'optional', 'verification'].includes(item.type)),
      ).toBe(true);
    }
    expect(CORE_CALCULATOR_START_GUIDANCE.workspace.map((item) => item.text).join(' ')).toMatch(
      /monitor.*desk|desk.*monitor/i,
    );
    expect(CORE_CALCULATOR_START_GUIDANCE.bedroom.map((item) => item.text).join(' ')).toMatch(
      /bed frame.*room|room.*bed frame/i,
    );
    expect(CORE_CALCULATOR_START_GUIDANCE.dining.map((item) => item.text).join(' ')).toMatch(
      /table.*chair|chair.*table/i,
    );
  });

  it('provides at least three preparation tips for every service mode', () => {
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const items = getFitServiceStartGuidance(
        definition.mode,
        getFitServiceDefaults(definition.mode),
      );
      expect(items.length, definition.mode).toBeGreaterThanOrEqual(3);
      expect(
        items.every((item) => item.text.trim().length > 20),
        definition.mode,
      ).toBe(true);
      expect(
        items.some((item) => item.type === 'required'),
        definition.mode,
      ).toBe(true);
      expect(
        items.every((item) => ['required', 'optional', 'verification'].includes(item.type)),
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
      expect(
        getFitServiceStartGuidance(mode, getFitServiceDefaults(mode))
          .map((item) => item.text)
          .join(' '),
        mode,
      ).toMatch(/manual|manufacturer|instructions|specification/i);
    }

    const wallTv = getFitServiceDefaults('tv-fit');
    wallTv.setup = 'wall';
    expect(
      getFitServiceStartGuidance('tv-fit', wallTv)
        .map((item) => item.text)
        .join(' '),
    ).toMatch(/exact TV and mount manuals/i);
  });

  it('marks optional information separately from required measurements and verification sources', () => {
    expect(CORE_CALCULATOR_START_GUIDANCE.workspace.map((item) => item.type)).toContain(
      'verification',
    );
    expect(CORE_CALCULATOR_START_GUIDANCE.dining.map((item) => item.type)).toContain('optional');
    expect(
      getFitServiceStartGuidance(
        'garden-play-equipment',
        getFitServiceDefaults('garden-play-equipment'),
      ).map((item) => item.type),
    ).toContain('verification');
  });

  it('keeps each service preparation list anchored to its task', () => {
    const taskTerms: Record<(typeof FIT_SERVICE_DEFINITIONS)[number]['mode'], RegExp> = {
      'appliance-install': /appliance|installation opening/i,
      'delivery-route': /doorway|corridor|turn|stair/i,
      'workspace-compatibility': /monitor|desk|arm/i,
      'tv-fit': /TV|stand|mount/i,
      'home-gym': /equipment|operating|ceiling/i,
      storage: /stored object|storage|aisle/i,
      'pool-room': /table|cue/i,
      'vehicle-garage': /vehicle|garage/i,
      'garden-structure': /structure|plot|overhang/i,
      'garden-patio-dining': /table|chair|patio/i,
      'garden-shed-storage': /shed|stored object/i,
      'garden-greenhouse': /greenhouse|plot/i,
      'garden-hot-tub': /tub|patio|cover/i,
      'garden-outdoor-kitchen': /kitchen|patio|work/i,
      'garden-play-equipment': /play|equipment|use.zone/i,
    };

    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const copy = getFitServiceStartGuidance(
        definition.mode,
        getFitServiceDefaults(definition.mode),
      )
        .map((item) => item.text)
        .join(' ');
      expect(copy, definition.mode).toMatch(taskTerms[definition.mode]);
    }
  });
});
