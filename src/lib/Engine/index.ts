import * as THREE from "three";

export default class Engine {

  public keys: { [key: string]: boolean } = {isShifting: false}; 
  public clock: THREE.Clock = new THREE.Clock();

  constructor() {
    this.initKBListeners();
  }

  initKBListeners() {
    document.addEventListener('keydown', (event) => {
      event.preventDefault();
      this.keys[event.key.toLowerCase()] = true;
      this.keys.isShifting = event.shiftKey;
    });
    document.addEventListener('keyup', (event) => {
      this.keys[event.key.toLowerCase()] = false;
      this.keys.isShifting = event.shiftKey;
    });
  }

  update() {}

}
