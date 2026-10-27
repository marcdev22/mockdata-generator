import { generateSyntheticIdentity } from '../domain/identity';
import type { SyntheticIdentity } from '../domain/types';
import { createSeededRandom } from './random';

export const TEST_NOW = new Date('2026-10-26T12:00:00.000Z');

export function createTestIdentity(
  overrides: { readonly seed?: number; readonly id?: string } = {},
): SyntheticIdentity {
  return generateSyntheticIdentity({
    random: createSeededRandom(overrides.seed ?? 42),
    now: () => TEST_NOW,
    idFactory: () => overrides.id ?? 'identity-test-id',
  });
}
