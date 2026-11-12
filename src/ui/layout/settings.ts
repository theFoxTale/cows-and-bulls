import type { Action, SettingsState } from '../../state/game-state';
import { createDiv } from '@dom';

export function renderSettings(_state: SettingsState, _dispatch: (action: Action) => void): HTMLElement {
  return createDiv({ text: 'Settings' });
}
