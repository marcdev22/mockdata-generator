import { ClipboardError } from '../domain/errors';

export interface ClipboardWriter {
  writeText(value: string): Promise<void>;
}

function copyWithTextarea(value: string): void {
  if (typeof document === 'undefined') {
    throw new ClipboardError();
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.inset = '0 auto auto -9999px';
  textarea.style.opacity = '0';
  document.body.append(textarea);

  try {
    textarea.select();

    const copied = typeof document.execCommand === 'function' && document.execCommand('copy');

    if (!copied) {
      throw new ClipboardError();
    }
  } finally {
    textarea.remove();
  }
}

export async function writeTextToClipboard(
  value: string,
  clipboard: ClipboardWriter | undefined = globalThis.navigator?.clipboard,
): Promise<void> {
  try {
    if (clipboard && typeof clipboard.writeText === 'function') {
      try {
        await clipboard.writeText(value);
        return;
      } catch {
        copyWithTextarea(value);
        return;
      }
    }

    copyWithTextarea(value);
  } catch (error) {
    throw error instanceof ClipboardError ? error : new ClipboardError(error);
  }
}
