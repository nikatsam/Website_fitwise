import { describe, expect, it } from 'vitest';
import { auditAccessibilityHtml } from '../../scripts/validate-accessibility.mjs';

describe('static HTML accessibility validation', () => {
  it('accepts labeled controls with valid descriptions and a labeled choice group', () => {
    const result = auditAccessibilityHtml(`
      <fieldset><legend>Furniture checks</legend>
        <label for="door">Check the door</label><input id="door" type="checkbox" name="checks">
        <label for="drawer">Check the drawer</label><input id="drawer" type="checkbox" name="checks">
      </fieldset>
      <label for="width">Width</label><input id="width" aria-describedby="width-error">
      <span id="width-error" role="alert"></span>
      <input type="hidden" name="mode">
    `);

    expect(result).toMatchObject({
      controls: 3,
      unnamed: [],
      duplicateIds: [],
      brokenDescriptions: [],
      ungroupedChoices: [],
    });
  });

  it('reports controls without a name and broken description references', () => {
    const result = auditAccessibilityHtml(
      '<form><input id="width" aria-describedby="missing"></form>',
    );

    expect(result.unnamed).toEqual(['input#width']);
    expect(result.brokenDescriptions).toEqual(['width: missing']);
  });

  it('reports duplicate IDs and choice groups without a group label', () => {
    const result = auditAccessibilityHtml(`
      <input id="same" type="radio" name="orientation" aria-label="Portrait">
      <input id="same" type="radio" name="orientation" aria-label="Landscape">
    `);

    expect(result.duplicateIds).toEqual(['same']);
    expect(result.ungroupedChoices).toEqual(['radio:orientation']);
  });

  it('requires visible measurement help to be associated with a form control', () => {
    expect(
      auditAccessibilityHtml(
        '<label for="width">Width</label><input id="width" aria-describedby="width-help"><p class="measurement-help__summary" id="width-help">Measure the inside width.</p>',
      ).unassociatedMeasurementHelp,
    ).toEqual([]);
    expect(
      auditAccessibilityHtml(
        '<label for="width">Width</label><input id="width"><p class="measurement-help__summary" id="width-help">Measure the inside width.</p>',
      ).unassociatedMeasurementHelp,
    ).toEqual(['width-help']);
  });

  it('requires calculator forms to use the shared page shell', () => {
    expect(
      auditAccessibilityHtml('<form class="fit-services__form"></form>').missingCalculatorShell,
    ).toBe(true);
    expect(
      auditAccessibilityHtml(
        '<article data-calculator-shell><form class="fit-services__form"></form><section data-before-you-start></section></article>',
      ).missingCalculatorShell,
    ).toBe(false);
    expect(
      auditAccessibilityHtml(
        '<article data-calculator-shell><form class="fit-services__form"></form></article>',
      ).missingBeforeYouStart,
    ).toBe(true);
  });
});
