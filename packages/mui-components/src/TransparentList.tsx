import List, { ListProps } from '@mui/material/List';
import { styled } from '@mui/material/styles';

export type TransparentListProps = ListProps;

/**
 * Styled list component where the background color is set to transparent so
 * the parent component could decide what the background color should be.
 */
export default styled(List)({
  background: 'unset',
});
