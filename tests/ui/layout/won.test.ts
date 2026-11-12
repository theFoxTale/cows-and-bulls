import { describe, it, expect, vi } from 'vitest';
import { getCollection, getElement } from '@dom';
import { renderWon } from '@layout';
import type { WonState } from '../../../src/state/game-state.ts';
import type { GameRecord } from '../../../src/storage/records.ts';

const WON: WonState = {
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

describe('renderWon', () => {
  it('показывает секрет', () => {
    const el = renderWon(WON, [], vi.fn());
    expect(el.querySelector('.won__secret')?.textContent).toBe('1234');
  });

  it('показывает число попыток и время', () => {
    const el = renderWon(WON, [], vi.fn());
    expect(el.textContent).toContain('2');
    expect(el.textContent).toContain('11.5');
  });

  it('не рендерит таблицу рекордов при пустом списке', () => {
    const el = renderWon(WON, [], vi.fn());
    expect(el.querySelector('.won__records')).toBeNull();
  });

  it('рендерит таблицу рекордов', () => {
    const records: GameRecord[] = [
      { settings: { length: 4, base: 10 }, attempts: 2, timeMs: 11500, timestamp: 12500 },
      { settings: { length: 3, base: 8 }, attempts: 5, timeMs: 20000, timestamp: 5000 },
    ];
    const el = renderWon(WON, records, vi.fn());
    const rows = getCollection(HTMLDivElement, '.records__row', el);
    expect(rows).toHaveLength(2);
  });

  it('подсвечивает текущую партию (по timestamp)', () => {
    const records: GameRecord[] = [
      { settings: { length: 4, base: 10 }, attempts: 2, timeMs: 11500, timestamp: 12500 },
      { settings: { length: 3, base: 8 }, attempts: 5, timeMs: 20000, timestamp: 5000 },
    ];
    const el = renderWon(WON, records, vi.fn());
    const current = getCollection(HTMLDivElement, '.records__row--current', el);
    expect(current).toHaveLength(1);
  });

  it('кнопка «Новая игра» отправляет RESET', () => {
    const dispatch = vi.fn();
    const el = renderWon(WON, [], dispatch);
    const button = getElement(HTMLButtonElement, '.btn--primary', el);
    button.click();
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESET' });
  });
});
