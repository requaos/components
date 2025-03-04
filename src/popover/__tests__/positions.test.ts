// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
  calculatePosition,
  intersectRectangles,
  PRIORITY_MAPPING,
} from '../../../lib/components/popover/utils/positions';

const arrow = { width: 15, height: 15 };
const body = { width: 250, height: 250 };
const viewport = { top: 0, left: 0, height: 1000, width: 1000 };

describe('calculatePosition', () => {
  (
    [
      ['top', { top: 500, left: 500, height: 25, width: 25 }],
      ['right', { top: 500, left: 500, height: 25, width: 25 }],
      ['bottom', { top: 500, left: 500, height: 25, width: 25 }],
      ['left', { top: 500, left: 500, height: 25, width: 25 }],
    ] as const
  ).forEach(([preferred, trigger]) => {
    test(`takes first position for preferred="${preferred}" from priority mapping when enough space for it`, () => {
      const position = calculatePosition(preferred, trigger, arrow, body, viewport, viewport);
      expect(position.internalPosition).toBe(PRIORITY_MAPPING[preferred][0]);
    });
  });

  (
    [
      ['top', { top: 200, left: 500, height: 25, width: 25 }],
      ['right', { top: 800, left: 500, height: 25, width: 25 }],
      ['bottom', { top: 800, left: 500, height: 25, width: 25 }],
      ['left', { top: 800, left: 500, height: 25, width: 25 }],
    ] as const
  ).forEach(([preferred, trigger]) => {
    test(`takes second position for preferred="${preferred}" from priority mapping when enough space for first`, () => {
      const position = calculatePosition(preferred, trigger, arrow, body, viewport, viewport);
      expect(position.internalPosition).toBe(PRIORITY_MAPPING[preferred][1]);
    });
  });

  (
    [
      [{ top: 0, left: 0, height: 1000, width: 1000 }, 'top-center'],
      [{ top: 0, left: 0, height: 1000, width: 600 }, 'left-top'],
      [{ top: 450, left: 250, height: 1000, width: 350 }, 'bottom-left'],
    ] as const
  ).forEach(([container, expected], index) => {
    test(`for container #${index} finds position ${expected} that fits into it`, () => {
      const trigger = { top: 500, left: 500, height: 25, width: 25 };
      const position = calculatePosition('top', trigger, arrow, body, container, viewport);
      expect(position.internalPosition).toBe(expected);
    });
  });

  test("returns the position with the largest availabe area, if can't fit inside viewport", () => {
    const trigger = { top: 0, left: 0, height: 25, width: 25 };
    const container = { top: 0, left: 0, height: 600, width: 1000 };
    const viewport = { top: 0, left: 0, height: 100, width: 100 };
    const position = calculatePosition('bottom', trigger, arrow, body, container, viewport);
    expect(position.internalPosition).toBe('bottom-center');
  });

  test('disregards the container bound, when rendered inside a portal', () => {
    // trigger is in the right bottom corner of the container.
    // Normally, the popover would open top-left, to try to fit inside it
    const trigger = { top: 175, left: 175, height: 25, width: 25 };
    const container = { top: 100, left: 100, height: 100, width: 100 };
    const viewport = { top: 0, left: 0, height: 1000, width: 1000 };
    const position = calculatePosition('bottom', trigger, arrow, body, container, viewport, true);
    expect(position.internalPosition).toBe('bottom-center');
  });
});

describe('intersectRectangles', () => {
  it('returns the area of the intersection of passed in rectangles', () => {
    const rects = [
      { top: 0, left: 0, width: 10, height: 10 },
      { top: 5, left: 5, width: 10, height: 10 },
    ];
    expect(intersectRectangles(rects)).toEqual(25);
  });
  it('returns null, if there is no intersection', () => {
    const rects = [
      { top: 0, left: 0, width: 5, height: 5 },
      { top: 10, left: 10, width: 5, height: 5 },
    ];
    expect(intersectRectangles(rects)).toEqual(null);
  });
  it('returns null, if no rectangles were passed', () => {
    expect(intersectRectangles([])).toEqual(null);
  });
});
