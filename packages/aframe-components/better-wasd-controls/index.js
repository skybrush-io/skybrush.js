import isEmpty from 'lodash-es/isEmpty';

import AFrame from '../lib/_aframe';
import { KEYCODE_TO_CODE } from '../lib/constants';
import { shouldCaptureKeyEvent } from '../lib/utils';

const { THREE } = AFrame;

const CLAMP_VELOCITY = 0.001;
const MAX_DELTA = 0.2;
const KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'ShiftLeft',
  'ShiftRight',
]);

const HALF_PI = Math.PI / 2;

/**
 * WASD component to control entities using WASD keys.
 */
AFrame.registerComponent('better-wasd-controls', {
  schema: {
    acceleration: { default: 65 },
    acceptsKeyboardEvent: {
      default: 'legacy',
      oneOf: ['legacy', 'notEditable', 'always'],
    },
    adAxis: { default: 'x', oneOf: ['x', 'y', 'z'] },
    adEnabled: { default: true },
    adInverted: { default: false },
    embedded: { default: false },
    enabled: { default: true },
    fly: { default: false },
    wsAxis: { default: 'z', oneOf: ['x', 'y', 'z'] },
    wsEnabled: { default: true },
    wsInverted: { default: false },
  },

  init() {
    // To keep track of the pressed keys.
    this.keys = {};
    this.easing = 1.1;

    this.velocity = new THREE.Vector3();

    // Bind methods and add event listeners.
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.attachVisibilityEventListeners();
  },

  tick(time, delta) {
    const data = this.data;
    const element = this.el;
    const velocity = this.velocity;

    if (
      !velocity[data.adAxis] &&
      !velocity[data.wsAxis] &&
      isEmpty(this.keys)
    ) {
      return;
    }

    // Update velocity.
    delta /= 1000;
    this.updateVelocity(delta);

    if (!velocity[data.adAxis] && !velocity[data.wsAxis]) {
      return;
    }

    // Get movement vector and translate position.
    element.object3D.position.add(this.getMovementVector(delta));
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

  /* eslint-disable complexity */
  updateVelocity(delta) {
    const data = this.data;
    const keys = this.keys;
    const velocity = this.velocity;

    const adAxis = data.adAxis;
    const wsAxis = data.wsAxis;

    let adSign;
    let wsSign;

    // If FPS too low, reset velocity.
    if (delta > MAX_DELTA) {
      velocity[adAxis] = 0;
      velocity[wsAxis] = 0;
      return;
    }

    const isRunning = keys.ShiftLeft || keys.ShiftRight;

    // https://gamedev.stackexchange.com/questions/151383/frame-rate-independant-movement-with-acceleration
    const scaledEasing = (1 / this.easing) ** (delta * (isRunning ? 20 : 60));
    // Velocity Easing.
    if (velocity[adAxis] !== 0) {
      velocity[adAxis] *= scaledEasing;
    }

    if (velocity[wsAxis] !== 0) {
      velocity[wsAxis] *= scaledEasing;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity[adAxis]) < CLAMP_VELOCITY) {
      velocity[adAxis] = 0;
    }

    if (Math.abs(velocity[wsAxis]) < CLAMP_VELOCITY) {
      velocity[wsAxis] = 0;
    }

    if (!data.enabled) {
      return;
    }

    // Update velocity using keys pressed.
    const acceleration = data.acceleration * (isRunning ? 5 : 1);
    if (data.adEnabled) {
      adSign = data.adInverted ? -1 : 1;
      if (keys.KeyA || keys.ArrowLeft) {
        velocity[adAxis] -= adSign * acceleration * delta;
      }

      if (keys.KeyD || keys.ArrowRight) {
        velocity[adAxis] += adSign * acceleration * delta;
      }
    }

    if (data.wsEnabled) {
      wsSign = data.wsInverted ? -1 : 1;
      if (keys.KeyW || keys.ArrowUp) {
        velocity[wsAxis] -= wsSign * acceleration * delta;
      }

      if (keys.KeyS || keys.ArrowDown) {
        velocity[wsAxis] += wsSign * acceleration * delta;
      }
    }
  },
  /* eslint-enable complexity */

  getMovementVector: (function () {
    const directionVector = new THREE.Vector3(0, 0, 0);
    const rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    return function (delta) {
      const rotation = this.el.object3D.rotation;
      const velocity = this.velocity;

      directionVector.copy(velocity);
      directionVector.multiplyScalar(delta);

      if (rotation) {
        // When not flying, snap X rotation angle to 0 or 180 degrees,
        // whichever is closest
        const xRotation = this.data.fly
          ? rotation.x
          : Math.abs(rotation.x) < HALF_PI
          ? 0
          : Math.PI;

        // Transform direction relative to heading.
        rotationEuler.set(xRotation, rotation.y, rotation.z);
        directionVector.applyEuler(rotationEuler);
      }

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

  onKeyUp(event) {
    const code = event.code || KEYCODE_TO_CODE[event.keyCode];
    delete this.keys[code];
  },
});
