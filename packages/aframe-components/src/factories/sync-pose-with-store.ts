import type { Component, ComponentDefinition } from 'aframe';
import type AFrame from '../_aframe.js';

type Pose = {
  position: AFrame.THREE.Vector3;
  rotation: AFrame.THREE.Euler;
};

type CameraPoseOptions = {
  getCameraPose: () => Pose;
  setCameraPose: (pose: Pose) => void;
};

export type SyncPoseWithStoreProps = {
  interval: number;
};

type SyncPoseWithStoreComponent = Component<SyncPoseWithStoreProps> & {
  _intervalHandle: ReturnType<typeof setInterval> | undefined;
  _lastPosition: AFrame.THREE.Vector3;
  _lastRotation: AFrame.THREE.Euler;
  _setupIntervalCallback: () => void;
  _synchronize: () => void;
};

/**
 * Creates an A-Frame component that synchronizes the pose of an A-Frame
 * camera that the component is attached to with an external state store.
 *
 * @param  options.getCameraPose  function that can be called with no
 *         arguments to retrieve the current pose of the camera from the
 *         state store
 * @param  options.setCameraPose  function that can be called with no
 *         arguments to store the current pose of the camera in the
 *         state store
 */
const createSyncPoseWithStoreComponent = ({
  getCameraPose,
  setCameraPose,
}: CameraPoseOptions): ComponentDefinition => ({
  schema: {
    interval: { type: 'number', default: 1000 },
  },

  init(this: SyncPoseWithStoreComponent) {
    this._intervalHandle = undefined;
    this._synchronize = this._synchronize.bind(this);

    // Get the pose from the store and update the object if needed
    const pose = getCameraPose();
    const { position, rotation } = pose || { position: null, rotation: null };
    if (position && Array.isArray(position)) {
      this.el.object3D.position.fromArray(position);
    }

    if (rotation && Array.isArray(rotation)) {
      this.el.object3D.rotation.fromArray(
        rotation as any as AFrame.THREE.EulerTuple
      );

      // Make sure that we play along nicely with look-controls
      if (this.el.components['look-controls']) {
        const { pitchObject, yawObject } = this.el.components['look-controls'];
        pitchObject.rotation.x = this.el.object3D.rotation.x;
        yawObject.rotation.y = this.el.object3D.rotation.y;
      }
    }

    // Make a snapshot of the current pose
    this._lastPosition = this.el.object3D.position.clone();
    this._lastRotation = this.el.object3D.rotation.clone();
  },

  update(this: SyncPoseWithStoreComponent, oldData: SyncPoseWithStoreProps) {
    if (
      this._intervalHandle === undefined ||
      oldData.interval !== this.data.interval
    ) {
      this._setupIntervalCallback();
    }
  },

  remove(this: SyncPoseWithStoreComponent) {
    if (this._intervalHandle) {
      clearInterval(this._intervalHandle);
      this._intervalHandle = undefined;
    }
  },

  // @ts-expect-error for some reason TypeScript thinks that _synchronize() should not exist
  _synchronize(this: SyncPoseWithStoreComponent) {
    const { position, rotation } = this.el.object3D;

    if (
      !this._lastPosition.equals(position) ||
      !this._lastRotation.equals(rotation)
    ) {
      this._lastPosition.copy(position);
      this._lastRotation.copy(rotation);

      // Propagate the new pose to the store
      setCameraPose({ position, rotation });
    }
  },

  /**
   * Schedules a call to `_synchronize()` at regular intervals, depending on the
   * current value of `this.data.interval`.
   */
  _setupIntervalCallback(this: SyncPoseWithStoreComponent) {
    if (this._intervalHandle) {
      clearInterval(this._intervalHandle);
      this._intervalHandle = undefined;
    }

    if (this.data.interval && this.data.interval > 0) {
      this._intervalHandle = setInterval(this._synchronize, this.data.interval);
    }
  },
});

export default createSyncPoseWithStoreComponent;
