import { describe, it, expect } from 'vitest';
import { type Base, generateSecret } from '@core';

// ============================================================
// Helpers
// ============================================================

/**
 * Возвращает функцию - бесконечный циклический генератор значений.
 * Используется для того, чтобы задать нужную величину случайности для последовательности значений в тестах.
 * Теория - https://www.30secondsofcode.org/js/s/generate-values-repeatedly/
 */
const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

const ALMOST_ONE = 0.9999;

// ============================================================
// 1. Свойства результата
// ============================================================

describe('generateSecret — свойства результата', () => {
  it('для bin (единственная допустимая длина — 2) возвращает строку длины 2', () => {
    const secret = generateSecret(2, 2, Math.random);
    expect(secret).toHaveLength(2);
    expect(secret).toMatch(/^[01]{2}$/);
    expect(new Set(secret).size).toBe(2);
  });

  it.each([
    { base: 8, length: 3 },
    { base: 10, length: 4 },
    { base: 16, length: 5 },
  ])('для base=$base и length=$length возвращает строку нужной длины', ({ base, length }) => {
    const secret = generateSecret(length, base as Base, Math.random);
    expect(secret).toHaveLength(length);
    expect(new Set(secret).size).toBe(length);
  });

  it.each([
    { base: 8, length: 4, pattern: /^[0-7]{4}$/ },
    { base: 10, length: 4, pattern: /^[0-9]{4}$/ },
    { base: 16, length: 4, pattern: /^[0-9a-f]{4}$/ },
  ])('для base=$base все символы принадлежат алфавиту', ({ base, length, pattern }) => {
    const secret = generateSecret(length, base as Base, Math.random);
    expect(secret).toMatch(pattern);
  });

  it('все символы уникальны', () => {
    const secret = generateSecret(10, 16, Math.random);
    expect(new Set(secret).size).toBe(secret.length);
  });

  it('детерминирован при одинаковом randomFn', () => {
    const a = generateSecret(4, 16, seq(0.1, 0.5, 0.9, 0.3));
    const b = generateSecret(4, 16, seq(0.1, 0.5, 0.9, 0.3));
    expect(a).toBe(b);
  });

  it('не вызывает randomFn, если length = 0', () => {
    let isCalled = false;
    generateSecret(0, 10, () => {
      isCalled = true;
      return 0;
    });
    expect(isCalled).toBe(false);
  });
});

// ============================================================
// 2. Реакция на randomFn
// ============================================================

describe('generateSecret — реакция на randomFn', () => {
  it('randomFn = 0 → берёт первые доступные цифры', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
    expect(generateSecret(2, 2, () => 0)).toBe('01');
  });

  it('крайние значения randomFn дают разные результаты', () => {
    const first = generateSecret(4, 10, () => 0);
    const last = generateSecret(4, 10, () => ALMOST_ONE);
    expect(first).not.toBe(last);
  });

  it('разные последовательности randomFn дают разные результаты', () => {
    const allZero = generateSecret(4, 10, () => 0);
    const allHalf = generateSecret(4, 10, () => 0.5);
    const allHigh = generateSecret(4, 10, () => ALMOST_ONE);
    expect(new Set([allZero, allHalf, allHigh]).size).toBe(3);
  });
});

// ============================================================
// 3. Граничные случаи
// ============================================================

describe('generateSecret — граничные случаи', () => {
  it('length = 0 → пустая строка', () => {
    expect(generateSecret(0, 10, Math.random)).toBe('');
  });

  it('length = 1 → один символ из алфавита', () => {
    const secret = generateSecret(1, 16, () => 0);
    expect(secret).toMatch(/^[0-9a-f]$/);
  });

  it.each([8, 10, 16])('length === base работает для base=%i', (base) => {
    const secret = generateSecret(base, base as Base, Math.random);
    expect(secret).toHaveLength(base);
    expect(new Set(secret).size).toBe(base);
  });

  it('length === base → использует весь алфавит', () => {
    expect(generateSecret(10, 10, () => 0)).toBe('0123456789');
    expect(generateSecret(2, 2, () => 0)).toBe('01');
  });

  it('допускает лидирующие нули', () => {
    expect(generateSecret(4, 10, () => 0)[0]).toBe('0');
  });
});

// ============================================================
// 4. Ошибки
// ============================================================

describe('generateSecret — ошибки', () => {
  it('бросает исключение, если length > base (невозможно набрать уникальные)', () => {
    expect(() => generateSecret(5, 2, () => 0)).toThrow();
    expect(() => generateSecret(17, 16, () => 0)).toThrow();
  });

  it('бросает исключение при отрицательной длине', () => {
    expect(() => generateSecret(-1, 10, () => 0)).toThrow();
  });

  it.each([1, -0.1, Infinity, -Infinity, NaN])('бросает исключение, если randomFn вернул %s', (value) => {
    expect(() => generateSecret(4, 10, () => value)).toThrow(RangeError);
  });

  it.each([2.5, 1.1, -0.5])('бросает исключение при нецелом значении length %s', (length) => {
    expect(() => generateSecret(length, 10, () => 0)).toThrow(RangeError);
  });

  it('бросает исключение для неподдерживаемой системы счисления', () => {
    expect(() => generateSecret(2, 3 as Base, () => 0)).toThrow(RangeError);
  });
});
