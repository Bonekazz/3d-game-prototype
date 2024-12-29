import * as THREE from "three";

export default class Position {
  public _x: number = 0;
  public _y: number = 0;
  public _z: number = 0;

  constructor(vec3: THREE.Vector3) {
    this._x = vec3.x;
    this._y = vec3.y;
    this._z = vec3.z;
  }
}
