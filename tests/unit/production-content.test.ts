import { describe, expect, it } from 'vitest';
import { dataset } from '../../src/data';
import { validateDataset } from '../../src/lib/validation/dataset';

describe('production content release gate', () => {
  it('has no production dataset errors or warnings', () => {
    const result = validateDataset(dataset);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('provides a publication envelope for each generated published hub/entity route', () => {
    const publications = new Map(
      dataset.seoPublications.map((publication) => [publication.pageIntentId, publication]),
    );
    const generatedIntents = dataset.pageIntents.filter(
      (intent) =>
        intent.status === 'published' && (intent.family === 'hub' || intent.family === 'entity'),
    );

    expect(generatedIntents.length).toBeGreaterThan(0);
    for (const intent of generatedIntents) {
      expect(publications.has(intent.id), intent.id).toBe(true);
    }
  });

  it('classifies every published intent as generated or explicitly deferred, and every draft as draft-only', () => {
    const dispositions = new Map(
      dataset.routeDispositions.map((disposition) => [disposition.pageIntentId, disposition]),
    );
    expect(dispositions.size).toBe(dataset.pageIntents.length);
    for (const intent of dataset.pageIntents) {
      const disposition = dispositions.get(intent.id);
      expect(disposition?.route, intent.id).toBe(intent.route);
      expect(disposition?.intentStatus, intent.id).toBe(intent.status);
      if (intent.status === 'published') {
        expect(['generated', 'deferred']).toContain(disposition?.disposition);
      }
      if (intent.status === 'draft') {
        expect(disposition?.disposition, intent.id).toBe('draft');
      }
      if (disposition?.disposition === 'deferred') {
        expect(disposition.reason.trim().length, intent.id).toBeGreaterThan(0);
      }
    }
  });

  it('keeps indexable metadata non-placeholder and sourced', () => {
    const sources = new Set(dataset.sources.map((source) => source.id));
    const placeholder = /\b(?:todo|tbd|lorem ipsum|coming soon)\b/i;

    for (const publication of dataset.seoPublications.filter((entry) => entry.indexable)) {
      expect(placeholder.test(publication.title), publication.pageIntentId).toBe(false);
      expect(placeholder.test(publication.description), publication.pageIntentId).toBe(false);
      expect(placeholder.test(publication.h1), publication.pageIntentId).toBe(false);
      expect(publication.sourceIds.length, publication.pageIntentId).toBeGreaterThan(0);
      for (const sourceId of publication.sourceIds) {
        expect(sources.has(sourceId), `${publication.pageIntentId}: ${sourceId}`).toBe(true);
      }
    }
  });

  it('keeps new calculation-family routes noindex pending editorial release review', () => {
    const publications = new Map(
      dataset.seoPublications.map((publication) => [publication.pageIntentId, publication]),
    );
    for (const intent of dataset.pageIntents) {
      const disposition = dataset.routeDispositions.find(
        (record) => record.pageIntentId === intent.id,
      );
      if (
        disposition?.disposition === 'generated' &&
        disposition.renderer === 'family' &&
        !['hub', 'entity'].includes(intent.family)
      ) {
        expect(publications.get(intent.id)?.indexable, intent.id).toBe(false);
      }
    }
  });

  it('keeps active panel width distinct from outer device width', () => {
    const superUltrawide = dataset.entities.find(
      (entity) => entity.id === 'ent-display-49in-superultrawide',
    );
    expect(superUltrawide?.category).toBe('display');
    if (superUltrawide?.category !== 'display')
      throw new Error('49-inch panel record must be a display.');
    expect(superUltrawide.activeWidthMm?.valueMm).toBe(1195.8);
    expect(superUltrawide.overallWidthMm).toBeUndefined();
  });
});
