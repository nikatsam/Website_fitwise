import type { FitServiceFieldType, FitServiceMode } from '../geometry/fit-services';

export type MeasurementDiagram = 'fixed-span' | 'clearance-envelope' | 'route' | 'operating-zone';
export type CoreCalculator = 'universal' | 'workspace' | 'bedroom' | 'dining';

export interface MeasurementGuidance {
  label: string;
  summary: string;
  detail: string;
  example: string;
  diagram?: MeasurementDiagram;
}

function defaultExample(
  label: string,
  summary: string,
  detail: string,
  diagram?: MeasurementDiagram,
): string {
  const copy = `${label} ${summary} ${detail}`.toLowerCase();
  if (diagram === 'route') {
    return 'For example, the doorway, corridor and turn can each have a different narrow point.';
  }
  if (diagram === 'operating-zone') {
    return 'For example, follow the exact model diagram to distinguish front, rear and side boundaries.';
  }
  if (diagram === 'clearance-envelope') {
    return 'For example, keep the chosen extra space separate from the item’s measured footprint.';
  }
  if (/candidate sizes?/.test(copy)) {
    return 'For example, 2.4 m width by 1.8 m depth is one illustrative row, not a recommended structure size.';
  }
  if (/manual|manufacturer|specification|vesa|reference/.test(copy)) {
    return 'For example, record the exact manual section/page used; a similar model may list different values.';
  }
  if (/orientation|aspect ratio|angle|direction/.test(copy)) {
    return 'For example, rotating a rectangular item swaps which edge is compared with the space width.';
  }
  if (/inside|opening|room|garage|plot|patio|usable|space/.test(copy)) {
    return 'For example, a nominal frame width can exceed the clear opening measured between its inside edges.';
  }
  return 'For example, include a fixed handle or bezel that extends beyond the main body.';
}

const makeGuidance = (
  label: string,
  summary: string,
  detail: string,
  diagram?: MeasurementDiagram,
  example?: string,
): MeasurementGuidance => ({
  label,
  summary,
  detail,
  example: example ?? defaultExample(label, summary, detail, diagram),
  diagram,
});

const OUTSIDE_DIMENSION = makeGuidance(
  'How to measure the outside dimension',
  'Measure between the item’s fixed outermost points in the orientation shown.',
  'Include fixed handles, trim or projections. Use the exact model dimensions where available; do not substitute a nominal size for the measured outside size.',
  'fixed-span',
);

const USABLE_INSIDE_SPAN = makeGuidance(
  'How to measure the usable inside span',
  'Measure between the fixed inside faces at the narrowest usable point.',
  'Measure clear space between wall, frame or obstruction surfaces—not the advertised or nominal outside dimension.',
  'fixed-span',
);

const SOURCE_REFERENCE = makeGuidance(
  'Where to find the exact specification',
  'Use the current instructions or specification for the exact make and model.',
  'Select the source type, then enter the manual section/page or manufacturer specification reference. Do not use a value from a different model.',
);

const USER_SELECTED_ALLOWANCE = makeGuidance(
  'How to enter this allowance',
  'Measure from the named item edge to the space or obstruction edge.',
  'Enter only the additional space you want to reserve. This is a user-selected planning target, not a universal minimum or safety standard.',
  'clearance-envelope',
);

export const CORE_MEASUREMENT_GUIDANCE: Record<
  CoreCalculator,
  Record<string, MeasurementGuidance>
> = {
  universal: {
    'fit-item-width': OUTSIDE_DIMENSION,
    'fit-item-depth': makeGuidance(
      'How to measure item depth',
      'Measure from the front-most to rear-most fixed outside point.',
      'Keep the item in one orientation for width, depth and height. Include packaging when it remains on for a delivery check.',
      'fixed-span',
    ),
    'fit-item-height': makeGuidance(
      'How to measure item height',
      'Measure vertically from its lowest to highest fixed point.',
      'Include fixed feet, handles or top projections. For a route check, separately include packaging if it stays on.',
      'fixed-span',
    ),
    'fit-space-width': USABLE_INSIDE_SPAN,
    'fit-space-depth': makeGuidance(
      'How to measure usable space depth',
      'Measure the clear distance from the front inside edge to the rear inside edge.',
      'Measure at the narrowest usable point, including fixed obstructions.',
      'fixed-span',
    ),
    'fit-space-height': makeGuidance(
      'How to measure usable space height',
      'Measure from the finished floor or base to the lowest fixed overhead obstruction.',
      'Use the lowest usable clear height, not the ceiling height at an unobstructed point.',
      'fixed-span',
    ),
    'fit-clearance': makeGuidance(
      'How to choose extra clearance',
      'Enter additional space beyond the item on each side.',
      'This value is your planning choice. It is added outside the object footprint and is not a universal access, code or safety standard.',
      'clearance-envelope',
    ),
    'fit-orientation': makeGuidance(
      'How orientation changes the result',
      'Choose which item edge is aligned with the room width and length.',
      'The tool rotates the rectangular footprint; it does not model lifting, tilting or turning an item through a doorway.',
    ),
    'fit-door-width': makeGuidance(
      'How to measure clear doorway width',
      'Measure between the narrowest fixed inside edges of the open doorway.',
      'Measure usable clearance, accounting for stops or hardware that remain in the opening. Nominal door size may be larger.',
      'fixed-span',
    ),
    'fit-door-height': makeGuidance(
      'How to measure clear doorway height',
      'Measure vertically from the top of the clear threshold to the lowest fixed part of the open frame.',
      'Use the usable opening, including any fixed stop or hardware that reduces clearance.',
      'fixed-span',
    ),
    'fit-corridor-width': makeGuidance(
      'How to measure corridor width',
      'Measure the narrowest clear distance between fixed walls or obstacles.',
      'Check each pinch point along the route separately; one corridor width does not describe a turn or landing.',
      'route',
    ),
    'fit-item-gap': makeGuidance(
      'How to measure the gap between items',
      'Measure edge-to-edge between the adjacent item footprints.',
      'This is a spacing input between objects, not extra space around the room perimeter.',
      'fixed-span',
    ),
  },
  workspace: {
    'desk-width': makeGuidance(
      'How to measure desk width',
      'Measure the usable top between its fixed side edges, not the outside frame.',
      'Include any fixed trim that reduces the surface available to place the monitor stands.',
      'fixed-span',
    ),
    'desk-depth': makeGuidance(
      'How to measure desk depth',
      'Measure the usable top from its front edge to the rear edge.',
      'Do not include space behind the desk or beyond the usable surface.',
      'fixed-span',
    ),
    'monitor-depth': makeGuidance(
      'How to measure the monitor base',
      'Measure from its front-most to rear-most fixed edge; use the exact stand or arm base in your setup.',
      'The 200 mm example is an editable placeholder, not a standard. Replace it with your model’s measured depth.',
      'fixed-span',
    ),
    'rear-cable-clearance': makeGuidance(
      'What rear cable space includes',
      'Measure the extra desk depth you want to reserve behind the base for cables or airflow.',
      'Use exact monitor instructions when ventilation clearances apply. Zero means no extra rear reserve is included.',
      'clearance-envelope',
    ),
    'keyboard-zone': makeGuidance(
      'What the keyboard/mouse zone includes',
      'Measure the front-to-back space you want reserved in front of the monitor base.',
      'This is a user-selected working-space target, not viewing distance or an ergonomic recommendation. Zero excludes that extra reserve.',
      'clearance-envelope',
    ),
    'monitor-width-override': makeGuidance(
      'When to override estimated monitor width',
      'Enter the monitor’s full outside width, including bezel, rather than screen-only width.',
      'Use the manufacturer’s full product dimensions or measure the monitor body. The screen-width estimate derived from diagonal and aspect ratio is approximate.',
      'fixed-span',
    ),
    'monitor-gap': makeGuidance(
      'How to measure the monitor gap',
      'Measure the edge-to-edge gap between adjacent monitor bodies.',
      'Do not measure from screen centers or include a side margin here.',
      'fixed-span',
    ),
    'side-margin': makeGuidance(
      'How to use the side margin target',
      'Enter extra space you want between the monitor group and each desk edge.',
      'This is a user-selected target, not a standard. It is applied outside the combined monitor footprint.',
      'clearance-envelope',
    ),
    'monitor-diagonal': makeGuidance(
      'What monitor diagonal means',
      'Use the screen’s diagonal measurement, not its outside width.',
      'The tool estimates screen width from diagonal and aspect ratio; check full product width or enter an override for the monitor body.',
    ),
    'monitor-aspect-ratio': makeGuidance(
      'Where to find screen aspect ratio',
      'Use the display’s listed screen ratio, such as 16:9 or 21:9.',
      'The ratio describes the visible screen, not the monitor’s full outside dimensions.',
    ),
  },
  bedroom: {
    'room-width': USABLE_INSIDE_SPAN,
    'room-length': makeGuidance(
      'How to measure inside room length',
      'Measure between finished inside wall surfaces using the same reference as room width.',
      'Use the narrowest usable span where fixed trim, a chimney breast or another obstruction reduces space.',
      'fixed-span',
    ),
    'bed-preset': makeGuidance(
      'What the bed preset represents',
      'A market size describes a mattress reference; a named frame uses the listed model’s outside dimensions.',
      'If the frame is not listed or its dimensions differ, choose custom mattress dimensions and allow for the actual frame separately.',
    ),
    'custom-bed-width': makeGuidance(
      'How to measure mattress width',
      'Measure the mattress from outside edge to outside edge across its width.',
      'Mattress size is not the same as the complete bed-frame footprint; use a named measured frame when available.',
      'fixed-span',
    ),
    'custom-bed-length': makeGuidance(
      'How to measure mattress length',
      'Measure the mattress from head end to foot end, outside edge to outside edge.',
      'Mattress size is not the same as the complete bed-frame footprint.',
      'fixed-span',
    ),
    'side-clearance': makeGuidance(
      'How to choose side clearance',
      'Enter the extra space you want beyond each side of the bed footprint.',
      'This is a user-selected planning target, not a code minimum or universal recommendation.',
      'clearance-envelope',
    ),
    'foot-clearance': makeGuidance(
      'How to choose foot clearance',
      'Measure from the bed’s foot edge to the wall or fixed obstacle.',
      'Enter only the additional distance you want to reserve. The tool does not present one universal walking clearance.',
      'clearance-envelope',
    ),
    'nightstand-width': makeGuidance(
      'How to measure nightstand width',
      'Measure the outside width of the bedside table at its widest fixed point.',
      'Use the furniture body dimensions, not drawer capacity or advertised top size.',
      'fixed-span',
    ),
    'nightstand-depth': makeGuidance(
      'How to measure nightstand depth',
      'Measure from the front-most to rear-most fixed outside edge.',
      'Include any fixed projection that remains beside the bed.',
      'fixed-span',
    ),
    'wardrobe-door-width': makeGuidance(
      'How to measure wardrobe door leaf width',
      'Measure the hinged leaf from its hinge/pivot edge to its free edge.',
      'This is the door leaf width used to sketch its swing; it does not include a walking or standing zone.',
      'clearance-envelope',
    ),
    'wardrobe-door-angle': makeGuidance(
      'How to set the door opening angle',
      'Enter the actual or desired angle between the closed door and open door.',
      'The result is a geometric swing estimate; it does not assess hardware stops or a safe operating space.',
    ),
    'wardrobe-obstacle-gap': makeGuidance(
      'How to measure the wardrobe obstacle gap',
      'Measure from the wardrobe door’s pivot face to the bed or other obstacle.',
      'The check compares the open door envelope only. It does not add standing or walking allowance.',
      'clearance-envelope',
    ),
    'dresser-drawer-pullout': makeGuidance(
      'How to measure drawer pullout',
      'Measure from the closed drawer front to its outermost front edge when fully extended.',
      'Use the drawer’s actual full extension; the check compares the drawer envelope only.',
      'clearance-envelope',
    ),
    'dresser-obstacle-gap': makeGuidance(
      'How to measure the dresser obstacle gap',
      'Measure from the dresser front to the bed or other fixed obstacle.',
      'The check compares an open drawer envelope only. It does not add standing or walking allowance.',
      'clearance-envelope',
    ),
  },
  dining: {
    'dining-table-width': makeGuidance(
      'How to measure table width',
      'Measure across the tabletop at its widest point; chair space is calculated separately.',
      'Use the outside edge-to-edge dimension of the rectangular tabletop.',
      'fixed-span',
    ),
    'dining-table-length': makeGuidance(
      'How to measure table length',
      'Measure the rectangular tabletop from one end edge to the other.',
      'This is the table body dimension; pulled-out chair space is calculated separately.',
      'fixed-span',
    ),
    'dining-room-width': USABLE_INSIDE_SPAN,
    'dining-room-length': makeGuidance(
      'How to measure dining-room length',
      'Measure the usable clear distance between the finished inside boundaries.',
      'Use the narrowest span where fixed cabinetry, columns or other obstructions reduce space.',
      'fixed-span',
    ),
    'dining-chair-width': makeGuidance(
      'How to measure chair width',
      'Measure the chair’s outside width at its widest fixed point.',
      'Use the widest part of the chair body, not the seat width alone.',
      'fixed-span',
    ),
    'dining-chair-depth': makeGuidance(
      'How to measure the pulled-out chair envelope',
      'Measure from the table edge to the back of the chair in the pulled-out position you plan to use.',
      'This chair envelope ends at the chair back. Any walking space is entered separately.',
      'clearance-envelope',
    ),
    'dining-walking-clearance': makeGuidance(
      'How to choose extra walking space',
      'Measure additional space beyond the pulled-out chair envelope.',
      'This is an optional, user-selected target—not a universal aisle or accessibility standard.',
      'clearance-envelope',
    ),
  },
};

const SERVICE_GUIDANCE: Partial<Record<FitServiceMode, Record<string, MeasurementGuidance>>> = {
  'appliance-install': {
    openingWidth: makeGuidance(
      'How to measure clear opening width',
      'Measure the usable opening between its narrowest fixed inside edges.',
      'Do not use the cabinet’s nominal width. Include any frame or hardware that remains in the opening.',
      'fixed-span',
    ),
    openingDepth: makeGuidance(
      'How to measure usable opening depth',
      'Measure from the front edge of the opening to the rear obstruction.',
      'Check at the narrowest point where the appliance body will sit.',
      'fixed-span',
    ),
    openingHeight: makeGuidance(
      'How to measure clear opening height',
      'Measure from the usable floor/base to the lowest fixed upper edge.',
      'Allow for any fixed trim or obstruction that reduces the available opening.',
      'fixed-span',
    ),
    sideClearance: makeGuidance(
      'Where side installation clearance applies',
      'Measure the extra space required beyond the appliance’s left and right sides.',
      'Use the exact model installation manual; do not treat an empty user-entered value as a manufacturer-approved zero.',
      'clearance-envelope',
    ),
    rearClearance: makeGuidance(
      'Where rear installation clearance applies',
      'Measure from the appliance rear edge to the wall or obstruction.',
      'Use the exact model manual for ventilation, hose, plug and service requirements.',
      'clearance-envelope',
    ),
    topClearance: makeGuidance(
      'Where top installation clearance applies',
      'Measure the space from the appliance top to the lowest fixed overhead edge.',
      'Use the exact model manual for ventilation and installation requirements.',
      'clearance-envelope',
    ),
    clearanceSource: SOURCE_REFERENCE,
    clearanceManualReference: SOURCE_REFERENCE,
    clearanceSpecReference: SOURCE_REFERENCE,
  },
  'delivery-route': {
    frontDoorWidth: makeGuidance(
      'How to measure clear door width',
      'Measure between the narrowest fixed inside edges of the open doorway.',
      'Repeat at every doorway on the route; nominal door size is not the usable opening.',
      'fixed-span',
    ),
    frontDoorHeight: makeGuidance(
      'How to measure clear door height',
      'Measure from the usable threshold to the lowest fixed part of the frame.',
      'Repeat at each doorway and include fixed stops or hardware that reduce clearance.',
      'fixed-span',
    ),
    hallWidth: makeGuidance(
      'How to measure a hallway pinch point',
      'Measure the narrowest clear distance between fixed walls or obstacles.',
      'Check each narrower point separately; the route also depends on turning space.',
      'route',
    ),
    turnWidth: makeGuidance(
      'How to measure a turn landing',
      'Measure the clear width of the landing/turn area between fixed edges.',
      'Use the usable floor area where the item must pivot; this does not simulate handling or tilting.',
      'route',
    ),
    turnDepth: makeGuidance(
      'How to measure turn depth',
      'Measure the landing depth from the inside corner to the next obstruction.',
      'Use the clear area available for the item to turn, not the full room depth.',
      'route',
    ),
    stairWidth: makeGuidance(
      'How to measure stair clear width',
      'Measure between the narrowest fixed obstructions along the stair.',
      'Check railings and wall projections; stair width alone does not prove an item can be carried safely.',
      'route',
    ),
    stairHeadroom: makeGuidance(
      'How to measure stair headroom',
      'Measure vertically from the stair path/nosing to the lowest overhead obstruction.',
      'A dimensional pass is not a delivery or lifting guarantee.',
      'fixed-span',
    ),
    destinationDoorWidth: makeGuidance(
      'How to measure destination door width',
      'Measure the narrowest usable distance between the fixed inside edges of the open door.',
      'Do not substitute the nominal frame size.',
      'fixed-span',
    ),
    destinationDoorHeight: makeGuidance(
      'How to measure destination door height',
      'Measure vertically from the usable threshold to the lowest fixed part of the frame.',
      'Do not substitute the nominal frame size.',
      'fixed-span',
    ),
  },
  'workspace-compatibility': {
    deskWidth: USABLE_INSIDE_SPAN,
    deskDepth: makeGuidance(
      'How to measure usable desk depth',
      'Measure the clear desktop from its front edge to its rear edge.',
      'Use the exact surface area available for the monitor base and clamp.',
      'fixed-span',
    ),
    armBaseDepth: makeGuidance(
      'How to measure arm base depth',
      'Measure the exact clamp/base footprint from front-most to rear-most edge.',
      'Check the arm manual for clamp depth, edge and desk thickness requirements.',
      'fixed-span',
    ),
    deskThickness: makeGuidance(
      'Where to measure desk thickness',
      'Measure the desktop thickness at the exact edge where the clamp will attach.',
      'Compare with the exact arm clamp range in its specification.',
      'fixed-span',
    ),
    clampMin: SOURCE_REFERENCE,
    clampMax: SOURCE_REFERENCE,
    armMaxLoad: SOURCE_REFERENCE,
    monitorWeight: SOURCE_REFERENCE,
    monitorVesa: makeGuidance(
      'Where to find the monitor VESA pattern',
      'Use the exact monitor model’s listed VESA mounting pattern.',
      'Check the monitor manual/specification and the arm’s supported patterns; do not infer a pattern from screen size.',
    ),
    armVesaPatterns: SOURCE_REFERENCE,
    compatibilitySource: SOURCE_REFERENCE,
    compatibilityManualReference: SOURCE_REFERENCE,
    compatibilitySpecReference: SOURCE_REFERENCE,
  },
  'tv-fit': {
    setup: makeGuidance(
      'Choose the TV setup being checked',
      'Select stand or wall mount to show the matching dimensions and manual checks.',
      'Wall-mount checks require the exact TV and mount specifications; a stand check uses the stand footprint and console surface.',
    ),
    consoleWidth: USABLE_INSIDE_SPAN,
    consoleDepth: makeGuidance(
      'How to measure console depth',
      'Measure the usable console top from front to rear edge.',
      'Allow for the actual stand/base footprint, cables and ventilation as specified for your models.',
      'fixed-span',
    ),
    wallAreaWidth: USABLE_INSIDE_SPAN,
    wallAreaHeight: makeGuidance(
      'How to measure usable wall/alcove height',
      'Measure between fixed inside edges of the usable wall area.',
      'Include obstructions that limit where the TV can be placed.',
      'fixed-span',
    ),
    tvWeight: SOURCE_REFERENCE,
    mountMaxLoad: SOURCE_REFERENCE,
    tvVesa: makeGuidance(
      'Where to find the TV VESA pattern',
      'Use the exact TV model’s listed VESA pattern and weight.',
      'Compare with the exact mount specification for supported patterns and load. Do not infer compatibility from screen size.',
    ),
    mountVesaPatterns: SOURCE_REFERENCE,
    mountDataSource: SOURCE_REFERENCE,
    mountManualReference: SOURCE_REFERENCE,
    mountPageReference: SOURCE_REFERENCE,
  },
  'home-gym': {
    roomWidth: USABLE_INSIDE_SPAN,
    roomDepth: makeGuidance(
      'How to measure room depth',
      'Measure between the usable inside boundaries at the floor.',
      'Account for fixed obstructions where the equipment and its operating zone need to sit.',
      'fixed-span',
    ),
    ceilingHeight: makeGuidance(
      'How to measure clear ceiling height',
      'Measure vertically from the usable floor to the lowest fixed overhead obstruction.',
      'The equipment manufacturer may specify additional overhead or movement space.',
      'fixed-span',
    ),
    sideOperating: makeGuidance(
      'How to set side operating space',
      'Measure the selected space you want beyond each side of the equipment footprint.',
      'Use manufacturer instructions where they define operating or access zones. Otherwise this is a user-selected planning allowance.',
      'operating-zone',
    ),
    frontOperating: makeGuidance(
      'How to set front operating space',
      'Measure the selected space beyond the equipment’s front operating edge.',
      'Use the exact equipment manual for movement, loading or access requirements.',
      'operating-zone',
    ),
    overheadOperating: makeGuidance(
      'How to set overhead operating space',
      'Measure from the equipment’s highest point to the lowest overhead obstruction.',
      'Use the equipment manual for overhead movement requirements; this tool does not assess safe use.',
      'clearance-envelope',
    ),
  },
  storage: {
    spaceWidth: USABLE_INSIDE_SPAN,
    spaceDepth: makeGuidance(
      'How to measure usable storage depth',
      'Measure the clear inside distance from the front edge to the rear obstruction.',
      'Measure between shelves or fixed structures that reduce usable space.',
      'fixed-span',
    ),
    spaceHeight: makeGuidance(
      'How to measure usable storage height',
      'Measure from the usable floor/base to the lowest fixed shelf or ceiling obstruction.',
      'Use clear interior height, not the outside cabinet height.',
      'fixed-span',
    ),
    edgeClearance: makeGuidance(
      'How to use edge clearance',
      'Enter the extra space you want at each outer storage edge.',
      'This is a chosen margin around the occupied area, not a supplied standard.',
      'clearance-envelope',
    ),
    itemGap: makeGuidance(
      'How to measure item gap',
      'Measure edge-to-edge spacing between adjacent objects.',
      'The item gap is separate from the aisle and outer edge clearance.',
      'fixed-span',
    ),
    availableAisle: makeGuidance(
      'How to measure the available aisle',
      'Measure the clear walking aisle between the stored item area and the opposite obstruction.',
      'Use the narrowest available span along the route.',
      'fixed-span',
    ),
    targetAisle: makeGuidance(
      'How to choose an aisle target',
      'Enter the clear aisle width you want to keep available.',
      'This is a user-selected target, not an accessibility or code standard.',
      'clearance-envelope',
    ),
  },
  'pool-room': {
    roomWidth: USABLE_INSIDE_SPAN,
    roomLength: makeGuidance(
      'How to measure clear room length',
      'Measure between the usable inside boundaries along the room length.',
      'Use the narrowest span where fixed posts or obstructions reduce the play area.',
      'fixed-span',
    ),
    extraClearance: makeGuidance(
      'How to set extra cue clearance',
      'Enter the extra space you want beyond the cue-length envelope on each side.',
      'The cue envelope already uses the entered cue length; this is an additional chosen allowance.',
      'clearance-envelope',
    ),
  },
  'vehicle-garage': {
    garageWidth: USABLE_INSIDE_SPAN,
    garageLength: makeGuidance(
      'How to measure garage usable length',
      'Measure the clear inside distance from the door plane to the rear obstruction.',
      'Account for shelves or fixed equipment that reduce parking depth.',
      'fixed-span',
    ),
    garageHeight: makeGuidance(
      'How to measure clear garage height',
      'Measure from the usable floor to the lowest fixed overhead obstruction.',
      'Include door tracks or storage that hang below the ceiling.',
      'fixed-span',
    ),
    garageOpeningWidth: makeGuidance(
      'How to measure garage door clear width',
      'Measure the usable opening between the closest fixed edges.',
      'The opening is different from the wider interior garage dimension.',
      'fixed-span',
    ),
    garageOpeningHeight: makeGuidance(
      'How to measure garage door clear height',
      'Measure vertically from the threshold to the lowest part of the open door/track.',
      'Use the actual clear opening, not the nominal door size.',
      'fixed-span',
    ),
    doorProjection: makeGuidance(
      'How to measure an open vehicle door projection',
      'Measure from the vehicle body edge to the outer edge of the open door.',
      'Use the door opening angle and the door projection for the parking configuration you plan to use.',
      'clearance-envelope',
    ),
    sideAccess: makeGuidance(
      'How to choose side access space',
      'Enter additional space you want beyond the open door projection.',
      'This is a user-selected access target, not a universal minimum.',
      'clearance-envelope',
    ),
    frontClearance: USER_SELECTED_ALLOWANCE,
    rearClearance: USER_SELECTED_ALLOWANCE,
    overheadClearance: makeGuidance(
      'How to choose overhead allowance',
      'Measure between the vehicle’s highest point and the lowest garage obstruction.',
      'Enter only the additional overhead allowance you want to reserve; this does not account for vehicle movement.',
      'clearance-envelope',
    ),
  },
  'garden-structure': {
    plotWidth: USABLE_INSIDE_SPAN,
    plotDepth: USABLE_INSIDE_SPAN,
    roofOverhangSide: makeGuidance(
      'How to measure side roof overhang',
      'Measure the horizontal projection from the structure body side to the roof edge.',
      'Use the manufacturer’s dimension sheet or measure the exact model.',
      'clearance-envelope',
    ),
    roofOverhangFront: makeGuidance(
      'How to measure front roof projection',
      'Measure from the front body wall to the outer roof edge.',
      'Do not include the door swing unless that is what the field requests.',
      'clearance-envelope',
    ),
    roofOverhangRear: makeGuidance(
      'How to measure rear roof projection',
      'Measure from the rear body wall to the outer roof edge.',
      'Use the exact structure model dimensions where available.',
      'clearance-envelope',
    ),
    maintenanceLeft: USER_SELECTED_ALLOWANCE,
    maintenanceRight: USER_SELECTED_ALLOWANCE,
    maintenanceRear: USER_SELECTED_ALLOWANCE,
    maintenanceFront: USER_SELECTED_ALLOWANCE,
    doorProjection: makeGuidance(
      'How to measure the open door projection',
      'Measure from the closed door plane to the outermost edge of the open door.',
      'Use the actual hinge and opening angle. This models the door envelope, not a standing space.',
      'clearance-envelope',
    ),
    doorPathAvailable: makeGuidance(
      'How to measure a clear door path',
      'Measure the narrowest clear width along the route to the entrance.',
      'Check each pinch point separately; the sketch does not simulate carrying or turning.',
      'route',
    ),
    doorPathTarget: makeGuidance(
      'How to choose extra door-path width',
      'Enter any additional clear path width you want beyond the door projection.',
      'This is a user-selected target, not a supplied safety standard.',
      'route',
    ),
    candidateSizes: makeGuidance(
      'How to enter candidate sizes',
      'Add one row for each candidate, with separate outside width and depth measurements.',
      'Each row is compared as a separate structure footprint. Verify the chosen model body, roof and door dimensions before relying on a candidate result.',
    ),
    direction: makeGuidance(
      'What sizing direction means',
      'Choose whether you are checking a known structure in a plot or testing candidate structures for a measured plot.',
      'The width and depth inputs change meaning with the selected direction. Check the labels after changing it.',
    ),
  },
  'garden-patio-dining': {
    advertisedWidth: makeGuidance(
      'What advertised width represents',
      'This is the listed nominal size, not the usable clear opening.',
      'Use the actual measured clear patio span for the fit comparison.',
    ),
    advertisedDepth: makeGuidance(
      'What advertised depth represents',
      'This is a nominal listing dimension, not usable depth.',
      'Measure the patio between fixed edges or obstacles for the actual space.',
    ),
    clearWidth: USABLE_INSIDE_SPAN,
    clearDepth: USABLE_INSIDE_SPAN,
    chairEnvelope: makeGuidance(
      'How to measure pulled-out chair envelope',
      'Measure from the table edge to the back of the chair when pulled out.',
      'Any additional walking clearance is a separate user-selected value.',
      'clearance-envelope',
    ),
    walkingClearance: makeGuidance(
      'How to choose walking clearance',
      'Enter additional space beyond the pulled-out chair envelope.',
      'This is a user-selected planning target, not a universal aisle width.',
      'clearance-envelope',
    ),
  },
  'garden-shed-storage': {
    insideWidth: USABLE_INSIDE_SPAN,
    insideDepth: USABLE_INSIDE_SPAN,
    insideHeight: USABLE_INSIDE_SPAN,
    aisleWidth: makeGuidance(
      'How to measure clear aisle width',
      'Measure the narrowest clear aisle between stored items and the opposite obstruction.',
      'This is the available measured aisle, not a target.',
      'fixed-span',
    ),
    aisleTarget: makeGuidance(
      'How to choose an aisle target',
      'Enter the clear aisle you want to keep open for access.',
      'This is a user-selected target, not a building or accessibility standard.',
      'clearance-envelope',
    ),
    itemGap: makeGuidance(
      'How to measure the gap between stored items',
      'Measure edge-to-edge between neighboring objects.',
      'Keep item spacing separate from the outer aisle width.',
      'fixed-span',
    ),
  },
  'garden-greenhouse': {
    plotWidth: USABLE_INSIDE_SPAN,
    plotDepth: USABLE_INSIDE_SPAN,
    roofOverhangSide: makeGuidance(
      'How to measure side eave projection',
      'Measure from the greenhouse body side to the roof edge.',
      'Use the exact model’s outside dimensions or measure the structure.',
      'clearance-envelope',
    ),
    roofOverhangEnd: makeGuidance(
      'How to measure end eave projection',
      'Measure from the end wall to the roof edge.',
      'Use the exact model’s outside dimensions or measure the structure.',
      'clearance-envelope',
    ),
    maintenanceSide: USER_SELECTED_ALLOWANCE,
    maintenanceEnd: USER_SELECTED_ALLOWANCE,
    insideClearWidth: makeGuidance(
      'How to measure clear inside width',
      'Measure the usable width between interior wall surfaces, excluding staging that reduces it.',
      'Use the narrowest usable interior span.',
      'fixed-span',
    ),
    stagingDepth: makeGuidance(
      'How to measure staging projection',
      'Measure the bench/staging depth from the wall to its front edge.',
      'The central aisle is measured separately between the staging fronts.',
      'clearance-envelope',
    ),
    centralAisleTarget: makeGuidance(
      'How to choose a central aisle target',
      'Measure or choose the clear passage you want between staging fronts.',
      'This is a user-selected planning target, not a universal accessibility standard.',
      'clearance-envelope',
    ),
    doorClearWidth: makeGuidance(
      'How to measure greenhouse door width',
      'Measure the usable opening between the door-frame inside edges.',
      'Compare with the outside width of equipment that must pass through.',
      'fixed-span',
    ),
    wheelbarrowWidth: OUTSIDE_DIMENSION,
  },
  'garden-hot-tub': {
    patioWidth: USABLE_INSIDE_SPAN,
    patioDepth: USABLE_INSIDE_SPAN,
    clearHeight: makeGuidance(
      'How to measure overhead clearance',
      'Measure vertically from the patio surface to the lowest fixed obstruction.',
      'Include eaves, beams or other fixed projections above the tub and cover path.',
      'fixed-span',
    ),
    serviceSide: makeGuidance(
      'Where hot-tub side service space applies',
      'Measure beyond the named service-panel side of the tub.',
      'Use the exact tub manual for panel access and service requirements. This may be model-specific.',
      'clearance-envelope',
    ),
    serviceFront: makeGuidance(
      'Where hot-tub front service space applies',
      'Measure from the tub’s service/access face to the nearest fixed obstruction.',
      'Use the exact tub manual for required panel access and do not infer a generic service allowance.',
      'clearance-envelope',
    ),
    coverLiftHeight: makeGuidance(
      'How to measure cover-lift space',
      'Measure the highest point of the cover through its open/lift movement to the overhead obstruction.',
      'Use the exact cover lifter/tub instructions for its movement envelope.',
      'operating-zone',
    ),
    serviceSpaceSource: SOURCE_REFERENCE,
    serviceManualReference: SOURCE_REFERENCE,
    serviceSpecReference: SOURCE_REFERENCE,
  },
  'garden-outdoor-kitchen': {
    patioWidth: USABLE_INSIDE_SPAN,
    patioDepth: USABLE_INSIDE_SPAN,
    clearHeight: makeGuidance(
      'How to measure overhead clearance',
      'Measure vertically from the patio to the lowest fixed overhead obstruction.',
      'Check appliance-specific installation instructions for heat, ventilation and overhead requirements.',
      'fixed-span',
    ),
    sideService: makeGuidance(
      'How to measure side service space',
      'Measure beyond the named end of the kitchen run to the nearest fixed boundary.',
      'Use the exact appliance or kitchen instructions where they specify service requirements; otherwise enter your chosen allowance.',
      'clearance-envelope',
    ),
    frontWorkZone: makeGuidance(
      'How to measure front work space',
      'Measure from the working face of the run to the edge of the clear patio area.',
      'This is a user-selected work zone unless the exact manual specifies a requirement.',
      'clearance-envelope',
    ),
    rearService: makeGuidance(
      'How to measure rear service space',
      'Measure from the rear of the run to the nearest wall or obstruction.',
      'Use the exact model instructions for ventilation and service requirements.',
      'clearance-envelope',
    ),
  },
  'garden-play-equipment': {
    plotWidth: USABLE_INSIDE_SPAN,
    plotDepth: USABLE_INSIDE_SPAN,
    clearHeight: makeGuidance(
      'How to measure clear height above equipment',
      'Measure from the relevant equipment/ground reference to the lowest overhead obstruction.',
      'Use the manufacturer’s exact height reference and check whether open sky is represented by a zero value.',
      'fixed-span',
    ),
    useZoneSource: makeGuidance(
      'Where the use-zone dimensions come from',
      'Use the exact equipment model instructions for the use-zone diagram and measurements.',
      'Enter the manufacturer’s left, right, front and rear zone values. No generic child-safety zone is supplied.',
      'operating-zone',
    ),
    manualReference: SOURCE_REFERENCE,
    useZoneLeft: makeGuidance(
      'How to measure left use zone',
      'Measure from the equipment’s left outside edge to the manufacturer-defined zone boundary.',
      'Use the exact model diagram and follow its orientation. No generic child-safety zone is supplied.',
      'operating-zone',
    ),
    useZoneRight: makeGuidance(
      'How to measure right use zone',
      'Measure from the equipment’s right outside edge to the manufacturer-defined zone boundary.',
      'Use the exact model diagram and follow its orientation. No generic child-safety zone is supplied.',
      'operating-zone',
    ),
    useZoneFront: makeGuidance(
      'How to measure front use zone',
      'Measure from the equipment’s front outside edge to the manufacturer-defined zone boundary.',
      'Use the exact model diagram and follow its orientation. No generic child-safety zone is supplied.',
      'operating-zone',
    ),
    useZoneRear: makeGuidance(
      'How to measure rear use zone',
      'Measure from the equipment’s rear outside edge to the manufacturer-defined zone boundary.',
      'Use the exact model diagram and follow its orientation. No generic child-safety zone is supplied.',
      'operating-zone',
    ),
  },
};

const genericSourceGuidance = (label: string) =>
  makeGuidance(
    `Where to find ${label.toLowerCase()}`,
    'Use the exact make/model manual or manufacturer specification.',
    'Record the manual section/page or specification reference you used. Do not infer a value from a different product.',
  );

export function getCoreMeasurementGuidance(
  calculator: CoreCalculator,
  fieldId: string,
): MeasurementGuidance | undefined {
  return CORE_MEASUREMENT_GUIDANCE[calculator][fieldId];
}

export function getFitServiceMeasurementGuidance(
  mode: FitServiceMode,
  fieldName: string,
  label: string,
  type: FitServiceFieldType,
): MeasurementGuidance | undefined {
  const exact = SERVICE_GUIDANCE[mode]?.[fieldName];
  if (exact) return exact;

  const name = fieldName.toLowerCase();
  const text = label.toLowerCase();
  if (/source|manualreference|specreference|pagereference|vesa|weight|load|clamp/.test(name)) {
    return genericSourceGuidance(label);
  }

  if (type !== 'length') return undefined;

  if (/usable|inside|opening|room|garage|plot|patio|space|clearheight/.test(`${name} ${text}`)) {
    return USABLE_INSIDE_SPAN;
  }
  return OUTSIDE_DIMENSION;
}

export const MEASUREMENT_DIAGRAM_COPY: Record<
  MeasurementDiagram,
  { title: string; description: string }
> = {
  'fixed-span': {
    title: 'Measure between fixed inside faces',
    description: 'An arrow spans the usable inside width between two fixed boundaries.',
  },
  'clearance-envelope': {
    title: 'Separate the object footprint from its clearance envelope',
    description:
      'A solid object sits inside a larger dashed outline showing extra space to measure.',
  },
  route: {
    title: 'Measure each narrow point along a route',
    description: 'A doorway, corridor and turn are checked as separate route sections.',
  },
  'operating-zone': {
    title: 'Measure the full operating zone',
    description: 'A dashed boundary surrounds the equipment footprint to show its use zone.',
  },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderMeasurementSketchContents(diagram: MeasurementDiagram): string {
  switch (diagram) {
    case 'fixed-span':
      return '<path class="measurement-help__wall" d="M48 18v76M232 18v76"/><path class="measurement-help__measure" d="M56 56h168"/><path class="measurement-help__arrow" d="m56 56 10-6v12zM224 56l-10-6v12z"/><text x="140" y="40" text-anchor="middle">inside face to inside face</text>';
    case 'clearance-envelope':
      return '<rect class="measurement-help__zone" x="40" y="16" width="200" height="80" rx="4"/><rect class="measurement-help__object" x="92" y="38" width="96" height="36" rx="3"/><path class="measurement-help__measure" d="M48 56h38M192 56h40"/><text x="140" y="88" text-anchor="middle">object + extra space</text>';
    case 'route':
      return '<path class="measurement-help__wall" d="M18 20v72M84 20v72M112 20v72M184 20v72M212 20v72M262 20v72"/><path class="measurement-help__measure" d="M26 52h50M120 52h58M220 52h34"/><text x="51" y="80" text-anchor="middle">door</text><text x="149" y="80" text-anchor="middle">hall / turn</text><text x="237" y="80" text-anchor="middle">opening</text>';
    case 'operating-zone':
      return '<rect class="measurement-help__zone" x="38" y="14" width="204" height="84" rx="4"/><rect class="measurement-help__object" x="100" y="37" width="80" height="38" rx="3"/><text x="140" y="91" text-anchor="middle">manufacturer use zone</text>';
  }
}

export function renderMeasurementSketch(id: string, diagram: MeasurementDiagram): string {
  const copy = MEASUREMENT_DIAGRAM_COPY[diagram];
  const titleId = `${id}-diagram-title`;
  const descriptionId = `${id}-diagram-desc`;
  return `<svg viewBox="0 0 280 112" role="img" aria-labelledby="${escapeHtml(titleId)} ${escapeHtml(descriptionId)}"><title id="${escapeHtml(titleId)}">${escapeHtml(copy.title)}</title><desc id="${escapeHtml(descriptionId)}">${escapeHtml(copy.description)} Diagram is not to scale.</desc>${renderMeasurementSketchContents(diagram)}</svg>`;
}

export function renderMeasurementHelpMarkup(id: string, guidance: MeasurementGuidance): string {
  const safeId = escapeHtml(id);
  const diagram = guidance.diagram
    ? `<figure class="measurement-help__diagram">${renderMeasurementSketch(id, guidance.diagram)}<figcaption>Illustrative plan sketch; not to scale.</figcaption></figure>`
    : '';
  return `<div class="measurement-help" data-measurement-help="${safeId}"><p class="measurement-help__summary" id="${safeId}">${escapeHtml(guidance.summary)}</p><details class="measurement-help__details"><summary>${escapeHtml(guidance.label)}</summary><div class="measurement-help__content"><p>${escapeHtml(guidance.detail)}</p><p class="measurement-help__example"><strong>Example:</strong> ${escapeHtml(guidance.example)}</p>${diagram}</div></details></div>`;
}
