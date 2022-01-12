export interface WorldObjectModel {
  isDestroyed: boolean;
  healthPoints: number;
  position: Position;
  canMove: boolean;
  team: Team;
  modifyPosition(newCoordinates: Position): void;
  modifyHealthPoints(newHealth: number): void;
}

export interface UnitModel {
  name: string;
  attack: number;
  defense: number;
  canGather: boolean;
  type: UnitType;
}

export interface Position {
  x: number;
  y: number;
}

export enum Team {
  BLUE = 'BLUE',
  RED = 'RED',
  NEUTRAL = 'NEUTRAL',
}

export enum UnitType {
  PEASANT = 'PEASANT',
  GUARD = 'GUARD',
  NINJA = 'NINJA',
  GIANT = 'GIANT',
}
