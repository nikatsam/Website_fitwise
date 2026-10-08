import { describe, expect, it } from 'vitest';
import { renderBedroomDiagramMarkup, type BedroomDiagramInput } from '../../src/lib/diagram';

const baseInput: BedroomDiagramInput = {
  diagramId: 'test-bedroom-diagram',
  viewportWidthPx: 640,
  viewportHeightPx: 480,
  paddingPx: 60,
  roomWidthMm: 3048,
  roomLengthMm: 3658,
  bedFootprintWidthMm: 1500,
  bedFootprintLengthMm: 2000,
  orientation: 'portrait',
  sideClearanceMm: 300,
  footClearanceMm: 600,
  nightstandWidthsMm: [],
  nightstandDepthMm: 350,
};

describe('renderBedroomDiagramMarkup', () => {
  it('always renders a dashed room outline, a bed object and a dimension arrow', () => {
    const markup = renderBedroomDiagramMarkup(baseInput);
    expect(markup).toContain('diagram-space');
    expect(markup).toContain('Bed');
    expect(markup).toContain('diagram-arrow');
  });

  it('renders exactly one bed object group', () => {
    const markup = renderBedroomDiagramMarkup(baseInput);
    expect((markup.match(/class="diagram-object"/g) ?? []).length).toBe(1);
  });

  it('adds one extra object group per nightstand', () => {
    const withOne = renderBedroomDiagramMarkup({ ...baseInput, nightstandWidthsMm: [400] });
    const withTwo = renderBedroomDiagramMarkup({ ...baseInput, nightstandWidthsMm: [400, 400] });
    expect((withOne.match(/class="diagram-object"/g) ?? []).length).toBe(2);
    expect((withTwo.match(/class="diagram-object"/g) ?? []).length).toBe(3);
  });

  it('renders bedside tables and clearances along the rotated bed axes', () => {
    const portrait = renderBedroomDiagramMarkup({
      ...baseInput,
      orientation: 'portrait',
      nightstandWidthsMm: [460, 460],
    });
    const landscape = renderBedroomDiagramMarkup({
      ...baseInput,
      orientation: 'landscape',
      nightstandWidthsMm: [460, 460],
    });

    expect((portrait.match(/class="diagram-object"/g) ?? []).length).toBe(3);
    expect((landscape.match(/class="diagram-object"/g) ?? []).length).toBe(3);
    expect(portrait).toContain('Room (portrait)');
    expect(landscape).toContain('Room (landscape)');
  });

  it('renders side clearance zones only when sideClearanceMm is positive', () => {
    const noFootInput = { ...baseInput, footClearanceMm: 0 };
    const withClearance = renderBedroomDiagramMarkup(noFootInput);
    const withoutClearance = renderBedroomDiagramMarkup({ ...noFootInput, sideClearanceMm: 0 });
    expect((withClearance.match(/class="diagram-clearance"/g) ?? []).length).toBe(2);
    expect(withoutClearance).not.toContain('diagram-clearance');
  });

  it('renders a foot clearance zone only when footClearanceMm is positive', () => {
    const withFoot = renderBedroomDiagramMarkup(baseInput);
    const withoutFoot = renderBedroomDiagramMarkup({
      ...baseInput,
      sideClearanceMm: 0,
      footClearanceMm: 0,
    });
    expect(withFoot).toContain('diagram-clearance');
    expect(withoutFoot).not.toContain('diagram-clearance');
  });

  it('includes both metric and imperial dimension labels for CSS-driven toggling', () => {
    const markup = renderBedroomDiagramMarkup(baseInput);
    expect(markup).toContain('data-unit="metric"');
    expect(markup).toContain('data-unit="imperial"');
  });

  it('rejects non-positive room dimensions via the underlying scale computation', () => {
    expect(() => renderBedroomDiagramMarkup({ ...baseInput, roomWidthMm: 0 })).toThrow();
  });
});
