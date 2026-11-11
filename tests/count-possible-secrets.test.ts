import { describe, it, expect } from 'vitest';
import { countPossibleSecrets } from '@core';
import type { Base } from '@core';

describe('countPossibleSecrets — значения P(base, length)', () => {
  it.each([
    { length: 0, base: 2, expected: 1 },
    { length: 0, base: 10, expected: 1 },
    { length: 1, base: 2, expected: 2 },
    { length: 1, base: 8, expected: 8 },
    { length: 1, base: 10, expected: 10 },
    { length: 1, base: 16, expected: 16 },
    { length: 2, base: 2, expected: 2 }, // P(2,2) = 2
    { length: 2, base: 8, expected: 56 }, // 8 x 7
    { length: 2, base: 10, expected: 90 }, // 10 x 9
    { length: 3, base: 8, expected: 336 }, // 8 x 7 x 6
    { length: 4, base: 10, expected: 5040 }, // 10 x 9 x 8 x 7
    { length: 6, base: 10, expected: 151_200 }, // 10 x 9 x 8 x 7 x 6 x 5
    { length: 6, base: 16, expected: 5_765_760 }, // 16 x 15 x 14 x 12 x 11
  ])('P($base, $length) = $expected', ({ length, base, expected }) => {
    expect(countPossibleSecrets(length, base as Base)).toBe(expected);
  });
});

describe('countPossibleSecrets — граничные случаи', () => {
  it('length = 0 → 1 (единственная «пустая» перестановка)', () => {
    for (const base of [2, 8, 10, 16] as Base[]) {
      expect(countPossibleSecrets(0, base)).toBe(1);
    }
  });

  it('length = base → base! (все перестановки алфавита)', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
    expect(countPossibleSecrets(8, 8)).toBe(40_320);
    expect(countPossibleSecrets(10, 10)).toBe(3_628_800);
  });
});

describe('countPossibleSecrets — length > base', () => {
  it('возвращает 0 — нельзя выбрать больше уникальных символов, чем есть в алфавите', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
    expect(countPossibleSecrets(11, 10)).toBe(0);
    expect(countPossibleSecrets(17, 16)).toBe(0);
  });
});

describe('countPossibleSecrets — ошибки', () => {
  it('length < 0 → throw', () => {
    expect(() => countPossibleSecrets(-1, 10)).toThrow();
  });

  it('length не целое → throw', () => {
    expect(() => countPossibleSecrets(2.5, 10)).toThrow();
  });

  it('неподдерживаемая база → throw', () => {
    expect(() => countPossibleSecrets(2, 3 as Base)).toThrow();
  });
});
