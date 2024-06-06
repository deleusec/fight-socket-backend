import { ICharacter } from "../types/Character";
import { Character } from "./Character";

export class Warrior extends Character {
    constructor() {
      super('Warrior', 100, 15, 5);
    }
  
    specialMove(target: ICharacter): void {
      console.log(`${this.name} uses a special attack on ${target.name}`);
      target.takeDamage(this.attackPower * 2);
    }
  }