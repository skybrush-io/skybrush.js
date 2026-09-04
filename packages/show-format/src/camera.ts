import { CameraType, type Camera, type ShowSpecification } from './types.js';

/**
 * Returns an array containing all the cameras from a show specification.
 */
export function getCamerasFromShowSpecification(
  spec: ShowSpecification
): Camera[] {
  const cameras = spec?.environment?.cameras;

  if (cameras && !Array.isArray(cameras)) {
    throw new Error('environment.cameras must be an array');
  }

  return cameras ?? [];
}

/**
 * Returns true if the camera is likely to be a perspective camera. Cameras
 * without a type are considered to be perspective cameras for sake of
 * backward compatibility.
 */
export function isProbablyPerspectiveCamera(
  camera: Camera | undefined
): boolean {
  return camera ? !camera.type || camera.type === CameraType.PERSPECTIVE : false;
}

/**
 * Picks the default camera from an array of cameras, or undefined if there is
 * no default camera candidate in the array.
 */
export function getDefaultCamera(
  cameras: readonly Camera[]
): Camera | undefined {
  for (const camera of cameras) {
    if (camera.default) {
      return camera;
    }
  }

  return undefined;
}
