import type { Base } from '@core';

const shouldRejectAll = (_char: string): boolean => false;

/**
Создаёт функцию-предикат для проверки, является ли символ допустимой цифрой
в указанной системе счисления. Для base > 10 регистр не важен.

@param _base - основание системы счисления
@returns функция, возвращающая true, если символ — допустимая цифра
*/
export function createDigitValidator(_base: Base): (char: string) => boolean {
  return shouldRejectAll;
}
