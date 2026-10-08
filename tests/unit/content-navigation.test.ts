import { describe, expect, it } from 'vitest';
import { dataset } from '../../src/data';
import { buildContentNavigationLinks } from '../../src/lib/content/navigation';

describe('curated content navigation', () => {
  it('connects the 140 cm desk matrix to useful workspace references', () => {
    const links = buildContentNavigationLinks(
      'pi-p011-what-fits-140cm-desk',
      dataset.pageIntents,
      dataset.seoPublications,
      dataset.routeDispositions,
    );

    expect(links.map((link) => link.href)).toContain('/workspace/monitor-size-chart/');
    expect(links.map((link) => link.href)).toContain('/workspace/140cm-vs-160cm-desk/');
    expect(links.every((link) => link.label.trim() && link.description.trim())).toBe(true);
  });

  it('keeps US and UK bed references distinct while linking to room-fit answers', () => {
    const kingLinks = buildContentNavigationLinks(
      'pi-p024-room-for-king-bed',
      dataset.pageIntents,
      dataset.seoPublications,
      dataset.routeDispositions,
    );
    const usBedLinks = buildContentNavigationLinks(
      'pi-p039-us-bed-size-dimensions',
      dataset.pageIntents,
      dataset.seoPublications,
      dataset.routeDispositions,
    );

    expect(kingLinks.map((link) => link.href)).toContain('/bedroom/us-bed-size-dimensions/');
    expect(kingLinks.map((link) => link.href)).toContain('/bedroom/uk-bed-size-dimensions/');
    expect(kingLinks.map((link) => link.href)).toContain('/bedroom/what-bed-fits-in-10x10-room/');
    expect(usBedLinks.map((link) => link.href)).toContain('/bedroom/uk-bed-size-dimensions/');
  });

  it('links new source-backed furniture guides only to published built routes', () => {
    const chairLinks = buildContentNavigationLinks(
      'pi-p018-desk-chair-clearance',
      dataset.pageIntents,
      dataset.seoPublications,
      dataset.routeDispositions,
    );
    const dresserLinks = buildContentNavigationLinks(
      'pi-p035-bed-dresser-clearance',
      dataset.pageIntents,
      dataset.seoPublications,
      dataset.routeDispositions,
    );

    expect(chairLinks.map((link) => link.href)).toContain('/workspace/desk-depth-for-monitor/');
    expect(dresserLinks.map((link) => link.href)).toContain(
      '/bedroom/space-between-bed-and-wardrobe/',
    );
    expect(dresserLinks.every((link) => link.description.trim())).toBe(true);
  });
});
