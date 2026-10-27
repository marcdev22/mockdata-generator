import { describe, expect, it } from 'vitest';

import { pickDistinct, pickOne, randomInt } from '../random';

describe('random utilities', () => {
  it('produces inclusive integer ranges', () => {
    expect(randomInt(5, 5, () => 0)).toBe(5);
    expect(randomInt(1, 3, () => 0.999)).toBe(3);
  });

  it('picks unique values without mutating the source', () => {
    const source = ['a', 'b', 'c'];
    const values = pickDistinct(source, 2, () => 0);

    expect(values).toEqual(['a', 'b']);
    expect(source).toEqual(['a', 'b', 'c']);
    expect(pickOne(source, () => 0.5)).toBe('b');
  });

  it('rejects invalid random values and requests', () => {
    expect(() => randomInt(0, 1, () => 1)).toThrow(RangeError);
    expect(() => randomInt(2, 1)).toThrow(RangeError);
    expect(() => pickOne([], () => 0)).toThrow(RangeError);
    expect(() => pickDistinct(['a'], 2, () => 0)).toThrow(RangeError);
  });
});
