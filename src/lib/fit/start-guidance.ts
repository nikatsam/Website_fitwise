import type { FitServiceMode, FitServiceValues } from '../geometry/fit-services';

export type PreparationType = 'required' | 'optional' | 'verification';

export interface BeforeYouStartItem {
  type: PreparationType;
  text: string;
}

const required = (text: string): BeforeYouStartItem => ({ type: 'required', text });
const optional = (text: string): BeforeYouStartItem => ({ type: 'optional', text });
const verification = (text: string): BeforeYouStartItem => ({ type: 'verification', text });

export const CORE_CALCULATOR_START_GUIDANCE = {
  workspace: [
    required('Have the monitor count, screen size and desk dimensions you plan to use.'),
    required(
      'Measure the usable desk top and the actual stand or arm base, not the advertised desk size.',
    ),
    verification(
      'For monitor arms, have the exact display and arm specifications for VESA, weight and clamp limits.',
    ),
  ],
  bedroom: [
    required(
      'Measure the bed frame’s outside footprint, or use the mattress dimensions if the frame is not chosen.',
    ),
    required(
      'Measure the room between finished inside wall surfaces at its narrowest usable points.',
    ),
    optional(
      'Measure bedside furniture and door/drawer projections if you want to check operating space.',
    ),
  ],
  universal: [
    required(
      'Measure the item’s widest, deepest and tallest fixed outside points; include packaging for delivery checks.',
    ),
    required('Measure the usable space or opening at its narrowest clear points.'),
    optional(
      'For an installation or delivery path, gather the current model instructions and each doorway, turn and stair measurement.',
    ),
  ],
  dining: [
    required(
      'Measure the tabletop and the chair footprint in the pulled-out position you expect to use.',
    ),
    required('Measure the usable room inside dimensions, including fixed obstructions.'),
    optional(
      'Choose any extra walking-space target for your layout; it is a planning input, not a universal standard.',
    ),
  ],
  rug: [
    required(
      'Measure the room’s clear inside width/depth and the rug’s actual outside width/depth.',
    ),
    required(
      'If checking furniture coverage, measure the full footprint/use zone or the front-edge overlap you want.',
    ),
    verification(
      'Confirm dimensions on the rug and furniture labels; the diagram is a dimensional comparison, not a floor plan or styling recommendation.',
    ),
  ],
  ceilingFan: [
    required(
      'Measure the room’s width and length, and the floor-to-ceiling height at the fan location.',
    ),
    optional(
      'Find the fan’s blade span and ceiling-to-blade drop on the spec sheet or in the manual.',
    ),
    verification(
      'Confirm the ceiling box is rated for a fan and follow the manual and local electrical rules.',
    ),
  ],
  christmasTree: [
    required('Measure floor to ceiling where the tree will stand.'),
    optional('Check whether the listed tree height includes the stand, and measure your topper.'),
    optional('For floor space, measure the corner or spot and note the tree’s base diameter.'),
  ],
} as const satisfies Record<string, readonly BeforeYouStartItem[]>;

export function getFitServiceStartGuidance(
  mode: FitServiceMode,
  values: FitServiceValues,
): BeforeYouStartItem[] {
  switch (mode) {
    case 'appliance-install':
      return [
        required(
          'Measure the exact appliance outside dimensions and the usable installation opening.',
        ),
        required('Measure the opening’s clear width, depth and height at the narrowest points.'),
        verification(
          'Have the exact model manual or manufacturer specification for required side, rear and ventilation clearances.',
        ),
      ];
    case 'delivery-route':
      return [
        required(
          'Measure the item at its widest, deepest and tallest points, including packaging if it stays on during delivery.',
        ),
        required(
          'Measure each doorway, corridor, turn, stair and landing at its narrowest clear point.',
        ),
        optional(
          'Check the item’s actual handling/orientation plan separately; the route sketch is a dimensional screen.',
        ),
      ];
    case 'workspace-compatibility':
      return [
        required('Measure monitor and base dimensions, desk thickness, usable width and depth.'),
        verification(
          'Have the exact monitor and arm model specifications for VESA pattern, supported weight and clamp limits.',
        ),
        optional(
          'Use the monitor-arm manual to check model-specific clearances and mounting limits.',
        ),
      ];
    case 'tv-fit':
      return values.setup === 'wall'
        ? [
            required('Measure the TV’s outside dimensions and the wall’s usable width and height.'),
            verification(
              'Have the exact TV and mount manuals for VESA pattern, combined load and mounting requirements.',
            ),
            optional(
              'Check wall construction, fasteners, cable locations and installation requirements separately.',
            ),
          ]
        : [
            required('Measure the TV, stand footprint and console’s usable top dimensions.'),
            verification(
              'Have the exact TV and stand manuals for support/load limits and stand-spacing requirements.',
            ),
            optional('Measure cable, rear ventilation and wall clearances you need to preserve.'),
          ];
    case 'home-gym':
      return [
        required(
          'Have the exact equipment dimensions and measure usable floor area and ceiling height.',
        ),
        verification(
          'Check the manufacturer’s operating/access-zone requirements, anchoring instructions and floor-loading data.',
        ),
        optional('Choose any extra side, front or overhead working space you want to reserve.'),
      ];
    case 'storage':
      return [
        required(
          'Measure each object’s outside width, depth and height and decide whether it is stored upright or flat.',
        ),
        required(
          'Measure usable interior dimensions around shelves, posts, doors and other fixed obstructions.',
        ),
        optional(
          'Choose an aisle target for your access needs; capacity is a simplified single-layer estimate.',
        ),
      ];
    case 'pool-room':
      return [
        required('Use the table’s exact outside dimensions and the cue length you plan to use.'),
        required('Measure clear room width and length between fixed obstructions.'),
        optional(
          'Use table/cue manufacturer dimensions where available; the cue envelope is a plan-view estimate.',
        ),
      ];
    case 'vehicle-garage':
      return [
        required(
          'Measure the actual vehicle width and length, including mirrors or accessories that stay on while parking.',
        ),
        required(
          'Measure the garage’s inside dimensions and the clear door opening, not its nominal size.',
        ),
        optional(
          'Choose side-door and front/rear access targets; approach angle and turning path are not modeled.',
        ),
      ];
    case 'garden-structure':
      return [
        required(
          'Measure the structure body, roof overhang, door swing and any maintenance space separately.',
        ),
        required('Measure usable plot width and depth between boundaries and fixed obstacles.'),
        verification(
          'Check the exact manufacturer installation instructions and local planning requirements separately.',
        ),
      ];
    case 'garden-patio-dining':
      return [
        required(
          'Measure the table, pulled-out chair envelope and usable patio or gazebo dimensions.',
        ),
        optional('Choose the seating arrangement and any walking space you want to reserve.'),
        verification(
          'Use actual furniture dimensions; the sketch does not model chair angles or a universal seating standard.',
        ),
      ];
    case 'garden-shed-storage':
      return [
        required(
          'Measure the shed’s clear inside dimensions, door opening and fixed shelves or posts.',
        ),
        required('Measure each stored object and decide whether it is stored upright or flat.'),
        optional(
          'Choose the access aisle and item spacing; the estimate does not model stacking or load limits.',
        ),
      ];
    case 'garden-greenhouse':
      return [
        required('Measure the greenhouse outside footprint, roof overhang and clear inside aisle.'),
        required('Measure usable plot width and depth from actual boundaries and obstacles.'),
        verification(
          'Use the exact model manual for assembly, anchoring and ventilation requirements.',
        ),
      ];
    case 'garden-hot-tub':
      return [
        required('Measure the exact tub footprint, patio area and cover-lift path/height.'),
        verification(
          'Consult the exact tub manual for service-panel and cover clearance requirements.',
        ),
        verification(
          'Use the manual and qualified installers for electrical, foundation, delivery and safety requirements.',
        ),
      ];
    case 'garden-outdoor-kitchen':
      return [
        required(
          'Measure the full kitchen run, appliance projections, patio area and usable overhead height.',
        ),
        verification(
          'Reserve work and service clearances from the exact manufacturer instructions.',
        ),
        verification(
          'Check fuel, electrical, heat and local installation requirements separately.',
        ),
      ];
    case 'garden-play-equipment':
      return [
        required(
          'Have the exact equipment model instructions and its manufacturer-defined use-zone dimensions.',
        ),
        required(
          'Measure the usable plot around the full use zone, not only the equipment footprint.',
        ),
        verification(
          'Check required impact-attenuating surface and installation rules with the manufacturer and relevant authority.',
        ),
      ];
  }
}
