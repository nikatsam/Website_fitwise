import type { PageIntent, SeoPublication } from '../types';
import type { FitServiceCategory, FitServiceMode } from '../lib/geometry';
import { sources } from './sources';

export type FeaturePageKind = 'direct' | 'hub' | 'tool';

export interface FeaturePageRecord {
  pageIntent: PageIntent;
  publication: SeoPublication;
  kind: FeaturePageKind;
  mode?: FitServiceMode;
  modeCategory?: FitServiceCategory;
  intro: string;
  calculation: string;
  limitations: string[];
}

interface FeaturePageInput {
  id: string;
  route: string;
  family: PageIntent['family'];
  cluster: PageIntent['cluster'];
  query: string;
  title: string;
  description: string;
  h1: string;
  kind: FeaturePageKind;
  intro: string;
  calculation: string;
  limitations: string[];
  mode?: FitServiceMode;
  modeCategory?: FitServiceCategory;
  breadcrumbIds?: string[];
  relatedPageIds?: string[];
  sourceIds?: string[];
  modifiedOn?: string;
}

const RELEASE_DATE = '2026-10-10';

function definePage(input: FeaturePageInput): FeaturePageRecord {
  const pageIntent: PageIntent = {
    id: input.id,
    route: input.route,
    family: input.family,
    cluster: input.cluster,
    primaryQuery: input.query,
    entityIds: [],
    status: 'published',
    justification:
      'Owner-directed feature release on 2026-10-10. The page has a unique server-rendered calculator mode, worked sample, formula/assumption copy and explicit limitations; query demand remains owner-unverified.',
  };
  const publication: SeoPublication = {
    pageIntentId: input.id,
    indexable: true,
    title: input.title,
    description: input.description,
    h1: input.h1,
    canonicalPath: input.route,
    publishedOn: RELEASE_DATE,
    ...(input.modifiedOn ? { significantlyModifiedOn: input.modifiedOn } : {}),
    breadcrumbIds: input.breadcrumbIds ?? [],
    relatedPageIds: input.relatedPageIds ?? [],
    market: 'global',
    language: 'en',
    sourceIds: input.sourceIds ?? ['src-fitwise-internal-convention'],
    intentEvidence:
      "Published at the site owner's explicit direction to index the complete feature set. Search Console query data is unavailable; the page provides a distinct user-input calculation, assumptions and limitations rather than a product specification claim.",
  };
  return {
    pageIntent,
    publication,
    kind: input.kind,
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.modeCategory ? { modeCategory: input.modeCategory } : {}),
    intro: input.intro,
    calculation: input.calculation,
    limitations: input.limitations,
  };
}

const fitServicesId = 'pi-feature-fit-services-hub';
const gardenId = 'pi-feature-garden-hub';
const appliancesId = 'pi-feature-appliances-hub';
const accessId = 'pi-feature-access-hub';
const workspaceId = 'pi-feature-workspace-hub';
const tvId = 'pi-feature-tv-hub';
const gymId = 'pi-feature-home-gym-hub';
const storageId = 'pi-feature-storage-hub';
const gameRoomId = 'pi-feature-game-room-hub';
const vehicleId = 'pi-feature-vehicle-hub';

export const featurePages: FeaturePageRecord[] = [
  definePage({
    id: fitServicesId,
    route: '/fit-services/',
    family: 'hub',
    cluster: 'other',
    query: 'fit calculators for appliances routes and equipment',
    title: 'Fit Services: Appliance, Route and Equipment Calculators — Fitwise.stream',
    description:
      'Choose a dimension-based fit service for appliances, delivery routes, workspace compatibility, TVs, gym equipment, storage, pools or vehicles.',
    h1: 'Specialized fit checks',
    kind: 'direct',
    intro:
      'Start with a measured relationship between an object, an opening, a surface or a room. Every result separates hard dimensions from user-selected or manual-sourced targets.',
    calculation:
      'Select a tool, enter the exact dimensions from the item and destination, then review hard footprint, selected targets, available space and the tightest constraint.',
    limitations: [
      'The tools use user-entered dimensions rather than a product catalog.',
      'Installation and safety values must come from the exact current product manual.',
      "No search-demand dataset is connected; dedicated pages are released at the owner's request and remain subject to future SERP review.",
    ],
    relatedPageIds: [
      'pi-feature-will-it-fit',
      workspaceId,
      'pi-feature-bedroom',
      'pi-feature-dining',
      gardenId,
      appliancesId,
      accessId,
      tvId,
      gymId,
      storageId,
      gameRoomId,
      vehicleId,
    ],
    sourceIds: ['src-fitwise-internal-convention'],
  }),
  definePage({
    id: gardenId,
    route: '/garden/',
    family: 'hub',
    cluster: 'other',
    query: 'what fits in my garden space',
    title: 'Garden Fit: Structures, Patio Layouts and Storage — Fitwise.stream',
    description:
      'Check sheds, gazebos, patio dining, greenhouses, hot tubs and outdoor layouts against usable garden dimensions.',
    h1: 'What can fit in your garden space?',
    kind: 'direct',
    intro:
      'Use actual plot and clear interior measurements. Garden Fit distinguishes a structure footprint from roof overhang, maintenance space, access paths and user-entered activity zones.',
    calculation:
      'Choose a garden relationship, enter the plot or clear post-to-post span, then compare the physical envelope with your selected maintenance or access targets.',
    limitations: [
      'Advertised roof dimensions are not assumed to equal post-to-post usable space.',
      'Planning permission, foundations, drainage, wind loading, utilities and safety are not evaluated.',
      'Play-equipment use zones must be copied from the exact manufacturer instructions.',
    ],
    relatedPageIds: [
      'pi-feature-garden-structure',
      'pi-feature-garden-patio-dining',
      'pi-feature-garden-shed-storage',
      'pi-feature-garden-greenhouse',
      'pi-feature-garden-hot-tub',
      'pi-feature-garden-outdoor-kitchen',
      'pi-feature-garden-play',
    ],
    sourceIds: ['src-fitwise-internal-convention'],
  }),
  definePage({
    id: 'pi-feature-will-it-fit',
    route: '/will-it-fit/',
    family: 'hub',
    cluster: 'other',
    query: 'will it fit in my room or through my door',
    title: 'Will It Fit? Room and Access Calculator — Fitwise.stream',
    description:
      'Compare a measured item with a room, doorway and corridor using metric or imperial units.',
    h1: 'Will it fit?',
    kind: 'direct',
    intro:
      'Use item outside dimensions, including packaging when checking delivery. The calculator checks an axis-aligned room footprint, upright openings and a corridor width.',
    calculation:
      'The room check compares both rectangular floor orientations and height. The route check uses an upright narrow face and height; it does not infer a safe movement path.',
    limitations: [
      'The route model does not simulate turning, tilt, stairs, handles, thresholds or packaging bulges.',
      'A result is a screening calculation, not a delivery guarantee or accessibility determination.',
    ],
    relatedPageIds: [fitServicesId, 'pi-feature-dining'],
  }),
  definePage({
    id: 'pi-feature-dining',
    route: '/dining/',
    family: 'hub',
    cluster: 'dining',
    query: 'will a dining table and chairs fit in my room',
    title: 'Dining Room Fit Calculator: Table, Chairs and Space — Fitwise.stream',
    description:
      'Compare a rectangular dining table and measured chair envelopes with a room and user-selected circulation target.',
    h1: 'Will the dining table and chairs fit?',
    kind: 'direct',
    intro:
      'Enter the table and chair outside dimensions. The calculation separates the table/chair footprint from extra walking space you choose.',
    calculation:
      'Both axis-aligned table orientations are checked. Seat width along each edge is checked against the corresponding table edge; chair envelopes are added outside occupied sides.',
    limitations: [
      'This version models rectangular tables and equal rectangular chair envelopes.',
      'It does not evaluate comfortable seating per person, place settings, round/oval geometry, accessibility or building-code aisle widths.',
    ],
    relatedPageIds: ['pi-feature-garden-patio-dining', 'pi-feature-fit-services-hub'],
  }),
  definePage({
    id: workspaceId,
    route: '/workspace/',
    family: 'hub',
    cluster: 'workspace',
    query: 'will my monitors fit on my desk',
    title: 'Workspace Fit: Monitors, Desks and Clearances — Fitwise.stream',
    description:
      'Check monitor configurations against desk width and depth with sourced dimensions and explicit user-selected cable and working zones.',
    h1: 'Will your monitors fit your desk?',
    kind: 'direct',
    intro:
      'Compare screen or exact device widths with a measured desk, then check stand depth and the cable/keyboard zones you enter.',
    calculation:
      'The shared configuration check adds monitor outside/screen widths and measured gaps. Physical width margin and margin after side targets are shown separately.',
    limitations: [
      'Screen-only derived widths are rounded to the nearest millimetre and exclude bezels/stands.',
      'Viewing distance and ergonomic suitability are not inferred.',
    ],
    relatedPageIds: [
      'pi-p001-desk-size-guide',
      'pi-p011-what-fits-140cm-desk',
      'pi-p019-monitor-size-chart',
      'pi-feature-workspace-compatibility',
      'pi-p013-120-vs-140cm-desk',
    ],
    sourceIds: [
      'src-ikea-lagkapten-desk',
      'src-samsung-m7-32in',
      'src-fitwise-internal-convention',
    ],
  }),
  definePage({
    id: 'pi-feature-bedroom',
    route: '/bedroom/',
    family: 'hub',
    cluster: 'bedroom',
    query: 'what bed fits my room',
    title: 'Bedroom Fit: Bed, Furniture and Clearances — Fitwise.stream',
    description:
      'Check custom mattress or sourced bed dimensions against a measured room with explicit bedside, door and drawer envelopes.',
    h1: 'Will your bed fit your room?',
    kind: 'direct',
    intro:
      'Start with a measured bed and room. Custom dimensions are available globally; market/model presets are identified as examples.',
    calculation:
      'Physical mattress/frame footprint is separated from user-selected side/foot targets and enabled furniture collision checks.',
    limitations: [
      'Frame overhang and product dimensions vary by model.',
      'The clearance targets are planning assumptions, not universal minima or local code requirements.',
    ],
    relatedPageIds: ['pi-p039-us-bed-size-dimensions', 'pi-p040-uk-bed-size-dimensions'],
    sourceIds: [
      'src-sleep-foundation-us-mattress-sizes',
      'src-ikea-uk-malm-double',
      'src-ikea-uk-malm-king',
      'src-sleep-foundation-bedroom-clearance',
    ],
  }),
  definePage({
    id: 'pi-feature-about',
    route: '/about/',
    family: 'hub',
    cluster: 'other',
    query: 'about Fitwise sources and corrections',
    title: 'About Fitwise: Data, Sources and Corrections — Fitwise.stream',
    description:
      'Learn how Fitwise handles sourced dimensions, calculations, assumptions and correction reports.',
    h1: 'Dimension-based fit tools, with assumptions made visible',
    kind: 'direct',
    intro:
      'Fitwise helps people compare measured objects with rooms, work surfaces and openings before they buy, arrange or move items.',
    calculation:
      'Product facts, derived geometry and user-selected assumptions are distinguished in the tools and source registry.',
    limitations: [
      'Fitwise is a publisher name; no individual author or corporate identity is asserted on this page.',
      'Corrections are accepted through the public GitHub issue template; no response-time promise is made.',
    ],
    relatedPageIds: ['pi-feature-methodology', 'pi-feature-reference-conventions'],
    sourceIds: sources.map((source) => source.id),
  }),
  definePage({
    id: 'pi-feature-methodology',
    route: '/methodology/',
    family: 'hub',
    cluster: 'other',
    query: 'Fitwise calculation methodology',
    title: 'How Fitwise Calculates Space and Fit — Fitwise.stream',
    description:
      'Read how Fitwise normalizes dimensions, distinguishes hard fit from targets, and labels model limitations.',
    h1: 'Methodology',
    kind: 'direct',
    intro:
      'Fitwise normalizes dimensions to millimetres and keeps measured product data, geometric calculations and user-selected assumptions separate.',
    calculation:
      'A hard dimension is compared with available space. An optional target adds a separate comparison; its margin is not the same as physical margin.',
    limitations: [
      'Calculations do not replace manuals, professional judgment, building-code review, accessibility review or safety assessment.',
    ],
    relatedPageIds: ['pi-feature-reference-conventions', 'pi-feature-fit-services-hub'],
    sourceIds: ['src-fitwise-internal-convention'],
  }),
  definePage({
    id: 'pi-feature-reference-conventions',
    route: '/methodology/reference-conventions/',
    family: 'hub',
    cluster: 'other',
    query: 'Fitwise measurement and reference conventions',
    title: 'Measurement and Reference Conventions — Fitwise.stream',
    description:
      'Definitions for sourced, nominal, typical, derived and user-selected Fitwise measurements.',
    h1: 'Measurement and reference conventions',
    kind: 'direct',
    intro:
      'This reference explains how to interpret source status, internal reference sizes, display rounding and the difference between physical margin and target margin.',
    calculation:
      'Millimetres are the internal calculation unit; public dimensions use the canonical measurement formatter.',
    limitations: [
      'Internal round-number references are modeling choices, not laws, product specifications or universal ergonomic minima.',
    ],
    relatedPageIds: ['pi-feature-methodology', 'pi-feature-about'],
    sourceIds: ['src-fitwise-internal-convention'],
  }),

  // Category hubs provide crawler-visible and user-visible navigation to each tool.
  definePage({
    id: appliancesId,
    route: '/appliances/',
    family: 'hub',
    cluster: 'appliances',
    query: 'appliance opening and installation fit',
    title: 'Appliance Fit: Fridges, Washers and Installation Space — Fitwise.stream',
    description:
      'Check a measured appliance against an opening and enter installation clearances from the exact model manual.',
    h1: 'Appliance Fit',
    kind: 'hub',
    intro:
      'Appliance dimensions alone do not determine installation fit. Use outside dimensions, clear opening dimensions and the current manual for ventilation, hose, plug and service allowances.',
    calculation:
      'The shared tool compares the physical item with the available opening, then shows the manual/user-entered installation envelope separately.',
    limitations: [
      'No manufacturer model catalog or generic ventilation minimum is provided.',
      'Delivery access is checked separately from cabinet installation.',
    ],
    breadcrumbIds: [fitServicesId],
    relatedPageIds: [
      'pi-feature-appliance-install',
      'pi-feature-fridge-fit',
      'pi-feature-washer-fit',
    ],
  }),
  definePage({
    id: accessId,
    route: '/access/',
    family: 'hub',
    cluster: 'other',
    query: 'furniture delivery route fit calculator',
    title: 'Access Fit: Furniture Doors, Halls and Turns — Fitwise.stream',
    description:
      'Check measured item dimensions against door, corridor, stair and landing bottlenecks.',
    h1: 'Access and delivery-route fit',
    kind: 'hub',
    intro:
      'Measure clear openings and the narrowest route segments. The tool reports bottleneck dimensions rather than guessing whether an item can be tilted or maneuvered.',
    calculation:
      'Upright openings use the narrow face and item height. A turn uses a conservative diagonal envelope and may reject paths a moving crew can negotiate.',
    limitations: [
      'This is not a 3D motion solver and does not simulate tilt, lifting, stairs or handling technique.',
    ],
    breadcrumbIds: [fitServicesId],
    relatedPageIds: ['pi-feature-furniture-route'],
  }),
  definePage({
    id: 'pi-feature-tv-hub',
    route: '/tv/',
    family: 'hub',
    cluster: 'living',
    query: 'TV stand and wall fit',
    title: 'TV Fit: Stand, Console and Wall-Mount Checks — Fitwise.stream',
    description:
      'Use actual TV dimensions, stand/console dimensions, VESA pattern and mount rating to screen fit.',
    h1: 'TV stand and wall fit',
    kind: 'hub',
    intro:
      'Advertised screen diagonal is not the same as the TV outside width and height. Enter exact model/manual values for the setup you will use.',
    calculation:
      'Stand mode compares outside footprints with a console. Wall mode checks the wall/alcove envelope plus exact VESA and rated-load compatibility.',
    limitations: [
      'No model database, wall structure or fastener suitability is inferred.',
      'Soundbar placement is checked as a separate surface footprint.',
    ],
    breadcrumbIds: [fitServicesId],
    relatedPageIds: ['pi-feature-tv-stand-fit'],
  }),
  definePage({
    id: gymId,
    route: '/home-gym/',
    family: 'hub',
    cluster: 'gym',
    query: 'home gym equipment room fit',
    title: 'Home Gym Fit: Equipment Footprints and Operating Zones — Fitwise.stream',
    description:
      'Check measured gym equipment against room and ceiling dimensions with user-selected or manual-based operating zones.',
    h1: 'Home gym equipment fit',
    kind: 'hub',
    intro:
      'Separate equipment footprint from the movement space needed for the specific exercise and model.',
    calculation:
      'The tool compares width, depth and height, then adds the operating zones you enter as separate targets.',
    limitations: [
      'Safety and operating zones must come from the exact manual or user judgment.',
      'This does not evaluate anchoring, floor loading or exercise technique.',
    ],
    breadcrumbIds: [fitServicesId],
    relatedPageIds: ['pi-feature-power-rack-fit'],
  }),
  definePage({
    id: storageId,
    route: '/storage/',
    family: 'hub',
    cluster: 'storage',
    query: 'what fits in a storage unit',
    title: 'Storage Fit: Usable Space, Aisles and Object Counts — Fitwise.stream',
    description:
      'Estimate single-layer storage capacity from measured object and usable storage dimensions.',
    h1: 'Storage fit and capacity',
    kind: 'hub',
    intro:
      'Measure the usable inside dimensions and the objects you plan to store, not nominal outside unit size.',
    calculation:
      'The calculator tries both floor-grid orientations and reports a single-layer count with your entered gap and aisle target.',
    limitations: [
      'It does not model mixed objects, stacking, load limits, supports or a packing optimum.',
    ],
    breadcrumbIds: [fitServicesId],
    relatedPageIds: ['pi-feature-storage-capacity'],
  }),
  definePage({
    id: gameRoomId,
    route: '/game-room/',
    family: 'hub',
    cluster: 'living',
    query: 'pool table room size calculator',
    title: 'Game-Room Fit: Table and Cue Envelopes — Fitwise.stream',
    description:
      'Compare a measured table and cue length with a room and additional space you select.',
    h1: 'Game-room fit',
    kind: 'hub',
    intro:
      'Start with the outside table dimensions and cue used for play. Do not rely on table labels alone.',
    calculation:
      'The pool tool adds the entered cue length to each side of the table footprint and keeps extra walking space separate.',
    limitations: [
      'Angled shots, player stance, raised cue clearance, pockets and other furniture are not simulated.',
    ],
    breadcrumbIds: [fitServicesId],
    relatedPageIds: ['pi-feature-pool-table-fit'],
  }),
  definePage({
    id: vehicleId,
    route: '/vehicle/',
    family: 'hub',
    cluster: 'other',
    query: 'vehicle fit in garage calculator',
    title: 'Vehicle and Garage Fit — Fitwise.stream',
    description: 'Compare user-measured vehicle, garage, door opening and door-access dimensions.',
    h1: 'Vehicle and garage fit',
    kind: 'hub',
    intro:
      'Measure the vehicle with mirrors and accessories in the parking configuration you plan to use.',
    calculation:
      'Physical vehicle fit, garage-door opening and open-door access targets are separate checks.',
    limitations: [
      'There is no vehicle specification database or driveway/steering maneuver simulation.',
    ],
    breadcrumbIds: [fitServicesId],
    relatedPageIds: ['pi-feature-vehicle-garage'],
  }),

  // Appliance and access intents.
  definePage({
    id: 'pi-feature-appliance-install',
    route: '/appliances/appliance-install-fit/',
    family: 'configuration',
    cluster: 'appliances',
    query: 'appliance installation clearance fit calculator',
    title: 'Appliance Installation Fit: Opening and Manual Clearances — Fitwise.stream',
    description:
      'Compare measured appliance dimensions with an opening and installation allowances from the exact model manual.',
    h1: 'Will the appliance fit its opening and installation space?',
    kind: 'tool',
    mode: 'appliance-install',
    modeCategory: 'core',
    intro:
      'Use the appliance outside dimensions and clear interior opening. Enter side, rear and top margins from the exact installation manual; zero means the installation margin was not included.',
    calculation:
      'Hard width/depth/height fit is calculated first. Manual-required side, rear and top allowances are then shown as target dimensions and target margins.',
    limitations: [
      'The calculator does not include hoses, plug bends, door swing, packaging or delivery route.',
      'No generic ventilation or service allowance is asserted.',
    ],
    breadcrumbIds: [appliancesId],
    relatedPageIds: ['pi-feature-fridge-fit', 'pi-feature-washer-fit'],
  }),
  definePage({
    id: 'pi-feature-fridge-fit',
    route: '/appliances/fridge-fit/',
    family: 'configuration',
    cluster: 'appliances',
    query: 'will this fridge fit my cabinet opening',
    title: 'Fridge Fit Calculator: Cabinet Opening and Manual Clearances — Fitwise.stream',
    description:
      'Check a measured fridge against a cabinet opening, then apply clearances from its installation manual.',
    h1: 'Will this fridge fit the opening?',
    kind: 'tool',
    mode: 'appliance-install',
    modeCategory: 'core',
    intro:
      'Measure the fridge outside dimensions with handles and accessories included, and measure the opening at its narrowest points.',
    calculation:
      'The page checks width, depth and height separately. Rear, top and side clearances are separate targets that you enter from the exact model manual.',
    limitations: [
      'Door swing, hinge reversals, water line, ventilation and delivery access need separate checks against the appliance manual and route.',
    ],
    breadcrumbIds: [appliancesId],
    relatedPageIds: ['pi-feature-appliance-install', 'pi-feature-washer-fit'],
  }),
  definePage({
    id: 'pi-feature-washer-fit',
    route: '/appliances/washer-fit/',
    family: 'configuration',
    cluster: 'appliances',
    query: 'will a washing machine fit in my laundry opening',
    title: 'Washer Fit Calculator: Alcove and Installation Space — Fitwise.stream',
    description:
      'Compare measured washer outside dimensions with a laundry opening and manual-specified service clearances.',
    h1: 'Will the washer fit the laundry opening?',
    kind: 'tool',
    mode: 'appliance-install',
    modeCategory: 'core',
    intro:
      'Enter outside dimensions from the exact washer model and clear opening dimensions measured at the narrowest point.',
    calculation:
      'Physical width, depth and height are checked independently; hose, drain, rear vibration and side/top service space are entered from the current manual.',
    limitations: [
      'The tool does not claim a generic vibration gap, ventilation minimum or code clearance.',
      'Door swing, hookup projection and delivery route are not simulated.',
    ],
    breadcrumbIds: [appliancesId],
    relatedPageIds: ['pi-feature-appliance-install', 'pi-feature-fridge-fit'],
  }),
  definePage({
    id: 'pi-feature-furniture-route',
    route: '/access/furniture-route-fit/',
    family: 'configuration',
    cluster: 'other',
    query: 'will furniture fit through my delivery route',
    title: 'Furniture Route Fit: Doors, Halls, Turns and Stairs — Fitwise.stream',
    description:
      'Check measured furniture against door, corridor, turn, stair and destination bottlenecks.',
    h1: 'Will the furniture fit through the route?',
    kind: 'tool',
    mode: 'delivery-route',
    modeCategory: 'core',
    intro: 'Measure the item including packaging, then the clear opening at each route bottleneck.',
    calculation:
      'Each door, corridor, stair width/headroom and destination opening is checked. Turns use a conservative footprint diagonal envelope.',
    limitations: [
      'No translation/rotation motion solver is used; the turn bound can reject paths movers can negotiate.',
      'Tilt, lift, handles, thresholds and packaging flex are excluded.',
    ],
    breadcrumbIds: [accessId],
    relatedPageIds: [fitServicesId],
  }),

  // Workspace, TV, gym, storage, game room and vehicle service intents.
  definePage({
    id: 'pi-feature-workspace-compatibility',
    route: '/workspace/monitor-arm-compatibility/',
    family: 'configuration',
    cluster: 'workspace',
    query: 'will my monitor work with this arm and desk',
    title: 'Monitor Arm Fit: VESA, Load, Desk Clamp and Space — Fitwise.stream',
    description:
      'Check monitor footprint, VESA pattern, arm load rating, clamp thickness and desk depth from exact manuals.',
    h1: 'Will the monitor, arm and desk work together?',
    kind: 'tool',
    mode: 'workspace-compatibility',
    modeCategory: 'core',
    intro:
      'Measure the monitor without its stand, then transcribe weight, VESA and clamp/load limits from the exact monitor and arm manuals.',
    calculation:
      'The calculator checks monitor width and monitor-plus-arm-base depth against the desk, desk thickness against clamp limits, exact VESA pattern support and monitor weight against arm rating.',
    limitations: [
      'No monitor-arm product catalog or adapter compatibility database is included.',
      'Arm reach, wall collisions, cable clearance and mounting-surface strength are not modeled.',
    ],
    breadcrumbIds: [workspaceId],
    relatedPageIds: ['pi-p019-monitor-size-chart', 'pi-feature-tv-stand-fit'],
    sourceIds: ['src-fitwise-internal-convention'],
  }),
  definePage({
    id: 'pi-feature-tv-stand-fit',
    route: '/tv/tv-stand-fit/',
    family: 'configuration',
    cluster: 'living',
    query: 'will my TV fit the stand or wall space',
    title: 'TV Stand and Wall Fit: Outside Dimensions, Console and Mount — Fitwise.stream',
    description:
      'Check actual TV outside width/height, stand footprint, console surface or wall region and exact VESA/load limits.',
    h1: 'Will the TV fit the stand or wall space?',
    kind: 'tool',
    mode: 'tv-fit',
    modeCategory: 'core',
    intro:
      'Enter actual outside width and height from the TV documentation. Screen diagonal alone is not used as a substitute for device dimensions.',
    calculation:
      'Stand mode checks TV/stand/soundbar footprints against a console; wall mode checks screen envelope, exact VESA patterns and rated load.',
    limitations: [
      'Stand/soundbar co-placement is checked separately, not packed or overlap-simulated.',
      'Wall construction, fasteners, stud placement and viewing distance are not assessed.',
    ],
    breadcrumbIds: [tvId],
    relatedPageIds: ['pi-feature-workspace-compatibility'],
  }),
  definePage({
    id: 'pi-feature-power-rack-fit',
    route: '/home-gym/power-rack-room-size/',
    family: 'configuration',
    cluster: 'gym',
    query: 'what room size fits a power rack',
    title: 'Power Rack Room Fit: Footprint, Ceiling and Operating Zones — Fitwise.stream',
    description:
      'Compare a measured rack with room width/depth/height and operating zones from the exact equipment manual.',
    h1: 'Will the power rack and operating space fit?',
    kind: 'tool',
    mode: 'home-gym',
    modeCategory: 'core',
    intro:
      'Measure rack outside dimensions, ceiling height and the operating zone for the exercise and equipment configuration you intend to use.',
    calculation:
      'Hard equipment footprint and height are checked first; user/manual-selected side, front and overhead zones appear as separate targets.',
    limitations: [
      'No default safety clearance is supplied.',
      'Anchoring, floor loading, bar path, plates, lifting technique and equipment movement are not modeled.',
    ],
    breadcrumbIds: [gymId],
    relatedPageIds: ['pi-feature-vehicle-garage'],
  }),
  definePage({
    id: 'pi-feature-storage-capacity',
    route: '/storage/what-fits-in-storage/',
    family: 'configuration',
    cluster: 'storage',
    query: 'what fits in my storage unit',
    title: 'What Fits in Storage? Object Count and Aisle Calculator — Fitwise.stream',
    description:
      'Estimate how many equal objects fit in a measured storage interior, with a single-layer grid and user-selected aisle.',
    h1: 'What fits in the storage space?',
    kind: 'tool',
    mode: 'storage',
    modeCategory: 'core',
    intro:
      'Measure usable inside dimensions, objects, gap and aisle. Nominal storage-unit size may differ from the usable interior.',
    calculation:
      'A rectangular grid tries both floor orientations and checks height; the requested count is compared with a single-layer capacity estimate.',
    limitations: [
      'Mixed-size objects, stacking, load ratings, shelving supports and aisle route optimization are excluded.',
      'The aisle target is user-entered, not an accessibility standard.',
    ],
    breadcrumbIds: [storageId],
    relatedPageIds: ['pi-feature-garden-shed-storage'],
  }),
  definePage({
    id: 'pi-feature-pool-table-fit',
    route: '/game-room/pool-table-fit/',
    family: 'configuration',
    cluster: 'living',
    query: 'what room size fits a pool table',
    title: 'Pool Table Room Fit: Table and Cue-Length Envelope — Fitwise.stream',
    description: 'Compare measured table and cue dimensions with a room and optional extra space.',
    h1: 'Will the pool table and cue fit?',
    kind: 'tool',
    mode: 'pool-room',
    modeCategory: 'core',
    intro: 'Use the table outside dimensions and actual cue length that will be used in the room.',
    calculation:
      'Cue length is added at each table edge to show a rectangular play envelope; extra space is a separate user target.',
    limitations: [
      'Angled shots, player stance, cue elevation, pockets and furniture are not simulated.',
      'This is not a cue-trajectory or safety assessment.',
    ],
    breadcrumbIds: [gameRoomId],
    relatedPageIds: ['pi-feature-dining', 'pi-feature-garden-patio-dining'],
  }),
  definePage({
    id: 'pi-feature-vehicle-garage',
    route: '/vehicle/garage-fit/',
    family: 'configuration',
    cluster: 'other',
    query: 'will my vehicle fit in the garage with door access',
    title: 'Vehicle Garage Fit: Parking Footprint and Door Access — Fitwise.stream',
    description:
      'Compare measured vehicle, garage door, parking dimensions and open-door access space.',
    h1: 'Will the vehicle and door access fit the garage?',
    kind: 'tool',
    mode: 'vehicle-garage',
    modeCategory: 'core',
    intro:
      'Enter the actual vehicle outside dimensions in the mirror/accessory configuration you plan to park.',
    calculation:
      'The hard parking footprint is separate from garage opening, door projection, front/rear and overhead targets.',
    limitations: [
      'There is no vehicle dimension database.',
      'Driveway approach, steering, turning, ramps, garage tracks and door operation paths are not simulated.',
    ],
    breadcrumbIds: [vehicleId],
    relatedPageIds: ['pi-feature-furniture-route'],
  }),

  // Garden sub-services.
  definePage({
    id: 'pi-feature-garden-structure',
    route: '/garden/structure-fit/',
    family: 'configuration',
    cluster: 'other',
    query: 'will a shed gazebo or garden office fit my plot',
    title: 'Shed, Gazebo and Garden Office Fit: Plot and Access — Fitwise.stream',
    description:
      'Check structure body, roof overhang, maintenance space, door projection and access path against a garden plot.',
    h1: 'Will the structure fit the garden plot?',
    kind: 'tool',
    mode: 'garden-structure',
    modeCategory: 'garden',
    intro:
      'Enter the body and roof/eave dimensions separately; in reverse mode, compare your own candidate widths/depths against the plot.',
    calculation:
      'Physical roof/body footprint is compared first, then maintenance and door-path targets are shown separately.',
    limitations: [
      'The model is a rectangular envelope and does not evaluate foundations, roof runoff, slope, anchoring, utilities or planning permission.',
      'Candidate sizes are user-entered examples, not retailer standards.',
    ],
    breadcrumbIds: [gardenId],
    relatedPageIds: ['pi-feature-garden-greenhouse', 'pi-feature-garden-shed-storage'],
  }),
  definePage({
    id: 'pi-feature-garden-patio-dining',
    route: '/garden/patio-dining-fit/',
    family: 'configuration',
    cluster: 'dining',
    query: 'will my dining table fit under my gazebo',
    title: 'Gazebo Dining Fit: Table and Chairs by Clear Post Span — Fitwise.stream',
    description:
      'Check measured dining table/chair envelopes against usable patio or gazebo post-to-post dimensions.',
    h1: 'Will the dining layout fit under the gazebo?',
    kind: 'tool',
    mode: 'garden-patio-dining',
    modeCategory: 'garden',
    intro:
      'Use the clear dimension between posts or obstacles. The advertised roof span is shown only for comparison and is not treated as usable floor area.',
    calculation:
      'The shared dining geometry checks table orientations, seat widths and chair envelopes against the clear span and user-selected circulation target.',
    limitations: [
      'Guy ropes, sidewalls, angled legs, anchoring and non-rectangular footprints are excluded.',
      'Walking allowance is user-selected, not a universal gazebo standard.',
    ],
    breadcrumbIds: [gardenId],
    relatedPageIds: ['pi-feature-dining'],
  }),
  definePage({
    id: 'pi-feature-garden-shed-storage',
    route: '/garden/shed-interior-storage/',
    family: 'configuration',
    cluster: 'storage',
    query: 'what fits inside my shed with an aisle',
    title: 'Shed Interior Fit: Storage Objects and Aisle — Fitwise.stream',
    description:
      'Estimate a single-layer grid for equal objects inside the measured usable shed interior.',
    h1: 'What fits inside the shed?',
    kind: 'tool',
    mode: 'garden-shed-storage',
    modeCategory: 'garden',
    intro:
      'Enter inside dimensions rather than the advertised outside shed size, and compare a repeated object footprint with the aisle you want to preserve.',
    calculation:
      'A simple two-orientation grid estimates one-layer object capacity and checks the measured aisle against your target.',
    limitations: [
      'Mixed mower/bicycle/shelf layouts, wall hooks, stacking, load ratings and walking-route optimization are not modeled.',
      'The aisle is a chosen target, not a code minimum.',
    ],
    breadcrumbIds: [gardenId],
    relatedPageIds: ['pi-feature-storage-capacity', 'pi-feature-garden-structure'],
  }),
  definePage({
    id: 'pi-feature-garden-greenhouse',
    route: '/garden/greenhouse-layout/',
    family: 'configuration',
    cluster: 'other',
    query: 'greenhouse fit with staging and central aisle',
    title: 'Greenhouse Fit: Garden Footprint, Staging and Aisle — Fitwise.stream',
    description:
      'Check a greenhouse roof footprint, garden maintenance space, staging depth, central aisle and door access.',
    h1: 'Will the greenhouse and usable aisle fit?',
    kind: 'tool',
    mode: 'garden-greenhouse',
    modeCategory: 'garden',
    intro:
      'Enter exterior roof/body dimensions and clear internal width. Staging benches reduce the remaining central aisle width.',
    calculation:
      'The calculator checks the outside envelope against plot dimensions and compares inside width minus both staging depths with the aisle target you chose.',
    limitations: [
      'Siting, light, ventilation, drainage, glazing, wind load and foundations are not assessed.',
      'No horticultural aisle minimum is inferred.',
    ],
    breadcrumbIds: [gardenId],
    relatedPageIds: ['pi-feature-garden-structure'],
  }),
  definePage({
    id: 'pi-feature-garden-hot-tub',
    route: '/garden/hot-tub-fit/',
    family: 'configuration',
    cluster: 'other',
    query: 'will a hot tub fit on my patio with service access',
    title: 'Hot Tub Fit: Patio, Service Panel and Cover Space — Fitwise.stream',
    description:
      'Compare a measured tub footprint with patio dimensions and service/cover clearances from the exact manual.',
    h1: 'Will the hot tub and its service space fit?',
    kind: 'tool',
    mode: 'garden-hot-tub',
    modeCategory: 'garden',
    intro:
      'Use the model manual for service-panel, cover-lift and electrical access space. Enter tub outside dimensions and a usable patio rectangle.',
    calculation:
      'Hard tub width/depth are checked separately from the side service, front-panel and overhead cover targets.',
    limitations: [
      'Water-filled weight, base strength, drainage, electrical work and delivery route are not evaluated.',
      'No generic hot-tub service clearance is supplied.',
    ],
    breadcrumbIds: [gardenId],
    relatedPageIds: ['pi-feature-garden-structure'],
  }),
  definePage({
    id: 'pi-feature-garden-outdoor-kitchen',
    route: '/garden/outdoor-kitchen-fit/',
    family: 'configuration',
    cluster: 'other',
    query: 'outdoor kitchen patio fit with work space',
    title: 'Outdoor Kitchen Fit: Patio, Work and Service Space — Fitwise.stream',
    description:
      'Compare a measured outdoor kitchen run with patio dimensions and manual-selected work/service zones.',
    h1: 'Will the outdoor kitchen and work zone fit?',
    kind: 'tool',
    mode: 'garden-outdoor-kitchen',
    modeCategory: 'garden',
    intro:
      'Measure the full run, patio and service clearances for the exact modules and appliances.',
    calculation:
      'The hard kitchen footprint is separated from side service, rear service and front work targets.',
    limitations: [
      'Gas, electric, heat/fire separation, ventilation, drainage and structural support are not checked.',
      'Manufacturer and local requirements must be verified separately.',
    ],
    breadcrumbIds: [gardenId],
    relatedPageIds: ['pi-feature-garden-structure'],
  }),
  definePage({
    id: 'pi-feature-garden-play',
    route: '/garden/play-equipment-use-zone/',
    family: 'configuration',
    cluster: 'other',
    query: 'play equipment use zone garden fit',
    title: 'Play Equipment Garden Fit: Manufacturer Use Zone — Fitwise.stream',
    description:
      'Compare play-equipment dimensions with a plot and a use zone copied from the exact manufacturer manual.',
    h1: 'Does the play equipment fit with its manufacturer use zone?',
    kind: 'tool',
    mode: 'garden-play-equipment',
    modeCategory: 'garden',
    intro:
      'The use-zone check is incomplete until you enter the exact manual/model reference and all sides of the manufacturer zone.',
    calculation:
      'Physical equipment footprint and the manual-entered use-zone envelope are separate dimensions; the calculator asks for review when the use zone is unverified.',
    limitations: [
      'No generic safety/fall zone is supplied.',
      'Surface impact, anchoring, supervision, overhead hazards and legal requirements are not assessed.',
    ],
    breadcrumbIds: [gardenId],
    relatedPageIds: ['pi-feature-garden-structure'],
  }),
];

export const featurePageIntents: PageIntent[] = featurePages.map(({ pageIntent }) => pageIntent);
export const featureSeoPublications: SeoPublication[] = featurePages.map(
  ({ publication }) => publication,
);
export const featurePageRouteDispositionRecords = featurePages.map(({ pageIntent }) => ({
  pageIntentId: pageIntent.id,
  route: pageIntent.route,
  intentStatus: 'published' as const,
  disposition: 'generated' as const,
  renderer: 'static' as const,
}));
export const featurePageByIntentId = new Map(
  featurePages.map((page) => [page.pageIntent.id, page]),
);
