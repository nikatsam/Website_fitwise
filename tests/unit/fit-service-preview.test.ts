import { describe, expect, it } from 'vitest';
import { FIT_SERVICE_DEFINITIONS, getFitServiceDefaults } from '../../src/lib/geometry';
import { renderFitServiceAsciiPreview } from '../../src/lib/diagram/render-fit-service-ascii';

describe('Fit Services ASCII previews', () => {
  it('renders a pool table and cue envelope inside the game room', () => {
    const preview = renderFitServiceAsciiPreview('pool-room', getFitServiceDefaults('pool-room'));

    expect(preview.art).toContain('GAME ROOM');
    expect(preview.art).toContain('POOL TABLE');
    expect(preview.art).toContain('CUE-LENGTH ENVELOPE');
    expect(preview.summary).toContain('GAME ROOM: 4400 mm x 5500 mm');
  });

  it('renders the vehicle, open-door zone and garage-door width', () => {
    const preview = renderFitServiceAsciiPreview(
      'vehicle-garage',
      getFitServiceDefaults('vehicle-garage'),
    );

    expect(preview.art).toContain('GARAGE');
    expect(preview.art).toContain('VEHICLE');
    expect(preview.art).toContain('OPEN-DOOR / PARKING ZONE');
    expect(preview.summary).toContain('Door opening: 2400 mm wide');
  });

  it('updates its dimension summary with changed inputs', () => {
    const values = getFitServiceDefaults('pool-room');
    values.tableWidth = 1600;

    expect(renderFitServiceAsciiPreview('pool-room', values).summary).toContain(
      'POOL TABLE: 1600 mm x 2500 mm',
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
});
