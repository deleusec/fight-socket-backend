import { ICharacter } from "../types/Character";
import { Character } from "./Character";

export class Mage extends Character {
    constructor() {
      super('Mage', 80, 20, 3);
    }
  
    specialMove(target: ICharacter): void {
      console.log(`${this.name} casts a fire spell on ${target.name}`);
      target.takeDamage(this.attackPower * 1.5);
    }
  }
  