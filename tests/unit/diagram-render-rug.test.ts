import { describe, expect, it } from 'vitest';
import { renderRugDiagramMarkup, type RugDiagramInput } from '../../src/lib/diagram';

const fullFootprintInput: RugDiagramInput = {
  diagramId: 'rug-fitcheck-diagram',
  roomWidthMm: 4000,
  roomDepthMm: 5000,
  rugWidthMm: 2400,
  rugDepthMm: 3000,
  wallGapEachSideMm: 100,
  orientation: 'width-depth',
  checkFurniture: true,
  coverageMode: 'full-footprint',
  furnitureWidthMm: 1800,
  furnitureDepthMm: 2000,
  furnitureMarginEachSideMm: 100,
};

describe('renderRugDiagramMarkup', () => {
  it('draws a proportional room/rug comparison and full furniture coverage', () => {
    const markup = renderRugDiagramMarkup(fullFootprintInput);
    expect(markup).toContain('data-rug-diagram="rug-fitcheck-diagram"');
    expect(markup).toContain('class="diagram-space__rect"');
    expect(markup).toContain('class="diagram-object__rect"');
    expect(markup).toContain('class="diagram-chair__rect"');
    expect(markup).toContain('class="diagram-clearance__rect"');
    expect(markup).toContain('FURNITURE RELATIONSHIP | full footprint on rug');
    expect(markup).toContain('400.0 cm × 500.0 cm');
    expect(markup).toContain('180.0 cm × 200.0 cm');
  });

  it('renders the selected front-edge overlap and projection as a separate relationship view', () => {
    const markup = renderRugDiagramMarkup({
      ...fullFootprintInput,
      coverageMode: 'front-edge',
      furnitureDepthMm: 900,
      furnitureMarginEachSideMm: 100,
      frontOverlapMm: 150,
      frontExtensionMm: 500,
    });
    expect(markup).toContain('FURNITURE RELATIONSHIP | front-edge overlap');
    expect(markup).toContain('Dashed line marks the furniture front');
    expect(markup).toContain('stroke-dasharray="4 3"');
  });

  it('shows that the furniture relationship is unchecked when disabled', () => {
    const markup = renderRugDiagramMarkup({
      ...fullFootprintInput,
      checkFurniture: false,
    });
    expect(markup).toContain('FURNITURE COVERAGE | not checked');
    expect(markup).not.toContain('USE ZONE');
  });

  it('includes Metric and Imperial spans for the site unit toggle', () => {
    const markup = renderRugDiagramMarkup(fullFootprintInput);
    expect(markup).toContain('data-unit="metric"');
    expect(markup).toContain('data-unit="imperial"');
    expect(markup).toContain('data-unit="separator"');
  });

  it('rejects invalid dimensions and unsupported front-edge relationships', () => {
    expect(() => renderRugDiagramMarkup({ ...fullFootprintInput, rugWidthMm: 0 })).toThrow(
      RangeError,
    );
    expect(() =>
      renderRugDiagramMarkup({
        ...fullFootprintInput,
        coverageMode: 'front-edge',
        furnitureDepthMm: 900,
        frontOverlapMm: 1000,
      }),
    ).toThrow(RangeError);
  });
});
