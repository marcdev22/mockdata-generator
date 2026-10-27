import { describe, expect, it } from 'vitest';

import { isValidCurpCheckDigit } from '../curp';
import { isValidIsoDate } from '../date';
import { generateSyntheticIdentity } from '../identity';
import { hasRequiredTestPlacement } from '../names';
import { isValidNss } from '../nss';
import { isValidRfcCheckDigit } from '../rfc';
import { createSeededRandom } from '../../test/random';
import { TEST_NOW } from '../../test/fixtures';

describe('synthetic identity generation', () => {
  it('creates a coherent identity with valid identifier formats', () => {
    const identity = generateSyntheticIdentity({
      random: createSeededRandom(5),
      now: () => TEST_NOW,
      idFactory: () => 'identity-5',
    });

    expect(identity.id).toBe('identity-5');
    expect(identity.createdAt).toBe(TEST_NOW.toISOString());
    expect(identity.fullName).toContain('TEST');
    expect(hasRequiredTestPlacement(identity.givenNames)).toBe(true);
    expect(isValidIsoDate(identity.dateOfBirth)).toBe(true);
    expect(identity.curp).toHaveLength(18);
    expect(isValidCurpCheckDigit(identity.curp)).toBe(true);
    expect(identity.rfc).toHaveLength(13);
    expect(isValidRfcCheckDigit(identity.rfc)).toBe(true);
    expect(identity.nss).toHaveLength(11);
    expect(isValidNss(identity.nss)).toBe(true);
    expect(identity.birthEntityName.length).toBeGreaterThan(0);
  });

  it('is deterministic when randomness, clock, and ID source are fixed', () => {
    const createOptions = () => ({
      random: createSeededRandom(22),
      now: () => TEST_NOW,
      idFactory: () => 'identity-22',
    });

    expect(generateSyntheticIdentity(createOptions())).toEqual(
      generateSyntheticIdentity(createOptions()),
    );
  });

  it('avoids NSS collisions with existing records', () => {
    const first = generateSyntheticIdentity({
      random: createSeededRandom(12),
      now: () => TEST_NOW,
      idFactory: () => 'identity-12',
    });
    const second = generateSyntheticIdentity({
      random: createSeededRandom(12),
      now: () => TEST_NOW,
      idFactory: () => 'identity-13',
      existingNss: new Set([first.nss]),
    });

    expect(second.nss).not.toBe(first.nss);
    expect(isValidNss(second.nss)).toBe(true);
  });
});
