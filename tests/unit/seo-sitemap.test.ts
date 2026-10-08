import { describe, expect, it } from 'vitest';
import {
  buildRobotsTxt,
  buildSitemapXml,
  publishedSitemapEntries,
} from '../../src/lib/seo/sitemap';
import { pageIntents, seoPublications } from '../fixtures/valid/sample-dataset';
import { dataset as productionDataset } from '../../src/data';

describe('SEO static outputs', () => {
  it('includes only published and indexable envelopes plus the homepage', () => {
    const intents = [
      ...pageIntents,
      {
        ...pageIntents[0]!,
        id: 'pi-draft',
        route: '/workspace/draft/',
        status: 'draft' as const,
      },
    ];
    const childPublication = seoPublications.find(
      (publication) => publication.pageIntentId === 'pi-desk-size-for-two-27in-monitors',
    )!;
    const hubPublication = seoPublications.find(
      (publication) => publication.pageIntentId === 'pi-workspace-hub',
    )!;
    const publications = [
      childPublication,
      {
        ...childPublication,
        pageIntentId: 'pi-draft',
        canonicalPath: '/workspace/draft/',
        indexable: true,
      },
      {
        ...hubPublication,
        indexable: false,
      },
    ];
    const entries = publishedSitemapEntries(intents, publications);
    expect(entries.map((entry) => entry.url)).toEqual([
      'https://fitwise.stream/',
      'https://fitwise.stream/workspace/desk-size-for-two-27-inch-monitors/',
    ]);
    expect(entries[1]?.lastmod).toBe('2026-10-06');
  });

  it('keeps enriched noindex content out while updating lastmod for materially linked references', () => {
    const entries = publishedSitemapEntries(
      productionDataset.pageIntents,
      productionDataset.seoPublications,
    );
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      'https://fitwise.stream/',
      'https://fitwise.stream/workspace/monitor-size-chart/',
      'https://fitwise.stream/bedroom/us-bed-size-dimensions/',
      'https://fitwise.stream/bedroom/uk-bed-size-dimensions/',
    ]);
    expect(urls).not.toContain('https://fitwise.stream/workspace/what-fits-on-a-140cm-desk/');
    expect(urls).not.toContain('https://fitwise.stream/bedroom/minimum-room-size-for-queen-bed/');
    expect(urls).not.toContain('https://fitwise.stream/bedroom/minimum-room-size-for-king-bed/');
    expect(entries.find((entry) => entry.url.endsWith('/us-bed-size-dimensions/'))?.lastmod).toBe(
      '2026-10-08',
    );
    expect(entries.find((entry) => entry.url.endsWith('/monitor-size-chart/'))?.lastmod).toBe(
      '2026-10-08',
    );
    expect(entries.find((entry) => entry.url.endsWith('/uk-bed-size-dimensions/'))?.lastmod).toBe(
      '2026-10-08',
    );
  });

  it('escapes XML values and writes only editorial lastmod values', () => {
    const xml = buildSitemapXml([
      { url: 'https://fitwise.stream/a&b/', lastmod: '2026-10-06' },
      { url: 'https://fitwise.stream/' },
    ]);
    expect(xml).toContain('<loc>https://fitwise.stream/a&amp;b/</loc>');
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
    expect(xml).toContain('<lastmod>2026-10-06</lastmod>');
  });

  it('rejects duplicate, noncanonical, and malformed sitemap entries', () => {
    expect(() =>
      buildSitemapXml([{ url: 'https://fitwise.stream/' }, { url: 'https://fitwise.stream/' }]),
    ).toThrow(/Duplicate sitemap URL/);
    expect(() => buildSitemapXml([{ url: 'http://www.fitwise.stream/' }])).toThrow(
      /canonical HTTPS/,
    );
    expect(() => buildSitemapXml([{ url: 'https://fitwise.stream/?unit=imperial' }])).toThrow(
      /canonical HTTPS/,
    );
    expect(() =>
      buildSitemapXml([{ url: 'https://fitwise.stream/', lastmod: '2026-02-30' }]),
    ).toThrow(/Invalid sitemap lastmod/);
  });

  it('emits permissive robots policy with the absolute sitemap location', () => {
    const robots = buildRobotsTxt();
    expect(robots).toBe('User-agent: *\nAllow: /\n\nSitemap: https://fitwise.stream/sitemap.xml\n');
    expect(robots).not.toContain('Disallow: /');
  });
});
