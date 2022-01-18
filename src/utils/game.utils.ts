// Add utility functions here to avoid poluting app.component.ts

import { Resource } from 'src/classes/Resource';
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
