import { Component, ElementRef, ViewChild } from '@angular/core';
import { Resource } from 'src/classes/Resource';
import { Unit } from 'src/classes/Unit';
import { Position, ResourceType, Team, UnitType } from 'src/models/models';
import {
  areCoordinatesValid,
  getCoordinatesByString,
  getStringByCoordinates,
  getWinner,
  isPositionClear,
  showCoordinateInfo,
  showResources,
  showTeamMembers,
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

  executeCommand(): void {
    const commands = this.inputArea.nativeElement.value.split(' ');
    console.log(this.resources);

    console.log(commands);

    const command = commands[0].toUpperCase();
    switch (command) {
      case 'CREATE':
        this.createObject(commands);
        break;
      case 'ORDER':
        this.orderUnit(commands);
        break;
      case 'SHOW':
        this.show(commands);
        break;
      case 'END':
        this.calcPoints();
        this.outputMessages.push('-----------------END-GAME-----------------');
        this.outputMessages.push(getWinner(this.teamPointsCount));
        this.outputMessages.push('-----------------END-GAME-----------------');
        break;
      default:
        this.outputMessages.push('Please enter a valid command');
        break;
    }
  }

  public orderUnit(commands: string[]): void {
    const unit = this.units.find(
      (el) => el.name.toUpperCase() === commands[1].toUpperCase()
    );

    if (unit) {
      switch (commands[2].toUpperCase()) {
        case 'ATTACK':
          this.attack(unit);
          break;

        case 'GATHER':
          this.gatherResource(unit);
          break;
        case 'GO':
          this.go(commands[3], unit);
          break;
        default:
          this.outputMessages.push('Enter a valid order command');
          break;
      }
    } else {
      this.outputMessages.push(`Unit does not exist!`);
    }
  }

  private show(commands: string[]): void {
    const showCommand = commands[1].toUpperCase();
    if (showCommand === 'ALL') {
      this.showAll();
    } else if (showCommand === 'UNITS') {
      this.outputMessages.push(
        showTeamMembers(commands[2].toUpperCase(), this.units)
      );
    } else if (showCommand === 'RESOURCES') {
      this.outputMessages.push(showResources(this.resources));
    } else if (areCoordinatesValid(showCommand)) {
      this.outputMessages.push(showCoordinateInfo(showCommand, this.units));
    } else {
      this.outputMessages.push(`Please enter a valid command or coordinates`);
    }
  }

  private createObject(commands: string[]): void {
    const objectType = commands[1].toUpperCase();
    if (areCoordinatesValid(commands[3])) {
      switch (objectType) {
        case 'UNIT':
          this.createUnit(commands);
          break;
        case 'RESOURCES':
          this.createResource(commands.slice(-3));
          break;
        default:
          this.outputMessages.push('Please enter a valid creation command');
          break;
      }
    } else {
      const message = 'Please enter valid coordinates!';
      this.outputMessages.push(message);
    }
  }

  private attack(unit: Unit): void {
    let damageDealtByAttacker = 0;
    let damageDealtByDefender = 0;

    const enemies = this.units.filter((enemy) => {
      return (
        getStringByCoordinates(enemy.position) ===
          getStringByCoordinates(unit.position) && enemy.team !== unit.team
      );
    });

    const teammates = this.units.filter((el) => {
      return (
        el.team === unit.team &&
        getStringByCoordinates(el.position) ===
          getStringByCoordinates(unit.position) &&
        el.name !== unit.name
      );
    });

    if (teammates.length < 1 && enemies.length < 1) {
      this.outputMessages.push(
        `There's no units to attack at the coordinates: ${unit.position.x}, ${unit.position.y}`
      );
    } else if (teammates.length >= 1 && enemies.length < 1) {
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

        const damageDefender = enemy.getDamage('enemy') - unit.defense;

        const damageAttacker = unit.getDamage('attacker') - enemy.defense;

        enemy.modifyHealthPoints(-damageAttacker);

        unit.modifyHealthPoints(-damageDefender);

        damageDealtByDefender += damageDefender;

        damageDealtByAttacker += damageAttacker;
      }

      const deadUnits = enemies.filter((enemy) => enemy.isDestroyed === true);
      const enemyNames = enemies.map((enemy) => enemy.name).join(' & ');

      if (unit.isDestroyed) {
        deadUnits.push(unit);
      }
      this.removeUnit();
      this.outputMessages.push(
        `There was a fierce battle between ${unit.name} from team ${unit.team} and ${enemyNames} from the enemy team.
        The defenders took totally ${damageDealtByAttacker} damage.
        The attacker took ${damageDealtByDefender} damage. There are ${deadUnits.length} dead units after the fight was over`
      );
    }
  }

  private createUnit(commands: string[]): void {
    const name = commands[2].toUpperCase();
    const coordinates: Position = getCoordinatesByString(commands[3]);
    const team: Team = <Team>commands[4].toUpperCase();
    const unitType: UnitType = <UnitType>commands[5].toUpperCase();

    if (this.units.find((el) => el.name === name)) {
      this.outputMessages.push('Unit with this name already exists!');
    } else if (!(team in Team)) {
      this.outputMessages.push(`Team ${team.toLowerCase()} does not exist!`);
    } else if (!(unitType in UnitType)) {
      this.outputMessages.push(
        `Unit type ${unitType.toLowerCase()} is not valid!`
      );
    } else {
      const unit = new Unit(coordinates, team, name, unitType);
      this.units.push(unit);
      this.outputMessages.push(
        `Created ${unitType} from ${team
          .toString()
          .toLowerCase()} team named ${name} at position ${getStringByCoordinates(
          coordinates
        )}`
      );
    }
  }

  private createResource(input: string[]): void {
    const resourceName = <ResourceType>input[0].toUpperCase();
    const isLegitResource = resourceName in ResourceType;
    const coordinates = getCoordinatesByString(input[1]);
    const quantity = Number(input[2]);

    if (Number.isNaN(quantity) || quantity < 1) {
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

  private gatherResource(unit: Unit): void {
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
          }. Team ${unit.team} now has ${
            this.teamResourceCount[unit.team].FOOD
          } food, ${this.teamResourceCount[unit.team].LUMBER} lumber and ${
            this.teamResourceCount[unit.team].IRON
          } iron.`;
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

  private go(coordinates: string, unit: Unit): void {
    const inputCoordinates = getCoordinatesByString(coordinates);
    if (!areCoordinatesValid(coordinates)) {
      this.outputMessages.push(`Please enter valid coordinates!`);
    } else if (coordinates === getStringByCoordinates(unit.position)) {
      this.outputMessages.push(`Can't move to the same position!`);
    } else {
      unit.modifyPosition(inputCoordinates);
      this.outputMessages.push(
        `${unit.name} moved to ${inputCoordinates.x},${inputCoordinates.y}`
      );
    }
  }

  private removeResource(): void {
    this.resources.forEach((el, index) => {
      if (el.isDestroyed) {
        this.resources.splice(index, 1);
      }
    });
  }

  private removeUnit(): void {
    this.units.forEach((el, index) => {
      if (el.isDestroyed) {
        this.units.splice(index, 1);
      }
    });
  }

  private showAll(): void {
    this.outputMessages.push(showTeamMembers(Team.BLUE, this.units));
    this.outputMessages.push(showTeamMembers(Team.RED, this.units));
    this.outputMessages.push(showResources(this.resources));
  }

  private calcPoints(): void {
    for (const team of Object.keys(this.teamPointsCount)) {
      const currentTeam = this.units.filter(
        (el) => el.team === team.toUpperCase()
      );

      let points: number = 0;

      for (const unit of currentTeam) {
        if (unit.type === UnitType.PEASANT) {
          points += 5;
        } else if (unit.type === UnitType.GUARD) {
          points += 10;
        } else if (
          unit.type === UnitType.NINJA ||
          unit.type === UnitType.GIANT
        ) {
          points += 15;
        }
      }

      for (const key in this.teamResourceCount[team]) {
        points += this.teamResourceCount[team][key] * 10;
      }
      this.teamPointsCount[team] = points;
    }
  }
}
