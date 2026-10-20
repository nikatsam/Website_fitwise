import type { Dataset } from '../lib/validation/dataset';
import { contentCatalog } from './content';
import {
  hreflangFor,
  pathForLocale,
  publishedLocalizedRoutes,
  type TranslatedLocale,
} from './locale';
import { translate } from './text';

function translateEntityNotes<T>(value: T, entityId: string, locale: TranslatedLocale): T {
  if (Array.isArray(value)) {
    return value.map((item) => translateEntityNotes(item, entityId, locale)) as T;
  }
  if (!value || typeof value !== 'object') return value;
  const localized = Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (key === 'note' && typeof item === 'string') {
        const note = translate(locale, item);
        if (note === item)
          throw new Error(`Missing ${locale} measurement note for '${entityId}': ${item}`);
        return [key, note];
      }
      return [key, translateEntityNotes(item, entityId, locale)];
    }),
  );
  return localized as T;
}

const cache = new WeakMap<Dataset, Map<TranslatedLocale, Dataset>>();

/** Localizes page metadata, routes, sources, entity names and rule copy into one locale. */
export function localizeDataset(dataset: Dataset, locale: TranslatedLocale): Dataset {
  let byLocale = cache.get(dataset);
  if (!byLocale) cache.set(dataset, (byLocale = new Map()));
  const cached = byLocale.get(locale);
  if (cached) return cached;
  const localized = buildLocalizedDataset(dataset, locale);
  byLocale.set(locale, localized);
  return localized;
}

/** @deprecated Use localizeDataset(dataset, 'es'). */
export function localizeDatasetToSpanish(dataset: Dataset): Dataset {
  return localizeDataset(dataset, 'es');
}

function buildLocalizedDataset(dataset: Dataset, locale: TranslatedLocale): Dataset {
  const content = contentCatalog(locale);
  const localizedRoutes = publishedLocalizedRoutes(dataset, locale);
  const localizedRouteIds = new Set(localizedRoutes.map((route) => route.pageIntentId));

  for (const route of localizedRoutes) {
    if (!content.publications[route.pageIntentId]) {
      throw new Error(`Missing ${locale} publication copy for '${route.pageIntentId}'.`);
    }
  }

  const publicationCopyById = content.publications;
  const localizedPageIntents = dataset.pageIntents.map((intent) => {
    if (!localizedRouteIds.has(intent.id)) return intent;
    const copy = publicationCopyById[intent.id]!;
    return {
      ...intent,
      route: pathForLocale(intent.route, locale),
      primaryQuery: copy.primaryQuery,
    };
  });

  const localizedPublications = dataset.seoPublications.map((publication) => {
    if (!localizedRouteIds.has(publication.pageIntentId)) return publication;
    const copy = publicationCopyById[publication.pageIntentId]!;
    return {
      ...publication,
      title: copy.title,
      description: copy.description,
      h1: copy.h1,
      breadcrumbLabel: copy.breadcrumbLabel ?? copy.h1,
      language: hreflangFor(publication.canonicalPath ?? '/', locale),
      alternatePageIds: [],
      ...(publication.canonicalPath
        ? { canonicalPath: pathForLocale(publication.canonicalPath, locale) }
        : {}),
    };
  });

  const localizedSources = dataset.sources.map((source) => {
    if (!source.notes) return source;
    const note = content.sourceNotes[source.id];
    if (!note) throw new Error(`Missing ${locale} source-note copy for '${source.id}'.`);
    return { ...source, notes: note };
  });

  const localizedEntities = dataset.entities.map((entity) => {
    const name = content.entityNames[entity.id];
    if (entity.status === 'published' && !name) {
      throw new Error(`Missing ${locale} entity name for '${entity.id}' (${entity.name}).`);
    }
    return {
      ...translateEntityNotes(entity, entity.id, locale),
      ...(name ? { name } : {}),
    };
  });

  const localizedClearanceRules = dataset.clearanceRules.map((rule) => {
    const copy = content.clearanceRules[rule.id];
    if (!copy) throw new Error(`Missing ${locale} clearance-rule copy for '${rule.id}'.`);
    return {
      ...rule,
      context: copy.context ?? rule.context,
      notes: copy.notes ?? rule.notes,
      ...(rule.minimumMm
        ? {
            minimumMm: {
              ...rule.minimumMm,
              ...(copy.minimumNote ? { note: copy.minimumNote } : {}),
            },
          }
        : {}),
      ...(rule.recommendedMm
        ? {
            recommendedMm: {
              ...rule.recommendedMm,
              ...(copy.recommendedNote ? { note: copy.recommendedNote } : {}),
            },
          }
        : {}),
    };
  });

  const localizedDispositions = dataset.routeDispositions.map((disposition) =>
    localizedRouteIds.has(disposition.pageIntentId)
      ? { ...disposition, route: pathForLocale(disposition.route, locale) }
      : disposition,
  );

  return {
    ...dataset,
    pageIntents: localizedPageIntents,
    seoPublications: localizedPublications,
    sources: localizedSources,
    entities: localizedEntities,
    clearanceRules: localizedClearanceRules,
    routeDispositions: localizedDispositions,
  };
}
