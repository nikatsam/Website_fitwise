import { describe, expect, it } from 'vitest';
import { renderUniversalDiagramMarkup, type UniversalDiagramInput } from '../../src/lib/diagram';

const baseInput: UniversalDiagramInput = {
  diagramId: 'universal-test',
  spaceWidthMm: 3000,
  spaceDepthMm: 2500,
  objectWidthMm: 800,
  objectDepthMm: 600,
  clearanceEachSideMm: 0,
  orientation: 'width-depth',
};

describe('renderUniversalDiagramMarkup', () => {
  it('renders a proportional top-down space and item footprint', () => {
    const markup = renderUniversalDiagramMarkup(baseInput);
    expect(markup).toContain('data-universal-diagram="universal-test"');
    expect(markup).toContain('class="diagram-space__rect"');
    expect(markup).toContain('class="diagram-object__rect"');
    expect(markup).toContain('Top-down plan | width by depth');
    expect(markup).toContain('80.0 cm × 60.0 cm');
    expect(markup).toContain('300.0 cm × 250.0 cm');
  });

  it('rotates the displayed footprint with the selected orientation', () => {
    const markup = renderUniversalDiagramMarkup({ ...baseInput, orientation: 'depth-width' });
    expect(markup).toContain('Top-down plan | depth by width');
    expect(markup).toContain('60.0 cm × 80.0 cm');
  });

  it('adds the optional planning-margin outline only when requested', () => {
    expect(renderUniversalDiagramMarkup(baseInput)).not.toContain('diagram-clearance__rect');
    const markup = renderUniversalDiagramMarkup({ ...baseInput, clearanceEachSideMm: 100 });
    expect(markup).toContain('class="diagram-clearance__rect"');
    expect(markup).toContain('10.0 cm');
    expect(markup).toContain('0 ft 4 in');
  });

  it('includes metric and imperial units for the shared unit toggle', () => {
    const markup = renderUniversalDiagramMarkup(baseInput);
    expect(markup).toContain('data-unit="metric"');
    expect(markup).toContain('data-unit="imperial"');
    expect(markup).toContain('data-unit="separator"');
  });

  it('rejects invalid dimensions', () => {
    expect(() => renderUniversalDiagramMarkup({ ...baseInput, spaceWidthMm: 0 })).toThrow(
      RangeError,
    );
  });
});
