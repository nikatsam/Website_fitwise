import type { SeoMarket, SeoPublication } from '../types';
import { titleCaseFromSlug } from '../lib/content';
import { buildFamilyAnswer } from '../lib/content/build-family-answer';
import type { Dataset } from '../lib/validation/dataset';

const FAMILY_RENDERERS = new Set(['object_to_space', 'space_to_object', 'comparison', 'clearance']);

export function buildFamilySeoPublications(
  dataset: Omit<Dataset, 'seoPublications'>,
): SeoPublication[] {
  const calculationDataset: Dataset = { ...dataset, seoPublications: [] };
  return dataset.routeDispositions.flatMap((disposition) => {
    if (disposition.disposition !== 'generated' || disposition.renderer !== 'family') {
      return [];
    }
    const intent = dataset.pageIntents.find(
      (candidate) => candidate.id === disposition.pageIntentId,
    );
    if (!intent || !FAMILY_RENDERERS.has(intent.family)) return [];
    const answer = buildFamilyAnswer(intent, calculationDataset);
    const slug = intent.route.split('/').filter(Boolean).at(-1) ?? intent.route;
    const bedMarkets = intent.entityIds
      .map((id) => dataset.entities.find((entity) => entity.id === id))
      .filter(
        (entity): entity is Extract<Dataset['entities'][number], { category: 'bed' }> =>
          entity?.category === 'bed',
      )
      .map((entity) => entity.market);
    const uniqueMarkets = [...new Set(bedMarkets)];
    const firstMarket = uniqueMarkets[0];
    const market: SeoMarket =
      uniqueMarkets.length === 1 &&
      (firstMarket === 'US' || firstMarket === 'UK' || firstMarket === 'EU' || firstMarket === 'AU')
        ? firstMarket
        : 'global';
    const publication: SeoPublication = {
      pageIntentId: intent.id,
      indexable: false,
      title: `${titleCaseFromSlug(slug)} — Fitwise.stream`,
      description: answer.intro,
      h1: `${intent.primaryQuery.charAt(0).toUpperCase()}${intent.primaryQuery.slice(1)}`,
      canonicalPath: intent.route,
      publishedOn: '2026-10-06',
      breadcrumbIds: [],
      relatedPageIds: [],
      market,
      language: market === 'UK' ? 'en-GB' : 'en',
      sourceIds: answer.sources.map((source) => source.id),
      intentEvidence: `Offline answer generated from PageIntent '${intent.id}' and cited dimensions/rules; kept noindex pending editorial release review.`,
    };
    return [publication];
  });
}
