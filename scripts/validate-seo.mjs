import { readFile, readdir } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { Console } from 'node:console';
import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

const root = process.cwd();
const console = new Console(process.stdout, process.stderr);
const dist = path.resolve(process.env.FITWISE_DIST_DIR ?? path.join(root, 'dist'));
const siteOrigin = 'https://fitwise.stream';
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(fullPath) : [fullPath];
    }),
  );
  return files.flat();
}

function routeForFile(filePath) {
  const relative = path.relative(dist, filePath).replaceAll(path.sep, '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
  return `/${relative}`;
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'");
}

function plainText(value) {
  return decodeEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];
}

let files;
try {
  files = (await walk(dist)).filter((file) => file.endsWith('.html'));
} catch {
  console.error('SEO validation requires a fresh dist/. Run npm run build first.');
  process.exit(1);
}

const htmlByRoute = new Map();
const canonicalRoutes = new Map();
const indexableTitles = new Map();
const breadcrumbUrls = [];
const hreflangByRoute = new Map();

for (const file of files) {
  const route = routeForFile(file);
  if (route === '/404.html') continue;
  const html = await readFile(file, 'utf8');
  assert(
    !/(?<![\d.])\d+\.\d{8,}(?!\d)/.test(plainText(html)),
    `${route}: visible text contains a raw floating-point measurement; format it with formatMeasurement().`,
  );
  htmlByRoute.set(route, { file, html });

  const canonicalTags = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)];
  const allAlternateTags = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => ({
      rel: attribute(tag, 'rel'),
      language: attribute(tag, 'hreflang'),
      href: attribute(tag, 'href'),
    }))
    .filter((link) => link.rel === 'alternate');
  const alternateLinks = allAlternateTags.filter((link) => link.language && link.href);
  assert(
    allAlternateTags.length === alternateLinks.length,
    `${route}: every hreflang alternate must have both language and href attributes.`,
  );
  const isNoindex = /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  if (isNoindex) {
    assert(canonicalTags.length === 0, `${route}: noindex page must not emit a canonical.`);
    assert(
      alternateLinks.length === 0,
      `${route}: noindex page must not emit hreflang alternates.`,
    );
    continue;
  }
  if (canonicalTags.length === 0) {
    errors.push(`${route}: non-noindex HTML page must have exactly one self-canonical.`);
    continue;
  }

  assert(
    canonicalTags.length === 1,
    `${route}: expected exactly one canonical; found ${canonicalTags.length}.`,
  );
  const canonical = canonicalTags[0][1];
  let parsedCanonical;
  try {
    parsedCanonical = new URL(canonical);
  } catch {
    errors.push(`${route}: canonical is not an absolute URL: '${canonical}'.`);
    continue;
  }
  assert(
    parsedCanonical.origin === siteOrigin &&
      parsedCanonical.pathname === route &&
      !parsedCanonical.search &&
      !parsedCanonical.hash,
    `${route}: canonical '${canonical}' must be the absolute HTTPS apex self-canonical.`,
  );
  if (canonicalRoutes.has(canonical)) {
    errors.push(
      `${route}: duplicate canonical '${canonical}' also used by ${canonicalRoutes.get(canonical)}.`,
    );
  } else {
    canonicalRoutes.set(canonical, route);
  }

  if (alternateLinks.length > 0) {
    const documentLanguage = html.match(/<html\b[^>]*lang="([^"]+)"/i)?.[1];
    const selfAlternates = alternateLinks.filter((link) => link.href === canonical);
    assert(
      selfAlternates.length === 1 && selfAlternates[0]?.language === documentLanguage,
      `${route}: hreflang set must include one self-reference matching html lang and canonical.`,
    );
    const expectedOgLocale = documentLanguage?.includes('-')
      ? documentLanguage.replace('-', '_')
      : undefined;
    const ogLocale = html.match(
      /<meta\b[^>]*property="og:locale"[^>]*content="([^"]+)"[^>]*>/i,
    )?.[1];
    assert(
      ogLocale === expectedOgLocale,
      `${route}: Open Graph locale must match the regional html lang when hreflang alternates are present.`,
    );
    const ogAlternateLocales = [
      ...html.matchAll(/<meta\b[^>]*property="og:locale:alternate"[^>]*content="([^"]+)"[^>]*>/gi),
    ].map((match) => match[1]);
    const expectedOgAlternateLocales = alternateLinks
      .filter((link) => link.href !== canonical)
      .map((link) => link.language.replace('-', '_'))
      .sort();
    assert(
      ogAlternateLocales.sort().join(',') === expectedOgAlternateLocales.join(','),
      `${route}: Open Graph alternate locales must match hreflang alternates.`,
    );
    const seenLanguages = new Set();
    for (const link of alternateLinks) {
      assert(
        !seenLanguages.has(link.language),
        `${route}: duplicate hreflang language '${link.language}'.`,
      );
      seenLanguages.add(link.language);
      try {
        const alternateUrl = new URL(link.href);
        assert(
          alternateUrl.origin === siteOrigin && !alternateUrl.search && !alternateUrl.hash,
          `${route}: hreflang URL '${link.href}' must be a clean canonical on ${siteOrigin}.`,
        );
      } catch {
        errors.push(`${route}: invalid hreflang URL '${link.href}'.`);
      }
    }
    hreflangByRoute.set(route, { canonical, documentLanguage, alternateLinks });
  }

  const title = plainText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description =
    html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ?? '';
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert(title.length > 0, `${route}: missing title.`);
  assert(description.trim().length > 0, `${route}: missing description.`);
  assert(
    h1s.length === 1 && plainText(h1s[0]?.[1] ?? '').length > 0,
    `${route}: expected exactly one non-empty H1.`,
  );
  const titleKey = title.toLocaleLowerCase();
  if (indexableTitles.has(titleKey)) {
    errors.push(
      `${route}: duplicate title '${title}' also used by ${indexableTitles.get(titleKey)}.`,
    );
  } else {
    indexableTitles.set(titleKey, route);
  }

  const jsonScripts = [
    ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  const structuredData = [];
  for (const match of jsonScripts) {
    assert(!match[1].includes('<'), `${route}: JSON-LD contains an unescaped '<'.`);
    try {
      structuredData.push(JSON.parse(match[1]));
    } catch (error) {
      errors.push(`${route}: invalid JSON-LD: ${error.message}`);
    }
  }

  if (route === '/') {
    assert(
      structuredData.some((item) => item['@type'] === 'WebSite'),
      '/: missing WebSite JSON-LD.',
    );
    continue;
  }

  const breadcrumb = structuredData.find((item) => item['@type'] === 'BreadcrumbList');
  const webPage = structuredData.find((item) => item['@type'] === 'WebPage');
  assert(webPage, `${route}: missing WebPage JSON-LD.`);
  if (webPage) {
    assert(webPage.url === canonical, `${route}: WebPage JSON-LD URL does not match canonical.`);
    assert(webPage.name === title, `${route}: WebPage JSON-LD name does not match title.`);
  }
  assert(breadcrumb, `${route}: missing BreadcrumbList JSON-LD.`);
  if (!breadcrumb) continue;

  const itemList = breadcrumb.itemListElement ?? [];
  assert(itemList.length >= 2, `${route}: breadcrumb must contain Home and current page.`);
  itemList.forEach((item, index) => {
    assert(
      item.position === index + 1,
      `${route}: breadcrumb positions must be contiguous from 1.`,
    );
    assert(
      Boolean(item.name) && Boolean(item.item),
      `${route}: breadcrumb item ${index + 1} needs name and URL.`,
    );
  });
  const visibleNav = html.match(/<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/i)?.[1];
  assert(visibleNav, `${route}: missing visible breadcrumb navigation.`);
  const visibleItems = visibleNav
    ? [...visibleNav.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => ({
        html: item[1],
        label: plainText(item[1]),
        href: item[1].match(/<a\b[^>]*href="([^"]+)"[^>]*>/i)?.[1],
      }))
    : [];
  assert(
    visibleItems.length === itemList.length,
    `${route}: visible and JSON-LD breadcrumb item counts differ.`,
  );
  itemList.forEach((item, index) => {
    assert(
      visibleItems[index]?.label === item.name,
      `${route}: visible breadcrumb ${index + 1} does not match JSON-LD.`,
    );
    const visible = visibleItems[index];
    if (visible?.href) {
      const visibleUrl = new URL(visible.href, `${siteOrigin}${route}`);
      assert(
        visibleUrl.href === item.item,
        `${route}: visible breadcrumb URL does not match JSON-LD at item ${index + 1}.`,
      );
    } else {
      assert(
        /aria-current="page"/.test(visible?.html ?? '') && index === itemList.length - 1,
        `${route}: only the current breadcrumb may be rendered without a link.`,
      );
      assert(
        item.item === canonical,
        `${route}: current breadcrumb must point at the page canonical.`,
      );
    }
    breadcrumbUrls.push({ route, url: item.item });
  });
}

for (const [route, hreflangSet] of hreflangByRoute) {
  for (const alternate of hreflangSet.alternateLinks) {
    if (alternate.href === hreflangSet.canonical) continue;
    let alternateRoute;
    try {
      alternateRoute = new URL(alternate.href).pathname;
    } catch {
      continue;
    }
    const reciprocal = hreflangByRoute.get(alternateRoute);
    assert(
      canonicalRoutes.has(alternate.href),
      `${route}: hreflang target '${alternate.href}' is not a published canonical page.`,
    );
    assert(
      reciprocal?.documentLanguage === alternate.language &&
        reciprocal.alternateLinks.some(
          (link) =>
            link.href === hreflangSet.canonical && link.language === hreflangSet.documentLanguage,
        ),
      `${route}: hreflang target '${alternate.href}' must reciprocate with matching language tags.`,
    );
  }
}

let sitemapUrls = [];
let sitemapXml = '';
try {
  sitemapXml = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
} catch {
  errors.push('dist/sitemap.xml is missing.');
}
if (sitemapXml) {
  const rootMatch = sitemapXml.match(
    /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">([\s\S]*)<\/urlset>\s*$/,
  );
  assert(Boolean(rootMatch), 'sitemap.xml must use the XML declaration and sitemap urlset root.');
  const sitemapBody = rootMatch?.[1] ?? '';
  const urlMatches = [...sitemapBody.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  const urlBlocks = urlMatches.map((match) => match[1]);
  assert(
    sitemapBody.replace(/<url>[\s\S]*?<\/url>/g, '').trim() === '',
    'sitemap.xml contains content outside complete url entries.',
  );
  const entryData = urlBlocks.map((block) => {
    const match = block.match(/^\s*<loc>([^<]*)<\/loc>\s*(?:<lastmod>([^<]*)<\/lastmod>\s*)?$/);
    assert(Boolean(match), 'Each sitemap url must contain only one loc and optional lastmod.');
    const loc = match?.[1] ?? '';
    assert(
      !/&(?!(?:amp|lt|gt|quot|apos);|#\d+;|#x[\da-f]+;)/i.test(loc),
      `Sitemap loc '${loc}' contains an unescaped or invalid XML entity.`,
    );
    return { loc: decodeEntities(loc), lastmod: match?.[2] };
  });
  sitemapUrls = entryData.map(({ loc }) => loc);
  assert(urlBlocks.length === sitemapUrls.length, 'Each sitemap url entry must contain one loc.');
  assert(sitemapUrls.length <= 50_000, 'Sitemap exceeds the 50,000 URL limit.');
  assert(
    Buffer.byteLength(sitemapXml, 'utf8') <= 50 * 1024 * 1024,
    'Sitemap exceeds 50 MB uncompressed.',
  );
  assert(new Set(sitemapUrls).size === sitemapUrls.length, 'Sitemap contains duplicate URLs.');
  for (const { loc, lastmod } of entryData) {
    if (lastmod) {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(lastmod), `Sitemap has invalid lastmod '${lastmod}'.`);
      assert(
        lastmod <= new Date().toISOString().slice(0, 10),
        `Sitemap lastmod '${lastmod}' is in the future.`,
      );
    }
    let url;
    try {
      url = new URL(loc);
    } catch {
      errors.push(`Sitemap loc '${loc}' is not an absolute URL.`);
      continue;
    }
    assert(
      url.origin === siteOrigin && !url.search && !url.hash,
      `Sitemap loc '${loc}' is not a clean apex URL.`,
    );
    assert(
      canonicalRoutes.has(loc),
      `Sitemap loc '${loc}' has no generated indexable self-canonical page.`,
    );
  }
}

for (const { route, url } of breadcrumbUrls) {
  assert(
    sitemapUrls.includes(url),
    `${route}: breadcrumb URL '${url}' is not present in the published sitemap.`,
  );
}

for (const canonical of canonicalRoutes.keys()) {
  assert(
    sitemapUrls.includes(canonical),
    `Indexable canonical '${canonical}' is missing from sitemap.xml.`,
  );
}
for (const [route, { html }] of htmlByRoute) {
  if (/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html)) {
    const expected = `${siteOrigin}${route}`;
    assert(
      !sitemapUrls.includes(expected),
      `Noindex route '${route}' must not appear in sitemap.xml.`,
    );
  }
}

let robots = '';
try {
  robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
} catch {
  errors.push('dist/robots.txt is missing.');
}
if (robots) {
  assert(!/^\s*Disallow:\s*\/\s*$/im.test(robots), 'robots.txt must not block the entire site.');
  assert(
    robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`),
    'robots.txt must point to the generated absolute sitemap URL.',
  );
  assert(!robots.includes('<') && !robots.includes('\u0000'), 'robots.txt must be plain text.');
}

try {
  const redirectFile = JSON.parse(await readFile(path.join(root, 'data/redirects.json'), 'utf8'));
  const redirects = redirectFile.redirects ?? [];
  const sources = new Set(redirects.map((redirect) => redirect.from));
  for (const redirect of redirects) {
    assert(
      redirect.statusCode === 301,
      `Redirect '${redirect.from}' must use permanent status 301.`,
    );
    assert(redirect.from !== redirect.to, `Redirect '${redirect.from}' cannot target itself.`);
    assert(
      !sources.has(redirect.to),
      `Redirect '${redirect.from}' creates a chain or loop through '${redirect.to}'.`,
    );
    assert(
      !htmlByRoute.has(redirect.from),
      `Redirect source '${redirect.from}' must not remain a built HTML route.`,
    );
    assert(
      htmlByRoute.has(redirect.to),
      `Redirect target '${redirect.to}' does not resolve to a built route.`,
    );
    assert(
      !sitemapUrls.includes(`${siteOrigin}${redirect.from}`),
      `Redirect source '${redirect.from}' must not appear in sitemap.`,
    );
  }
} catch (error) {
  errors.push(`Cannot validate data/redirects.json: ${error.message}`);
}

if (errors.length) {
  console.error(`SEO validation failed (${errors.length} issue(s)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  `SEO validation passed: ${sitemapUrls.length} sitemap URLs, ${canonicalRoutes.size} canonical pages.`,
);
