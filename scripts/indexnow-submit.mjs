import { Console } from 'node:console';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL, URL } from 'node:url';

const console = new Console(process.stdout, process.stderr);
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITE_URL = 'https://fitwise.stream/';

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

export function buildIndexNowPayload({ report, sitemapXml, key, keyLocation, site = SITE_URL }) {
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    throw new Error('IndexNow key must be 8-128 letters, digits, or hyphens.');
  }
  const siteOrigin = new URL(site).origin;
  const publicKeyUrl = new URL(keyLocation);
  if (publicKeyUrl.origin !== siteOrigin || !publicKeyUrl.pathname.endsWith(`/${key}.txt`)) {
    throw new Error(
      'IndexNow keyLocation must be the public <key>.txt file on the verified site host.',
    );
  }

  const sitemapUrls = new Set(
    [...sitemapXml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => decodeXml(match[1])),
  );
  const changed = [...new Set([...(report.added ?? []), ...(report.materiallyUpdated ?? [])])];
  for (const url of changed) {
    if (new URL(url).origin !== siteOrigin) {
      throw new Error(`Changed URL '${url}' is outside the canonical site host.`);
    }
  }
  const urlList = changed.filter((url) => sitemapUrls.has(url));
  const host = new URL(site).host;
  return {
    endpoint: INDEXNOW_ENDPOINT,
    host,
    key,
    keyLocation: publicKeyUrl.href,
    urlList,
    requestBody: { host, key, keyLocation: publicKeyUrl.href, urlList },
  };
}

export async function submitIndexNowPayload(payload, fetchImpl = globalThis.fetch) {
  if (payload.urlList.length === 0) return { submitted: 0, status: 'no-changed-indexable-urls' };
  const response = await fetchImpl(payload.endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload.requestBody),
  });
  if (![200, 202].includes(response.status)) {
    throw new Error(
      `IndexNow returned HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`,
    );
  }
  return { submitted: payload.urlList.length, status: response.status };
}

function option(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (!['plan', 'submit'].includes(mode)) {
    throw new Error(
      'Usage: node scripts/indexnow-submit.mjs <plan|submit> --diff <report.json> --key-file <key.txt>',
    );
  }
  const reportPath = option(args, '--diff');
  const keyFile = option(args, '--key-file');
  if (!reportPath || !keyFile) throw new Error('Both --diff and --key-file are required.');
  const [reportText, sitemapXml, keyText] = await Promise.all([
    readFile(path.resolve(reportPath), 'utf8'),
    readFile(path.resolve('dist/sitemap.xml'), 'utf8'),
    readFile(path.resolve(keyFile), 'utf8'),
  ]);
  const key = keyText.trim();
  if (path.basename(path.resolve(keyFile)) !== `${key}.txt`) {
    throw new Error('IndexNow key filename must match its contents (<key>.txt).');
  }
  const payload = buildIndexNowPayload({
    report: JSON.parse(reportText),
    sitemapXml,
    key,
    keyLocation: new URL(`${key}.txt`, SITE_URL).href,
  });

  if (mode === 'plan') {
    console.log(
      JSON.stringify({ ...payload, requestBody: undefined, networkCallsMade: false }, null, 2),
    );
    return;
  }
  if (
    process.env.GITHUB_ACTIONS !== 'true' ||
    process.env.INDEXNOW_CONFIRM_SUBMISSION !== 'fitwise.stream'
  ) {
    throw new Error(
      'IndexNow submission is restricted to the authorized GitHub production workflow.',
    );
  }
  console.log(JSON.stringify(await submitIndexNowPayload(payload)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
