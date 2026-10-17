import type { Dataset } from '../lib/validation/dataset';
import { familyEntityNameEs, ES_CLEARANCE_RULE_COPY } from './es-family-copy';
import { ES_PUBLICATIONS } from './es-publications';
import { ES_SOURCE_NOTES } from './es-source-notes';
import { pathForLocale, publishedSpanishRoutes } from './locale';
import { translate } from './text';

function translateEntityNotes<T>(value: T, entityId: string): T {
  if (Array.isArray(value)) {
    return value.map((item) => translateEntityNotes(item, entityId)) as T;
  }
  if (!value || typeof value !== 'object') return value;
  const localized = Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (key === 'note' && typeof item === 'string') {
        const note = translate('es', item);
        if (note === item)
          throw new Error(`Missing Spanish measurement note for '${entityId}': ${item}`);
        return [key, note];
      }
      return [key, translateEntityNotes(item, entityId)];
    }),
  );
  return localized as T;
}

export function localizeDatasetToSpanish(dataset: Dataset): Dataset {
  const localizedRoutes = publishedSpanishRoutes(dataset);
  const localizedRouteIds = new Set(localizedRoutes.map((route) => route.pageIntentId));

  for (const route of localizedRoutes) {
    if (!ES_PUBLICATIONS[route.pageIntentId]) {
      throw new Error(`Missing Spanish publication copy for '${route.pageIntentId}'.`);
    }
  }

  const publicationCopyById = ES_PUBLICATIONS;
  const localizedPageIntents = dataset.pageIntents.map((intent) => {
    if (!localizedRouteIds.has(intent.id)) return intent;
    const copy = publicationCopyById[intent.id]!;
    return {
      ...intent,
      route: pathForLocale(intent.route, 'es'),
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
      language:
        publication.pageIntentId === 'pi-p039-us-bed-size-dimensions'
          ? 'es-US'
          : publication.pageIntentId === 'pi-p040-uk-bed-size-dimensions'
            ? 'es-GB'
            : 'es',
      alternatePageIds: [],
      ...(publication.canonicalPath
        ? { canonicalPath: pathForLocale(publication.canonicalPath, 'es') }
        : {}),
    };
  });

  const localizedSources = dataset.sources.map((source) => {
    if (!source.notes) return source;
    const note = ES_SOURCE_NOTES[source.id];
    if (!note) throw new Error(`Missing Spanish source-note copy for '${source.id}'.`);
    return { ...source, notes: note };
  });

  const localizedEntities = dataset.entities.map((entity) => {
    const name = familyEntityNameEs[entity.id];
    if (entity.status === 'published' && !name) {
      throw new Error(`Missing Spanish entity name for '${entity.id}' (${entity.name}).`);
    }
    return {
      ...translateEntityNotes(entity, entity.id),
      ...(name ? { name } : {}),
    };
  });

  const localizedClearanceRules = dataset.clearanceRules.map((rule) => {
    const copy = ES_CLEARANCE_RULE_COPY[rule.id];
    if (!copy) throw new Error(`Missing Spanish clearance-rule copy for '${rule.id}'.`);
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
      ? { ...disposition, route: pathForLocale(disposition.route, 'es') }
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
