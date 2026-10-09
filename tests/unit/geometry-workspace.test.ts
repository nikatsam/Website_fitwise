import { describe, expect, it } from 'vitest';
import {
  deriveScreenDimensions,
  MONITOR_ASPECT_RATIOS,
  resolveMonitorWidth,
  buildWorkspaceConfigurationCheck,
  computeConfigurationWidth,
  buildWorkspaceWidthCheck,
  buildWorkspaceDepthCheck,
  DERIVE_SCREEN_DIMS_FROM_DIAGONAL_ASPECT,
} from '../../src/lib/geometry';
import { evaluateFit } from '../../src/lib/fit';

describe('deriveScreenDimensions', () => {
  it('derives a 27" 16:9 screen whose width/height reconstruct the original diagonal', () => {
    const { screenWidthMm, screenHeightMm } = deriveScreenDimensions(27, { width: 16, height: 9 });
    const reconstructedDiagonalInches =
      Math.sqrt(screenWidthMm.valueMm ** 2 + screenHeightMm.valueMm ** 2) / 25.4;
    expect(reconstructedDiagonalInches).toBeCloseTo(27, 6);
    expect(screenWidthMm.valueMm / screenHeightMm.valueMm).toBeCloseTo(16 / 9, 6);
  });

  it('always marks the result as derived, never a sourced/exact overall dimension', () => {
    const { screenWidthMm, screenHeightMm } = deriveScreenDimensions(24, { width: 16, height: 9 });
    expect(screenWidthMm.kind).toBe('derived');
    expect(screenHeightMm.kind).toBe('derived');
    expect(screenWidthMm.derivationId).toBe(DERIVE_SCREEN_DIMS_FROM_DIAGONAL_ASPECT);
    expect(screenHeightMm.derivationId).toBe(DERIVE_SCREEN_DIMS_FROM_DIAGONAL_ASPECT);
  });

  it('rejects non-positive diagonal or aspect ratio components', () => {
    expect(() => deriveScreenDimensions(0, { width: 16, height: 9 })).toThrow(RangeError);
    expect(() => deriveScreenDimensions(27, { width: 0, height: 9 })).toThrow(RangeError);
    expect(() =>
      deriveScreenDimensions(Number.POSITIVE_INFINITY, { width: 16, height: 9 }),
    ).toThrow(RangeError);
    expect(() => deriveScreenDimensions(27, { width: Number.NaN, height: 9 })).toThrow(RangeError);
  });

  it('supports ultrawide aspect presets without treating panel width as full device width', () => {
    const dimensions = deriveScreenDimensions(49, MONITOR_ASPECT_RATIOS['32:9']);
    expect(dimensions.screenWidthMm.valueMm).toBeCloseTo(1198, 0);
    expect(dimensions.screenWidthMm.kind).toBe('derived');
  });

  it('rounds derived screen-only fit widths to a consistent whole millimetre', () => {
    const derived = deriveScreenDimensions(27, MONITOR_ASPECT_RATIOS['16:9']);
    expect(derived.screenWidthMm.valueMm).toBeCloseTo(597.727, 2);
    expect(resolveMonitorWidth({ screenWidthMm: derived.screenWidthMm }).valueMm).toBe(598);
  });
});

describe('resolveMonitorWidth — screen-only vs overall provenance', () => {
  it('prefers sourced overallWidthMm over derived screenWidthMm', () => {
    const resolved = resolveMonitorWidth({
      overallWidthMm: { valueMm: 613, kind: 'typical', sourceId: 'src-vesa-2024' },
      screenWidthMm: { valueMm: 598, kind: 'derived', derivationId: 'x' },
    });
    expect(resolved).toEqual({ valueMm: 613, basis: 'overall' });
  });

  it('falls back to screenWidthMm and explicitly flags it as an approximation', () => {
    const resolved = resolveMonitorWidth({
      screenWidthMm: { valueMm: 598, kind: 'derived', derivationId: 'x' },
    });
    expect(resolved).toEqual({ valueMm: 598, basis: 'screen_only_approximation' });
  });

  it('never treats active panel width as outer device width', () => {
    const resolved = resolveMonitorWidth({
      screenWidthMm: { valueMm: 1190, kind: 'derived', derivationId: 'x' },
      activeWidthMm: {
        valueMm: 1195.8,
        kind: 'typical',
        sourceId: 'src-samsung-lc49hg90-49in',
        note: 'Panel only; bezel excluded.',
      },
    });
    expect(resolved.valueMm).toBe(1190);
    expect(resolved.basis).toBe('screen_only_approximation');
    expect(resolved.note).toBe('Panel only; bezel excluded.');
  });

  it('throws when neither width source is available (never invents a number)', () => {
    expect(() => resolveMonitorWidth({})).toThrow();
  });
});

describe('computeConfigurationWidth — known fixtures', () => {
  it('computes a single monitor with no gap', () => {
    expect(computeConfigurationWidth({ widthsMm: [613], gapMm: 20 })).toBe(613);
  });

  it('computes two 613 mm monitors with a 20 mm gap as 1246 mm', () => {
    expect(computeConfigurationWidth({ widthsMm: [613, 613], gapMm: 20 })).toBe(1246);
  });

  it('computes three monitors with two gaps applied', () => {
    expect(computeConfigurationWidth({ widthsMm: [600, 600, 600], gapMm: 10 })).toBe(1820);
  });

  it('computes four-monitor configurations with three inter-monitor gaps', () => {
    expect(computeConfigurationWidth({ widthsMm: [500, 500, 500, 500], gapMm: 12 })).toBe(2036);
  });

  it('rejects an empty monitor list, a non-positive width, or a negative gap', () => {
    expect(() => computeConfigurationWidth({ widthsMm: [], gapMm: 0 })).toThrow(RangeError);
    expect(() => computeConfigurationWidth({ widthsMm: [0], gapMm: 0 })).toThrow(RangeError);
    expect(() => computeConfigurationWidth({ widthsMm: [600], gapMm: -1 })).toThrow(RangeError);
    expect(() =>
      computeConfigurationWidth({ widthsMm: [Number.POSITIVE_INFINITY], gapMm: 0 }),
    ).toThrow(RangeError);
    expect(() => computeConfigurationWidth({ widthsMm: [600], gapMm: Number.NaN })).toThrow(
      RangeError,
    );
  });
});

describe('workspace fit — known fixture end to end', () => {
  // Two 613 mm monitors, 20 mm gap => 1246 mm hard footprint; 38 mm recommended
  // side margins => 1322 mm recommended envelope (matches specs/ARCHITECTURE.md
  // §4's 38 mm example margin).
  const configurationWidthMm = computeConfigurationWidth({ widthsMm: [613, 613], gapMm: 20 });

  it('rejects negative recommendations and non-finite desk/configuration dimensions', () => {
    expect(() =>
      buildWorkspaceWidthCheck({
        configurationWidthMm: 1000,
        sideMarginRecommendedMm: -1,
        deskWidthMm: 1400,
      }),
    ).toThrow(RangeError);
    expect(() =>
      buildWorkspaceWidthCheck({ configurationWidthMm: 1000, deskWidthMm: Number.NaN }),
    ).toThrow(RangeError);
    expect(() =>
      buildWorkspaceWidthCheck({
        configurationWidthMm: Number.POSITIVE_INFINITY,
        deskWidthMm: 1400,
      }),
    ).toThrow(RangeError);
  });

  it('fits comfortably on a 1400 mm desk', () => {
    const check = buildWorkspaceWidthCheck({
      configurationWidthMm,
      sideMarginRecommendedMm: 38,
      deskWidthMm: 1400,
    });
    const result = evaluateFit([check]);
    expect(result.state).toBe('fits');
    expect(result.marginsMm.width).toBe(1400 - configurationWidthMm);
  });

  it('is tight on a 1300 mm desk (hard fit, missed recommendation)', () => {
    const check = buildWorkspaceWidthCheck({
      configurationWidthMm,
      sideMarginRecommendedMm: 38,
      deskWidthMm: 1300,
    });
    const result = evaluateFit([check]);
    expect(result.state).toBe('tight');
    expect(result.hardFit).toBe(true);
  });

  it('does not fit a 1200 mm desk', () => {
    const check = buildWorkspaceWidthCheck({
      configurationWidthMm,
      sideMarginRecommendedMm: 38,
      deskWidthMm: 1200,
    });
    const result = evaluateFit([check]);
    expect(result.state).toBe('does_not_fit');
  });
});

describe('shared dual-27 monitor workspace configuration', () => {
  const monitorWidthMm = resolveMonitorWidth({
    screenWidthMm: deriveScreenDimensions(27, MONITOR_ASPECT_RATIOS['16:9']).screenWidthMm,
  }).valueMm;

  it('uses one footprint and recommendation for the calculator and all desk comparisons', () => {
    expect(monitorWidthMm).toBe(598);
    const on1400 = buildWorkspaceConfigurationCheck({
      widthsMm: [monitorWidthMm, monitorWidthMm],
      gapMm: 20,
      sideMarginRecommendedMm: 38,
      deskWidthMm: 1400,
    });
    const on1200 = buildWorkspaceConfigurationCheck({
      widthsMm: [monitorWidthMm, monitorWidthMm],
      gapMm: 20,
      sideMarginRecommendedMm: 38,
      deskWidthMm: 1200,
    });

    expect(on1400.configurationWidthMm).toBe(1216);
    expect(on1400.check.minimumMm).toBe(1216);
    expect(on1400.check.recommendedMm).toBe(1292);
    expect(on1400.check.availableMm - on1400.check.minimumMm).toBe(184);
    expect(on1400.check.availableMm - on1400.check.recommendedMm!).toBe(108);
    expect(evaluateFit([on1400.check]).state).toBe('fits');

    expect(on1200.configurationWidthMm).toBe(on1400.configurationWidthMm);
    expect(on1200.check.availableMm - on1200.check.minimumMm).toBe(-16);
    expect(on1200.check.availableMm - on1200.check.recommendedMm!).toBe(-92);
    expect(evaluateFit([on1200.check]).state).toBe('does_not_fit');
  });
});

describe('buildWorkspaceDepthCheck — user-selected zones', () => {
  it('separates the monitor stand/rear cable footprint from a user-selected keyboard zone', () => {
    const check = buildWorkspaceDepthCheck({
      monitorStandDepthMm: 193.5,
      rearClearanceMm: 20,
      keyboardZoneMm: 300,
      deskDepthMm: 600,
    });
    expect(check.minimumMm).toBe(213.5);
    expect(check.recommendedMm).toBe(513.5);
    expect(evaluateFit([check]).state).toBe('fits');
  });

  it('reports a tight selected depth envelope without claiming a universal clearance', () => {
    const check = buildWorkspaceDepthCheck({
      monitorStandDepthMm: 193.5,
      rearClearanceMm: 20,
      keyboardZoneMm: 350,
      deskDepthMm: 550,
    });
    expect(evaluateFit([check]).state).toBe('tight');
  });

  it('rejects invalid device or user-specified depth zones', () => {
    expect(() => buildWorkspaceDepthCheck({ monitorStandDepthMm: 0, deskDepthMm: 600 })).toThrow(
      RangeError,
    );
    expect(() =>
      buildWorkspaceDepthCheck({
        monitorStandDepthMm: 193.5,
        rearClearanceMm: -1,
        deskDepthMm: 600,
      }),
    ).toThrow(RangeError);
  });
});
