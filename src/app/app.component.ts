import { Component, ElementRef, ViewChild } from '@angular/core';
import { Resource } from 'src/classes/Resource';
import { Unit } from 'src/classes/Unit';
import { Position, ResourceType, Team, UnitType } from 'src/models/models';

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
  @ViewChild('inputArea') inputArea: ElementRef;

  constructor() {}

  executeCommand() {
    const commands = this.inputArea.nativeElement.value.split(' ');
    console.log(this.resources);

    console.log(commands);

    const command = commands[0];
    switch (command) {
      case 'create':
        this.createObject(commands); // create Entity
        break;
      case 'order':
        this.orderUnit(commands); // order to go, attack and gather
        break;
      case 'show':
        this.show(commands);
        break;
      case 'end':
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
  //show
  private show(commands: string[]) {
    const reg = /[0-9]*,[0-9]*/;
    if (commands[1] === 'all') {
      this.outputMessages.push(this.showAll());
    } else if (commands[1] === 'units') {
      this.outputMessages.push(this.showTeamMembers(commands[2]));
    } else if (commands[1] === 'resources') {
      this.outputMessages.push(this.showResources());
    } else if (reg.test(commands[1])) {
      this.outputMessages.push(this.showCoordinateInfo(commands[1]));
    } else {
      this.outputMessages.push(`Please enter a valid command`);
    }
  }

  //TODO: two cases with createObject and createResource

  private createObject(commands: string[]) {
    const objectType = commands[1].toLowerCase();
    switch (objectType) {
      case 'unit':
        const name = commands[2];
        const coordinates: Position = this.getCoordinatesByString(commands[3]);
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
            .toLowerCase()} team named ${name} at position ${this.getStringByCoordinates(
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
  }
  private createResource(input: string[]) {
    const resourceName = <ResourceType>input[0].toUpperCase();
    const isLegitResource = resourceName in ResourceType;
    const coordinates = this.getCoordinatesByString(input[1]);
    const quantity = Number(input[2]);

    if (quantity < 1) {
      const message = `Please provide valid quantity!`;
      this.outputMessages.push(message);
    } else {
      if (!this.isPositionClear(this.resources, coordinates)) {
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
    const isThereResource = !this.isPositionClear(
      this.resources,
      unit.position
    );

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
          this.updateTeamResources(
            resourceInfo!.type,
            resourceInfo!.quantity,
            unit.team
          );
          resource!.destroyResource();
          this.removeResource();
          const message = `Successfully gathered ${resourceInfo.quantity} ${resourceInfo.type}. Team ${unit.team} now has {X} food, {Y} lumber and {Z} iron.`;
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
    const inputCoordinates = this.getCoordinatesByString(coordinates);
    if (isNaN(inputCoordinates.x) || isNaN(inputCoordinates.y)) {
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

  private updateTeamResources(
    resource: ResourceType,
    quantity: number,
    team: Team
  ) {
    this.teamResourceCount[team][resource] += quantity;
  }

  private isPositionClear(
    resources: Resource[],
    coordinates: Position
  ): boolean {
    if (resources.length > 0) {
      for (const resource of resources) {
        const currentPosition = this.getStringByCoordinates(coordinates);
        const resourcePosition = this.getStringByCoordinates(resource.position);
        if (currentPosition === resourcePosition) {
          return !(currentPosition === resourcePosition);
        }
      }
    }
    return true;
  }

  private getCoordinatesByString(coordinates: string): Position {
    const [x, y] = coordinates.split(',').map(Number);
    return { x, y };
  }

  private getStringByCoordinates(coordinates: Position): string {
    return `${coordinates.x},${coordinates.y}`;
  }

  private showAll(): string {
    let returnString = `${this.showTeamMembers('blue')} 
    ${this.showTeamMembers('red')}
    ${this.showResources()}`;
    return returnString;
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
      returnString += ` ${unit.name} is at ${this.getStringByCoordinates(
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
      } at position ${this.getStringByCoordinates(resource.position)}; `;
    }
    return returnString;
  }

  private showCoordinateInfo(coordinates: string): string {
    let returnString = `On this position there is`;
    const coordinateObj = this.getCoordinatesByString(coordinates);
    const unitsOnCurrentCoords = this.units.filter(
      (el) =>
        el.position.x === coordinateObj.x && el.position.y === coordinateObj.y
    );
    if (unitsOnCurrentCoords.length < 1) {
      return 'There are no unit on this position';
    }
    for (const unit of unitsOnCurrentCoords) {
      returnString += ` a ${unit.type} named ${unit.name}`;
    }
    return returnString;
  }

  private getTeamResources(team: string): string {
    let returnString = `${team} team has:`;
    const currentTeamResource = this.teamResourceCount[team.toLowerCase()];
    for (const key in currentTeamResource) {
      returnString += ` ${currentTeamResource[key]} ${key}`;
    }
    return returnString;
  }
}
