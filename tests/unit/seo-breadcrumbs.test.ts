import { describe, expect, it } from 'vitest';
import { dataset } from '../../src/data';
import { buildPublicationBreadcrumbs, publicationStructuredData } from '../../src/lib/seo/metadata';

function breadcrumbsFor(route: string) {
  const pageIntent = dataset.pageIntents.find((item) => item.route === route);
  expect(pageIntent, route).toBeDefined();
  const publication = dataset.seoPublications.find((item) => item.pageIntentId === pageIntent?.id);
  expect(publication, route).toBeDefined();
  return {
    publication: publication!,
    breadcrumbs: buildPublicationBreadcrumbs(
      pageIntent!,
      publication!,
      dataset.pageIntents,
      dataset.seoPublications,
    ),
  };
}

describe('published breadcrumbs', () => {
  it('uses the navigation taxonomy for required feature examples', () => {
    expect(
      breadcrumbsFor('/garden/shed-interior-storage/').breadcrumbs.map((item) => item.label),
    ).toEqual(['Home', 'Garden', 'Shed storage']);
    expect(breadcrumbsFor('/appliances/fridge-fit/').breadcrumbs.map((item) => item.label)).toEqual(
      ['Home', 'Appliances', 'Fridge fit'],
    );
    expect(
      breadcrumbsFor('/workspace/what-fits-on-a-140cm-desk/').breadcrumbs.map((item) => item.label),
    ).toEqual(['Home', 'Workspace', 'Desk sizing', '140 cm desk']);
  });

  it('infers published route parents when no explicit ancestry is set', () => {
    expect(
      breadcrumbsFor('/bedroom/what-size-bed-fits-my-room/').breadcrumbs.map((item) => item.label),
    ).toEqual(['Home', 'Bedroom', 'What size bed fits my room? US and UK planning guide']);
  });

  it('serializes the same visible breadcrumb labels and routes into BreadcrumbList', () => {
    const { publication, breadcrumbs } = breadcrumbsFor('/workspace/what-fits-on-a-140cm-desk/');
    const breadcrumbJsonLd = publicationStructuredData(publication, breadcrumbs).find(
      (item) => item['@type'] === 'BreadcrumbList',
    );
    const items = breadcrumbJsonLd?.itemListElement as
      { name: string; item: string; position: number }[] | undefined;

    expect(items?.map((item) => item.name)).toEqual(breadcrumbs.map((item) => item.label));
    expect(items?.map((item) => new URL(item.item).pathname)).toEqual(
      breadcrumbs.map((item) => item.href),
    );
    expect(items?.map((item) => item.position)).toEqual([1, 2, 3, 4]);
  });
});
