import { isValidGuess, evaluateGuess, createDigitValidator } from '@core';
import { createElement, createDiv } from '@dom';
import type { Action, PlayingState } from '../../../src/state/game-state';

//--------------------------------------------------------------------------------
// Заголовок
function renderStat(text: string): HTMLElement {
  return createElement({ tag: 'span', className: ['playing__stat'], text });
}

function renderHeader(settings: PlayingState['settings'], history: PlayingState['history']): HTMLElement {
  return createDiv({
    className: ['playing__header'],
    children: [
      renderStat(`Base: ${String(settings.base)}`),
      renderStat(`Length: ${String(settings.length)}`),
      renderStat(`Attempts: ${String(history.length)}`),
    ],
  });
}

//--------------------------------------------------------------------------------
// Блок с историей
function renderSpan(className: string, text: string): HTMLElement {
  return createElement({ tag: 'span', className: [className], text });
}

function renderHistoryEntry(entry: PlayingState['history'][number], index: number): HTMLElement {
  return createDiv({
    className: ['history__entry'],
    children: [
      renderSpan('history__attempt', `#${String(index + 1)}`),
      renderSpan('history__guess', entry.guess),
      renderSpan('history__bulls', `🐂 ${String(entry.result.bulls)}`),
      renderSpan('history__cows', `🐄 ${String(entry.result.cows)}`),
    ],
  });
}

function renderHistory(history: PlayingState['history']): HTMLElement {
  if (history.length === 0) {
    return createDiv({ className: ['history', 'history--empty'], text: 'No guesses yet.' });
  }
  return createDiv({
    className: ['history'],
    children: history.map(renderHistoryEntry),
  });
}

//--------------------------------------------------------------------------------
// Блок для ввода строки для попытки
function createGuessInput(settings: PlayingState['settings']) {
  const input = createElement({
    tag: 'input',
    className: ['guess-form__input'],
    attrs: {
      type: 'text',
      maxlength: String(settings.length),
      placeholder: `${String(settings.length)} digits, base ${String(settings.base)}`,
      autocomplete: 'off',
      spellcheck: 'false',
      inputmode: settings.base === 16 ? 'text' : 'numeric',
    },
  });

  const isValidChar = createDigitValidator(settings.base);
  input.addEventListener('input', () => {
    let filtered = '';
    for (const char of input.value) {
      if (isValidChar(char)) filtered += char;
    }
    if (input.value !== filtered) input.value = filtered;
  });

  const submit = createElement({
    tag: 'button',
    className: ['btn', 'btn--primary'],
    text: 'Guess',
    attrs: { type: 'submit' },
  });
  const error = createDiv({ className: ['guess-form__error'], text: '' });
  const form = createElement({
    tag: 'form',
    className: ['guess-form'],
    children: [input, submit, error],
  });

  return { form, input, error };
}

//--------------------------------------------------------------------------------
// Логика работы submit
function validateGuess(
  guess: string,
  settings: PlayingState['settings'],
  history: PlayingState['history'],
): string | null {
  if (!isValidGuess(guess, settings.length, settings.base)) {
    return `Need ${String(settings.length)} unique digits (base ${String(settings.base)})`;
  }
  if (history.some((entry) => entry.guess === guess)) {
    return 'You already tried this guess';
  }
  return null;
}

function attachSubmitHandler(
  form: HTMLFormElement,
  input: HTMLInputElement,
  error: HTMLElement,
  state: PlayingState,
  dispatch: (action: Action) => void,
): void {
  const { settings, history, secret } = state;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const guess = input.value.trim().toLowerCase();

    const validationError = validateGuess(guess, settings, history);
    if (validationError) {
      error.textContent = validationError;
      input.select();
      return;
    }

    error.textContent = '';
    const result = evaluateGuess(secret, guess);
    dispatch({ type: 'GUESS', guess, result });

    // Сначала GUESS (добавляет победную попытку), затем WIN (меняет статус).
    if (result.bulls === settings.length) {
      dispatch({ type: 'WIN', now: Date.now() });
    }
  });
}

//--------------------------------------------------------------------------------
// Кнопка сброса
function createResetButton(dispatch: (action: Action) => void): HTMLElement {
  const reset = createElement({
    tag: 'button',
    className: ['btn', 'btn--ghost'],
    text: 'Give up',
    attrs: { type: 'button' },
  });
  reset.addEventListener('click', () => {
    dispatch({ type: 'RESET' });
  });
  return reset;
}

//--------------------------------------------------------------------------------
// Рендеринг окна с игрой
export function renderPlaying(state: PlayingState, dispatch: (action: Action) => void): HTMLElement {
  const { form, input, error } = createGuessInput(state.settings);
  attachSubmitHandler(form, input, error, state, dispatch);

  return createDiv({
    className: ['playing'],
    children: [
      renderHeader(state.settings, state.history),
      renderHistory(state.history),
      form,
      createResetButton(dispatch),
    ],
  });
}
