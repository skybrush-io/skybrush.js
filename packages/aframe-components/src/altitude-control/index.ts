/**
 * Helper A-Frame component that allows the user to control the altitude
 * (position on the Y axis) of an object with the + and - keys on the keyboard.
 *
 * Based on the code of the `wasd-controls` component.
 */

import { isEmpty } from 'lodash-es';

import AFrame from '../_aframe.js';
import { KEYCODE_TO_CODE } from '../constants.js';
import {
  shouldCaptureKeyEvent,
  type KeyboardEventAcceptanceCondition,
} from '../utils.js';

const CLAMP_VELOCITY = 0.001;
const MAX_DELTA = 0.2;
const KEYS = new Set(['KeyE', 'KeyC', 'ShiftLeft', 'ShiftRight']);

const { THREE } = AFrame;

export type AltitudeControlProps = {
  acceleration: number; /* [m/s] */
  acceptsKeyboardEvent: KeyboardEventAcceptanceCondition;
  embedded: boolean;
  enabled: boolean;
  max: number;
  min: number;
};

type AltitudeControlComponent = AFrame.Component<AltitudeControlProps> & {
  keys: Record<string, boolean>;
  velocity: number;
  easing: number;
  onBlur: () => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onKeyUp: (event: KeyboardEvent) => void;
  onVisibilityChange: () => void;
  updateVelocity: (delta: number) => void;
  getMovementVector: (delta: number) => AFrame.THREE.Vector3;
  attachVisibilityEventListeners: () => void;
  removeVisibilityEventListeners: () => void;
  attachKeyEventListeners: () => void;
  removeKeyEventListeners: () => void;
};

AFrame.registerComponent('altitude-control', {
  schema: {
    acceleration: { default: 65 } /* [m/s] */,
    acceptsKeyboardEvent: {
      default: 'legacy',
      oneOf: ['legacy', 'notEditable', 'always'],
    },
    embedded: { default: false },
    enabled: { default: true },
    max: { default: Number.NaN, type: 'number' },
    min: { default: Number.NaN, type: 'number' },
  },

  init(this: AltitudeControlComponent) {
    // To keep track of the pressed keys.
    this.keys = {};
    this.easing = 1.1;

    this.velocity = 0;

    // Bind methods and add event listeners.
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.attachVisibilityEventListeners();
  },

  tick(this: AltitudeControlComponent, time: number, delta: number) {
    if (!this.velocity && isEmpty(this.keys)) {
      return;
    }

    // Update velocity.
    delta /= 1000;
    this.updateVelocity(delta);

    if (!this.velocity) {
      return;
    }

    // Get movement vector and add translate position.
    const { position } = this.el.object3D;

    position.add(this.getMovementVector(delta));

    if (!Number.isNaN(this.data.min) && position.y < this.data.min) {
      position.y = this.data.min;
    }

    if (!Number.isNaN(this.data.max) && position.y > this.data.max) {
      position.y = this.data.max;
    }
  },

  remove(this: AltitudeControlComponent) {
    this.removeKeyEventListeners();
    this.removeVisibilityEventListeners();
  },

  play(this: AltitudeControlComponent) {
    this.attachKeyEventListeners();
  },

  pause(this: AltitudeControlComponent) {
    this.keys = {};
    this.removeKeyEventListeners();
  },

  updateVelocity(this: AltitudeControlComponent, delta: number) {
    const { data, keys } = this;

    // If FPS too low, reset velocity.
    if (delta > MAX_DELTA) {
      this.velocity = 0;
      return;
    }

    const isRunning = keys.ShiftLeft || keys.ShiftRight;

    // https://gamedev.stackexchange.com/questions/151383/frame-rate-independant-movement-with-acceleration
    const scaledEasing = (1 / this.easing) ** (delta * (isRunning ? 20 : 60));
    // Velocity easing.
    if (this.velocity !== 0) {
      this.velocity *= scaledEasing;
    }

    // Clamp velocity easing.
    if (Math.abs(this.velocity) < CLAMP_VELOCITY) {
      this.velocity = 0;
    }

    if (!data.enabled) {
      return;
    }

    // Update velocity using keys pressed
    const acceleration = data.acceleration * (isRunning ? 5 : 1);
    if (keys.KeyE) {
      this.velocity += acceleration * delta;
    }

    if (keys.KeyC) {
      this.velocity -= acceleration * delta;
    }
  },

  getMovementVector: (function () {
    const directionVector = new THREE.Vector3(0, 0, 0);
    return function (this: AltitudeControlComponent, delta: number) {
      directionVector.y = this.velocity * delta;
      return directionVector;
    };
  })(),

  attachVisibilityEventListeners(this: AltitudeControlComponent) {
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  },

  removeVisibilityEventListeners(this: AltitudeControlComponent) {
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  },

  attachKeyEventListeners(this: AltitudeControlComponent) {
    const target = this.data.embedded ? this.el.sceneEl : window;
    if (target) {
      target.addEventListener('keydown', this.onKeyDown as EventListener);
      target.addEventListener('keyup', this.onKeyUp as EventListener);
    }
  },

  removeKeyEventListeners(this: AltitudeControlComponent) {
    const target = this.data.embedded ? this.el.sceneEl : window;
    if (target) {
      target.removeEventListener('keydown', this.onKeyDown as EventListener);
      target.removeEventListener('keyup', this.onKeyUp as EventListener);
    }
  },

  onBlur(this: AltitudeControlComponent) {
    this.pause();
  },

  onFocus(this: AltitudeControlComponent) {
    this.play();
  },

  onVisibilityChange(this: AltitudeControlComponent) {
    if (document.hidden) {
      this.onBlur();
    } else {
      this.onFocus();
    }
  },

  onKeyDown(this: AltitudeControlComponent, event: KeyboardEvent) {
    if (
      !this.data.embedded &&
      !shouldCaptureKeyEvent(event, this.data.acceptsKeyboardEvent)
    ) {
      return;
    }

    const code = event.code || KEYCODE_TO_CODE[event.keyCode];
    if (KEYS.has(code)) {
      this.keys[code] = true;
    }
  },

  onKeyUp(this: AltitudeControlComponent, event: KeyboardEvent) {
    const code = event.code || KEYCODE_TO_CODE[event.keyCode];
    delete this.keys[code];
  },
});
