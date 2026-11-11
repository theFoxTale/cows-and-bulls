export type GuessResult = {
  bulls: number;
  cows: number;
};

/**
 * Сравнивает попытку с секретным числом и возвращает количество быков и коров.
 *
 * @param _secret - секретное число (строка символов)
 * @param _guess - попытка игрока (строка символов)
 * @returns объект с количеством быков (правильная позиция) и коров (неправильная позиция)
 */
export function evaluateGuess(_secret: string, _guess: string): GuessResult {
  return { bulls: 0, cows: 0 };
}
