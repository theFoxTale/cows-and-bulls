import type { Base } from './digits';
import { createDigitValidator } from './create-digit-validator';

/**
 * Проверяет, является ли попытка валидной:
 * - длина совпадает с ожидаемой
 * - все символы — допустимые цифры для указанной системы счисления
 * - цифры не повторяются
 *
 * @param guess - попытка игрока (строка символов)
 * @param length - ожидаемая длина
 * @param base - основание системы счисления
 * @returns true, если попытка валидна, иначе false
 */
export function isValidGuess(guess: string, length: number, base: Base): boolean {
  // - длина совпадает с ожидаемой
  if (guess.length !== length) return false;

  // - все символы — допустимые цифры для указанной системы счисления
  const normalizedGuess = guess.toLowerCase();
  const isValidDigit = createDigitValidator(base);
  if (!normalizedGuess.split('').every(isValidDigit)) return false;

  // - цифры не повторяются
  const filteredGuess = new Set(normalizedGuess);
  return filteredGuess.size === guess.length;
}
