import type { FitServiceMode, FitServiceValues } from '../geometry/fit-services';

export const CORE_CALCULATOR_START_GUIDANCE = {
  workspace: [
    'Have the monitor count, screen size and desk dimensions you plan to use.',
    'Measure the usable desk top and the actual stand or arm base, not the advertised desk size.',
    'For monitor arms, have the exact display and arm specifications for VESA, weight and clamp limits.',
  ],
  bedroom: [
    'Measure the bed frame’s outside footprint, or use the mattress dimensions if the frame is not chosen.',
    'Measure the room between finished inside wall surfaces at its narrowest usable points.',
    'Measure bedside furniture and door/drawer projections if you want to check operating space.',
  ],
  universal: [
    'Measure the item’s widest, deepest and tallest fixed outside points; include packaging for delivery checks.',
    'Measure the usable space or opening at its narrowest clear points.',
    'For an installation or delivery path, have current model instructions and each doorway, turn and stair measurement ready.',
  ],
  dining: [
    'Measure the tabletop and the chair footprint in the pulled-out position you expect to use.',
    'Measure the usable room inside dimensions, including fixed obstructions.',
    'Choose any extra walking-space target for your layout; it is a planning input, not a universal standard.',
  ],
} as const;

const GENERAL_MEASUREMENTS =
  'Measure the usable space at its narrowest inside points, including fixed obstructions.';

export function getFitServiceStartGuidance(
  mode: FitServiceMode,
  values: FitServiceValues,
): string[] {
  switch (mode) {
    case 'appliance-install':
      return [
        'Measure the exact appliance outside dimensions and the usable installation opening.',
        'Have the exact model’s installation manual or specification open for required side, rear and ventilation clearances.',
        GENERAL_MEASUREMENTS,
      ];
    case 'delivery-route':
      return [
        'Measure the item at its widest, deepest and tallest points, including packaging if it stays on during delivery.',
        'Measure each doorway, corridor, turn, stair and landing at its narrowest clear point.',
        'Check the item’s actual handling/orientation plan separately; the route sketch is a dimensional screen.',
      ];
    case 'workspace-compatibility':
      return [
        'Have the exact monitor and arm model specifications for VESA pattern, supported weight and clamp limits.',
        'Measure monitor and base dimensions, desk thickness, usable width and depth.',
        'Use the monitor-arm manual for model-specific clearances and mounting limits.',
      ];
    case 'tv-fit':
      return values.setup === 'wall'
        ? [
            'Have the exact TV and mount manuals for VESA pattern, combined load and mounting requirements.',
            'Measure the wall’s usable width and height and the TV’s outside dimensions.',
            'Check wall construction, fasteners, cable locations and installation requirements separately.',
          ]
        : [
            'Measure the TV, stand footprint and console’s usable top dimensions.',
            'Have the exact TV and stand manuals for support/load limits and any stand-spacing requirements.',
            'Measure cable, rear ventilation and wall clearances you need to preserve.',
          ];
    case 'home-gym':
      return [
        'Have the exact equipment dimensions and its manufacturer’s operating and access-zone requirements.',
        'Measure usable floor area and ceiling height, including fixed obstructions.',
        'Check anchoring, floor loading and installation requirements separately from the footprint result.',
      ];
    case 'storage':
      return [
        'Measure each object’s outside width, depth and height and decide whether it is stored upright or flat.',
        'Measure usable interior dimensions around shelves, posts, doors and other fixed obstructions.',
        'Choose an aisle target for your access needs; capacity is a simplified single-layer estimate.',
      ];
    case 'pool-room':
      return [
        'Use the table’s exact outside dimensions and the cue length you plan to use.',
        'Measure clear room width and length between fixed obstructions.',
        'Use the table/cue manufacturer’s dimensions where available; the cue envelope is a plan-view estimate.',
      ];
    case 'vehicle-garage':
      return [
        'Measure the actual vehicle width and length, including mirrors or accessories that stay on while parking.',
        'Measure the garage’s inside dimensions and the clear door opening, not its nominal size.',
        'Choose side-door and front/rear access targets; approach angle and turning path are not modeled.',
      ];
    case 'garden-structure':
      return [
        'Measure the structure body and any roof overhang, door swing and maintenance access separately.',
        'Measure usable plot width and depth between boundaries and fixed obstacles.',
        'Check the exact manufacturer installation instructions and local planning requirements separately.',
      ];
    case 'garden-patio-dining':
      return CORE_CALCULATOR_START_GUIDANCE.dining.slice();
    case 'garden-shed-storage':
      return [
        'Measure the shed’s clear inside dimensions, door opening and any shelves or posts.',
        'Measure each stored object and the access aisle you want to keep clear.',
        'Capacity is a single-layer estimate; it does not model stacking or load limits.',
      ];
    case 'garden-greenhouse':
      return [
        'Measure the greenhouse outside footprint, roof overhang and clear inside aisle.',
        'Measure usable plot width and depth from the actual boundaries and obstacles.',
        'Use the exact model manual for assembly, anchoring and ventilation requirements.',
      ];
    case 'garden-hot-tub':
      return [
        'Measure the exact tub footprint and the cover-lift path/height from its model instructions.',
        'Measure the patio’s usable area and the service-panel access you need to preserve.',
        'Consult the tub manual and qualified installers for electrical, foundation, delivery and safety requirements.',
      ];
    case 'garden-outdoor-kitchen':
      return [
        'Measure the full kitchen run, appliance projections and usable overhead height.',
        'Measure the patio and reserve the work and service clearances from the exact manufacturer instructions.',
        'Check fuel, electrical, heat and local installation requirements separately.',
      ];
    case 'garden-play-equipment':
      return [
        'Have the exact equipment model instructions and its manufacturer-defined use-zone dimensions.',
        'Measure the usable plot around the full use zone, not only the equipment footprint.',
        'Check required impact-attenuating surface and installation rules with the manufacturer and relevant authority.',
      ];
  }
}
