
import { ICharacter } from '../types/Character';

export class Character implements ICharacter {
  name: string;
  health: number;
  attackPower: number;
  defense: number;

  constructor(name: string, health: number, attackPower: number, defense: number) {
    this.name = name;
    this.health = health;
    this.attackPower = attackPower;
    this.defense = defense;
  }

  takeDamage(amount: number): void {
    const damage = Math.max(0, amount - this.defense);
    this.health = Math.max(0, this.health - damage);
    console.log(`${this.name} takes ${damage} damage. Remaining health: ${this.health}`);
  }

  attack(target: ICharacter): void {
    console.log(`${this.name} attacks ${target.name}`);
    target.takeDamage(this.attackPower);
  }

  heal(): void {
    const healAmount = 10; // Example heal amount
    this.health += healAmount;
    console.log(`${this.name} heals for ${healAmount} points. Current health: ${this.health}`);
  }

  specialMove(target: ICharacter): void {
    // Default special move
  }
}