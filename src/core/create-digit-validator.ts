import { type Base } from './digits';
import { getBaseData } from './digits';

/**
 * Создаёт функцию-предикат для проверки, является ли символ допустимой цифрой
 * в указанной системе счисления. Для base > 10 регистр не важен.
 *
 * @param base - основание системы счисления
 * @returns функция, возвращающая true, если символ — допустимая цифра
 */
export function createDigitValidator(base: Base): (char: string) => boolean {
  const baseData = getBaseData(base);
  const allowedDigits = baseData ? baseData.allowed : '';

  return (char: string) => {
    //typeof char === 'string' сделан специально - защита от пользовательского ввода
    const isSingleChar = typeof char === 'string' && char.length === 1;
    return isSingleChar && allowedDigits.includes(char.toLowerCase());
  };
}
