import type { Action, PlayingState } from './state/game-state';
import { renderPlaying } from '@layout';
import { createDiv } from '@dom';

import './styles/index.css';

const root = createDiv({ className: ['app'] });
document.body.append(root);

const state: PlayingState = {
  status: 'playing',
  settings: { length: 4, base: 10 },
  secret: '7638',
  history: [],
  startedAt: Date.now(),
};

function dispatch(_action: Action): void {
  render();
}

function render(): void {
  root.replaceChildren(renderPlaying(state, dispatch));
  // input пересоздан — вернуть фокус, иначе игроку придётся кликать
  root.querySelector<HTMLInputElement>('.guess-form__input')?.focus();
}

render();
