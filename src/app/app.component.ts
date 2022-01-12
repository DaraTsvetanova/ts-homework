import { Component, ElementRef, ViewChild } from '@angular/core';
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
  public resources: any[] = [];
  public names: string[] = [];
  public teamResourceCount: { [key: string]: any } = {
    blue: {},
    red: {},
  };
  @ViewChild('inputArea') inputArea: ElementRef;

  constructor() {}

  executeCommand() {
    const commands = this.inputArea.nativeElement.value.split(' ');

    console.log(commands);

    const command = commands[0];
    switch (command) {
      case 'create':
        this.createUnit(commands); // create Entity
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

  //TODO: two cases with createUnit and createResource
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
          if (isNaN(Number(objCoords.x)) || isNaN(Number(objCoords.y))) {
            this.outputMessages.push(`Please enter valid coordinates!`);
            break;
          }
          unit.modifyPosition(objCoords);
          this.outputMessages.push(
            `${unit.name} moved to ${objCoords.x},${objCoords.y}`
          );
          break;
        default:
          break;
      }
    } else {
      this.outputMessages.push(`Unit does not exist!`);
    }
  }

  public createUnit(commands: string[]) {
    switch (commands[1]) {
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
      default:
        break;
    }
  }

  private getCoordinatesByString(coordinates: string): Position {
    const [x, y] = coordinates.split(',').map(Number);
    return { x, y };
  }

  private getStringByCoordinates(coordinates: Position): string {
    return `${coordinates.x},${coordinates.y}`;
  }
}
