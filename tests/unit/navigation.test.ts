import { describe, expect, it } from 'vitest';
import { dataset, featurePages } from '../../src/data';
import {
  ADVANCED_FIT_CHECK_LINK,
  ALL_FIT_CHECKS_LINK,
  FEATURED_FIT_CHECKS,
  FIT_CHECK_GROUPS,
  GUIDE_LINKS,
  UNIVERSAL_FIT_LINK,
  getNavigationCurrent,
} from '../../src/data/navigation';

const allFitCheckLinks = FIT_CHECK_GROUPS.flatMap((group) => [
  ...group.links,
  ...(group.specialistGroups?.flatMap((specialistGroup) => specialistGroup.links) ?? []),
]);

describe('shared site navigation taxonomy', () => {
  it('uses unique, published destinations for all primary and specialist groups', () => {
    const hrefs = allFitCheckLinks.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);

    const publishedPaths = new Set(
      dataset.seoPublications.map((publication) => publication.canonicalPath),
    );
    for (const link of [
      UNIVERSAL_FIT_LINK,
      ALL_FIT_CHECKS_LINK,
      ADVANCED_FIT_CHECK_LINK,
      ...allFitCheckLinks,
      ...GUIDE_LINKS,
    ]) {
      expect(publishedPaths.has(link.href), link.href).toBe(true);
    }
  });

  it('derives featured entry points from destinations in the shared taxonomy', () => {
    const knownDestinations = new Set([
      UNIVERSAL_FIT_LINK.href,
      ALL_FIT_CHECKS_LINK.href,
      ADVANCED_FIT_CHECK_LINK.href,
      ...allFitCheckLinks.map((link) => link.href),
    ]);
    expect(FEATURED_FIT_CHECKS.every((item) => knownDestinations.has(item.href))).toBe(true);
    expect(ALL_FIT_CHECKS_LINK.href).toBe('/fit-checks/');
    expect(ADVANCED_FIT_CHECK_LINK.href).toBe('/fit-services/');
    expect(ALL_FIT_CHECKS_LINK.activeRoutes).toContain(ADVANCED_FIT_CHECK_LINK.href);
  });

  it('marks exact pages and their parent section without promoting unresolved vehicle taxonomy', () => {
    const workspace = FIT_CHECK_GROUPS.find((group) => group.label === 'Rooms & spaces');
    const vehicleGroup = FIT_CHECK_GROUPS.find((group) => group.label === 'More fit checks');
    const workspaceLink = workspace?.links.find((link) => link.href === '/workspace/');
    const monitorArmLink = workspace?.specialistGroups
      ?.flatMap((group) => group.links)
      .find((link) => link.href === '/workspace/monitor-arm-compatibility/');

    expect(workspaceLink).toBeDefined();
    expect(monitorArmLink).toBeDefined();
    expect(getNavigationCurrent('/workspace/', workspaceLink!.href)).toBe('page');
    expect(getNavigationCurrent('/workspace/monitor-arm-compatibility/', workspaceLink!.href)).toBe(
      'location',
    );
    expect(
      getNavigationCurrent('/workspace/monitor-arm-compatibility/', monitorArmLink!.href),
    ).toBe('page');
    expect(getNavigationCurrent('/home-gym/', '/home-gym/power-rack-room-size/')).toBe('location');
    expect(getNavigationCurrent('/access/', '/access/furniture-route-fit/')).toBe('location');
    expect(
      getNavigationCurrent(
        '/fit-services/',
        ALL_FIT_CHECKS_LINK.href,
        ALL_FIT_CHECKS_LINK.activeRoutes,
      ),
    ).toBe('location');
    expect(vehicleGroup?.links.some((link) => link.href === '/vehicle/garage-fit/')).toBe(true);
  });

  it('places one cross-room rug tool in Rooms & spaces and relates existing room tools to it', () => {
    const roomsGroup = FIT_CHECK_GROUPS.find((group) => group.label === 'Rooms & spaces');
    const rugLinks = allFitCheckLinks.filter((link) => link.href === '/rug-fit/');
    const rugFeature = featurePages.find((page) => page.pageIntent.route === '/rug-fit/');
    const bedroom = featurePages.find((page) => page.pageIntent.route === '/bedroom/');
    const dining = featurePages.find((page) => page.pageIntent.route === '/dining/');

    expect(rugLinks).toHaveLength(1);
    expect(roomsGroup?.links.some((link) => link.href === '/rug-fit/')).toBe(true);
    expect(rugFeature?.kind).toBe('tool');
    expect(rugFeature?.toolRenderer).toBe('rug-fit');
    expect(rugFeature?.publication.indexable).toBe(true);
    expect(rugFeature?.publication.canonicalPath).toBe('/rug-fit/');
    expect(rugFeature?.publication.relatedPageIds).toEqual(
      expect.arrayContaining(['pi-feature-bedroom', 'pi-feature-dining']),
    );
    expect(bedroom?.publication.relatedPageIds).toContain('pi-feature-rug-fit');
    expect(dining?.publication.relatedPageIds).toContain('pi-feature-rug-fit');
  });

  it('keeps one-tool hubs out of primary journeys while preserving hub routes and mature chooser pages', () => {
    const thinHubs = [
      { route: '/access/', calculator: '/access/furniture-route-fit/' },
      { route: '/tv/', calculator: '/tv/tv-stand-fit/' },
      { route: '/home-gym/', calculator: '/home-gym/power-rack-room-size/' },
      { route: '/storage/', calculator: '/storage/what-fits-in-storage/' },
      { route: '/game-room/', calculator: '/game-room/pool-table-fit/' },
      { route: '/vehicle/', calculator: '/vehicle/garage-fit/' },
    ];
    const navHrefs = new Set(allFitCheckLinks.map((link) => link.href));

    for (const { route, calculator } of thinHubs) {
      const hub = featurePages.find((page) => page.pageIntent.route === route);
      expect(hub?.kind, route).toBe('hub');
      expect(navHrefs.has(route), route).toBe(false);
      expect(navHrefs.has(calculator), calculator).toBe(true);
      expect(
        dataset.routeDispositions.some((item) => item.route === route),
        route,
      ).toBe(true);
    }

    for (const route of ['/appliances/', '/garden/']) {
      const hub = featurePages.find((page) => page.pageIntent.route === route);
      expect(hub?.pageIntent.family, route).toBe('hub');
      expect(hub?.publication.relatedPageIds.length, route).toBeGreaterThanOrEqual(3);
      expect(hub?.intro.length, route).toBeGreaterThan(40);
      expect(hub?.calculation.length, route).toBeGreaterThan(40);
    }
  });
});
