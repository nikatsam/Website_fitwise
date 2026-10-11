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
  const intentByRoute = new Map(pageIntents.map((intent) => [intent.route, intent]));
  const publicationById = new Map(publications.map((record) => [record.pageIntentId, record]));
  const explicitAncestors = publication.breadcrumbIds.map((id) => {
    const ancestor = intentById.get(id);
    const ancestorPublication = publicationById.get(id);
    if (!ancestor || !ancestorPublication?.indexable) {
      throw new Error(`Breadcrumb ancestor '${id}' is missing or not indexable.`);
    }
    return {
      label: ancestorPublication.breadcrumbLabel ?? ancestorPublication.h1,
      href: ancestor.route,
    };
  });
  const inferredAncestors: BreadcrumbItem[] = [];
  if (publication.breadcrumbIds.length === 0) {
    const segments = pageIntent.route.split('/').filter(Boolean);
    for (let depth = 1; depth < segments.length; depth += 1) {
      const ancestorRoute = `/${segments.slice(0, depth).join('/')}/`;
      const ancestor = intentByRoute.get(ancestorRoute);
      const ancestorPublication = ancestor && publicationById.get(ancestor.id);
      if (ancestor?.status === 'published' && ancestorPublication?.indexable) {
        inferredAncestors.push({
          label: ancestorPublication.breadcrumbLabel ?? ancestorPublication.h1,
          href: ancestor.route,
        });
      }
    }
  }

  return [
    { label: 'Home', href: '/' },
    ...(explicitAncestors.length > 0 ? explicitAncestors : inferredAncestors),
    { label: publication.breadcrumbLabel ?? publication.h1, href: pageIntent.route },
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
    breadcrumbListStructuredData(publication.canonicalPath, breadcrumb),
  ];
}

export function breadcrumbListStructuredData(
  path: string,
  breadcrumb: BreadcrumbItem[],
): Record<string, unknown> {
  const canonical = absoluteCanonical(path);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: breadcrumb.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteCanonical(item.href),
    })),
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
