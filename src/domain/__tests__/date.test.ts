import { describe, expect, it } from 'vitest';

import {
  createDateOfBirth,
  formatIsoDate,
  parseIsoDate,
  subtractUtcYears,
  toDateParts,
} from '../date';
import { createSeededRandom } from '../../test/random';

describe('date utilities', () => {
  it('clamps leap-day subtraction to the last valid day', () => {
    const leapDay = new Date(Date.UTC(2024, 1, 29));

    expect(toDateParts(subtractUtcYears(leapDay, 1)).iso).toBe('2023-02-28');
    expect(toDateParts(subtractUtcYears(leapDay, 4)).iso).toBe('2020-02-29');
  });

  it('generates dates of birth between 18 and 80 years old', () => {
    const now = new Date(Date.UTC(2026, 9, 26));
    const earliestAllowed = subtractUtcYears(now, 80);
    const latestAllowed = subtractUtcYears(now, 18);
    const random = createSeededRandom(99);

    for (let index = 0; index < 300; index += 1) {
      const parts = createDateOfBirth(now, random);
      const date = new Date(`${parts.iso}T00:00:00.000Z`);

      expect(date.getTime()).toBeGreaterThanOrEqual(earliestAllowed.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(latestAllowed.getTime());
      expect(parseIsoDate(parts.iso)).not.toBeNull();
    }
  });

  it('formats strict ISO dates for display', () => {
    expect(formatIsoDate('1996-01-05')).toBe('05/01/1996');
    expect(parseIsoDate('2023-02-29')).toBeNull();
    expect(parseIsoDate('26/10/2026')).toBeNull();
  });
});
