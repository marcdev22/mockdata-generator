import { describe, expect, it } from 'vitest';

import { buildRfc, buildRfcPrefix, calculateRfcCheckDigit, isValidRfcCheckDigit } from '../rfc';
import { normalizeForRfc } from '../names';
import { createSeededRandom } from '../../test/random';

describe('RFC generation', () => {
  it('calculates the published check digit example', () => {
    expect(calculateRfcCheckDigit('GODE561231GR')).toBe('8');
  });

  it('normalizes names while preserving Ñ', () => {
    expect(normalizeForRfc('MUÑOZ')).toBe('MUÑOZ');
    expect(normalizeForRfc('MARÍA JOSÉ')).toBe('MARIAJOSE');
  });

  it('builds a valid 13-character RFC with a synthetic homoclave', () => {
    const rfc = buildRfc(
      {
        name: {
          givenNames: ['JOSÉ', 'TEST'],
          paternalSurname: 'MUÑOZ',
          maternalSurname: 'LÓPEZ',
        },
        dateOfBirth: { year: 1990, month: 4, day: 9 },
      },
      () => 0,
    );

    expect(rfc).toMatch(/^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/);
    expect(rfc).toHaveLength(13);
    expect(isValidRfcCheckDigit(rfc)).toBe(true);
  });

  it('uses the second given name for common first names', () => {
    expect(
      buildRfcPrefix({
        givenNames: ['MARÍA', 'TEST'],
        paternalSurname: 'SALGADO',
        maternalSurname: 'BRISEÑO',
      }),
    ).toBe('SABT');
  });

  it('produces valid check digits across seeded samples', () => {
    const random = createSeededRandom(11);
    const name = {
      givenNames: ['ALEJANDRO', 'TEST'],
      paternalSurname: 'QASIMIRO',
      maternalSurname: 'MOCKERNANDEZ',
    };

    for (let index = 0; index < 100; index += 1) {
      const rfc = buildRfc(
        {
          name,
          dateOfBirth: { year: 1985 + index, month: 1, day: 1 },
        },
        random,
      );

      expect(isValidRfcCheckDigit(rfc)).toBe(true);
    }
  });
});
