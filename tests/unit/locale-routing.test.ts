import { describe, expect, it } from 'vitest';
import { dataset } from '../../src/data';
import { featurePages } from '../../src/data/feature-pages';
import { ES_FEATURE_COPY } from '../../src/i18n/es-features';
import { ES_PUBLICATIONS } from '../../src/i18n/es-publications';
import { localizeDatasetToSpanish } from '../../src/i18n/localize-dataset';
import { localizeFurniturePlanningAnswer } from '../../src/i18n/localize-planning';
import { buildFurniturePlanningAnswer } from '../../src/lib/content/build-planning-example';
import { buildFamilyAnswer } from '../../src/lib/content/build-family-answer';
import {
  englishPathname,
  languageAlternates,
  localeFromPath,
  pathForLocale,
  publishedSpanishRoutes,
} from '../../src/i18n/locale';

describe('locale route helpers', () => {
  it('preserves the English path and maps a Spanish path without redirects', () => {
    expect(localeFromPath('/workspace/')).toBe('en');
    expect(localeFromPath('/es/workspace/')).toBe('es');
    expect(pathForLocale('/workspace/desk-depth-for-monitor/', 'es')).toBe(
      '/es/workspace/desk-depth-for-monitor/',
    );
    expect(pathForLocale('/es/workspace/desk-depth-for-monitor/', 'en')).toBe(
      '/workspace/desk-depth-for-monitor/',
    );
    expect(pathForLocale('/', 'es')).toBe('/es/');
    expect(englishPathname('/es/')).toBe('/');
    expect(languageAlternates('/workspace/', 'en-US')).toEqual([
      { language: 'es', href: '/es/workspace/' },
    ]);
    expect(languageAlternates('/es/workspace/', 'es')).toEqual([
      { language: 'en', href: '/workspace/' },
    ]);
    expect(languageAlternates('/es/bedroom/us-bed-size-dimensions/', 'es-US')).toEqual([
      { language: 'en-US', href: '/bedroom/us-bed-size-dimensions/' },
      { language: 'en-GB', href: '/bedroom/uk-bed-size-dimensions/' },
      { language: 'es-GB', href: '/es/bedroom/uk-bed-size-dimensions/' },
    ]);
  });

  it('maps every released public PageIntent route to one stable Spanish URL', () => {
    const routes = publishedSpanishRoutes(dataset);
    const expected = dataset.routeDispositions.filter(
      (disposition) =>
        disposition.intentStatus === 'published' && disposition.disposition === 'generated',
    );

    expect(routes).toHaveLength(expected.length);
    expect(new Set(routes.map((route) => route.localizedPath)).size).toBe(routes.length);
    expect(routes.every((route) => route.localizedPath.startsWith('/es/'))).toBe(true);
    expect(
      routes.some((route) => route.localizedPath === '/es/workspace/desk-depth-for-monitor/'),
    ).toBe(true);
    expect(routes.some((route) => route.localizedPath.includes('/dev/'))).toBe(false);
  });

  it('preserves the source publication indexability on Spanish route records', () => {
    const routes = publishedSpanishRoutes(dataset);
    const byId = new Map(routes.map((route) => [route.pageIntentId, route]));

    for (const route of routes) {
      const publication = dataset.seoPublications.find(
        (candidate) => candidate.pageIntentId === route.pageIntentId,
      );
      expect(route.indexable).toBe(publication?.indexable ?? false);
      expect(byId.has(route.pageIntentId)).toBe(true);
    }
  });

  it('has localized metadata and feature copy for every published generated route', () => {
    const routes = publishedSpanishRoutes(dataset);
    const featureIds = new Set(featurePages.map((feature) => feature.pageIntent.id));

    for (const route of routes) {
      expect(ES_PUBLICATIONS[route.pageIntentId], route.pageIntentId).toBeDefined();
      if (featureIds.has(route.pageIntentId)) {
        expect(ES_FEATURE_COPY[route.pageIntentId], route.pageIntentId).toBeDefined();
      }
    }
  });

  it('creates a Spanish data view with localized canonical paths and source notes', () => {
    const localized = localizeDatasetToSpanish(dataset);
    const byId = new Map(
      localized.seoPublications.map((publication) => [publication.pageIntentId, publication]),
    );

    for (const route of publishedSpanishRoutes(dataset)) {
      const publication = byId.get(route.pageIntentId);
      const expectedLanguage =
        route.pageIntentId === 'pi-p039-us-bed-size-dimensions'
          ? 'es-US'
          : route.pageIntentId === 'pi-p040-uk-bed-size-dimensions'
            ? 'es-GB'
            : 'es';
      expect(publication?.language).toBe(expectedLanguage);
      expect(publication?.canonicalPath).toBe(route.localizedPath);
      expect(localized.pageIntents.find((intent) => intent.id === route.pageIntentId)?.route).toBe(
        route.localizedPath,
      );
    }
    expect(
      localized.sources.every(
        (source) =>
          !source.notes ||
          source.notes !== dataset.sources.find((item) => item.id === source.id)?.notes,
      ),
    ).toBe(true);
    for (const rule of dataset.clearanceRules) {
      const localizedRule = localized.clearanceRules.find((candidate) => candidate.id === rule.id);
      expect(localizedRule?.context).not.toBe(rule.context);
      expect(localizedRule?.notes).not.toBe(rule.notes);
      for (const key of ['minimumMm', 'recommendedMm'] as const) {
        const sourceNote = rule[key]?.note;
        if (sourceNote) expect(localizedRule?.[key]?.note).not.toBe(sourceNote);
      }
    }
  });

  it('localizes all sourced furniture-planning examples without changing their measured facts', () => {
    const localized = localizeDatasetToSpanish(dataset);
    const ids = [
      'pi-p015-desk-depth-for-monitor',
      'pi-p018-desk-chair-clearance',
      'pi-p034-space-bed-wardrobe',
      'pi-p035-bed-dresser-clearance',
      'pi-p036-king-bed-nightstands-room',
      'pi-p037-queen-bed-nightstands-room',
    ];
    for (const id of ids) {
      const intent = dataset.pageIntents.find((item) => item.id === id);
      expect(intent, id).toBeDefined();
      const original = buildFurniturePlanningAnswer(intent!, dataset);
      const spanish = localizeFurniturePlanningAnswer(id, original, localized);
      expect(spanish.intro).not.toBe(original.intro);
      expect(
        spanish.sections.every(
          (section) => !/desk|clearance|wardrobe|nightstand/i.test(section.title),
        ),
      ).toBe(true);
      const originalMeasurements = original.sections.flatMap((section) =>
        section.facts.map((fact) => fact.valueMm).filter((value) => value !== undefined),
      );
      const spanishMeasurements = spanish.sections.flatMap((section) =>
        section.facts.map((fact) => fact.valueMm).filter((value) => value !== undefined),
      );
      for (const measurement of originalMeasurements)
        expect(spanishMeasurements).toContain(measurement);
    }
  });

  it('builds Spanish copy for all non-feature generated family routes', () => {
    const localized = localizeDatasetToSpanish(dataset);
    const supportedFamilies = new Set([
      'object_to_space',
      'space_to_object',
      'comparison',
      'clearance',
    ]);
    const sourceRenderedIds = new Set([
      'pi-p004-desk-size-two-27in',
      'pi-p015-desk-depth-for-monitor',
      'pi-p018-desk-chair-clearance',
      'pi-p034-space-bed-wardrobe',
      'pi-p035-bed-dresser-clearance',
      'pi-p036-king-bed-nightstands-room',
      'pi-p037-queen-bed-nightstands-room',
    ]);
    const familyRoutes = dataset.pageIntents.filter((intent) => {
      const disposition = dataset.routeDispositions.find(
        (route) => route.pageIntentId === intent.id,
      );
      return (
        intent.status === 'published' &&
        disposition?.disposition === 'generated' &&
        supportedFamilies.has(intent.family) &&
        !sourceRenderedIds.has(intent.id)
      );
    });

    expect(familyRoutes.length).toBeGreaterThan(0);
    for (const intent of familyRoutes) {
      const spanishIntent = localized.pageIntents.find((item) => item.id === intent.id);
      expect(spanishIntent).toBeDefined();
      const answer = buildFamilyAnswer(spanishIntent!, localized, 'es');
      expect(answer.intro.length).toBeGreaterThan(0);
      expect(answer.sections.length).toBeGreaterThan(0);
    }
  });
});
