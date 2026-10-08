import type {
  BedEntity,
  DeskEntity,
  DisplayEntity,
  Entity,
  FurnitureEntity,
  PageIntent,
} from '../../types';
import type { Dataset } from '../validation/dataset';
import type { FamilyAnswer, FamilyFact } from './build-family-answer';

function requireEntity<T extends Entity['category']>(
  dataset: Dataset,
  intent: PageIntent,
  category: T,
): Extract<Entity, { category: T }> {
  const entity = intent.entityIds
    .map((id) => dataset.entities.find((candidate) => candidate.id === id))
    .find((candidate) => candidate?.category === category);
  if (!entity) {
    throw new Error(`Planning example '${intent.id}' needs a '${category}' entity.`);
  }
  return entity as Extract<Entity, { category: T }>;
}

function sourceRecords(dataset: Dataset, ids: Array<string | undefined>) {
  const wanted = new Set(ids.filter((id): id is string => id !== undefined));
  return dataset.sources.filter((source) => wanted.has(source.id));
}

function measurementSourceId(measurement: { sourceId?: string } | undefined): string | undefined {
  return measurement?.sourceId;
}

function millimetreLabel(valueMm: number): string {
  return `${Number(valueMm.toFixed(1))} mm`;
}

function bedFrameDimensions(bed: BedEntity) {
  const frame = bed.defaultFrameAllowanceMm;
  return {
    widthMm: bed.mattressWidthMm.valueMm + (frame?.left.valueMm ?? 0) + (frame?.right.valueMm ?? 0),
    lengthMm:
      bed.mattressLengthMm.valueMm + (frame?.head.valueMm ?? 0) + (frame?.foot.valueMm ?? 0),
  };
}

function monitorDepthAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const display = requireEntity(dataset, intent, 'display') as DisplayEntity;
  const desk = requireEntity(dataset, intent, 'desk') as DeskEntity;
  const standDepthMm = display.standDepthMm?.valueMm;
  const displayDepthMm = display.overallDepthMm?.valueMm;
  const deskDepthMm = desk.depthMm?.valueMm;
  if (standDepthMm === undefined || displayDepthMm === undefined || deskDepthMm === undefined) {
    throw new Error(`Monitor depth example '${intent.id}' is missing a sourced depth measurement.`);
  }
  const remainingSurfaceMm = Math.max(0, deskDepthMm - standDepthMm);
  const facts: FamilyFact[] = [
    { label: 'Model-specific width with stand', valueMm: display.overallWidthMm?.valueMm },
    { label: 'Monitor depth with stand', valueMm: standDepthMm },
    { label: 'Monitor body depth without stand', valueMm: displayDepthMm },
    { label: 'Nominal reference desk depth', valueMm: deskDepthMm },
    {
      label: 'Desktop surface in front of stand if flush to rear edge',
      valueMm: remainingSurfaceMm,
      note: 'Geometric remainder only; not viewing distance or keyboard/cable clearance.',
    },
    {
      label: 'CCOHS average resting point of accommodation',
      valueMm: 800,
      note: 'A physiological reference, not a required screen distance or desk-depth minimum.',
    },
    {
      label: 'Cable, plug and ventilation space',
      valueText:
        'Measure the exact plug/cable bend and follow the monitor manual; no generic allowance is applied.',
    },
  ];
  const sources = sourceRecords(dataset, [
    measurementSourceId(display.overallWidthMm),
    measurementSourceId(display.overallDepthMm),
    measurementSourceId(display.standDepthMm),
    measurementSourceId(desk.depthMm),
    'src-ccohs-monitor-positioning',
  ]);

  return {
    intro: `A Samsung Smart Monitor M7 M70B example shows why a monitor's screen size is not desk depth: the sourced base is ${millimetreLabel(standDepthMm)} deep, while the panel without its stand is ${millimetreLabel(displayDepthMm)} deep. On a nominal ${millimetreLabel(deskDepthMm)} desk, placing that base flush to the rear leaves ${millimetreLabel(remainingSurfaceMm)} of desktop in front of it. That remainder does not establish a comfortable viewing distance or fit for a keyboard, cable bend or other equipment.`,
    sections: [
      {
        title: 'Measure the complete workstation, not the screen diagonal',
        facts,
        assumptions: [
          'The Samsung figures are one model-specific M70B example; other monitor bodies and stands differ.',
          'CCOHS says viewing-distance recommendations vary. Its approximately 80 cm resting-point-of-accommodation figure is physiological context, not a universal workstation minimum; arm length is only a starting estimate.',
          'Eye-to-screen distance is measured from the user’s eyes to the screen, not from the desk front edge. User posture, keyboard/mouse position, cable connectors and monitor ventilation are not modeled.',
          'No universal total desk-depth minimum is asserted. Measure the actual setup and keep the desk depth, stand footprint, viewing distance and cable/keyboard zones distinct.',
        ],
      },
    ],
    sources,
  };
}

function chairAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const chair = requireEntity(dataset, intent, 'furniture') as FurnitureEntity;
  if (chair.furnitureType !== 'office-chair' || !chair.seatDepthMm) {
    throw new Error(`Chair example '${intent.id}' needs outer and seat dimensions.`);
  }
  const sources = sourceRecords(dataset, [
    measurementSourceId(chair.overallWidthMm),
    measurementSourceId(chair.overallDepthMm),
    measurementSourceId(chair.overallHeightMm),
    measurementSourceId(chair.seatDepthMm),
    'src-ccohs-ergonomic-chair',
  ]);
  return {
    intro: `A Herman Miller Aeron Size B example has a maximum published outer footprint of about ${millimetreLabel(chair.overallWidthMm.valueMm)} wide by ${millimetreLabel(chair.overallDepthMm.valueMm)} deep, depending on arm configuration. That is the chair body, not the space needed to pull back, turn or walk behind it. CCOHS says a chair must suit the user's body, workstation and task and gives no universal numeric movement clearance.`,
    sections: [
      {
        title: 'A manufacturer-measured chair example',
        facts: [
          { label: 'Maximum listed outer width', valueMm: chair.overallWidthMm.valueMm },
          { label: 'Maximum listed overall depth', valueMm: chair.overallDepthMm.valueMm },
          { label: 'Maximum listed overall height', valueMm: chair.overallHeightMm.valueMm },
          { label: 'Seat depth', valueMm: chair.seatDepthMm.valueMm },
          {
            label: 'Movement/pull-back zone',
            valueText: 'User- and task-selected; no universal numeric minimum is assumed.',
          },
        ],
        assumptions: [
          'The outer width/depth use the maximum of the manufacturer-published Size B range so the example does not understate its footprint.',
          "For a chair parked fully outside a desk, add the user's chosen pull-back zone to the measured chair projection. If the chair tucks under the desk, measure the exposed projection in that actual configuration instead of adding the entire chair depth.",
          'A clear route, turning space, armrest width and floor/caster behavior depend on the person and room; this page does not convert them into a code or ergonomic minimum.',
        ],
      },
    ],
    sources,
  };
}

function wardrobeAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const wardrobe = requireEntity(dataset, intent, 'furniture') as FurnitureEntity;
  if (wardrobe.furnitureType !== 'wardrobe' || !wardrobe.doorLeafWidthMm) {
    throw new Error(`Wardrobe example '${intent.id}' needs a sourced hinged-door width.`);
  }
  const sweepMm = wardrobe.doorLeafWidthMm.valueMm;
  const sources = sourceRecords(dataset, [
    measurementSourceId(wardrobe.overallWidthMm),
    measurementSourceId(wardrobe.overallDepthMm),
    measurementSourceId(wardrobe.overallHeightMm),
    measurementSourceId(wardrobe.doorLeafWidthMm),
  ]);
  return {
    intro: `This US-market IKEA PAX/GRIMO two-door wardrobe example measures the door sweep to compare with a bed in the actual room. Each GRIMO leaf is ${millimetreLabel(sweepMm)} wide, so at a 90-degree opening it sweeps approximately ${millimetreLabel(sweepMm)} out from the wardrobe face. It is a product-specific collision envelope, not a paired bed/wardrobe room plan and not a recommended walking aisle or room-size minimum.`,
    sections: [
      {
        title: 'Measured wardrobe and door envelope',
        facts: [
          { label: 'Wardrobe outer width', valueMm: wardrobe.overallWidthMm.valueMm },
          { label: 'Wardrobe outer depth', valueMm: wardrobe.overallDepthMm.valueMm },
          { label: 'One hinged door leaf', valueMm: wardrobe.doorLeafWidthMm.valueMm },
          {
            label: 'Door projection at 90 degrees',
            valueMm: sweepMm,
            note: 'Geometric estimate from the sourced leaf width.',
          },
        ],
        assumptions: [
          'At 90 degrees, a hinged panel projects approximately its width from the hinge line; actual handle, hinge and opening-stop details vary.',
          'Only the wardrobe product is dimensioned here. Measure the actual bed/frame position and other obstacles to determine whether they intersect the swing path.',
          'The calculation does not provide a complete room plan or add a walking/access lane.',
        ],
      },
    ],
    sources,
  };
}

function dresserAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const dresser = requireEntity(dataset, intent, 'furniture') as FurnitureEntity;
  const bed = requireEntity(dataset, intent, 'bed') as BedEntity;
  if (dresser.furnitureType !== 'dresser' || !dresser.drawerPulloutMm) {
    throw new Error(`Dresser example '${intent.id}' needs a sourced drawer-pullout measurement.`);
  }
  const frame = bedFrameDimensions(bed);
  const wallToOpenFrontMm = dresser.overallDepthMm.valueMm + dresser.drawerPulloutMm.valueMm;
  const sources = sourceRecords(dataset, [
    measurementSourceId(dresser.overallWidthMm),
    measurementSourceId(dresser.overallDepthMm),
    measurementSourceId(dresser.overallHeightMm),
    measurementSourceId(dresser.drawerPulloutMm),
    measurementSourceId(bed.mattressWidthMm),
    measurementSourceId(bed.mattressLengthMm),
  ]);
  return {
    intro: `The IKEA HEMNES 8-drawer example has a ${millimetreLabel(dresser.overallDepthMm.valueMm)} closed depth and a manufacturer-listed ${millimetreLabel(dresser.drawerPulloutMm.valueMm)} drawer pull-out. If its back is flush to a wall, the fully extended drawer reaches about ${millimetreLabel(wallToOpenFrontMm)} from that wall. Keep the drawer's extension path clear; this is not a standing or walking allowance.`,
    sections: [
      {
        title: 'Drawer extension and bed example',
        facts: [
          { label: 'Dresser outer width', valueMm: dresser.overallWidthMm.valueMm },
          { label: 'Dresser closed depth', valueMm: dresser.overallDepthMm.valueMm },
          { label: 'Drawer pull-out', valueMm: dresser.drawerPulloutMm.valueMm },
          {
            label: 'Wall to fully extended drawer front (dresser flush to wall)',
            valueMm: wallToOpenFrontMm,
          },
          { label: `${bed.frameModelName} outer frame width`, valueMm: frame.widthMm },
          { label: `${bed.frameModelName} outer frame length`, valueMm: frame.lengthMm },
        ],
        assumptions: [
          "The drawer extension is the product's listed pull-out measurement; other dressers and slides differ.",
          'The wall-to-front calculation assumes the dresser back is flush to the wall. The bed is a measured UK Standard Double example; the room orientation is not modeled.',
          'The open-drawer collision zone is separate from a user-selected standing/working area; no universal access minimum is asserted.',
        ],
      },
    ],
    sources,
  };
}

function nightstandAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const bed = requireEntity(dataset, intent, 'bed') as BedEntity;
  const table = requireEntity(dataset, intent, 'furniture') as FurnitureEntity;
  if (table.furnitureType !== 'bedside-table') {
    throw new Error(`Nightstand example '${intent.id}' needs a sourced bedside table.`);
  }
  const combinedWidthMm = bed.mattressWidthMm.valueMm + table.overallWidthMm.valueMm * 2;
  const sources = sourceRecords(dataset, [
    measurementSourceId(bed.mattressWidthMm),
    measurementSourceId(bed.mattressLengthMm),
    measurementSourceId(table.overallWidthMm),
    measurementSourceId(table.overallDepthMm),
    measurementSourceId(table.overallHeightMm),
  ]);
  return {
    intro: `${bed.name} plus two ${table.name} units have a combined object width of ${millimetreLabel(combinedWidthMm)} if the tables sit flush to the mattress edges with no gaps. This is a furniture-footprint sum, not a room-size recommendation: it excludes a bed frame, spacing between items, wall-side access and walking clearance.`,
    sections: [
      {
        title: 'Bed and bedside-table footprints',
        facts: [
          { label: 'Market', valueText: bed.market },
          { label: 'Bed mattress width', valueMm: bed.mattressWidthMm.valueMm },
          { label: 'Bed mattress length', valueMm: bed.mattressLengthMm.valueMm },
          { label: `${table.name} width (each)`, valueMm: table.overallWidthMm.valueMm },
          { label: `${table.name} depth (each)`, valueMm: table.overallDepthMm.valueMm },
          { label: 'Combined width (bed + two tables, zero gaps)', valueMm: combinedWidthMm },
        ],
        assumptions: [
          'The bed is a nominal US mattress footprint; no US frame dimensions were sourced for this example.',
          'The bedside table is a measured UK IKEA model. It is a dimensional example, not a matched manufacturer bedroom set for the US bed.',
          'No walking/standing allowance or gap is included. Measure the chosen frame and desired access on both sides before deciding whether a layout works.',
        ],
      },
    ],
    sources,
  };
}

export function buildFurniturePlanningAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  switch (intent.id) {
    case 'pi-p015-desk-depth-for-monitor':
      return monitorDepthAnswer(intent, dataset);
    case 'pi-p018-desk-chair-clearance':
      return chairAnswer(intent, dataset);
    case 'pi-p034-space-bed-wardrobe':
      return wardrobeAnswer(intent, dataset);
    case 'pi-p035-bed-dresser-clearance':
      return dresserAnswer(intent, dataset);
    case 'pi-p036-king-bed-nightstands-room':
    case 'pi-p037-queen-bed-nightstands-room':
      return nightstandAnswer(intent, dataset);
    default:
      throw new Error(`No sourced planning answer configured for '${intent.id}'.`);
  }
}
