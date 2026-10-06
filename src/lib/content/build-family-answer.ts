import type {
  BedEntity,
  ClearanceRule,
  DeskEntity,
  DisplayEntity,
  Entity,
  PageIntent,
  SourceRecord,
} from '../../types';
import type { Dataset } from '../validation/dataset';
import { buildBedRoomChecks, computeBedFootprint } from '../geometry/bedroom';
import {
  buildWorkspaceWidthCheck,
  computeConfigurationWidth,
  resolveMonitorWidth,
} from '../geometry/workspace';
import { evaluateFit, FIT_STATE_BADGE_COPY } from '../fit';

export interface FamilyFact {
  label: string;
  valueMm?: number;
  valueText?: string;
  note?: string;
}

export interface FamilyAnswerSection {
  title: string;
  intro?: string;
  facts: FamilyFact[];
  assumptions?: string[];
}

export interface FamilyAnswer {
  intro: string;
  sections: FamilyAnswerSection[];
  sources: SourceRecord[];
}

const WORKSPACE_OBJECT_SPECS: Record<string, { displayId: string; deskId: string; count: number }> =
  {
    'pi-p002-desk-size-dual-monitors': {
      displayId: 'ent-display-27in-16x9',
      deskId: 'ent-desk-1400',
      count: 2,
    },
    'pi-p003-desk-size-two-24in': {
      displayId: 'ent-display-24in-16x9',
      deskId: 'ent-desk-1400',
      count: 2,
    },
    'pi-p005-desk-size-two-32in': {
      displayId: 'ent-display-32in-16x9',
      deskId: 'ent-desk-1600',
      count: 2,
    },
    'pi-p006-desk-size-34in-ultrawide': {
      displayId: 'ent-display-34in-ultrawide',
      deskId: 'ent-desk-1400',
      count: 1,
    },
  };

const BED_CLEARANCE_RULES: Record<string, string[]> = {
  'pi-p032-clearance-around-bed': ['clr-bed-side-access', 'clr-bed-foot-access'],
  'pi-p033-space-bed-wall': ['clr-bed-side-access', 'clr-bed-foot-access'],
};

const WORKSPACE_GAP_RULE_ID = 'clr-monitor-gap';
const WORKSPACE_MARGIN_RULE_ID = 'clr-desk-side-margin';
const BED_SIDE_RULE_ID = 'clr-bed-side-access';
const BED_FOOT_RULE_ID = 'clr-bed-foot-access';
const INTERNAL_CONVENTION_SOURCE_ID = 'src-fitwise-internal-convention';

function entityById(dataset: Dataset, id: string): Entity {
  const entity = dataset.entities.find((candidate) => candidate.id === id);
  if (!entity) throw new Error(`Family answer references missing entity '${id}'.`);
  return entity;
}

function deskEntity(dataset: Dataset, id: string): DeskEntity {
  const entity = entityById(dataset, id);
  if (entity.category !== 'desk') throw new Error(`Entity '${id}' is not a desk.`);
  return entity;
}

function displayEntity(dataset: Dataset, id: string): DisplayEntity {
  const entity = entityById(dataset, id);
  if (entity.category !== 'display') throw new Error(`Entity '${id}' is not a display.`);
  return entity;
}

function bedEntity(dataset: Dataset, id: string): BedEntity {
  const entity = entityById(dataset, id);
  if (entity.category !== 'bed') throw new Error(`Entity '${id}' is not a bed.`);
  return entity;
}

function roomEntity(dataset: Dataset, id: string) {
  const entity = entityById(dataset, id);
  if (entity.category !== 'room') throw new Error(`Entity '${id}' is not a room scenario.`);
  return entity;
}

function ruleById(dataset: Dataset, id: string): ClearanceRule {
  const rule = dataset.clearanceRules.find((candidate) => candidate.id === id);
  if (!rule) throw new Error(`Family answer references missing clearance rule '${id}'.`);
  return rule;
}

function requiredMeasurement(rule: ClearanceRule, field: 'minimumMm' | 'recommendedMm') {
  const measurement = rule[field];
  if (!measurement) throw new Error(`Clearance rule '${rule.id}' has no ${field} measurement.`);
  return measurement;
}

function entitySourceIds(entity: Entity): string[] {
  const ids = new Set<string>();
  for (const value of Object.values(entity)) {
    if (typeof value === 'object' && value !== null && 'valueMm' in value) {
      const sourceId = (value as { sourceId?: string }).sourceId;
      if (sourceId) ids.add(sourceId);
    }
  }
  return [...ids];
}

function collectSources(
  dataset: Dataset,
  entities: Entity[],
  rules: ClearanceRule[],
): SourceRecord[] {
  const ids = new Set<string>([INTERNAL_CONVENTION_SOURCE_ID]);
  for (const entity of entities) for (const id of entitySourceIds(entity)) ids.add(id);
  for (const rule of rules) for (const id of rule.sourceIds) ids.add(id);
  return [...ids]
    .map((id) => dataset.sources.find((source) => source.id === id))
    .filter((source): source is SourceRecord => Boolean(source))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function widthBasisNote(display: DisplayEntity): string {
  const width = resolveMonitorWidth(display);
  if (width.basis === 'screen_only_approximation') {
    return [
      'Screen-only width derived from diagonal and aspect ratio; bezel and stand are not included.',
      width.note,
    ]
      .filter(Boolean)
      .join(' ');
  }
  return display.overallWidthMm?.note ?? 'Uses the listed overall-width reference measurement.';
}

function ruleAssumption(rule: ClearanceRule): string {
  const measurement = requiredMeasurement(rule, 'recommendedMm');
  return `${rule.notes ?? rule.id} ${measurement.note ?? ''}`.trim();
}

function fitLabel(state: ReturnType<typeof evaluateFit>['state']): string {
  const copy = FIT_STATE_BADGE_COPY[state];
  return `${copy.icon} ${copy.label}`;
}

function workspaceObjectAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const spec = WORKSPACE_OBJECT_SPECS[intent.id];
  if (!spec) throw new Error(`No verified workspace object-to-space spec for '${intent.id}'.`);
  const display = displayEntity(dataset, spec.displayId);
  const desk = deskEntity(dataset, spec.deskId);
  const gapRule = ruleById(dataset, WORKSPACE_GAP_RULE_ID);
  const marginRule = ruleById(dataset, WORKSPACE_MARGIN_RULE_ID);
  const width = resolveMonitorWidth(display);
  const gapMm = requiredMeasurement(gapRule, 'recommendedMm').valueMm;
  const sideMarginMm = requiredMeasurement(marginRule, 'recommendedMm').valueMm;
  const configurationWidthMm = computeConfigurationWidth({
    widthsMm: Array.from({ length: spec.count }, () => width.valueMm),
    gapMm,
  });
  const check = buildWorkspaceWidthCheck({
    configurationWidthMm,
    sideMarginRecommendedMm: sideMarginMm,
    deskWidthMm: desk.widthMm.valueMm,
  });
  const result = evaluateFit([check]);
  const exactOuterWidthNote = widthBasisNote(display);

  return {
    intro: `This calculation compares ${spec.count} ${display.name} side by side with the ${desk.name}. It uses the existing measured or derived dimensions and identifies the width assumptions explicitly.`,
    sections: [
      {
        title: `${spec.count} × ${display.name} on ${desk.name}`,
        facts: [
          {
            label: 'Display width basis',
            valueText:
              width.basis === 'overall' ? 'Overall-width reference' : 'Screen-only approximation',
            note: exactOuterWidthNote,
          },
          { label: 'Number of displays', valueText: String(spec.count) },
          { label: 'Configuration width (including gaps)', valueMm: configurationWidthMm },
          { label: 'Hard minimum desk width', valueMm: check.minimumMm },
          { label: 'Recommended desk width', valueMm: check.recommendedMm },
          { label: 'Reference desk width', valueMm: check.availableMm },
          { label: 'Fit result', valueText: fitLabel(result.state) },
        ],
        assumptions: [
          'Displays are flat and side by side; angled/yawed monitors are not modeled.',
          `Adjacent-display gap: ${gapMm} mm from the workspace gap rule. ${ruleAssumption(gapRule)}`,
          `Recommended side margin: ${sideMarginMm} mm per side. ${ruleAssumption(marginRule)}`,
          'A screen-only approximation is not the same as the complete device/bezel/stand footprint.',
        ],
      },
    ],
    sources: collectSources(dataset, [display, desk], [gapRule, marginRule]),
  };
}

function workspaceSpaceAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const deskId = intent.entityIds.find((id) => entityById(dataset, id).category === 'desk');
  if (!deskId) throw new Error(`Space-to-object intent '${intent.id}' must reference a desk.`);
  const desk = deskEntity(dataset, deskId);
  const displays = dataset.entities.filter(
    (entity): entity is DisplayEntity => entity.category === 'display',
  );
  const gapRule = ruleById(dataset, WORKSPACE_GAP_RULE_ID);
  const marginRule = ruleById(dataset, WORKSPACE_MARGIN_RULE_ID);
  const gapMm = requiredMeasurement(gapRule, 'recommendedMm').valueMm;
  const sideMarginMm = requiredMeasurement(marginRule, 'recommendedMm').valueMm;
  const sections = displays.map((display) => {
    const width = resolveMonitorWidth(display);
    const configurations = Array.from({ length: 5 }, (_, index) => index + 1).map((count) => {
      const configurationWidthMm = computeConfigurationWidth({
        widthsMm: Array.from({ length: count }, () => width.valueMm),
        gapMm,
      });
      const check = buildWorkspaceWidthCheck({
        configurationWidthMm,
        sideMarginRecommendedMm: sideMarginMm,
        deskWidthMm: desk.widthMm.valueMm,
      });
      return { count, configurationWidthMm, check, result: evaluateFit([check]) };
    });
    const physicalFits = configurations.filter((candidate) => candidate.result.hardFit);
    const recommendedFits = configurations.filter((candidate) => candidate.result.recommendedFit);
    const selected = recommendedFits.at(-1) ?? physicalFits.at(-1) ?? configurations[0]!;
    return {
      title: display.name,
      facts: [
        {
          label: 'Display width basis',
          valueText:
            width.basis === 'overall' ? 'Overall-width reference' : 'Screen-only approximation',
          note: widthBasisNote(display),
        },
        {
          label: 'Maximum count by hard width only',
          valueText: String(physicalFits.at(-1)?.count ?? 0),
        },
        {
          label: 'Maximum count with recommended margins',
          valueText: String(recommendedFits.at(-1)?.count ?? 'None'),
        },
        { label: 'Layout shown below', valueText: `${selected.count} × ${display.name}` },
        { label: 'Configuration width (including gaps)', valueMm: selected.configurationWidthMm },
        { label: 'Recommended desk width for this layout', valueMm: selected.check.recommendedMm },
        { label: 'Available reference desk width', valueMm: desk.widthMm.valueMm },
        { label: 'Fit result for displayed layout', valueText: fitLabel(selected.result.state) },
      ],
    };
  });

  return {
    intro: `Compare supported flat, side-by-side monitor setups against the ${desk.name}. For each model, the table shows the maximum count by hard width and by recommended side margins; screen-only estimates remain distinct from overall-width references. Counts are evaluated from one to five displays.`,
    sections: sections.map((section) => ({
      ...section,
      assumptions: [
        `Adjacent-display gap: ${gapMm} mm; recommended side margin: ${sideMarginMm} mm per side.`,
        'Only flat side-by-side layouts are modeled; no angle/yaw or arm geometry is assumed.',
        'Screen-only width estimates omit bezels and stands; check the complete device footprint before purchase.',
      ],
    })),
    sources: collectSources(dataset, [desk, ...displays], [gapRule, marginRule]),
  };
}

interface BedRoomPlan {
  minimumWidthMm: number;
  recommendedWidthMm: number;
  minimumLengthMm: number;
  recommendedLengthMm: number;
}

function bedRoomPlan(
  bed: BedEntity,
  dataset: Dataset,
  orientation: 'portrait' | 'landscape' = 'portrait',
): BedRoomPlan {
  const sideRule = ruleById(dataset, BED_SIDE_RULE_ID);
  const footRule = ruleById(dataset, BED_FOOT_RULE_ID);
  const sideMm = requiredMeasurement(sideRule, 'recommendedMm').valueMm;
  const footMm = requiredMeasurement(footRule, 'recommendedMm').valueMm;
  const frame = bed.defaultFrameAllowanceMm
    ? {
        left: bed.defaultFrameAllowanceMm.left.valueMm,
        right: bed.defaultFrameAllowanceMm.right.valueMm,
        head: bed.defaultFrameAllowanceMm.head.valueMm,
        foot: bed.defaultFrameAllowanceMm.foot.valueMm,
      }
    : { left: 0, right: 0, head: 0, foot: 0 };
  const hardFootprint = computeBedFootprint(
    bed.mattressWidthMm.valueMm,
    bed.mattressLengthMm.valueMm,
    frame,
  );
  const physicalWidth = orientation === 'portrait' ? hardFootprint.widthMm : hardFootprint.lengthMm;
  const physicalLength =
    orientation === 'portrait' ? hardFootprint.lengthMm : hardFootprint.widthMm;
  const roomWidthMm = physicalWidth + sideMm * 2;
  const roomLengthMm = physicalLength + footMm;
  const checks = buildBedRoomChecks({
    mattressWidthMm: bed.mattressWidthMm.valueMm,
    mattressLengthMm: bed.mattressLengthMm.valueMm,
    frameAllowanceMm: frame,
    orientation,
    roomWidthMm,
    roomLengthMm,
    sideClearanceRecommendedMm: sideMm,
    footClearanceRecommendedMm: footMm,
  });
  const widthCheck = checks.find((check) => check.dimension === 'room_width')!;
  const lengthCheck = checks.find((check) => check.dimension === 'room_length')!;
  return {
    minimumWidthMm: widthCheck.minimumMm,
    recommendedWidthMm: widthCheck.recommendedMm!,
    minimumLengthMm: lengthCheck.minimumMm,
    recommendedLengthMm: lengthCheck.recommendedMm!,
  };
}

function bedSourceRules(dataset: Dataset): ClearanceRule[] {
  return [ruleById(dataset, BED_SIDE_RULE_ID), ruleById(dataset, BED_FOOT_RULE_ID)];
}

function bedObjectAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const beds = intent.entityIds.map((id) => bedEntity(dataset, id));
  if (beds.length === 0)
    throw new Error(`Bed fit intent '${intent.id}' must reference at least one bed.`);
  const rules = bedSourceRules(dataset);
  return {
    intro:
      'This is a recommended clear-space planning rectangle, not a building-code minimum. It uses the market-specific mattress dimensions plus the cited side and foot clearance guidance; unmeasured frame overhang and additional furniture are excluded.',
    sections: beds.map((bed) => {
      const plan = bedRoomPlan(bed, dataset);
      return {
        title: bed.name,
        facts: [
          { label: 'Market', valueText: bed.market },
          { label: 'Mattress width', valueMm: bed.mattressWidthMm.valueMm },
          { label: 'Mattress length', valueMm: bed.mattressLengthMm.valueMm },
          { label: 'Hard mattress/frame width', valueMm: plan.minimumWidthMm },
          { label: 'Recommended clear room width', valueMm: plan.recommendedWidthMm },
          { label: 'Hard mattress/frame length', valueMm: plan.minimumLengthMm },
          { label: 'Recommended clear room length', valueMm: plan.recommendedLengthMm },
        ],
        assumptions: [
          'Portrait layout: bed width runs across the room and the headboard is against a wall.',
          'No sourced outer frame overhang is available for these bed entities; this is mattress-only geometry.',
          ...rules.map(ruleAssumption),
        ],
      };
    }),
    sources: collectSources(dataset, beds, rules),
  };
}

function bedroomSpaceAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const roomId = intent.entityIds.find((id) => entityById(dataset, id).category === 'room');
  const bedIds = intent.entityIds.filter((id) => entityById(dataset, id).category === 'bed');
  if (!roomId || bedIds.length === 0) {
    throw new Error(`Bedroom reverse-fit intent '${intent.id}' needs a room and bed candidates.`);
  }
  const room = roomEntity(dataset, roomId);
  const beds = bedIds.map((id) => bedEntity(dataset, id));
  const rules = bedSourceRules(dataset);
  const roomWidthMm = room.widthMm.valueMm;
  const roomLengthMm = room.lengthMm.valueMm;
  const sections = beds.flatMap((bed) => {
    const orientations: Array<'portrait' | 'landscape'> =
      roomWidthMm === roomLengthMm ? ['portrait'] : ['portrait', 'landscape'];
    return orientations.map((orientation) => {
      const sideMm = requiredMeasurement(rules[0]!, 'recommendedMm').valueMm;
      const footMm = requiredMeasurement(rules[1]!, 'recommendedMm').valueMm;
      const frame = { left: 0, right: 0, head: 0, foot: 0 };
      const checks = buildBedRoomChecks({
        mattressWidthMm: bed.mattressWidthMm.valueMm,
        mattressLengthMm: bed.mattressLengthMm.valueMm,
        frameAllowanceMm: frame,
        orientation,
        roomWidthMm,
        roomLengthMm,
        sideClearanceRecommendedMm: sideMm,
        footClearanceRecommendedMm: footMm,
      });
      const result = evaluateFit(checks, [
        `Room dimensions are nominal US feet converted to millimetres from the ${room.name}.`,
        'Mattress footprint only; frame overhang and nightstands are not included.',
        ...rules.map(ruleAssumption),
      ]);
      const width = checks.find((check) => check.dimension === 'room_width')!;
      const length = checks.find((check) => check.dimension === 'room_length')!;
      return {
        title: `${bed.name} — ${orientation} orientation`,
        facts: [
          { label: 'Market', valueText: bed.market },
          {
            label: 'Mattress footprint',
            valueText: `${bed.mattressWidthMm.valueMm} × ${bed.mattressLengthMm.valueMm} mm`,
          },
          { label: 'Room width required (physical)', valueMm: width.minimumMm },
          { label: 'Room width recommended', valueMm: width.recommendedMm },
          { label: 'Room width available', valueMm: roomWidthMm },
          { label: 'Room length required (physical)', valueMm: length.minimumMm },
          { label: 'Room length recommended', valueMm: length.recommendedMm },
          { label: 'Room length available', valueMm: roomLengthMm },
          { label: 'Fit result', valueText: fitLabel(result.state) },
        ],
        assumptions: result.assumptions,
      };
    });
  });
  return {
    intro: `Compare market-specific mattress footprints against the ${room.name}. Results distinguish mattress-only physical fit from recommended side/foot clearances.`,
    sections,
    sources: collectSources(dataset, [room, ...beds], rules),
  };
}

function comparisonAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const entities = intent.entityIds.map((id) => entityById(dataset, id));
  if (entities.length < 2)
    throw new Error(`Comparison intent '${intent.id}' needs at least two entities.`);
  const isBedCompare = entities.every((entity): entity is BedEntity => entity.category === 'bed');
  const bedRules = isBedCompare ? bedSourceRules(dataset) : [];
  const sections = entities.map((entity) => {
    if (entity.category === 'desk') {
      return {
        title: entity.name,
        facts: [
          { label: 'Available width', valueMm: entity.widthMm.valueMm },
          ...(entity.depthMm ? [{ label: 'Desk depth', valueMm: entity.depthMm.valueMm }] : []),
        ],
      };
    }
    if (entity.category === 'display') {
      const width = resolveMonitorWidth(entity);
      return {
        title: entity.name,
        facts: [
          ...(entity.diagonalInches
            ? [{ label: 'Nominal diagonal', valueText: `${entity.diagonalInches} in` }]
            : []),
          ...(entity.screenWidthMm
            ? [
                {
                  label: 'Screen width',
                  valueMm: entity.screenWidthMm.valueMm,
                  note: 'Derived screen-only dimension.',
                },
              ]
            : []),
          ...(entity.screenHeightMm
            ? [
                {
                  label: 'Screen height',
                  valueMm: entity.screenHeightMm.valueMm,
                  note: 'Derived screen-only dimension.',
                },
              ]
            : []),
          ...(entity.activeWidthMm
            ? [
                {
                  label: 'Active panel width (excludes bezel)',
                  valueMm: entity.activeWidthMm.valueMm,
                  note: entity.activeWidthMm.note,
                },
              ]
            : []),
          {
            label:
              width.basis === 'overall' ? 'Listed device width' : 'Approximate screen-only width',
            valueMm: width.valueMm,
            note: widthBasisNote(entity),
          },
        ],
      };
    }
    if (entity.category === 'bed') {
      const plan = bedRoomPlan(entity, dataset);
      return {
        title: entity.name,
        facts: [
          { label: 'Market', valueText: entity.market },
          { label: 'Mattress width', valueMm: entity.mattressWidthMm.valueMm },
          { label: 'Mattress length', valueMm: entity.mattressLengthMm.valueMm },
          { label: 'Recommended clear room width', valueMm: plan.recommendedWidthMm },
          { label: 'Recommended clear room length', valueMm: plan.recommendedLengthMm },
        ],
        assumptions: [
          'Recommended clear dimensions are planning guidance, not code minimums.',
          ...bedRules.map(ruleAssumption),
        ],
      };
    }
    throw new Error(`Comparison renderer does not support '${entity.category}' entities.`);
  });
  const sources = collectSources(dataset, entities, bedRules);
  return {
    intro: `${intent.primaryQuery}: compare the listed physical dimensions and their market/source basis. Screen dimensions are explicitly distinguished from outer device footprints.`,
    sections,
    sources,
  };
}

function clearanceAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  const ruleIds = BED_CLEARANCE_RULES[intent.id];
  if (!ruleIds) throw new Error(`No clearance rules configured for '${intent.id}'.`);
  const rules = ruleIds.map((id) => ruleById(dataset, id));
  return {
    intro:
      'These values are guidance for arranging a bed, not building-code or accessibility minimums. The source wording and market/context assumptions are shown alongside each value.',
    sections: rules.map((rule) => ({
      title:
        rule.dimension === 'left'
          ? 'Side access beside the bed'
          : 'Clearance at the foot of the bed',
      facts: [
        { label: 'Context', valueText: rule.context },
        { label: 'Code minimum', valueText: 'No universal code minimum asserted by this source.' },
        {
          label: 'Recommended clearance',
          valueMm: requiredMeasurement(rule, 'recommendedMm').valueMm,
          note: requiredMeasurement(rule, 'recommendedMm').note ?? rule.notes,
        },
      ],
      assumptions: [rule.notes ?? '', ruleAssumption(rule)].filter(Boolean),
    })),
    sources: collectSources(dataset, [], rules),
  };
}

export function buildFamilyAnswer(intent: PageIntent, dataset: Dataset): FamilyAnswer {
  switch (intent.family) {
    case 'object_to_space':
      return intent.cluster === 'workspace'
        ? workspaceObjectAnswer(intent, dataset)
        : bedObjectAnswer(intent, dataset);
    case 'space_to_object':
      return intent.cluster === 'workspace'
        ? workspaceSpaceAnswer(intent, dataset)
        : bedroomSpaceAnswer(intent, dataset);
    case 'comparison':
      return comparisonAnswer(intent, dataset);
    case 'clearance':
      return clearanceAnswer(intent, dataset);
    default:
      throw new Error(`No family answer renderer configured for '${intent.family}'.`);
  }
}
