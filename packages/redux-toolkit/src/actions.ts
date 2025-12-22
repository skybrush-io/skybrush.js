import type {
  Action,
  ActionCreator,
  Dispatch,
  UnknownAction,
} from '@reduxjs/toolkit';
import { identity, xor } from 'lodash-es';
import { eventHasPlatformModifierKey, eventHasShiftKey } from './events.js';
import type {
  SelectionHandlerReduxFunctions,
  SelectionHandlerThunk,
} from './types.js';

/**
 * Resolves an array containing a mix of action types and action creators to
 * action types only.
 */
export function resolveActionTypes<A>(
  actionTypes: Array<ActionCreator<A> | A>
): A[] {
  return actionTypes
    .filter(Boolean)
    .map((action) =>
      typeof action === 'function' &&
      Object.prototype.hasOwnProperty.call(action, 'type')
        ? ((action as any).type as A)
        : (action as any as A)
    );
}

/**
 * Creates an "action scrubber" function that replaces the payload of an action
 * with a placeholder if the type of the action matches one of the input
 * action types or action creators.
 */
export function createActionScrubber<A extends string>(
  actionTypes: A | ActionCreator<A> | Array<A | ActionCreator<A>>
): (action: Action<A>) => Action<A> {
  if (!Array.isArray(actionTypes)) {
    actionTypes = [actionTypes];
  }

  const resolvedActionTypes = resolveActionTypes(actionTypes);
  return resolvedActionTypes.length > 0
    ? (action: Action<A>) => {
        if (resolvedActionTypes.includes(action.type) && 'payload' in action) {
          return {
            ...action,
            payload: '<<JSON_DATA>>',
          };
        }

        return action;
      }
    : identity;
}

/**
 * Creates a Redux thunk action that encapsulates the common logic for
 * selection handling in lists. The thunk has to be associated to the "click"
 * event handler of each item in the list, and it must be called with the
 * click event as the first argument and a unique item ID as the second argument.
 *
 * The thunk action will catch clicks on the items and dispatch actions to set
 * the selection accordingly when the items are clicked, or toggling the
 * selection when the items are clicked with the Ctrl (Cmd) key being pressed.
 * It also handles optional item activation with double-clicks.
 *
 * @returns  A Redux thunk action for selection handling, or `null` if neither
 *           `setSelection` nor `activateItem` functions are provided.
 */
export function createSelectionHandlerThunk<
  T = string,
  S = unknown,
  A extends Action = UnknownAction,
  D extends Dispatch<UnknownAction> = Dispatch<A>,
>({
  activateItem,
  getSelection,
  setSelection,
  getListItems,
}: SelectionHandlerReduxFunctions<T, S, A>): SelectionHandlerThunk<
  T,
  S,
  A,
  D
> | null {
  if (!setSelection && !activateItem) {
    return null;
  }

  return (id: T, event: Event | React.SyntheticEvent) =>
    // eslint-disable-next-line complexity
    (dispatch: D, getState: () => S) => {
      const state = getState();
      const selection = getSelection ? getSelection(state) : [];
      const effectiveEvent: Event =
        'nativeEvent' in event ? (event.nativeEvent ?? event) : event;
      let action: A | undefined | void = undefined;

      if (eventHasPlatformModifierKey(effectiveEvent) && setSelection) {
        // Toggling the item
        action = setSelection(xor(selection, [id]));
      } else if (
        eventHasShiftKey(effectiveEvent) &&
        getListItems &&
        setSelection
      ) {
        const listItems = getListItems(state);
        if (selection.length > 0) {
          // NOTE: Bang justified by `selection.length === 1`
          const singleSelectedId = selection.at(-1)!;
          const singleSelectedIndex = listItems.indexOf(singleSelectedId);
          const newSelectedIndex = listItems.indexOf(id);
          const newSelection = listItems.slice(
            Math.min(singleSelectedIndex, newSelectedIndex),
            Math.max(singleSelectedIndex, newSelectedIndex) + 1
          );

          // Make sure that singleSelectedId remains at the end of the selection
          // array in case the user keeps on clicking on other items with the
          // Shift key being held down
          const index = newSelection.indexOf(singleSelectedId);
          if (index >= 0 && index !== newSelection.length - 1) {
            newSelection.splice(index, 1);
            newSelection.push(singleSelectedId);
          }

          action = setSelection(newSelection);
        }
      } else {
        const alreadySelected =
          selection && selection.length === 1 && selection[0] === id;

        if (activateItem && alreadySelected) {
          // Item was already selected, let's activate it if it is a double-click,
          // otherwise do nothing. We use the "detail" property of the
          // event to decide; this works if we are attached to the onClick handler.
          const isDoubleClick =
            'detail' in effectiveEvent &&
            typeof effectiveEvent.detail === 'number'
              ? effectiveEvent.detail > 1
              : false;
          action = isDoubleClick ? activateItem(id) : undefined;
          if (isDoubleClick) {
            // Double-clicking may have triggered a text selection on the UI. We
            // are too late to prevent it because it happens on mouseDown, so let's
            // just clear it.
            window.getSelection()?.removeAllRanges();
          }
        } else if (
          setSelection &&
          !alreadySelected // Select the item if it was not selected already
        ) {
          action = setSelection([id]);
        }
      }

      if (action) {
        dispatch(action as any);
      }
    };
}
