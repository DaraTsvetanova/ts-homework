import { Component, ElementRef, ViewChild } from '@angular/core';
import { Resource } from 'src/classes/Resource';
import { Unit } from 'src/classes/Unit';
import { Position, Team, UnitType } from 'src/models/models';

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
    blue: {
      lumber: 0,
      iron: 0,
      food: 0,
    },
    red: {
      lumber: 0,
      iron: 0,
      food: 0,
    },
  };
  @ViewChild('inputArea') inputArea: ElementRef;

  constructor() {}

  executeCommand() {
    const commands = this.inputArea.nativeElement.value.split(' ');

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
          // unit.gather();
          break;
        case 'go':
          const objCoords = this.getCoordinatesByString(commands[3]);
          if (isNaN(objCoords.x) || isNaN(objCoords.y)) {
            this.outputMessages.push(`Please enter valid coordinates!`);
          } else {
            unit.modifyPosition(objCoords);
            this.outputMessages.push(
              `${unit.name} moved to ${objCoords.x},${objCoords.y}`
            );
          }
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
    const resourceType = input[0].toUpperCase();
    const creationCoordinates = this.getCoordinatesByString(input[1]);
    const quantity = Number(input[2]);
    console.log(resourceType);
    console.log(creationCoordinates);
    console.log(quantity);

    //  create resource Lumber 0,1 30
    //Format: create resource <resource-type> <position> <hp/quantity>
    //Resources don’t have a unique identifier, but there cannot be two resources at the same coordinates.
    // 1. Check if the resource type is legit. - if yes continue, if not print `Resource type {InputType} does not exist!`
    // 2. Check if the resource quantity is legit. If yes continue, if not print `Please provide valid quantity!`
    // 3. Check if the resource exists in the resourceArr. If yes continue, if not print `There is already a resource at this position, please try a different position.`
    // 4. Add the resource to the resources[].
  }

  private getCoordinatesByString(coordinates: string): Position {
    const [x, y] = coordinates.split(',').map(Number);
    return { x, y };
  }

  private getStringByCoordinates(coordinates: Position): string {
    return `${coordinates.x},${coordinates.y}`;
  }
}
