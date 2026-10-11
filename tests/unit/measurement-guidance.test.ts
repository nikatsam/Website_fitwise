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
      const guidance = getCoreMeasurementGuidance(calculator, field);
      expect(CORE_MEASUREMENT_GUIDANCE[calculator][field], `${calculator}:${field}`).toBeDefined();
      expect(guidance?.summaryHelp.length, `${calculator}:${field} summary`).toBeGreaterThan(20);
      expect(
        guidance?.measureHelp.length,
        `${calculator}:${field} measurement help`,
      ).toBeGreaterThan(20);
      if (guidance?.example) expect(guidance.example.length).toBeGreaterThan(20);
    }
  });

  it('provides contextual help for every measured length in every service mode', () => {
    const missing: string[] = [];
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      for (const field of definition.fields.filter((item) => item.type === 'length')) {
        const guidance = getFitServiceMeasurementGuidance(definition.mode, field.name);
        if (!guidance) {
          missing.push(`${definition.mode}:${field.name}`);
          continue;
        }
        expect(
          guidance.summaryHelp.length,
          `${definition.mode}:${field.name} summary`,
        ).toBeGreaterThan(20);
        expect(
          guidance.measureHelp.length,
          `${definition.mode}:${field.name} help`,
        ).toBeGreaterThan(20);
        if (guidance.example) expect(guidance.example.length).toBeGreaterThan(20);
      }
    }
    expect(missing).toEqual([]);
  });

  it('attaches exact-source guidance to every source/specification/compatibility input', () => {
    const missing: string[] = [];
    const sourceFields =
      /source|manual.*reference|spec.*reference|page.*reference|vesa|weight|load|clamp/i;

    for (const definition of FIT_SERVICE_DEFINITIONS) {
      for (const field of definition.fields.filter((item) => sourceFields.test(item.name))) {
        const guidance = getFitServiceMeasurementGuidance(definition.mode, field.name);
        if (!guidance?.sourceRequirement) missing.push(`${definition.mode}:${field.name}`);
      }
    }

    expect(missing).toEqual([]);
  });

  it('uses model-specific guidance and diagrams for source, route and safety zones', () => {
    const applianceSource = getFitServiceMeasurementGuidance(
      'appliance-install',
      'clearanceManualReference',
    );
    const deliveryTurn = getFitServiceMeasurementGuidance('delivery-route', 'turnDepth');
    const playZone = getFitServiceMeasurementGuidance('garden-play-equipment', 'useZoneFront');

    expect(applianceSource?.summaryHelp).toContain('exact make and model');
    expect(applianceSource?.sourceRequirement).toContain('exact model');
    expect(renderMeasurementHelpMarkup('appliance-source', applianceSource!)).toContain(
      'measurement-help__source',
    );
    expect(deliveryTurn?.diagram).toBe('route');
    expect(playZone?.diagram).toBe('operating-zone');
    expect(renderMeasurementHelpMarkup('play-front-help', playZone!)).toContain(
      'play-front-help-diagram-title',
    );
    expect(renderMeasurementHelpMarkup('play-front-help', playZone!)).toMatch(
      /no generic child-safety zone/i,
    );
  });

  it('does not attach outside-dimension examples to object gaps', () => {
    const universalGap = getCoreMeasurementGuidance('universal', 'fit-item-gap');
    const storageGap = getFitServiceMeasurementGuidance('storage', 'itemGap');
    const monitorGap = getCoreMeasurementGuidance('workspace', 'monitor-gap');
    const userClearance = getFitServiceMeasurementGuidance('garden-structure', 'maintenanceLeft');

    expect(universalGap?.example).toContain('adjacent boxes');
    expect(storageGap?.example).toContain('adjacent boxes');
    expect(monitorGap?.example).toContain('outer bezels');
    expect(renderMeasurementHelpMarkup('storage-gap', storageGap!)).not.toMatch(
      /handles or bezels/i,
    );
    expect(renderMeasurementHelpMarkup('storage-gap', storageGap!)).toContain(
      'For two adjacent boxes, measure the open distance between their closest outside edges.',
    );
    expect(userClearance?.warning).toContain('does not establish a code');
    expect(renderMeasurementHelpMarkup('clearance-help', userClearance!)).toContain(
      'measurement-help__warning',
    );
  });

  it('keeps one-line help visible and collapses details behind a named question control', () => {
    const guidance = getCoreMeasurementGuidance('universal', 'fit-item-width');
    const html = renderMeasurementHelpMarkup('item-width-help', guidance!);

    expect(html).toContain('class="measurement-help__summary" id="item-width-help"');
    expect(html).toContain('class="measurement-help__indicator" aria-hidden="true">?</span>');
    expect(html).toContain('aria-label="Show detailed measuring help:');
    expect(html).not.toMatch(/<details[^>]+\sopen(?:=|\s|>)/i);
    expect(html).toContain('class="measurement-help__content"');
  });
});
