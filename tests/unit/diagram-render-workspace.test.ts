import { describe, expect, it } from 'vitest';
import { renderWorkspaceDiagramMarkup, type WorkspaceDiagramInput } from '../../src/lib/diagram';

const baseInput: WorkspaceDiagramInput = {
  diagramId: 'test-diagram',
  viewportWidthPx: 640,
  viewportHeightPx: 360,
  paddingPx: 60,
  deskWidthMm: 1400,
  deskDepthMm: 700,
  monitorWidthMm: 613,
  monitorDepthMm: 200,
  monitorCount: 2,
  gapMm: 20,
  sideMarginMm: 38,
};

describe('renderWorkspaceDiagramMarkup', () => {
  it('renders one object group per monitor', () => {
    const markup = renderWorkspaceDiagramMarkup(baseInput);
    expect((markup.match(/class="diagram-object"/g) ?? []).length).toBe(2);
    expect(markup).toContain('Monitor 1');
    expect(markup).toContain('Monitor 2');
  });

  it('renders a single monitor when monitorCount is 1', () => {
    const markup = renderWorkspaceDiagramMarkup({ ...baseInput, monitorCount: 1 });
    expect((markup.match(/class="diagram-object"/g) ?? []).length).toBe(1);
    expect(markup).not.toContain('Monitor 2');
  });

  it('omits clearance zones entirely when sideMarginMm is 0', () => {
    const markup = renderWorkspaceDiagramMarkup({ ...baseInput, sideMarginMm: 0 });
    expect(markup).not.toContain('diagram-clearance');
  });

  it('renders clearance zones when sideMarginMm is positive', () => {
    const markup = renderWorkspaceDiagramMarkup(baseInput);
    expect((markup.match(/class="diagram-clearance"/g) ?? []).length).toBe(2);
  });

  it('always includes a dashed desk space outline and a dimension arrow', () => {
    const markup = renderWorkspaceDiagramMarkup(baseInput);
    expect(markup).toContain('diagram-space');
    expect(markup).toContain('diagram-arrow');
    expect(markup).toContain(`url(#${baseInput.diagramId}-arrow-start)`);
  });

  it('includes both metric and imperial dimension labels, toggled by CSS not JS', () => {
    const markup = renderWorkspaceDiagramMarkup(baseInput);
    expect(markup).toContain('data-unit="metric"');
    expect(markup).toContain('data-unit="imperial"');
  });

  it('escapes XML-significant characters so untrusted-looking input cannot break markup', () => {
    // diagramId is developer-controlled, not user input, but the escaper must
    // still behave correctly if ever fed a value containing XML metacharacters.
    const markup = renderWorkspaceDiagramMarkup({ ...baseInput, diagramId: 'id' });
    expect(markup).not.toMatch(/<script/i);
  });

  it('rejects non-positive desk or monitor dimensions via the underlying scale computation', () => {
    expect(() => renderWorkspaceDiagramMarkup({ ...baseInput, deskWidthMm: 0 })).toThrow();
  });
});
