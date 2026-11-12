//
// ==================== Функции поиска элементов ====================
//

export type Queryable = Document | DocumentFragment | HTMLElement;

/**
 * Type guard для проверки типа элемента
 */
function isElementOfType<T extends Element>(element: Element, type: new () => T): element is T {
  return element instanceof type;
}

/**
 * Безопасный querySelector с проверкой типа элемента
 * @throws {Error} Если элемент не найден или имеет неправильный тип
 */
export function getElement<T extends Element>(type: new () => T, selector: string, parent: Queryable = document): T {
  const element = parent.querySelector(selector);

  if (!element) {
    throw new Error(`Element not found: "${selector}"`);
  }

  if (!isElementOfType(element, type)) {
    throw new Error(`Element "${selector}" is not ${type.name}. Found: ${element.constructor.name}`);
  }

  return element;
}

/**
 * Находит все элементы, соответствующие селектору, с проверкой типа
 * @throws {Error} Если хотя бы один элемент имеет неправильный тип
 */
export function getCollection<T extends Element>(
  type: new () => T,
  selector: string,
  parent: Queryable = document,
): T[] {
  const elements = parent.querySelectorAll(selector);
  const result: T[] = [];

  if (elements.length === 0) {
    return result;
  }

  // Проверяем тип каждого элемента
  elements.forEach((element, index) => {
    if (!isElementOfType(element, type)) {
      throw new Error(
        `Element at index ${String(index)} with selector "${selector}" is not ${type.name}. ` +
          `Found: ${element.constructor.name}`,
      );
    }
    result.push(element);
  });

  return result;
}
