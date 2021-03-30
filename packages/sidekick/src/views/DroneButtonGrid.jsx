import range from 'lodash-es/range';
import PropTypes from 'prop-types';
import React from 'react';
import { useMeasure } from 'react-use';

import Box from '@material-ui/core/Box';
import SemanticAvatar from '@skybrush/mui-components/src/SemanticAvatar';

const BOX_SIZE = 56;

const IDS = range(1, 251);

const DroneButton = ({ id, style }) => (
  <div style={style}>
    <SemanticAvatar>{id}</SemanticAvatar>
  </div>
);

DroneButton.propTypes = {
  id: PropTypes.number,
};

const DroneButtonGrid = React.forwardRef(({ columnCount, ids }, ref) => {
  const items = [];
  let rowIndex = 0;
  let colIndex = 0;

  for (const id of ids) {
    const style = {
      left: colIndex * BOX_SIZE,
      top: rowIndex * BOX_SIZE,
      height: BOX_SIZE,
      width: BOX_SIZE,
      padding: 8,
      position: 'absolute',
    };

    items.push(<DroneButton key={id} id={id} style={style} />);
    colIndex++;

    if (colIndex >= columnCount) {
      colIndex = 0;
      rowIndex++;
    }
  }

  return (
    <Box ref={ref} position='relative' height='100%' overflow='auto'>
      {items}
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
