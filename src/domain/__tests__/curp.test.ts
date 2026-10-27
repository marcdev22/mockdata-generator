import { describe, expect, it } from 'vitest';

import {
  buildCurp,
  calculateCurpCheckDigit,
  createCurpHomonymCharacter,
  isValidCurpCheckDigit,
} from '../curp';
import { getFirstInternalConsonant, normalizeForCurp, selectCurpGivenName } from '../names';
import { createSeededRandom } from '../../test/random';

const officialExample = {
  name: {
    givenNames: ['CONCEPCIÓN'],
    paternalSurname: 'SALGADO',
    maternalSurname: 'BRISEÑO',
  },
  dateOfBirth: { year: 1956, month: 6, day: 26 },
  sex: 'M' as const,
  birthEntityCode: 'DF',
  homonymCharacter: '0',
};

describe('CURP generation', () => {
  it('matches the published structural example', () => {
    expect(buildCurp(officialExample)).toBe('SABC560626MDFLRN01');
    expect(isValidCurpCheckDigit('SABC560626MDFLRN01')).toBe(true);
  });

  it('uses the second given name for MARIA and JOSE', () => {
    expect(selectCurpGivenName(['MARÍA', 'TEST', 'ANA'])).toBe('TEST');
    expect(selectCurpGivenName(['JOSÉ', 'TEST'])).toBe('TEST');
    expect(selectCurpGivenName(['MARÍA', 'JOSÉ', 'TEST'])).toBe('TEST');
    expect(selectCurpGivenName(['ALEJANDRO', 'TEST'])).toBe('ALEJANDRO');
  });

  it('replaces Ñ with X for CURP matching', () => {
    const normalized = normalizeForCurp('MUÑOZ');

    expect(normalized).toBe('MUXOZ');
    expect(getFirstInternalConsonant(normalized)).toBe('X');
  });

  it('creates a century-appropriate homonym character', () => {
    const preMillennium = createCurpHomonymCharacter(1999, () => 0);
    const postMillennium = createCurpHomonymCharacter(2000, () => 0);

    expect(preMillennium).toMatch(/^\d$/);
    expect(postMillennium).toMatch(/^[A-J]$/);
  });

  it('rejects invalid homonym characters and structural inputs', () => {
    expect(() => buildCurp({ ...officialExample, homonymCharacter: 'A' })).toThrow(RangeError);
    expect(() => buildCurp({ ...officialExample, sex: 'X' as 'M' })).toThrow(RangeError);
    expect(() => buildCurp({ ...officialExample, birthEntityCode: 'DFX' })).toThrow(RangeError);
  });

  it('produces valid check digits across seeded samples', () => {
    const random = createSeededRandom(7);
    const { name, dateOfBirth, sex, birthEntityCode } = officialExample;

    for (let index = 0; index < 50; index += 1) {
      const curp = buildCurp({ name, dateOfBirth, sex, birthEntityCode }, random);

      expect(curp).toHaveLength(18);
      expect(isValidCurpCheckDigit(curp)).toBe(true);
      expect(calculateCurpCheckDigit(curp.slice(0, 17))).toBe(Number(curp.charAt(17)));
    }
  });
});
