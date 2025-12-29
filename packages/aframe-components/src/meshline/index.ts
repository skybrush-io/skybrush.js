/**
 * A-Frame component that draws lines using meshes.
 */

import type { Component, Coordinate } from 'aframe';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline';
import AFrame from '../_aframe.js';

const { Color, Mesh, Vector2 } = AFrame.THREE;

export type MeshlineProps = {
  color: string;
  lineWidth: number;
  sizeAttenuation: number;
  path: Coordinate[];
};

type MeshlineComponent = Component<MeshlineProps> & {
  resolution: AFrame.THREE.Vector2;
  _addListeners: () => void;
  _doUpdate: () => void;
};

AFrame.registerComponent('meshline', {
  schema: {
    color: { default: '#000' },
    lineWidth: { default: 10 },
    sizeAttenuation: { default: 0 },
    path: {
      default: [
        { x: -0.5, y: 0, z: 0 } as Coordinate,
        { x: 0.5, y: 0, z: 0 } as Coordinate,
      ],
      // Deserialize path in the form of comma-separated vec3s: `0 0 0, 1 1 1, 2 0 3`.
      parse(value: Coordinate[] | string) {
        // From AFrame 1.7.0 it looks like we can sometimes receive an already
        // parsed value here so we protect against that.
        return Array.isArray(value)
          ? value
          : value
              .split(',')
              .map((value) => AFrame.utils.coordinates.parse(value));
      },
      // Serialize array of vec3s in case someone does setAttribute('line', 'path', [...]).
      stringify(data: Coordinate[]) {
        return data
          .map((value) => AFrame.utils.coordinates.stringify(value))
          .join(',');
      },
    },
  },

  init(this: MeshlineComponent) {
    this.resolution = new Vector2(window.innerWidth, window.innerHeight);

    const sceneElement = this.el.sceneEl!;
    sceneElement.addEventListener(
      'render-target-loaded',
      this._doUpdate.bind(this)
    );
    sceneElement.addEventListener(
      'render-target-loaded',
      this._addListeners.bind(this)
    );
  },

  update(this: MeshlineComponent) {
    const material = new MeshLineMaterial({
      color: new Color(this.data.color),
      resolution: this.resolution,
      sizeAttenuation: this.data.sizeAttenuation,
      lineWidth: this.data.lineWidth,
    });

    const vertices = [];
    for (const vec3 of this.data.path) {
      vertices.push(vec3.x || 0, vec3.y || 0, vec3.z || 0);
    }

    const geometry = new MeshLineGeometry();
    geometry.setPoints(vertices);

    const mesh = new Mesh(geometry, material);
    mesh.raycast = raycast;

    this.el.setObject3D('mesh', mesh);
  },

  remove() {
    this.el.removeObject3D('mesh');
  },

  _addListeners(this: MeshlineComponent) {
    // canvas does not fire resize events, need window
    window.addEventListener('resize', this._doUpdate.bind(this));
  },

  _doUpdate(this: MeshlineComponent) {
    const canvas = this.el.sceneEl!.canvas;
    this.resolution.set(canvas.width, canvas.height);
    this.update(this.data);
  },
});
