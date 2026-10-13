import type { PageIntent, SeoPublication } from '../types';
import type { BedRoomChecksInput, FitServiceValues, RugFitInput } from '../lib/geometry';

export interface BlogImage {
  sourceUrl: string;
  sourcePage: string;
  creator: string;
  license: string;
  licenseUrl: string;
  verifiedOn: string;
  width: number;
  height: number;
  alt: string;
}

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogReference {
  label: string;
  href: string;
}

export interface BlogWorkedExampleBase {
  heading: string;
  note: string;
  inputs: Array<{ label: string; value: string }>;
}

export type BlogWorkedExample =
  | (BlogWorkedExampleBase & { calculator: 'rug'; values: RugFitInput })
  | (BlogWorkedExampleBase & { calculator: 'delivery-route'; values: FitServiceValues })
  | (BlogWorkedExampleBase & {
      calculator: 'workspace';
      values: {
        monitorCount: number;
        monitorWidthMm: number;
        gapMm: number;
        sideMarginMm: number;
        deskWidthMm: number;
        monitorStandDepthMm: number;
        rearClearanceMm: number;
        keyboardZoneMm: number;
        deskDepthMm: number;
      };
    })
  | (BlogWorkedExampleBase & {
      calculator: 'bedroom';
      values: {
        bedroom: BedRoomChecksInput;
        wardrobeDoor: {
          doorLeafWidthMm: number;
          openingAngleDegrees: number;
          obstacleGapMm: number;
        };
      };
    })
  | (BlogWorkedExampleBase & { calculator: 'appliance-install'; values: FitServiceValues });

export interface BlogPost {
  pageIntentId: string;
  slug: string;
  route: string;
  cluster: PageIntent['cluster'];
  categoryLabel: string;
  title: string;
  description: string;
  h1: string;
  excerpt: string;
  primaryToolHref: string;
  primaryToolLabel: string;
  primaryToolDescription: string;
  workedExample: BlogWorkedExample;
  image: BlogImage;
  sections: BlogSection[];
  references: BlogReference[];
  relatedPageIds: string[];
}

export const BLOG_PREVIEW_STATUS = 'Draft for local review';
export const BLOG_PREVIEW_DATE = '2026-10-13';
export const BLOG_INDEX_ID = 'pi-blog-index';

const PEXELS_LICENSE_URL = 'https://www.pexels.com/license/';

export const BLOG_POSTS: BlogPost[] = [
  {
    pageIntentId: 'pi-blog-rug-fit-room',
    slug: 'rug-fit-in-a-room',
    route: '/blog/rug-fit-in-a-room/',
    cluster: 'living',
    categoryLabel: 'Room layout',
    title: 'The Rug Fit the Room. Did It Fit the Furniture?',
    description:
      'An illustrative room story about separating rug-to-room fit from the furniture footprint or front-edge coverage you actually want.',
    h1: 'The rug fit the room. Did it fit the furniture?',
    excerpt:
      'A rug can fit inside a room and still miss the furniture relationship the household had in mind. Start with two separate measurements.',
    primaryToolHref: '/rug-fit/',
    primaryToolLabel: 'Open the Rug + Furniture Fit check',
    primaryToolDescription:
      'Compare your room and rug dimensions, then optionally check a full furniture/use footprint or a chosen front-edge overlap.',
    workedExample: {
      calculator: 'rug',
      heading: 'Illustrative inputs: room, rug and full use footprint',
      note: 'Fictional measurements chosen to demonstrate the check. The wall and furniture margins are user-selected examples, not rug-sizing standards.',
      inputs: [
        { label: 'Room', value: '4,200 × 5,000 mm' },
        { label: 'Rug', value: '2,500 × 3,000 mm' },
        { label: 'Extra wall border', value: '100 mm per side' },
        { label: 'Furniture/use footprint', value: '2,100 × 2,000 mm' },
        { label: 'Extra rug border around footprint', value: '100 mm per side' },
      ],
      values: {
        roomWidthMm: 4200,
        roomDepthMm: 5000,
        rugWidthMm: 2500,
        rugDepthMm: 3000,
        wallGapEachSideMm: 100,
        orientation: 'auto',
        checkFurniture: true,
        coverageMode: 'full-footprint',
        furnitureWidthMm: 2100,
        furnitureDepthMm: 2000,
        furnitureMarginEachSideMm: 100,
      },
    },
    image: {
      sourceUrl:
        'https://images.pexels.com/photos/6980653/pexels-photo-6980653.jpeg?auto=compress&cs=tinysrgb&w=1400',
      sourcePage:
        'https://www.pexels.com/photo/modern-room-interior-with-furniture-on-marble-floor-at-home-6980653/',
      creator: 'Max Vakhtbovych',
      license: 'Pexels License',
      licenseUrl: PEXELS_LICENSE_URL,
      verifiedOn: BLOG_PREVIEW_DATE,
      width: 7342,
      height: 4900,
      alt: 'Living room with a sofa, coffee tables and a patterned floor covering',
    },
    sections: [
      {
        heading: 'The room was not the only rectangle',
        paragraphs: [
          'Illustrative composite scenario: Maya and Elias unroll a rug on a quiet Saturday and step back to look at the living room. Every rug edge is inside the room, but the sofa seems to sit on a separate island. Nothing is wrong with the room measurement; the question has changed from “does the rug fit the room?” to “what part of the furniture should the rug cover?”',
          'Those are two checks. Room width and depth tell you whether the rug can lie in the space. A sofa, bed or dining-use footprint tells you what relationship you are asking the rug to support. A front-edge overlap is different from asking the entire furniture/use zone to sit on the rug.',
        ],
      },
      {
        heading: 'Make two dimension sets before comparing',
        paragraphs: [
          'Maya writes down the room and rug measurements separately, rather than comparing a rug label with the room plan. Then she decides which part of the sofa arrangement she wants the rug to cover. Elias measures the rectangular furniture/use footprint they chose, not a generic sofa size from a catalogue.',
          'That small pause prevents a common mismatch: a rug can pass the room check while failing the relationship check, or fit the furniture/use zone while missing a wall border the household chose.',
        ],
        bullets: [
          'Room: clear inside width and depth between fixed walls or obstructions.',
          'Rug: laid-flat outside width and depth; include fringe if it lies on the floor and must fit.',
          'Furniture/use zone: the exact rectangle the user wants fully on the rug, or the front-edge relationship they choose.',
          'Optional borders: enter only the extra room-edge or furniture-edge margin personally desired.',
        ],
      },
      {
        heading: 'Measure the relationship you want',
        paragraphs: [
          'Measure the room between its clear inside walls and the rug laid flat, edge to edge. If fringe lies on the floor and must stay within the room, include it in the rug footprint. Any extra border from the wall is a choice you enter; FitWise does not prescribe one as a universal design rule.',
          'For full coverage, enter the whole footprint you want on the rug. In a dining room that may include the chair-use area you want covered; around a sofa or bed it may be only the measured footprint you choose. For front-edge coverage, enter the overlap under the furniture edge and the rug extension into open floor yourself.',
        ],
      },
      {
        heading: 'Let the diagram answer the dimensional question',
        paragraphs: [
          'The Rug + Furniture Fit check compares a rectangular room and rug, tries the two axis-aligned rug orientations when requested, and draws the chosen relationship in a proportional diagram. The table keeps physical fit separate from the extra margins you select. It does not choose a color, style, furniture location or ideal rug size.',
          'If the rug passes the dimensional checks, confirm the actual product edges and the room layout before ordering. The photo above is licensed stock photography; it is not a FitWise customer room or a measured example.',
          'A front-edge result does not locate every sofa or bed leg. A full-footprint result does not position other furniture in the room. The centered SVG is a proportional way to compare dimensions, not a floor-plan editor or a style verdict.',
        ],
      },
    ],
    references: [
      { label: 'Bedroom fit check', href: '/bedroom/' },
      { label: 'Dining room fit check', href: '/dining/' },
      { label: 'Measurement conventions', href: '/methodology/reference-conventions/' },
    ],
    relatedPageIds: ['pi-feature-rug-fit', 'pi-feature-bedroom', 'pi-feature-dining'],
  },
  {
    pageIntentId: 'pi-blog-sofa-through-doorway',
    slug: 'sofa-through-a-doorway',
    route: '/blog/sofa-through-a-doorway/',
    cluster: 'other',
    categoryLabel: 'Furniture delivery',
    title: 'The Sofa Fit the Doorway. What About the Turn?',
    description:
      'An illustrative delivery story about measuring a sofa and each route bottleneck without promising a 3D turning solution.',
    h1: 'The sofa fit the doorway. What about the turn?',
    excerpt:
      'A front-door width is only one number on the delivery route. Measure the sofa and every clear opening before deciding what the numbers prove.',
    primaryToolHref: '/access/furniture-route-fit/',
    primaryToolLabel: 'Check a furniture delivery route',
    primaryToolDescription:
      'Compare a measured item with the clear openings and route dimensions you enter, then review every unresolved turn in person.',
    workedExample: {
      calculator: 'delivery-route',
      heading: 'Illustrative inputs: upright route with a narrow turn landing',
      note: 'These are fictional, user-entered dimensions. The checker uses a conservative diagonal envelope at a turn; it does not simulate tilt or a mover’s maneuver.',
      inputs: [
        { label: 'Upright sofa outside width × depth × height', value: '850 × 900 × 900 mm' },
        { label: 'Front door clear opening', value: '920 × 2,050 mm' },
        { label: 'Narrow hall width', value: '1,000 mm' },
        { label: 'Turn landing clear width × depth', value: '1,200 × 1,500 mm' },
        { label: 'Stair width × minimum headroom', value: '920 × 2,200 mm' },
        { label: 'Destination door clear opening', value: '920 × 2,050 mm' },
      ],
      values: {
        itemWidth: 850,
        itemDepth: 900,
        itemHeight: 900,
        frontDoorWidth: 920,
        frontDoorHeight: 2050,
        hallWidth: 1000,
        turnWidth: 1200,
        turnDepth: 1500,
        stairWidth: 920,
        stairHeadroom: 2200,
        destinationDoorWidth: 920,
        destinationDoorHeight: 2050,
      },
    },
    image: {
      sourceUrl:
        'https://images.pexels.com/photos/7464406/pexels-photo-7464406.jpeg?auto=compress&cs=tinysrgb&w=1400',
      sourcePage:
        'https://www.pexels.com/photo/men-carrying-green-couch-while-getting-in-the-house-7464406/',
      creator: 'RDNE Stock project',
      license: 'Pexels License',
      licenseUrl: PEXELS_LICENSE_URL,
      verifiedOn: BLOG_PREVIEW_DATE,
      width: 4560,
      height: 3040,
      alt: 'Two movers carry a green sofa through a brick doorway',
    },
    sections: [
      {
        heading: 'One doorway number made the plan feel settled',
        paragraphs: [
          'Illustrative composite scenario: Morgan has booked a sofa delivery and saved the product page. The front doorway looks wide enough, so the move seems settled. At the first turn into the hall, the team pauses. The doorway was measured; the route was not.',
          'A route is a series of constraints: the packaged or assembled item, the narrowest clear opening, corridor widths, thresholds, stair landings and turns. Door handles, open leaves and packaging can change the usable opening. Check the exact item state being delivered rather than assuming the product-page dimensions include the carton.',
        ],
        bullets: [
          'Ask whether delivery dimensions describe the packed item or the assembled item.',
          'Measure the clear opening after accounting for the door leaf, handles and fixed trim.',
          'Measure every narrow hall, stair, landing and lift segment; do not assume the front door is the bottleneck.',
          'Flag turns or changes in orientation that a straight span comparison cannot prove.',
        ],
      },
      {
        heading: 'Separate segment checks from maneuvering',
        paragraphs: [
          'Measure the outer item dimensions and the clear span at each bottleneck. Record where a door leaf, handle, rail or fixed obstruction reduces the opening. Compare those numbers in the Furniture Route Fit tool. A pass on the entered spans is evidence about those dimensions; it is not proof that an item can pivot or tilt through a three-dimensional corner.',
          'The photo is a stock illustration, not a FitWise customer or a result from this tool. If the route depends on rotating the sofa, removing a door, carrying it up a tight stair or changing orientation, ask the retailer or delivery crew to confirm the maneuver before the delivery date.',
        ],
      },
      {
        heading: 'Use the right check for each stage',
        paragraphs: [
          'First compare the item with the route. Then check whether it fits in the final room. FitWise keeps those jobs separate: the Access route check compares the dimensions you enter, while the universal room check compares one object with a room or space.',
          'Do not treat either tool as a guarantee of delivery, safe lifting or wall protection. The final decision still depends on the item, packaging, route geometry and the people doing the move.',
          'A retailer or delivery provider can confirm whether packaging changes, temporary door removal or trained handling are possible. Do not attempt a lift or turn solely because a two-dimensional tool returned a positive result.',
        ],
      },
    ],
    references: [
      {
        label: 'Home Depot Measure First guide',
        href: 'https://www.homedepot.com/hdus/en_US/DTCCOMNEW/fetch/Global_Assets/PDFs/MeasureFirst.pdf',
      },
      { label: 'Universal room fit check', href: '/will-it-fit/' },
      { label: 'Measurement methodology', href: '/methodology/' },
    ],
    relatedPageIds: [
      'pi-feature-furniture-route',
      'pi-feature-will-it-fit',
      'pi-feature-methodology',
    ],
  },
  {
    pageIntentId: 'pi-blog-dual-monitors-one-desk',
    slug: 'two-monitors-one-desk',
    route: '/blog/two-monitors-one-desk/',
    cluster: 'workspace',
    categoryLabel: 'Workspace',
    title: 'Two Monitors, One Desk: Measure the Footprints, Not Just the Diagonals',
    description:
      'An illustrative home-office story about comparing actual monitor, stand and work-zone footprints with one measured desk.',
    h1: 'Two monitors, one desk: measure the footprints, not just the diagonals',
    excerpt:
      'The screen-size label was easy to find. The width of each base, the keyboard zone and the usable depth took a measuring tape.',
    primaryToolHref: '/workspace/',
    primaryToolLabel: 'Open the Workspace Fit check',
    primaryToolDescription:
      'Enter the measured desk and equipment dimensions, and keep the workspace assumptions you choose visible.',
    workedExample: {
      calculator: 'workspace',
      heading: 'Illustrative inputs: two measured monitors and a keyboard zone',
      note: 'The two 615 mm monitor widths are hypothetical measurements taken from example product drawings, not a standard width for all 27-inch screens. All clearance zones are selected by the user.',
      inputs: [
        { label: 'Desk usable width × depth', value: '1,400 × 700 mm' },
        { label: 'Monitor count and outside width', value: '2 × 615 mm' },
        { label: 'Gap between monitors', value: '40 mm' },
        { label: 'Desired side border', value: '50 mm per side' },
        { label: 'Stand depth + rear cable area + keyboard zone', value: '250 + 50 + 300 mm' },
      ],
      values: {
        monitorCount: 2,
        monitorWidthMm: 615,
        gapMm: 40,
        sideMarginMm: 50,
        deskWidthMm: 1400,
        monitorStandDepthMm: 250,
        rearClearanceMm: 50,
        keyboardZoneMm: 300,
        deskDepthMm: 700,
      },
    },
    image: {
      sourceUrl:
        'https://images.pexels.com/photos/326513/pexels-photo-326513.jpeg?auto=compress&cs=tinysrgb&w=1400',
      sourcePage: 'https://www.pexels.com/photo/turned-on-silver-imac-on-desk-326513/',
      creator: 'Tranmautritam',
      license: 'Pexels License',
      licenseUrl: PEXELS_LICENSE_URL,
      verifiedOn: BLOG_PREVIEW_DATE,
      width: 5184,
      height: 3456,
      alt: 'Two monitors with a keyboard and phone arranged on a desk',
    },
    sections: [
      {
        heading: 'The diagonal sounded like a desk measurement',
        paragraphs: [
          'Illustrative composite scenario: Alex has two monitor boxes open beside a new desk. The display labels show diagonal sizes and the desk listing gives an outside width and depth. Yet the bases, a keyboard and the space Alex wants for a mouse make a different shape than those two diagonal numbers suggest.',
          'The screen diagonal is not the panel width, and the panel width is not necessarily the base width. A desk check needs the actual outside dimensions and the space Alex wants to reserve for the keyboard, mouse, stand or monitor arm.',
        ],
        bullets: [
          'Measure the usable desktop, not just the advertised outer dimensions.',
          'Use the real panel, base or arm footprint that will sit on the desk.',
          'Enter the keyboard/mouse space you want to keep available as a separate user-selected zone.',
          'Check desk depth as well as width; a setup can fit side-to-side and still occupy too much depth.',
        ],
      },
      {
        heading: 'Measure the working surface that remains',
        paragraphs: [
          'Jordan measures the clear desk surface rather than the advertised outer width, then checks depth from the rear edge to the front edge. For the monitor setup, he uses the manufacturer dimensions for the parts that sit on the desk. His preferred keyboard and mouse zone stays a user-selected input; the calculator does not declare a universal ergonomic minimum.',
          'The Workspace Fit check compares the measured setup with the measured desk and shows which dimension is tight. If a monitor arm is part of the plan, the desk edge, clamp range, VESA pattern and display weight need a separate compatibility check against the arm manual.',
        ],
      },
      {
        heading: 'Use exact models when the setup depends on them',
        paragraphs: [
          'A worked example can help a shopper understand the relationship, but it should not replace the manual for a specific display or arm. Replace sample values with the exact product dimensions, including feet or bases if they remain attached.',
          'The image is a stock workspace scene. It is not a FitWise result, a model specification or a promise that any two monitors fit a particular desk.',
          'The example article does not claim a minimum desk size. If the arm or monitor model changes, replace the old measurement with the current manufacturer drawing and rerun the check.',
        ],
      },
    ],
    references: [
      {
        label: 'Dual 27-inch desk example',
        href: '/workspace/desk-size-for-two-27-inch-monitors/',
      },
      { label: 'Monitor-arm compatibility check', href: '/workspace/monitor-arm-compatibility/' },
      { label: 'Workspace desk-size guide', href: '/workspace/desk-size-guide/' },
    ],
    relatedPageIds: [
      'pi-feature-workspace-hub',
      'pi-p004-desk-size-two-27in',
      'pi-feature-workspace-compatibility',
    ],
  },
  {
    pageIntentId: 'pi-blog-bed-wardrobe-clearance',
    slug: 'bed-and-wardrobe-clearance',
    route: '/blog/bed-and-wardrobe-clearance/',
    cluster: 'bedroom',
    categoryLabel: 'Bedroom',
    title: 'The Bed Fit—Until the Wardrobe Door Opened',
    description:
      'An illustrative bedroom story about checking a bed footprint, actual frame size and a measured wardrobe-door swing.',
    h1: 'The bed fit—until the wardrobe door opened',
    excerpt:
      'A mattress rectangle can clear the walls and still leave another moving part in the room. Measure the frame and the door swing separately.',
    primaryToolHref: '/bedroom/',
    primaryToolLabel: 'Open the Bedroom Fit check',
    primaryToolDescription:
      'Compare a measured room and bed footprint, then optionally check bedside items, wardrobe-door swing or dresser-drawer extension.',
    workedExample: {
      calculator: 'bedroom',
      heading: 'Illustrative inputs: bed frame, two nightstands and a wardrobe swing',
      note: 'All dimensions and selected target clearances are fictional example measurements, not a prescribed bed size or minimum bedroom standard.',
      inputs: [
        { label: 'Room width × length', value: '3,500 × 4,000 mm' },
        {
          label: 'Measured mattress + frame allowance',
          value: '1,520 × 2,030 mm; 25 mm side and 50 mm end allowances',
        },
        { label: 'Two nightstands', value: '400 mm wide × 450 mm deep each' },
        { label: 'Selected side and foot targets', value: '200 mm per side; 300 mm at the foot' },
        {
          label: 'Wardrobe door and obstacle gap',
          value: '600 mm leaf at 90°; 700 mm measured gap',
        },
      ],
      values: {
        bedroom: {
          mattressWidthMm: 1520,
          mattressLengthMm: 2030,
          frameAllowanceMm: { left: 25, right: 25, head: 50, foot: 50 },
          orientation: 'portrait',
          roomWidthMm: 3500,
          roomLengthMm: 4000,
          sideClearanceRecommendedMm: 200,
          footClearanceRecommendedMm: 300,
          nightstandWidthsMm: [400, 400],
          nightstandDepthMm: 450,
        },
        wardrobeDoor: {
          doorLeafWidthMm: 600,
          openingAngleDegrees: 90,
          obstacleGapMm: 700,
        },
      },
    },
    image: {
      sourceUrl:
        'https://images.pexels.com/photos/7535012/pexels-photo-7535012.jpeg?auto=compress&cs=tinysrgb&w=1400',
      sourcePage:
        'https://www.pexels.com/photo/interior-of-bedroom-with-built-in-wardrobe-and-padded-stool-7535012/',
      creator: 'Max Vakhtbovych',
      license: 'Pexels License',
      licenseUrl: PEXELS_LICENSE_URL,
      verifiedOn: BLOG_PREVIEW_DATE,
      width: 4423,
      height: 3200,
      alt: 'Bedroom with a bed, built-in wardrobe and a padded stool',
    },
    sections: [
      {
        heading: 'The bed was only one moving shape',
        paragraphs: [
          'Illustrative composite scenario: Lina checks a bedroom outline and sees enough floor for the bed she planned to buy. When the wardrobe door swings open, it reaches into the bedside space. The mattress did not grow; the sketch had left out the frame and the door’s movement.',
          'Start with the clear inside room dimensions. Use the bed frame’s outside width and length where available; a nominal mattress size is not automatically the same as the outside footprint of the base or frame. Add bedside items only when they are part of the layout you want to check.',
        ],
        bullets: [
          'Measure the room’s clear inside width and depth, including fixed obstructions that reduce the usable rectangle.',
          'Check the outside dimensions of the actual frame/base, not only the mattress label.',
          'Measure bedside tables and the space you choose to reserve beside the bed.',
          'For a hinged wardrobe or drawers, measure the moving leaf/extension and the gap to the bed or obstacle.',
        ],
      },
      {
        heading: 'Measure the door and drawer separately',
        paragraphs: [
          'If the wardrobe is hinged, enter the measured leaf width and opening angle, plus the gap to the bed or other obstacle. If a dresser is part of the plan, check its drawer extension against the measured gap. Those interaction checks describe the values you enter; they are not building-code clearances or general comfort recommendations.',
          'Choose a market-specific bed reference only when it matches the mattress market. US, UK and other labels are not interchangeable. When you know the exact frame or mattress dimensions, use those measured values instead of a guessed preset.',
        ],
      },
      {
        heading: 'What the diagram does—and leaves out',
        paragraphs: [
          'The Bedroom Fit check compares the entered bed footprint with the room and can include bedside tables and optional door/drawer checks. The diagram shows only the shapes it names; it does not model every bedroom object, wall irregularity or furniture move.',
          'The photograph is licensed stock imagery, not a FitWise user’s bedroom. Use the actual room, frame and hinge measurements when making a real purchase or layout decision.',
          'When a size reference is needed, use the page for the correct mattress market and distinguish mattress dimensions from the external frame. The calculator can also work from dimensions you measure yourself.',
        ],
      },
    ],
    references: [
      { label: 'US bed-size dimensions', href: '/bedroom/us-bed-size-dimensions/' },
      { label: 'UK bed-size dimensions', href: '/bedroom/uk-bed-size-dimensions/' },
      { label: 'Bedroom calculation methodology', href: '/methodology/' },
    ],
    relatedPageIds: [
      'pi-feature-bedroom',
      'pi-p039-us-bed-size-dimensions',
      'pi-p040-uk-bed-size-dimensions',
      'pi-feature-rug-fit',
    ],
  },
  {
    pageIntentId: 'pi-blog-fridge-opening-vs-route',
    slug: 'fridge-opening-vs-delivery-route',
    route: '/blog/fridge-opening-vs-delivery-route/',
    cluster: 'appliances',
    categoryLabel: 'Appliances',
    title: 'The Fridge Fit the Niche. The Delivery Route Was a Different Check.',
    description:
      'An illustrative appliance story distinguishing the final cabinet opening from the path a fridge must travel to reach it.',
    h1: 'The fridge fit the niche. The delivery route was a different check.',
    excerpt:
      'The kitchen opening and the hallway route are two different measurements. The appliance manual supplies product-specific installation clearances.',
    primaryToolHref: '/appliances/fridge-fit/',
    primaryToolLabel: 'Open the Fridge Fit check',
    primaryToolDescription:
      'Compare the measured cabinet opening with the fridge dimensions and the exact installation allowances in the product manual.',
    workedExample: {
      calculator: 'appliance-install',
      heading: 'Illustrative inputs: physical opening fit, manual clearance still unknown',
      note: 'The example uses fictional outside/opening measurements. It deliberately leaves the model manual unverified so the tool can demonstrate its Needs information state; zero is not a recommended clearance.',
      inputs: [
        { label: 'Refrigerator outside width × depth × height', value: '900 × 700 × 1,800 mm' },
        { label: 'Cabinet opening width × depth × height', value: '1,000 × 800 × 1,900 mm' },
        {
          label: 'Manual-based installation allowances',
          value: 'Not verified; zero entered only as an unset example',
        },
        { label: 'Clearance source', value: 'Unknown / not checked' },
      ],
      values: {
        itemWidth: 900,
        itemDepth: 700,
        itemHeight: 1800,
        openingWidth: 1000,
        openingDepth: 800,
        openingHeight: 1900,
        sideClearance: 0,
        rearClearance: 0,
        topClearance: 0,
        clearanceSource: 'unknown',
        clearanceManualReference: 'not entered',
        clearanceSpecReference: 'not entered',
      },
    },
    image: {
      sourceUrl:
        'https://images.pexels.com/photos/4933252/pexels-photo-4933252.jpeg?auto=compress&cs=tinysrgb&w=1400',
      sourcePage:
        'https://www.pexels.com/photo/silver-french-door-refrigerator-in-the-kitchen-4933252/',
      creator: 'Curtis Adams',
      license: 'Pexels License',
      licenseUrl: PEXELS_LICENSE_URL,
      verifiedOn: BLOG_PREVIEW_DATE,
      width: 5000,
      height: 3333,
      alt: 'Silver French-door refrigerator in a modern kitchen',
    },
    sections: [
      {
        heading: '“Fits the cabinet” did not answer “gets through the house”',
        paragraphs: [
          'Illustrative composite scenario: Priya checks the kitchen niche against a refrigerator listing and sees a plausible opening match. Later, the delivery team asks about the front door, hallway and turn. The cabinet opening and the route are different parts of the job.',
          'For the final installation, measure the clear opening and the actual appliance dimensions, including handles or other fixed protrusions when they matter. Use the model’s current installation manual for ventilation, hinge, door-swing and other required allowances. Do not substitute a generic gap for a manufacturer-specific instruction.',
        ],
        bullets: [
          'Installation check: opening width, height and depth against the exact fridge model and its manual.',
          'Delivery check: item/package dimensions against every clear route opening and landing.',
          'Handle, hinge or door-removal changes: confirm the exact configuration with the manufacturer or seller.',
          'A cabinet-fit result does not prove that the appliance can pass a corridor turn or stair landing.',
        ],
      },
      {
        heading: 'Check the delivery route as a separate decision',
        paragraphs: [
          'Measure every narrow clear opening on the way in: entrance, hallway, interior door and stair landing if present. Packaging and door removal can change the delivered dimensions, so confirm them with the seller or delivery team. A route measurement comparison does not prove that an item can pivot around a three-dimensional turn.',
          'The Fridge Fit check is for the final opening and model-specific installation values. The Furniture Route Fit check is for the sequence of measured delivery openings. Use the tool that matches the question rather than asking one result to certify both.',
        ],
      },
      {
        heading: 'Read the exact model documentation before installation',
        paragraphs: [
          'Manufacturers can specify different side, top, rear, door-swing or ventilation allowances. This story uses no universal fridge-clearance number. The image is illustrative stock photography, not a FitWise example installation or endorsement by the photographer or appliance brand.',
          'If delivery access depends on removing doors, tilting the appliance, navigating a stair turn or changing the product configuration, have the delivery provider confirm that method before the delivery date.',
        ],
      },
    ],
    references: [
      {
        label: 'GE refrigerator measurement guide',
        href: 'https://www.geappliances.com/ge/refrigerators/refrigerator-measurements.htm',
      },
      { label: 'General appliance installation fit', href: '/appliances/appliance-install-fit/' },
      { label: 'Furniture delivery route fit', href: '/access/furniture-route-fit/' },
    ],
    relatedPageIds: [
      'pi-feature-fridge-fit',
      'pi-feature-appliance-install',
      'pi-feature-furniture-route',
    ],
  },
];

export const BLOG_INDEX_INTENT: PageIntent = {
  id: 'pi-blog-index',
  route: '/blog/',
  family: 'editorial',
  cluster: 'other',
  primaryQuery: 'FitWise blog fit stories and measurement guides',
  entityIds: [],
  status: 'published',
  justification:
    'Local-only review listing for five noindex draft stories; not an indexable content hub.',
};

export const blogPageIntents: PageIntent[] = [
  BLOG_INDEX_INTENT,
  ...BLOG_POSTS.map((post): PageIntent => ({
    id: post.pageIntentId,
    route: post.route,
    family: 'editorial',
    cluster: post.cluster,
    primaryQuery: post.title,
    entityIds: [],
    status: 'draft',
    justification:
      'Owner-requested local review draft. The story uses an illustrative scenario and will remain noindex until its unique-intent/SERP, sourcing and editorial release gates are met.',
  })),
];

export const blogSeoPublications: SeoPublication[] = [
  {
    pageIntentId: BLOG_INDEX_INTENT.id,
    indexable: false,
    title: 'FitWise Blog Preview — Fit Stories for Review',
    description:
      'Local preview of five draft stories about measuring rooms, furniture and delivery routes with FitWise tools.',
    h1: 'Fit stories: the measurements behind everyday fit problems',
    canonicalPath: '/blog/',
    publishedOn: BLOG_PREVIEW_DATE,
    breadcrumbIds: [],
    relatedPageIds: [],
    market: 'global',
    language: 'en',
    sourceIds: [],
    intentEvidence:
      'Local-review-only noindex listing; search demand and SERP evidence have not been approved.',
  },
  ...BLOG_POSTS.map((post): SeoPublication => ({
    pageIntentId: post.pageIntentId,
    indexable: false,
    title: post.title,
    description: post.description,
    h1: post.h1,
    canonicalPath: post.route,
    publishedOn: BLOG_PREVIEW_DATE,
    breadcrumbIds: [],
    relatedPageIds: post.relatedPageIds,
    market: 'global',
    language: 'en',
    imagePath: post.image.sourceUrl,
    sourceIds: [],
    intentEvidence:
      'Local review draft only. It remains noindex pending a completed SEO brief, distinct-intent/SERP evidence, fact check, media attribution and owner editorial approval.',
  })),
];
