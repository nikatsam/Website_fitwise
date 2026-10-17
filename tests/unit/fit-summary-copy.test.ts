import { describe, expect, it } from 'vitest';
import {
  getFitSummaryCopy,
  getFitSummaryResultLabel,
  renderFitSummaryContentHtml,
} from '../../src/lib/fit/summary-copy';
import type { DimensionDisplayRow } from '../../src/lib/fit/display';
import type { MissingRequirement } from '../../src/lib/fit/missing-requirement';

const fitRow: DimensionDisplayRow = {
  dimension: 'width',
  label: 'Desk width',
  requiredMm: 1292,
  recommendedMm: 1342,
  availableMm: 1400,
  physicalMarginMm: 108,
  targetMarginMm: 58,
  hardFit: true,
  recommendedFit: true,
};

const installationClearanceRequirement: MissingRequirement = {
  type: 'manual_reference',
  label: 'Installation clearance source',
  explanation: 'The exact model installation clearance has not been verified.',
  action: 'Add the exact model manual or manufacturer specification.',
};

describe('shared result summary copy', () => {
  it('separates physical fit, selected clearance, binding margin and next step', () => {
    const summary = getFitSummaryCopy('fits', [fitRow]);

    expect(summary.physicalStatus).toBe('Yes');
    expect(summary.clearanceStatus).toBe('Met');
    expect(summary.bindingLabel).toBe('Desk width');
    expect(summary.marginLabel).toBe('Extra space beyond target');
    expect(summary.marginMm).toBe(58);
    expect(summary.explanation).toContain('meets your selected target');
    expect(summary.nextAction).toContain('model-specific instructions');
  });

  it('distinguishes exact zero margin from a small positive margin', () => {
    const exact = getFitSummaryCopy('fits', [
      { ...fitRow, physicalMarginMm: 50, targetMarginMm: 0 },
    ]);
    expect(exact.resultLabel).toBe('Fits exactly');
    expect(exact.isExactFit).toBe(true);
    expect(exact.marginLabel).toBe('Remaining target margin');
    expect(exact.marginMm).toBe(0);
    expect(exact.explanation).toContain('meets your selected target exactly');
    expect(exact.nextAction).toContain('Remeasure the actual product');
    expect(renderFitSummaryContentHtml(exact)).toContain('Re-check actual dimensions');

    const positive = getFitSummaryCopy('fits', [
      { ...fitRow, physicalMarginMm: 50, targetMarginMm: 0.1 },
    ]);
    expect(positive.resultLabel).toBe('Fits');
    expect(positive.isExactFit).toBe(false);
    expect(positive.explanation).not.toContain('meets your selected target exactly');
  });

  it('labels example and edited results without changing the fit state', () => {
    const summary = getFitSummaryCopy('fits', [fitRow]);
    expect(getFitSummaryResultLabel(summary, 'example')).toBe('Example result — Fits');
    expect(getFitSummaryResultLabel(summary, 'user')).toBe('Your result — Fits');
    expect(getFitSummaryResultLabel(summary)).toBe('Fits');
  });

  it('keeps regenerated summary content out of transient live regions', () => {
    const summary = getFitSummaryCopy('fits', [fitRow]);
    expect(renderFitSummaryContentHtml(summary)).not.toContain('aria-live');
  });

  it('names the short selected target and physical shortfall separately', () => {
    const tightRow = {
      ...fitRow,
      availableMm: 1340,
      physicalMarginMm: 48,
      targetMarginMm: -2,
      recommendedFit: false,
    };
    const tight = getFitSummaryCopy('tight', [tightRow]);
    expect(tight.physicalStatus).toBe('Yes');
    expect(tight.clearanceStatus).toBe('Short');
    expect(tight.marginLabel).toBe('Short against selected target');
    expect(tight.marginMm).toBe(2);

    const failedRow = {
      ...tightRow,
      availableMm: 1200,
      physicalMarginMm: -92,
      targetMarginMm: -142,
      hardFit: false,
    };
    const failed = getFitSummaryCopy('does_not_fit', [failedRow]);
    expect(failed.physicalStatus).toBe('No');
    expect(failed.marginLabel).toBe('Additional physical space needed');
    expect(failed.marginMm).toBe(92);
  });

  it('distinguishes compatibility failure from dimensional failure', () => {
    const summary = getFitSummaryCopy('does_not_fit', [fitRow], {
      compatibilityChecks: [{ label: 'VESA pattern', compatible: false }],
    });

    expect(summary.physicalStatus).toBe('Yes');
    expect(summary.clearanceStatus).toBe('Met');
    expect(summary.compatibilityStatus).toBe('Incompatible');
    expect(summary.bindingLabel).toBe('VESA pattern');
    expect(summary.explanation).toContain('measured dimensions fit');
    expect(summary.nextAction).toContain('exact model specifications');
  });

  it('names missing information and the next thing to supply', () => {
    const summary = getFitSummaryCopy('needs_information', [fitRow], {
      missingRequirements: [installationClearanceRequirement],
      compatibilityChecks: [{ label: 'VESA pattern', compatible: true }],
    });

    expect(summary.physicalStatus).toBe('Yes');
    expect(summary.clearanceStatus).toBe('Not confirmed');
    expect(summary.compatibilityStatus).toBe('Needs verification');
    expect(summary.explanation).not.toContain('exact model manual reference');
    expect(summary.missingRequirements).toEqual([installationClearanceRequirement]);
    expect(summary.nextAction).toContain('verification steps listed below');

    const html = renderFitSummaryContentHtml(summary);
    expect(html).toContain('What is missing');
    expect(html).toContain('Installation clearance source');
    expect(html).toContain('The exact model installation clearance has not been verified.');
    expect(html).toContain('Add the exact model manual or manufacturer specification.');
  });

  it('renders semantic facts, dual-unit margins and explicit next action', () => {
    const html = renderFitSummaryContentHtml(getFitSummaryCopy('fits', [fitRow]));

    expect(html).toContain('<dt>Physical fit</dt>');
    expect(html).toContain('<dt>Selected clearance</dt>');
    expect(html).toContain('data-unit="metric"');
    expect(html).toContain('data-unit="imperial"');
    expect(html).toContain('data-field="next-action"');
    expect(html).not.toContain('<strong>Next:</strong> Next:');
  });

  it('normalizes punctuation and falls back for blank constraint/source names', () => {
    const blankLabel = { ...fitRow, dimension: 'desk_width', label: '   ' };
    const tight = getFitSummaryCopy('tight', [
      { ...blankLabel, recommendedFit: false, targetMarginMm: -12 },
    ]);
    const compatibility = getFitSummaryCopy('does_not_fit', [fitRow], {
      compatibilityChecks: [{ label: 'VESA pattern.. ', compatible: false }],
    });
    const needsInformation = getFitSummaryCopy('needs_information', [fitRow], {
      missingRequirements: [
        {
          ...installationClearanceRequirement,
          label: 'Clearance source..',
          explanation: 'Clearance source is not verified..',
          action: 'Provide exact source..',
        },
      ],
    });

    expect(tight.bindingLabel).toBe('Desk width');
    expect(tight.explanation).toContain('Desk width');
    expect(tight.explanation).not.toMatch(/\.\.|\s,/);
    expect(compatibility.explanation).toContain('VESA pattern.');
    expect(compatibility.explanation).not.toContain('..');
    expect(needsInformation.missingRequirements[0]?.label).toBe('Clearance source');
    expect(needsInformation.missingRequirements[0]?.explanation).toBe(
      'Clearance source is not verified.',
    );
    expect(needsInformation.missingRequirements[0]?.action).toBe('Provide exact source.');
    expect(needsInformation.explanation).not.toMatch(/\.\.|result\.|assessment\./);
    expect(needsInformation.nextAction).toMatch(/run the check again\.$/);
  });

  it('provides safe structured fallback details when a needs-information state has no requirements', () => {
    const summary = getFitSummaryCopy('needs_information', [fitRow]);
    expect(summary.missingRequirements).toHaveLength(1);
    expect(summary.missingRequirements[0]?.label).toBe(
      'Required measurements or exact model source',
    );
    expect(renderFitSummaryContentHtml(summary)).toContain('What is missing');
  });

  it('terminates each state explanation and action with one sentence mark', () => {
    const cases = [
      getFitSummaryCopy('fits', [fitRow]),
      getFitSummaryCopy('tight', [{ ...fitRow, recommendedFit: false, targetMarginMm: -1 }]),
      getFitSummaryCopy('does_not_fit', [
        {
          ...fitRow,
          hardFit: false,
          recommendedFit: false,
          physicalMarginMm: -1,
          targetMarginMm: -1,
        },
      ]),
      getFitSummaryCopy('needs_information', [fitRow], {
        missingRequirements: [installationClearanceRequirement],
      }),
    ];
    for (const summary of cases) {
      for (const sentence of [summary.explanation, summary.nextAction]) {
        expect(sentence).toMatch(/\.$/);
        expect(sentence).not.toMatch(/\.\.|\s,\s*\./);
      }
    }
  });
});
