import type { SeoMarket, SeoPublication } from '../types';
import { titleCaseFromSlug } from '../lib/content';
import { buildFamilyAnswer } from '../lib/content/build-family-answer';
import type { Dataset } from '../lib/validation/dataset';

const FAMILY_RENDERERS = new Set(['object_to_space', 'space_to_object', 'comparison', 'clearance']);

const EDITORIAL_OVERRIDES: Record<string, Partial<SeoPublication>> = {
  'pi-p024-room-for-king-bed': {
    title: 'King Mattress Room-Space Estimates: US vs UK — Fitwise.stream',
    description:
      'Compare clear-space plans for US King and UK Standard King mattresses. These are recommendations, not building-code minimums; frame and furniture dimensions vary.',
    h1: 'King mattress room-space estimates: US vs UK',
    significantlyModifiedOn: '2026-10-08',
    relatedPageIds: ['pi-p039-us-bed-size-dimensions', 'pi-p040-uk-bed-size-dimensions'],
  },
  'pi-p025-room-for-queen-bed': {
    title: 'US Queen Mattress Clear-Space Planning Estimate — Fitwise.stream',
    description:
      'Estimate a mattress-only clear-space rectangle for a nominal US Queen using cited side and foot allowances. This is not a complete room layout or building-code minimum.',
    h1: 'US Queen mattress: clear-space planning estimate',
    significantlyModifiedOn: '2026-10-08',
    relatedPageIds: ['pi-p039-us-bed-size-dimensions'],
  },
  'pi-p030-king-vs-queen-room-space': {
    title: 'US King vs Queen Bed: Room-Space Comparison — Fitwise.stream',
    description:
      'Compare nominal US King and Queen mattress footprints and recommended clear-space rectangles. Estimates exclude frames, furniture and circulation; they are not legal minimums.',
    h1: 'US King vs Queen: compare mattress and room-space dimensions',
    significantlyModifiedOn: '2026-10-08',
    relatedPageIds: ['pi-p039-us-bed-size-dimensions'],
  },
};

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
      intentEvidence: `Offline answer generated from PageIntent '${intent.id}' and cited dimensions/rules; remains noindex pending search-demand, SERP-gap and indexable-link release evidence.`,
      ...EDITORIAL_OVERRIDES[intent.id],
    };
    return [publication];
  });
}
