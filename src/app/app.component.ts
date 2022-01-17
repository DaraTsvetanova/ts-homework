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
  //TODO: two cases with createObject and createResource
  public createObject(commands: string[]) {
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
}
