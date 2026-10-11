export interface NavigationLink {
  href: string;
  label: string;
}

export interface NavigationGroup {
  label: string;
  links: NavigationLink[];
}

export const UNIVERSAL_FIT_LINK: NavigationLink = {
  href: '/will-it-fit/',
  label: 'Universal fit',
};

export const ALL_FIT_CHECKS_LINK: NavigationLink = {
  href: '/fit-services/',
  label: 'All fit checks',
};

export const FIT_CHECK_GROUPS: NavigationGroup[] = [
  {
    label: 'Rooms & spaces',
    links: [
      { href: '/workspace/', label: 'Workspace' },
      { href: '/bedroom/', label: 'Bedroom' },
      { href: '/dining/', label: 'Dining' },
    ],
  },
  {
    label: 'Outdoor',
    links: [{ href: '/garden/', label: 'Garden' }],
  },
  {
    label: 'Install & mount',
    links: [
      { href: '/appliances/', label: 'Appliances' },
      { href: '/tv/tv-stand-fit/', label: 'TV stand and mount' },
      { href: '/home-gym/power-rack-room-size/', label: 'Power rack' },
    ],
  },
  {
    label: 'Move & store',
    links: [
      { href: '/access/furniture-route-fit/', label: 'Furniture delivery route' },
      { href: '/storage/what-fits-in-storage/', label: 'Storage capacity' },
    ],
  },
  {
    label: 'More fit checks',
    links: [
      { href: '/game-room/pool-table-fit/', label: 'Pool table fit' },
      { href: '/vehicle/garage-fit/', label: 'Vehicle/garage fit' },
    ],
  },
];

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
  { href: '/workspace/', kicker: 'Objects → Surface', title: 'Monitors and workspace layouts' },
  { href: '/bedroom/', kicker: 'Objects → Room', title: 'Bed, bedside tables and clearance' },
  { href: '/dining/', kicker: 'Objects → Room', title: 'Dining table, chairs and circulation' },
  {
    href: '/garden/',
    kicker: 'Structure → Garden',
    title: 'Sheds, greenhouses and garden layouts',
  },
  {
    href: ALL_FIT_CHECKS_LINK.href,
    kicker: 'Browse by task',
    title: ALL_FIT_CHECKS_LINK.label,
  },
];

export const SPECIALIST_FIT_GROUPS: NavigationGroup[] = [
  {
    label: 'Appliance installation',
    links: [
      { href: '/appliances/appliance-install-fit/', label: 'Appliance installation clearance' },
      { href: '/appliances/fridge-fit/', label: 'Fridge fit' },
      { href: '/appliances/washer-fit/', label: 'Washer fit' },
    ],
  },
  {
    label: 'Access and mounting',
    links: [
      { href: '/access/furniture-route-fit/', label: 'Furniture delivery route' },
      { href: '/workspace/monitor-arm-compatibility/', label: 'Monitor-arm compatibility' },
      { href: '/tv/tv-stand-fit/', label: 'TV stand and wall fit' },
    ],
  },
  {
    label: 'Equipment and storage',
    links: [
      { href: '/home-gym/power-rack-room-size/', label: 'Power rack room size' },
      { href: '/storage/what-fits-in-storage/', label: 'Storage capacity' },
    ],
  },
  {
    label: 'Game room and vehicle',
    links: [
      { href: '/game-room/pool-table-fit/', label: 'Pool table and cue clearance' },
      { href: '/vehicle/garage-fit/', label: 'Vehicle in a garage' },
    ],
  },
  {
    label: 'Garden projects',
    links: [
      { href: '/garden/structure-fit/', label: 'Garden structures' },
      { href: '/garden/patio-dining-fit/', label: 'Patio dining' },
      { href: '/garden/shed-interior-storage/', label: 'Shed storage' },
      { href: '/garden/greenhouse-layout/', label: 'Greenhouse layout' },
      { href: '/garden/hot-tub-fit/', label: 'Hot-tub service and cover space' },
      { href: '/garden/outdoor-kitchen-fit/', label: 'Outdoor-kitchen work and service zones' },
      { href: '/garden/play-equipment-use-zone/', label: 'Play-equipment use zone' },
    ],
  },
];
