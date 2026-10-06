import { SITE_ORIGIN } from './metadata';
import type { PageIntent, SeoPublication } from '../../types';

export interface SitemapEntry {
  url: string;
  lastmod?: string;
}

const MAX_URLS = 50_000;
const MAX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function publishedSitemapEntries(
  pageIntents: PageIntent[],
  publications: SeoPublication[],
): SitemapEntry[] {
  const intentsById = new Map(pageIntents.map((intent) => [intent.id, intent]));
  return [
    { url: `${SITE_ORIGIN}/` },
    ...publications
      .filter(
        (publication) =>
          publication.indexable &&
          intentsById.get(publication.pageIntentId)?.status === 'published',
      )
      .map((publication) => ({
        url: new URL(publication.canonicalPath, SITE_ORIGIN).href,
        lastmod: publication.significantlyModifiedOn ?? publication.publishedOn,
      })),
  ];
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  if (entries.length > MAX_URLS) {
    throw new Error(`Sitemap has ${entries.length} URLs; maximum is ${MAX_URLS}.`);
  }

  const urls = new Set<string>();
  const rows = entries.map(({ url, lastmod }) => {
    const parsed = new URL(url);
    if (
      parsed.origin !== SITE_ORIGIN ||
      parsed.protocol !== 'https:' ||
      parsed.search ||
      parsed.hash ||
      (parsed.pathname !== '/' && !parsed.pathname.endsWith('/'))
    ) {
      throw new Error(`Sitemap URL must be canonical HTTPS on ${SITE_ORIGIN}: '${url}'.`);
    }
    if (urls.has(url)) throw new Error(`Duplicate sitemap URL '${url}'.`);
    urls.add(url);
    if (lastmod && !isIsoDate(lastmod)) {
      throw new Error(`Invalid sitemap lastmod '${lastmod}' for '${url}'.`);
    }
    return `  <url>\n    <loc>${escapeXml(url)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
  if (new TextEncoder().encode(xml).byteLength > MAX_UNCOMPRESSED_BYTES) {
    throw new Error(`Sitemap exceeds ${MAX_UNCOMPRESSED_BYTES} uncompressed bytes.`);
  }
  return xml;
}

export function buildRobotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
