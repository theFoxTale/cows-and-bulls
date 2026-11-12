import { type Base, getBaseData } from './digits';

const cache = new Map<string, number>();

/**
 * Пошаговое умножение, реализация через рекурсию.
 * Последовательно перемножает числа от n вниз k раз, получая произведение n × (n - 1) × ... × (n - k + 1).
 *
 * @returns количество перестановок без повторений
 */
const countPermutations = (n: number, k: number): number => {
  if (k === 0) return 1;
  if (k > n) return 0;

  return n * countPermutations(n - 1, k - 1);
};

/**
 * Считает количество различных секретных чисел при заданных длине и основании с мемоизацией.
 * Формула для определения количества перестановок без повторений: P(base, length) = base! / (base - length)!
 * ! - это факториал, который означает произведение всех чисел от 1 до заданного числа.
 *
 * @param length - длина секретного числа
 * @param base - основание системы счисления
 * @returns количество возможных секретных чисел
 */
export function countPossibleSecrets(length: number, base: Base): number {
  if (!Number.isSafeInteger(length)) throw new RangeError('Parameter length must be an integer');
  if (length < 0) throw new RangeError('Parameter length must be greater than zero');

  const baseData = getBaseData(base);
  if (!baseData) throw new RangeError(`Unsupported base: ${String(base)}`);

  const key = `${String(length)}_${String(base)}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const result = countPermutations(base, length);
  cache.set(key, result);
  return result;
}
