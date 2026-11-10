/**
Доступные системы счисления
- bin (двоичная)
- oct (восьмеричная)
- dec (десятичная)
- hex (шестнадцатеричная)
*/
type Base = 2 | 8 | 10 | 16;

type BaseData = {
  value: Base;
  label: string;
  allowed: string;
};

const BASE_CONFIGS: BaseData[] = [
  { value: 2, label: 'bin', allowed: '01' },
  { value: 8, label: 'oct', allowed: '01234567' },
  { value: 10, label: 'dec', allowed: '0123456789' },
  { value: 16, label: 'hex', allowed: '0123456789abcdef' },
];

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
