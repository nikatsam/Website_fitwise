import type { PageIntent, RouteDispositionRecord, SeoPublication } from '../../types';
import { titleCaseFromSlug } from './breadcrumbs';

export interface ContentNavigationLink {
  href: string;
  label: string;
  description: string;
}

// Kept separate from SeoPublication.relatedPageIds, which is intentionally
// restricted to indexable pages; navigation may also point to public noindex guides.
const CONTENT_LINK_TARGETS: Record<string, string[]> = {
  'pi-p001-desk-size-guide': [
    'pi-p019-monitor-size-chart',
    'pi-p011-what-fits-140cm-desk',
    'pi-p004-desk-size-two-27in',
    'pi-p013-120-vs-140cm-desk',
    'pi-p015-desk-depth-for-monitor',
  ],
  'pi-p004-desk-size-two-27in': [
    'pi-p001-desk-size-guide',
    'pi-p011-what-fits-140cm-desk',
    'pi-p019-monitor-size-chart',
    'pi-p015-desk-depth-for-monitor',
  ],
  'pi-p011-what-fits-140cm-desk': [
    'pi-p001-desk-size-guide',
    'pi-p019-monitor-size-chart',
    'pi-p004-desk-size-two-27in',
    'pi-p010-what-fits-120cm-desk',
    'pi-p012-what-fits-160cm-desk',
    'pi-p013-120-vs-140cm-desk',
    'pi-p014-140-vs-160cm-desk',
    'pi-p015-desk-depth-for-monitor',
  ],
  'pi-p019-monitor-size-chart': [
    'pi-p001-desk-size-guide',
    'pi-p011-what-fits-140cm-desk',
    'pi-p004-desk-size-two-27in',
    'pi-p015-desk-depth-for-monitor',
  ],
  'pi-p023-bed-fits-room-hub': [
    'pi-p039-us-bed-size-dimensions',
    'pi-p040-uk-bed-size-dimensions',
    'pi-p024-room-for-king-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p027-bed-in-10x10-room',
    'pi-p028-bed-in-10x12-room',
    'pi-p030-king-vs-queen-room-space',
  ],
  'pi-p024-room-for-king-bed': [
    'pi-p023-bed-fits-room-hub',
    'pi-p039-us-bed-size-dimensions',
    'pi-p040-uk-bed-size-dimensions',
    'pi-p025-room-for-queen-bed',
    'pi-p027-bed-in-10x10-room',
    'pi-p028-bed-in-10x12-room',
    'pi-p030-king-vs-queen-room-space',
  ],
  'pi-p025-room-for-queen-bed': [
    'pi-p023-bed-fits-room-hub',
    'pi-p039-us-bed-size-dimensions',
    'pi-p024-room-for-king-bed',
    'pi-p027-bed-in-10x10-room',
    'pi-p028-bed-in-10x12-room',
    'pi-p030-king-vs-queen-room-space',
  ],
  'pi-p027-bed-in-10x10-room': [
    'pi-p023-bed-fits-room-hub',
    'pi-p024-room-for-king-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p030-king-vs-queen-room-space',
    'pi-p039-us-bed-size-dimensions',
  ],
  'pi-p028-bed-in-10x12-room': [
    'pi-p023-bed-fits-room-hub',
    'pi-p024-room-for-king-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p030-king-vs-queen-room-space',
    'pi-p039-us-bed-size-dimensions',
  ],
  'pi-p039-us-bed-size-dimensions': [
    'pi-p040-uk-bed-size-dimensions',
    'pi-p023-bed-fits-room-hub',
    'pi-p024-room-for-king-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p027-bed-in-10x10-room',
    'pi-p030-king-vs-queen-room-space',
  ],
  'pi-p040-uk-bed-size-dimensions': [
    'pi-p039-us-bed-size-dimensions',
    'pi-p023-bed-fits-room-hub',
    'pi-p024-room-for-king-bed',
    'pi-p026-room-for-double-bed',
  ],
};

export function buildContentNavigationLinks(
  pageIntentId: string,
  pageIntents: PageIntent[],
  publications: SeoPublication[],
  routeDispositions: RouteDispositionRecord[],
): ContentNavigationLink[] {
  const targets = CONTENT_LINK_TARGETS[pageIntentId] ?? [];
  const intentById = new Map(pageIntents.map((intent) => [intent.id, intent]));
  const publicationById = new Map(
    publications.map((publication) => [publication.pageIntentId, publication]),
  );
  const dispositionById = new Map(
    routeDispositions.map((disposition) => [disposition.pageIntentId, disposition]),
  );
  const seen = new Set<string>();

  return targets.map((targetId) => {
    const intent = intentById.get(targetId);
    const publication = publicationById.get(targetId);
    const disposition = dispositionById.get(targetId);
    if (
      targetId === pageIntentId ||
      seen.has(targetId) ||
      intent?.status !== 'published' ||
      disposition?.disposition !== 'generated'
    ) {
      throw new Error(`Content navigation target '${targetId}' for '${pageIntentId}' is invalid.`);
    }
    seen.add(targetId);
    return {
      href: intent.route,
      label: publication?.h1 ?? titleCaseFromSlug(intent.primaryQuery),
      description: publication?.description ?? intent.justification,
    };
  });
}
