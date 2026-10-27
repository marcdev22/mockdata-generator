import { afterEach, describe, expect, it, vi } from 'vitest';

import { ClipboardError } from '../../domain/errors';
import { writeTextToClipboard } from '../clipboard';

function stubExecCommand(result: boolean) {
  const execCommand = vi.fn((command: string) => {
    expect(command).toBe('copy');
    expect(document.querySelector('textarea')?.value).toBe('texto de prueba');
    return result;
  });

  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: execCommand,
  });

  return execCommand;
}

afterEach(() => {
  Reflect.deleteProperty(document, 'execCommand');
  document.body.replaceChildren();
});

describe('clipboard service', () => {
  it('uses the asynchronous clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await writeTextToClipboard('texto de prueba', { writeText });

    expect(writeText).toHaveBeenCalledWith('texto de prueba');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('falls back to a temporary textarea when the clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('permission denied'));
    const execCommand = stubExecCommand(true);

    await expect(writeTextToClipboard('texto de prueba', { writeText })).resolves.toBeUndefined();

    expect(writeText).toHaveBeenCalled();
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('falls back when no clipboard API is provided', async () => {
    const execCommand = stubExecCommand(true);

    await writeTextToClipboard('texto de prueba', undefined);

    expect(execCommand).toHaveBeenCalled();
  });

  it('throws a typed error when both clipboard paths fail', async () => {
    stubExecCommand(false);

    await expect(writeTextToClipboard('texto de prueba', undefined)).rejects.toBeInstanceOf(
      ClipboardError,
    );
    expect(document.querySelector('textarea')).toBeNull();
  });
});
