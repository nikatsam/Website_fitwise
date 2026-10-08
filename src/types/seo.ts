export type SeoMarket = 'US' | 'UK' | 'EU' | 'AU' | 'global';

/**
 * SEO publication envelope for a PageIntent (specs/TECHNICAL_SEO_PLAYBOOK.md §2).
 * Separate from physical object data; joins to PageIntent by `pageIntentId`.
 *
 * Note: `pageIntentId` is not spelled out in the literal interface snippet in
 * TECHNICAL_SEO_PLAYBOOK.md §2, but the prose there says records "join by
 * PageIntent ID" — this field is that join key, added here to make the
 * described relationship representable in code.
 */
export interface SeoPublication {
  pageIntentId: string;
  /** true only if the joined PageIntent.status === 'published'. */
  indexable: boolean;
  title: string;
  description: string;
  h1: string;
  /** Must equal the joined PageIntent.route. */
  canonicalPath: string;
  /** YYYY-MM-DD, editorially accurate. */
  publishedOn: string;
  /** YYYY-MM-DD; update only on material/significant change, not every build. */
  significantlyModifiedOn?: string;
  /** Stable ancestor PageIntent ids, not raw URL segments. */
  breadcrumbIds: string[];
  /** Reciprocal published market/language variants; only indexable pages. */
  alternatePageIds?: string[];
  /** Only ids of other published, indexable PageIntents. */
  relatedPageIds: string[];
  market?: SeoMarket;
  /** Initial default 'en'; use real locale variants only when they exist. */
  language?: string;
  imagePath?: string;
  sourceIds: string[];
  /** Research/evidence justifying this as a standalone URL rather than folded into a hub. */
  intentEvidence?: string;
}
