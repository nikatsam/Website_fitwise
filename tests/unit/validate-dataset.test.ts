import { describe, expect, it } from 'vitest';
import { validateDataset, emptyDataset, type Dataset } from '../../src/lib/validation/dataset';
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

const validDataset: Dataset = {
  sources,
  entities: [...displayEntities, ...deskEntities, ...bedEntities, ...roomScenarios],
  clearanceRules,
  relationships,
  pageIntents,
  routeDispositions: [...routeDispositions],
  seoPublications,
};

describe('validateDataset — valid sample dataset', () => {
  it('passes with zero errors', () => {
    const result = validateDataset(validDataset);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('passes an empty dataset (nothing to validate yet)', () => {
    const result = validateDataset(emptyDataset);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('validateDataset — known invalid fixtures', () => {
  it('rejects a duplicate entity id', () => {
    const [first, second] = invalidRecordCases.find(
      (c) => c.violates === 'duplicate IDs or slugs exist',
    )!.data.duplicates as Array<{ id: string; slug: string; category: string }>;

    const dataset: Dataset = {
      ...emptyDataset,
      entities: [
        { ...deskEntities[0]!, id: first.id, slug: first.slug },
        { ...deskEntities[0]!, id: second.id, slug: second.slug },
      ],
    };

    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'duplicate-id')).toBe(true);
  });

  it('rejects a published page referencing a missing entity', () => {
    const dataset: Dataset = {
      ...emptyDataset,
      pageIntents: [
        {
          id: 'pi-broken-ref',
          route: '/workspace/broken/',
          family: 'object_to_space',
          cluster: 'workspace',
          primaryQuery: 'broken',
          entityIds: ['ent-does-not-exist'],
          status: 'published',
          justification: 'test',
        },
      ],
      routeDispositions: [
        {
          pageIntentId: 'pi-broken-ref',
          route: '/workspace/broken/',
          intentStatus: 'published',
          disposition: 'generated',
          renderer: 'family',
        },
      ],
    };

    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'missing-entity-reference')).toBe(true);
  });

  it('rejects a sourced measurement with no sourceId', () => {
    const dataset: Dataset = {
      ...emptyDataset,
      entities: [
        {
          ...deskEntities[0]!,
          widthMm: { valueMm: 1400, kind: 'typical' },
        },
      ],
    };

    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'missing-source-id')).toBe(true);
  });

  it('rejects a non-positive dimension', () => {
    const dataset: Dataset = {
      ...emptyDataset,
      entities: [{ ...deskEntities[0]!, widthMm: { valueMm: 0, kind: 'nominal' } }],
    };

    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'non-positive-dimension')).toBe(true);
  });

  it('rejects a derived measurement with no derivationId', () => {
    const dataset: Dataset = {
      ...emptyDataset,
      entities: [{ ...deskEntities[0]!, widthMm: { valueMm: 1400, kind: 'derived' } }],
    };

    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'missing-derivation')).toBe(true);
  });

  it('rejects a published bed entity with no market', () => {
    const { market: _market, ...bedWithoutMarket } = bedEntities[0]!;
    const dataset: Dataset = {
      ...emptyDataset,
      sources,
      entities: [bedWithoutMarket as unknown as Dataset['entities'][number]],
    };

    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'missing-bed-market')).toBe(true);
  });

  it('rejects two page intents sharing the same route', () => {
    const dataset: Dataset = {
      ...emptyDataset,
      pageIntents: [
        { ...pageIntents[0]!, id: 'pi-a' },
        { ...pageIntents[0]!, id: 'pi-b' },
      ],
    };

    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'duplicate-route')).toBe(true);
  });

  it('requires every published or draft intent to have an explicit route disposition', () => {
    const result = validateDataset({
      ...validDataset,
      routeDispositions: routeDispositions.filter(
        (record) => record.pageIntentId !== 'pi-desk-size-for-two-27in-monitors',
      ),
    });
    expect(result.errors.some((issue) => issue.rule === 'missing-route-disposition')).toBe(true);
  });

  it('requires route disposition status and path to match the source intent', () => {
    const result = validateDataset({
      ...validDataset,
      routeDispositions: routeDispositions.map((record) =>
        record.pageIntentId === 'pi-desk-size-for-two-27in-monitors'
          ? { ...record, route: '/workspace/wrong-path/' }
          : record,
      ),
    });
    expect(result.errors.some((issue) => issue.rule === 'invalid-route-disposition')).toBe(true);
  });

  it('rejects a relationship with an invalid endpoint', () => {
    const dataset: Dataset = {
      ...emptyDataset,
      entities: [deskEntities[0]!],
      relationships: [
        {
          id: 'rel-broken',
          type: 'fits_on',
          fromId: 'ent-does-not-exist',
          toId: deskEntities[0]!.id,
        },
      ],
    };

    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'invalid-relationship-endpoint')).toBe(true);
  });

  it('gives every error an actionable, non-empty message', () => {
    const result = validateDataset({
      ...emptyDataset,
      entities: [{ ...deskEntities[0]!, widthMm: { valueMm: -5, kind: 'derived' } }],
    });
    for (const issue of result.errors) {
      expect(issue.message.length).toBeGreaterThan(10);
      expect(issue.message).not.toMatch(/undefined|\[object Object\]/);
    }
  });
});
