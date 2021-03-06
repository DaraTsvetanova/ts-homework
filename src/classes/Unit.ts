import { Position, Team, UnitModel, UnitType } from 'src/models/models';
import { WorldObject } from './WorldObject';

export class Unit extends WorldObject implements UnitModel {
  private _name: string;
  private _attack: number;
  private _defense: number;
  private _canGather: boolean;
  private _type: UnitType;

  get name(): string {
    return this._name;
  }
  get attack(): number {
    return this._attack;
  }
  get defense(): number {
    return this._defense;
  }
  get canGather(): boolean {
    return this._canGather;
  }
  get type(): UnitType {
    return this._type;
  }

  constructor(position: Position, team: Team, name: string, type: UnitType) {
    super(position, true, team);
    this._name = name;
    this._type = type;
    this.setUnitStats(type);
  }

  public getDamage(opponent: string): number {
    if (opponent === 'attacker') {
      if (Math.random() >= 0.5) {
        return this.attack * 2;
      }
    }
    return this.attack;
  }

  private setUnitStats(type: UnitType) {
    switch (type) {
      case UnitType.PEASANT:
        this._attack = 25;
        this._defense = 10;
        this._canGather = true;
        this.healthPoints = 50;
        this.canMove = true;
        break;
      case UnitType.GUARD:
        this._attack = 30;
        this._defense = 20;
        this._canGather = false;
        this.healthPoints = 80;
        this.canMove = true;
        break;
      case UnitType.NINJA:
        this._attack = 50;
        this._defense = 10;
        this._canGather = false;
        this.healthPoints = 80;
        this.canMove = true;
        break;
      case UnitType.GIANT:
        this._attack = 40;
        this._defense = 20;
        this._canGather = true;
        this.healthPoints = 90;
        this.canMove = true;
        break;
      default:
        break;
    }
  }
}
