export class NssUniquenessError extends Error {
  readonly code = 'NSS_UNIQUENESS_EXHAUSTED';

  constructor(attempts: number) {
    super(`No fue posible generar un NSS único después de ${attempts} intentos.`);
    this.name = 'NssUniquenessError';
  }
}

export class StorageUnavailableError extends Error {
  readonly code = 'STORAGE_UNAVAILABLE';

  constructor() {
    super('El almacenamiento local no está disponible en este navegador.');
    this.name = 'StorageUnavailableError';
  }
}

export class StorageWriteError extends Error {
  readonly code = 'STORAGE_WRITE_FAILED';

  constructor(cause: unknown) {
    super('No se pudo escribir en el almacenamiento local.', { cause });
    this.name = 'StorageWriteError';
  }
}

export class ClipboardError extends Error {
  readonly code = 'CLIPBOARD_UNAVAILABLE';

  constructor(cause?: unknown) {
    super('No se pudo acceder al portapapeles.', { cause });
    this.name = 'ClipboardError';
  }
}
