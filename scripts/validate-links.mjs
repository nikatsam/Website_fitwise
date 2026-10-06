import { readFile, readdir } from 'node:fs/promises';
import { Console } from 'node:console';
import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

const root = process.cwd();
const console = new Console(process.stdout, process.stderr);
const dist = path.resolve(process.env.FITWISE_DIST_DIR ?? path.join(root, 'dist'));
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
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'");
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

let files;
try {
  files = (await walk(dist)).filter((file) => file.endsWith('.html') && !file.endsWith('404.html'));
} catch {
  console.error('Link validation requires a fresh dist/. Run npm run build first.');
  process.exit(1);
}

const pages = new Map();
for (const file of files) {
  const html = await readFile(file, 'utf8');
  const route = routeForFile(file);
  pages.set(route, html);
}

const adjacency = new Map([...pages.keys()].map((route) => [route, new Set()]));
for (const [route, html] of pages) {
  const links = [...html.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi)];
  for (const match of links) {
    const rawHref = decodeEntities(match[1] ?? match[2] ?? match[3] ?? '').trim();
    if (!rawHref || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(rawHref)) continue;

    let target;
    try {
      target = new URL(rawHref, `https://fitwise.stream${route}`);
    } catch {
      errors.push(`${route}: invalid internal href '${rawHref}'.`);
      continue;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(target.pathname);
    } catch {
      errors.push(`${route}: invalid percent encoding in href '${rawHref}'.`);
      continue;
    }

    let targetRoute;
    if (pathname.endsWith('/')) {
      targetRoute = pathname;
    } else if (/\.[a-z\d]{1,8}$/i.test(pathname)) {
      const assetPath = path.join(dist, pathname.slice(1));
      try {
        await readFile(assetPath);
      } catch {
        errors.push(`${route}: internal href '${rawHref}' does not resolve to '${assetPath}'.`);
      }
      continue;
    } else {
      targetRoute = `${pathname}/`;
    }

    if (!pages.has(targetRoute)) {
      errors.push(
        `${route}: internal href '${rawHref}' does not resolve to a generated HTML route.`,
      );
      continue;
    }
    adjacency.get(route).add(targetRoute);

    if (target.hash) {
      const id = decodeURIComponent(target.hash.slice(1));
      const targetHtml = pages.get(targetRoute);
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const hasAnchor = new RegExp(`(?:\\bid|\\bname)="${escapedId}"`).test(targetHtml);
      assert(
        hasAnchor,
        `${route}: fragment href '${rawHref}' target #${id} does not exist in ${targetRoute}.`,
      );
    }
  }
}

let sitemapUrls = [];
try {
  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  sitemapUrls = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => match[1]);
} catch {
  errors.push('dist/sitemap.xml is missing; run npm run build first.');
}

const reached = new Set();
const queue = ['/'];
while (queue.length) {
  const route = queue.shift();
  if (reached.has(route)) continue;
  reached.add(route);
  for (const next of adjacency.get(route) ?? []) {
    if (!reached.has(next)) queue.push(next);
  }
}

for (const url of sitemapUrls) {
  let route;
  try {
    route = new URL(url).pathname;
  } catch {
    errors.push(`Sitemap URL '${url}' is invalid.`);
    continue;
  }
  assert(pages.has(route), `Sitemap route '${route}' does not resolve to a built page.`);
  assert(reached.has(route), `Indexable route '${route}' is orphaned from Home navigation.`);
}

if (errors.length) {
  console.error(`Internal-link validation failed (${errors.length} issue(s)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  `Internal-link validation passed: ${pages.size} HTML routes and ${sitemapUrls.length} indexable URLs.`,
);
