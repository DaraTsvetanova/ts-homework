import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Position, Team, WorldObjectModel } from 'src/models/models';

export abstract class WorldObject implements WorldObjectModel {
  private _isDestroyed: boolean;
  private _healthPoints: number;
  private _position: Position;
  private _canMove: boolean;
  private _team: Team;

  get isDestroyed(): boolean {
    return this._isDestroyed;
  }

  get healthPoints(): number {
    return this._healthPoints;
  }

  set healthPoints(value: number) {
    if (value <= 0) {
      this._healthPoints = 0;
      this._isDestroyed = true;
    }
    this._healthPoints = value;
  }

  get position(): Position {
    return this._position;
  }

  get canMove(): boolean {
    return this._canMove;
  }

  set canMove(value: boolean) {
    this._canMove = value;
  }

  get team(): Team {
    return this._team;
  }

  constructor(
    position: Position,
    canMove: boolean = true,
    team: Team = Team.NEUTRAL
  ) {
    this._isDestroyed = false;
    this._position = position;
    this._canMove = canMove;
    this._team = team;
  }
  public modifyPosition(newCoordinates: Position): void {
    if (this._canMove) {
      this._position = { ...newCoordinates };
    }
  }
  public modifyHealthPoints(value: number): void {
    this._healthPoints += value;
    if (this._healthPoints <= 0) {
      this._healthPoints = 0;
      this._isDestroyed = true;
    }
  }
}
