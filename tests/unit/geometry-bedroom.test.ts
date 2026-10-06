import { describe, expect, it } from 'vitest';
import {
  computeBedFootprint,
  applyOrientation,
  buildBedRoomChecks,
  type FrameAllowanceMm,
} from '../../src/lib/geometry';
import { evaluateFit } from '../../src/lib/fit';

const noAllowance: FrameAllowanceMm = { left: 0, right: 0, head: 0, foot: 0 };
const typicalAllowance: FrameAllowanceMm = { left: 50, right: 50, head: 30, foot: 30 };

// UK King per tests/fixtures/valid/sample-dataset.ts; US King is a distinct,
// larger market size, used to prove market-specific fixtures stay distinct.
const UK_KING = { widthMm: 1500, lengthMm: 2000 };
const US_KING = { widthMm: 1930, lengthMm: 2030 };

describe('computeBedFootprint', () => {
  it('adds frame allowance on every side', () => {
    const footprint = computeBedFootprint(1500, 2000, typicalAllowance);
    expect(footprint.widthMm).toBe(1500 + 50 + 50);
    expect(footprint.lengthMm).toBe(2000 + 30 + 30);
  });

  it('equals the mattress size when frame allowance is zero', () => {
    const footprint = computeBedFootprint(1500, 2000, noAllowance);
    expect(footprint).toEqual({ widthMm: 1500, lengthMm: 2000 });
  });

  it('rejects non-positive mattress dimensions', () => {
    expect(() => computeBedFootprint(0, 2000, noAllowance)).toThrow(RangeError);
    expect(() => computeBedFootprint(1500, 0, noAllowance)).toThrow(RangeError);
  });

  it('rejects negative or non-finite frame allowances', () => {
    expect(() => computeBedFootprint(1500, 2000, { ...noAllowance, left: -1 })).toThrow(RangeError);
    expect(() =>
      computeBedFootprint(1500, 2000, { ...noAllowance, foot: Number.POSITIVE_INFINITY }),
    ).toThrow(RangeError);
  });
});

describe('applyOrientation — orientation swap', () => {
  const footprint = { widthMm: 1600, lengthMm: 2060 };

  it('portrait keeps bed width on room width and bed length on room length', () => {
    expect(applyOrientation(footprint, 'portrait')).toEqual({
      roomWidthRequiredMm: 1600,
      roomLengthRequiredMm: 2060,
    });
  });

  it('landscape swaps the two axes', () => {
    expect(applyOrientation(footprint, 'landscape')).toEqual({
      roomWidthRequiredMm: 2060,
      roomLengthRequiredMm: 1600,
    });
  });

  it('rejects unsupported runtime orientation values', () => {
    expect(() => applyOrientation(footprint, 'sideways' as never)).toThrow(RangeError);
  });
});

describe('buildBedRoomChecks — frame allowance', () => {
  it('a larger frame allowance shrinks the hard margin by the same amount', () => {
    const base = buildBedRoomChecks({
      mattressWidthMm: UK_KING.widthMm,
      mattressLengthMm: UK_KING.lengthMm,
      frameAllowanceMm: noAllowance,
      orientation: 'portrait',
      roomWidthMm: 3048,
      roomLengthMm: 3658,
    });
    const withFrame = buildBedRoomChecks({
      mattressWidthMm: UK_KING.widthMm,
      mattressLengthMm: UK_KING.lengthMm,
      frameAllowanceMm: typicalAllowance,
      orientation: 'portrait',
      roomWidthMm: 3048,
      roomLengthMm: 3658,
    });
    const baseWidthMargin = evaluateFit(base).marginsMm.room_width!;
    const framedWidthMargin = evaluateFit(withFrame).marginsMm.room_width!;
    expect(baseWidthMargin - framedWidthMargin).toBe(
      typicalAllowance.left + typicalAllowance.right,
    );
  });
});

describe('buildBedRoomChecks — clearance boundaries', () => {
  const checksFor = (roomWidthMm: number) =>
    buildBedRoomChecks({
      mattressWidthMm: 1500,
      mattressLengthMm: 2000,
      frameAllowanceMm: noAllowance,
      orientation: 'portrait',
      sideClearanceRecommendedMm: 300,
      roomWidthMm,
      roomLengthMm: 4000,
    });

  it('exactly at the hard minimum (mattress width, no clearance) is a hard fit', () => {
    const result = evaluateFit(checksFor(1500));
    expect(result.hardFit).toBe(true);
  });

  it('1 mm under the hard minimum fails the hard fit', () => {
    const result = evaluateFit(checksFor(1499));
    expect(result.hardFit).toBe(false);
    expect(result.state).toBe('does_not_fit');
  });

  it('exactly at the recommended envelope (mattress + 2x300mm) satisfies the recommendation', () => {
    const result = evaluateFit(checksFor(1500 + 300 * 2));
    expect(result.recommendedFit).toBe(true);
    expect(result.state).toBe('fits');
  });

  it('1 mm under the recommended envelope is tight, not fits', () => {
    const result = evaluateFit(checksFor(1500 + 300 * 2 - 1));
    expect(result.hardFit).toBe(true);
    expect(result.state).toBe('tight');
  });

  it('rejects negative recommended clearance and invalid nightstand widths', () => {
    expect(() =>
      buildBedRoomChecks({
        mattressWidthMm: 1500,
        mattressLengthMm: 2000,
        frameAllowanceMm: noAllowance,
        orientation: 'portrait',
        sideClearanceRecommendedMm: -1,
        roomWidthMm: 3000,
        roomLengthMm: 4000,
      }),
    ).toThrow(RangeError);
    expect(() =>
      buildBedRoomChecks({
        mattressWidthMm: 1500,
        mattressLengthMm: 2000,
        frameAllowanceMm: noAllowance,
        orientation: 'portrait',
        footClearanceRecommendedMm: Number.POSITIVE_INFINITY,
        roomWidthMm: 3000,
        roomLengthMm: 4000,
      }),
    ).toThrow(RangeError);
    expect(() =>
      buildBedRoomChecks({
        mattressWidthMm: 1500,
        mattressLengthMm: 2000,
        frameAllowanceMm: noAllowance,
        orientation: 'portrait',
        nightstandWidthsMm: [400, -1],
        roomWidthMm: 3000,
        roomLengthMm: 4000,
      }),
    ).toThrow(RangeError);
  });
});

describe('buildBedRoomChecks — nightstands add to the hard width footprint', () => {
  it('adds each nightstand width to the room_width minimum', () => {
    const withoutNightstands = buildBedRoomChecks({
      mattressWidthMm: 1500,
      mattressLengthMm: 2000,
      frameAllowanceMm: noAllowance,
      orientation: 'portrait',
      roomWidthMm: 3000,
      roomLengthMm: 3000,
    });
    const withNightstands = buildBedRoomChecks({
      mattressWidthMm: 1500,
      mattressLengthMm: 2000,
      frameAllowanceMm: noAllowance,
      orientation: 'portrait',
      nightstandWidthsMm: [400, 400],
      roomWidthMm: 3000,
      roomLengthMm: 3000,
    });
    const minimumWithout = withoutNightstands.find((c) => c.dimension === 'room_width')!.minimumMm;
    const minimumWith = withNightstands.find((c) => c.dimension === 'room_width')!.minimumMm;
    expect(minimumWith - minimumWithout).toBe(800);
  });
});

describe('buildBedRoomChecks — market-specific fixtures remain distinct', () => {
  it('UK King and US King produce different, non-conflated fit results in the same room', () => {
    const roomWidthMm = 1800;
    const roomLengthMm = 2100;

    const ukResult = evaluateFit(
      buildBedRoomChecks({
        mattressWidthMm: UK_KING.widthMm,
        mattressLengthMm: UK_KING.lengthMm,
        frameAllowanceMm: noAllowance,
        orientation: 'portrait',
        roomWidthMm,
        roomLengthMm,
      }),
    );
    const usResult = evaluateFit(
      buildBedRoomChecks({
        mattressWidthMm: US_KING.widthMm,
        mattressLengthMm: US_KING.lengthMm,
        frameAllowanceMm: noAllowance,
        orientation: 'portrait',
        roomWidthMm,
        roomLengthMm,
      }),
    );

    // UK King (1500mm wide) fits a 1800mm-wide room; US King (1930mm wide) does not.
    expect(ukResult.hardFit).toBe(true);
    expect(usResult.hardFit).toBe(false);
    expect(ukResult.marginsMm.room_width).not.toBe(usResult.marginsMm.room_width);
  });
});
