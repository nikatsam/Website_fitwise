import type { CeilingFanPlan, ChristmasTreePlan } from '../geometry';
import { formatMeasurement, MM_PER_FOOT, MM_PER_INCH } from '../units';
import type { Locale } from '../../i18n/locale';
import { translate, translateTemplate } from '../../i18n/text';

/** Dual-unit span that follows the page's metric/imperial toggle. */
export function unitHtml(mm: number): string {
  return `<span class="unit-value"><span data-unit="metric">${formatMeasurement(mm, 'metric')}</span><span data-unit="separator" aria-hidden="true"> / </span><span data-unit="imperial">${formatMeasurement(mm, 'imperial')}</span></span>`;
}

function inchesHtml(inches: number): string {
  return unitHtml(Math.round(inches * MM_PER_INCH));
}

function feetLabel(feet: number): string {
  return `${feet} ft`;
}

function li(html: string): string {
  return `<li>${html}</li>`;
}

export interface FanAnswerValues {
  bladeSpanMm: number;
  downrodMm: number;
  preferredBladeHeightMm: number;
}

/** Headline answers for the fan tool; identical markup on the server and in the browser. */
export function fanAnswerHtml(
  plan: CeilingFanPlan,
  values: FanAnswerValues,
  locale: Locale,
): string {
  const t = (source: string, data: Record<string, string | number>) =>
    translateTemplate(locale, source, data);
  const items: string[] = [];
  const areaM2 = Math.round(plan.roomAreaSqFt * 0.092903 * 10) / 10;
  items.push(
    plan.spanBand
      ? t('Room area {sqft} sq ft ({m2} m²): the sizing chart suggests a {range} blade span.', {
          sqft: plan.roomAreaSqFt,
          m2: areaM2,
          range:
            plan.spanBand.minSpanIn === plan.spanBand.maxSpanIn
              ? `${plan.spanBand.minSpanIn} in (${Math.round(plan.spanBand.minSpanMm / 10)} cm)`
              : `${plan.spanBand.minSpanIn}–${plan.spanBand.maxSpanIn} in (${Math.round(plan.spanBand.minSpanMm / 10)}–${Math.round(plan.spanBand.maxSpanMm / 10)} cm)`,
        })
      : t(
          'Room area {sqft} sq ft ({m2} m²) is larger than the 400 sq ft sizing chart; consider a larger fan or two fans and check the manufacturer’s coverage rating.',
          { sqft: plan.roomAreaSqFt, m2: areaM2 },
        ),
  );
  if (plan.spanBand) {
    const spanIn = values.bladeSpanMm / MM_PER_INCH;
    if (spanIn < plan.spanBand.minSpanIn - 0.5) {
      items.push(
        translate(locale, 'Your entered blade span is below the chart range for this room.'),
      );
    } else if (spanIn > plan.spanBand.maxSpanIn + 0.5) {
      items.push(
        translate(locale, 'Your entered blade span is above the chart range for this room.'),
      );
    } else {
      items.push(
        translate(locale, 'Your entered blade span is within the chart range for this room.'),
      );
    }
  }
  items.push(
    t('Blades will sit {height} above the floor.', { height: unitHtml(plan.bladeHeightMm) }),
  );
  if (plan.needsLowProfile) {
    items.push(
      translate(
        locale,
        'Even without a downrod the blades are below your minimum height. Look for a low-profile (hugger) fan with a smaller ceiling-to-blade drop, or reconsider the location.',
      ),
    );
  } else if (plan.idealDownrodMm === 0) {
    items.push(
      t('No extra downrod is needed to reach your {height} blade-height target.', {
        height: unitHtml(values.preferredBladeHeightMm),
      }),
    );
  } else {
    items.push(
      t('Downrod for your {height} blade-height target: about {ideal}{standard}.', {
        height: unitHtml(values.preferredBladeHeightMm),
        ideal: unitHtml(plan.idealDownrodMm),
        standard:
          plan.suggestedStandardDownrodIn !== null
            ? translateTemplate(locale, ' (nearest standard length not over it: {length})', {
                length: inchesHtml(plan.suggestedStandardDownrodIn),
              })
            : '',
      }),
    );
  }
  if (!plan.needsLowProfile) {
    items.push(
      t('Longest downrod that keeps your minimum blade height: {max}.', {
        max: unitHtml(plan.maxDownrodMm),
      }),
    );
  }
  if (plan.bladeHeightMm > 9 * MM_PER_FOOT + 1) {
    items.push(
      translate(
        locale,
        'Blades above about 9 ft move less air at seated height; a longer downrod may help.',
      ),
    );
  }
  return `<ul class="fit-answer__list">${items.map(li).join('')}</ul>`;
}

export function fanAssumptions(locale: Locale): string[] {
  return [
    translate(
      locale,
      'Blade-span guidance uses the ENERGY STAR room-size chart (credited to the American Lighting Association); it is a starting point, not a performance rating.',
    ),
    translate(
      locale,
      'The 7 ft minimum blade height and 18 in wall clearance defaults are ENERGY STAR placement guidance; your fan manual and local electrical rules take precedence.',
    ),
    translate(
      locale,
      'Blade height is the ceiling height minus the fan’s ceiling-to-blade drop and any extra downrod. Sloped ceilings, light kits below the blades and canopy adapters are not modelled.',
    ),
    translate(
      locale,
      'The fan is assumed to be centered; wall clearance is checked across the shorter room side.',
    ),
  ];
}

/** Headline answers for the tree tool. */
export function treeAnswerHtml(plan: ChristmasTreePlan, locale: Locale): string {
  const items: string[] = [];
  if (plan.maxTreeHeightMm <= 0) {
    items.push(
      translate(
        locale,
        'The stand, topper and ceiling gap already use the full ceiling height; reduce the topper or gap.',
      ),
    );
  } else {
    items.push(
      translateTemplate(locale, 'Tallest tree for your ceiling, stand, topper and gap: {height}.', {
        height: unitHtml(plan.maxTreeHeightMm),
      }),
    );
    items.push(
      plan.suggestedStandardHeightFt !== null
        ? translateTemplate(locale, 'Largest common shop size that fits: {size} tree.', {
            size: `${feetLabel(plan.suggestedStandardHeightFt)} (${formatMeasurement(Math.round(plan.suggestedStandardHeightFt * MM_PER_FOOT), 'metric')})`,
          })
        : translate(locale, 'No common shop size (4 ft and up) fits under these settings.'),
    );
  }
  items.push(
    translateTemplate(locale, 'Your entered tree, stand and topper stack up to {height}.', {
      height: unitHtml(plan.stackHeightMm),
    }),
  );
  return `<ul class="fit-answer__list">${items.map(li).join('')}</ul>`;
}

export function treeAssumptions(locale: Locale, checkFloor: boolean): string[] {
  return [
    translate(
      locale,
      'Most artificial trees are sold by height measured from the bottom of the stand to the tip; enter extra stand lift only when the listed height excludes the stand (common for real trees).',
    ),
    translate(
      locale,
      'The default 6 in gap between the topper and the ceiling follows Balsam Hill’s published guidance; it is a user-editable target, not a rule.',
    ),
    checkFloor
      ? translate(
          locale,
          'Floor space treats the tree as a circle of the listed base diameter inside a rectangle; branch shaping and nearby furniture are not modelled.',
        )
      : translate(locale, 'Floor space is not checked.'),
  ];
}
