import { Component, ElementRef, ViewChild } from '@angular/core';
import { Resource } from 'src/classes/Resource';
import { Unit } from 'src/classes/Unit';
import { Position, ResourceType, Team, UnitType } from 'src/models/models';

function isUnitType(type: string): type is UnitType {
  return Object.keys(UnitType).includes(type);
}

// function isResourceType(type: string): type is ResourceType {
//   return Object.keys(ResourceType).includes(type)
// }

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
          this.attack(unit);
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

  public createObject(commands: string[]) {
    const objectType = commands[1].toLowerCase();
    switch (objectType) {
      case 'unit':
        const name = commands[2];
        const coordinates: Position = this.getCoordinatesByString(commands[3]);
        const team: Team = commands[4].toUpperCase() as Team;

        const unitType = commands[5].toUpperCase();

        if (!isUnitType(unitType)) {
          break;
        }

        const type = UnitType[unitType];

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
  private attack(unit: Unit) {
    let damageDealtByAttacker = 0;
    let damageDealtByDefender = 0;

    const enemies = this.units.filter((enemy) => {
      return (
        this.getStringByCoordinates(enemy.position) ===
          this.getStringByCoordinates(unit.position) && enemy.team !== unit.team
      );
    });

    const teammates = this.units.filter((el) => {
      return (
        el.team === unit.team &&
        this.getStringByCoordinates(el.position) ===
          this.getStringByCoordinates(unit.position) &&
        el.name !== unit.name
      );
    });

    console.log(teammates);

    if (teammates.length < 1 && enemies.length < 1) {
      this.outputMessages.push(
        `There's no units to attack at the coordinates: ${unit.position.x}, ${unit.position.y}`
      );
    } else if (teammates.length > 1 && enemies.length < 1) {
      this.outputMessages.push(`You cannot attack your friends, dummy!`);
    } else if (enemies.length >= 1) {
      if (unit.type === UnitType.NINJA) {
        enemies.map((enemy) => {
          const damage = unit.getDamage('attacker') - enemy.defense;
          enemy.modifyHealthPoints(-damage);
          damageDealtByAttacker += damage;
        });
      } else {
        const enemy = enemies[Math.floor(Math.random() * enemies.length)];
        console.log(enemy);
        const damageDefender = enemy.getDamage('enemy') - unit.defense;
        console.log(damageDefender);
        const damageAttacker = unit.getDamage('attacker') - enemy.defense;
        console.log(damageAttacker);
        enemy.modifyHealthPoints(-damageAttacker);
        console.log(enemy.healthPoints);
        unit.modifyHealthPoints(-damageDefender);
        console.log(unit.healthPoints);
        damageDealtByDefender += damageDefender;
        damageDealtByAttacker += damageAttacker;
      }
      console.log(enemies);
      const deadUnits = enemies.filter((enemy) => enemy.isDestroyed === true);
      const enemyNames = enemies.map((enemy) => enemy.name).join(' & ');

      if (unit.isDestroyed) {
        deadUnits.push(unit);
      }
      console.log(deadUnits);
      this.outputMessages.push(
        `There was a fierce battle between ${unit.name} and ${enemyNames}.
        The defenders took totally ${damageDealtByAttacker}.
        The attacker took ${damageDealtByDefender}. There are ${deadUnits.length} dead units after the fight was over`
      );
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
