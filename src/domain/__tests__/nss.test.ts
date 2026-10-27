import { describe, expect, it } from 'vitest';

import { NssUniquenessError } from '../errors';
import { calculateLuhnCheckDigit, generateNss, isValidNss } from '../nss';
import { createSeededRandom } from '../../test/random';

describe('NSS generation', () => {
  it('validates the published structural example', () => {
    expect(calculateLuhnCheckDigit('0514968477')).toBe(0);
    expect(isValidNss('05149684770')).toBe(true);
    expect(isValidNss('05149684771')).toBe(false);
  });

  it('generates valid 11-digit values with leading zeros preserved', () => {
    const random = createSeededRandom(33);

    for (let index = 0; index < 200; index += 1) {
      const nss = generateNss({ birthYear: 2001, currentYear: 2026, random });

      expect(nss).toMatch(/^\d{11}$/);
      expect(isValidNss(nss)).toBe(true);
      expect(nss.slice(4, 6)).toBe('01');
    }
  });

  it('retries collisions and throws after exhausting attempts', () => {
    const random = () => 0;
    const first = generateNss({ birthYear: 1990, currentYear: 2026, random });

    expect(() =>
      generateNss({
        birthYear: 1990,
        currentYear: 2026,
        random,
        existingNss: new Set([first]),
        maxAttempts: 3,
      }),
    ).toThrow(NssUniquenessError);
  });

  it('rejects impossible year ranges', () => {
    expect(() => generateNss({ birthYear: 2030, currentYear: 2026 })).toThrow(RangeError);
  });
});
