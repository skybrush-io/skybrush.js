import isNil from 'lodash-es/isNil';
import { useMemo } from 'react';

const isDeltaValid = (delta) =>
  typeof delta === 'number' && Number.isFinite(delta);

const useControlledCaret = (ids, selectedId, onSetSelectedId) => {
  const caretManager = useMemo(() => {
    const getIndex = () => (isNil(selectedId) ? -1 : ids.indexOf(selectedId));
    const set = (id) => {
      if (id !== selectedId) {
        onSetSelectedId(id);
      }
    };

    return {
      adjust: (delta) => {
        delta = typeof delta === 'function' ? delta(currentIndex) : delta;

        const currentIndex = getIndex();
        const newIndex = isDeltaValid(delta)
          ? currentIndex < 0
            ? 0
            : currentIndex + delta
          : currentIndex;
        if (newIndex >= 0 && newIndex < ids.length) {
          const newSelectedId = ids[newIndex];
          set(newSelectedId);
        }
      },
      clear: () => {
        set(null);
      },
      getIndex,
      set,
    };
  }, [ids, selectedId, onSetSelectedId]);

  return caretManager;
};

export default useControlledCaret;
