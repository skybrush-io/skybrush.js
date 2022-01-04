import * as React from 'react';

import TransparentList, { TransparentListProps } from './TransparentList';

export type MiniListProps = TransparentListProps;

const MiniList = (props: MiniListProps) => (
  <TransparentList dense disablePadding {...props} />
);

export default MiniList;
