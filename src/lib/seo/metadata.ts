import type { PageIntent, SeoPublication } from '../../types';
import type { BreadcrumbItem } from '../content';

export const SITE_ORIGIN = 'https://fitwise.stream';

export function absoluteCanonical(path: string): string {
  const normalized = path === '/' ? '/' : `/${path.split('/').filter(Boolean).join('/')}/`;
  return new URL(normalized, SITE_ORIGIN).href;
}

export function buildPublicationBreadcrumbs(
  pageIntent: PageIntent,
  publication: SeoPublication,
  pageIntents: PageIntent[],
  publications: SeoPublication[],
): BreadcrumbItem[] {
  const intentById = new Map(pageIntents.map((intent) => [intent.id, intent]));
  const publicationById = new Map(publications.map((record) => [record.pageIntentId, record]));
  const ancestors = publication.breadcrumbIds.map((id) => {
    const ancestor = intentById.get(id);
    const ancestorPublication = publicationById.get(id);
    if (!ancestor || !ancestorPublication?.indexable) {
      throw new Error(`Breadcrumb ancestor '${id}' is missing or not indexable.`);
    }
    return { label: ancestorPublication.h1, href: ancestor.route };
  });

  return [
    { label: 'Home', href: '/' },
    ...ancestors,
    { label: publication.h1, href: pageIntent.route },
  ];
}

export function publicationStructuredData(
  publication: SeoPublication,
  breadcrumb: BreadcrumbItem[],
): Record<string, unknown>[] {
  const canonical = absoluteCanonical(publication.canonicalPath);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: publication.title,
      description: publication.description,
      inLanguage: publication.language ?? 'en',
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: breadcrumb.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: absoluteCanonical(item.href),
      })),
    },
  ];
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
