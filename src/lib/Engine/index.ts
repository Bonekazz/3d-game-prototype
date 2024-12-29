import * as THREE from "three";
import { _3DObject } from "../../main";

export default class Engine {

  public keys: { [key: string]: boolean } = {isShifting: false}; 
  public clock: THREE.Clock = new THREE.Clock();

  public cameras: { [key: string]: THREE.PerspectiveCamera | null } = {};

  constructor() {
    this.initKBListeners();
    const mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.cameras["activeCamera"] = mainCamera;
    this.cameras["mainCamera"] = mainCamera;
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


// WALKING -> WALK_DIRECTION -> forw, backw
// RUNNING -> WALK_DIRECTION -> forw
// ROTATING -> ROT_DIRECTION -> left, right
// IDLE

export interface Entity {
  id: string,
  name?: string,
  model: _3DObject,
}

interface FSM_State {
  name: string,
  callback: () => void,
  isDefault?: boolean
}
interface FSM_Entity {
  reference: Entity,
  currentState: FSM_State | null,
  states: Map<string, () => void>,
}

export class FSM_Manager {

  public entities: FSM_Entity[] = [];
  public sceneObjReferences: Entity[] | null = null;

  constructor(objs: Entity[]) {
    this.sceneObjReferences = objs;
  };

  applyStates(id: string, states: FSM_State[]) {
    const enty = this.entities.find(x => x.reference.id === id);
    if (!enty) throw new Error("id not found");
    
    states.forEach((state: FSM_State) => {
      enty.states.set(state.name, state.callback);
      if (state.isDefault) enty.currentState = state;
    })
  }

}
