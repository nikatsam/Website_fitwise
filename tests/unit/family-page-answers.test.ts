import { describe, expect, it } from 'vitest';
import { dataset } from '../../src/data';
import { buildFamilyAnswer } from '../../src/lib/content/build-family-answer';
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
    ).toBeGreaterThan(0);
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

  it('limits bed-to-wardrobe answers to explicit deferral until door/furniture dimensions exist', () => {
    const route = dataset.routeDispositions.find(
      (record) => record.pageIntentId === 'pi-p034-space-bed-wardrobe',
    );
    expect(route?.disposition).toBe('deferred');
    expect(route?.disposition === 'deferred' ? route.reason : '').toContain('door swing');
  });
});
