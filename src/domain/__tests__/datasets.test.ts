import { describe, expect, it } from 'vitest';

import { BIRTH_ENTITIES } from '../datasets/birthEntities';
import { GIVEN_NAMES } from '../datasets/givenNames';
import { SURNAMES } from '../datasets/surnames';
import { buildFullName, generateNameParts, hasRequiredTestPlacement } from '../names';
import { createSeededRandom } from '../../test/random';

describe('datasets', () => {
  it('contains exactly 100 unique given names', () => {
    expect(GIVEN_NAMES).toHaveLength(100);
    expect(new Set(GIVEN_NAMES).size).toBe(100);
    expect(GIVEN_NAMES).not.toContain('TEST');
    expect(GIVEN_NAMES.every((name) => name === name.toUpperCase())).toBe(true);
  });

  it('contains exactly 100 unique surnames with testing puns', () => {
    expect(SURNAMES).toHaveLength(100);
    expect(new Set(SURNAMES).size).toBe(100);
    expect(SURNAMES).not.toContain('TEST');
    expect(SURNAMES.every((surname) => surname === surname.toUpperCase())).toBe(true);
    expect(SURNAMES).toContain('MOCKERNANDEZ');
    expect(SURNAMES).toContain('LOOPEZ');
    expect(SURNAMES).toContain('BUGUILAR');
  });

  it('contains 32 unique birth entities with valid codes', () => {
    expect(BIRTH_ENTITIES).toHaveLength(32);
    expect(new Set(BIRTH_ENTITIES.map((entity) => entity.code)).size).toBe(32);
    expect(BIRTH_ENTITIES.every((entity) => /^[A-Z]{2}$/.test(entity.code))).toBe(true);
    expect(BIRTH_ENTITIES.every((entity) => entity.name.length > 0)).toBe(true);
  });

  it('always places TEST as the second or third given name', () => {
    const random = createSeededRandom(123);

    for (let index = 0; index < 250; index += 1) {
      const name = generateNameParts(random);

      expect(name.givenNames.length).toBeGreaterThanOrEqual(2);
      expect(name.givenNames.length).toBeLessThanOrEqual(3);
      expect(hasRequiredTestPlacement(name.givenNames)).toBe(true);
      expect(name.givenNames.filter((value) => value === 'TEST')).toHaveLength(1);
      expect(GIVEN_NAMES).toContain(
        name.givenNames[0] === 'TEST' ? name.givenNames[1] : name.givenNames[0],
      );
      expect(SURNAMES).toContain(name.paternalSurname);
      expect(SURNAMES).toContain(name.maternalSurname);
      expect(name.paternalSurname).not.toBe(name.maternalSurname);
      expect(buildFullName(name)).toContain('TEST');
    }
  });
});
