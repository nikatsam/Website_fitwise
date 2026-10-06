import { describe, expect, it } from 'vitest';
import { getPublishedRoutes, buildBreadcrumb } from '../../src/lib/content';
import { emptyDataset, type Dataset } from '../../src/lib/validation/dataset';
import type { PageIntent } from '../../src/types';

function pageIntent(overrides: Partial<PageIntent>): PageIntent {
  return {
    id: 'pi-test',
    route: '/workspace/test-page/',
    family: 'hub',
    cluster: 'workspace',
    primaryQuery: 'test',
    entityIds: [],
    status: 'draft',
    justification: 'test',
    ...overrides,
  };
}

describe('getPublishedRoutes', () => {
  it('includes published intents and derives a slug with no leading/trailing slash', () => {
    const dataset: Dataset = {
      ...emptyDataset,
      pageIntents: [
        pageIntent({ id: 'pi-a', route: '/workspace/desk-size-guide/', status: 'published' }),
      ],
    };
    const routes = getPublishedRoutes(dataset);
    expect(routes).toEqual([
      { slug: 'workspace/desk-size-guide', pageIntent: dataset.pageIntents[0] },
    ]);
  });

  it('excludes draft and deferred intents, never generating a route for them', () => {
    const dataset: Dataset = {
      ...emptyDataset,
      pageIntents: [
        pageIntent({ id: 'pi-draft', status: 'draft' }),
        pageIntent({ id: 'pi-deferred', status: 'deferred' }),
      ],
    };
    expect(getPublishedRoutes(dataset)).toEqual([]);
  });

  it('returns an empty list for an empty dataset', () => {
    expect(getPublishedRoutes(emptyDataset)).toEqual([]);
  });
});

describe('buildBreadcrumb', () => {
  it('builds Home -> Cluster -> Page for a nested route', () => {
    const crumbs = buildBreadcrumb('/workspace/desk-size-for-two-27-inch-monitors/', 'workspace');
    expect(crumbs).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Workspace', href: '/workspace/' },
      {
        label: 'Desk Size For Two 27 Inch Monitors',
        href: '/workspace/desk-size-for-two-27-inch-monitors/',
      },
    ]);
  });

  it('does not duplicate the cluster crumb for a cluster index page', () => {
    const crumbs = buildBreadcrumb('/bedroom/', 'bedroom');
    expect(crumbs).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Bedroom', href: '/bedroom/' },
    ]);
  });
});
