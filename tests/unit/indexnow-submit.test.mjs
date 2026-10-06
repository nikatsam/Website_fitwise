import { describe, expect, it, vi } from 'vitest';
import { buildIndexNowPayload, submitIndexNowPayload } from '../../scripts/indexnow-submit.mjs';

const key = '40256e983b29eef42f0a6d265551140c';
const keyLocation = `https://fitwise.stream/${key}.txt`;
const sitemapXml = `<?xml version="1.0"?><urlset>
  <url><loc>https://fitwise.stream/</loc></url>
  <url><loc>https://fitwise.stream/workspace/monitor-size-chart/</loc></url>
  <url><loc>https://fitwise.stream/bedroom/us-bed-size-dimensions/</loc></url>
</urlset>`;

describe('IndexNow change notification plan', () => {
  it('submits only changed URLs that remain in the published sitemap', () => {
    const payload = buildIndexNowPayload({
      key,
      keyLocation,
      sitemapXml,
      report: {
        added: ['https://fitwise.stream/new/'],
        materiallyUpdated: ['https://fitwise.stream/workspace/monitor-size-chart/'],
        removed: ['https://fitwise.stream/old/'],
        unchanged: ['https://fitwise.stream/'],
      },
    });
    expect(payload.urlList).toEqual(['https://fitwise.stream/workspace/monitor-size-chart/']);
    expect(payload.requestBody.host).toBe('fitwise.stream');
    expect(payload.keyLocation).toBe(keyLocation);
  });

  it('rejects cross-host URLs and a key location on another host', () => {
    expect(() =>
      buildIndexNowPayload({
        key,
        keyLocation,
        sitemapXml,
        report: { added: ['https://evil.example/page/'] },
      }),
    ).toThrow(/outside the canonical site host/);
    expect(() =>
      buildIndexNowPayload({
        key,
        keyLocation: `https://evil.example/${key}.txt`,
        sitemapXml,
        report: { added: [] },
      }),
    ).toThrow(/keyLocation/);
  });

  it('does not make a network request for an empty change set and accepts IndexNow 202', async () => {
    const empty = buildIndexNowPayload({ key, keyLocation, sitemapXml, report: { added: [] } });
    const fetch = vi.fn().mockResolvedValue({ status: 202, text: async () => '' });
    await expect(submitIndexNowPayload(empty, fetch)).resolves.toEqual({
      submitted: 0,
      status: 'no-changed-indexable-urls',
    });
    expect(fetch).not.toHaveBeenCalled();

    const changed = buildIndexNowPayload({
      key,
      keyLocation,
      sitemapXml,
      report: { materiallyUpdated: ['https://fitwise.stream/bedroom/us-bed-size-dimensions/'] },
    });
    await expect(submitIndexNowPayload(changed, fetch)).resolves.toEqual({
      submitted: 1,
      status: 202,
    });
    expect(JSON.parse(fetch.mock.calls[0][1].body).urlList).toEqual(changed.urlList);
  });
});
