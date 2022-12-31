import * as React from 'react';

import TransparentList, { type TransparentListProps } from './TransparentList';

export type MiniListProps = TransparentListProps;

const MiniList = (props: MiniListProps) => (
  <TransparentList dense disablePadding {...props} />
);

export default MiniList;
