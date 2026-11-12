import type { Base, GuessResult } from '@core';

// ============================================================
// Типы
// ============================================================

/**
 * Настройки партии. Выбираются до старта и не меняются во время игры.
 * `base` — тип Base, а не `number`, чтобы `generateSecret(length, base)`
 * принимал переданное значение без дополнительных проверок.
 */
export type Settings = {
  readonly length: number;
  readonly base: Base;
};

/**
 * Одна попытка игрока.
 *
 * `attempt` не хранится — вычисляется как `index + 1` при рендере,
 * чтобы не было двух источников истины.
 */
export type GuessEntry = {
  readonly guess: string;
  readonly result: GuessResult;
};

/**
 * Состояние до старта партии.
 * Пользователь настраивает длину слова и систему счисления.
 */
export type SettingsState = {
  readonly status: 'settings';
  readonly settings: Settings;
};

/**
 * Партия идёт: секрет загадан, попытки накапливаются.
 */
export type PlayingState = {
  readonly status: 'playing';
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly GuessEntry[];
  readonly startedAt: number;
};

/**
 * Партия выиграна: секрет угадан, известно время окончания.
 */
export type WonState = {
  readonly status: 'won';
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly GuessEntry[];
  readonly startedAt: number;
  readonly finishedAt: number;
};

/**
 * Состояние приложения.
 * Discriminated union по полю `status`.
 */
export type GameState = SettingsState | PlayingState | WonState;

// ============================================================
// Начальное состояние
// ============================================================

/**
 * Настройки по умолчанию: десятичная система счисления, длина слова 4.
 */
export const DEFAULT_SETTINGS: Settings = { length: 4, base: 10 };

/**
 * Создаёт начальное состояние приложения.
 * Принимает настройки параметром для тестируемости.
 */
export function createInitialState(settings: Settings = DEFAULT_SETTINGS): SettingsState {
  return { status: 'settings', settings };
}

// ============================================================
// Действия
// ============================================================

/**
 * Действия, которые могут изменить состояние.
 *
 * Discriminated Union, строго задаёт все возможные действия (события),
 * которые могут произойти в программе.
 *
 * `now` передаётся в действии, а не берётся из `Date.now()` внутри reducer'а —
 * это делает reducer чистым и детерминированным.
 */
export type Action =
  | {
      readonly type: 'UPDATE_SETTINGS';
      readonly settings: Settings;
    }
  | {
      readonly type: 'START';
      readonly secret: string;
      readonly now: number;
    }
  | {
      readonly type: 'GUESS';
      readonly guess: string;
      readonly result: GuessResult;
    }
  | {
      readonly type: 'WIN';
      readonly now: number;
    }
  | {
      readonly type: 'RESET';
    };

// ============================================================
// Reducer
// ============================================================

/**
 * Чистая функция обновления состояния.
 * Иммутабельна: ни одна ветка не мутирует `state`, всегда возвращается новый объект
 * (или тот же самый, если действие не применимо в текущем статусе).
 *
 * Переходы:
 * - `'settings'` + `UPDATE_SETTINGS` → `'settings'` (смена настроек)
 * - `'settings'` + `START`           → `'playing'`
 * - `'playing'`  + `GUESS`           → `'playing'` (добавление попытки)
 * - `'playing'`  + `WIN`             → `'won'`
 * - `'won'`      + `RESET`           → `'settings'`
 * - любое прочее — состояние не меняется (возвращается `state` как есть)
 *
 * @param state  - текущее состояние
 * @param action - действие
 * @returns новое состояние; если действие неприменимо — исходный `state`
 */
export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'UPDATE_SETTINGS': {
      return state.status === 'settings' ? { status: 'settings', settings: action.settings } : state;
    }

    case 'START': {
      if (state.status !== 'settings') return state;
      return {
        status: 'playing',
        settings: state.settings,
        secret: action.secret,
        history: [],
        startedAt: action.now,
      };
    }

    case 'GUESS': {
      if (state.status !== 'playing') return state;
      return {
        ...state,
        history: [...state.history, { guess: action.guess, result: action.result }],
      };
    }

    case 'WIN': {
      if (state.status !== 'playing') return state;
      return {
        status: 'won',
        settings: state.settings,
        secret: state.secret,
        history: state.history,
        startedAt: state.startedAt,
        finishedAt: action.now,
      };
    }

    case 'RESET': {
      return { status: 'settings', settings: state.settings };
    }
  }
}
