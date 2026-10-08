import type {
  SourceRecord,
  Entity,
  ClearanceRule,
  Relationship,
  PageIntent,
  SeoPublication,
  RouteDispositionRecord,
} from '../../types';

export interface Dataset {
  sources: SourceRecord[];
  entities: Entity[];
  clearanceRules: ClearanceRule[];
  relationships: Relationship[];
  pageIntents: PageIntent[];
  routeDispositions: RouteDispositionRecord[];
  seoPublications: SeoPublication[];
}

export const emptyDataset: Dataset = {
  sources: [],
  entities: [],
  clearanceRules: [],
  relationships: [],
  pageIntents: [],
  routeDispositions: [],
  seoPublications: [],
};

export type ValidationRule =
  | 'duplicate-id'
  | 'duplicate-slug'
  | 'duplicate-route'
  | 'missing-entity-reference'
  | 'missing-source-id'
  | 'invalid-source-reference'
  | 'non-positive-dimension'
  | 'missing-derivation'
  | 'missing-bed-market'
  | 'missing-door-leaf-measurement'
  | 'missing-drawer-pullout-measurement'
  | 'invalid-relationship-endpoint'
  | 'duplicate-seo-publication'
  | 'duplicate-seo-title'
  | 'duplicate-seo-canonical'
  | 'missing-seo-publication'
  | 'invalid-seo-publication'
  | 'invalid-breadcrumb-reference'
  | 'invalid-related-page-reference'
  | 'duplicate-route-disposition'
  | 'missing-route-disposition'
  | 'invalid-route-disposition';

export interface ValidationIssue {
  level: 'error' | 'warning';
  rule: ValidationRule;
  message: string;
  recordId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

interface MeasurementLike {
  valueMm?: unknown;
  kind?: unknown;
  sourceId?: unknown;
  derivationId?: unknown;
}

function isMeasurementLike(value: unknown): value is MeasurementLike {
  return typeof value === 'object' && value !== null && 'valueMm' in value && 'kind' in value;
}

const SOURCED_KINDS = new Set(['exact', 'nominal', 'typical', 'recommended']);

/**
 * Validates a single Measurement-shaped value found anywhere in the dataset.
 * `allowNonPositive` is only true for clearance dimensions, which may be
 * legitimately zero (specs/DATA_MODEL.md §2: "> 0 unless a schema explicitly
 * allows zero clearance").
 */
function validateMeasurement(
  value: unknown,
  context: string,
  recordId: string,
  knownSourceIds: Set<string>,
  errors: ValidationIssue[],
  options: { allowNonPositive?: boolean } = {},
): void {
  if (!isMeasurementLike(value)) {
    errors.push({
      level: 'error',
      rule: 'non-positive-dimension',
      recordId,
      message: `${context}: expected a Measurement object, got ${JSON.stringify(value)}.`,
    });
    return;
  }

  const { valueMm, kind, sourceId, derivationId } = value;

  if (typeof valueMm !== 'number' || Number.isNaN(valueMm)) {
    errors.push({
      level: 'error',
      rule: 'non-positive-dimension',
      recordId,
      message: `${context}: valueMm must be a number, got ${JSON.stringify(valueMm)}.`,
    });
  } else if (!options.allowNonPositive && valueMm <= 0) {
    errors.push({
      level: 'error',
      rule: 'non-positive-dimension',
      recordId,
      message: `${context}: valueMm must be > 0, got ${valueMm}.`,
    });
  } else if (options.allowNonPositive && valueMm < 0) {
    errors.push({
      level: 'error',
      rule: 'non-positive-dimension',
      recordId,
      message: `${context}: valueMm must be >= 0, got ${valueMm}.`,
    });
  }

  if (kind === 'derived') {
    if (typeof derivationId !== 'string' || derivationId.length === 0) {
      errors.push({
        level: 'error',
        rule: 'missing-derivation',
        recordId,
        message: `${context}: kind is 'derived' but derivationId is missing.`,
      });
    }
  } else if (typeof kind === 'string' && SOURCED_KINDS.has(kind)) {
    if (typeof sourceId !== 'string' || sourceId.length === 0) {
      errors.push({
        level: 'error',
        rule: 'missing-source-id',
        recordId,
        message: `${context}: kind '${kind}' requires sourceId, none provided.`,
      });
    } else if (!knownSourceIds.has(sourceId)) {
      errors.push({
        level: 'error',
        rule: 'invalid-source-reference',
        recordId,
        message: `${context}: sourceId '${sourceId}' does not match any SourceRecord.`,
      });
    }
  }
}

function pushDuplicates(
  ids: Array<string | undefined>,
  rule: ValidationRule,
  label: string,
  errors: ValidationIssue[],
): void {
  const seen = new Map<string, number>();
  for (const id of ids) {
    if (!id) continue;
    seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) {
      errors.push({
        level: 'error',
        rule,
        recordId: id,
        message: `Duplicate ${label} '${id}' appears ${count} times.`,
      });
    }
  }
}

/**
 * Validates a dataset against the build-failure invariants in
 * specs/DATA_MODEL.md §9. Input is treated defensively (as runtime-unknown
 * shapes), not just trusted via TypeScript types, since real datasets are
 * authored as data files and must be checked at build time regardless of
 * compile-time typing.
 */
export function validateDataset(dataset: Dataset): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const sourceIds = new Set(dataset.sources.map((s) => s.id));
  const entityIds = new Set(dataset.entities.map((e) => e.id));

  // Duplicate IDs / slugs / routes.
  pushDuplicates(
    dataset.sources.map((s) => s.id),
    'duplicate-id',
    'source id',
    errors,
  );
  pushDuplicates(
    dataset.entities.map((e) => e.id),
    'duplicate-id',
    'entity id',
    errors,
  );
  pushDuplicates(
    dataset.entities.map((e) => e.slug),
    'duplicate-slug',
    'entity slug',
    errors,
  );
  pushDuplicates(
    dataset.clearanceRules.map((c) => c.id),
    'duplicate-id',
    'clearance rule id',
    errors,
  );
  pushDuplicates(
    dataset.relationships.map((r) => r.id),
    'duplicate-id',
    'relationship id',
    errors,
  );
  pushDuplicates(
    dataset.pageIntents.map((p) => p.id),
    'duplicate-id',
    'page intent id',
    errors,
  );
  pushDuplicates(
    dataset.pageIntents.map((p) => p.route),
    'duplicate-route',
    'route',
    errors,
  );
  pushDuplicates(
    dataset.routeDispositions.map((record) => record.pageIntentId),
    'duplicate-route-disposition',
    'route disposition PageIntent ID',
    errors,
  );
  pushDuplicates(
    dataset.seoPublications.map((publication) => publication.pageIntentId),
    'duplicate-seo-publication',
    'SEO publication pageIntentId',
    errors,
  );
  pushDuplicates(
    dataset.seoPublications.map((publication) => publication.title.toLowerCase()),
    'duplicate-seo-title',
    'SEO title',
    errors,
  );
  pushDuplicates(
    dataset.seoPublications.map((publication) => publication.canonicalPath),
    'duplicate-seo-canonical',
    'SEO canonical path',
    errors,
  );

  // Entity dimension / provenance checks, per category.
  for (const entity of dataset.entities) {
    const label = `entity '${entity.id}'`;

    if (entity.category === 'desk') {
      validateMeasurement(entity.widthMm, `${label} widthMm`, entity.id, sourceIds, errors);
      if (entity.depthMm !== undefined) {
        validateMeasurement(entity.depthMm, `${label} depthMm`, entity.id, sourceIds, errors);
      }
      if (entity.heightMm !== undefined) {
        validateMeasurement(entity.heightMm, `${label} heightMm`, entity.id, sourceIds, errors);
      }
    }

    if (entity.category === 'bed') {
      validateMeasurement(
        entity.mattressWidthMm,
        `${label} mattressWidthMm`,
        entity.id,
        sourceIds,
        errors,
      );
      validateMeasurement(
        entity.mattressLengthMm,
        `${label} mattressLengthMm`,
        entity.id,
        sourceIds,
        errors,
      );
      if (!['US', 'UK', 'EU', 'AU', 'other'].includes(entity.market)) {
        errors.push({
          level: 'error',
          rule: 'missing-bed-market',
          recordId: entity.id,
          message: `${label}: bed entities must declare market (US/UK/EU/AU/other).`,
        });
      }
      if (entity.defaultFrameAllowanceMm) {
        for (const side of ['left', 'right', 'head', 'foot'] as const) {
          const value = entity.defaultFrameAllowanceMm[side];
          if (value !== undefined) {
            validateMeasurement(
              value,
              `${label} defaultFrameAllowanceMm.${side}`,
              entity.id,
              sourceIds,
              errors,
            );
          }
        }
      }
    }

    if (entity.category === 'furniture') {
      for (const field of ['overallWidthMm', 'overallDepthMm', 'overallHeightMm'] as const) {
        validateMeasurement(entity[field], `${label} ${field}`, entity.id, sourceIds, errors);
      }
      for (const field of ['seatDepthMm', 'doorLeafWidthMm', 'drawerPulloutMm'] as const) {
        const value = entity[field];
        if (value !== undefined) {
          validateMeasurement(value, `${label} ${field}`, entity.id, sourceIds, errors);
        }
      }
      if (entity.furnitureType === 'wardrobe' && !entity.doorLeafWidthMm) {
        errors.push({
          level: 'error',
          rule: 'missing-door-leaf-measurement',
          recordId: entity.id,
          message: `${label}: wardrobe examples need a sourced hinged-door width.`,
        });
      }
      if (entity.furnitureType === 'dresser' && !entity.drawerPulloutMm) {
        errors.push({
          level: 'error',
          rule: 'missing-drawer-pullout-measurement',
          recordId: entity.id,
          message: `${label}: dresser examples need a sourced drawer-pullout measurement.`,
        });
      }
    }

    if (entity.category === 'room') {
      validateMeasurement(entity.widthMm, `${label} widthMm`, entity.id, sourceIds, errors);
      validateMeasurement(entity.lengthMm, `${label} lengthMm`, entity.id, sourceIds, errors);
    }

    if (entity.category === 'display') {
      for (const field of [
        'screenWidthMm',
        'screenHeightMm',
        'overallWidthMm',
        'overallHeightMm',
        'overallDepthMm',
        'standDepthMm',
        'standWidthMm',
      ] as const) {
        const value = entity[field];
        if (value !== undefined) {
          validateMeasurement(value, `${label} ${field}`, entity.id, sourceIds, errors);
        }
      }
    }
  }

  // Clearance rules: minimum/recommended may legitimately be zero.
  for (const rule of dataset.clearanceRules) {
    if (rule.minimumMm !== undefined) {
      validateMeasurement(
        rule.minimumMm,
        `clearance rule '${rule.id}' minimumMm`,
        rule.id,
        sourceIds,
        errors,
        { allowNonPositive: true },
      );
    }
    if (rule.recommendedMm !== undefined) {
      validateMeasurement(
        rule.recommendedMm,
        `clearance rule '${rule.id}' recommendedMm`,
        rule.id,
        sourceIds,
        errors,
        { allowNonPositive: true },
      );
    }
    for (const sourceId of rule.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push({
          level: 'error',
          rule: 'invalid-source-reference',
          recordId: rule.id,
          message: `clearance rule '${rule.id}': sourceId '${sourceId}' does not match any SourceRecord.`,
        });
      }
    }
  }

  // Relationship endpoints.
  for (const relationship of dataset.relationships) {
    if (!entityIds.has(relationship.fromId)) {
      errors.push({
        level: 'error',
        rule: 'invalid-relationship-endpoint',
        recordId: relationship.id,
        message: `relationship '${relationship.id}': fromId '${relationship.fromId}' does not match any entity.`,
      });
    }
    if (!entityIds.has(relationship.toId)) {
      errors.push({
        level: 'error',
        rule: 'invalid-relationship-endpoint',
        recordId: relationship.id,
        message: `relationship '${relationship.id}': toId '${relationship.toId}' does not match any entity.`,
      });
    }
  }

  // Published page intents must reference real entities.
  for (const pageIntent of dataset.pageIntents) {
    if (pageIntent.status !== 'published') continue;
    for (const entityId of pageIntent.entityIds) {
      if (!entityIds.has(entityId)) {
        errors.push({
          level: 'error',
          rule: 'missing-entity-reference',
          recordId: pageIntent.id,
          message: `page intent '${pageIntent.id}' (published): entityId '${entityId}' does not match any entity.`,
        });
      }
    }
  }

  // SEO publications must match their intent, contain stable metadata, and
  // only reference published/indexable pages in their breadcrumb hierarchy.
  const pageIntentsById = new Map(dataset.pageIntents.map((intent) => [intent.id, intent]));
  const dispositionsByIntentId = new Map(
    dataset.routeDispositions.map((record) => [record.pageIntentId, record]),
  );
  const publicationsByIntentId = new Map(
    dataset.seoPublications.map((publication) => [publication.pageIntentId, publication]),
  );
  for (const pageIntent of dataset.pageIntents) {
    const disposition = dispositionsByIntentId.get(pageIntent.id);
    if (!disposition) {
      errors.push({
        level: 'error',
        rule: 'missing-route-disposition',
        recordId: pageIntent.id,
        message: `PageIntent '${pageIntent.id}' must be generated, explicitly deferred, or marked as draft in the route disposition manifest.`,
      });
      continue;
    }

    if (disposition.route !== pageIntent.route || disposition.intentStatus !== pageIntent.status) {
      errors.push({
        level: 'error',
        rule: 'invalid-route-disposition',
        recordId: pageIntent.id,
        message: `Route disposition for '${pageIntent.id}' must match the source PageIntent route and status exactly.`,
      });
    }
    const statusDispositionMatches =
      (pageIntent.status === 'published' &&
        (disposition.disposition === 'generated' || disposition.disposition === 'deferred')) ||
      (pageIntent.status === 'draft' && disposition.disposition === 'draft') ||
      (pageIntent.status === 'deferred' && disposition.disposition === 'deferred');
    if (!statusDispositionMatches) {
      errors.push({
        level: 'error',
        rule: 'invalid-route-disposition',
        recordId: pageIntent.id,
        message: `PageIntent '${pageIntent.id}' with source status '${pageIntent.status}' has incompatible route disposition '${disposition.disposition}'.`,
      });
    }
    if (
      (disposition.disposition === 'generated' && !disposition.renderer) ||
      (disposition.disposition !== 'generated' && 'renderer' in disposition) ||
      (disposition.disposition === 'deferred' && !disposition.reason.trim())
    ) {
      errors.push({
        level: 'error',
        rule: 'invalid-route-disposition',
        recordId: pageIntent.id,
        message: `Route disposition '${pageIntent.id}' must define a renderer for generated routes or a reason for deferred routes, and no renderer for non-generated routes.`,
      });
    }
  }
  for (const disposition of dataset.routeDispositions) {
    if (!pageIntentsById.has(disposition.pageIntentId)) {
      errors.push({
        level: 'error',
        rule: 'invalid-route-disposition',
        recordId: disposition.pageIntentId,
        message: `Route disposition references unknown PageIntent '${disposition.pageIntentId}'.`,
      });
    }
  }

  for (const pageIntent of dataset.pageIntents) {
    const routeDisposition = dispositionsByIntentId.get(pageIntent.id);
    if (
      pageIntent.status === 'published' &&
      routeDisposition?.disposition === 'generated' &&
      routeDisposition.renderer === 'family' &&
      !publicationsByIntentId.has(pageIntent.id)
    ) {
      errors.push({
        level: 'error',
        rule: 'missing-seo-publication',
        recordId: pageIntent.id,
        message: `Published route '${pageIntent.route}' is generated from PageIntent '${pageIntent.id}' but has no SEO publication envelope.`,
      });
    }
  }

  for (const publication of dataset.seoPublications) {
    const pageIntent = pageIntentsById.get(publication.pageIntentId);
    if (!pageIntent) {
      errors.push({
        level: 'error',
        rule: 'invalid-seo-publication',
        recordId: publication.pageIntentId,
        message: `SEO publication references missing PageIntent '${publication.pageIntentId}'.`,
      });
    } else {
      if (publication.canonicalPath !== pageIntent.route) {
        errors.push({
          level: 'error',
          rule: 'invalid-seo-publication',
          recordId: publication.pageIntentId,
          message: `SEO canonicalPath '${publication.canonicalPath}' must exactly match PageIntent route '${pageIntent.route}'.`,
        });
      }
      if (publication.indexable && pageIntent.status !== 'published') {
        errors.push({
          level: 'error',
          rule: 'invalid-seo-publication',
          recordId: publication.pageIntentId,
          message: `SEO publication '${publication.pageIntentId}' is indexable but PageIntent status is '${pageIntent.status}'.`,
        });
      }
    }

    for (const [field, value] of [
      ['title', publication.title],
      ['description', publication.description],
      ['h1', publication.h1],
    ]) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        errors.push({
          level: 'error',
          rule: 'invalid-seo-publication',
          recordId: publication.pageIntentId,
          message: `SEO publication '${publication.pageIntentId}' requires a non-empty ${field}.`,
        });
      }
    }

    if (
      !publication.canonicalPath.startsWith('/') ||
      !publication.canonicalPath.endsWith('/') ||
      publication.canonicalPath.includes('//') ||
      /[?#]/.test(publication.canonicalPath)
    ) {
      errors.push({
        level: 'error',
        rule: 'invalid-seo-publication',
        recordId: publication.pageIntentId,
        message: `SEO canonicalPath '${publication.canonicalPath}' must be a normalized absolute path with a trailing slash and no query/hash.`,
      });
    }

    const isValidDate = (date: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      const parsed = new Date(`${date}T00:00:00Z`);
      return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
    };
    if (
      !isValidDate(publication.publishedOn) ||
      (publication.significantlyModifiedOn !== undefined &&
        (!isValidDate(publication.significantlyModifiedOn) ||
          publication.significantlyModifiedOn < publication.publishedOn))
    ) {
      errors.push({
        level: 'error',
        rule: 'invalid-seo-publication',
        recordId: publication.pageIntentId,
        message: `SEO publication '${publication.pageIntentId}' has invalid publishedOn/significantlyModifiedOn dates.`,
      });
    }

    const seenBreadcrumbIds = new Set<string>();
    for (const ancestorId of publication.breadcrumbIds) {
      const ancestor = pageIntentsById.get(ancestorId);
      const ancestorPublication = publicationsByIntentId.get(ancestorId);
      if (
        !ancestor ||
        ancestorId === publication.pageIntentId ||
        seenBreadcrumbIds.has(ancestorId) ||
        ancestor.status !== 'published' ||
        !ancestorPublication?.indexable
      ) {
        errors.push({
          level: 'error',
          rule: 'invalid-breadcrumb-reference',
          recordId: publication.pageIntentId,
          message: `SEO breadcrumb ancestor '${ancestorId}' must be a distinct published PageIntent with an indexable SEO publication.`,
        });
      }
      seenBreadcrumbIds.add(ancestorId);
    }

    for (const sourceId of publication.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push({
          level: 'error',
          rule: 'invalid-source-reference',
          recordId: publication.pageIntentId,
          message: `SEO publication for '${publication.pageIntentId}': sourceId '${sourceId}' does not match any SourceRecord.`,
        });
      }
    }
    for (const relatedId of publication.relatedPageIds) {
      const relatedIntent = pageIntentsById.get(relatedId);
      if (
        !relatedIntent ||
        relatedIntent.status !== 'published' ||
        !publicationsByIntentId.get(relatedId)?.indexable
      ) {
        errors.push({
          level: 'error',
          rule: 'invalid-related-page-reference',
          recordId: publication.pageIntentId,
          message: `SEO related page '${relatedId}' must be a distinct published PageIntent with an indexable SEO publication.`,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/** Formats a ValidationResult as human-readable lines for CLI/build output. */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];
  for (const issue of result.errors) {
    lines.push(`ERROR [${issue.rule}] ${issue.message}`);
  }
  for (const issue of result.warnings) {
    lines.push(`WARN  [${issue.rule}] ${issue.message}`);
  }
  if (lines.length === 0) {
    lines.push('Dataset valid: 0 errors, 0 warnings.');
  }
  return lines.join('\n');
}
