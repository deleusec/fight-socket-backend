import { ICharacter } from "../types/Character";
import { Character } from "./Character";

export class Archer extends Character {
    constructor() {
        super('Archer', 90, 18, 4);
    }

    specialMove(target: ICharacter): void {
        console.log(`${this.name} uses a piercing arrow on ${target.name}`);
        target.takeDamage(this.attackPower * 1.7);
    }
}