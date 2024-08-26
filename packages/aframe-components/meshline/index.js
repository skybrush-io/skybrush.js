/**
 * A-Frame component that draws lines using meshes.
 */

import AFrame from '../lib/_aframe';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline';

const { Color, Mesh, Vector2 } = AFrame.THREE;

AFrame.registerComponent('meshline', {
  schema: {
    color: { default: '#000' },
    lineWidth: { default: 10 },
    sizeAttenuation: { default: 0 },
    path: {
      default: [
        { x: -0.5, y: 0, z: 0 },
        { x: 0.5, y: 0, z: 0 },
      ],
      // Deserialize path in the form of comma-separated vec3s: `0 0 0, 1 1 1, 2 0 3`.
      parse(value) {
        return value
          .split(',')
          .map((value) => AFrame.utils.coordinates.parse(value));
      },
      // Serialize array of vec3s in case someone does setAttribute('line', 'path', [...]).
      stringify(data) {
        return data
          .map((value) => AFrame.utils.coordinates.stringify(value))
          .join(',');
      },
    },
  },

  init() {
    this.resolution = new Vector2(window.innerWidth, window.innerHeight);

    const sceneElement = this.el.sceneEl;
    sceneElement.addEventListener(
      'render-target-loaded',
      this._doUpdate.bind(this)
    );
    sceneElement.addEventListener(
      'render-target-loaded',
      this._addListeners.bind(this)
    );
  },

  update() {
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

  _addListeners() {
    // canvas does not fire resize events, need window
    window.addEventListener('resize', this._doUpdate.bind(this));
  },

  _doUpdate() {
    const canvas = this.el.sceneEl.canvas;
    this.resolution.set(canvas.width, canvas.height);
    this.update();
  },
});
