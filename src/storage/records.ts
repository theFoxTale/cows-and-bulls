import type { Settings, WonState } from '../state/game-state';
import { isFiniteNumber, isNonNegativeFiniteNumber, isPositiveSafeInteger, isSettingsShape } from './helpers.ts';

/**
 * Запись в таблице рекордов. Задание разрешает два варианта:
 * отдельная таблица на `(length, base)` или общий список с бейджем.
 * Здесь — общий список: `settings` хранится в записи и показывается бейджем.
 */
export type GameRecord = {
  readonly settings: Settings;
  readonly attempts: number;
  readonly timeMs: number;
  /**
    Момент победы (finishedAt), используется для подсветки «текущей» записи.
    */
  readonly timestamp: number;
};

const STORAGE_KEY = 'cows-and-bulls:records';
const MAX_RECORDS = 10;

/**
 * Загружает рекорды из localStorage.
 * Возвращает `[]` при отсутствии данных, повреждённом JSON или недоступном хранилище.
 */
export function loadRecords(): readonly GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isGameRecord) : [];
  } catch {
    return [];
  }
}

/**
 * Сохраняет рекорды в localStorage. При ошибке (приватный режим, квота)
 * тихо игнорирует — рекорды не критичны для игры.
 */
export function saveRecords(records: readonly GameRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // silent: localStorage недоступен
  }
}

/**
 * Добавляет запись в список: сортирует по попыткам (ASC), затем по времени (ASC),
 * обрезает до MAX_RECORDS. Не мутирует входной массив.
 */
export function addRecord(records: readonly GameRecord[], record: GameRecord): GameRecord[] {
  return [...records, record]
    .toSorted((a, b) => a.attempts - b.attempts || a.timeMs - b.timeMs || b.timestamp - a.timestamp)
    .slice(0, MAX_RECORDS);
}

/**
Удаляет все рекорды. Используется в тестах и (опционально) в UI.
*/
export function clearRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}

/**
 * Преобразует выигранную партию в запись рекорда.
 * `timeMs` вычисляется из `finishedAt - startedAt`, `timestamp = finishedAt`.
 */
export function createRecord(state: WonState): GameRecord {
  return {
    settings: state.settings,
    attempts: state.history.length,
    timeMs: state.finishedAt - state.startedAt,
    timestamp: state.finishedAt,
  };
}

/**
 * Проверяет форму записи. `JSON.parse` возвращает `any`, а `as GameRecord[]`
 * ничего не проверяет — старая схема или ручная правка localStorage
 * сломали бы рендер. Поэтому валидируем явно.
 */
function isGameRecord(value: unknown): value is GameRecord {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('attempts' in value) ||
    !('timeMs' in value) ||
    !('timestamp' in value) ||
    !('settings' in value)
  ) {
    return false;
  }

  const { attempts, timeMs, timestamp, settings } = value;

  return (
    isPositiveSafeInteger(attempts) &&
    isNonNegativeFiniteNumber(timeMs) &&
    isFiniteNumber(timestamp) &&
    isSettingsShape(settings)
  );
}
