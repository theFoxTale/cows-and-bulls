import { type Base, BASE_CONFIGS } from '@core';

const shouldRejectAll = (_char: string): boolean => false;

/**
Создаёт функцию-предикат для проверки, является ли символ допустимой цифрой
в указанной системе счисления. Для base > 10 регистр не важен.

@param base - основание системы счисления
@returns функция, возвращающая true, если символ — допустимая цифра
*/
export function createDigitValidator(base: Base): (char: string) => boolean {
  const baseData = BASE_CONFIGS.find((item) => item.value === base);
  if (!baseData) return shouldRejectAll;

  return (char: string) => {
    return typeof char === 'string' && char.length === 1 ? baseData.allowed.includes(char.toLowerCase()) : false;
  };
}
