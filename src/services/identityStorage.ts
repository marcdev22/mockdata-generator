import { isValidCurpCheckDigit } from '../domain/curp';
import { isValidIsoDate } from '../domain/date';
import { findBirthEntity } from '../domain/datasets/birthEntities';
import { StorageUnavailableError, StorageWriteError } from '../domain/errors';
import { hasRequiredTestPlacement } from '../domain/names';
import { isValidNss } from '../domain/nss';
import { isValidRfcCheckDigit } from '../domain/rfc';
import type { SavedIdentity } from '../domain/types';

export const IDENTITY_STORAGE_KEY = 'automatic-data-app:identities';
export const IDENTITY_STORAGE_VERSION = 1;
export const MAX_SAVED_IDENTITIES = 50;

interface PersistedIdentityState {
  readonly version: typeof IDENTITY_STORAGE_VERSION;
  readonly identities: readonly SavedIdentity[];
}

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

export function isSavedIdentity(value: unknown): value is SavedIdentity {
  if (!isRecord(value)) {
    return false;
  }

  const { givenNames } = value;

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    value.isSynthetic === true &&
    Array.isArray(givenNames) &&
    givenNames.length >= 2 &&
    givenNames.length <= 3 &&
    givenNames.every((name): name is string => typeof name === 'string') &&
    hasRequiredTestPlacement(givenNames) &&
    typeof value.paternalSurname === 'string' &&
    typeof value.maternalSurname === 'string' &&
    typeof value.fullName === 'string' &&
    typeof value.dateOfBirth === 'string' &&
    isValidIsoDate(value.dateOfBirth) &&
    (value.sex === 'H' || value.sex === 'M') &&
    typeof value.birthEntityCode === 'string' &&
    findBirthEntity(value.birthEntityCode) !== undefined &&
    typeof value.birthEntityName === 'string' &&
    typeof value.curp === 'string' &&
    isValidCurpCheckDigit(value.curp) &&
    typeof value.rfc === 'string' &&
    isValidRfcCheckDigit(value.rfc) &&
    typeof value.nss === 'string' &&
    isValidNss(value.nss) &&
    isValidTimestamp(value.createdAt) &&
    isValidTimestamp(value.savedAt)
  );
}

function parsePersistedState(rawValue: string): SavedIdentity[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return [];
  }

  if (
    !isRecord(parsed) ||
    parsed.version !== IDENTITY_STORAGE_VERSION ||
    !Array.isArray(parsed.identities)
  ) {
    return [];
  }

  return parsed.identities
    .filter(isSavedIdentity)
    .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
    .slice(0, MAX_SAVED_IDENTITIES);
}

export function loadSavedIdentities(
  storage: Storage | null = getBrowserStorage(),
): SavedIdentity[] {
  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(IDENTITY_STORAGE_KEY);

    return rawValue ? parsePersistedState(rawValue) : [];
  } catch {
    return [];
  }
}

export function saveSavedIdentities(
  identities: readonly SavedIdentity[],
  storage: Storage | null = getBrowserStorage(),
): void {
  if (!storage) {
    throw new StorageUnavailableError();
  }

  const state: PersistedIdentityState = {
    version: IDENTITY_STORAGE_VERSION,
    identities,
  };

  try {
    storage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    throw new StorageWriteError(error);
  }
}
