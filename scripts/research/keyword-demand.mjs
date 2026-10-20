// Open-data demand enrichment (no logins): Google Trends (5y, US) + Google/Bing/YouTube autocomplete breadth.
// Usage: node scripts/research/keyword-demand.mjs data/research/keyword-demand-YYYY-MM-DD.json
import { Console } from 'node:console';
import { writeFile } from 'node:fs/promises';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const console = new Console(process.stdout, process.stderr);
const fetch = globalThis.fetch;
const OUT = process.argv[2];
const ANCHOR = 'what size ceiling fan';
// [tool, Trends head phrase, autocomplete seed (intent-specific)]
const TOOLS = [
  ['Ceiling fan size (LIVE)', ANCHOR, 'what size ceiling fan'],
  ['Christmas tree size (LIVE)', 'what size christmas tree', 'what size christmas tree'],
  ['TV mount height', 'how high to mount tv', 'how high to mount tv'],
  ['Art size above bed/sofa', 'art above bed', 'what size art above'],
  ['Bar stool height', 'bar stool height', 'bar stool height for'],
  ['Sectional size', 'what size sectional', 'what size sectional for'],
  ['Coffee table size', 'what size coffee table', 'what size coffee table for'],
  ['Curtain rod & length', 'curtain length', 'curtain length for'],
  ['Dartboard setup', 'dart board height', 'dart board height'],
  ['Standing desk height', 'standing desk height', 'standing desk height for'],
  ['Kitchen island size', 'kitchen island size', 'kitchen island size'],
  ['Mirror above vanity', 'mirror over vanity', 'mirror size for'],
  ['Picture hanging height', 'how high to hang pictures', 'how high to hang'],
  ['Pendant height/spacing', 'pendant light height', 'pendant light height over'],
  ['Treadmill ceiling height', 'treadmill height', 'treadmill ceiling height'],
  ['Ping pong room size', 'ping pong table dimensions', 'ping pong table room size'],
  ['Nightstand height', 'nightstand height', 'nightstand height'],
  ['Mattress in car', 'mattress in car', 'will a mattress fit in'],
  ['Chandelier size', 'chandelier size', 'chandelier size for'],
  ['Tent size for guests', 'tent size for wedding', 'tent size for'],
  ['Walk-in closet size', 'walk in closet size', 'walk in closet size'],
  ['AC size for room', 'what size air conditioner', 'what size air conditioner for'],
  ['Toilet clearance', 'toilet clearance', 'toilet clearance'],
  ['Bunk/loft bed ceiling', 'bunk bed ceiling height', 'bunk bed ceiling height'],
  ['Piano room size', 'piano room size', 'piano room size'],
  ['Moving truck size', 'what size moving truck', 'what size moving truck'],
];
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
let cookie = '';

async function getJson(url, trends = false) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, ...(trends ? { Cookie: cookie } : {}) },
    });
    if (trends) {
      const set = res.headers.get('set-cookie');
      if (set) cookie = set.split(';')[0];
    }
    if (res.status === 429) {
      await delay(20000 * (attempt + 1));
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${url.slice(0, 100)}`);
    return JSON.parse(trends ? text.slice(text.indexOf('{')) : text);
  }
  throw new Error('rate limited');
}

// ---- Google Trends, 5 years weekly, anchored ----
function stats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const keep = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.95))); // drop top 5% weeks
  const trimmed = keep.reduce((s, v) => s + v, 0) / keep.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return { trimmed, median, mean, max: sorted.at(-1) };
}

async function trendsBatch(keywords) {
  const req = {
    comparisonItem: keywords.map((keyword) => ({ keyword, geo: 'US', time: 'today 5-y' })),
    category: 0,
    property: '',
  };
  const explore = await getJson(
    `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify(req))}`,
    true,
  );
  const widget = explore.widgets.find((w) => w.id === 'TIMESERIES');
  await delay(2500);
  const data = await getJson(
    `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify(widget.request))}&token=${widget.token}`,
    true,
  );
  const points = data.default.timelineData;
  return keywords.map((_, i) => {
    const values = points.map((p) => p.value[i]);
    const byMonth = Array(12).fill(0);
    points.forEach((p) => {
      byMonth[new Date(Number(p.time) * 1000).getUTCMonth()] += p.value[i];
    });
    return { ...stats(values), byMonth, last52: values.slice(-52) };
  });
}

// ---- Autocomplete breadth: seed + " " + a..z (+ seed alone) ----
const LETTERS = ' abcdefghijklmnopqrstuvwxyz'.split('');
async function breadth(seed, source) {
  const set = new Set();
  for (const letter of LETTERS) {
    const q = letter === ' ' ? seed : `${seed} ${letter}`;
    const url =
      source === 'google'
        ? `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=${encodeURIComponent(q)}`
        : source === 'youtube'
          ? `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=en&gl=us&q=${encodeURIComponent(q)}`
          : `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(q)}&mkt=en-US`;
    try {
      const data = await getJson(url);
      for (const s of data[1] ?? []) {
        const words = seed.split(' ').slice(0, 2).join(' ');
        if (s.toLowerCase().includes(words.toLowerCase())) set.add(s.toLowerCase());
      }
    } catch {
      // A failed suggestion request only lowers the breadth count; keep going.
    }
    await delay(120);
  }
  return [...set];
}

const results = TOOLS.map(([tool, trend, seed]) => ({ tool, trend, seed }));

// Trends (anchor + 4 per batch)
await getJson('https://trends.google.com/trends/?geo=US', true).catch(() => {});
const others = results.filter((r) => r.trend !== ANCHOR);
for (let i = 0; i < others.length; i += 4) {
  const chunk = others.slice(i, i + 4);
  const out = await trendsBatch([ANCHOR, ...chunk.map((r) => r.trend)]);
  const anchor = out[0];
  if (i === 0) {
    const a = results.find((r) => r.trend === ANCHOR);
    Object.assign(a, {
      rel: 1,
      relMedian: 1,
      spike: anchor.max / Math.max(anchor.trimmed, 0.01),
      byMonth: anchor.byMonth,
    });
  }
  chunk.forEach((r, j) => {
    const s = out[j + 1];
    r.rel = anchor.trimmed > 0 ? s.trimmed / anchor.trimmed : null;
    r.relMedian = anchor.median > 0 ? s.median / anchor.median : null;
    r.spike = s.trimmed > 0 ? s.max / s.trimmed : null;
    r.byMonth = s.byMonth;
    r.anchorScale = anchor.trimmed;
  });
  console.error(`trends batch ${i / 4 + 1} anchor trimmed ${anchor.trimmed.toFixed(1)}`);
  await delay(8000);
}

// Autocomplete breadth
for (const r of results) {
  r.google = await breadth(r.seed, 'google');
  r.bing = await breadth(r.seed, 'bing');
  r.youtube = await breadth(r.seed, 'youtube');
  r.union = new Set([...r.google, ...r.bing]).size;
  console.error(
    `${r.tool}: google ${r.google.length} bing ${r.bing.length} yt ${r.youtube.length}`,
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (const r of results) {
  if (!r.byMonth) continue;
  const total = r.byMonth.reduce((a, b) => a + b, 0) || 1;
  const top = r.byMonth
    .map((v, i) => [v, i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, 2);
  r.peakMonths = top.map(([, i]) => MONTHS[i]).join('/');
  r.seasonality = Math.max(...r.byMonth) / (total / 12);
}
await writeFile(
  OUT,
  JSON.stringify({ fetched: new Date().toISOString(), anchor: ANCHOR, results }, null, 2),
);
console.log('tool | trendsRel | medianRel | spike | peak | season | google | bing | union | yt');
for (const r of [...results].sort((a, b) => (b.rel ?? 0) - (a.rel ?? 0))) {
  console.log(
    [
      r.tool,
      r.rel?.toFixed(2),
      r.relMedian?.toFixed(2),
      r.spike?.toFixed(1),
      r.peakMonths,
      r.seasonality?.toFixed(2),
      r.google.length,
      r.bing.length,
      r.union,
      r.youtube.length,
    ].join(' | '),
  );
}
