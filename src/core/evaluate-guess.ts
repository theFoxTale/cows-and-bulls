export type GuessResult = {
  bulls: number;
  cows: number;
};

/**
 * Сравнивает попытку с секретным числом и возвращает количество быков и коров.
 *
 * @param secret - секретное число (строка символов)
 * @param guess - попытка игрока (строка символов)
 * @returns объект с количеством быков (правильная позиция) и коров (неправильная позиция)
 */
export function evaluateGuess(secret: string, guess: string): GuessResult {
  const normalizedSecret = secret.toLowerCase();
  const normalizedGuess = guess.toLowerCase();

  const secretArray = normalizedSecret.split('');
  const guessArray = normalizedGuess.split('');

  const bullsCount = guessArray.reduce((sum, digit, index) => {
    return sum + (digit === secretArray[index] ? 1 : 0);
  }, 0);

  // Значения, которые не совпали в строках
  const secretRest = secretArray.filter((digit, index) => digit !== guessArray[index]);
  const guessRest = guessArray.filter((digit, index) => digit !== secretArray[index]);

  // Сравнение не совпавших значений
  const cowsCount = guessRest.reduce((sum, digit) => {
    const firstIndex = secretRest.indexOf(digit);
    if (firstIndex === -1) return sum;

    secretRest.splice(firstIndex, 1);
    return sum + 1;
  }, 0);

  return { bulls: bullsCount, cows: cowsCount };
}
