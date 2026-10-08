import { describe, expect, it } from 'vitest';
import { dataset } from '../../src/data';
import { buildFurniturePlanningAnswer } from '../../src/lib/content/build-planning-example';

function answer(pageIntentId: string) {
  const intent = dataset.pageIntents.find((item) => item.id === pageIntentId);
  if (!intent) throw new Error(`Missing test intent '${pageIntentId}'.`);
  return buildFurniturePlanningAnswer(intent, dataset);
}

describe('source-backed planning examples', () => {
  it('separates the M7 stand, body depth, viewing distance and cable allowance', () => {
    const result = answer('pi-p015-desk-depth-for-monitor');
    const facts = result.sections[0]?.facts ?? [];

    expect(facts.find((fact) => fact.label === 'Monitor depth with stand')?.valueMm).toBe(193.5);
    expect(facts.find((fact) => fact.label === 'Monitor body depth without stand')?.valueMm).toBe(
      41.8,
    );
    expect(
      facts.find((fact) => fact.label === 'Desktop surface in front of stand if flush to rear edge')
        ?.valueMm,
    ).toBe(406.5);
    expect(result.intro).toContain('does not establish a comfortable viewing distance');
    expect(result.sources.map((source) => source.id)).toContain('src-ccohs-monitor-positioning');
    expect(result.sources.map((source) => source.id)).not.toContain(
      'src-osha-monitor-viewing-distance',
    );
  });

  it('uses a published Aeron Size B upper footprint without inventing a movement minimum', () => {
    const result = answer('pi-p018-desk-chair-clearance');
    const facts = result.sections[0]?.facts ?? [];

    expect(facts.find((fact) => fact.label === 'Maximum listed outer width')?.valueMm).toBe(772);
    expect(facts.find((fact) => fact.label === 'Movement/pull-back zone')?.valueText).toContain(
      'no universal numeric minimum',
    );
    expect(result.sources.map((source) => source.id)).toContain('src-ccohs-ergonomic-chair');
  });

  it('calculates a hinged-door sweep from the sourced leaf width, not an aisle standard', () => {
    const result = answer('pi-p034-space-bed-wardrobe');
    const sweep = result.sections[0]?.facts.find(
      (fact) => fact.label === 'Door projection at 90 degrees',
    );
    const wardrobe = dataset.entities.find(
      (entity) => entity.id === 'ent-furniture-pax-grimo-wardrobe',
    );

    expect(sweep?.valueMm).toBe(495);
    expect(sweep?.note).toContain('Geometric estimate');
    expect(result.intro).toContain('US-market IKEA PAX/GRIMO');
    expect(result.intro).not.toContain('MALM');
    expect(result.intro).toContain('not a recommended walking aisle');
    expect(wardrobe?.category === 'furniture' ? wardrobe.overallWidthMm.valueMm : null).toBe(1000);
  });

  it('uses the manufacturer drawer-pullout measurement and keeps access space separate', () => {
    const result = answer('pi-p035-bed-dresser-clearance');
    const facts = result.sections[0]?.facts ?? [];

    expect(facts.find((fact) => fact.label === 'Drawer pull-out')?.valueMm).toBe(294);
    expect(
      facts.find(
        (fact) => fact.label === 'Wall to fully extended drawer front (dresser flush to wall)',
      )?.valueMm,
    ).toBe(794);
    expect(result.intro).not.toContain('room-size minimum');
  });

  it('adds bedside-table footprints without presenting the sum as a room-width minimum', () => {
    const king = answer('pi-p036-king-bed-nightstands-room');
    const queen = answer('pi-p037-queen-bed-nightstands-room');

    expect(
      king.sections[0]?.facts.find(
        (fact) => fact.label === 'Combined width (bed + two tables, zero gaps)',
      )?.valueMm,
    ).toBeCloseTo(2850.4);
    expect(
      queen.sections[0]?.facts.find(
        (fact) => fact.label === 'Combined width (bed + two tables, zero gaps)',
      )?.valueMm,
    ).toBe(2444);
    expect(queen.intro).toContain('not a room-size recommendation');
  });
});
