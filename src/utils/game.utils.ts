// Add utility functions here to avoid poluting app.component.ts

import { Resource } from 'src/classes/Resource';
import { Unit } from 'src/classes/Unit';
import { Position, Team } from 'src/models/models';

export function areCoordinatesValid(coordinates: any) {
  const reg = /^((?!-0)-?[0-9]+)+,((?!-0)-?[0-9]+)+$/;
  return reg.test(coordinates);
}

export function isPositionClear(
  resources: Resource[],
  coordinates: Position
): boolean {
  if (resources.length > 0) {
    for (const resource of resources) {
      const currentPosition = getStringByCoordinates(coordinates);
      const resourcePosition = getStringByCoordinates(resource.position);
      if (currentPosition === resourcePosition) {
        return !(currentPosition === resourcePosition);
      }
    }
  }
  return true;
}

export function getCoordinatesByString(coordinates: string): Position {
  const [x, y] = coordinates.split(',').map(Number);
  return { x, y };
}

export function getStringByCoordinates(coordinates: Position): string {
  return `${coordinates.x},${coordinates.y}`;
}

export function getTeamResources(team: Team, teamResourceCount: any): string {
  let message = `Team ${team} now has ${teamResourceCount[team].FOOD} food, ${teamResourceCount[team].LUMBER} lumber and ${teamResourceCount[team].IRON} iron.`;
  return message;
}

export function getWinner(teamPointsCount: any): string {
  let finalScore = 'The game is over.';
  if (teamPointsCount[Team.BLUE] === teamPointsCount[Team.RED]) {
    return 'ITS A DRAW';
  } else {
    const winner =
      teamPointsCount[Team.BLUE] > teamPointsCount[Team.RED]
        ? Team.BLUE
        : Team.RED;
    const looser =
      teamPointsCount[Team.BLUE] < teamPointsCount[Team.RED]
        ? Team.BLUE
        : Team.RED;
    finalScore += ` Team ${winner} is the winner with ${teamPointsCount[winner]} points,
     and team ${looser} is the looser with ${teamPointsCount[looser]} points`;
  }
  return finalScore;
}

export function showCoordinateInfo(coordinates: string, units:Unit[]): string {
  let returnString = `At position ${coordinates} there is a `;
  const coordinateObj = getCoordinatesByString(coordinates);
  const unitsOnCurrentCoords = units.filter(
    (el) =>
      el.position.x === coordinateObj.x && el.position.y === coordinateObj.y
  );
  if (unitsOnCurrentCoords.length < 1) {
    return 'There are no unit on this position';
  }
  for (const unit of unitsOnCurrentCoords) {
    returnString += `${unit.team} ${unit.type} named ${unit.name}; `;
  }
  return returnString;
}