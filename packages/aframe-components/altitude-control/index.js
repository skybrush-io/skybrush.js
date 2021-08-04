/**
 * Helper A-Frame component that allows the user to control the altitude
 * (position on the Y axis) of an object with the + and - keys on the keyboard.
 *
 * Based on the code of the `wads-controls` component.
 */

import isEmpty from 'lodash-es/isEmpty';

import { shouldCaptureKeyEvent } from 'aframe/src/utils';

import AFrame from '../lib/_aframe';
import { KEYCODE_TO_CODE } from '../lib/constants';

const CLAMP_VELOCITY = 0.001;
const MAX_DELTA = 0.2;
const KEYS = new Set(['KeyE', 'KeyC', 'ShiftLeft', 'ShiftRight']);

const { THREE } = AFrame;

AFrame.registerComponent('altitude-control', {
  schema: {
    acceleration: { default: 65 } /* [m/s] */,
    embedded: { default: false },
    enabled: { default: true },
    max: { default: Number.NaN, type: 'number' },
    min: { default: Number.NaN, type: 'number' },
  },

  init() {
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

  tick(time, delta) {
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

  remove() {
    this.removeKeyEventListeners();
    this.removeVisibilityEventListeners();
  },

  play() {
    this.attachKeyEventListeners();
  },

  pause() {
    this.keys = {};
    this.removeKeyEventListeners();
  },

  updateVelocity(delta) {
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
    return function (delta) {
      directionVector.y = this.velocity * delta;
      return directionVector;
    };
  })(),

  attachVisibilityEventListeners() {
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  },

  removeVisibilityEventListeners() {
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  },

  attachKeyEventListeners() {
    const target = this.data.embedded ? this.el.sceneEl : window;
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
  },

  removeKeyEventListeners() {
    const target = this.data.embedded ? this.el.sceneEl : window;
    target.removeEventListener('keydown', this.onKeyDown);
    target.removeEventListener('keyup', this.onKeyUp);
  },

  onBlur() {
    this.pause();
  },

  onFocus() {
    this.play();
  },

  onVisibilityChange() {
    if (document.hidden) {
      this.onBlur();
    } else {
      this.onFocus();
    }
  },

  onKeyDown(event) {
    if (!this.data.embedded && !shouldCaptureKeyEvent(event)) {
      return;
    }

    const code = event.code || KEYCODE_TO_CODE[event.keyCode];
    if (KEYS.has(code)) {
      this.keys[code] = true;
    }
  },

  onKeyUp(event) {
    const code = event.code || KEYCODE_TO_CODE[event.keyCode];
    delete this.keys[code];
  },
});
