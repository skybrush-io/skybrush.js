/**
 * Component that allows the user to:
 *
 * - control the camera position with WASD + E/C
 * - control the camera orientation with dragging the mouse
 * - make the camera animate to predefined poses.
 *
 * The component basically integrates wasd-controls and look-controls into a
 * single component and adds support for animating the camera to a predefined
 * pose.
 *
 * This component is NOT VR-friendly! VR-related parts from look-controls have
 * not been ported over to this component due to lack of testing. This should
 * be done at some point in the future.
 */

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
  'KeyE',
  'KeyC',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'ShiftLeft',
  'ShiftRight',
]);

const HALF_PI = Math.PI / 2;

const toVector3 = (x) => {
  if (!x) {
    return new THREE.Vector3();
  }

  if (x.isVector3) {
    return x;
  }

  if (Array.isArray(x)) {
    return new THREE.Vector3(x[0] || 0, x[1] || 0, x[2] || 0);
  }

  return new THREE.Vector3(x.x || 0, x.y || 0, x.z || 0);
};

const toQuaternion = (x) => {
  if (!x) {
    return new THREE.Quaternion(0, 0, 0, 1);
  }

  if (Array.isArray(x)) {
    return new THREE.Quaternion(x[1], x[2], x[3], x[0]);
  }

  if (x instanceof THREE.Quaternion) {
    return x;
  }

  return new THREE.Quaternion(x.x, x.y, x.z, x.w);
};

AFrame.registerComponent('advanced-camera-controls', {
  dependencies: ['position', 'rotation', 'camera'],

  schema: {
    acceleration: { default: 65 } /* [m/s/s] */,
    acceptsKeyboardEvent: {
      default: 'legacy',
      oneOf: ['legacy', 'notEditable', 'always'],
    },
    adAxis: { default: 'x', oneOf: ['x', 'y', 'z'] },
    adEnabled: { default: true },
    adInverted: { default: false },
    dragSensitivity: { default: 2 } /* [1e-3 rad/pixel] */,
    ecAxis: { default: 'y', oneOf: ['x', 'y', 'z'] },
    ecEnabled: { default: true },
    ecInverted: { default: false },
    embedded: { default: false },
    enabled: { default: true },
    fly: { default: false },
    maxAltitude: { default: Number.NaN, type: 'number' },
    minAltitude: { default: Number.NaN, type: 'number' },
    maxZoom: { default: 5 },
    minZoom: { default: 1 },
    mouseDragEnabled: { default: true },
    mouseWheelEnabled: { default: true },
    mouseWheelInverted: { default: false },
    mouseWheelSensitivity: { default: 1 } /* [zoom unit / 100 pixel] */,
    reverseMouseDrag: { default: true },
    reverseTouchDrag: { default: true },
    wsAxis: { default: 'z', oneOf: ['x', 'y', 'z'] },
    wsEnabled: { default: true },
    wsInverted: { default: false },
    targetPosition: { type: 'vec3' },
    targetLookAt: { type: 'vec3' },
    targetZoom: { default: 1 },
    transitionDuration: { default: 1 } /* [s] */,
    touchDragEnabled: { default: true },
    zoomStep: { default: 1.5 },
  },

  // -- Component lifecycle methods start here --

  init() {
    // To keep track of the pressed keys.
    this.keys = {};

    // Easing constant
    this.easing = 1.1;

    // Current velocity when in keyboard-controlled mode
    this.velocity = new THREE.Vector3();

    // Mouse-related state when dragging the mouse
    this.mouseDrag = {
      active: false,
      initialRotation: new THREE.Euler(),
      startedAtX: null,
      startedAtY: null,
    };

    // Current transition when not in keyboard-controlled mode
    this.transition = {
      active: false,
      startedAt: null,
      endsAt: null,
      duration: null,
      positionCurve: null,
      rotationFunc: null,
    };

    // Current zoom transition
    this._zoomOperation = {
      active: false,
      startedAt: null,
      endsAt: null,
      duration: null,
      curve: null,
      velocity: 0,
    };

    // Bind methods and add event listeners.
    this._bindMethods();
    this._attachVisibilityEventListeners();
  },

  tick(time, delta) {
    if (this.transition.active) {
      this._tickTransition(time, delta);
    } else {
      this._tickKeyboardControl(time, delta);
    }

    if (this._zoomOperation.active) {
      this._tickZoom(time, delta);
    }
  },

  remove() {
    this._removeKeyEventListeners();
    this._removeMouseEventListeners();
    this._removeVisibilityEventListeners();
  },

  play() {
    this._attachKeyEventListeners();
    this._attachMouseEventListeners();
  },

  pause() {
    this.keys = {};
    this._removeKeyEventListeners();
    this._removeMouseEventListeners();
  },

  update(oldData) {
    const {
      targetLookAt: oldTargetLookAt,
      targetPosition: oldTargetPosition,
      targetZoom: oldTargetZoom,
    } = oldData;
    const { targetLookAt, targetPosition, targetZoom } = this.data;
    if (
      oldTargetPosition &&
      oldTargetLookAt &&
      (oldTargetPosition.x !== targetPosition.x ||
        oldTargetPosition.y !== targetPosition.y ||
        oldTargetPosition.z !== targetPosition.z ||
        oldTargetLookAt.x !== targetLookAt.x ||
        oldTargetLookAt.y !== targetLookAt.y ||
        oldTargetLookAt.z !== targetLookAt.z) &&
      isEmpty(this.keys)
    ) {
      this._startTransition();
    }

    if (oldTargetZoom && oldTargetZoom !== targetZoom && isEmpty(this.keys)) {
      this._startZoom();
    }
  },

  // -- Component lifecycle methods end here --

  _tickKeyboardControl(time, delta) {
    const data = this.data;
    const velocity = this.velocity;

    if (
      !velocity[data.adAxis] &&
      !velocity[data.wsAxis] &&
      !velocity[data.ecAxis] &&
      isEmpty(this.keys)
    ) {
      return;
    }

    // Update velocity.
    delta /= 1000;
    this._updateVelocity(delta);

    // Exit if not moving
    if (
      !velocity[data.adAxis] &&
      !velocity[data.wsAxis] &&
      !velocity[data.ecAxis]
    ) {
      return;
    }

    // Get movement vector and translate position.
    const { position } = this.el.object3D;
    position.add(this._getMovementVector(delta));

    // Clamp altitude
    if (
      !Number.isNaN(this.data.minAltitude) &&
      position.y < this.data.minAltitude
    ) {
      position.y = this.data.minAltitude;
    }

    if (
      !Number.isNaN(this.data.maxAltitude) &&
      position.y > this.data.maxAltitude
    ) {
      position.y = this.data.maxAltitude;
    }
  },

  _tickTransition: (function () {
    const point = new THREE.Vector3();
    return function (time, delta) {
      if (this.transition.startedAt === null) {
        this.transition.startedAt = time - delta;
        this.transition.endsAt =
          this.transition.startedAt + this.transition.duration;
      }

      const ratio = Math.min(
        1,
        (time - this.transition.startedAt) / this.transition.duration
      );
      const curve = this.transition.positionCurve;
      const rotation = this.transition.rotationFunc;

      // Get the new position
      curve.getPoint(ratio, point);

      // Update the velocity from the new and the old position and the time
      // delta
      this.velocity
        .subVectors(point, this.el.object3D.position)
        .divideScalar(delta / 1000);

      // Commit the new position and rotation
      this.el.object3D.position.copy(point);
      this.el.object3D.quaternion.copy(rotation(ratio));

      if (time >= this.transition.endsAt) {
        this._finishTransition({ clearVelocity: true });
      }
    };
  })(),

  _tickZoom: (function () {
    const point = new THREE.Vector2();
    return function (time, delta) {
      if (this._zoomOperation.startedAt === null) {
        this._zoomOperation.startedAt = time - delta;
        this._zoomOperation.endsAt =
          this._zoomOperation.startedAt + this._zoomOperation.duration;
      }

      const ratio = Math.min(
        1,
        (time - this._zoomOperation.startedAt) / this._zoomOperation.duration
      );
      const curve = this._zoomOperation.curve;

      curve.getPoint(ratio, point);

      const scene = this.el ? this.el.sceneEl : null;
      const camera = scene ? scene.camera : null;
      if (camera) {
        this._zoomOperation.velocity = (point.x - camera.zoom) / delta;
        camera.zoom = point.x;
        camera.updateProjectionMatrix();
      }

      if (!camera || time >= this._zoomOperation.endsAt) {
        this._finishZoom();
      }
    };
  })(),

  /* eslint-disable complexity */
  _updateVelocity(delta) {
    const { data, keys, velocity } = this;
    const { adAxis, wsAxis, ecAxis } = data;

    let adSign;
    let wsSign;
    let ecSign;

    // If FPS too low, reset velocity.
    if (delta > MAX_DELTA) {
      velocity[adAxis] = 0;
      velocity[wsAxis] = 0;
      velocity[ecAxis] = 0;
      return;
    }

    const isRunning = keys.ShiftLeft || keys.ShiftRight;

    // https://gamedev.stackexchange.com/questions/151383/frame-rate-independant-movement-with-acceleration
    const scaledEasing = (1 / this.easing) ** (delta * (isRunning ? 20 : 60));

    // Velocity easing
    if (velocity[adAxis] !== 0) {
      velocity[adAxis] *= scaledEasing;
    }

    if (velocity[wsAxis] !== 0) {
      velocity[wsAxis] *= scaledEasing;
    }

    if (velocity[ecAxis] !== 0) {
      velocity[ecAxis] *= scaledEasing;
    }

    // Velocity clamping to zero
    if (Math.abs(velocity[adAxis]) < CLAMP_VELOCITY) {
      velocity[adAxis] = 0;
    }

    if (Math.abs(velocity[wsAxis]) < CLAMP_VELOCITY) {
      velocity[wsAxis] = 0;
    }

    if (Math.abs(velocity[ecAxis]) < CLAMP_VELOCITY) {
      velocity[ecAxis] = 0;
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

    if (data.ecEnabled) {
      ecSign = data.ecInverted ? -1 : 1;
      if (keys.KeyC) {
        velocity[ecAxis] -= ecSign * acceleration * delta;
      }

      if (keys.KeyE) {
        velocity[ecAxis] += ecSign * acceleration * delta;
      }
    }
  },
  /* eslint-enable complexity */

  _getMovementVector: (function () {
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

  // -- Transition and drag rotation management --

  _handleDragRotation(x, y, reversed) {
    const { initialRotation, startedAtX, startedAtY } = this.mouseDrag;
    const deltaX = x - startedAtX;
    const deltaY = y - startedAtY;
    const direction = ((reversed ? 1 : -1) * this.data.dragSensitivity) / 1000;
    const xAxisReversal = Math.abs(initialRotation.z) >= HALF_PI ? -1 : 1;

    this.el.object3D.rotation.set(
      initialRotation.x + direction * xAxisReversal * deltaY,
      initialRotation.y + direction * deltaX,
      initialRotation.z
    );
  },

  _startDragRotationAt(x, y) {
    if (this.transition.active) {
      this._finishTransition({ clearVelocity: true });
    }

    this.mouseDrag.active = true;
    this.mouseDrag.initialRotation.copy(this.el.object3D.rotation);
    this.mouseDrag.startedAtX = x;
    this.mouseDrag.startedAtY = y;
  },

  _startTransition() {
    const target = {
      position: this.data.targetPosition,
    };

    if (this.data.targetLookAt) {
      target.lookAt = this.data.targetLookAt;
    }

    this.startTransitionTo(target);
  },

  _startZoom() {
    this.startZoomTo(this.data.targetZoom);
  },

  resetZoom() {
    this.startZoomTo(1);
  },

  startTransitionTo: (function () {
    const rotationMatrix = new THREE.Matrix4();

    const v0 = new THREE.Vector3();
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();
    const positionCurve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);

    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();
    const q2 = new THREE.Quaternion();

    const easingFunc = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
    const rotationFunc = (t) => q2.copy(q0).slerp(q1, easingFunc(t));

    return function ({ duration, position, quaternion, lookAt }) {
      position = position ? toVector3(position) : this.el.object3D.position;
      if (lookAt) {
        // Calculate a rotation matrix that looks from targetPosition to lookAt
        // with the up vector of the camera
        rotationMatrix.lookAt(position, toVector3(lookAt), this.el.object3D.up);
      } else if (quaternion) {
        rotationMatrix.makeRotationFromQuaternion(toQuaternion(quaternion));
      } else {
        // If no point is specified to look at, keep the current rotation
        rotationMatrix.makeRotationFromQuaternion(this.el.object3D.quaternion);
      }

      if (duration === undefined || duration === null) {
        duration = this.data.transitionDuration;
      }

      // Create a Bezier curve between the current position and the target
      // such that its initial derivative equals our current velocity. The
      // final derivative will be zero.
      v0.copy(this.el.object3D.position);
      v1.copy(v0);
      v1.addScaledVector(this.velocity, duration / 3);
      v2.copy(position);
      v3.copy(position);

      // Craete a spherical linear interpolation between the current and the
      // target quaternion
      q0.copy(this.el.object3D.quaternion);
      q1.setFromRotationMatrix(rotationMatrix);

      this.transition.active = true;
      this.transition.startedAt = null; // will be filled in tick()
      this.transition.endsAt = null; // will be filled in tick()
      this.transition.duration = duration * 1000;
      this.transition.positionCurve = positionCurve;
      this.transition.rotationFunc = rotationFunc;
    };
  })(),

  startZoomTo: (function () {
    const v0 = new THREE.Vector2();
    const v1 = new THREE.Vector2();
    const v2 = new THREE.Vector2();
    const v3 = new THREE.Vector2();
    const zoomVel = new THREE.Vector2();
    const curve = new THREE.CubicBezierCurve(v0, v1, v2, v3);

    return function (zoom) {
      if (!this.el || !this.el.sceneEl) {
        return;
      }

      const camera = this.el.sceneEl.camera;
      if (!camera) {
        return;
      }

      zoom = Math.max(Math.min(zoom, this.data.maxZoom), this.data.minZoom);

      // Create a Bezier curve between the current zoom and the target zoom
      // such that its initial derivative equals our current zoom velocity. The
      // final derivative will be zero.
      const zoomDuration = 500;
      v0.set(camera.zoom, 0);
      v1.copy(v0);
      zoomVel.set(this._zoomOperation.velocity, 0);
      v1.addScaledVector(zoomVel, zoomDuration / 3);
      v2.set(zoom, 0);
      v3.copy(v2);

      this._zoomOperation.active = true;
      this._zoomOperation.startedAt = null; // will be filled in tick()
      this._zoomOperation.endsAt = null; // will be filled in tick()
      this._zoomOperation.duration = 500;
      this._zoomOperation.curve = curve;
    };
  })(),

  zoomInBy(delta) {
    const currentZoom = this._getCurrentCameraZoom();
    if (currentZoom && currentZoom > 0) {
      this.startZoomTo(currentZoom + delta);
    }
  },

  zoomInByMultiplicative(delta) {
    const currentZoom = this._getCurrentCameraZoom();
    if (currentZoom && currentZoom > 0) {
      this.startZoomTo(currentZoom * delta);
    }
  },

  _finishDragRotation() {
    if (this.mouseDrag.active) {
      this.mouseDrag.active = false;
      this.mouseDrag.startedAtX = null;
      this.mouseDrag.startedAtY = null;
    }
  },

  _finishTransition(options) {
    this.transition.active = false;
    this.transition.startedAt = null;
    this.transition.endsAt = null;
    this.transition.duration = null;
    this.transition.positionCurve = null;
    this.transition.rotationFunc = null;

    if (options && options.clearVelocity) {
      this.velocity.multiplyScalar(0);
    }
  },

  _finishZoom() {
    this._zoomOperation.active = false;
    this._zoomOperation.startedAt = null;
    this._zoomOperation.endsAt = null;
    this._zoomOperation.duration = null;
    this._zoomOperation.curve = null;
    this._zoomOperation.velocity = 0;
  },

  // -- Event listener management --

  _attachKeyEventListeners() {
    const target = this.data.embedded ? this.el.sceneEl : window;
    target.addEventListener('keydown', this._onKeyDown);
    target.addEventListener('keyup', this._onKeyUp);
  },

  _attachMouseEventListeners() {
    const { sceneEl } = this.el;
    const canvasElement = sceneEl.canvas;

    canvasElement.addEventListener('mousedown', this._onMouseDown, false);
    window.addEventListener('mousemove', this._onMouseMove, false);
    window.addEventListener('mouseup', this._onMouseUp, false);

    canvasElement.addEventListener('wheel', this._onMouseWheel, false);

    canvasElement.addEventListener('touchstart', this._onTouchStart, false);
    window.addEventListener('touchmove', this._onTouchMove, false);
    window.addEventListener('touchend', this._onTouchEnd, false);
  },

  _attachVisibilityEventListeners() {
    window.addEventListener('blur', this._onBlur);
    window.addEventListener('focus', this._onFocus);
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  },

  _removeKeyEventListeners() {
    const target = this.data.embedded ? this.el.sceneEl : window;
    target.removeEventListener('keydown', this._onKeyDown);
    target.removeEventListener('keyup', this._onKeyUp);
  },

  _removeMouseEventListeners() {
    const { sceneEl } = this.el;
    const canvasElement = sceneEl.canvas;

    canvasElement.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);

    canvasElement.removeEventListener('wheel', this._onMouseWheel);

    canvasElement.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onTouchEnd);
  },

  _removeVisibilityEventListeners() {
    window.removeEventListener('blur', this._onBlur);
    window.removeEventListener('focus', this._onFocus);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  },

  _onBlur() {
    this.pause();
  },

  _onFocus() {
    this.play();
  },

  _onVisibilityChange() {
    if (document.hidden) {
      this._onBlur();
    } else {
      this._onFocus();
    }
  },

  _onKeyDown(event) {
    if (
      !this.data.embedded &&
      !shouldCaptureKeyEvent(event, this.data.acceptsKeyboardEvent)
    ) {
      return;
    }

    if (event.key === '+') {
      // Zoom in
      this.zoomInByMultiplicative(this.data.zoomStep);
    } else {
      // Zoom out
      this.zoomInByMultiplicative(1 / this.data.zoomStep);
    }

    const code = event.code || KEYCODE_TO_CODE[event.keyCode];
    if (KEYS.has(code)) {
      this.keys[code] = true;

      if (this.transition.active) {
        this._finishTransition();
      }
    }
  },

  _onKeyUp(event) {
    const code = event.code || KEYCODE_TO_CODE[event.keyCode];
    delete this.keys[code];
  },

  _onMouseDown(event) {
    if (this.data.enabled && this.data.mouseDragEnabled && event.button === 0) {
      this._startDragRotationAt(event.screenX, event.screenY);
    }
  },

  _onMouseMove(event) {
    if (
      this.mouseDrag.active &&
      this.data.enabled &&
      this.data.mouseDragEnabled
    ) {
      this._handleDragRotation(
        event.screenX,
        event.screenY,
        this.data.reverseMouseDrag
      );
    }
  },

  _onMouseUp() {
    this._finishDragRotation();
  },

  _onMouseWheel(event) {
    if (this.data.enabled && this.data.mouseWheelEnabled) {
      const multiplier =
        (event.deltaMode === 0x01 ? 16 : 1) *
        (this.data.mouseWheelInverted ? -1 : 1);
      const deltaZoom =
        ((event.deltaY * multiplier) / 100) * this.data.mouseWheelSensitivity;
      this.zoomInBy(-deltaZoom);
    }
  },

  _onTouchStart(event) {
    if (
      this.data.enabled &&
      this.data.touchDragEnabled &&
      event.touches.length === 1
    ) {
      this._startDragRotationAt(
        event.touches[0].screenX,
        event.touches[0].screenY
      );
    }
  },

  _onTouchMove(event) {
    if (
      this.mouseDrag.active &&
      this.data.enabled &&
      this.data.touchDragEnabled
    ) {
      this._handleDragRotation(
        event.touches[0].screenX,
        event.touches[0].screenY,
        this.data.reverseTouchDrag
      );
    }
  },

  _onTouchEnd() {
    this._finishDragRotation();
  },

  // -- Miscellaneous --

  _bindMethods() {
    this._onBlur = this._onBlur.bind(this);
    this._onFocus = this._onFocus.bind(this);

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this._onMouseWheel = this._onMouseWheel.bind(this);

    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    this._onVisibilityChange = this._onVisibilityChange.bind(this);
  },

  _getCurrentCameraZoom() {
    // This takes into account the current zoom operation and pretends that the
    // camera has already reached the target of the operation
    if (this.el && this.el.sceneEl && this.el.sceneEl.camera) {
      const camera = this.el.sceneEl.camera;
      return this._zoomOperation.active
        ? this._zoomOperation.curve.v3.x
        : camera.zoom;
    }

    return null;
  },
});
