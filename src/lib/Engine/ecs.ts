type EntityId = string;

export default class ECS {

  private _nextId: number = 0;
  private _entities: EntityId[] = [];
  private _components: any[] = [];

  constructor() {}

  createEntity(): EntityId {
    const id = `entity-${this._nextId++}`
    this._entities.push(id);
    return id;
  }

  removeEntity(id: EntityId) {
    this._entities = this._entities.filter(x => x !== id);
    this._components = this._components.filter(x => x.id !== id);

  }

}
