import { describe, expect, it } from 'vitest';
import { dataset } from '../../src/data';
import { buildFamilyAnswer } from '../../src/lib/content/build-family-answer';
import { buildFurniturePlanningAnswer } from '../../src/lib/content/build-planning-example';
import type { PageIntent } from '../../src/types';

function intent(id: string): PageIntent {
  const pageIntent = dataset.pageIntents.find((candidate) => candidate.id === id);
  if (!pageIntent) throw new Error(`Missing test PageIntent ${id}`);
  return pageIntent;
}

describe('data-backed page-family answers', () => {
  it('calculates dual monitor footprints from display, desk and clearance records', () => {
    const answer = buildFamilyAnswer(intent('pi-p002-desk-size-dual-monitors'), dataset);
    const facts = answer.sections[0]!.facts;
    expect(
      facts.find((fact) => fact.label === 'Configuration width (including gaps)')?.valueMm,
    ).toBe(1216);
    expect(facts.find((fact) => fact.label === 'Hard minimum desk width')?.valueMm).toBe(1216);
    expect(facts.find((fact) => fact.label === 'Recommended desk width')?.valueMm).toBe(1292);
    expect(facts.find((fact) => fact.label === 'Recommended desk width')?.valueMm).toBeGreaterThan(
      facts.find((fact) => fact.label === 'Hard minimum desk width')!.valueMm!,
    );
    expect(facts.some((fact) => fact.label === 'Fit result' && fact.valueText === '✓ Fits')).toBe(
      true,
    );
    expect(answer.sources.some((source) => source.id === 'src-fitwise-internal-convention')).toBe(
      true,
    );
  });

  it('compares one- and two-display supported layouts without Cartesian permutations', () => {
    const answer = buildFamilyAnswer(intent('pi-p010-what-fits-120cm-desk'), dataset);
    expect(answer.sections).toHaveLength(5);
    expect(
      answer.sections.every((section) =>
        section.facts.some((fact) => fact.label === 'Maximum count with recommended margins'),
      ),
    ).toBe(true);
    const superUltrawide = answer.sections.find((section) => section.title.includes('49'))!;
    expect(
      superUltrawide.facts.find((fact) => fact.label === 'Display width basis')?.valueText,
    ).toBe('Screen-only approximation');
    expect(
      superUltrawide.facts.find((fact) => fact.label === 'Display width basis')?.note,
    ).toContain('outer device width with bezel');
  });

  it('keeps King comparisons and room recommendations market-specific', () => {
    const room = buildFamilyAnswer(intent('pi-p024-room-for-king-bed'), dataset);
    expect(room.sections.map((section) => section.title)).toEqual([
      'US King mattress',
      'UK Standard King mattress',
    ]);
    expect(
      room.sections[0]?.facts.find((fact) => fact.label === 'Recommended clear room width')
        ?.valueMm,
    ).toBeCloseTo(3149.6, 8);
    expect(room.sources.some((source) => source.publisher === 'Sleep Foundation')).toBe(true);
    expect(room.sources.some((source) => source.publisher === 'IKEA UK')).toBe(true);
    expect(room.intro).toContain('US King mattress-only: about 3.15 m (10 ft 4 in) wide');
    expect(room.intro).toContain(
      'UK Standard King in IKEA MALM Standard King frame: about 2.88 m (9 ft 5 in) wide',
    );
    expect(room.intro).toContain('not a building-code minimum');
  });

  it('answers the US Queen room-space question without calling the recommendation a minimum', () => {
    const answer = buildFamilyAnswer(intent('pi-p025-room-for-queen-bed'), dataset);
    expect(answer.intro).toContain(
      'US Queen mattress-only: about 2.74 m (9 ft 0 in) wide by 2.64 m (8 ft 8 in) long',
    );
    expect(answer.intro).toContain(
      'Only entries naming a frame include that specific sourced model',
    );
    expect(answer.intro).toContain('FitWise-assumed 24-inch foot allowance');
    expect(
      answer.sections[0]?.assumptions?.filter((assumption) =>
        assumption.includes('FitWise modeling assumption: 24 inches at the foot'),
      ),
    ).toHaveLength(1);
    expect(
      answer.sections[0]?.facts.some((fact) => fact.label === 'Mattress-only physical width'),
    ).toBe(true);
  });

  it('describes bed comparison pages with market-specific clear-space estimates', () => {
    const answer = buildFamilyAnswer(intent('pi-p030-king-vs-queen-room-space'), dataset);
    expect(answer.intro).toContain(
      'US King mattress-only: recommended clear rectangle about 3.15 m (10 ft 4 in)',
    );
    expect(answer.intro).toContain(
      'US Queen mattress-only: recommended clear rectangle about 2.74 m (9 ft 0 in)',
    );
    expect(answer.intro).toContain('not code minimums');
    expect(answer.intro).not.toContain('Screen dimensions');
  });

  it('keeps US Full mattress-only sizing distinct from the measured UK Double frame', () => {
    const answer = buildFamilyAnswer(intent('pi-p026-room-for-double-bed'), dataset);
    expect(answer.intro).toContain('US Full mattress-only: about 2.59 m (8 ft 6 in) wide');
    expect(answer.intro).toContain(
      'UK Standard Double in IKEA MALM Standard Double frame: about 2.72 m (8 ft 11 in) wide',
    );
    expect(answer.intro).toContain('not a building-code minimum');
    expect(
      answer.sections.some((section) =>
        section.facts.some((fact) => fact.note?.includes('IKEA MALM Standard Double frame')),
      ),
    ).toBe(true);
  });

  it('labels foot clearance as an internal FitWise assumption, not a cited side guideline', () => {
    const footRule = dataset.clearanceRules.find((rule) => rule.id === 'clr-bed-foot-access');
    expect(footRule?.recommendedMm?.sourceId).toBe('src-fitwise-internal-convention');
    expect(footRule?.notes).toContain('not direct source guidance');
  });

  it('computes bedroom reverse-fit results for each distinct bed layout', () => {
    const squareRoom = buildFamilyAnswer(intent('pi-p027-bed-in-10x10-room'), dataset);
    const rectangularRoom = buildFamilyAnswer(intent('pi-p028-bed-in-10x12-room'), dataset);
    expect(squareRoom.sections).toHaveLength(3);
    expect(squareRoom.sections.every((section) => section.title.includes('portrait'))).toBe(true);
    expect(rectangularRoom.sections).toHaveLength(6);
    expect(rectangularRoom.sections.some((section) => section.title.includes('landscape'))).toBe(
      true,
    );
    expect(
      rectangularRoom.sections.every((section) =>
        section.facts.some((fact) => fact.label === 'Fit result'),
      ),
    ).toBe(true);
  });

  it('uses a measured door-swing example without claiming a walking-aisle minimum', () => {
    const route = dataset.routeDispositions.find(
      (record) => record.pageIntentId === 'pi-p034-space-bed-wardrobe',
    );
    expect(route).toMatchObject({ disposition: 'generated', renderer: 'static' });
    const answer = buildFurniturePlanningAnswer(intent('pi-p034-space-bed-wardrobe'), dataset);
    expect(
      answer.sections[0]?.facts.find((fact) => fact.label === 'Door projection at 90 degrees')
        ?.valueMm,
    ).toBe(495);
    expect(answer.intro).toContain('not a recommended walking aisle');
  });
});
