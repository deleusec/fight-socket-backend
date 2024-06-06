import { ICharacter } from "../types/Character";
import { Character } from "./Character";

export class Healer extends Character {
    constructor() {
        super('Healer', 70, 10, 5);
    }

    specialMove(target: ICharacter): void {
        console.log(`${this.name} uses a powerful heal on ${target.name}`);
        target.health += 20;
        console.log(`${target.name} heals for 20 points. Current health: ${target.health}`);
    }
}