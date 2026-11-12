import type { Action, WonState } from '../../state/game-state';
import { createDiv } from '@dom';

export function renderWon(_state: WonState, _dispatch: (action: Action) => void): HTMLElement {
  return createDiv({ text: 'Won' });
}
