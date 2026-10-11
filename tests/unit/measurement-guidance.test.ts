import { describe, expect, it } from 'vitest';
import { FIT_SERVICE_DEFINITIONS } from '../../src/lib/geometry';
import {
  CORE_MEASUREMENT_GUIDANCE,
  getCoreMeasurementGuidance,
  getFitServiceMeasurementGuidance,
  renderMeasurementHelpMarkup,
} from '../../src/lib/fit/measurement-guidance';

describe('contextual measurement guidance', () => {
  it('covers non-obvious dimensions in all four core calculators', () => {
    const fields = [
      ['universal', 'fit-item-width'],
      ['universal', 'fit-item-depth'],
      ['universal', 'fit-item-height'],
      ['universal', 'fit-space-width'],
      ['universal', 'fit-space-depth'],
      ['universal', 'fit-space-height'],
      ['universal', 'fit-clearance'],
      ['universal', 'fit-orientation'],
      ['universal', 'fit-door-width'],
      ['universal', 'fit-door-height'],
      ['universal', 'fit-corridor-width'],
      ['universal', 'fit-item-gap'],
      ['workspace', 'desk-width'],
      ['workspace', 'desk-depth'],
      ['workspace', 'rear-cable-clearance'],
      ['workspace', 'keyboard-zone'],
      ['workspace', 'monitor-width-override'],
      ['workspace', 'monitor-gap'],
      ['workspace', 'side-margin'],
      ['workspace', 'monitor-diagonal'],
      ['workspace', 'monitor-aspect-ratio'],
      ['bedroom', 'room-width'],
      ['bedroom', 'room-length'],
      ['bedroom', 'custom-bed-width'],
      ['bedroom', 'custom-bed-length'],
      ['bedroom', 'side-clearance'],
      ['bedroom', 'foot-clearance'],
      ['bedroom', 'nightstand-width'],
      ['bedroom', 'nightstand-depth'],
      ['bedroom', 'wardrobe-door-width'],
      ['bedroom', 'wardrobe-door-angle'],
      ['bedroom', 'wardrobe-obstacle-gap'],
      ['bedroom', 'dresser-drawer-pullout'],
      ['bedroom', 'dresser-obstacle-gap'],
      ['dining', 'dining-table-width'],
      ['dining', 'dining-table-length'],
      ['dining', 'dining-room-width'],
      ['dining', 'dining-room-length'],
      ['dining', 'dining-chair-width'],
      ['dining', 'dining-chair-depth'],
      ['dining', 'dining-walking-clearance'],
    ] as const;

    for (const [calculator, field] of fields) {
      expect(CORE_MEASUREMENT_GUIDANCE[calculator][field], `${calculator}:${field}`).toBeDefined();
      expect(getCoreMeasurementGuidance(calculator, field)?.example.length).toBeGreaterThan(20);
    }
  });

  it('provides contextual help for every measured length in every service mode', () => {
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      for (const field of definition.fields.filter((item) => item.type === 'length')) {
        expect(
          getFitServiceMeasurementGuidance(definition.mode, field.name, field.label, field.type),
          `${definition.mode}:${field.name}`,
        ).toBeDefined();
        expect(
          getFitServiceMeasurementGuidance(definition.mode, field.name, field.label, field.type)
            ?.example.length,
          `${definition.mode}:${field.name} example`,
        ).toBeGreaterThan(20);
      }
    }
  });

  it('uses model-specific guidance and diagrams for source, route and safety zones', () => {
    const applianceSource = getFitServiceMeasurementGuidance(
      'appliance-install',
      'clearanceManualReference',
      'Exact manual reference',
      'text',
    );
    const deliveryTurn = getFitServiceMeasurementGuidance(
      'delivery-route',
      'turnDepth',
      'Turn landing depth',
      'length',
    );
    const playZone = getFitServiceMeasurementGuidance(
      'garden-play-equipment',
      'useZoneFront',
      'Manufacturer front use zone',
      'length',
    );

    expect(applianceSource?.summary).toContain('exact make and model');
    expect(deliveryTurn?.diagram).toBe('route');
    expect(playZone?.diagram).toBe('operating-zone');
    expect(renderMeasurementHelpMarkup('play-front-help', playZone!)).toContain(
      'play-front-help-diagram-title',
    );
    expect(renderMeasurementHelpMarkup('play-front-help', playZone!)).toMatch(
      /no generic child-safety zone/i,
    );
  });
});
