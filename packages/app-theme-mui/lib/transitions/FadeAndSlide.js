/**
 * @file Fade-and-slide transition.
 *
 * This is a copy of the Fade transition from Material-UI 4.9.3, with a few
 * style tweaks.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import { elementAcceptingRef } from '@mui/utils';
import { duration } from '@mui/material/styles/createTransitions';
import useTheme from '@mui/material/styles/useTheme';
import {
  reflow,
  getTransitionProps,
} from '@mui/material/transitions/utils';
import useForkRef from '@mui/material/utils/useForkRef';

const styles = {
  up: {
    entering: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    entered: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    exiting: {
      opacity: 0,
      transform: 'translateY(-16px)',
    },
    exited: {
      opacity: 0,
      transform: 'translateY(16px)',
    },
  },

  down: {
    entering: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    entered: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    exiting: {
      opacity: 0,
      transform: 'translateY(16px)',
    },
    exited: {
      opacity: 0,
      transform: 'translateY(-16px)',
    },
  },

  left: {
    entering: {
      opacity: 1,
      transform: 'translateX(0)',
    },
    entered: {
      opacity: 1,
      transform: 'translateX(0)',
    },
    exiting: {
      opacity: 0,
      transform: 'translateX(-16px)',
    },
    exited: {
      opacity: 0,
      transform: 'translateX(16px)',
    },
  },

  right: {
    entering: {
      opacity: 1,
      transform: 'translateX(0)',
    },
    entered: {
      opacity: 1,
      transform: 'translateX(0)',
    },
    exiting: {
      opacity: 0,
      transform: 'translateX(16px)',
    },
    exited: {
      opacity: 0,
      transform: 'translateX(-16px)',
    },
  },
};

const defaultTimeout = {
  enter: duration.enteringScreen,
  exit: duration.leavingScreen,
};

const FadeAndSlide = React.forwardRef((props, ref) => {
  const {
    addEndListener,
    appear = true,
    children,
    direction,
    easing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = defaultTimeout,
    // eslint-disable-next-line react/prop-types
    TransitionComponent = Transition,
    ...other
  } = props;
  const theme = useTheme();

  const enableStrictModeCompat = true;
  const nodeRef = React.useRef(null);
  const foreigneRef = useForkRef(children.ref, ref);
  const handleRef = useForkRef(nodeRef, foreignRef);
  const transitionStyle = transitionStyles[direction];

  const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
    if (callback) {
      const node = nodeRef.current;

      // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
      if (maybeIsAppearing === undefined) {
        callback(node);
      } else {
        callback(node, maybeIsAppearing);
      }
    }
  };

  const handleEntering = normalizedTransitionCallback(onEntering);

  const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
    reflow(node); // So the animation always start from the start.

    const transitionProps = getTransitionProps(
      { style, timeout, easing },
      {
        mode: 'enter',
      }
    );

    node.style.webkitTransition = theme.transitions.create(
      ['opacity', 'transform'],
      transitionProps
    );
    node.style.transition = theme.transitions.create(
      ['opacity', 'transform'],
      transitionProps
    );

    if (onEnter) {
      onEnter(node, isAppearing);
    }
  });

  const handleEntered = normalizedTransitionCallback(onEntered);

  const handleExiting = normalizedTransitionCallback(onExiting);

  const handleExit = (node) => {
    const transitionProps = getTransitionProps(
      { style, timeout, easing },
      {
        mode: 'exit',
      }
    );

    node.style.webkitTransition = theme.transitions.create(
      ['opacity', 'transform'],
      transitionProps
    );
    node.style.transition = theme.transitions.create(
      ['opacity', 'transform'],
      transitionProps
    );

    if (onExit) {
      onExit(node);
    }
  };

  const handleExited = normalizedTransitionCallback(onExited);

  const handleAddEndListener = (next) => {
    if (addEndListener) {
      // Old call signature before `react-transition-group` implemented `nodeRef`
      addEndListener(nodeRef.current, next);
    }
  };

  return React.createElement(
    TransitionComponent,
    {
      in: inProp,
      appear,
      timeout,
      nodeRef: enableStrictModeCompat ? nodeRef : undefined,
      onEnter: handleEnter,
      onEntered: handleEntered,
      onEntering: handleEntering,
      onExit: handleExit,
      onExited: handleExited,
      onExiting: handleExiting,
      addEndListener: handleAddEndListener,
      ...other,
    },
    (state, childProps) => {
      return React.cloneElement(children, {
        style: {
          opacity: 0,
          visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
          ...transitionStyle[state],
          ...style,
          ...children.props.style,
        },
        ref: handleRef,
        ...childProps,
      });
    }
  );
});

FadeAndSlide.propTypes = {
  /**
   * @ignore
   */
  addEndListener: PropTypes.func,
  /**
   * @ignore
   */
  appear: PropTypes.bool,
  /**
   * A single child content element.
   */
  children: PropTypes.element,
  /**
   * The direction of the transition.
   */
  direction: PropTypes.oneOf(Object.keys(transitionStyles)),
  /**
   * @ignore
   */
  easing: PropTypes.oneOfType([
    PropTypes.shape({
      enter: PropTypes.string,
      exit: PropTypes.string,
    }),
    PropTypes.string,
  ]),
  /**
   * If `true`, the component will transition in.
   */
  in: PropTypes.bool,
  /**
   * @ignore
   */
  onEnter: PropTypes.func,
  /**
   * @ignore
   */
  onEntered: PropTypes.func,
  /**
   * @ignore
   */
  onEntering: PropTypes.func,
  /**
   * @ignore
   */
  onExit: PropTypes.func,
  /**
   * @ignore
   */
  onExited: PropTypes.func,
  /**
   * @ignore
   */
  onExiting: PropTypes.func,
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   */
  timeout: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({ appear: PropTypes.number, enter: PropTypes.number, exit: PropTypes.number }),
  ]),
};

FadeAndSlide.defaultProps = {
  direction: 'up',
};

export default FadeAndSlide;
