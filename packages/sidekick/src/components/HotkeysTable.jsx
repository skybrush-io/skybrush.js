import arrify from 'arrify';
import isNil from 'lodash-es/isNil';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/core/styles';

import { getSelectedUAVId } from '~/features/ui/selectors';
import { keyMap } from '~/hotkeys';

const hotkeys = [
  {
    id: 'flash',
    keys: keyMap.FLASH_LIGHTS.toUpperCase(),
    labels: ['Flash LED', 'Flash LED for all'],
  },
  {
    id: 'show',
    keys: keyMap.TRIGGER_SHOW_MODE.toUpperCase(),
    labels: ['Show mode', 'Show mode for all'],
  },
  {
    id: 'positionHold',
    keys: keyMap.TRIGGER_POSITION_HOLD.toUpperCase(),
    labels: ['Position hold', 'Position hold for all'],
  },
  {
    id: 'rth',
    keys: keyMap.TRIGGER_RETURN_TO_HOME.toUpperCase(),
    labels: ['RTH selected', 'RTH all'],
  },
  {
    id: 'land',
    keys: keyMap.TRIGGER_LANDING.toUpperCase(),
    labels: ['Land selected', 'Land all'],
  },
  {
    id: 'disarm',
    keys: keyMap.TRIGGER_DISARM.toUpperCase()
      .replace('SHIFT', '\u21E7')
      .split('+'),
    labels: ['Disarm selected', 'Disarm all'],
  },
];

const CompactTableRow = withStyles(
  (theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
      '& td:first-child': {
        width: 80,
      },
    },
  }),
  {
    name: 'CompactTableRow',
  }
)(TableRow);

const CompactTableCell = withStyles(
  {
    root: {
      padding: 6,
    },
  },
  {
    name: 'CompactTableCell',
  }
)(TableCell);

const HotkeyRow = ({ isBroadcast, keys, labels }) => (
  <CompactTableRow>
    <CompactTableCell>
      {arrify(keys).map((key) => (
        <kbd key={key}>{key}</kbd>
      ))}
    </CompactTableCell>
    <CompactTableCell>
      {Array.isArray(labels) ? labels[isBroadcast ? 1 : 0] : labels}
    </CompactTableCell>
  </CompactTableRow>
);

HotkeyRow.propTypes = {
  isBroadcast: PropTypes.bool,
  keys: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  labels: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

const HotkeysTable = ({ isBroadcast }) => (
  <Table size='small'>
    <TableBody>
      {hotkeys.map(({ id, ...rest }) => (
        <HotkeyRow key={id} {...rest} isBroadcast={isBroadcast} />
      ))}
    </TableBody>
  </Table>
);

HotkeysTable.propTypes = {
  isBroadcast: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (state) => ({
    isBroadcast: isNil(getSelectedUAVId(state)),
  }),
  // mapDispatchToProps
  () => ({})
)(HotkeysTable);
