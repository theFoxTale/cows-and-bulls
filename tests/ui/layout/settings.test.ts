import { describe, it, expect, vi } from 'vitest';
import { renderSettings } from '@layout';
import { type Action, createInitialState, type SettingsState } from '../../../src/state/game-state.ts';
import { getCollection, getElement } from '@dom';

describe('renderSettings', () => {
  it('показывает настройки по умолчанию', () => {
    const el = renderSettings(createInitialState(), vi.fn());

    const length = getElement(HTMLSelectElement, '#length', el); // ← было el.querySelector(...)!
    const base = getElement(HTMLSelectElement, '#base', el);

    expect(length.value).toBe('4');
    expect(base.value).toBe('10');
  });

  it('создаёт 5 опций длины (2–6)', () => {
    const el = renderSettings(createInitialState(), vi.fn());
    const options = getCollection(HTMLOptionElement, '#length option', el);
    expect(options).toHaveLength(5);
    expect(options.map((o) => o.value)).toEqual(['2', '3', '4', '5', '6']);
  });

  it('создаёт 4 опции базы (bin/oct/dec/hex)', () => {
    const el = renderSettings(createInitialState(), vi.fn());
    const options = getCollection(HTMLOptionElement, '#base option', el);
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.value)).toEqual(['2', '8', '10', '16']);
  });

  it('для bin (base=2) длины 3–6 disabled', () => {
    const state: SettingsState = {
      status: 'settings',
      settings: { length: 2, base: 2 },
    };
    const el = renderSettings(state, vi.fn());
    const options = getCollection(HTMLOptionElement, '#length option', el);
    const enabled = options.filter((o) => !o.disabled).map((o) => o.value);
    expect(enabled).toEqual(['2']);
  });

  it('для oct/dec/hex все длины 2–6 доступны', () => {
    for (const base of [8, 10, 16] as const) {
      const state: SettingsState = { status: 'settings', settings: { length: 4, base } };
      const el = renderSettings(state, vi.fn());
      const options = getCollection(HTMLOptionElement, '#length option', el);
      const enabled = options.filter((o) => !o.disabled);
      expect(enabled).toHaveLength(5);
    }
  });

  it('показывает количество возможных секретов', () => {
    const el = renderSettings(createInitialState(), vi.fn());
    // dec, length 4 → 10·9·8·7 = 5040
    expect(el.querySelector('.settings__info')?.textContent).toContain('5');
  });

  it('смена длины отправляет UPDATE_SETTINGS', () => {
    const dispatch = vi.fn();
    const el = renderSettings(createInitialState(), dispatch);
    const length = getElement(HTMLSelectElement, '#length', el);
    length.value = '6';
    length.dispatchEvent(new Event('change'));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SETTINGS',
      settings: { length: 6, base: 10 },
    });
  });

  it('смена базы на bin с длиной 4 авто-понижает длину до 2', () => {
    const dispatch = vi.fn();
    const el = renderSettings(createInitialState(), dispatch);
    const base = getElement(HTMLSelectElement, '#base', el);
    base.value = '2';
    base.dispatchEvent(new Event('change'));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SETTINGS',
      settings: { base: 2, length: 2 },
    });
  });

  it('submit отправляет START с сгенерированным секретом', () => {
    const dispatch = vi.fn<(action: Action) => void>();
    const el = renderSettings(createInitialState(), dispatch);
    const form = getElement(HTMLFormElement, 'form', el);
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(dispatch).toHaveBeenCalledOnce();

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('START');
    if (action.type !== 'START') return;

    expect(action.secret).toMatch(/^\d{4}$/);
    expect(action.now).toBeTypeOf('number');
  });
});
