import PropTypes from 'prop-types';

import { css, styled } from '@mui/material/styles';
import { Colors, Status } from '@skybrush/app-theme-mui';

import { dimFlash } from './keyframes';

const cssByColor = Object.fromEntries(
  ['info', 'warning', 'success', 'error'].map((color) => [
    color,
    css({ color: Colors[color] }),
  ])
);

const boldCss = css({ fontWeight: 'bold' });
const flashCss = css({
  animation: `${dimFlash} 0.5s infinite`,
  animationDirection: 'alternate',
});

const styles = {
  info: cssByColor.info,
  waiting: cssByColor.info,
  next: cssByColor.info,
  success: cssByColor.success,
  skipped: cssByColor.warning,
  warning: css([cssByColor.warning, boldCss]),
  rth: css([cssByColor.warning, boldCss, flashCss]),
  error: css([cssByColor.error, boldCss]),
  critical: css([cssByColor.error, boldCss, flashCss]),
};

const StatusText = styled('span', {
  shouldForwardProp: (name) => name !== 'status',
})(({ status }) => styles[status]);

StatusText.propTypes = {
  className: PropTypes.string,
  status: PropTypes.oneOf(Object.values(Status)),
};

export default StatusText;
