import { describe, it, expect } from 'vitest';
import { createElement, createDiv } from '@dom';

describe('createElement + createDiv', () => {
  it('создаёт div через createDiv', () => {
    expect(createDiv().tagName).toBe('DIV');
  });

  it('createDiv эквивалентен createElement с tag div', () => {
    const a = createDiv({ className: ['x'] });
    const b = createElement({ tag: 'div', className: ['x'] });

    expect(a.tagName).toBe(b.tagName);
    expect(a.className).toBe(b.className);
    expect(a.outerHTML).toBe(b.outerHTML);
  });

  it('применяет className, text, attrs, styles', () => {
    const el = createElement({
      tag: 'button',
      className: ['primary', 'large'],
      text: 'Click',
      attrs: { type: 'button', disabled: true },
      styles: { 'background-color': 'red' },
    });

    expect(el).toBeInstanceOf(HTMLButtonElement);
    expect(el.classList.contains('primary')).toBe(true);
    expect(el.textContent).toBe('Click');
    expect(el.getAttribute('type')).toBe('button');
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.style.backgroundColor).toBe('red');
  });

  it('attrs: false не устанавливает атрибут', () => {
    const el = createDiv({ attrs: { disabled: false } });
    expect(el.hasAttribute('disabled')).toBe(false);
  });

  it('createElement с tag input возвращает HTMLInputElement', () => {
    const el = createElement({ tag: 'input', attrs: { type: 'text' } });
    expect(el).toBeInstanceOf(HTMLInputElement);
    expect(el.type).toBe('text');
  });

  it('text: пустая строка даёт пустое содержимое', () => {
    const replaced = createDiv({ text: '' });
    expect(replaced.textContent).toBe('');
  });

  it('styles: поддерживает CSS-переменные', () => {
    const el = createDiv({ styles: { '--accent': '#ff0000' } });
    expect(el.style.getPropertyValue('--accent')).toBe('#ff0000');
  });

  it('вкладывает children в правильном порядке', () => {
    const a = createDiv({ text: 'a' });
    const b = createDiv({ text: 'b' });
    const parent = createDiv({ children: [a, b] });
    expect([...parent.children]).toEqual([a, b]);
  });

  it('поддерживает текстовые узлы в children', () => {
    const text = document.createTextNode('hello');
    const el = createDiv({ children: [text] });
    expect(el.textContent).toBe('hello');
  });

  it('attrs: ARIA передаётся строкой (boolean даёт пустую строку)', () => {
    const el = createDiv({ attrs: { 'aria-pressed': 'true' } });
    expect(el.getAttribute('aria-pressed')).toBe('true');

    const htmlBool = createDiv({ attrs: { disabled: true } });
    expect(htmlBool.getAttribute('disabled')).toBe('');
  });

  it('не мутирует props', () => {
    const properties = { className: ['a'], attrs: { id: 'x' } };
    const snapshot = JSON.stringify(properties);
    createDiv(properties);
    expect(JSON.stringify(properties)).toBe(snapshot);
  });
});
