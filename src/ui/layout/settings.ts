import { BASE_CONFIGS, countPossibleSecrets, generateSecret } from '@core';
import { createElement, createDiv } from '@dom';
import type { Action, SettingsState } from '../../state/game-state';

const LENGTHS = [2, 3, 4, 5, 6] as const;
const MAX_LENGTH = 6;

type Settings = SettingsState['settings'];
type Dispatch = (action: Action) => void;

function applyLength(settings: Settings, dispatch: Dispatch, length: number): void {
  dispatch({ type: 'UPDATE_SETTINGS', settings: { ...settings, length } });
}

//--------------------------------------------------------------------------------
// Определение длины секрета
function createLengthSelect(settings: Settings, dispatch: Dispatch) {
  const maxLength = Math.min(MAX_LENGTH, settings.base);
  const select = createElement({
    tag: 'select',
    className: ['settings__select'],
    attrs: { name: 'length', id: 'length' },
    children: LENGTHS.map((length_) =>
      createElement({
        tag: 'option',
        text: String(length_),
        attrs: { value: String(length_), disabled: length_ > maxLength },
      }),
    ),
  });
  select.value = String(settings.length);
  select.addEventListener('change', () => {
    applyLength(settings, dispatch, Number(select.value));
  });
  return select;
}

//--------------------------------------------------------------------------------
// Выбор системы счисления с обрезанием длины при смене системы
//--------------------------------------------------------------------------------
function createBaseSelect(settings: Settings, dispatch: Dispatch) {
  const select = createElement({
    tag: 'select',
    className: ['settings__select'],
    attrs: { name: 'base', id: 'base' },
    children: BASE_CONFIGS.map((config) =>
      createElement({
        tag: 'option',
        text: `${config.label} (${String(config.value)})`,
        attrs: { value: String(config.value) },
      }),
    ),
  });
  select.value = String(settings.base);
  select.addEventListener('change', () => {
    const selected = BASE_CONFIGS.find((config) => config.value === Number(select.value));
    if (!selected) return;

    const base = selected.value;
    const max = Math.min(MAX_LENGTH, base);
    const length = Math.min(settings.length, max);

    dispatch({ type: 'UPDATE_SETTINGS', settings: { base, length } });
  });
  return select;
}

//--------------------------------------------------------------------------------
// Счётчик возможных секретов
//--------------------------------------------------------------------------------
function createSecretsInfo(settings: Settings) {
  const count = countPossibleSecrets(settings.length, settings.base);
  return createDiv({
    className: ['settings__info'],
    text: `Возможных комбинаций: ${count.toLocaleString('ru-RU')}`,
  });
}

function createSubmitButton() {
  return createElement({
    tag: 'button',
    className: ['btn', 'btn--primary'],
    text: 'Новая миссия',
    attrs: { type: 'submit' },
  });
}

function createLabel(text: string, forId: string) {
  return createElement({
    tag: 'label',
    className: ['settings__label'],
    attrs: { for: forId },
    text,
  });
}

//--------------------------------------------------------------------------------
// Форма настроек + обработчик submit
//--------------------------------------------------------------------------------
function createSettingsForm(state: SettingsState, dispatch: Dispatch) {
  const { settings } = state;
  const form = createElement({
    tag: 'form',
    className: ['settings__form'],
    children: [
      createLabel('Длина', 'length'),
      createLengthSelect(settings, dispatch),
      createLabel('Система счисления', 'base'),
      createBaseSelect(settings, dispatch),
      createSecretsInfo(settings),
      createSubmitButton(),
    ],
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const secret = generateSecret(settings.length, settings.base);
    dispatch({ type: 'START', secret, now: Date.now() });
  });
  return form;
}

//--------------------------------------------------------------------------------
// Экран настроек
//--------------------------------------------------------------------------------
export function renderSettings(state: SettingsState, dispatch: Dispatch): HTMLElement {
  return createDiv({
    className: ['settings'],
    children: [
      createElement({ tag: 'h1', text: 'Bulls and Cows — Новая МОО' }),
      createElement({
        tag: 'p',
        className: ['settings__subtitle'],
        text: 'Угадайте секретное число из уникальных цифр',
      }),
      createSettingsForm(state, dispatch),
    ],
  });
}
