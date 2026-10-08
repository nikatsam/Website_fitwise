import { access, readFile } from 'node:fs/promises';
import { Console } from 'node:console';
import path from 'node:path';
import process from 'node:process';

const console = new Console(process.stdout, process.stderr);
const dist = path.resolve(process.env.FITWISE_DIST_DIR ?? path.join(process.cwd(), 'dist'));
const errors = [];
const routeDispositions = JSON.parse(
  await readFile(path.join(process.cwd(), 'src/data/route-dispositions.json'), 'utf8'),
);

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function fileForRoute(route) {
  return path.join(dist, route === '/' ? 'index.html' : `${route.slice(1)}index.html`);
}

async function routeExists(route) {
  try {
    await access(fileForRoute(route));
    return true;
  } catch {
    return false;
  }
}

async function html(route) {
  const relative = route === '/' ? 'index.html' : `${route.slice(1)}index.html`;
  try {
    return await readFile(path.join(dist, relative), 'utf8');
  } catch {
    errors.push(`${route}: expected generated route '${relative}' is missing.`);
    return '';
  }
}

function checkPage(route, source, { heading, includes = [] }) {
  if (!source) return;
  const h1Text = [...source.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) =>
    match[1]
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  if (!h1Text.includes(heading)) errors.push(`${route}: missing expected H1 '${heading}'.`);
  for (const snippet of includes) {
    if (!source.toLowerCase().includes(snippet.toLowerCase()))
      errors.push(`${route}: missing expected static content '${snippet}'.`);
  }
}

const home = await html('/');
checkPage('/', home, {
  heading: 'Will it fit?',
  includes: [
    '/workspace/',
    '/bedroom/',
    '/methodology/',
    'G-J10W58E2ZL',
    'googletagmanager.com/gtag/js',
  ],
});

const workspace = await html('/workspace/');
checkPage('/workspace/', workspace, {
  heading: 'Will your monitors fit your desk?',
  includes: [
    'data-workspace-fitcheck-form',
    'workspace-fitcheck-table',
    'data-fit-state',
    '/workspace/monitor-size-chart/',
  ],
});

const bedroom = await html('/bedroom/');
checkPage('/bedroom/', bedroom, {
  heading: 'Will your bed fit your room?',
  includes: [
    'data-bedroom-fitcheck-form',
    'bedroom-fitcheck-table',
    '/bedroom/us-bed-size-dimensions/',
    '/bedroom/uk-bed-size-dimensions/',
  ],
});

const dedicatedPages = [
  {
    route: '/workspace/desk-size-for-two-27-inch-monitors/',
    heading: 'Desk size for two 27-inch monitors',
    includes: ['desk width breakdown', 'desk-two-27in-diagram'],
  },
  {
    route: '/workspace/monitor-size-chart/',
    heading: 'monitor physical size chart',
    includes: ['screen width', 'screen height'],
  },
  {
    route: '/bedroom/us-bed-size-dimensions/',
    heading: 'US bed sizes',
    includes: ['US Full mattress', 'mattress width', 'mattress length'],
  },
  {
    route: '/bedroom/uk-bed-size-dimensions/',
    heading: 'UK bed sizes',
    includes: ['UK Standard Double mattress', 'UK Standard King mattress'],
  },
  {
    route: '/workspace/desk-size-for-dual-monitors/',
    heading: 'Desk size for dual monitors',
    includes: ['Configuration width', 'Recommended desk width', 'Sources and evidence'],
  },
  {
    route: '/workspace/what-fits-on-a-120cm-desk/',
    heading: 'What fits on 120cm desk',
    includes: ['Maximum count by hard width only', 'Screen-only approximation'],
  },
  {
    route: '/workspace/what-fits-on-a-140cm-desk/',
    heading: 'What fits on a 140 cm desk? Monitor layout estimates',
    includes: [
      'One 34-inch 21:9 ultrawide',
      'Two 32-inch 16:9 monitors',
      'derived screen-panel estimate',
    ],
  },
  {
    route: '/bedroom/minimum-room-size-for-king-bed/',
    heading: 'King mattress room-space estimates: US vs UK',
    includes: [
      'US King: about 3.15 m (10 ft 4 in) wide',
      'UK Standard King: about 2.72 m (8 ft 11 in) wide',
      'not a building-code minimum',
    ],
  },
  {
    route: '/bedroom/minimum-room-size-for-queen-bed/',
    heading: 'US Queen mattress: clear-space planning estimate',
    includes: ['US Queen: about 2.74 m (9 ft) wide', 'excludes unmeasured frame overhang'],
  },
  {
    route: '/bedroom/king-vs-queen-room-space/',
    heading: 'US King vs Queen: compare mattress and room-space dimensions',
    includes: [
      'US King: recommended clear rectangle about 3.15 m (10 ft 4 in)',
      'US Queen: recommended clear rectangle about 2.74 m (9 ft)',
      'not code minimums',
    ],
  },
  {
    route: '/bedroom/what-bed-fits-in-10x10-room/',
    heading: 'What bed fits in 10x10 room',
    includes: ['US King mattress', 'Fit result', 'mattress footprint'],
  },
  {
    route: '/bedroom/clearance-around-bed/',
    heading: 'Clearance around bed',
    includes: ['Recommended clearance', 'not building-code'],
  },
];
for (const page of dedicatedPages) {
  checkPage(page.route, await html(page.route), page);
}

let notFound = '';
try {
  notFound = await readFile(path.join(dist, '404.html'), 'utf8');
} catch {
  errors.push('404.html: missing generated not-found page.');
}
checkPage('/404.html', notFound, {
  heading: 'Page not found',
  includes: ['Return to the homepage'],
});

for (const file of ['sitemap.xml', 'robots.txt']) {
  try {
    await readFile(path.join(dist, file), 'utf8');
  } catch {
    errors.push(`${file}: expected build output is missing.`);
  }
}

let generatedIntentCount = 0;
let deferredIntentCount = 0;
let draftIntentCount = 0;
const dispositionIds = new Set();
const dispositionPaths = new Set();
for (const record of routeDispositions) {
  assert(
    !dispositionIds.has(record.pageIntentId),
    `Duplicate route disposition '${record.pageIntentId}'.`,
  );
  assert(!dispositionPaths.has(record.route), `Duplicate PageIntent route '${record.route}'.`);
  dispositionIds.add(record.pageIntentId);
  dispositionPaths.add(record.route);
  const exists = await routeExists(record.route);
  if (record.disposition === 'generated') {
    generatedIntentCount += 1;
    assert(
      exists,
      `${record.route}: generated PageIntent '${record.pageIntentId}' has no built HTML route.`,
    );
    if (exists) {
      const source = await readFile(fileForRoute(record.route), 'utf8');
      const noindex = /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(source);
      const canonical = /<link\b[^>]*rel="canonical"[^>]*href="[^"]+"[^>]*>/i.test(source);
      assert(
        noindex || canonical,
        `${record.route}: generated route must be explicitly noindex or have a canonical publication envelope.`,
      );
      if (record.renderer === 'static') {
        assert(
          noindex,
          `${record.route}: hand-authored route without an SEO publication envelope must remain noindex.`,
        );
      }
    }
  } else if (record.disposition === 'deferred') {
    deferredIntentCount += 1;
    assert(
      !exists,
      `${record.route}: deferred PageIntent '${record.pageIntentId}' became a public route.`,
    );
  } else if (record.disposition === 'draft') {
    draftIntentCount += 1;
    assert(
      !exists,
      `${record.route}: draft PageIntent '${record.pageIntentId}' became a public route.`,
    );
  }
}

if (errors.length) {
  console.error(`Route smoke tests failed (${errors.length} issue(s)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  `Route smoke tests passed: Home, workspace/bedroom hubs, ${dedicatedPages.length} dedicated pages, 404, sitemap, robots, and ${generatedIntentCount} generated/${deferredIntentCount} deferred/${draftIntentCount} draft PageIntents.`,
);
