import { type Base, BASE_CONFIGS } from '@core';

/**
Проверяет, является ли попытка валидной:
 - длина совпадает с ожидаемой
 - все символы — допустимые цифры для указанной системы счисления
 - цифры не повторяются

 @param guess - попытка игрока (строка символов)
 @param length - ожидаемая длина
 @param base - основание системы счисления
 @returns true, если попытка валидна, иначе false
*/
export function isValidGuess(guess: string, length: number, base: Base): boolean {
  // - длина совпадает с ожидаемой
  if (guess.length !== length) return false;

  // - все символы — допустимые цифры для указанной системы счисления
  const baseData = BASE_CONFIGS.find((item) => item.value === base);
  if (baseData) {
    const guessDigits = guess.toLowerCase().split('');
    const isValidDigits = guessDigits.every((digit) => baseData.allowed.includes(digit));
    if (!isValidDigits) return false;
  }

  // - цифры не повторяются
  const normalizedGuess = new Set(guess.toLowerCase());
  return normalizedGuess.size === guess.length;
}
