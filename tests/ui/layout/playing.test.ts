import { describe, it, expect, vi } from 'vitest';
import { renderPlaying } from '@layout';
import type { Action, PlayingState } from '../../../src/state/game-state.ts';

const playingState: PlayingState = {
  status: 'playing',
  settings: { length: 4, base: 10 },
  secret: '1234',
  history: [],
  startedAt: 0,
};

describe('renderPlaying', () => {
  it('показывает сообщение при пустой истории', () => {
    const el = renderPlaying(playingState, vi.fn());
    expect(el.querySelector('.history--empty')?.textContent).toBe('Пока ещё ни один отряд не ходил в разведку.');
  });

  it('рендерит историю попыток в порядке добавления', () => {
    const state = {
      ...playingState,
      history: [
        { guess: '5678', result: { bulls: 0, cows: 2 } },
        { guess: '9012', result: { bulls: 1, cows: 1 } },
      ],
    };
    const el = renderPlaying(state, vi.fn());
    const guesses = [...el.querySelectorAll('.history__guess')].map((n) => n.textContent);
    expect(guesses).toEqual(['5678', '9012']);
  });

  it('не рендерит секрет', () => {
    const el = renderPlaying(playingState, vi.fn());
    expect(el.textContent).not.toContain('1234');
  });

  it('при валидной попытке dispatch вызывается с GUESS', () => {
    const dispatch = vi.fn();
    const el = renderPlaying(playingState, dispatch);
    const input = el.querySelector<HTMLInputElement>('.guess-form__input');
    const form = el.querySelector<HTMLFormElement>('.guess-form');

    expect(input).not.toBeNull();
    expect(form).not.toBeNull();
    if (!input || !form) throw new Error('unreachable');

    input.value = '5678';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(dispatch).toHaveBeenCalledWith({
      type: 'GUESS',
      guess: '5678',
      result: { bulls: 0, cows: 0 },
    });
  });

  it('при победной попытке dispatch вызывается дважды: GUESS и WIN', () => {
    const dispatch = vi.fn<(action: Action) => void>();
    const el = renderPlaying(playingState, dispatch);

    const input = el.querySelector<HTMLInputElement>('.guess-form__input');
    const form = el.querySelector<HTMLFormElement>('.guess-form');

    expect(input).not.toBeNull();
    expect(form).not.toBeNull();
    if (!input || !form) throw new Error('unreachable');

    input.value = '1234';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    // Первое действие — GUESS — проверяем целиком
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: 'GUESS',
      guess: '1234',
      result: { bulls: 4, cows: 0 },
    });

    // Второе действие — WIN — проверяем через типизированный mock.calls, иначе будет ошибка с `any`
    const secondAction = dispatch.mock.calls[1]?.[0];
    if (secondAction.type !== 'WIN') {
      throw new Error('Second dispatch should be WIN action');
    }
    expect(typeof secondAction.now).toBe('number');
    expect(secondAction.now).toBeGreaterThan(0);
  });

  it('невалидный ввод не вызывает dispatch и показывает ошибку', () => {
    const dispatch = vi.fn();
    const el = renderPlaying(playingState, dispatch);
    const input = el.querySelector<HTMLInputElement>('.guess-form__input');
    const form = el.querySelector<HTMLFormElement>('.guess-form');

    expect(input).not.toBeNull();
    expect(form).not.toBeNull();
    if (!input || !form) throw new Error('unreachable');

    input.value = '12';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(dispatch).not.toHaveBeenCalled();
    expect(el.querySelector('.guess-form__error')?.textContent).toContain(
      'Необходимо собрать 4 уникальных номеров разведчиков',
    );
  });
});
