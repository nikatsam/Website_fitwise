import { createHash } from 'node:crypto';
import { Console } from 'node:console';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

const root = process.cwd();
const console = new Console(process.stdout, process.stderr);
const dist = path.join(root, 'dist');
const recordBaseline = process.argv.includes('--record');
const baselinePath = path.join(root, '.seo', 'manifest.json');

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

let sitemap;
try {
  sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
} catch {
  console.error('SEO diff requires a fresh dist/. Run npm run build first.');
  process.exit(1);
}

const current = {};
for (const match of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const url = decodeEntities(match[1].match(/<loc>([\s\S]*?)<\/loc>/)?.[1] ?? '');
  const parsed = new URL(url);
  const route = parsed.pathname;
  const relative = route === '/' ? 'index.html' : `${route.slice(1)}index.html`;
  const html = await readFile(path.join(dist, relative), 'utf8');
  current[url] = {
    lastmod: match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
    contentHash: createHash('sha256').update(html).digest('hex'),
  };
}

let previous = {};
try {
  previous = JSON.parse(await readFile(baselinePath, 'utf8')).pages ?? {};
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.error(`Cannot read baseline manifest ${baselinePath}: ${error.message}`);
    process.exit(1);
  }
}

const report = { added: [], materiallyUpdated: [], removed: [], unchanged: [] };
for (const [url, metadata] of Object.entries(current)) {
  if (!previous[url]) report.added.push(url);
  else if (
    previous[url].contentHash !== metadata.contentHash ||
    previous[url].lastmod !== metadata.lastmod
  ) {
    report.materiallyUpdated.push(url);
  } else report.unchanged.push(url);
}
for (const url of Object.keys(previous)) {
  if (!current[url]) report.removed.push(url);
}

console.log(JSON.stringify(report, null, 2));
if (recordBaseline) {
  await mkdir(path.dirname(baselinePath), { recursive: true });
  await writeFile(baselinePath, `${JSON.stringify({ pages: current }, null, 2)}\n`, 'utf8');
  console.log(`Recorded local SEO baseline at ${path.relative(root, baselinePath)}.`);
}
