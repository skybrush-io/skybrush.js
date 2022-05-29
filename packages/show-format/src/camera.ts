import { Camera, ShowSpecification } from './types';

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
