import { describe, expect, it } from 'vitest';
import { evaluateFit } from '../../src/lib/fit';
import {
  FIT_SERVICE_DEFINITIONS,
  buildFitServicePlan,
  getFitServiceDefaults,
  type FitServiceMode,
} from '../../src/lib/geometry';

describe('Fit Services studio calculations', () => {
  it('exposes all seven requested fit relationships', () => {
    expect(
      FIT_SERVICE_DEFINITIONS.filter(
        (definition) => (definition.category ?? 'core') === 'core',
      ).map((definition) => definition.mode),
    ).toEqual([
      'appliance-install',
      'delivery-route',
      'workspace-compatibility',
      'tv-fit',
      'home-gym',
      'storage',
      'pool-room',
      'vehicle-garage',
    ]);
  });

  it('groups the Garden Fit vertical into its own multi-service studio', () => {
    expect(
      FIT_SERVICE_DEFINITIONS.filter((definition) => definition.category === 'garden').map(
        (definition) => definition.mode,
      ),
    ).toEqual([
      'garden-structure',
      'garden-patio-dining',
      'garden-shed-storage',
      'garden-greenhouse',
      'garden-hot-tub',
      'garden-outdoor-kitchen',
      'garden-play-equipment',
    ]);
  });

  it('separates appliance footprint from model/manual installation space', () => {
    const values = getFitServiceDefaults('appliance-install');
    values.sideClearance = 50;
    values.openingWidth = 630;
    const plan = buildFitServicePlan('appliance-install', values);
    const width = plan.checks.find((check) => check.dimension === 'appliance_width');
    expect(width?.minimumMm).toBe(600);
    expect(width?.recommendedMm).toBe(700);
    expect(width?.availableMm).toBe(630);
    expect(evaluateFit(plan.checks).state).toBe('tight');
  });

  it('reports route bottlenecks at doors and conservative turn envelopes', () => {
    const values = getFitServiceDefaults('delivery-route');
    values.frontDoorWidth = 650;
    values.turnWidth = 1000;
    const plan = buildFitServicePlan('delivery-route', values);
    expect(plan.checks.find((check) => check.dimension === 'front_door_width')?.minimumMm).toBe(
      700,
    );
    expect(plan.checks.find((check) => check.dimension === 'turn_width')?.minimumMm).toBeCloseTo(
      Math.hypot(900, 700),
    );
    expect(evaluateFit(plan.checks).state).toBe('does_not_fit');
  });

  it('checks workspace assembly dimensions plus VESA and monitor weight compatibility', () => {
    const values = getFitServiceDefaults('workspace-compatibility');
    const compatible = buildFitServicePlan('workspace-compatibility', values);
    expect(compatible.compatibility.every((check) => check.compatible)).toBe(true);
    values.monitorVesa = '200x200';
    values.monitorWeight = 14;
    const incompatible = buildFitServicePlan('workspace-compatibility', values);
    expect(incompatible.compatibility.map((check) => check.compatible)).toEqual([false, false]);
  });

  it('supports both TV-on-console and wall-mount calculation modes', () => {
    const standValues = getFitServiceDefaults('tv-fit');
    standValues.consoleWidth = 1100;
    expect(evaluateFit(buildFitServicePlan('tv-fit', standValues).checks).hardFit).toBe(false);

    const wallValues = getFitServiceDefaults('tv-fit');
    wallValues.setup = 'wall';
    const wallPlan = buildFitServicePlan('tv-fit', wallValues);
    expect(evaluateFit(wallPlan.checks).hardFit).toBe(true);
    expect(wallPlan.compatibility.every((check) => check.compatible)).toBe(true);
  });

  it('keeps gym operating clearances separate from equipment footprint', () => {
    const plan = buildFitServicePlan('home-gym', getFitServiceDefaults('home-gym'));
    const width = plan.checks.find((check) => check.dimension === 'gym_room_width');
    expect(width?.minimumMm).toBe(1200);
    expect(width?.recommendedMm).toBe(2200);
    expect(evaluateFit(plan.checks).state).toBe('fits');
  });

  it('estimates storage capacity as a single-layer grid and checks aisle preference', () => {
    const plan = buildFitServicePlan('storage', getFitServiceDefaults('storage'));
    expect(plan.capacity).toBe(12);
    expect(plan.capacityRequested).toBe(8);
    expect(plan.compatibility[0]?.compatible).toBe(true);
  });

  it('uses the entered cue length for pool-table room envelopes', () => {
    const plan = buildFitServicePlan('pool-room', getFitServiceDefaults('pool-room'));
    expect(plan.checks.find((check) => check.dimension === 'pool_room_width')?.minimumMm).toBe(
      4300,
    );
    expect(plan.checks.find((check) => check.dimension === 'pool_room_length')?.minimumMm).toBe(
      5400,
    );
    expect(evaluateFit(plan.checks).state).toBe('fits');
  });

  it('separates vehicle body fit, garage-door passage and open-door access space', () => {
    const plan = buildFitServicePlan('vehicle-garage', getFitServiceDefaults('vehicle-garage'));
    const width = plan.checks.find((check) => check.dimension === 'vehicle_garage_width');
    const opening = plan.checks.find((check) => check.dimension === 'vehicle_door_opening_width');
    expect(width?.minimumMm).toBe(1900);
    expect(width?.recommendedMm).toBe(3300);
    expect(opening?.minimumMm).toBe(1900);
    expect(opening?.availableMm).toBe(2400);
    expect(evaluateFit(plan.checks).state).toBe('fits');
  });

  it('rejects unsupported modes and malformed storage quantities', () => {
    expect(() => buildFitServicePlan('vehicle' as FitServiceMode, {})).toThrow(RangeError);
    const values = getFitServiceDefaults('storage');
    values.requestedQuantity = 0;
    expect(() => buildFitServicePlan('storage', values)).toThrow(RangeError);
  });
});
