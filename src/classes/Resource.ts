import { Position, ResourceType, Team } from 'src/models/models';
import { WorldObject } from './WorldObject';

export class Resource extends WorldObject {
  private _quantity: number;
  private _type: ResourceType;

  constructor(position: Position, quantity: number, type: ResourceType) {
    super(position, false, Team.NEUTRAL);

    this._quantity = quantity;
    this.healthPoints = quantity;
    this._type = type;
  }

  public getResourceInfo() {
    return { quantity: this._quantity, type: this._type };
  }

  public destroyResource() {
    this._quantity = 0;
    this.healthPoints = 0;
  }
}
