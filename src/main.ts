import { type Action, createInitialState, type GameState, reduce } from './state/game-state';
import { renderPlaying, renderSettings, renderWon } from '@layout';
import { createDiv } from '@dom';

import './styles/index.css';
import { addRecord, createRecord, loadRecords, saveRecords } from './storage/records.ts';

const root = createDiv({ className: ['app'] });
document.body.append(root);

function createApp(initialState: GameState): void {
  let state = initialState;

  function render(): void {
    switch (state.status) {
      case 'settings': {
        root.replaceChildren(renderSettings(state, dispatch));
        break;
      }
      case 'playing': {
        root.replaceChildren(renderPlaying(state, dispatch));
        root.querySelector<HTMLInputElement>('.guess-form__input')?.focus();
        break;
      }
      case 'won': {
        root.replaceChildren(renderWon(state, loadRecords(), dispatch));
        break;
      }
    }
  }

  function dispatch(action: Action): void {
    const previous = state;
    state = reduce(state, action);
    if (state === previous) return;

    if (state.status === 'won' && previous.status !== 'won') {
      const updated = addRecord(loadRecords(), createRecord(state));
      saveRecords(updated);
    }

    render();
  }

  render();
}

createApp(createInitialState());
