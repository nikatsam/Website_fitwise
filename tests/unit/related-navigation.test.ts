import { describe, expect, it } from 'vitest';
import { featurePages } from '../../src/data/feature-pages';
import { dataset } from '../../src/data';

const intentsById = new Map(dataset.pageIntents.map((intent) => [intent.id, intent]));

function relatedRoutes(route: string): string[] {
  const page = featurePages.find((item) => item.pageIntent.route === route);
  if (!page) throw new Error(`Missing feature page for ${route}.`);
  return (page.publication.relatedPageIds ?? []).map((id) => {
    const target = intentsById.get(id);
    if (!target) throw new Error(`Missing related target '${id}' from ${route}.`);
    return target.route;
  });
}

describe('feature related-check journeys', () => {
  it('connects fridge fit to its installation opening and delivery-route next tasks', () => {
    const route = '/appliances/fridge-fit/';
    expect(relatedRoutes(route)).toEqual([
      '/appliances/appliance-install-fit/',
      '/access/furniture-route-fit/',
    ]);
    const page = featurePages.find((item) => item.pageIntent.route === route)!;
    expect(Object.keys(page.relatedReasons ?? {})).toEqual(relatedRoutes(route));
    expect(page.relatedReasons?.['/appliances/appliance-install-fit/']).toMatch(
      /cabinet opening.*manual/i,
    );
  });

  it('connects a power rack to delivery and accessory storage without claiming multi-item fit', () => {
    const route = '/home-gym/power-rack-room-size/';
    expect(relatedRoutes(route)).toEqual([
      '/access/furniture-route-fit/',
      '/storage/what-fits-in-storage/',
    ]);
    const page = featurePages.find((item) => item.pageIntent.route === route)!;
    expect(page.relatedReasons?.['/storage/what-fits-in-storage/']).toMatch(
      /separate.*does not combine multiple equipment footprints/i,
    );
  });

  it('connects monitor compatibility to monitor and desk measurements, not TV fit', () => {
    const route = '/workspace/monitor-arm-compatibility/';
    expect(relatedRoutes(route)).toEqual(['/workspace/monitor-size-chart/']);
    expect(relatedRoutes(route)).not.toContain('/tv/tv-stand-fit/');
  });

  it('connects gazebo dining to the room-dining and garden-structure checks', () => {
    const route = '/garden/patio-dining-fit/';
    expect(relatedRoutes(route)).toEqual(['/dining/', '/garden/structure-fit/']);
    const page = featurePages.find((item) => item.pageIntent.route === route)!;
    expect(Object.keys(page.relatedReasons ?? {})).toEqual(relatedRoutes(route));
    expect(page.relatedReasons?.['/dining/']).toMatch(/table.*chairs/i);
    expect(page.relatedReasons?.['/garden/structure-fit/']).toMatch(/footprint.*overhang/i);
  });

  it('does not fabricate next-step checks when no relevant published route exists', () => {
    expect(relatedRoutes('/vehicle/garage-fit/')).toEqual([]);
    expect(relatedRoutes('/tv/tv-stand-fit/')).toEqual([]);
  });
});
