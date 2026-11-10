import { type Base, getBaseData } from './digits';

/**
 * Проверяет, что значение, возвращённое источником случайности, лежит в полуинтервале [0, 1).
 * Если находит проблему - бросает RangeError, инвертированное условие ловит NaN.
 */
const checkRandomValidity = (value: number): void => {
  if (!(value >= 0 && value < 1)) {
    throw new RangeError('random() must return a number in [0, 1)');
  }
};

/**
 * Генерирует секретное число заданной длины в указанной системе счисления.
 * Использует частичный алгоритм Фишера–Йетса (частичная перетасовка Фишера–Йетса).
 *
 * @param length - длина секретного числа
 * @param base - основание системы счисления (например, 10 или 16)
 * @param random - функция - источник случайности, возвращающий значение в полуинтервале [0, 1), по умолчанию Math.random
 * @returns секретное число (строка символов в нижнем регистре)
 */
export function generateSecret(length: number, base: Base, random: () => number = Math.random): string {
  if (length < 0) throw new RangeError('Parameter length must be non-negative');
  if (!Number.isSafeInteger(length)) throw new RangeError('Parameter length must be an integer');

  if (length === 0) return '';

  const baseData = getBaseData(base);
  if (!baseData) throw new RangeError(`Unsupported base: ${String(base)}`);

  const digits = baseData.allowed.split('');
  if (length > digits.length) throw new RangeError('Parameter length cannot exceed alphabet size');

  for (let i = 0; i < length; i++) {
    const randomValue = random();
    checkRandomValidity(randomValue);

    const j = i + Math.floor(randomValue * (digits.length - i));

    const temporary = digits[i];
    digits[i] = digits[j];
    digits[j] = temporary;
  }
  return digits.slice(0, length).join('');
}
