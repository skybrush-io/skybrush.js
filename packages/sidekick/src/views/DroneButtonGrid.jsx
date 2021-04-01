import range from 'lodash-es/range';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { HotKeys } from 'react-hotkeys';
import { useMeasure } from 'react-use';

import Box from '@material-ui/core/Box';

import DroneButton from '~/components/DroneButton';
import useCaretIndex from '~/hooks/useCaretIndex';
import useScrollChildIntoView from '~/hooks/useScrollChildIntoView';

const BOX_SIZE = 56;

const IDS = range(1, 251);

const DroneButtonGrid = React.forwardRef(({ columnCount, ids }, ref) => {
  const idCount = ids ? ids.length : 0;
  const [caretIndex, caretManager] = useCaretIndex(idCount);

  const items = [];
  let rowIndex = 0;
  let colIndex = 0;

  const selectedId =
    caretIndex >= 0 && caretIndex < idCount ? ids[caretIndex] : undefined;

  for (const id of ids) {
    const style = {
      left: colIndex * BOX_SIZE,
      top: rowIndex * BOX_SIZE,
      height: BOX_SIZE,
      width: BOX_SIZE,
      padding: 8,
      position: 'absolute',
    };

    items.push(
      <DroneButton
        key={id}
        id={id}
        selected={id === selectedId}
        style={style}
        onClick={() => caretManager.set(ids.indexOf(id))}
      />
    );

    colIndex++;

    if (colIndex >= columnCount) {
      colIndex = 0;
      rowIndex++;
    }
  }

  const handlers = useMemo(
    () => ({
      CLEAR_SELECTION: caretManager.clear,
      MOVE_CARET_LEFT: (event) => {
        event.preventDefault();
        caretManager.adjust(-1);
      },
      MOVE_CARET_RIGHT: (event) => {
        event.preventDefault();
        caretManager.adjust(1);
      },
      MOVE_CARET_UP: (event) => {
        event.preventDefault();
        caretManager.adjust(-columnCount);
      },
      MOVE_CARET_DOWN: (event) => {
        event.preventDefault();
        caretManager.adjust(columnCount);
      },
      MOVE_HOME: (event) => {
        event.preventDefault();
        if (columnCount > 0) {
          caretManager.adjust((index) => -(index % columnCount));
        }
      },
      MOVE_END: (event) => {
        event.preventDefault();
        if (columnCount > 0) {
          caretManager.adjust(
            (index) => columnCount - (index % columnCount) - 1
          );
        }
      },
    }),
    [caretManager, columnCount]
  );

  const itemsRef = useScrollChildIntoView(caretIndex);
  return (
    <Box ref={ref} position='relative' height='100%' overflow='auto'>
      <HotKeys allowChanges handlers={handlers} innerRef={itemsRef}>
        {items}
      </HotKeys>
    </Box>
  );
});

DroneButtonGrid.propTypes = {
  columnCount: PropTypes.number,
  ids: PropTypes.arrayOf(PropTypes.number),
};

const ResponsiveDroneButtonGrid = () => {
  const [ref, { width }] = useMeasure();
  const columnCount = Math.max(0, Math.floor(width / BOX_SIZE));
  return <DroneButtonGrid ref={ref} columnCount={columnCount} ids={IDS} />;
};

export default ResponsiveDroneButtonGrid;
