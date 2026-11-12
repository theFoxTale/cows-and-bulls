import { describe, it, expect } from 'vitest';
import { evaluateGuess } from '@core';

describe('evaluateGuess', () => {
  it('полное совпадение, все быки', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
  });

  it('полное несовпадение, нули везде', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
  });

  it('только коровы при неверном порядке', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
  });

  it('быки и коровы вместе в разных комбинациях', () => {
    expect(evaluateGuess('1234', '1243')).toEqual({ bulls: 2, cows: 2 });
    expect(evaluateGuess('1234', '1324')).toEqual({ bulls: 2, cows: 2 });
    expect(evaluateGuess('1234', '4132')).toEqual({ bulls: 1, cows: 3 });
  });

  it('бык не считается коровой', () => {
    expect(evaluateGuess('1234', '1567')).toEqual({ bulls: 1, cows: 0 });
  });

  it('регистр не важен для hex', () => {
    expect(evaluateGuess('abcd', 'ABCD')).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess('abcd', 'dcba')).toEqual({ bulls: 0, cows: 4 });
  });

  it('работает для коротких секретов (система счисления bin)', () => {
    expect(evaluateGuess('01', '10')).toEqual({ bulls: 0, cows: 2 });
    expect(evaluateGuess('01', '01')).toEqual({ bulls: 2, cows: 0 });
  });

  it('не считает одну и ту же цифру дважды', () => {
    // секреты в примерах невалидны по правилам игры, проверяем сам функционал
    expect(evaluateGuess('1123', '1100')).toEqual({ bulls: 2, cows: 0 });
    expect(evaluateGuess('1123', '1001')).toEqual({ bulls: 1, cows: 1 });
    expect(evaluateGuess('211', '102')).toEqual({ bulls: 0, cows: 2 });
  });

  it('возвращает новый объект на каждый вызов', () => {
    const a = evaluateGuess('1234', '4321');
    const b = evaluateGuess('1234', '4321');
    expect(a).not.toBe(b); // разные ссылки
    expect(a).toEqual(b); // одинаковые значения
  });
});
