import { Component, ElementRef, ViewChild } from '@angular/core';
import { Resource } from 'src/classes/Resource';
import { Unit } from 'src/classes/Unit';
import { Position, ResourceType, Team, UnitType } from 'src/models/models';
import {
  areCoordinatesValid,
  getCoordinatesByString,
  getStringByCoordinates,
  getTeamResources,
  getWinner,
  isPositionClear,
  showCoordinateInfo,
} from 'src/utils/game.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public outputMessages: string[] = [];
  public units: Unit[] = [];
  public resources: Resource[] = [];
  public names: string[] = [];
  public teamResourceCount: { [key: string]: any } = {
    BLUE: {
      LUMBER: 0,
      IRON: 0,
      FOOD: 0,
    },
    RED: {
      LUMBER: 0,
      IRON: 0,
      FOOD: 0,
    },
  };
  public teamPointsCount: { [key: string]: number } = {
    BLUE: 0,
    RED: 0,
  };
  @ViewChild('inputArea') inputArea: ElementRef;

  constructor() {}

  executeCommand() {
    const commands = this.inputArea.nativeElement.value.split(' ');
    console.log(this.resources);

    console.log(commands);

    const command = commands[0];
    switch (command) {
      case 'create':
        this.createObject(commands);
        break;
      case 'order':
        this.orderUnit(commands);
        break;
      case 'show':
        this.show(commands);
        break;
      case 'end':
        this.calcPoints();
        this.outputMessages.push(getWinner(this.teamPointsCount));
        break;
      default:
        break;
    }
  }

  public orderUnit(commands: string[]) {
    const unit = this.units.find(
      (el) => el.name.toUpperCase() === commands[1].toUpperCase()
    );
    if (unit) {
      switch (commands[2]) {
        case 'attack':
          // unit.attack();
          break;
        case 'gather':
          this.gatherResource(unit);
          break;
        case 'go':
          this.go(commands[3], unit);
          break;
        default:
          break;
      }
    } else {
      this.outputMessages.push(`Unit does not exist!`);
    }
  }
  private show(commands: string[]) {
    const reg = /[0-9]+,[0-9]+/;
    if (commands[1] === 'all') {
      this.showAll();
    } else if (commands[1] === 'units') {
      this.outputMessages.push(this.showTeamMembers(commands[2]));
    } else if (commands[1] === 'resources') {
      this.outputMessages.push(this.showResources());
    } else if (areCoordinatesValid(commands[1])) {
      this.outputMessages.push(showCoordinateInfo(commands[1], this.units));
    } else {
      this.outputMessages.push(`Please enter a valid command or coordinates`);
    }
  }

  private createObject(commands: string[]) {
    const objectType = commands[1].toLowerCase();
    if (areCoordinatesValid(commands[3])) {
      switch (objectType) {
        case 'unit':
          const name = commands[2];
          const coordinates: Position = getCoordinatesByString(commands[3]);
          const team: Team = commands[4].toUpperCase() as Team;
          const type: UnitType = commands[5].toUpperCase() as UnitType;

          if (this.names.includes(name)) {
            this.outputMessages.push('Unit with this name already exists!');
            break;
          }

          if (!Object.values(Team).includes(team)) {
            this.outputMessages.push(
              `Team ${team.toLowerCase()} does not exist!`
            );
            break;
          }

          if (!Object.values(UnitType).includes(type)) {
            this.outputMessages.push(
              `Unit type ${type.toLowerCase()} is not valid!`
            );
            break;
          }

          const unit = new Unit(coordinates, team, name, type);
          this.units.push(unit);
          this.names.push(name);
          this.outputMessages.push(
            `Created ${type} from ${team
              .toString()
              .toLowerCase()} team named ${name} at position ${getStringByCoordinates(
              coordinates
            )}`
          );
          break;
        case 'resource':
          this.createResource(commands.slice(-3));
          break;
        default:
          break;
      }
    } else {
      const message = 'Please enter valid coordinates!';
      this.outputMessages.push(message);
    }
  }
  private createResource(input: string[]) {
    const resourceName = <ResourceType>input[0].toUpperCase();
    const isLegitResource = resourceName in ResourceType;
    const coordinates = getCoordinatesByString(input[1]);
    const quantity = Number(input[2]);

    if (quantity < 1) {
      const message = `Please provide valid quantity!`;
      this.outputMessages.push(message);
    } else {
      if (!isPositionClear(this.resources, coordinates)) {
        const message = `There is already a resource at this position, please try a different position.`;
        this.outputMessages.push(message);
      } else {
        if (!isLegitResource) {
          const message = `Resource type ${resourceName} does not exist!`;
          this.outputMessages.push(message);
        } else {
          const newResource = new Resource(coordinates, quantity, resourceName);
          const message = `Created ${resourceName} at position ${coordinates.x},${coordinates.y} with ${quantity} health`;
          this.resources.push(newResource);
          this.outputMessages.push(message);
        }
      }
    }
  }

  private gatherResource(unit: Unit) {
    const isThereResource = !isPositionClear(this.resources, unit.position);

    if (unit.canGather) {
      if (isThereResource) {
        const resource = this.resources.find(
          (res) =>
            res.position.x === unit.position.x &&
            res.position.y === unit.position.y
        );
        const resourceInfo = resource!.getResourceInfo();
        const canGatherExtendedCheck =
          (unit.type === UnitType.GIANT &&
            resourceInfo!.type === ResourceType.LUMBER) ||
          unit.type === UnitType.PEASANT;
        if (canGatherExtendedCheck) {
          this.teamResourceCount[unit.team][resourceInfo.type] +=
            resourceInfo.quantity;
          resource!.destroyResource();
          this.removeResource();
          const message = `Successfully gathered ${resourceInfo.quantity} ${
            resourceInfo.type
          }. ${getTeamResources(unit.team, this.teamResourceCount)}`;
          this.outputMessages.push(message);
        } else {
          const message = 'You cannot gather that';
          this.outputMessages.push(message);
        }
      } else {
        const message = 'There is nothing to gather';
        this.outputMessages.push(message);
      }
    } else {
      const message = 'You cannot gather that';
      this.outputMessages.push(message);
    }
  }

  private go(coordinates: string, unit: Unit) {
    const inputCoordinates = getCoordinatesByString(coordinates);
    if (areCoordinatesValid(coordinates)) {
      this.outputMessages.push(`Please enter valid coordinates!`);
    } else {
      unit.modifyPosition(inputCoordinates);
      this.outputMessages.push(
        `${unit.name} moved to ${inputCoordinates.x},${inputCoordinates.y}`
      );
    }
  }

  private removeResource() {
    this.resources.forEach((el, index) => {
      if (el.isDestroyed) {
        this.resources.splice(index, 1);
      }
    });
  }

  private showAll(): void {
    this.outputMessages.push(this.showTeamMembers('BLUE'));
    this.outputMessages.push(this.showTeamMembers('RED'));
    this.outputMessages.push(this.showResources());
  }

  private showTeamMembers(team: string): string {
    let returnString = `${team}:`;
    const teamMembers = this.units.filter(
      (el) => el.team === team.toUpperCase()
    );
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

  private showResources(): string {
    let returnString = `Resources: `;
    if (this.resources.length < 1) {
      return 'There are currently no resources ';
    }

    for (const resource of this.resources) {
      let resourceInfo = resource.getResourceInfo();
      returnString += `there is ${resourceInfo.quantity} ${
        resourceInfo.type
      } at position ${getStringByCoordinates(resource.position)}; `;
    }
    return returnString;
  }

  private calcPoints(): void {
    for (const team of Object.keys(this.teamPointsCount)) {
      const currentTeam = this.units.filter(
        (el) => el.team === team.toUpperCase()
      );

      for (const unit of currentTeam) {
        if (unit.type === UnitType.PEASANT) {
          this.teamPointsCount[team] += 5;
        } else if (unit.type === UnitType.GUARD) {
          this.teamPointsCount[team] += 10;
        } else if (
          unit.type === UnitType.NINJA ||
          unit.type === UnitType.GIANT
        ) {
          this.teamPointsCount[team] += 15;
        }
      }

      for (const key in this.teamResourceCount[team]) {
        this.teamPointsCount[team] += this.teamResourceCount[team][key] * 10;
      }
    }
  }
}
