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
import { buildWorkspaceConfigurationCheck, resolveMonitorWidth } from '../geometry/workspace';
import { evaluateFit, FIT_STATE_BADGE_COPY } from '../fit';
import { formatMeasurement } from '../units';
import { contentCatalog, translateFamilyText } from '../../i18n/content';
import type { Locale } from '../../i18n/locale';
import { getFitStateBadgeCopy } from '../fit/summary-copy';

type FamilyTextKey = string;
type FamilyTextVars = Record<string, string | number>;

const ENGLISH_MARKETS: Readonly<Record<string, string>> = { US: 'US', UK: 'UK', global: 'Global' };

function marketName(market: string, locale: Locale): string {
  return locale === 'en'
    ? (ENGLISH_MARKETS[market] ?? market)
    : (contentCatalog(locale).markets[market] ?? market);
}

/** Localized bed names may carry a leading “mattress” noun that answer headings drop. */
function localizedBedName(name: string, locale: Locale): string {
  const prefix = contentCatalog(locale).familyText.templates.mattressNamePrefix ?? '';
  return prefix && name.toLowerCase().startsWith(prefix.toLowerCase())
    ? name.slice(prefix.length)
    : name;
}

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

function fixedText(locale: Locale, key: string, fallback: string): string {
  if (locale === 'en') return fallback;
  const { familyText } = contentCatalog(locale);
  const localized = familyText.fixed[key] ?? familyText.templates[key];
  if (!localized) throw new Error(`Missing ${locale} family label '${key}'.`);
  return localized;
}

function familyTemplate(
  locale: Locale,
  key: FamilyTextKey,
  fallback: string,
  values: FamilyTextVars,
): string {
  return locale === 'en' ? fallback : translateFamilyText(locale, key, values);
}

function entityName(entity: Entity, locale: Locale): string {
  return locale === 'en'
    ? entity.name
    : (contentCatalog(locale).entityNames[entity.id] ?? entity.name);
}

function widthBasisNote(display: DisplayEntity, locale: Locale): string {
  const width = resolveMonitorWidth(display);
  if (width.basis === 'screen_only_approximation') {
    if (locale !== 'en') {
      return [contentCatalog(locale).familyText.fixed.derivedScreenOnly, width.note]
        .filter(Boolean)
        .join(' ');
    }
    return [
      'Screen-only width derived from diagonal and aspect ratio, rounded to the nearest millimetre for fit calculations; bezel and stand are not included.',
      width.note,
    ]
      .filter(Boolean)
      .join(' ');
  }
  return (
    display.overallWidthMm?.note ??
    fixedText(
      locale,
      'overallWidthReference',
      'Uses the listed overall-width reference measurement.',
    )
  );
}

function ruleAssumption(rule: ClearanceRule, _locale: Locale): string {
  const measurement = requiredMeasurement(rule, 'recommendedMm');
  return `${rule.notes ?? rule.id} ${measurement.note ?? ''}`.trim();
}

function fitLabel(state: ReturnType<typeof evaluateFit>['state'], locale: Locale): string {
  const copy = locale === 'en' ? FIT_STATE_BADGE_COPY[state] : getFitStateBadgeCopy(state, locale);
  return `${copy.icon} ${copy.label}`;
}

function workspaceObjectAnswer(intent: PageIntent, dataset: Dataset, locale: Locale): FamilyAnswer {
  const spec = WORKSPACE_OBJECT_SPECS[intent.id];
  if (!spec) throw new Error(`No verified workspace object-to-space spec for '${intent.id}'.`);
  const display = displayEntity(dataset, spec.displayId);
  const desk = deskEntity(dataset, spec.deskId);
  const displayName = entityName(display, locale);
  const deskName = entityName(desk, locale);
  const gapRule = ruleById(dataset, WORKSPACE_GAP_RULE_ID);
  const marginRule = ruleById(dataset, WORKSPACE_MARGIN_RULE_ID);
  const width = resolveMonitorWidth(display);
  const gapMm = requiredMeasurement(gapRule, 'recommendedMm').valueMm;
  const sideMarginMm = requiredMeasurement(marginRule, 'recommendedMm').valueMm;
  const { configurationWidthMm, check } = buildWorkspaceConfigurationCheck({
    widthsMm: Array.from({ length: spec.count }, () => width.valueMm),
    gapMm,
    sideMarginRecommendedMm: sideMarginMm,
    deskWidthMm: desk.widthMm.valueMm,
  });
  const result = evaluateFit([check]);
  const exactOuterWidthNote = widthBasisNote(display, locale);

  return {
    intro: familyTemplate(
      locale,
      'workspaceObjectIntro',
      `This calculation compares ${spec.count} ${displayName} side by side with the ${deskName}. It uses the existing measured or derived dimensions and identifies the width assumptions explicitly.`,
      { count: spec.count, display: displayName, desk: deskName },
    ),
    sections: [
      {
        title: familyTemplate(
          locale,
          'workspaceObjectTitle',
          `${spec.count} × ${displayName} on ${deskName}`,
          { count: spec.count, display: displayName, desk: deskName },
        ),
        facts: [
          {
            label: fixedText(locale, 'displayWidthBasis', 'Display width basis'),
            valueText: fixedText(
              locale,
              width.basis === 'overall' ? 'overallWidthReference' : 'screenOnlyApproximation',
              width.basis === 'overall' ? 'Overall-width reference' : 'Screen-only approximation',
            ),
            note: exactOuterWidthNote,
          },
          {
            label: fixedText(locale, 'numberOfDisplays', 'Number of displays'),
            valueText: String(spec.count),
          },
          {
            label: fixedText(locale, 'configurationWidth', 'Configuration width (including gaps)'),
            valueMm: configurationWidthMm,
          },
          {
            label: fixedText(locale, 'hardMinimumDeskWidth', 'Hard minimum desk width'),
            valueMm: check.minimumMm,
          },
          {
            label: fixedText(locale, 'recommendedDeskWidth', 'Recommended desk width'),
            valueMm: check.recommendedMm,
          },
          {
            label: fixedText(locale, 'referenceDeskWidth', 'Reference desk width'),
            valueMm: check.availableMm,
          },
          {
            label: fixedText(locale, 'fitResult', 'Fit result'),
            valueText: fitLabel(result.state, locale),
          },
        ],
        assumptions: [
          familyTemplate(
            locale,
            'flatDisplaysOnly',
            'Displays are flat and side by side; angled/yawed monitors are not modeled.',
            {},
          ),
          familyTemplate(
            locale,
            'adjacentGap',
            `Adjacent-display gap: ${formatMeasurement(gapMm)} from the workspace gap rule. ${ruleAssumption(gapRule, locale)}`,
            { measurement: formatMeasurement(gapMm), assumption: ruleAssumption(gapRule, locale) },
          ),
          familyTemplate(
            locale,
            'sideMargin',
            `Recommended side margin: ${formatMeasurement(sideMarginMm)} per side. ${ruleAssumption(marginRule, locale)}`,
            {
              measurement: formatMeasurement(sideMarginMm),
              assumption: ruleAssumption(marginRule, locale),
            },
          ),
          familyTemplate(
            locale,
            'screenOnlyNotFootprint',
            'A screen-only approximation is not the same as the complete device/bezel/stand footprint.',
            {},
          ),
        ],
      },
    ],
    sources: collectSources(dataset, [display, desk], [gapRule, marginRule]),
  };
}

function workspaceSpaceAnswer(intent: PageIntent, dataset: Dataset, locale: Locale): FamilyAnswer {
  const deskId = intent.entityIds.find((id) => entityById(dataset, id).category === 'desk');
  if (!deskId) throw new Error(`Space-to-object intent '${intent.id}' must reference a desk.`);
  const desk = deskEntity(dataset, deskId);
  const deskName = entityName(desk, locale);
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
      const { configurationWidthMm, check } = buildWorkspaceConfigurationCheck({
        widthsMm: Array.from({ length: count }, () => width.valueMm),
        gapMm,
        sideMarginRecommendedMm: sideMarginMm,
        deskWidthMm: desk.widthMm.valueMm,
      });
      return { count, configurationWidthMm, check, result: evaluateFit([check]) };
    });
    const physicalFits = configurations.filter((candidate) => candidate.result.hardFit);
    const recommendedFits = configurations.filter((candidate) => candidate.result.recommendedFit);
    const selected = recommendedFits.at(-1) ?? physicalFits.at(-1) ?? configurations[0]!;
    return {
      title: entityName(display, locale),
      facts: [
        {
          label: fixedText(locale, 'displayWidthBasis', 'Display width basis'),
          valueText: fixedText(
            locale,
            width.basis === 'overall' ? 'overallWidthReference' : 'screenOnlyApproximation',
            width.basis === 'overall' ? 'Overall-width reference' : 'Screen-only approximation',
          ),
          note: widthBasisNote(display, locale),
        },
        {
          label: fixedText(locale, 'maximumHardWidth', 'Maximum count by hard width only'),
          valueText: String(physicalFits.at(-1)?.count ?? 0),
        },
        {
          label: fixedText(
            locale,
            'maximumRecommendedMargins',
            'Maximum count with recommended margins',
          ),
          valueText:
            recommendedFits.at(-1)?.count === undefined
              ? fixedText(locale, 'none', 'None')
              : String(recommendedFits.at(-1)!.count),
        },
        {
          label: fixedText(locale, 'layoutShown', 'Layout shown below'),
          valueText: `${selected.count} × ${entityName(display, locale)}`,
        },
        {
          label: fixedText(locale, 'configurationWidth', 'Configuration width (including gaps)'),
          valueMm: selected.configurationWidthMm,
        },
        {
          label: fixedText(
            locale,
            'recommendedDeskWidthLayout',
            'Recommended desk width for this layout',
          ),
          valueMm: selected.check.recommendedMm,
        },
        {
          label: fixedText(locale, 'availableReferenceDeskWidth', 'Available reference desk width'),
          valueMm: desk.widthMm.valueMm,
        },
        {
          label: fixedText(locale, 'fitDisplayedLayout', 'Fit result for displayed layout'),
          valueText: fitLabel(selected.result.state, locale),
        },
      ],
    };
  });

  return {
    intro: familyTemplate(
      locale,
      'workspaceSpaceIntro',
      `Compare supported flat, side-by-side monitor setups against the ${deskName}. For each model, the table shows the maximum count by hard width and by recommended side margins; screen-only estimates remain distinct from overall-width references. Counts are evaluated from one to five displays.`,
      { desk: deskName },
    ),
    sections: sections.map((section) => ({
      ...section,
      assumptions: [
        familyTemplate(
          locale,
          'workspaceSpaceGapMargins',
          `Adjacent-display gap: ${formatMeasurement(gapMm)}; recommended side margin: ${formatMeasurement(sideMarginMm)} per side.`,
          { gap: formatMeasurement(gapMm), margin: formatMeasurement(sideMarginMm) },
        ),
        familyTemplate(
          locale,
          'noAngleOrArm',
          'Only flat side-by-side layouts are modeled; no angle/yaw or arm geometry is assumed.',
          {},
        ),
        familyTemplate(
          locale,
          'checkFootprint',
          'Screen-only width estimates omit bezels and stands; check the complete device footprint before purchase.',
          {},
        ),
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

function formatPlanningDimension(valueMm: number): string {
  return `${formatMeasurement(valueMm, 'm')} (${formatMeasurement(valueMm, 'imperial')})`;
}

function bedDisplayName(name: string): string {
  return name.replace(/ mattress(?: \(.*\))?$/i, '');
}

function bedObjectAnswer(intent: PageIntent, dataset: Dataset, locale: Locale): FamilyAnswer {
  const beds = intent.entityIds.map((id) => bedEntity(dataset, id));
  if (beds.length === 0)
    throw new Error(`Bed fit intent '${intent.id}' must reference at least one bed.`);
  const rules = bedSourceRules(dataset);
  const bedPlans = beds.map((bed) => ({ bed, plan: bedRoomPlan(bed, dataset) }));
  const planningAnswers = bedPlans.map(({ bed, plan }) => {
    const name = locale === 'en' ? bedDisplayName(bed.name) : localizedBedName(bed.name, locale);
    const model = bed.frameModelName
      ? familyTemplate(locale, 'modelWithFrame', `${name} in ${bed.frameModelName}`, {
          bed: name,
          frame: bed.frameModelName,
        })
      : familyTemplate(locale, 'mattressOnly', `${name} mattress-only`, { bed: name });
    return familyTemplate(
      locale,
      'bedPlan',
      `${model}: about ${formatPlanningDimension(plan.recommendedWidthMm)} wide by ${formatPlanningDimension(plan.recommendedLengthMm)} long`,
      {
        model,
        width: formatPlanningDimension(plan.recommendedWidthMm),
        length: formatPlanningDimension(plan.recommendedLengthMm),
      },
    );
  });
  return {
    intro: familyTemplate(
      locale,
      'bedObjectIntro',
      `Planning estimate, not a building-code minimum: ${planningAnswers.join('; ')}. The model applies the source-backed approximately 24-inch side allowance and a separate FitWise-assumed 24-inch foot allowance to each market-specific mattress footprint. Only entries naming a frame include that specific sourced model; other entries are mattress-only. Nightstands, wardrobe/dresser access, doors and circulation are excluded; measure the actual setup before buying.`,
      { plans: planningAnswers.join('; ') },
    ),
    sections: bedPlans.map(({ bed, plan }) => {
      const footprintLabel = bed.defaultFrameAllowanceMm
        ? fixedText(locale, 'listedFramePhysicalWidth', 'Mattress/frame physical width')
        : fixedText(locale, 'mattressOnlyPhysicalWidth', 'Mattress-only physical width');
      const lengthLabel = bed.defaultFrameAllowanceMm
        ? fixedText(locale, 'listedFramePhysicalLength', 'Mattress/frame physical length')
        : fixedText(locale, 'mattressOnlyPhysicalLength', 'Mattress-only physical length');
      return {
        title: bed.name,
        facts: [
          {
            label: fixedText(locale, 'market', 'Market'),
            valueText: marketName(bed.market, locale),
          },
          {
            label: fixedText(locale, 'mattressWidth', 'Mattress width'),
            valueMm: bed.mattressWidthMm.valueMm,
          },
          {
            label: fixedText(locale, 'mattressLength', 'Mattress length'),
            valueMm: bed.mattressLengthMm.valueMm,
          },
          {
            label: footprintLabel,
            valueMm: plan.minimumWidthMm,
            note: bed.frameModelName
              ? familyTemplate(locale, 'usingFrame', `Using ${bed.frameModelName}.`, {
                  frame: bed.frameModelName,
                })
              : fixedText(
                  locale,
                  'mattressOnlyFrameNotMeasured',
                  'Mattress-only footprint; frame not measured.',
                ),
          },
          {
            label: fixedText(locale, 'recommendedClearRoomWidth', 'Recommended clear room width'),
            valueMm: plan.recommendedWidthMm,
          },
          {
            label: lengthLabel,
            valueMm: plan.minimumLengthMm,
            note: bed.frameModelName
              ? familyTemplate(locale, 'usingFrame', `Using ${bed.frameModelName}.`, {
                  frame: bed.frameModelName,
                })
              : fixedText(
                  locale,
                  'mattressOnlyFrameNotMeasured',
                  'Mattress-only footprint; frame not measured.',
                ),
          },
          {
            label: fixedText(locale, 'recommendedClearRoomLength', 'Recommended clear room length'),
            valueMm: plan.recommendedLengthMm,
          },
        ],
        assumptions: [
          fixedText(
            locale,
            'portraitLayout',
            'Portrait layout: bed width runs across the room and the headboard is against a wall.',
          ),
          bed.frameModelName
            ? familyTemplate(
                locale,
                'bedFrameOverhang',
                `Frame overhang is derived from the published dimensions of ${bed.frameModelName}; other frames differ.`,
                { frame: bed.frameModelName },
              )
            : fixedText(
                locale,
                'noFrameForMarket',
                'No outer frame was sourced for this market example; this is mattress-only geometry.',
              ),
          ...rules.map((rule) => ruleAssumption(rule, locale)),
        ],
      };
    }),
    sources: collectSources(dataset, beds, rules),
  };
}

function bedroomSpaceAnswer(intent: PageIntent, dataset: Dataset, locale: Locale): FamilyAnswer {
  const roomId = intent.entityIds.find((id) => entityById(dataset, id).category === 'room');
  const bedIds = intent.entityIds.filter((id) => entityById(dataset, id).category === 'bed');
  if (!roomId || bedIds.length === 0) {
    throw new Error(`Bedroom reverse-fit intent '${intent.id}' needs a room and bed candidates.`);
  }
  const room = roomEntity(dataset, roomId);
  const roomName = entityName(room, locale);
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
        familyTemplate(
          locale,
          'roomNominalUsFeet',
          `Room dimensions are nominal US feet converted to millimetres from the ${roomName}.`,
          { room: roomName },
        ),
        fixedText(
          locale,
          'mattressOnlyNoNightstands',
          'Mattress footprint only; frame overhang and nightstands are not included.',
        ),
        ...rules.map((rule) => ruleAssumption(rule, locale)),
      ]);
      const width = checks.find((check) => check.dimension === 'room_width')!;
      const length = checks.find((check) => check.dimension === 'room_length')!;
      return {
        title: familyTemplate(
          locale,
          'bedOrientationTitle',
          `${bed.name} — ${orientation} orientation`,
          {
            bed: bed.name,
            orientation:
              locale === 'en' ? orientation : contentCatalog(locale).orientations[orientation],
          },
        ),
        facts: [
          {
            label: fixedText(locale, 'market', 'Market'),
            valueText: marketName(bed.market, locale),
          },
          {
            label: fixedText(locale, 'mattressFootprint', 'Mattress footprint'),
            valueText: `${formatMeasurement(bed.mattressWidthMm.valueMm)} × ${formatMeasurement(bed.mattressLengthMm.valueMm)}`,
          },
          {
            label: fixedText(locale, 'roomWidthRequiredPhysical', 'Room width required (physical)'),
            valueMm: width.minimumMm,
          },
          {
            label: fixedText(locale, 'roomWidthRecommended', 'Room width recommended'),
            valueMm: width.recommendedMm,
          },
          {
            label: fixedText(locale, 'roomWidthAvailable', 'Room width available'),
            valueMm: roomWidthMm,
          },
          {
            label: fixedText(
              locale,
              'roomLengthRequiredPhysical',
              'Room length required (physical)',
            ),
            valueMm: length.minimumMm,
          },
          {
            label: fixedText(locale, 'roomLengthRecommended', 'Room length recommended'),
            valueMm: length.recommendedMm,
          },
          {
            label: fixedText(locale, 'roomLengthAvailable', 'Room length available'),
            valueMm: roomLengthMm,
          },
          {
            label: fixedText(locale, 'fitResult', 'Fit result'),
            valueText: fitLabel(result.state, locale),
          },
        ],
        assumptions: result.assumptions,
      };
    });
  });
  return {
    intro: familyTemplate(
      locale,
      'bedroomSpaceIntro',
      `Compare market-specific mattress footprints against the ${roomName}. Results distinguish mattress-only physical fit from recommended side/foot clearances.`,
      { room: roomName },
    ),
    sections,
    sources: collectSources(dataset, [room, ...beds], rules),
  };
}

function comparisonAnswer(intent: PageIntent, dataset: Dataset, locale: Locale): FamilyAnswer {
  const entities = intent.entityIds.map((id) => entityById(dataset, id));
  if (entities.length < 2)
    throw new Error(`Comparison intent '${intent.id}' needs at least two entities.`);
  const bedEntities = entities.filter((entity): entity is BedEntity => entity.category === 'bed');
  const isBedCompare = bedEntities.length === entities.length;
  const bedRules = isBedCompare ? bedSourceRules(dataset) : [];
  const sections = entities.map((entity) => {
    if (entity.category === 'desk') {
      return {
        title: entity.name,
        facts: [
          {
            label: fixedText(locale, 'availableWidth', 'Available width'),
            valueMm: entity.widthMm.valueMm,
          },
          ...(entity.depthMm
            ? [
                {
                  label: fixedText(locale, 'deskDepth', 'Desk depth'),
                  valueMm: entity.depthMm.valueMm,
                },
              ]
            : []),
        ],
      };
    }
    if (entity.category === 'display') {
      const width = resolveMonitorWidth(entity);
      return {
        title: entity.name,
        facts: [
          ...(entity.diagonalInches
            ? [
                {
                  label: fixedText(locale, 'nominalDiagonal', 'Nominal diagonal'),
                  valueText: `${entity.diagonalInches} in`,
                },
              ]
            : []),
          ...(entity.screenWidthMm
            ? [
                {
                  label: fixedText(locale, 'screenWidth', 'Screen width'),
                  valueMm: entity.screenWidthMm.valueMm,
                  note: fixedText(locale, 'derivedScreenOnly', 'Derived screen-only dimension.'),
                },
              ]
            : []),
          ...(entity.screenHeightMm
            ? [
                {
                  label: fixedText(locale, 'screenHeight', 'Screen height'),
                  valueMm: entity.screenHeightMm.valueMm,
                  note: fixedText(locale, 'derivedScreenOnly', 'Derived screen-only dimension.'),
                },
              ]
            : []),
          ...(entity.activeWidthMm
            ? [
                {
                  label: fixedText(
                    locale,
                    'activePanelWidth',
                    'Active panel width (excludes bezel)',
                  ),
                  valueMm: entity.activeWidthMm.valueMm,
                  note: entity.activeWidthMm.note,
                },
              ]
            : []),
          {
            label: fixedText(
              locale,
              width.basis === 'overall' ? 'listedDeviceWidth' : 'approximateScreenWidth',
              width.basis === 'overall' ? 'Listed device width' : 'Approximate screen-only width',
            ),
            valueMm: width.valueMm,
            note: widthBasisNote(entity, locale),
          },
        ],
      };
    }
    if (entity.category === 'bed') {
      const plan = bedRoomPlan(entity, dataset);
      return {
        title: entity.name,
        facts: [
          {
            label: fixedText(locale, 'market', 'Market'),
            valueText: marketName(entity.market, locale),
          },
          {
            label: fixedText(locale, 'mattressWidth', 'Mattress width'),
            valueMm: entity.mattressWidthMm.valueMm,
          },
          {
            label: fixedText(locale, 'mattressLength', 'Mattress length'),
            valueMm: entity.mattressLengthMm.valueMm,
          },
          {
            label: entity.frameModelName
              ? fixedText(locale, 'listedFramePhysicalWidth', 'Listed frame physical width')
              : fixedText(locale, 'mattressOnlyPhysicalWidth', 'Mattress-only physical width'),
            valueMm: plan.minimumWidthMm,
            note: entity.frameModelName
              ? familyTemplate(locale, 'usingFrame', `Using ${entity.frameModelName}.`, {
                  frame: entity.frameModelName,
                })
              : fixedText(locale, 'frameDimensionsNotMeasured', 'Frame dimensions not measured.'),
          },
          {
            label: entity.frameModelName
              ? fixedText(locale, 'listedFramePhysicalLength', 'Listed frame physical length')
              : fixedText(locale, 'mattressOnlyPhysicalLength', 'Mattress-only physical length'),
            valueMm: plan.minimumLengthMm,
            note: entity.frameModelName
              ? familyTemplate(locale, 'usingFrame', `Using ${entity.frameModelName}.`, {
                  frame: entity.frameModelName,
                })
              : fixedText(locale, 'frameDimensionsNotMeasured', 'Frame dimensions not measured.'),
          },
          {
            label: fixedText(locale, 'recommendedClearRoomWidth', 'Recommended clear room width'),
            valueMm: plan.recommendedWidthMm,
          },
          {
            label: fixedText(locale, 'recommendedClearRoomLength', 'Recommended clear room length'),
            valueMm: plan.recommendedLengthMm,
          },
        ],
        assumptions: [
          fixedText(
            locale,
            'recommendedPlanningNotCode',
            'Recommended clear dimensions are planning guidance, not code minimums.',
          ),
          ...bedRules.map((rule) => ruleAssumption(rule, locale)),
        ],
      };
    }
    throw new Error(`Comparison renderer does not support '${entity.category}' entities.`);
  });
  const sources = collectSources(dataset, entities, bedRules);
  const bedPlans = bedEntities
    .map((bed) => {
      const plan = bedRoomPlan(bed, dataset);
      const bedName =
        locale === 'en' ? bedDisplayName(bed.name) : localizedBedName(bed.name, locale);
      const marketName = bed.frameModelName
        ? familyTemplate(locale, 'modelWithFrame', `${bedName} in ${bed.frameModelName}`, {
            bed: bedName,
            frame: bed.frameModelName,
          })
        : familyTemplate(locale, 'mattressOnly', `${bedName} mattress-only`, { bed: bedName });
      return familyTemplate(
        locale,
        'bedPlan',
        `${marketName}: recommended clear rectangle about ${formatPlanningDimension(plan.recommendedWidthMm)} wide by ${formatPlanningDimension(plan.recommendedLengthMm)} long`,
        {
          model: marketName,
          width: formatPlanningDimension(plan.recommendedWidthMm),
          length: formatPlanningDimension(plan.recommendedLengthMm),
        },
      );
    })
    .join('; ');
  const isDisplayComparison = entities.some((entity) => entity.category === 'display');
  const intro = isBedCompare
    ? familyTemplate(
        locale,
        'comparisonBedIntro',
        `${bedPlans}. These are market-specific planning estimates, not code minimums; only named frame examples include a frame, and furniture, doors and circulation remain excluded.`,
        { plans: bedPlans },
      )
    : familyTemplate(
        locale,
        'comparisonIntro',
        `${intent.primaryQuery}: compare the listed physical dimensions and their market/source basis.${isDisplayComparison ? ' Screen-panel dimensions are distinguished from outer-device widths where provided.' : ''}`,
        {
          query: intent.primaryQuery,
          screenNote: isDisplayComparison
            ? familyTemplate(
                locale,
                'comparisonScreenNote',
                ' Screen-panel dimensions are distinguished from outer-device widths where provided.',
                {},
              )
            : '',
        },
      );
  return {
    intro,
    sections,
    sources,
  };
}

function clearanceAnswer(intent: PageIntent, dataset: Dataset, locale: Locale): FamilyAnswer {
  const ruleIds = BED_CLEARANCE_RULES[intent.id];
  if (!ruleIds) throw new Error(`No clearance rules configured for '${intent.id}'.`);
  const rules = ruleIds.map((id) => ruleById(dataset, id));
  return {
    intro: familyTemplate(
      locale,
      'clearanceIntro',
      'These values are guidance for arranging a bed, not building-code or accessibility minimums. The source wording and market/context assumptions are shown alongside each value.',
      {},
    ),
    sections: rules.map((rule) => ({
      title:
        rule.dimension === 'left'
          ? fixedText(locale, 'sideAccess', 'Side access beside the bed')
          : fixedText(locale, 'footClearance', 'Clearance at the foot of the bed'),
      facts: [
        { label: fixedText(locale, 'context', 'Context'), valueText: rule.context },
        {
          label: fixedText(locale, 'codeMinimum', 'Code minimum'),
          valueText: fixedText(
            locale,
            'noUniversalCodeMinimum',
            'No universal code minimum asserted by this source.',
          ),
        },
        {
          label: fixedText(locale, 'recommendedClearance', 'Recommended clearance'),
          valueMm: requiredMeasurement(rule, 'recommendedMm').valueMm,
          note: requiredMeasurement(rule, 'recommendedMm').note ?? rule.notes,
        },
      ],
      assumptions: [rule.notes ?? '', ruleAssumption(rule, locale)].filter(Boolean),
    })),
    sources: collectSources(dataset, [], rules),
  };
}

export function buildFamilyAnswer(
  intent: PageIntent,
  dataset: Dataset,
  locale: Locale = 'en',
): FamilyAnswer {
  switch (intent.family) {
    case 'object_to_space':
      return intent.cluster === 'workspace'
        ? workspaceObjectAnswer(intent, dataset, locale)
        : bedObjectAnswer(intent, dataset, locale);
    case 'space_to_object':
      return intent.cluster === 'workspace'
        ? workspaceSpaceAnswer(intent, dataset, locale)
        : bedroomSpaceAnswer(intent, dataset, locale);
    case 'comparison':
      return comparisonAnswer(intent, dataset, locale);
    case 'clearance':
      return clearanceAnswer(intent, dataset, locale);
    default:
      throw new Error(`No family answer renderer configured for '${intent.family}'.`);
  }
}
