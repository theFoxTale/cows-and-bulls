export type Tags = keyof HTMLElementTagNameMap;

/**
 * Свойства для создания DOM-элемента.
 *
 * Все поля опциональны и являются общими для всех типов
 * Порядок применения: `className` → `text` → `attrs` → `styles` → `children`.
 */
export type ElementAttributes = {
  /**
   * Список CSS-классов.
   *
   * Добавляются через `classList.add`, поэтому
   * пустые строки и дубликаты безопасны (дубликаты схлопываются браузером).
   *
   * @example ['container', 'container--dark']
   */
  className?: readonly string[];

  /**
   * Текстовое содержимое элемента.
   *
   * Устанавливается через `textContent`,
   * поэтому HTML-теги в строке не интерпретируются — это безопасно от XSS,
   * но не позволяет вставлять разметку.
   */
  text?: string;

  /**
   * HTML-атрибуты элемента.
   *
   * Для строковых значений вызывается `setAttribute(key, value)`.
   *
   * Для `boolean`:
   * - `true` — атрибут присутствует с пустым значением («presence»-семантика
   *   для `disabled`, `checked`, `hidden` и т.п.);
   * - `false` — атрибут отсутствует.
   *
   * Для ARIA атрибутов (`aria-pressed`, `aria-expanded`) передавать строки явно:
   * `{ 'aria-pressed': 'true' }`. `boolean` даст `aria-pressed=""`, что для ARIA неверно.
   *
   * @example { type: 'button', disabled: true, 'aria-label': 'Submit' }
   */
  attrs?: Readonly<Record<string, string | boolean>>;

  /**
   * Inline-стили для элемента.
   *
   * Применяются через `style.setProperty`, поэтому
   * поддерживаются и camelCase (`backgroundColor`), и kebab-case
   * (`background-color`), и CSS-переменные (`'--color': 'red'`).
   *
   * Значения — строки с единицами измерения (`'12px'`, `'1.5rem'`),
   * числа без единиц **не приводятся** к пикселям автоматически.
   *
   * @example { 'background-color': 'var(--accent)', 'border-radius': '4px' }
   */
  styles?: Readonly<Record<string, string>>;

  /**
   * Дочерние узлы: DOM-элементы, текстовые узлы, фрагменты или строки.
   * Вставляются через `append` после применения остальных свойств.
   *
   * Строки автоматически превращаются в текстовые узлы (поведение `append`),
   * поэтому `children: ['hello', input]` эквивалентно `[document.createTextNode('hello'), input]`, но короче.
   *
   * HTML-теги в строках не интерпретируются.
   * Это безопасно от XSS, но не позволяет вставлять разметку.
   *
   * @example ['Score: ', scoreSpan]
   * @example [input, button] — оба созданы через createElement()
   */
  children?: readonly (Node | string)[];
};

/**
 * Свойства элемента для createElement: ElementAttributes + обязательный tag (тег создаваемого элемента).
 *
 * Влияет на тип возвращаемого значения: `createElement({ tag: 'input' })`
 * возвращает `HTMLInputElement`, а не общий `HTMLElement`.
 */
export type ElementProperties<T extends Tags> = ElementAttributes & { tag: T };

/**
 * Создаёт DOM-элемент с заданными свойствами.
 *
 * Чистая относительно properties: не мутирует их, не хранит состояния,
 * при одинаковых properties возвращает структурно одинаковый элемент.
 *
 * @template T - тег создаваемого элемента (определяет тип результата).
 * @param properties - свойства элемента; `tag` обязателен.
 * @returns DOM-элемент типа `HTMLElementTagNameMap[T]`.
 */
export function createElement<T extends Tags>(properties: ElementProperties<T>): HTMLElementTagNameMap[T] {
  const el = document.createElement(properties.tag);

  if (properties.className?.length) {
    el.classList.add(...properties.className);
  }

  if (properties.text !== undefined) {
    el.textContent = properties.text;
  }

  if (properties.attrs) {
    for (const [key, value] of Object.entries(properties.attrs)) {
      if (typeof value === 'boolean') {
        el.toggleAttribute(key, value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  if (properties.styles) {
    for (const [key, value] of Object.entries(properties.styles)) {
      el.style.setProperty(key, value);
    }
  }

  if (properties.children?.length) {
    el.append(...properties.children);
  }

  return el;
}

/**
 * Создаёт div через createElement — самый часто используемый контейнер.
 * Просто синтаксический сахар для удобства.
 */
export function createDiv(properties: ElementAttributes = {}): HTMLDivElement {
  return createElement({ ...properties, tag: 'div' });
}
