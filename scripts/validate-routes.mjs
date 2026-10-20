import { access, readFile } from 'node:fs/promises';
import { Console } from 'node:console';
import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';
import { LOCALE_META, SUPPORTED_LOCALES, TRANSLATED_LOCALES } from '../src/i18n/locale.ts';

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
  if (heading === undefined) {
    if (h1Text.length !== 1 || !h1Text[0])
      errors.push(`${route}: expected exactly one non-empty H1.`);
  } else if (!h1Text.includes(heading)) {
    errors.push(`${route}: missing expected H1 '${heading}'.`);
  }
  for (const snippet of includes) {
    if (!source.toLowerCase().includes(snippet.toLowerCase()))
      errors.push(`${route}: missing expected static content '${snippet}'.`);
  }
}

function checkUnitUX(route, source) {
  const labels = [...source.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((match) =>
    match[1]
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  const millimetreOnlyLabels = labels.filter((label) => /\(\s*mm\s*\)\s*$/i.test(label));
  const unitChoiceCount = [...source.matchAll(/<input\b[^>]*\bdata-unit-choice\b[^>]*>/gi)].length;
  const entryNoteCount = [...source.matchAll(/id="unit-entry-note"/g)].length;
  const defaultUnitNoteCount = [...source.matchAll(/A number without a unit defaults to mm\./g)]
    .length;

  assert(
    millimetreOnlyLabels.length === 0,
    `${route}: input labels imply mm-only input: ${JSON.stringify(millimetreOnlyLabels)}.`,
  );
  assert(
    unitChoiceCount === 3 &&
      ['metric', 'imperial', 'both'].every((unit) => source.includes(`value="${unit}"`)),
    `${route}: expected Metric/Imperial/Both output selection (choices=${unitChoiceCount}, values=${['metric', 'imperial', 'both'].map((unit) => `${unit}:${source.includes(`value="${unit}"`)}`).join(',')}).`,
  );
  assert(
    entryNoteCount === 1 && defaultUnitNoteCount === 1,
    `${route}: bare-number default must be explained once per calculator.`,
  );
}

function checkPreparationGuidance(route, source) {
  const types = [...source.matchAll(/<li\b[^>]*data-preparation-type="([^"]+)"/gi)].map(
    (match) => match[1],
  );
  assert(
    types.length >= 3,
    `${route}: Before you start needs at least three service-specific items.`,
  );
  assert(
    types.every((type) => ['required', 'optional', 'verification'].includes(type)) &&
      types.includes('required'),
    `${route}: Before you start must distinguish required inputs from optional/verification information.`,
  );
}

function checkCoreCalculatorShell(route, source) {
  const stepCount = [...source.matchAll(/class="calculator-step(?:\s|"?)/g)].length;
  const advancedGroupCount = [...source.matchAll(/data-advanced-options-group/g)].length;
  const resultIndex = source.indexOf('class="fit-summary"');
  const detailIndex = source.indexOf('class="dimension-table__details"');
  const checks = [
    ['data-calculator-shell', 'shared calculator page shell'],
    ['aria-label="Breadcrumb"', 'visible breadcrumb'],
    ['data-shell-section="before-start"', 'Before you start section'],
    ['data-fit-example-notice', 'Example data notice'],
    ['Example data loaded', 'Example data loaded label'],
    ['The values below are illustrative.', 'illustrative sample-data copy'],
    ['Example result — ', 'initial Example result label'],
    ['data-fit-result-scope', 'shared result-origin scope'],
    ['data-core-progressive-form', 'mobile progressive form'],
    ['What this means', 'result interpretation'],
    ['fit-summary__next', 'explicit next action'],
    ['assumption-list', 'assumptions/source list'],
    ['dimension-table__details', 'collapsed calculation details'],
  ];

  for (const [snippet, description] of checks) {
    assert(source.includes(snippet), `${route}: missing newest-shell ${description}.`);
  }
  checkPreparationGuidance(route, source);
  checkUnitUX(route, source);
  assert(stepCount >= 2, `${route}: expected grouped calculator input steps, found ${stepCount}.`);
  assert(
    [...source.matchAll(/data-core-calculator-step/g)].length >= 2,
    `${route}: mobile step groups are not available for progressive navigation.`,
  );
  assert(
    /<details\b[^>]*>\s*<summary\b[^>]*>Advanced options\s*·\s*Optional\b/i.test(source),
    `${route}: advanced controls need the shared Advanced options · Optional disclosure.`,
  );
  assert(
    advancedGroupCount >= 2,
    `${route}: optional controls must be grouped by task, found ${advancedGroupCount} groups.`,
  );
  assert(
    !/<details\b[^>]*\bopen(?:[\s=>])/i.test(source),
    `${route}: optional calculator disclosures must not render open by default.`,
  );
  assert(
    resultIndex >= 0 && detailIndex > resultIndex,
    `${route}: raw dimension details must follow the result summary.`,
  );
  assert(
    !source.includes('More assumptions'),
    `${route}: legacy More assumptions interaction remains present.`,
  );
}

function checkSpecialistCalculatorShell(route, source) {
  const stepCount = [...source.matchAll(/data-calculator-step/g)].length;
  const helpCount = [...source.matchAll(/data-measurement-help=/g)].length;
  const summaryIndex = source.indexOf('class="fit-summary"');
  const detailIndex = source.indexOf('class="dimension-table__details"');
  const checks = [
    ['data-calculator-shell', 'shared calculator page shell'],
    ['data-fit-services', 'Fit Services calculator component'],
    ['data-fit-result-scope', 'shared result-origin state'],
    ['data-before-you-start-items', 'service-specific Before you start guidance'],
    ['data-fit-example-notice', 'shared Example data notice'],
    ['Example data loaded', 'shared Example data loaded label'],
    ['The values below are illustrative.', 'illustrative sample-data copy'],
    ['Example result — ', 'initial Example result label'],
    ['data-fit-sticky', 'persistent result link'],
    ['data-fit-service-preview-svg', 'responsive SVG dimension preview'],
    ['class="fit-service-plan-svg"', 'shared SVG plan implementation'],
    [
      'aria-labelledby="fit-service-plan-svg-title fit-service-plan-svg-description"',
      'accessible SVG title and description',
    ],
    ['fit-service-preview__text', 'collapsed text-plan alternative'],
    ['data-fit-service-preview-ascii', 'preserved text preview'],
    ['What this means', 'plain-language result interpretation'],
    ['fit-summary__next', 'explicit next action'],
  ];

  for (const [snippet, description] of checks) {
    assert(source.includes(snippet), `${route}: missing newest specialist shell ${description}.`);
  }
  checkPreparationGuidance(route, source);
  checkUnitUX(route, source);
  assert(stepCount > 1, `${route}: specialist inputs are still a flat field grid.`);
  assert(helpCount > 0, `${route}: no standard contextual measurement help was rendered.`);
  assert(
    summaryIndex >= 0 && detailIndex > summaryIndex,
    `${route}: calculation details must follow the shared result summary.`,
  );
  assert(
    !source.includes('More assumptions'),
    `${route}: legacy More assumptions interaction remains present.`,
  );
}

function checkGlobalNavigation(route, source, { requireCurrent = true, locale = 'en' } = {}) {
  const header = source.match(/<header\b[\s\S]*?<\/header>/i)?.[0] ?? '';
  void locale;
  const primaryNavs = [...header.matchAll(/<nav\b(?=[^>]*data-global-navigation)[^>]*>/gi)];
  const primaryLabel = primaryNavs[0]?.[0].match(/aria-label="([^"]+)"/)?.[1] ?? '';
  const legacyPrimaryNavs = primaryLabel
    ? [...header.matchAll(/<nav\b[^>]*aria-label="([^"]+)"[^>]*>/gi)].filter(
        (match) => match[1] === primaryLabel,
      )
    : [];
  const fitGroups = [...header.matchAll(/<details\b[^>]*data-nav-group="fit-checks"/gi)];
  const guideGroups = [...header.matchAll(/<details\b[^>]*data-nav-group="guides"/gi)];
  const currentItems = [...header.matchAll(/\baria-current="(?:page|location)"/gi)];

  assert(Boolean(header), `${route}: shared global header is missing.`);
  assert(
    primaryNavs.length === 1 && legacyPrimaryNavs.length === 1,
    `${route}: expected exactly one shared primary navigation component, received ${primaryNavs.length} shared/${legacyPrimaryNavs.length} total.`,
  );
  assert(
    fitGroups.length === 1 && guideGroups.length === 1,
    `${route}: shared navigation has missing/duplicate fit or guide groups (${fitGroups.length}/${guideGroups.length}).`,
  );
  if (requireCurrent) {
    assert(
      currentItems.length > 0,
      `${route}: shared navigation does not identify the current page or section.`,
    );
  }
}

function breadcrumbLabels(source) {
  const nav = source.match(/<nav\b[^>]*data-breadcrumb[^>]*>([\s\S]*?)<\/nav>/i)?.[1];
  if (!nav) return [];
  return [...nav.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((match) =>
    match[1]
      .replace(/<[^>]*>/g, '')
      .replace(/\s+\/\s+/g, ' ')
      .replaceAll('&amp;', '&')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function checkVisibleBreadcrumb(route, source, { requireStructured = true, locale = 'en' } = {}) {
  const breadcrumbNavs = [
    ...source.matchAll(/<nav\b[^>]*data-breadcrumb[^>]*>([\s\S]*?)<\/nav>/gi),
  ];
  const nav = breadcrumbNavs[0]?.[1];
  assert(Boolean(nav), `${route}: non-home page is missing its visible breadcrumb.`);
  assert(breadcrumbNavs.length === 1, `${route}: expected exactly one visible breadcrumb trail.`);
  if (!nav) return;

  const labels = breadcrumbLabels(source);
  const homeHref = locale === 'en' ? '/' : `/${locale}/`;
  const firstHref = nav.match(/<a\b[^>]*href="([^"]+)"/)?.[1];
  assert(
    labels.length >= 2 && firstHref === homeHref && /aria-current="page"/.test(nav),
    `${route}: breadcrumb must start at ${homeHref} and end at the current page (${labels.join(' > ')}).`,
  );
  if (!requireStructured) return;

  const structured = [
    ...source.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ]
    .map((match) => {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    })
    .find((record) => record?.['@type'] === 'BreadcrumbList');
  assert(Boolean(structured), `${route}: visible breadcrumb lacks matching BreadcrumbList data.`);
  if (!structured) return;

  const structuredItems = structured.itemListElement ?? [];
  const structuredLabels = structuredItems.map((item) => item.name);
  const structuredPaths = structuredItems.map((item) => {
    try {
      return new URL(item.item).pathname;
    } catch {
      return null;
    }
  });
  const visiblePaths = [
    ...[...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gi)].map(
      (match) => new URL(match[1], 'https://fitwise.stream').pathname,
    ),
    route.endsWith('/') ? route : `${route}/`,
  ];

  assert(
    JSON.stringify(structuredLabels) === JSON.stringify(labels) &&
      JSON.stringify(structuredPaths) === JSON.stringify(visiblePaths),
    `${route}: visible breadcrumb hierarchy differs from BreadcrumbList structured data.`,
  );
}

function checkBreadcrumbs(route, source, expected) {
  const labels = breadcrumbLabels(source);
  assert(
    JSON.stringify(labels) === JSON.stringify(expected),
    `${route}: expected visible breadcrumb '${expected.join(' > ')}', received '${labels.join(' > ')}'.`,
  );
}

const home = await html('/');
checkPage('/', home, {
  heading: 'Will it fit?',
  includes: [
    '/will-it-fit/',
    '/rug-fit/',
    '/dining/',
    '/garden/',
    '/fit-checks/',
    '/workspace/',
    '/bedroom/',
    '/appliances/',
    '/access/furniture-route-fit/',
    '/tv/tv-stand-fit/',
    '/home-gym/power-rack-room-size/',
    '/storage/what-fits-in-storage/',
    '/game-room/pool-table-fit/',
    '/vehicle/garage-fit/',
    '/about/',
    '/methodology/',
    'Fit checks by task',
    'fit-directory__group',
    'Browse all fit checks and specialist modes',
    'G-J10W58E2ZL',
    'googletagmanager.com/gtag/js',
  ],
});

const universalFit = await html('/will-it-fit/');
checkPage('/will-it-fit/', universalFit, {
  heading: 'Will it fit?',
  includes: [
    'data-universal-fitcheck-form',
    'Example data loaded',
    'The values below are illustrative.',
    'data-fit-sticky',
    'data-diagram-id="universal-fitcheck-diagram"',
    'Top-down footprint visualization',
    'scale-diagram__svg',
    'Height, delivery route and multi-item arrangement are checked in the result table',
    'fit-item-width',
    'fit-door-width',
    'fit-quantity',
    'rel="canonical"',
    'BreadcrumbList',
    'id="unit-entry-note"',
    'Enter lengths with mm, cm, m, in, ft, or ft/in.',
    'ft/in',
    'defaults to mm',
  ],
});
checkCoreCalculatorShell('/will-it-fit/', universalFit);

const rugFit = await html('/rug-fit/');
checkPage('/rug-fit/', rugFit, {
  heading: 'Will the rug fit your room and furniture?',
  includes: [
    'data-rug-fitcheck-form',
    'data-rug-diagram="rug-fitcheck-diagram"',
    'ROOM PLAN | centered dimensional comparison',
    'FURNITURE RELATIONSHIP | full footprint on rug',
    'Check a user-selected front-edge overlap',
    'Extra rug-to-wall border',
    'rectangular comparison',
    'data-fit-sticky',
    'rel="canonical"',
    'BreadcrumbList',
  ],
});
checkCoreCalculatorShell('/rug-fit/', rugFit);

const dining = await html('/dining/');
checkPage('/dining/', dining, {
  heading: 'Will the dining table and chairs fit?',
  includes: [
    'data-dining-fitcheck-form',
    'Example data loaded',
    'The values below are illustrative.',
    'data-fit-sticky',
    'dining-fitcheck-table',
    'Rectangular tables only',
    'user-selected space beyond the pulled-out chair envelope',
    'rel="canonical"',
    'BreadcrumbList',
  ],
});
checkCoreCalculatorShell('/dining/', dining);

const garden = await html('/garden/');
checkPage('/garden/', garden, {
  heading: 'What can fit in your garden space?',
  includes: [
    'data-fit-services-form',
    'garden-structure',
    'garden-patio-dining',
    'garden-shed-storage',
    'garden-greenhouse',
    'garden-hot-tub',
    'garden-outdoor-kitchen',
    'garden-play-equipment',
    'Candidate body sizes',
    'data-candidate-size-row',
    'Add another size',
    'aria-label="Remove candidate 1"',
    'planning permission',
    'rel="canonical"',
    'BreadcrumbList',
  ],
});

checkBreadcrumbs('/garden/shed-interior-storage/', await html('/garden/shed-interior-storage/'), [
  'Home',
  'Garden',
  'Shed storage',
]);
checkBreadcrumbs('/appliances/fridge-fit/', await html('/appliances/fridge-fit/'), [
  'Home',
  'Appliances',
  'Fridge fit',
]);
checkBreadcrumbs(
  '/workspace/what-fits-on-a-140cm-desk/',
  await html('/workspace/what-fits-on-a-140cm-desk/'),
  ['Home', 'Workspace', 'Desk sizing', '140 cm desk'],
);

const fridgeFit = await html('/appliances/fridge-fit/');
checkPage('/appliances/fridge-fit/', fridgeFit, {
  heading: 'Will this fridge fit the opening?',
  includes: [
    'What to check next',
    'exact model manual or manufacturer specification',
    'If the fridge must be carried into the room',
  ],
});
checkSpecialistCalculatorShell('/appliances/fridge-fit/', fridgeFit);
for (const route of [
  '/appliances/washer-fit/',
  '/access/furniture-route-fit/',
  '/tv/tv-stand-fit/',
  '/garden/structure-fit/',
  '/garden/play-equipment-use-zone/',
  '/workspace/monitor-arm-compatibility/',
  '/home-gym/power-rack-room-size/',
  '/storage/what-fits-in-storage/',
  '/game-room/pool-table-fit/',
  '/vehicle/garage-fit/',
]) {
  checkSpecialistCalculatorShell(route, await html(route));
}
const vehicleFit = await html('/vehicle/garage-fit/');
assert(
  !/<nav\b[^>]*aria-label="Related next checks"/.test(vehicleFit),
  '/vehicle/garage-fit/: unrelated related-check navigation should be omitted when no live next check applies.',
);
assert(
  !garden.includes('<textarea id="service-candidateSizes"'),
  '/garden/: semicolon candidate-size text entry must be replaced with structured width/depth rows.',
);

const fitChecks = await html('/fit-checks/');
checkPage('/fit-checks/', fitChecks, {
  heading: 'All fit checks',
  includes: [
    'id="all-fit-checks"',
    'Rooms &amp; spaces',
    'Appliance installation clearance',
    'Vehicle/garage fit',
    '/garden/play-equipment-use-zone/',
    'Advanced all-in-one checker',
    'Browse focused calculators by the item',
    'rel="canonical"',
    'BreadcrumbList',
  ],
});
assert(
  !fitChecks.includes('data-fit-services-form'),
  '/fit-checks/: browse directory must not embed an active all-in-one calculator.',
);

const advancedFitServices = await html('/fit-services/');
checkPage('/fit-services/', advancedFitServices, {
  heading: 'Advanced all-in-one fit checker',
  includes: [
    'id="fit-services-tool"',
    'data-fit-services-form',
    'Example data',
    'The values below are illustrative.',
    'data-fit-sticky',
    'appliance-install',
    'delivery-route',
    'workspace-compatibility',
    'tv-fit',
    'home-gym',
    'storage',
    'pool-room',
    'vehicle-garage',
    'href="/fit-checks/"',
    'rel="canonical"',
  ],
});
assert(
  !advancedFitServices.includes('id="all-fit-checks"'),
  '/fit-services/: advanced checker must not duplicate the full directory.',
);

const aboutAndSources = await html('/about/');
checkPage('/about/', aboutAndSources, {
  heading: 'Dimension-based fit tools, with assumptions made visible',
  includes: [
    'id="data-sources"',
    'id="corrections"',
    'Report a measurement or calculation correction on GitHub',
    '/methodology/reference-conventions/',
    'record confidence',
    'rel="canonical"',
    'BreadcrumbList',
  ],
});

const referenceConventions = await html('/methodology/reference-conventions/');
checkPage('/methodology/reference-conventions/', referenceConventions, {
  heading: 'Measurement and reference conventions',
  includes: [
    'Physical margin',
    'Target margin',
    'Internal reference values',
    'Rounding is for display only',
    'rel="canonical"',
    'BreadcrumbList',
  ],
});

const workspace = await html('/workspace/');
const footerMarkup = workspace.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '';
assert(
  [...footerMarkup.matchAll(/href="\/garden\/"/g)].length === 1,
  'Global footer must link to Garden Fit exactly once.',
);
checkPage('/workspace/', workspace, {
  heading: 'Will your monitors fit your desk?',
  includes: [
    'data-workspace-fitcheck-form',
    'Example data',
    'The values below are illustrative.',
    'data-fit-sticky',
    'Physical margin',
    'Target margin',
    'Tightest point',
    'Physical fit',
    'Selected clearance',
    'Show calculation details',
    'workspace-fitcheck-table',
    'data-fit-state',
    '/workspace/monitor-size-chart/',
  ],
});
checkCoreCalculatorShell('/workspace/', workspace);

const bedroom = await html('/bedroom/');
checkPage('/bedroom/', bedroom, {
  heading: 'Will your bed fit your room?',
  includes: [
    'data-bedroom-fitcheck-form',
    'Example data',
    'The values below are illustrative.',
    'data-fit-sticky',
    'Physical margin',
    'Target margin',
    'Tightest point',
    'Physical fit',
    'Selected clearance',
    'Show calculation details',
    'bedroom-fitcheck-table',
    '/bedroom/us-bed-size-dimensions/',
    '/bedroom/uk-bed-size-dimensions/',
  ],
});
checkCoreCalculatorShell('/bedroom/', bedroom);
assert(
  ['140.0 cm', '20.0 cm', 'Physical margin', 'Extra space beyond target', 'Tightest point'].every(
    (value) => bedroom.includes(value),
  ),
  '/bedroom/: example result must distinguish 140 cm physical margin from 20 cm after the selected clearance target.',
);

const blogIndex = await html('/blog/');
checkPage('/blog/', blogIndex, {
  heading: 'Blog articles are not released',
  includes: ['noindex', 'not included in this production build'],
});

for (const route of [
  '/blog/rug-fit-in-a-room/',
  '/blog/sofa-through-a-doorway/',
  '/blog/two-monitors-one-desk/',
  '/blog/bed-and-wardrobe-clearance/',
  '/blog/fridge-opening-vs-delivery-route/',
]) {
  assert(
    !(await routeExists(route)),
    `${route}: local-only article draft was emitted in the production build.`,
  );
}

const dedicatedPages = [
  {
    route: '/workspace/desk-size-for-two-27-inch-monitors/',
    heading: 'Desk size for two 27-inch monitors',
    includes: ['desk width breakdown', 'desk-two-27in-diagram', '121.6 cm', '129.2 cm'],
  },
  {
    route: '/workspace/120cm-vs-140cm-desk/',
    heading: '120 cm vs 140 cm desk for two 27-inch monitors',
    includes: [
      '121.6 cm',
      '-1.6 cm',
      '+18.4 cm',
      '129.2 cm',
      '-9.2 cm',
      '+10.8 cm',
      'Target margin after selected clearance',
      'data-label="120.0 cm"',
      'data-label="140.0 cm"',
    ],
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
    route: '/workspace/desk-depth-for-monitor/',
    heading: 'Monitor stand depth, viewing distance and desk depth',
    includes: [
      'Samsung Smart Monitor M7',
      '193.5 mm',
      'does not establish a comfortable viewing distance',
    ],
  },
  {
    route: '/workspace/desk-chair-clearance/',
    heading: 'Desk chair clearance: measured footprint and movement zone',
    includes: ['Aeron Size B', '772 mm', 'no universal numeric movement clearance'],
  },
  {
    route: '/bedroom/minimum-room-size-for-king-bed/',
    heading: 'King mattress room-space estimates: US vs UK',
    includes: [
      'US King mattress-only: about 3.15 m (10 ft 4 in) wide',
      'UK Standard King in IKEA MALM Standard King frame: about 2.88 m (9 ft 5 in) wide',
      'not a building-code minimum',
    ],
  },
  {
    route: '/bedroom/minimum-room-size-for-queen-bed/',
    heading: 'US Queen mattress: clear-space planning estimate',
    includes: [
      'US Queen mattress-only: about 2.74 m (9 ft 0 in) wide',
      'Only entries naming a frame include that specific sourced model',
      'FitWise-assumed 24-inch foot allowance',
    ],
  },
  {
    route: '/bedroom/minimum-room-size-for-double-bed/',
    heading: 'US Full vs UK Standard Double: room-space estimates',
    includes: ['US Full', 'UK Standard Double', 'not a building-code minimum'],
  },
  {
    route: '/bedroom/king-vs-queen-room-space/',
    heading: 'US King vs Queen: compare mattress and room-space dimensions',
    includes: [
      'US King mattress-only: recommended clear rectangle about 3.15 m (10 ft 4 in)',
      'US Queen mattress-only: recommended clear rectangle about 2.74 m (9 ft 0 in)',
      'not code minimums',
    ],
  },
  {
    route: '/bedroom/double-vs-queen-room-space/',
    heading: 'US Full (often called Double) vs US Queen: room-space estimates',
    includes: ['US Full', 'US Queen', 'not code minimums'],
  },
  {
    route: '/bedroom/space-between-bed-and-wardrobe/',
    heading: 'US PAX/GRIMO wardrobe door swing: measured fit example',
    includes: ['495 mm', 'not a paired bed/wardrobe room plan', 'not a recommended walking aisle'],
  },
  {
    route: '/bedroom/bed-and-dresser-clearance/',
    heading: 'UK bed-to-dresser clearance: measured drawer-extension example',
    includes: ['294 mm', 'not a standing or walking allowance'],
  },
  {
    route: '/bedroom/king-bed-two-nightstands-room-size/',
    heading: 'US King bed with two bedside tables: footprint example',
    includes: ['2850.4 mm', 'not a room-size recommendation'],
  },
  {
    route: '/bedroom/queen-bed-two-nightstands-room-size/',
    heading: 'US Queen bed with two bedside tables: footprint example',
    includes: ['2444 mm', 'not a room-size recommendation'],
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

const sharedDualMonitorPages = [
  ['/workspace/', workspace],
  [
    '/workspace/desk-size-for-two-27-inch-monitors/',
    await html('/workspace/desk-size-for-two-27-inch-monitors/'),
  ],
  ['/workspace/120cm-vs-140cm-desk/', await html('/workspace/120cm-vs-140cm-desk/')],
  ['/workspace/what-fits-on-a-140cm-desk/', await html('/workspace/what-fits-on-a-140cm-desk/')],
  [
    '/workspace/desk-size-for-dual-monitors/',
    await html('/workspace/desk-size-for-dual-monitors/'),
  ],
];
assert(
  [
    '121.6 cm',
    '129.2 cm',
    'Physical margin',
    'Extra space beyond target',
    '18.4 cm',
    '10.8 cm',
  ].every((value) => workspace.includes(value)),
  '/workspace/: the dual-27 result must distinguish 18.4 cm physical margin from 10.8 cm after the selected target.',
);
for (const [route, source] of sharedDualMonitorPages) {
  assert(
    source.includes('121.6 cm') && source.includes('129.2 cm'),
    `${route}: the dual-27 scenario must show the shared 121.6 cm physical width and 129.2 cm recommended width.`,
  );
}

for (const route of [
  '/bedroom/what-bed-fits-in-10x10-room/',
  '/bedroom/what-bed-fits-in-10x12-room/',
]) {
  const source = await html(route);
  assert(
    !/\b\d+\.\d{8,}\b/.test(source),
    `${route}: rendered dimensions must not expose floating-point artifacts.`,
  );
}

const bedroomMatrix = await html('/bedroom/what-bed-fits-in-10x12-room/');
const matrixPosition = bedroomMatrix.indexOf('data-family-facts-matrix');
const detailPosition = bedroomMatrix.indexOf('class="family-facts__detail"');
assert(
  matrixPosition >= 0 &&
    detailPosition > matrixPosition &&
    bedroomMatrix.includes('Portrait') &&
    bedroomMatrix.includes('Landscape'),
  'The 10x12 bed page must show its orientation/result matrix before collapsed measurement details.',
);

const breadcrumbGuide = await html('/workspace/monitor-size-chart/');
assert(
  breadcrumbGuide.includes('class="page-family__breadcrumb"') &&
    breadcrumbGuide.includes('"@type":"BreadcrumbList"'),
  'Published guide pages must retain both visible breadcrumbs and matching BreadcrumbList JSON-LD.',
);

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
checkGlobalNavigation('/404.html', notFound, { requireCurrent: false });

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
      checkGlobalNavigation(record.route, source, { requireCurrent: !noindex });
      if (record.route !== '/') {
        checkVisibleBreadcrumb(record.route, source, { requireStructured: !noindex });
      }
      if (source.includes('data-fit-services')) {
        checkSpecialistCalculatorShell(record.route, source);
      }
      const canonical = /<link\b[^>]*rel="canonical"[^>]*href="[^"]+"[^>]*>/i.test(source);
      assert(
        noindex || canonical,
        `${record.route}: generated route must be explicitly noindex or have a canonical publication envelope.`,
      );
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

let sitemapXml = '';
try {
  sitemapXml = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
} catch {
  // The sitemap-missing error is reported by the main route checks above.
}

const robotsNoindex = (source) =>
  /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(source);
const UNTRANSLATED_CHROME = [
  'aria-label="Primary"',
  'aria-label="Breadcrumb"',
  'Skip to main content',
  '<summary>Fit checks',
  '<summary>Guides</summary>',
  '<h2>Before you start</h2>',
  '<h3>What this means</h3>',
  '<dt>Physical fit</dt>',
  '<dt>Selected clearance</dt>',
];

for (const locale of TRANSLATED_LOCALES) {
  const prefix = `/${locale}`;
  const meta = LOCALE_META[locale];
  const homePath = `${prefix}/`;
  const localizedHome = await html(homePath);
  checkPage(homePath, localizedHome, {
    includes: [`lang="${meta.hreflang}"`, 'Fitwise.stream'],
  });
  assert(
    localizedHome.includes(`<link rel="canonical" href="https://fitwise.stream${homePath}"`),
    `${homePath}: localized home must self-canonicalize.`,
  );
  checkGlobalNavigation(homePath, localizedHome, { locale });
  const isLocalizedHref = (href) => href === prefix || href.startsWith(`${prefix}/`);

  for (const record of routeDispositions) {
    if (record.intentStatus !== 'published' || record.disposition !== 'generated') continue;
    const englishPath = record.route;
    const localizedPath = `${prefix}${englishPath}`;
    const englishSource = await html(englishPath);
    const localizedSource = await html(localizedPath);
    const localizedNoindex = robotsNoindex(localizedSource);
    const englishNoindex = robotsNoindex(englishSource);
    const documentLanguage = localizedSource.match(/<html\b[^>]*lang="([^"]+)"/i)?.[1] ?? '';
    const localizedCanonical = `https://fitwise.stream${localizedPath}`;
    const englishCanonical = `https://fitwise.stream${englishPath}`;
    const internalHeaderLinks = [
      ...(localizedSource.match(/<header\b[\s\S]*?<\/header>/i)?.[0] ?? '').matchAll(
        /<a\b[^>]*>/gi,
      ),
    ]
      .map(([tag]) => tag)
      .filter((tag) => !/data-language-choice=/.test(tag))
      .map((tag) => tag.match(/\bhref="(\/[^"#]*)/)?.[1])
      .filter((href) => Boolean(href));
    const footer = localizedSource.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '';
    const internalFooterLinks = [...footer.matchAll(/<a\b[^>]*href="(\/[^"#]*)/gi)].map(
      (match) => match[1],
    );
    const untranslatedChrome = UNTRANSLATED_CHROME.filter((snippet) =>
      localizedSource.includes(snippet),
    );

    assert(
      documentLanguage.split('-')[0] === locale,
      `${localizedPath}: document language must be ${meta.hreflang} (received ${documentLanguage}).`,
    );
    assert(
      SUPPORTED_LOCALES.every((code) => localizedSource.includes(`data-language-choice="${code}"`)),
      `${localizedPath}: the language switcher must offer every supported language.`,
    );
    assert(
      internalHeaderLinks.every(isLocalizedHref),
      `${localizedPath}: internal header navigation must stay in ${locale} (${internalHeaderLinks.filter((href) => !isLocalizedHref(href)).join(', ')}).`,
    );
    assert(
      internalFooterLinks.every(isLocalizedHref),
      `${localizedPath}: internal footer navigation must stay in ${locale} (${internalFooterLinks.filter((href) => !isLocalizedHref(href)).join(', ')}).`,
    );
    assert(
      untranslatedChrome.length === 0,
      `${localizedPath}: English shell/calculator text remains: ${untranslatedChrome.join(', ')}.`,
    );
    assert(
      !/<meta\b[^>]*http-equiv="refresh"/i.test(localizedSource) &&
        !/(?:window|location)\.(?:href\s*=|replace\()/i.test(localizedSource),
      `${localizedPath}: language selection must not force a locale redirect.`,
    );

    if (englishNoindex) {
      assert(localizedNoindex, `${localizedPath}: noindex policy must match its English source.`);
      continue;
    }

    assert(
      !localizedNoindex,
      `${localizedPath}: indexable English page must not produce a noindex translation.`,
    );
    assert(
      localizedSource.includes(`<link rel="canonical" href="${localizedCanonical}"`),
      `${localizedPath}: translation must have a self-referential canonical.`,
    );
    assert(
      [
        ...localizedSource.matchAll(
          /<link\b[^>]*rel="alternate"[^>]*hreflang="(en(?:-[A-Z]{2})?)"[^>]*href="([^"]+)"[^>]*>/gi,
        ),
      ].some((match) => match[2] === englishCanonical),
      `${localizedPath}: translation must link back to its English hreflang equivalent.`,
    );
    assert(
      localizedSource.includes(
        `<link rel="alternate" hreflang="${documentLanguage}" href="${localizedCanonical}"`,
      ),
      `${localizedPath}: translation must include its own hreflang URL.`,
    );
    assert(
      localizedSource.includes(
        `<link rel="alternate" hreflang="x-default" href="${englishCanonical}"`,
      ),
      `${localizedPath}: x-default must use the English fallback page.`,
    );
    assert(
      englishSource.includes(`href="${localizedCanonical}"`),
      `${englishPath}: English source page must link to the ${locale} translation.`,
    );
    assert(
      sitemapXml.includes(`<loc>${localizedCanonical}</loc>`),
      `${localizedPath}: indexable translation must be listed in sitemap.xml.`,
    );
    checkGlobalNavigation(localizedPath, localizedSource, {
      locale,
      requireCurrent: !localizedNoindex,
    });
    checkVisibleBreadcrumb(localizedPath, localizedSource, {
      locale,
      requireStructured: !localizedNoindex,
    });
  }

  for (const record of routeDispositions) {
    if (!['draft', 'deferred'].includes(record.disposition)) continue;
    const localizedPath = `${prefix}${record.route}`;
    assert(
      !(await routeExists(localizedPath)),
      `${localizedPath}: draft/deferred English content must not leak into the public ${locale} route set.`,
    );
  }
}

if (errors.length) {
  console.error(`Route smoke tests failed (${errors.length} issue(s)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  `Route smoke tests passed: Home, universal/dining/specialized FitChecks, workspace/bedroom hubs, ${dedicatedPages.length} dedicated pages, 404, sitemap, robots, and ${generatedIntentCount} generated/${deferredIntentCount} deferred/${draftIntentCount} draft PageIntents.`,
);
