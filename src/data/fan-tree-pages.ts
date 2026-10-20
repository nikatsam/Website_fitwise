/**
 * Ceiling-fan and Christmas-tree sizing pages: one canonical tool per topic
 * plus a small set of long-tail variants. Each variant pre-fills the tool and
 * states a computed answer, so it is a distinct result rather than a doorway.
 */
import type { FeaturePageInputShape, FeaturePageRecord } from './feature-pages';
import {
  buildCeilingFanPlan,
  CEILING_FAN_DEFAULTS,
  maxTreeHeightForCeiling,
  suggestedStandardTreeHeightFt,
} from '../lib/geometry';
import { feetToMm, formatMeasurement, inchesToMm, MM_PER_INCH } from '../lib/units';

export const CEILING_FAN_HUB_ID = 'pi-feature-ceiling-fan-size';
export const CHRISTMAS_TREE_HUB_ID = 'pi-feature-christmas-tree-size';
const FIT_CHECKS_ID = 'pi-feature-fit-checks-directory';
const RELEASE = '2026-10-20';

export const FAN_ROOM_VARIANTS = [
  { widthFt: 10, lengthFt: 10 },
  { widthFt: 10, lengthFt: 12 },
  { widthFt: 12, lengthFt: 12 },
  { widthFt: 15, lengthFt: 15 },
] as const;

export const TREE_CEILING_VARIANTS = [8, 9, 10, 12] as const;

const ft = (value: number) => Math.round(feetToMm(value));
const both = (mm: number) => formatMeasurement(mm, 'both');
/** English indefinite article for a spoken number (8, 11, 18, 80… take “an”). */
const article = (value: number) => (/^(8|11|18)(D|$)/.test(String(value)) ? 'an' : 'a');

export function fanVariantId(widthFt: number, lengthFt: number): string {
  return `pi-feature-ceiling-fan-${widthFt}x${lengthFt}`;
}

export function fanVariantRoute(widthFt: number, lengthFt: number): string {
  return `/ceiling-fan-size/${widthFt}x${lengthFt}-room/`;
}

export function treeVariantId(ceilingFt: number): string {
  return `pi-feature-christmas-tree-${ceilingFt}ft-ceiling`;
}

export function treeVariantRoute(ceilingFt: number): string {
  return `/christmas-tree-size/${ceilingFt}-foot-ceiling/`;
}

/** Computed facts shared by the English and Spanish variant copy. */
export function fanVariantFacts(widthFt: number, lengthFt: number) {
  const base = {
    roomWidthMm: ft(widthFt),
    roomLengthMm: ft(lengthFt),
    bladeSpanMm: Math.round(inchesToMm(42)),
    fanDropMm: CEILING_FAN_DEFAULTS.fanDropMm,
    downrodMm: 0,
  };
  const at = (ceilingFt: number) =>
    buildCeilingFanPlan({ ...base, ceilingHeightMm: ft(ceilingFt) });
  const plan8 = at(8);
  const band = plan8.spanBand;
  return {
    areaSqFt: Math.round(plan8.roomAreaSqFt),
    spanText: band
      ? band.minSpanIn === band.maxSpanIn
        ? `${band.minSpanIn} in`
        : `${band.minSpanIn}–${band.maxSpanIn} in`
      : '',
    spanMidMm: band ? Math.round(((band.minSpanIn + band.maxSpanIn) / 2) * MM_PER_INCH) : 0,
    blade8Mm: plan8.bladeHeightMm,
    downrod9In: at(9).suggestedStandardDownrodIn,
    downrod10In: at(10).suggestedStandardDownrodIn,
  };
}

export function treeVariantFacts(ceilingFt: number) {
  const maxMm = maxTreeHeightForCeiling(ft(ceilingFt));
  return {
    maxMm,
    standardFt: suggestedStandardTreeHeightFt(maxMm),
    noTopperFt: suggestedStandardTreeHeightFt(maxTreeHeightForCeiling(ft(ceilingFt), 0, 0)),
  };
}

const fanLimitations = [
  'Blade-span guidance is the ENERGY STAR room-size chart (credited to the American Lighting Association); airflow (CFM) ratings, motor efficiency and room shape still matter.',
  'The 7 ft minimum and 18 in wall clearance are ENERGY STAR placement guidance. Your fan manual, local electrical code and a qualified installer take precedence.',
  'Sloped or vaulted ceilings, light kits that hang below the blades and ceiling-box load ratings are not modelled.',
];

const treeLimitations = [
  'Tree heights vary by brand; check whether the listed height includes the stand before buying.',
  'Real trees can grow or settle once cut and placed in a stand; leave a little extra margin.',
  'Fire safety, heat sources, outlets and furniture placement are not checked.',
];

type Define = (input: FeaturePageInputShape) => FeaturePageRecord;

export function buildFanTreePages(definePage: Define): FeaturePageRecord[] {
  const fanVariantIds = FAN_ROOM_VARIANTS.map((v) => fanVariantId(v.widthFt, v.lengthFt));
  const treeVariantIds = TREE_CEILING_VARIANTS.map(treeVariantId);
  const pages: FeaturePageRecord[] = [];

  pages.push(
    definePage({
      id: CEILING_FAN_HUB_ID,
      route: '/ceiling-fan-size/',
      family: 'configuration',
      cluster: 'living',
      query: 'what size ceiling fan do i need',
      title: 'Ceiling Fan Size Calculator: Room Size, Height and Downrod — Fitwise.stream',
      description:
        'Find the right ceiling fan blade span for your room, the downrod length for your ceiling height, and check the 7 ft floor and 18 in wall clearances.',
      h1: 'What size ceiling fan do you need?',
      breadcrumbLabel: 'Ceiling fan size',
      kind: 'tool',
      toolRenderer: 'ceiling-fan',
      intro:
        'Enter your room and ceiling height to get a recommended blade span, the downrod length that puts the blades at a comfortable height, and a clearance check for the fan you are considering.',
      calculation:
        'Room area is matched to the ENERGY STAR blade-span chart. Blade height is the ceiling height minus the fan’s ceiling-to-blade drop and any downrod, checked against your minimum (default 7 ft) and preferred (default 8 ft) heights. Blade tips are checked against the shorter room side plus your wall clearance (default 18 in).',
      limitations: fanLimitations,
      breadcrumbIds: [FIT_CHECKS_ID],
      relatedPageIds: [...fanVariantIds, 'pi-feature-bedroom', FIT_CHECKS_ID],
      relatedReasons: {
        '/bedroom/': 'Check the bed and furniture layout for the same room.',
        '/fit-checks/': 'Browse the other fit calculators by task.',
      },
      sourceIds: ['src-energy-star-ceiling-fan-basics'],
      publishedOn: RELEASE,
      justification:
        'AuditOpus20-10-2026 keyword study: “what size ceiling fan for … room” long tail with weak SERP competition. Unique calculated sizing, downrod and clearance answer.',
      intentEvidence:
        'Google Autocomplete (20-10-2026) returns room-size modifiers (10x10, 10x12, 12x12, bedroom, living room); sampled SERP dominated by thin/spam pages. Volume estimated, not tool-verified.',
    }),
  );

  for (const { widthFt, lengthFt } of FAN_ROOM_VARIANTS) {
    const facts = fanVariantFacts(widthFt, lengthFt);
    const id = fanVariantId(widthFt, lengthFt);
    const downrod9 =
      facts.downrod9In === null || facts.downrod9In === 0
        ? 'no extra downrod'
        : `about ${article(facts.downrod9In)} ${facts.downrod9In} in downrod`;
    const downrod10 =
      facts.downrod10In === null || facts.downrod10In === 0
        ? 'no extra downrod'
        : `about ${article(facts.downrod10In)} ${facts.downrod10In} in downrod`;
    pages.push(
      definePage({
        id,
        route: fanVariantRoute(widthFt, lengthFt),
        family: 'configuration',
        cluster: 'living',
        query: `what size ceiling fan for ${widthFt}x${lengthFt} room`,
        title: `What Size Ceiling Fan for a ${widthFt}x${lengthFt} Room? — Fitwise.stream`,
        description: `A ${widthFt}×${lengthFt} ft room is ${facts.areaSqFt} sq ft, so the ENERGY STAR chart suggests a ${facts.spanText} ceiling fan. Check blade height and downrod for your ceiling.`,
        h1: `What size ceiling fan for a ${widthFt}×${lengthFt} room?`,
        breadcrumbLabel: `${widthFt}×${lengthFt} room`,
        kind: 'tool',
        toolRenderer: 'ceiling-fan',
        toolDefaults: {
          roomWidthMm: ft(widthFt),
          roomLengthMm: ft(lengthFt),
          ceilingHeightMm: ft(8),
          bladeSpanMm: facts.spanMidMm,
        },
        intro: `A ${widthFt}×${lengthFt} ft room is ${facts.areaSqFt} sq ft, so the ENERGY STAR sizing chart suggests a ${facts.spanText} blade span. On an 8 ft ceiling a standard fan’s blades sit about ${both(facts.blade8Mm)} above the floor: above the 7 ft minimum, but below the 8–9 ft airflow target, so a flush or low-profile mount is usual. On a 9 ft ceiling you need ${downrod9}; on a 10 ft ceiling, ${downrod10}.`,
        calculation:
          'The calculator below is pre-filled with this room and an 8 ft ceiling. Change the ceiling height, blade span and your fan’s ceiling-to-blade drop to see the blade height, recommended downrod and wall clearance for your exact fan.',
        limitations: fanLimitations,
        breadcrumbIds: [FIT_CHECKS_ID, CEILING_FAN_HUB_ID],
        relatedPageIds: [CEILING_FAN_HUB_ID, ...fanVariantIds.filter((other) => other !== id)],
        relatedReasons: {
          '/ceiling-fan-size/': 'Use the full calculator for any room size and ceiling height.',
        },
        sourceIds: ['src-energy-star-ceiling-fan-basics'],
        publishedOn: RELEASE,
        justification:
          'Long-tail room-size variant with a distinct computed span, blade height and downrod answer.',
        intentEvidence: `Google Autocomplete (20-10-2026) suggests “what size ceiling fan for ${widthFt}x${lengthFt} room” or a close room-size variant.`,
      }),
    );
  }

  pages.push(
    definePage({
      id: CHRISTMAS_TREE_HUB_ID,
      route: '/christmas-tree-size/',
      family: 'configuration',
      cluster: 'living',
      query: 'what size christmas tree for my ceiling height',
      title: 'Christmas Tree Size Calculator for Your Ceiling Height — Fitwise.stream',
      description:
        'Find the tallest Christmas tree for your ceiling once the stand, topper and a safe gap are counted, and check that the tree’s width fits your floor space.',
      h1: 'What size Christmas tree fits your ceiling?',
      breadcrumbLabel: 'Christmas tree size',
      kind: 'tool',
      toolRenderer: 'christmas-tree',
      intro:
        'Enter your ceiling height, topper and tree to see the tallest tree that fits with room to spare, the largest common shop size, and whether the tree’s base fits the corner you have in mind.',
      calculation:
        'Stand lift + listed tree height + topper height must fit under the ceiling; your chosen gap (default 6 in) is the target margin. The tallest tree is the ceiling height minus the stand lift, topper and gap. Floor space compares the tree’s base diameter, plus optional clearance, with the width and depth of the spot.',
      limitations: treeLimitations,
      breadcrumbIds: [FIT_CHECKS_ID],
      relatedPageIds: [...treeVariantIds, 'pi-feature-rug-fit', FIT_CHECKS_ID],
      relatedReasons: {
        '/rug-fit/': 'Check a rug or tree mat against the room and furniture.',
        '/fit-checks/': 'Browse the other fit calculators by task.',
      },
      sourceIds: ['src-balsam-hill-tree-height'],
      publishedOn: RELEASE,
      justification:
        'AuditOpus20-10-2026 keyword study: seasonal “what size christmas tree for … ceiling” long tail where retailer guides disagree. Unique calculated stack and floor answer.',
      intentEvidence:
        'Google Autocomplete (20-10-2026) returns 8, 9, 12 and 18 ft ceiling modifiers. Sampled SERP is retailer guides that disagree, plus parasite pages. Volume estimated, not tool-verified.',
    }),
  );

  for (const ceilingFt of TREE_CEILING_VARIANTS) {
    const facts = treeVariantFacts(ceilingFt);
    const id = treeVariantId(ceilingFt);
    const sizeText =
      facts.standardFt === null
        ? 'no common size'
        : `${article(facts.standardFt)} ${facts.standardFt} ft tree`;
    pages.push(
      definePage({
        id,
        route: treeVariantRoute(ceilingFt),
        family: 'configuration',
        cluster: 'living',
        query: `what size christmas tree for ${ceilingFt} foot ceiling`,
        title: `What Size Christmas Tree for a ${ceilingFt} ft Ceiling? — Fitwise.stream`,
        description: `With a 12 in topper and a 6 in gap, the tallest tree for a ${ceilingFt} ft ceiling is ${both(facts.maxMm)}, so choose ${sizeText}. Adjust for your stand and topper.`,
        h1: `What size Christmas tree for a ${ceilingFt} ft ceiling?`,
        breadcrumbLabel: `${ceilingFt} ft ceiling`,
        kind: 'tool',
        toolRenderer: 'christmas-tree',
        toolDefaults: { ceilingHeightMm: ft(ceilingFt) },
        intro: `For a ${ceilingFt} ft ceiling, a 12 in star or angel and a 6 in gap leave room for a tree up to ${both(facts.maxMm)} tall, measured from the bottom of the stand. The largest common shop size that fits is ${sizeText}. Without a topper, ${facts.noTopperFt === null ? 'no common size' : `${article(facts.noTopperFt)} ${facts.noTopperFt} ft tree`} still fits. A real tree in a stand that adds height needs a shorter tree.`,
        calculation:
          'The calculator below is pre-filled with this ceiling height and the tallest common tree that fits. Change the topper, stand lift and gap to match your setup, and check the tree’s base diameter against your floor space.',
        limitations: treeLimitations,
        breadcrumbIds: [FIT_CHECKS_ID, CHRISTMAS_TREE_HUB_ID],
        relatedPageIds: [CHRISTMAS_TREE_HUB_ID, ...treeVariantIds.filter((other) => other !== id)],
        relatedReasons: {
          '/christmas-tree-size/': 'Use the full calculator for any ceiling, stand and topper.',
        },
        sourceIds: ['src-balsam-hill-tree-height'],
        publishedOn: RELEASE,
        justification:
          'Long-tail ceiling-height variant with a distinct computed maximum tree height and shop size.',
        intentEvidence: `Google Autocomplete (20-10-2026) suggests “what size christmas tree for ${ceilingFt} foot ceiling” or a close ceiling-height variant.`,
      }),
    );
  }
  return pages;
}
