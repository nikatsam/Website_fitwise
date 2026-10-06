import { describe, expect, it } from 'vitest';
import {
  sources,
  displayEntities,
  deskEntities,
  bedEntities,
  roomScenarios,
  clearanceRules,
  relationships,
  pageIntents,
  routeDispositions,
  seoPublications,
} from '../fixtures/valid/sample-dataset';
import { invalidRecordCases } from '../fixtures/invalid/sample-invalid-records';

describe('canonical data schemas — valid fixtures', () => {
  it('load every record family with at least one sample', () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(displayEntities.length).toBeGreaterThan(0);
    expect(deskEntities.length).toBeGreaterThan(0);
    expect(bedEntities.length).toBeGreaterThan(0);
    expect(roomScenarios.length).toBeGreaterThan(0);
    expect(clearanceRules.length).toBeGreaterThan(0);
    expect(relationships.length).toBeGreaterThan(0);
    expect(pageIntents.length).toBeGreaterThan(0);
    expect(routeDispositions.length).toBe(pageIntents.length);
    expect(seoPublications.length).toBeGreaterThan(0);
  });

  it('keeps linear measurements in millimetres and positive', () => {
    expect(deskEntities[0]?.widthMm.valueMm).toBe(1400);
    expect(bedEntities[0]?.mattressWidthMm.valueMm).toBeGreaterThan(0);
  });

  it('requires bed entities to declare a market', () => {
    for (const bed of bedEntities) {
      expect(bed.market).toBeTruthy();
    }
  });

  it('joins the SEO publication envelope to its PageIntent by id', () => {
    const pageIntentIds = new Set(pageIntents.map((p) => p.id));
    for (const publication of seoPublications) {
      expect(pageIntentIds.has(publication.pageIntentId)).toBe(true);
    }
  });
});

describe('canonical data schemas — invalid fixture examples', () => {
  it('covers every build-failure invariant from specs/DATA_MODEL.md §9', () => {
    const expectedInvariants = [
      'duplicate IDs or slugs exist',
      'a published page references a missing entity',
      'a source ID is missing',
      'required dimensions are <= 0',
      'a derived measurement has no derivation rule',
      'a published bed entity lacks geography/market',
      'canonical route duplicates another page',
      'relationship endpoint IDs are invalid',
    ];
    const covered = invalidRecordCases.map((c) => c.violates);
    for (const invariant of expectedInvariants) {
      expect(covered).toContain(invariant);
    }
  });

  it('gives every case a non-empty description and data payload', () => {
    for (const testCase of invalidRecordCases) {
      expect(testCase.description.length).toBeGreaterThan(0);
      expect(Object.keys(testCase.data).length).toBeGreaterThan(0);
    }
  });
});
