import { useCallback, useState } from 'react';

import type { SavedIdentity, SyntheticIdentity } from '../domain/types';
import {
  loadSavedIdentities,
  MAX_SAVED_IDENTITIES,
  saveSavedIdentities,
} from '../services/identityStorage';

export interface UseSavedIdentitiesResult {
  readonly identities: SavedIdentity[];
  readonly storageError: string | null;
  readonly saveIdentity: (identity: SyntheticIdentity) => boolean;
  readonly removeIdentity: (id: string) => boolean;
  readonly clearIdentities: () => boolean;
  readonly dismissStorageError: () => void;
}

const STORAGE_ERROR_MESSAGE =
  'No se pudo actualizar el historial. Revisa los permisos de almacenamiento local.';

export function useSavedIdentities(): UseSavedIdentitiesResult {
  const [identities, setIdentities] = useState<SavedIdentity[]>(() => loadSavedIdentities());
  const [storageError, setStorageError] = useState<string | null>(null);

  const persist = useCallback((nextIdentities: SavedIdentity[]): boolean => {
    try {
      saveSavedIdentities(nextIdentities);
      setIdentities(nextIdentities);
      setStorageError(null);
      return true;
    } catch {
      setStorageError(STORAGE_ERROR_MESSAGE);
      return false;
    }
  }, []);

  const saveIdentity = useCallback(
    (identity: SyntheticIdentity): boolean => {
      if (identities.some((saved) => saved.id === identity.id)) {
        return true;
      }

      const savedIdentity: SavedIdentity = {
        ...identity,
        savedAt: new Date().toISOString(),
      };
      const nextIdentities = [savedIdentity, ...identities].slice(0, MAX_SAVED_IDENTITIES);

      return persist(nextIdentities);
    },
    [identities, persist],
  );

  const removeIdentity = useCallback(
    (id: string): boolean => persist(identities.filter((identity) => identity.id !== id)),
    [identities, persist],
  );

  const clearIdentities = useCallback((): boolean => persist([]), [persist]);

  const dismissStorageError = useCallback(() => setStorageError(null), []);

  return {
    identities,
    storageError,
    saveIdentity,
    removeIdentity,
    clearIdentities,
    dismissStorageError,
  };
}
