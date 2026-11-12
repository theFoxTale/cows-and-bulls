import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  DEFAULT_SETTINGS,
  type GameState,
  type PlayingState,
  reduce,
  type WonState,
} from '../../src/state/game-state.ts';
const RESULT = { bulls: 2, cows: 1 };

describe('createInitialState', () => {
  it('возвращает статус settings с настройками по умолчанию', () => {
    expect(createInitialState()).toEqual({
      status: 'settings',
      settings: DEFAULT_SETTINGS,
    });
  });

  it('принимает кастомные настройки', () => {
    expect(createInitialState({ length: 2, base: 2 })).toEqual({
      status: 'settings',
      settings: { length: 2, base: 2 },
    });
  });
});

describe('reduce — UPDATE_SETTINGS', () => {
  it('меняет настройки в статусе settings', () => {
    const state = createInitialState();
    const next = reduce(state, {
      type: 'UPDATE_SETTINGS',
      settings: { length: 6, base: 16 },
    });
    expect(next).toEqual({ status: 'settings', settings: { length: 6, base: 16 } });
  });

  it('игнорируется в статусе playing', () => {
    const state: GameState = {
      status: 'playing',
      settings: DEFAULT_SETTINGS,
      secret: '1234',
      history: [],
      startedAt: 1000,
    };
    expect(reduce(state, { type: 'UPDATE_SETTINGS', settings: { length: 2, base: 2 } })).toBe(state);
  });
});

describe('reduce — START', () => {
  it('переводит settings → playing', () => {
    const state = createInitialState();
    const next = reduce(state, { type: 'START', secret: '1234', now: 1000 });
    expect(next).toEqual({
      status: 'playing',
      settings: DEFAULT_SETTINGS,
      secret: '1234',
      history: [],
      startedAt: 1000,
    });
  });

  it('игнорируется, если уже playing', () => {
    const playing: PlayingState = {
      status: 'playing',
      settings: DEFAULT_SETTINGS,
      secret: '1234',
      history: [],
      startedAt: 1000,
    };
    expect(reduce(playing, { type: 'START', secret: '5678', now: 2000 })).toBe(playing);
  });

  it('игнорируется, если уже won', () => {
    const won: WonState = {
      status: 'won',
      settings: DEFAULT_SETTINGS,
      secret: '1234',
      history: [{ guess: '1234', result: { bulls: 4, cows: 0 } }],
      startedAt: 1000,
      finishedAt: 5000,
    };
    expect(reduce(won, { type: 'START', secret: '5678', now: 6000 })).toBe(won);
  });
});

describe('reduce — GUESS', () => {
  const playing: PlayingState = {
    status: 'playing',
    settings: DEFAULT_SETTINGS,
    secret: '1234',
    history: [],
    startedAt: 1000,
  };

  it('добавляет попытку в конец истории', () => {
    const next = reduce(playing, { type: 'GUESS', guess: '5678', result: RESULT });
    expect(next).toEqual({
      ...playing,
      history: [{ guess: '5678', result: RESULT }],
    });
  });

  it('не мутирует исходную историю', () => {
    const original = [...playing.history];
    reduce(playing, { type: 'GUESS', guess: '5678', result: RESULT });
    expect(playing.history).toEqual(original);
  });

  it('накапливает несколько попыток по порядку', () => {
    const next1 = reduce(playing, { type: 'GUESS', guess: '1111', result: RESULT });
    const next2 = reduce(next1, { type: 'GUESS', guess: '2222', result: RESULT });
    expect(next2.status).toBe('playing');
    if (next2.status !== 'playing') return;
    expect(next2.history.map((h) => h.guess)).toEqual(['1111', '2222']);
  });

  it('игнорируется в статусе settings', () => {
    const settings = createInitialState();
    expect(reduce(settings, { type: 'GUESS', guess: '1234', result: RESULT })).toBe(settings);
  });

  it('игнорируется в статусе won', () => {
    const won: WonState = {
      status: 'won',
      settings: DEFAULT_SETTINGS,
      secret: '1234',
      history: [{ guess: '1234', result: { bulls: 4, cows: 0 } }],
      startedAt: 1000,
      finishedAt: 5000,
    };
    expect(reduce(won, { type: 'GUESS', guess: '0000', result: RESULT })).toBe(won);
  });
});

describe('reduce — WIN', () => {
  const playing: PlayingState = {
    status: 'playing',
    settings: DEFAULT_SETTINGS,
    secret: '1234',
    history: [{ guess: '1234', result: { bulls: 4, cows: 0 } }],
    startedAt: 1000,
  };

  it('переводит playing → won с finishedAt', () => {
    const next = reduce(playing, { type: 'WIN', now: 5000 });
    expect(next).toEqual({ ...playing, status: 'won', finishedAt: 5000 });
  });

  it('сохраняет историю и время старта', () => {
    const next = reduce(playing, { type: 'WIN', now: 5000 });
    if (next.status !== 'won') return;
    expect(next.history).toBe(playing.history);
    expect(next.startedAt).toBe(1000);
  });

  it('игнорируется, если уже won', () => {
    const won = reduce(playing, { type: 'WIN', now: 5000 });
    expect(reduce(won, { type: 'WIN', now: 9000 })).toBe(won);
  });
});

describe('reduce — RESET', () => {
  it('возвращает в settings, сохраняя настройки', () => {
    const won: WonState = {
      status: 'won',
      settings: { length: 6, base: 16 },
      secret: 'abcdef',
      history: [],
      startedAt: 1000,
      finishedAt: 5000,
    };
    expect(reduce(won, { type: 'RESET' })).toEqual({
      status: 'settings',
      settings: { length: 6, base: 16 },
    });
  });

  it('из settings ничего не меняет', () => {
    const settings = createInitialState();
    const next = reduce(settings, { type: 'RESET' });
    expect(next).toEqual(settings);
  });

  it('из playing сбрасывает партию', () => {
    const playing: PlayingState = {
      status: 'playing',
      settings: DEFAULT_SETTINGS,
      secret: '1234',
      history: [{ guess: '0000', result: RESULT }],
      startedAt: 1000,
    };
    expect(reduce(playing, { type: 'RESET' })).toEqual({
      status: 'settings',
      settings: DEFAULT_SETTINGS,
    });
  });
});
