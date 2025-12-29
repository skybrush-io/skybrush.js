/**
 * Helper A-Frame component that deallocates the WebGL context when the
 * scene is unmounted.
 *
 * Source: https://github.com/ngokevin/aframe-react/issues/110
 */

import type { Scene } from 'aframe';
import AFrame from '../_aframe.js';

const { Cache } = AFrame.THREE;

export type DeallocateProps = object;

AFrame.registerComponent('deallocate', {
  schema: { default: true },

  sceneOnly: true,

  remove() {
    Cache.clear();
    (this.el as Scene).renderer.forceContextLoss();
  },
});
