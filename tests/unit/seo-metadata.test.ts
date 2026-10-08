import { describe, expect, it } from 'vitest';
import {
  buildPublicationBreadcrumbs,
  absoluteCanonical,
  serializeJsonLd,
} from '../../src/lib/seo/metadata';
import { buildBreadcrumb } from '../../src/lib/content';
import { validateDataset } from '../../src/lib/validation/dataset';
import {
  pageIntents,
  routeDispositions,
  seoPublications,
  sources,
  displayEntities,
  deskEntities,
} from '../fixtures/valid/sample-dataset';

const dataset = {
  sources,
  entities: [...displayEntities, ...deskEntities],
  clearanceRules: [],
  relationships: [],
  pageIntents,
  routeDispositions: [...routeDispositions],
  seoPublications,
};

describe('SEO publication metadata', () => {
  it('normalizes canonical paths to the HTTPS apex and trailing slash', () => {
    expect(absoluteCanonical('/workspace/example')).toBe(
      'https://fitwise.stream/workspace/example/',
    );
    expect(absoluteCanonical('/')).toBe('https://fitwise.stream/');
  });

  it('builds the visible breadcrumb labels and paths from the publication hierarchy', () => {
    const childIntent = pageIntents.find(
      (intent) => intent.id === 'pi-desk-size-for-two-27in-monitors',
    )!;
    const childPublication = seoPublications.find(
      (publication) => publication.pageIntentId === childIntent.id,
    )!;
    expect(
      buildPublicationBreadcrumbs(childIntent, childPublication, pageIntents, seoPublications),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Workspace fit guides', href: '/workspace/' },
      { label: 'Desk size for two 27-inch monitors', href: childIntent.route },
    ]);
  });

  it('shows a useful cluster breadcrumb on noindex content without creating indexable schema', () => {
    expect(buildBreadcrumb('/bedroom/minimum-room-size-for-queen-bed/', 'bedroom')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Bedroom', href: '/bedroom/' },
      {
        label: 'Minimum Room Size For Queen Bed',
        href: '/bedroom/minimum-room-size-for-queen-bed/',
      },
    ]);
  });

  it('safely escapes script-breaking characters while preserving valid JSON', () => {
    const serialized = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized).name).toBe('</script><script>alert(1)</script>');
  });

  it('rejects duplicate titles and canonical paths', () => {
    const result = validateDataset({
      ...dataset,
      seoPublications: [
        ...seoPublications,
        {
          ...seoPublications[0]!,
          pageIntentId: 'pi-desk-size-for-two-27in-monitors',
        },
      ],
    });
    expect(result.errors.some((issue) => issue.rule === 'duplicate-seo-title')).toBe(true);
    expect(result.errors.some((issue) => issue.rule === 'duplicate-seo-canonical')).toBe(true);
  });

  it('rejects indexable metadata for draft intents and missing/non-indexable breadcrumb parents', () => {
    const result = validateDataset({
      ...dataset,
      pageIntents: pageIntents.map((intent) =>
        intent.id === 'pi-desk-size-for-two-27in-monitors'
          ? { ...intent, status: 'draft' as const }
          : intent,
      ),
      seoPublications: seoPublications.map((publication) =>
        publication.pageIntentId === 'pi-desk-size-for-two-27in-monitors'
          ? { ...publication, breadcrumbIds: ['pi-missing-parent'] }
          : publication,
      ),
    });
    expect(result.errors.some((issue) => issue.rule === 'invalid-seo-publication')).toBe(true);
    expect(result.errors.some((issue) => issue.rule === 'invalid-breadcrumb-reference')).toBe(true);
  });
});
