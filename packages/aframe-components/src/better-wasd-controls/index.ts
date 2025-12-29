import { isEmpty } from 'lodash-es';

import AFrame from '../_aframe.js';
import { KEYCODE_TO_CODE } from '../constants.js';
import {
  shouldCaptureKeyEvent,
  type KeyboardEventAcceptanceCondition,
} from '../utils.js';

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

export type BetterWASDControlsProps = {
  acceleration: number;
  acceptsKeyboardEvent: KeyboardEventAcceptanceCondition;
  adAxis: 'x' | 'y' | 'z';
  adEnabled: boolean;
  adInverted: boolean;
  embedded: boolean;
  enabled: boolean;
  fly: boolean;
  wsAxis: 'x' | 'y' | 'z';
  wsEnabled: boolean;
  wsInverted: boolean;
};

type BetterWASDControlsComponent = AFrame.Component<BetterWASDControlsProps> & {
  keys: Record<string, boolean>;
  velocity: AFrame.THREE.Vector3;
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

  init(this: BetterWASDControlsComponent) {
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

  tick(this: BetterWASDControlsComponent, time: number, delta: number) {
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

  remove(this: BetterWASDControlsComponent) {
    this.removeKeyEventListeners();
    this.removeVisibilityEventListeners();
  },

  play(this: BetterWASDControlsComponent) {
    this.attachKeyEventListeners();
  },

  pause(this: BetterWASDControlsComponent) {
    this.keys = {};
    this.removeKeyEventListeners();
  },

  updateVelocity(this: BetterWASDControlsComponent, delta: number) {
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

  getMovementVector: (function () {
    const directionVector = new THREE.Vector3(0, 0, 0);
    const rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    return function (this: BetterWASDControlsComponent, delta: number) {
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

  attachVisibilityEventListeners(this: BetterWASDControlsComponent) {
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  },

  removeVisibilityEventListeners(this: BetterWASDControlsComponent) {
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  },

  attachKeyEventListeners(this: BetterWASDControlsComponent) {
    const target = this.data.embedded ? this.el.sceneEl : window;

    if (target) {
      target.addEventListener('keydown', this.onKeyDown as EventListener);
      target.addEventListener('keyup', this.onKeyUp as EventListener);
    }
  },

  removeKeyEventListeners(this: BetterWASDControlsComponent) {
    const target = this.data.embedded ? this.el.sceneEl : window;

    if (target) {
      target.removeEventListener('keydown', this.onKeyDown as EventListener);
      target.removeEventListener('keyup', this.onKeyUp as EventListener);
    }
  },

  onBlur(this: BetterWASDControlsComponent) {
    this.pause();
  },

  onFocus(this: BetterWASDControlsComponent) {
    this.play();
  },

  onVisibilityChange(this: BetterWASDControlsComponent) {
    if (document.hidden) {
      this.onBlur();
    } else {
      this.onFocus();
    }
  },

  onKeyDown(this: BetterWASDControlsComponent, event: KeyboardEvent) {
    if (
      !this.data.embedded &&
      !shouldCaptureKeyEvent(event, this.data.acceptsKeyboardEvent)
    ) {
      return;
    }

    const code = event.code ?? KEYCODE_TO_CODE[event.keyCode];
    if (KEYS.has(code)) {
      this.keys[code] = true;
    }
  },

  onKeyUp(this: BetterWASDControlsComponent, event: KeyboardEvent) {
    const code = event.code ?? KEYCODE_TO_CODE[event.keyCode];
    delete this.keys[code];
  },
});
