import { describe, expect, it } from 'vitest';
import { buildFitReviewReport } from '../../src/lib/fit/copy-report';
import { getFitSummaryCopy } from '../../src/lib/fit/summary-copy';
import type { DimensionDisplayRow } from '../../src/lib/fit/display';

const rows: DimensionDisplayRow[] = [
  {
    dimension: 'width',
    label: 'Desk width',
    requiredMm: 1200,
    recommendedMm: 1300,
    availableMm: 1400,
    physicalMarginMm: 200,
    targetMarginMm: 100,
    hardFit: true,
    recommendedFit: true,
  },
];

describe('Universal copied fit review', () => {
  it('includes a normalized state explanation, action and dual-unit signed margins', () => {
    const summary = getFitSummaryCopy('fits', rows);
    const report = buildFitReviewReport({
      itemName: '  Chair.  ',
      stateLabel: 'Fits',
      objectWidthMm: 1200,
      objectDepthMm: 600,
      objectHeightMm: 800,
      spaceWidthMm: 1400,
      spaceDepthMm: 800,
      spaceHeightMm: 900,
      orientation: 'width-depth',
      quantityCapacity: 1,
      summary,
      rows: [{ ...rows[0]!, physicalMarginMm: 108, targetMarginMm: 58 }],
    });

    expect(report).toContain('Fitwise review: Chair.');
    expect(report).toContain('Result: Fits');
    expect(report).toContain(`What this means: ${summary.explanation}`);
    expect(report).toContain(`Next: ${summary.nextAction}`);
    expect(report).toContain('+10.8 cm / +0 ft 4 in');
    expect(report).toContain('+5.8 cm / +0 ft 2 in');
    expect(report).not.toContain('Next: Next:');
    expect(report).not.toContain('..');
  });

  it('uses a nonempty fallback when the item name is blank', () => {
    const report = buildFitReviewReport({
      itemName: '  ',
      stateLabel: 'Needs information',
      objectWidthMm: 1200,
      objectDepthMm: 600,
      objectHeightMm: 800,
      spaceWidthMm: 1400,
      spaceDepthMm: 800,
      spaceHeightMm: 900,
      orientation: 'width-depth',
      quantityCapacity: 1,
      summary: getFitSummaryCopy('needs_information', rows, {
        needsInformation: ['exact manual reference'],
      }),
      rows,
    });

    expect(report).toContain('Fitwise review: Item');
    expect(report).toContain('Needs information');
    expect(report).toContain('exact manual reference');
  });
});
