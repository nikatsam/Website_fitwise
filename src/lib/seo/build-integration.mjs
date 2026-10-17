import { writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { dataset } from '../../data/index.ts';
import { publishedSpanishRoutes } from '../../i18n/locale.ts';
import { SITE_ORIGIN } from './metadata.ts';
import { buildRobotsTxt, buildSitemapXml, publishedSitemapEntries } from './sitemap.ts';

/** @type {import('astro').AstroIntegration} */
export function seoStaticOutputs() {
  return {
    name: 'fitwise-seo-static-outputs',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const publicationsById = new Map(
          dataset.seoPublications.map((publication) => [publication.pageIntentId, publication]),
        );
        const spanishEntries = [
          { url: new URL('/es/', SITE_ORIGIN).href },
          ...publishedSpanishRoutes(dataset)
            .filter((route) => route.indexable)
            .map((route) => {
              const source = publicationsById.get(route.pageIntentId);
              return {
                url: new URL(route.localizedPath, SITE_ORIGIN).href,
                lastmod: source?.significantlyModifiedOn ?? source?.publishedOn,
              };
            }),
        ];
        const entries = [
          ...publishedSitemapEntries(dataset.pageIntents, dataset.seoPublications),
          ...spanishEntries,
        ];
        await Promise.all([
          writeFile(new URL('sitemap.xml', dir), buildSitemapXml(entries), 'utf8'),
          writeFile(new URL('robots.txt', dir), buildRobotsTxt(), 'utf8'),
        ]);
        logger.info(`Generated sitemap.xml (${entries.length} URLs) and robots.txt.`);
      },
    },
  };
}
