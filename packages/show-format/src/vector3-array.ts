import { Vector3Array } from '@skybrush/math';
export type {
  DerivativeOptions,
  StrideOptions,
  Vector3ArrayOptions,
} from '@skybrush/math';

// Deprecated; remove with the next major version. The primary source of Vector3Array
// is now @skybrush/math/vector-arrays.js, and this re-export is only kept for backwards
// compatibility.
export default Vector3Array;
