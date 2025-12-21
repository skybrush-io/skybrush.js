/**
 * A-Frame sprite component that shows a bitmap that always faces the camera.
 *
 * Used to implement a simple glow effect on spheres.
 */

import type { Component } from 'aframe';
import AFrame from '../_aframe.js';

const { AdditiveBlending, NormalBlending, Sprite, SpriteMaterial } =
  AFrame.THREE;

export type SpriteProps = {
  blending: string;
  color: string;
  scale: AFrame.THREE.Vector3;
  src: any;
  transparent: boolean;
  visible: boolean;
};

type SpriteComponent = Component<SpriteProps> & {
  map: AFrame.THREE.Texture | null;
  material: AFrame.THREE.SpriteMaterial;
  sprite: AFrame.THREE.Sprite;
};

type MaterialSystem = {
  loadTexture: (
    src: Element | string,
    data: unknown,
    cb: (texture: AFrame.THREE.Texture) => void
  ) => void;
};

AFrame.registerComponent('sprite', {
  schema: {
    blending: {
      type: 'string',
      default: 'normal',
    },
    color: {
      type: 'color',
      default: '#ffffff',
    },
    src: {
      type: 'map',
    },
    scale: {
      type: 'vec3',
      default: { x: 1, y: 1, z: 1 },
    },
    transparent: {
      type: 'boolean',
      default: true,
    },
    visible: {
      type: 'boolean',
      default: true,
    },
  },

  init(this: SpriteComponent) {
    this.map = null;
    this.material = new SpriteMaterial({});
    this.sprite = new Sprite(this.material);
  },

  update(this: SpriteComponent, oldData: SpriteProps) {
    const element = this.el;

    if (this.data.src !== oldData.src) {
      const savedSrc = this.data.src;
      (element.sceneEl!.systems.material as any as MaterialSystem).loadTexture(
        savedSrc,
        { src: savedSrc },
        (texture) => {
          // Check whether the 'src' property has been changed while loading
          // the image
          if (this.data.src === savedSrc) {
            // Update the texture
            this.material.map = texture;
            this.material.needsUpdate = true;
          }
        }
      );
    }

    if (this.data.blending !== oldData.blending) {
      switch (this.data.blending) {
        case 'additive':
          this.material.blending = AdditiveBlending;
          break;

        case 'normal':
          this.material.blending = NormalBlending;
          break;

        default:
          console.warn('Unknown blending type:', this.data.blending);
      }

      this.material.needsUpdate = true;
    }

    if (this.data.color !== oldData.color) {
      this.material.color.set(this.data.color);
      this.material.needsUpdate = true;
    }

    if (this.data.transparent !== oldData.transparent) {
      this.material.transparent = this.data.transparent;
      this.material.needsUpdate = true;
    }

    if (this.data.visible !== oldData.visible) {
      this.sprite.visible = this.data.visible;
    }

    let mesh = element.getObject3D('mesh');
    if (mesh) {
      mesh.scale.copy(this.data.scale);
    } else {
      mesh = new Sprite(this.material);
      mesh.scale.copy(this.data.scale);
      element.setObject3D('mesh', mesh);
    }
  },

  remove(this: SpriteComponent) {
    this.el.removeObject3D('mesh');
  },
});

AFrame.registerPrimitive('a-sprite', {
  defaultComponents: {
    sprite: {},
  },
  mappings: {
    src: 'sprite.src',
    resize: 'sprite.scale',
    visible: 'sprite.visible',
  },
});
