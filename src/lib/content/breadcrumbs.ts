import type { ContentCluster } from '../../types';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

const CLUSTER_LABELS: Record<ContentCluster, string> = {
  workspace: 'Workspace',
  bedroom: 'Bedroom',
  dining: 'Dining',
  living: 'Living',
  appliances: 'Appliances',
  storage: 'Storage',
  gym: 'Gym',
  other: 'Other',
};

/** Also used by [...slug].astro to derive hub-link labels from a route. */
export function titleCaseFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Builds a simple Home → Cluster → Page breadcrumb trail from a route and
 * cluster. This is a placeholder derived purely from the URL shape; T017
 * replaces it with the typed ancestor chain from the SEO publication
 * envelope's `breadcrumbIds` once that data exists.
 */
export function buildBreadcrumb(route: string, cluster: ContentCluster): BreadcrumbItem[] {
  const segments = route.split('/').filter(Boolean);
  const clusterHref = `/${cluster}/`;
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: CLUSTER_LABELS[cluster], href: clusterHref },
  ];

  const lastSegment = segments[segments.length - 1];
  if (lastSegment && clusterHref !== `/${lastSegment}/`) {
    items.push({ label: titleCaseFromSlug(lastSegment), href: route });
  }

  return items;
}
