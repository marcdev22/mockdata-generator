import { useCallback, useEffect, useRef, useState } from 'react';

import { writeTextToClipboard } from '../services/clipboard';

const COPY_ERROR_MESSAGE = 'No se pudo copiar. Intenta seleccionar el texto manualmente.';
const COPY_FEEDBACK_DURATION_MS = 1800;

export interface UseClipboardResult {
  readonly copiedKey: string | null;
  readonly copyError: string | null;
  readonly copy: (key: string, value: string) => Promise<boolean>;
  readonly dismissCopyError: () => void;
}

export function useClipboard(): UseClipboardResult {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const copy = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      await writeTextToClipboard(value);
      setCopiedKey(key);
      setCopyError(null);

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, COPY_FEEDBACK_DURATION_MS);

      return true;
    } catch {
      setCopyError(COPY_ERROR_MESSAGE);
      setCopiedKey(null);
      return false;
    }
  }, []);

  const dismissCopyError = useCallback(() => setCopyError(null), []);

  return { copiedKey, copyError, copy, dismissCopyError };
}
