type Tags = keyof HTMLElementTagNameMap;

/**
 * Свойства для создания DOM-элемента.
 *
 * Все поля опциональны и являются общими для всех типов
 * Порядок применения: `className` → `text` → `attrs` → `styles` → `children`.
 */
type ElementAttributes = {
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
   * - `true` → `setAttribute(key, '')` — «присутствие» атрибута (HTML-семантика
   *   для `disabled`, `checked`, `hidden` и т.п.);
   * - `false` → `removeAttribute(key)` — атрибут не устанавливается вовсе.
   *
   * Для ARIA атрибутов (`aria-pressed`, `aria-expanded`) передавать строки явно:
   * `{ 'aria-pressed': 'true' }`. `boolean` даст `aria-pressed=""`, что для ARIA неверно).
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
   * Дочерние узлы — DOM-элементы, текстовые узлы, фрагменты.
   * Вставляются через `append` после применения всех остальных свойств.
   *
   * Принимает `Node`, а не только `HTMLElement`, — можно передавать
   * `document.createTextNode(...)` или `DocumentFragment`.
   *
   * @example [input, button] — где оба созданы через createElement()
   */
  children?: readonly Node[];
};

/**
 * Свойства элемента для createElement: ElementAttributes + обязательный tag.
 * Tag - это тег создаваемого элемента.
 *
 * Влияет на тип возвращаемого значения: `createElement({ tag: 'input' })`
 * возвращает `HTMLInputElement`, а не общий `HTMLElement`.
 */
export type ElementProperties<T extends Tags> = ElementAttributes & { tag: T };

/**
 * Создаёт DOM-элемент с заданными свойствами.
 * Чистая относительно props: не мутирует их, не хранит состояния, при одинаковых props возвращает структурно одинаковый элемент.
 */
export function createElement(): HTMLDivElement {
  return document.createElement('div');
}

/**
 * Создаёт div через createElement — самый часто используемый контейнер.
 * Просто синтаксический сахар для удобства.
 */
export function createDiv(properties: ElementAttributes = {}): HTMLDivElement {
  console.log(properties);
  return document.createElement('div');
}
