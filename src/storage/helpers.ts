import { type Base, BASE_CONFIGS } from '@core';

// Целое безопасное число ≥ 1 (попытки)
export const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && value >= 1 && Number.isSafeInteger(value);

// Конечное число ≥ 0 (время в мс).
export const isNonNegativeFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && value >= 0 && Number.isFinite(value);

// Конечное число (timestamp может быть любым по знаку).
export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

// Допустимые основания — выводятся из BASE_CONFIGS, а не дублируются.
const VALID_BASES: ReadonlySet<number> = new Set(BASE_CONFIGS.map((config) => config.value));

// Основание системы счисления.
export const isValidBase = (value: unknown): value is Base => typeof value === 'number' && VALID_BASES.has(value);

// Форма объекта настроек.
export const isSettingsShape = (value: unknown): value is { length: number; base: 2 | 8 | 10 | 16 } => {
  return typeof value !== 'object' || value === null || !('length' in value) || !('base' in value)
    ? false
    : isPositiveSafeInteger(value.length) && isValidBase(value.base);
};
