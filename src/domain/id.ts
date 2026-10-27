export type IdFactory = () => string;

export function createIdentityId(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return `identity-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
