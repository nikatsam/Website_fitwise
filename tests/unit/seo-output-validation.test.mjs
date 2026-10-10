import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const seoValidator = fileURLToPath(new URL('../../scripts/validate-seo.mjs', import.meta.url));
const linkValidator = fileURLToPath(new URL('../../scripts/validate-links.mjs', import.meta.url));
const tempDirs = [];

async function makeBuiltFixture(options = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fitwise-seo-'));
  tempDirs.push(dir);
  await mkdir(path.join(dir, 'published'), { recursive: true });

  const homeLink = options.missingLink
    ? '<a href="/missing/">Missing</a>'
    : '<a href="/published/">Published</a>';
  const home = `<!doctype html><html lang="en"><head><title>Home</title><meta name="description" content="Home page"><link rel="canonical" href="https://fitwise.stream/"><script type="application/ld+json">{"@type":"WebSite"}</script></head><body><h1>Home</h1>${homeLink}<a href="/published/">Published</a></body></html>`;
  const breadcrumbPath = options.brokenBreadcrumb ? '/missing/' : '/published/';
  const breadcrumbName = options.brokenBreadcrumb ? 'Missing' : 'Published';
  const canonical = '<link rel="canonical" href="https://fitwise.stream/published/">';
  const floatText = options.visibleFloatLeak ? '<p>1930.3999999999999 mm</p>' : '';
  const inlineScript = options.scriptFloat
    ? '<script>const dimension = 1930.3999999999999;</script>'
    : '';
  const published = `<!doctype html><html lang="en"><head><title>Published</title><meta name="description" content="Published page">${canonical}${options.duplicateCanonical ? canonical : ''}<script type="application/ld+json">{"@type":"WebPage","url":"https://fitwise.stream/published/","name":"Published"}</script><script type="application/ld+json">{"@type":"BreadcrumbList","itemListElement":[{"position":1,"name":"Home","item":"https://fitwise.stream/"},{"position":2,"name":"${breadcrumbName}","item":"https://fitwise.stream${breadcrumbPath}"}]}</script></head><body><nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><span aria-current="page">${breadcrumbName}</span></li></ol></nav><h1>Published</h1>${floatText}${inlineScript}</body></html>`;
  await writeFile(path.join(dir, 'index.html'), home, 'utf8');
  await writeFile(path.join(dir, 'published', 'index.html'), published, 'utf8');
  if (options.missingSeoSignal) {
    await mkdir(path.join(dir, 'unclassified'), { recursive: true });
    await writeFile(
      path.join(dir, 'unclassified', 'index.html'),
      '<html><head><title>Unclassified</title></head><body><h1>Unclassified</h1></body></html>',
      'utf8',
    );
  }

  const urls = ['https://fitwise.stream/', 'https://fitwise.stream/published/'];
  if (options.draftInSitemap) {
    await mkdir(path.join(dir, 'draft'), { recursive: true });
    await writeFile(
      path.join(dir, 'draft', 'index.html'),
      '<html><head><meta name="robots" content="noindex"></head><body><h1>Draft</h1></body></html>',
      'utf8',
    );
    urls.push('https://fitwise.stream/draft/');
  }

  const sitemap = options.malformedSitemap
    ? '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://fitwise.stream/</urlset>'
    : `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;
  await writeFile(path.join(dir, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(
    path.join(dir, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: https://fitwise.stream/sitemap.xml\n',
    'utf8',
  );
  return dir;
}

function run(script, dist) {
  return spawnSync(process.execPath, [script], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, FITWISE_DIST_DIR: dist },
  });
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('offline built-output SEO validators', () => {
  it('accepts a valid homepage, published page, sitemap, and crawl path', async () => {
    const dir = await makeBuiltFixture();
    expect(run(seoValidator, dir).status).toBe(0);
    expect(run(linkValidator, dir).status).toBe(0);
  });

  it('rejects a draft/noindex route present in the sitemap', async () => {
    const dir = await makeBuiltFixture({ draftInSitemap: true });
    const result = run(seoValidator, dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/noindex/i);
  });

  it('rejects duplicate canonicals and dangling breadcrumb URLs', async () => {
    const duplicateDir = await makeBuiltFixture({ duplicateCanonical: true });
    const duplicateResult = run(seoValidator, duplicateDir);
    expect(duplicateResult.status).not.toBe(0);
    expect(duplicateResult.stderr).toContain('exactly one canonical');

    const crumbDir = await makeBuiltFixture({ brokenBreadcrumb: true });
    const crumbResult = run(seoValidator, crumbDir);
    expect(crumbResult.status).not.toBe(0);
    expect(crumbResult.stderr).toContain('not present in the published sitemap');
  });

  it('rejects public HTML without an indexability signal', async () => {
    const dir = await makeBuiltFixture({ missingSeoSignal: true });
    const result = run(seoValidator, dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/non-noindex HTML page must have exactly one self-canonical/i);
  });

  it('rejects visible floating-point artifacts while ignoring script implementation details', async () => {
    const visibleLeakDir = await makeBuiltFixture({ visibleFloatLeak: true });
    const visibleLeak = run(seoValidator, visibleLeakDir);
    expect(visibleLeak.status).not.toBe(0);
    expect(visibleLeak.stderr).toMatch(/visible text contains a raw floating-point measurement/i);

    const scriptOnlyDir = await makeBuiltFixture({ scriptFloat: true });
    expect(run(seoValidator, scriptOnlyDir).status).toBe(0);
  });

  it('rejects malformed sitemap entries rather than accepting a partial urlset', async () => {
    const dir = await makeBuiltFixture({ malformedSitemap: true });
    const result = run(seoValidator, dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/urlset root|complete url entries|only one loc/i);
  });

  it('rejects a broken internal anchor', async () => {
    const dir = await makeBuiltFixture({ missingLink: true });
    const result = run(linkValidator, dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('does not resolve');
  });
});
