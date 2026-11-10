/**
 * Доступные системы счисления
 * - bin (двоичная)
 * - oct (восьмеричная)
 * - dec (десятичная)
 * - hex (шестнадцатеричная)
 */
export type Base = 2 | 8 | 10 | 16;

type BaseData = {
  value: Base;
  label: string;
  allowed: string;
};

export const BASE_CONFIGS: BaseData[] = [
  { value: 2, label: 'bin', allowed: '01' },
  { value: 8, label: 'oct', allowed: '01234567' },
  { value: 10, label: 'dec', allowed: '0123456789' },
  { value: 16, label: 'hex', allowed: '0123456789abcdef' },
];

export const getBaseData = (base: Base): BaseData | undefined => BASE_CONFIGS.find((item) => item.value === base);
