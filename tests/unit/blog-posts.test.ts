import { describe, expect, it } from 'vitest';
import { dataset } from '../../src/data';
import { BLOG_POSTS } from '../../src/data/blog-posts';
import { publishedSitemapEntries } from '../../src/lib/seo/sitemap';

describe('local-review blog pilot', () => {
  it('contains five distinct stories with matching editorial intents and noindex publications', () => {
    expect(BLOG_POSTS).toHaveLength(5);
    expect(new Set(BLOG_POSTS.map((post) => post.route)).size).toBe(5);

    for (const post of BLOG_POSTS) {
      const intent = dataset.pageIntents.find((candidate) => candidate.id === post.pageIntentId);
      const publication = dataset.seoPublications.find(
        (candidate) => candidate.pageIntentId === post.pageIntentId,
      );
      const primaryToolIntent = dataset.pageIntents.find(
        (candidate) => candidate.route === post.primaryToolHref,
      );

      expect(intent?.route).toBe(post.route);
      expect(intent?.family).toBe('editorial');
      expect(intent?.status).toBe('draft');
      expect(publication?.canonicalPath).toBe(post.route);
      expect(publication?.indexable).toBe(false);
      expect(
        dataset.routeDispositions.find((route) => route.pageIntentId === post.pageIntentId),
      )?.toMatchObject({
        disposition: 'draft',
        intentStatus: 'draft',
      });
      expect(primaryToolIntent).toBeDefined();
      expect(post.relatedPageIds).toContain(primaryToolIntent?.id);
      expect(post.sections.length).toBeGreaterThanOrEqual(3);
      expect(post.sections.flatMap((section) => section.paragraphs).join(' ')).toMatch(
        /illustrative composite scenario/i,
      );
    }
  });

  it('records free-media source, creator, license, date and useful alt text for every photo', () => {
    for (const post of BLOG_POSTS) {
      expect(new URL(post.image.sourceUrl).host).toBe('images.pexels.com');
      expect(new URL(post.image.sourcePage).host).toBe('www.pexels.com');
      expect(post.image.license).toBe('Pexels License');
      expect(post.image.licenseUrl).toBe('https://www.pexels.com/license/');
      expect(post.image.creator.trim().length).toBeGreaterThan(1);
      expect(post.image.alt.trim().length).toBeGreaterThan(10);
      expect(post.image.verifiedOn).toBe('2026-10-13');
    }
  });

  it('keeps the blog index and all five review drafts outside the published sitemap', () => {
    const sitemap = publishedSitemapEntries(dataset.pageIntents, dataset.seoPublications);
    const sitemapUrls = new Set(sitemap.map((entry) => entry.url));

    expect(sitemapUrls.has('https://fitwise.stream/blog/')).toBe(false);
    for (const post of BLOG_POSTS) {
      expect(sitemapUrls.has(`https://fitwise.stream${post.route}`)).toBe(false);
    }
  });
});
