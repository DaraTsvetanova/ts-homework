import { Resource } from 'src/classes/Resource';
import { Unit } from 'src/classes/Unit';
import { Position, Team } from 'src/models/models';

export function areCoordinatesValid(coordinates: any): boolean {
  const reg = /^(?!-0)-?\d+,(?!-0)-?\d+$/;
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
export function getWinner(teamPointsCount: any): string {
  let finalScore = 'The game is over.';
  if (teamPointsCount[Team.BLUE] === teamPointsCount[Team.RED]) {
    return `IT'S A DRAW, both teams have ${teamPointsCount.BLUE} points`;
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

export function showCoordinateInfo(coordinates: string, units: Unit[]): string {
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

export function showResources(resources: Resource[]): string {
  let returnString = `Resources: `;
  if (resources.length < 1) {
    return 'There are currently no resources ';
  }

  for (const resource of resources) {
    let resourceInfo = resource.getResourceInfo();
    returnString += `there is ${resourceInfo.quantity} ${
      resourceInfo.type
    } at position ${getStringByCoordinates(resource.position)}; `;
  }
  return returnString;
}

export function showTeamMembers(team: string, units: Unit[]): string {
  if (team === Team.RED || team === Team.BLUE) {
    let returnString = `Currently the ${team} team has the following members:`;
    const teamMembers = units.filter((el) => el.team === team);
    if (teamMembers.length < 1) {
      return `There are currently no units for team ${team} `;
    }
    for (const unit of teamMembers) {
      returnString += ` ${unit.name} is at ${getStringByCoordinates(
        unit.position
      )};`;
    }
    return returnString;
  }
  return 'Please enter a valid team name!';
}
