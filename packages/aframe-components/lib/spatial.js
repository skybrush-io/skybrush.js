import AFrame from './_aframe';

const { THREE } = AFrame;

/*
 * In Skybrush conventions, a camera that is rotated by [0, 0, 0, 1] (i.e.
 * zero degree around an arbitrary axis) points towards the ground (negative
 * Z axis) and its up-vector points towards the positive Y axis. This is also
 * the same as the Blender conventions.
 *
 * In Three.js, the Y axis points upwards, the X axis points right and the Z
 * axis points backward so we need to rotate Skybrush quaternions to Three.js
 * quaternions and vice versa.
 */

/**
 * Quaternion that converts from Three.js rotation conventions to Skybrush
 * rotations.
 */
const THREE_TO_SB_QUAT = new THREE.Quaternion(-0.5, 0.5, 0.5, -0.5); // [x, y, z, w]

/**
 * Quaternion that converts from Skybrush rotation conventions to Three.js
 * rotations.
 */
const SB_TO_THREE_QUAT = new THREE.Quaternion();
SB_TO_THREE_QUAT.copy(THREE_TO_SB_QUAT);
SB_TO_THREE_QUAT.invert();

const createRotationFuncFromQuaternion = (rotation) => {
  const quat = new THREE.Quaternion();
  return (wxyz) => {
    quat.set(wxyz[1], wxyz[2], wxyz[3], wxyz[0]);
    quat.premultiply(rotation);
    return [quat.w, quat.x, quat.y, quat.z];
  };
};

// threeJsRotationToSkybrushQuaternion

/**
 * Function that takes a Skybrush rotation quaternion and transforms it into an
 * equivalent Three.js rotation quaternion.
 */
export const skybrushToThreeJsQuaternion =
  createRotationFuncFromQuaternion(SB_TO_THREE_QUAT);

/**
 * Function that takes a Three.js rotation quaternion and transforms it into an
 * equivalent Skybrush rotation quaternion.
 */
export const threeJsToSkybrushQuaternion =
  createRotationFuncFromQuaternion(THREE_TO_SB_QUAT);

/**
 * Converts a Skybrush rutation given as extrinsic Tait-Bryan angles in XYZ
 * order to an equivalent Skybrush rotation quaternion.
 */
export const skybrushRotationToQuaternion = (() => {
  const euler = new THREE.Euler();
  const quat = new THREE.Quaternion();
  const { degToRad } = THREE.MathUtils;
  return (rotation) => {
    // Skybrush rotations are given as extrinsic Tait-Bryan angles in XYZ
    // order. Extrinsic rotations in XYZ order are equivalent to intrinsic
    // rotations in ZYX order. Three.js uses intrinsic rotations.
    euler.set(
      degToRad(rotation[0]),
      degToRad(rotation[1]),
      degToRad(rotation[2]),
      'ZYX'
    );
    quat.setFromEuler(euler);
    return [quat.w, quat.x, quat.y, quat.z];
  };
})();

/**
 * Converts a Skybrush rotation quaternion to an equivalent Three.js Euler
 * rotation object.
 */
export const skybrushQuaternionToThreeJsRotation = (() => {
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const { radToDeg } = THREE.MathUtils;

  return (wxyz) => {
    quat.set(wxyz[1], wxyz[2], wxyz[3], wxyz[0]);
    quat.premultiply(SB_TO_THREE_QUAT);
    euler.setFromQuaternion(quat, 'YZX');
    return [radToDeg(euler.x), radToDeg(euler.y), radToDeg(euler.z)];
  };
})();

export const skybrushToThreeJsPosition = (pos) => {
  return [-pos[1], pos[2], -pos[0]];
};
