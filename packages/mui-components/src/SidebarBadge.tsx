import * as React from 'react';
import Badge, { type BadgeProps } from 'react-badger';

const badgeProps: BadgeProps = {
  offset: [8, 8],
};

/**
 * Special variant of badges shown on the sidebar.
 */
const SidebarBadge = (props: BadgeProps) => (
  <Badge {...badgeProps} {...props} />
);

export default SidebarBadge;
