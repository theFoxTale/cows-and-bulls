import { createElement, createDiv } from '@dom';
import type { Action, WonState } from '../../state/game-state';
import type { GameRecord } from '../../storage/records';

/**
 * Рендерит экран победы: секрет, статистика, таблица рекордов, кнопка «Новая попытка».
 *
 * Чистая функция: не трогает localStorage, `records` приходит параметром.
 * Сохранение текущей попытки выполняет `dispatch` в `app.ts` — там же, где происходят все side effects.
 */
export function renderWon(
  state: WonState,
  records: readonly GameRecord[],
  dispatch: (action: Action) => void,
): HTMLElement {
  const { secret, history, startedAt, finishedAt, settings } = state;
  const attempts = history.length;
  const timeMs = finishedAt - startedAt;

  const recordsBlock = createRecordsBlock(records, finishedAt);

  return createDiv({
    className: ['won'],
    children: [
      createResultBlock(secret),
      createStatsBlock(attempts, timeMs, settings),
      ...(recordsBlock ? [recordsBlock] : []),
      createNewGameButton(dispatch),
    ],
  });
}

function createResultBlock(secret: string): HTMLDivElement {
  return createDiv({
    className: ['won__result'],
    children: [
      createElement({ tag: 'p', className: ['won__label'], text: 'Разведданные получены!' }),
      createElement({ tag: 'p', className: ['won__secret'], text: secret }),
    ],
  });
}

function createStatsBlock(attempts: number, timeMs: number, settings: WonState['settings']): HTMLDivElement {
  return createDiv({
    className: ['won__stats'],
    children: [
      createStat(String(attempts), 'попыток'),
      createStat(formatTime(timeMs), 'время'),
      createStat(`${String(settings.length)}/${String(settings.base)}`, 'режим'),
    ],
  });
}

function createRecordsBlock(records: readonly GameRecord[], finishedAt: number): HTMLDivElement | null {
  if (records.length === 0) return null;
  return createDiv({
    className: ['won__records'],
    children: [
      createElement({ tag: 'h2', text: 'Рекорды' }),
      createDiv({
        className: ['records'],
        children: records.map((record, index) => createRecordRow(record, index, record.timestamp === finishedAt)),
      }),
    ],
  });
}

function createNewGameButton(dispatch: (action: Action) => void): HTMLElement {
  const button = createElement({
    tag: 'button',
    className: ['btn', 'btn--primary'],
    text: 'Новая миссия',
    attrs: { type: 'button' },
  });
  button.addEventListener('click', () => {
    dispatch({ type: 'RESET' });
  });
  return button;
}

function createStat(value: string, label: string): HTMLDivElement {
  return createDiv({
    className: ['won__stat'],
    children: [
      createElement({ tag: 'span', className: ['won__stat-value'], text: value }),
      createElement({ tag: 'span', className: ['won__stat-label'], text: label }),
    ],
  });
}

function createRecordRow(record: GameRecord, index: number, isCurrent: boolean): HTMLDivElement {
  return createDiv({
    className: ['records__row', ...(isCurrent ? ['records__row--current'] : [])],
    children: [
      createElement({ tag: 'span', className: ['records__rank'], text: `#${String(index + 1)}` }),
      createElement({
        tag: 'span',
        className: ['records__config'],
        text: `${String(record.settings.length)}/${String(record.settings.base)}`,
      }),
      createElement({
        tag: 'span',
        className: ['records__attempts'],
        text: String(record.attempts),
      }),
      createElement({
        tag: 'span',
        className: ['records__time'],
        text: formatTime(record.timeMs),
      }),
    ],
  });
}

function formatTime(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)}s`;
}
