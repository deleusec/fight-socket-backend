export type CharacterType = 'Warrior' | 'Mage' | 'Archer' | 'Healer';

export interface ICharacter {
  name: string;
  health: number;
  attackPower: number;
  defense: number;
  takeDamage(amount: number): void;
  attack(target: ICharacter): void;
  heal(): void;
  specialMove(target: ICharacter): void;
}