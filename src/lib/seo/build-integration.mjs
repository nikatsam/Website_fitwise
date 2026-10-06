import { writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { dataset } from '../../data/index.ts';
import { buildRobotsTxt, buildSitemapXml, publishedSitemapEntries } from './sitemap.ts';

/** @type {import('astro').AstroIntegration} */
export function seoStaticOutputs() {
  return {
    name: 'fitwise-seo-static-outputs',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const entries = publishedSitemapEntries(dataset.pageIntents, dataset.seoPublications);
        await Promise.all([
          writeFile(new URL('sitemap.xml', dir), buildSitemapXml(entries), 'utf8'),
          writeFile(new URL('robots.txt', dir), buildRobotsTxt(), 'utf8'),
        ]);
        logger.info(`Generated sitemap.xml (${entries.length} URLs) and robots.txt.`);
      },
    },
  };
}
