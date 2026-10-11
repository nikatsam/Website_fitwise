import { describe, expect, it } from 'vitest';
import {
  FIT_SERVICE_DEFINITIONS,
  buildFitServicePlan,
  evaluateFitServicePlan,
  getFitServiceDefaults,
} from '../../src/lib/geometry';
import { toDimensionDisplayRows } from '../../src/lib/fit';
import { renderFitServiceAsciiPreview } from '../../src/lib/diagram/render-fit-service-ascii';
import { renderFitServiceSvgPlan } from '../../src/lib/diagram/render-fit-service-svg';

describe('Fit Services ASCII previews', () => {
  it('renders a pool table and cue envelope inside the game room', () => {
    const preview = renderFitServiceAsciiPreview('pool-room', getFitServiceDefaults('pool-room'));

    expect(preview.art).toContain('GAME ROOM');
    expect(preview.art).toContain('POOL TABLE');
    expect(preview.art).toContain('CUE-LENGTH ENVELOPE');
    expect(preview.summary).toContain('GAME ROOM: 440.0 cm x 550.0 cm');
  });

  it('renders the vehicle, open-door zone and garage-door width', () => {
    const preview = renderFitServiceAsciiPreview(
      'vehicle-garage',
      getFitServiceDefaults('vehicle-garage'),
    );

    expect(preview.art).toContain('GARAGE');
    expect(preview.art).toContain('VEHICLE');
    expect(preview.art).toContain('OPEN-DOOR / PARKING ZONE');
    expect(preview.summary).toContain('Door opening: 240.0 cm wide');
  });

  it('updates its dimension summary with changed inputs', () => {
    const values = getFitServiceDefaults('pool-room');
    values.tableWidth = 1600;

    expect(renderFitServiceAsciiPreview('pool-room', values).summary).toContain(
      'POOL TABLE: 160.0 cm x 250.0 cm',
    );
  });

  it('follows metric, imperial and both result display modes', () => {
    const values = getFitServiceDefaults('pool-room');
    values.tableWidth = 1600;
    expect(renderFitServiceAsciiPreview('pool-room', values, 'metric').summary).toContain(
      'POOL TABLE: 160.0 cm x 250.0 cm',
    );
    expect(renderFitServiceAsciiPreview('pool-room', values, 'imperial').summary).toContain(
      'POOL TABLE: 5 ft 3 in x 8 ft 2 in',
    );
    expect(renderFitServiceAsciiPreview('pool-room', values, 'both').summary).toContain(
      'POOL TABLE: 160.0 cm / 5 ft 3 in x 250.0 cm / 8 ft 2 in',
    );
  });

  it('provides a non-empty schematic for every fit-service mode', () => {
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const preview = renderFitServiceAsciiPreview(
        definition.mode,
        getFitServiceDefaults(definition.mode),
      );

      expect(preview.art, definition.mode).toContain('SCHEMATIC');
      expect(preview.description, definition.mode).not.toBe('');
      expect(preview.summary, definition.mode).not.toBe('');
    }
  });

  it('renders a responsive accessible SVG from shared calculation rows for every service mode', () => {
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const plan = buildFitServicePlan(definition.mode, getFitServiceDefaults(definition.mode));
      const { result, state } = evaluateFitServicePlan(plan);
      const rows = toDimensionDisplayRows(plan.checks, { ...result, state });
      const svg = renderFitServiceSvgPlan(rows, state, 'both');

      expect(svg, definition.mode).toContain('<svg class="fit-service-plan-svg" viewBox="0 0 360');
      expect(svg, definition.mode).toContain('role="img"');
      expect(svg, definition.mode).toContain('aria-labelledby=');
      expect(svg, definition.mode).toContain('Schematic, not to scale');
      expect(svg, definition.mode).toContain(' / ');
    }
  });
});
