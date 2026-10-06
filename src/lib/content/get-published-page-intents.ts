import type { PageIntent } from '../../types';
import type { Dataset } from '../validation/dataset';

export interface PublishedRoute {
  /** Route with no leading/trailing slash, for Astro's [...slug] param. */
  slug: string;
  pageIntent: PageIntent;
}

/**
 * Selects published PageIntents as route candidates and derives their Astro
 * slug. The separate route-disposition manifest decides whether each
 * candidate is generated or explicitly deferred. Draft and deferred records
 * never become a public route; indexability is separately controlled by the
 * SEO publication envelope.
 */
export function getPublishedRoutes(dataset: Dataset): PublishedRoute[] {
  return dataset.pageIntents
    .filter((intent) => intent.status === 'published')
    .map((intent) => ({
      slug: intent.route.replace(/^\/+|\/+$/g, ''),
      pageIntent: intent,
    }));
}
