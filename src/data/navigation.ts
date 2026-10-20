export interface NavigationLink {
  href: string;
  label: string;
  activeRoutes?: string[];
}

export interface NavigationGroup {
  label: string;
  links: NavigationLink[];
  specialistGroups?: NavigationGroup[];
}

const fitCheckLinks = {
  universal: { href: '/will-it-fit/', label: 'Universal fit' },
  all: { href: '/fit-checks/', label: 'All fit checks', activeRoutes: ['/fit-services/'] },
  advanced: { href: '/fit-services/', label: 'Advanced all-in-one checker' },
  workspace: { href: '/workspace/', label: 'Workspace' },
  bedroom: { href: '/bedroom/', label: 'Bedroom' },
  dining: { href: '/dining/', label: 'Dining' },
  rugFit: { href: '/rug-fit/', label: 'Rug + furniture fit' },
  ceilingFan: { href: '/ceiling-fan-size/', label: 'Ceiling fan size' },
  christmasTree: { href: '/christmas-tree-size/', label: 'Christmas tree size' },
  garden: { href: '/garden/', label: 'Garden' },
  appliances: { href: '/appliances/', label: 'Appliances' },
  tv: { href: '/tv/tv-stand-fit/', label: 'TV stand and mount' },
  powerRack: { href: '/home-gym/power-rack-room-size/', label: 'Power rack' },
  deliveryRoute: { href: '/access/furniture-route-fit/', label: 'Furniture delivery route' },
  storage: { href: '/storage/what-fits-in-storage/', label: 'Storage capacity' },
  poolTable: { href: '/game-room/pool-table-fit/', label: 'Pool table fit' },
  vehicleGarage: { href: '/vehicle/garage-fit/', label: 'Vehicle/garage fit' },
  applianceInstallation: {
    href: '/appliances/appliance-install-fit/',
    label: 'Appliance installation clearance',
  },
  fridge: { href: '/appliances/fridge-fit/', label: 'Fridge fit' },
  washer: { href: '/appliances/washer-fit/', label: 'Washer fit' },
  monitorArm: { href: '/workspace/monitor-arm-compatibility/', label: 'Monitor-arm compatibility' },
  gardenStructure: { href: '/garden/structure-fit/', label: 'Garden structures' },
  patioDining: { href: '/garden/patio-dining-fit/', label: 'Patio dining' },
  shedStorage: { href: '/garden/shed-interior-storage/', label: 'Shed storage' },
  greenhouse: { href: '/garden/greenhouse-layout/', label: 'Greenhouse layout' },
  hotTub: { href: '/garden/hot-tub-fit/', label: 'Hot-tub service and cover space' },
  outdoorKitchen: {
    href: '/garden/outdoor-kitchen-fit/',
    label: 'Outdoor-kitchen work and service zones',
  },
  playEquipment: { href: '/garden/play-equipment-use-zone/', label: 'Play-equipment use zone' },
} satisfies Record<string, NavigationLink>;

export const UNIVERSAL_FIT_LINK = fitCheckLinks.universal;
export const ALL_FIT_CHECKS_LINK = fitCheckLinks.all;
export const ADVANCED_FIT_CHECK_LINK = fitCheckLinks.advanced;

export const FIT_CHECK_GROUPS: NavigationGroup[] = [
  {
    label: 'Rooms & spaces',
    links: [
      fitCheckLinks.workspace,
      fitCheckLinks.bedroom,
      fitCheckLinks.dining,
      fitCheckLinks.rugFit,
      fitCheckLinks.ceilingFan,
      fitCheckLinks.christmasTree,
    ],
    specialistGroups: [{ label: 'Workspace tools', links: [fitCheckLinks.monitorArm] }],
  },
  {
    label: 'Outdoor',
    links: [fitCheckLinks.garden],
    specialistGroups: [
      {
        label: 'Garden projects',
        links: [
          fitCheckLinks.gardenStructure,
          fitCheckLinks.patioDining,
          fitCheckLinks.shedStorage,
          fitCheckLinks.greenhouse,
          fitCheckLinks.hotTub,
          fitCheckLinks.outdoorKitchen,
          fitCheckLinks.playEquipment,
        ],
      },
    ],
  },
  {
    label: 'Install & mount',
    links: [fitCheckLinks.appliances, fitCheckLinks.tv, fitCheckLinks.powerRack],
    specialistGroups: [
      {
        label: 'Appliance installation',
        links: [fitCheckLinks.applianceInstallation, fitCheckLinks.fridge, fitCheckLinks.washer],
      },
    ],
  },
  {
    label: 'Move & store',
    links: [fitCheckLinks.deliveryRoute, fitCheckLinks.storage],
  },
  {
    label: 'More fit checks',
    links: [fitCheckLinks.poolTable, fitCheckLinks.vehicleGarage],
  },
];

export function getNavigationCurrent(
  currentPath: string,
  href: string,
  activeRoutes: readonly string[] = [],
): 'page' | 'location' | undefined {
  if (activeRoutes.includes(currentPath)) return 'location';
  if (currentPath === href) return 'page';
  if (href !== '/' && href.endsWith('/') && currentPath.startsWith(href)) return 'location';
  if (currentPath !== '/' && currentPath.endsWith('/') && href.startsWith(currentPath)) {
    return 'location';
  }
  return undefined;
}

export const GUIDE_LINKS: NavigationLink[] = [
  { href: '/workspace/desk-size-guide/', label: 'Desk sizing' },
  { href: '/workspace/what-fits-on-a-140cm-desk/', label: 'What fits on a 140 cm desk' },
  { href: '/workspace/monitor-size-chart/', label: 'Monitor size chart' },
  { href: '/bedroom/what-size-bed-fits-my-room/', label: 'Bed and room sizing' },
  { href: '/bedroom/what-bed-fits-in-10x10-room/', label: 'Bed fit in a 10 × 10 room' },
  { href: '/methodology/reference-conventions/', label: 'Measurement conventions' },
];

export const FEATURED_FIT_CHECKS = [
  {
    href: UNIVERSAL_FIT_LINK.href,
    kicker: 'Object → Space',
    title: 'Universal fit check',
  },
  {
    href: fitCheckLinks.workspace.href,
    kicker: 'Objects → Surface',
    title: 'Monitors and workspace layouts',
  },
  {
    href: fitCheckLinks.bedroom.href,
    kicker: 'Objects → Room',
    title: 'Bed, bedside tables and clearance',
  },
  {
    href: fitCheckLinks.dining.href,
    kicker: 'Objects → Room',
    title: 'Dining table, chairs and circulation',
  },
  {
    href: fitCheckLinks.garden.href,
    kicker: 'Structure → Garden',
    title: 'Sheds, greenhouses and garden layouts',
  },
  {
    href: ALL_FIT_CHECKS_LINK.href,
    kicker: 'Browse by task',
    title: ALL_FIT_CHECKS_LINK.label,
  },
];
