import TransparentList, {
  type TransparentListProps,
} from './TransparentList.js';

export type MiniListProps = TransparentListProps;

const MiniList = (props: MiniListProps) => (
  <TransparentList dense disablePadding {...props} />
);

export default MiniList;
