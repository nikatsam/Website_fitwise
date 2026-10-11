import { describe, expect, it } from 'vitest';
import { featurePages } from '../../src/data/feature-pages';
import { evaluateFit } from '../../src/lib/fit';
import {
  FIT_SERVICE_DEFINITIONS,
  buildFitServicePlan,
  evaluateFitServicePlan,
  getFitServiceDefaults,
  type FitServiceMode,
} from '../../src/lib/geometry';

describe('Fit Services studio calculations', () => {
  it('uses concept-only labels for multi-unit length fields', () => {
    const fixedUnitLabels = FIT_SERVICE_DEFINITIONS.flatMap((definition) =>
      definition.fields
        .filter((field) => field.type === 'length' && /\(mm\b/i.test(field.label))
        .map((field) => `${definition.mode}:${field.name}=${field.label}`),
    );
    expect(fixedUnitLabels).toEqual([]);
  });

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
    expect(plan.missingRequirements).toEqual([
      {
        type: 'manual_reference',
        label: 'Installation clearance source',
        explanation:
          'The model-specific installation clearance has not been verified against an exact source.',
        action: 'Add the exact model manual or manufacturer specification.',
      },
    ]);
    expect(evaluateFitServicePlan(plan).state).toBe('needs_information');

    values.clearanceSource = 'exact-manual';
    values.clearanceManualReference = 'Example appliance manual, clearance section';
    const verifiedPlan = buildFitServicePlan('appliance-install', values);
    expect(verifiedPlan.missingRequirements).toEqual([]);
    expect(evaluateFitServicePlan(verifiedPlan).state).toBe('tight');
  });

  it('keeps zero installation allowance distinct from unknown clearance data', () => {
    const values = getFitServiceDefaults('appliance-install');
    expect(evaluateFitServicePlan(buildFitServicePlan('appliance-install', values)).state).toBe(
      'needs_information',
    );

    values.clearanceSource = 'my-selected-allowance';
    const selectedZeroPlan = buildFitServicePlan('appliance-install', values);
    expect(evaluateFitServicePlan(selectedZeroPlan).state).toBe('fits');
    expect(selectedZeroPlan.assumptions).toContain(
      'The clearance is your own selected allowance, not a manufacturer-verified installation requirement.',
    );

    values.clearanceSource = 'exact-manual';
    values.clearanceManualReference = 'Exact model manual, installation section';
    expect(evaluateFitServicePlan(buildFitServicePlan('appliance-install', values)).state).toBe(
      'fits',
    );
  });

  it('uses identical appliance verification and dimension results on dedicated and shared routes', () => {
    const appliancePages = featurePages.filter(
      (page) => page.kind === 'tool' && page.mode === 'appliance-install',
    );
    expect(appliancePages.map((page) => page.pageIntent.route)).toEqual([
      '/appliances/appliance-install-fit/',
      '/appliances/fridge-fit/',
      '/appliances/washer-fit/',
    ]);

    const values = getFitServiceDefaults('appliance-install');
    const sharedModeEvaluation = evaluateFitServicePlan(
      buildFitServicePlan('appliance-install', values),
    );
    expect(sharedModeEvaluation.state).toBe('needs_information');

    for (const page of appliancePages) {
      if (page.mode !== 'appliance-install') {
        throw new Error(`Expected appliance mode for ${page.pageIntent.route}.`);
      }
      const dedicatedModeEvaluation = evaluateFitServicePlan(
        buildFitServicePlan(page.mode, getFitServiceDefaults(page.mode)),
      );
      expect(dedicatedModeEvaluation.state).toBe(sharedModeEvaluation.state);
      expect(dedicatedModeEvaluation.result.dimensions).toEqual(
        sharedModeEvaluation.result.dimensions,
      );
    }
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
    expect(compatible.missingRequirements?.[0]?.type).toBe('compatibility_data');
    expect(compatible.missingRequirements?.[0]?.label).toBe('Monitor and arm compatibility data');
    values.compatibilitySource = 'personally-checked';
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
    expect(wallPlan.missingRequirements?.[0]?.type).toBe('compatibility_data');
    expect(wallPlan.missingRequirements?.[0]?.label).toBe('TV and mount compatibility data');
    wallValues.mountDataSource = 'exact-manual';
    wallValues.mountManualReference = 'TV and mount manuals, mounting section';
    expect(buildFitServicePlan('tv-fit', wallValues).missingRequirements).toEqual([]);
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

  it('requires a verified manufacturer use zone before treating play equipment as complete', () => {
    const values = getFitServiceDefaults('garden-play-equipment');
    const missingPlan = buildFitServicePlan('garden-play-equipment', values);
    expect(missingPlan.missingRequirements?.[0]).toMatchObject({
      type: 'safety_use_zone',
      label: 'Manufacturer play-equipment use zone',
    });
    expect(evaluateFitServicePlan(missingPlan).state).toBe('needs_information');
    values.useZoneSource = 'manual';
    values.manualReference = 'Exact play set manual, use-zone table';
    values.useZoneLeft = 1800;
    values.useZoneRight = 1800;
    values.useZoneFront = 1800;
    values.useZoneRear = 1800;
    expect(buildFitServicePlan('garden-play-equipment', values).missingRequirements).toEqual([]);
  });
});
