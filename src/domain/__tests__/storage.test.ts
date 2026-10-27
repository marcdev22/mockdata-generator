import { describe, expect, it } from 'vitest';

import { StorageUnavailableError } from '../errors';
import type { SavedIdentity } from '../types';
import { createTestIdentity } from '../../test/fixtures';
import {
  IDENTITY_STORAGE_KEY,
  IDENTITY_STORAGE_VERSION,
  isSavedIdentity,
  loadSavedIdentities,
  saveSavedIdentities,
} from '../../services/identityStorage';

function createSavedIdentity(id = 'saved-1'): SavedIdentity {
  return {
    ...createTestIdentity({ id }),
    savedAt: '2026-10-26T12:05:00.000Z',
  };
}

describe('identity storage', () => {
  it('round-trips a saved identity through localStorage', () => {
    const saved = createSavedIdentity();

    saveSavedIdentities([saved]);

    expect(loadSavedIdentities()).toEqual([saved]);
  });

  it('rejects invalid records and recovers from malformed JSON', () => {
    const saved = createSavedIdentity();

    expect(isSavedIdentity(saved)).toBe(true);
    expect(isSavedIdentity({ ...saved, curp: 'INVALID' })).toBe(false);
    expect(isSavedIdentity({ ...saved, givenNames: ['TEST'] })).toBe(false);

    window.localStorage.setItem(IDENTITY_STORAGE_KEY, '{not json');
    expect(loadSavedIdentities()).toEqual([]);
  });

  it('filters invalid entries and unknown schema versions', () => {
    const valid = createSavedIdentity();
    const invalid = { ...valid, nss: '00000000001' };

    window.localStorage.setItem(
      IDENTITY_STORAGE_KEY,
      JSON.stringify({ version: IDENTITY_STORAGE_VERSION, identities: [invalid, valid] }),
    );

    expect(loadSavedIdentities()).toEqual([valid]);

    window.localStorage.setItem(
      IDENTITY_STORAGE_KEY,
      JSON.stringify({ version: 999, identities: [valid] }),
    );
    expect(loadSavedIdentities()).toEqual([]);
  });

  it('caps loaded history at 50 newest records', () => {
    const records = Array.from({ length: 55 }, (_, index) => ({
      ...createSavedIdentity(`saved-${index}`),
      savedAt: new Date(Date.UTC(2026, 9, 26, 12, index)).toISOString(),
    }));

    saveSavedIdentities(records);

    const loaded = loadSavedIdentities();
    expect(loaded).toHaveLength(50);
    expect(loaded[0]?.id).toBe('saved-54');
  });

  it('handles unavailable storage', () => {
    expect(loadSavedIdentities(null)).toEqual([]);
    expect(() => saveSavedIdentities([], null)).toThrow(StorageUnavailableError);
  });
});
