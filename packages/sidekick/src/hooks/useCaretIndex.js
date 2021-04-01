import { useMemo, useReducer } from 'react';

/**
 * Creates a reducer function that manages a caret index in a collection
 * containing a given number of items.
 */
const createCaretIndexReducer = ({ itemCount }) => (state, action) => {
  const isIndexValid = (index) =>
    typeof index === 'number' &&
    Number.isFinite(index) &&
    index >= 0 &&
    index < itemCount;
  const isDeltaValid = (delta) =>
    typeof delta === 'number' && Number.isFinite(delta);

  const { type, payload } = action;
  let delta;
  let newIndex;

  switch (type) {
    case 'clear':
      return -1;

    case 'set':
      return isIndexValid(payload) || payload === -1 ? payload : state;

    case 'adjust':
      delta = typeof payload === 'function' ? payload(state) : payload;
      newIndex = isDeltaValid(delta) ? (state < 0 ? 0 : state + delta) : state;
      return isIndexValid(newIndex) ? newIndex : state;

    default:
      return state;
  }
};

/**
 * Hook that takes an item count and returns a state variable containing the
 * caret index and a set of callbacks that can be used to manage the caret
 * index.
 *
 * The callbacks object contains an 'adjust', a 'clear' and a 'set' function.
 */
const useCaretIndex = (itemCount) => {
  const caretIndexReducer = useMemo(
    () => createCaretIndexReducer({ itemCount }),
    [itemCount]
  );
  const [caretIndex, dispatch] = useReducer(caretIndexReducer, -1);
  const callbacks = useMemo(
    () => ({
      adjust: (delta) => dispatch({ type: 'adjust', payload: delta }),
      clear: () => dispatch({ type: 'clear' }),
      set: (index) => dispatch({ type: 'set', payload: index }),
    }),
    []
  );
  return [caretIndex, callbacks];
};

export default useCaretIndex;
