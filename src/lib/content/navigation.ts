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
    'pi-p018-desk-chair-clearance',
  ],
  'pi-p004-desk-size-two-27in': [
    'pi-p001-desk-size-guide',
    'pi-p011-what-fits-140cm-desk',
    'pi-p019-monitor-size-chart',
    'pi-p015-desk-depth-for-monitor',
    'pi-p018-desk-chair-clearance',
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
    'pi-p018-desk-chair-clearance',
  ],
  'pi-p019-monitor-size-chart': [
    'pi-p001-desk-size-guide',
    'pi-p011-what-fits-140cm-desk',
    'pi-p004-desk-size-two-27in',
    'pi-p015-desk-depth-for-monitor',
    'pi-p018-desk-chair-clearance',
  ],
  'pi-p015-desk-depth-for-monitor': [
    'pi-p001-desk-size-guide',
    'pi-p019-monitor-size-chart',
    'pi-p011-what-fits-140cm-desk',
    'pi-p018-desk-chair-clearance',
  ],
  'pi-p018-desk-chair-clearance': [
    'pi-p001-desk-size-guide',
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
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
    'pi-p036-king-bed-nightstands-room',
    'pi-p037-queen-bed-nightstands-room',
  ],
  'pi-p024-room-for-king-bed': [
    'pi-p023-bed-fits-room-hub',
    'pi-p039-us-bed-size-dimensions',
    'pi-p040-uk-bed-size-dimensions',
    'pi-p025-room-for-queen-bed',
    'pi-p027-bed-in-10x10-room',
    'pi-p028-bed-in-10x12-room',
    'pi-p030-king-vs-queen-room-space',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
    'pi-p036-king-bed-nightstands-room',
  ],
  'pi-p025-room-for-queen-bed': [
    'pi-p023-bed-fits-room-hub',
    'pi-p039-us-bed-size-dimensions',
    'pi-p024-room-for-king-bed',
    'pi-p027-bed-in-10x10-room',
    'pi-p028-bed-in-10x12-room',
    'pi-p030-king-vs-queen-room-space',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
    'pi-p037-queen-bed-nightstands-room',
  ],
  'pi-p027-bed-in-10x10-room': [
    'pi-p023-bed-fits-room-hub',
    'pi-p024-room-for-king-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p030-king-vs-queen-room-space',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
    'pi-p039-us-bed-size-dimensions',
  ],
  'pi-p028-bed-in-10x12-room': [
    'pi-p023-bed-fits-room-hub',
    'pi-p024-room-for-king-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p030-king-vs-queen-room-space',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
    'pi-p039-us-bed-size-dimensions',
  ],
  'pi-p039-us-bed-size-dimensions': [
    'pi-p040-uk-bed-size-dimensions',
    'pi-p023-bed-fits-room-hub',
    'pi-p024-room-for-king-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p027-bed-in-10x10-room',
    'pi-p030-king-vs-queen-room-space',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
    'pi-p036-king-bed-nightstands-room',
    'pi-p037-queen-bed-nightstands-room',
  ],
  'pi-p040-uk-bed-size-dimensions': [
    'pi-p039-us-bed-size-dimensions',
    'pi-p023-bed-fits-room-hub',
    'pi-p024-room-for-king-bed',
    'pi-p026-room-for-double-bed',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
  ],
  'pi-p026-room-for-double-bed': [
    'pi-p023-bed-fits-room-hub',
    'pi-p039-us-bed-size-dimensions',
    'pi-p040-uk-bed-size-dimensions',
    'pi-p031-double-vs-queen-room-space',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
  ],
  'pi-p030-king-vs-queen-room-space': [
    'pi-p039-us-bed-size-dimensions',
    'pi-p024-room-for-king-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p031-double-vs-queen-room-space',
    'pi-p036-king-bed-nightstands-room',
    'pi-p037-queen-bed-nightstands-room',
  ],
  'pi-p031-double-vs-queen-room-space': [
    'pi-p039-us-bed-size-dimensions',
    'pi-p026-room-for-double-bed',
    'pi-p025-room-for-queen-bed',
    'pi-p030-king-vs-queen-room-space',
  ],
  'pi-p034-space-bed-wardrobe': [
    'pi-p023-bed-fits-room-hub',
    'pi-p039-us-bed-size-dimensions',
    'pi-p035-bed-dresser-clearance',
    'pi-p036-king-bed-nightstands-room',
    'pi-p037-queen-bed-nightstands-room',
  ],
  'pi-p035-bed-dresser-clearance': [
    'pi-p023-bed-fits-room-hub',
    'pi-p040-uk-bed-size-dimensions',
    'pi-p034-space-bed-wardrobe',
    'pi-p036-king-bed-nightstands-room',
    'pi-p037-queen-bed-nightstands-room',
  ],
  'pi-p036-king-bed-nightstands-room': [
    'pi-p023-bed-fits-room-hub',
    'pi-p039-us-bed-size-dimensions',
    'pi-p024-room-for-king-bed',
    'pi-p037-queen-bed-nightstands-room',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
  ],
  'pi-p037-queen-bed-nightstands-room': [
    'pi-p023-bed-fits-room-hub',
    'pi-p039-us-bed-size-dimensions',
    'pi-p025-room-for-queen-bed',
    'pi-p036-king-bed-nightstands-room',
    'pi-p034-space-bed-wardrobe',
    'pi-p035-bed-dresser-clearance',
  ],
};

export function buildContentNavigationLinks(
  pageIntentId: string,
  pageIntents: PageIntent[],
  publications: SeoPublication[],
  routeDispositions: RouteDispositionRecord[],
): ContentNavigationLink[] {
  const intentById = new Map(pageIntents.map((intent) => [intent.id, intent]));
  const publicationById = new Map(
    publications.map((publication) => [publication.pageIntentId, publication]),
  );
  const targets = [
    ...new Set([
      ...(CONTENT_LINK_TARGETS[pageIntentId] ?? []),
      ...(publicationById.get(pageIntentId)?.relatedPageIds ?? []),
    ]),
  ];
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
