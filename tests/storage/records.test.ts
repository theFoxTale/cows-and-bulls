import { describe, it, expect, beforeEach } from 'vitest';
import {
  addRecord,
  clearRecords,
  createRecord,
  loadRecords,
  saveRecords,
  type GameRecord,
} from '../../src/storage/records.ts';
import type { WonState } from '../../src/state/game-state.ts';

const REC = (attempts: number, timeMs: number, timestamp = 0): GameRecord => ({
  settings: { length: 4, base: 10 },
  attempts,
  timeMs,
  timestamp,
});

describe('addRecord', () => {
  it('добавляет запись в пустой список', () => {
    expect(addRecord([], REC(3, 1000))).toEqual([REC(3, 1000)]);
  });

  it('сортирует по попыткам, затем по времени', () => {
    const a = REC(3, 2000);
    const b = REC(2, 5000);
    const c = REC(3, 1000);
    expect(addRecord([a], b)).toEqual([b, a]);
    expect(addRecord([b, a], c)).toEqual([b, c, a]);
  });

  it('не мутирует входной массив', () => {
    const original = [REC(3, 1000)];
    const snapshot = [...original];
    addRecord(original, REC(2, 500));
    expect(original).toEqual(snapshot);
  });

  it('ограничивает список 10 записями', () => {
    const many = Array.from({ length: 15 }, (_, i) => REC(i + 1, 1000));
    const result = addRecord(many, REC(20, 1000));
    expect(result).toHaveLength(10);
    expect(result[0].attempts).toBe(1);
  });
});

describe('loadRecords / saveRecords', () => {
  beforeEach(() => {
    clearRecords();
  });

  it('возвращает пустой массив без сохранённых данных', () => {
    expect(loadRecords()).toEqual([]);
  });

  it('сохраняет и загружает записи', () => {
    const record = REC(3, 1500, 1234);
    saveRecords([record]);
    expect(loadRecords()).toEqual([record]);
  });

  it('возвращает пустой массив при повреждённом JSON', () => {
    localStorage.setItem('cows-and-bulls:records', 'not json');
    expect(loadRecords()).toEqual([]);
  });

  it('фильтрует невалидные записи', () => {
    localStorage.setItem('cows-and-bulls:records', JSON.stringify([REC(3, 1500), { invalid: 'shape' }, null, 42]));
    expect(loadRecords()).toHaveLength(1);
  });
});

describe('createRecord', () => {
  it('вычисляет attempts, timeMs, timestamp из WonState', () => {
    const state: WonState = {
      status: 'won',
      settings: { length: 4, base: 10 },
      secret: '1234',
      history: [
        { guess: '5678', result: { bulls: 0, cows: 2 } },
        { guess: '1234', result: { bulls: 4, cows: 0 } },
      ],
      startedAt: 1000,
      finishedAt: 12500,
    };
    expect(createRecord(state)).toEqual({
      settings: { length: 4, base: 10 },
      attempts: 2,
      timeMs: 11500,
      timestamp: 12500,
    });
  });
});
