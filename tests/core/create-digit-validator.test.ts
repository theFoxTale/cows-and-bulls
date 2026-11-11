import { describe, it, expect } from 'vitest';
import { type Base, createDigitValidator } from '@core';

const ALL_BASES: Base[] = [2, 8, 10, 16];

describe('createDigitValidator', () => {
  // ------------------------------------------------------------
  // 1. Фабрика возвращает предикат
  // ------------------------------------------------------------
  it('возвращает функцию', () => {
    expect(typeof createDigitValidator(10)).toBe('function');
  });

  it('возвращает предикат, подходящий для фильтрации значений', () => {
    const isValidDigit = createDigitValidator(10);
    const input = ['1', 'a', '2', '-', '3'];
    expect(input.filter(isValidDigit)).toEqual(['1', '2', '3']);
  });

  // ------------------------------------------------------------
  // 2. Допустимые символы для каждой системы счисления
  // ------------------------------------------------------------
  it.each(['0', '1'])('bin принимает %s', (char) => {
    expect(createDigitValidator(2)(char)).toBe(true);
  });

  it.each(['0', '5', '7'])('oct принимает %s', (char) => {
    expect(createDigitValidator(8)(char)).toBe(true);
  });

  it.each(['0', '3', '9'])('dec принимает %s', (char) => {
    expect(createDigitValidator(10)(char)).toBe(true);
  });

  it.each(['0', '9', 'a', 'f', 'A', 'F'])('hex принимает %s', (char) => {
    expect(createDigitValidator(16)(char)).toBe(true);
  });

  // ------------------------------------------------------------
  // 3. Регистронезависимость для hex
  // ------------------------------------------------------------
  it('hex одинаково принимает строчную и прописную букву', () => {
    const isValidDigit = createDigitValidator(16);
    expect(isValidDigit('a')).toBe(isValidDigit('A'));
    expect(isValidDigit('b')).toBe(isValidDigit('B'));
    expect(isValidDigit('c')).toBe(isValidDigit('C'));
    expect(isValidDigit('d')).toBe(isValidDigit('D'));
    expect(isValidDigit('e')).toBe(isValidDigit('E'));
    expect(isValidDigit('f')).toBe(isValidDigit('F'));
  });

  // ------------------------------------------------------------
  // 4. Недопустимые значения для конкретной системы счисления
  // ------------------------------------------------------------
  it.each(['2', '3', '9', 'a'])('bin отклоняет %s', (char) => {
    expect(createDigitValidator(2)(char)).toBe(false);
  });

  it.each(['8', '9', 'b'])('oct отклоняет %s', (char) => {
    expect(createDigitValidator(8)(char)).toBe(false);
  });

  it.each(['a', 'f', 'A'])('dec отклоняет %s', (char) => {
    expect(createDigitValidator(10)(char)).toBe(false);
  });

  it.each(['g', 'G', 'z'])('hex отклоняет %s', (char) => {
    expect(createDigitValidator(16)(char)).toBe(false);
  });

  // ------------------------------------------------------------
  // 5. Нецифровые символы — отклоняются для любой системы счисления
  // ------------------------------------------------------------
  it.each(['-', '+', ' ', '\t', '.', ',', '!', '_', 'x', '#', 'ё'])(
    'отклоняет нецифровой символ %j для любой системы счисления',
    (char) => {
      for (const base of ALL_BASES) {
        expect(createDigitValidator(base)(char)).toBe(false);
      }
    },
  );

  // ------------------------------------------------------------
  // 6. Граничные случаи
  // ------------------------------------------------------------
  it('отклоняет пустую строку для любой системы счисления', () => {
    for (const base of ALL_BASES) {
      expect(createDigitValidator(base)('')).toBe(false);
    }
  });

  it('отклоняет строку длиннее одного символа', () => {
    for (const base of ALL_BASES) {
      expect(createDigitValidator(base)('01')).toBe(false);
      expect(createDigitValidator(base)('ff')).toBe(false);
    }
  });

  it('отклоняет некорректные значения', () => {
    const isValidDigit = createDigitValidator(10);
    // @ts-expect-error: в коде благодаря типизации TypeScript такое не пропустит, но необходимо предусмотреть ситуацию, когда пользователь каким-то образом ввёл такое значение.
    expect(isValidDigit(1)).toBe(false);
    // @ts-expect-error: в коде благодаря типизации TypeScript такое не пропустит, но необходимо предусмотреть ситуацию, когда пользователь каким-то образом ввёл такое значение.
    expect(isValidDigit(null)).toBe(false);
    // @ts-expect-error: в коде благодаря типизации TypeScript такое не пропустит, но необходимо предусмотреть ситуацию, когда пользователь каким-то образом ввёл такое значение.
    expect(isValidDigit(undefined)).toBe(false);
  });

  // ------------------------------------------------------------
  // 7. Каррирование и переиспользование
  // ------------------------------------------------------------
  it('созданный валидатор стабилен при многократных вызовах', () => {
    const isValidDigit = createDigitValidator(16);
    expect(isValidDigit('f')).toBe(true);
    expect(isValidDigit('f')).toBe(true);
    expect(isValidDigit('g')).toBe(false);
    expect(isValidDigit('F')).toBe(true);
  });

  it('валидаторы для разных систем счисления независимы', () => {
    const isBinDigit = createDigitValidator(2);
    const isDecDigit = createDigitValidator(10);
    expect(isBinDigit('5')).toBe(false);
    expect(isDecDigit('5')).toBe(true);
  });

  it('для неподдерживаемой системы счисления возвращает предикат, отклоняющий всё', () => {
    const isValidDigit = createDigitValidator(3 as Base);
    for (const char of ['0', '1', '2', '3', 'a']) {
      expect(isValidDigit(char)).toBe(false);
    }
  });
});
