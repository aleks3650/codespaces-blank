export interface SpellDefinition {
  id: string;
  manaCost: number;
  damage: number;
  cooldown: number; 
  range: number;
  appliesEffectId?: string;
}

export const spellData = new Map<string, SpellDefinition>([
  [
    "fireball",
    {
      id: "fireball",
      manaCost: 10,
      damage: 15, 
      cooldown: 2,
      range: 100.0,
      appliesEffectId: "burn", 
    },
  ],
  [
    "arcaneMissile",
    {
      id: "arcaneMissile",
      manaCost: 5,
      damage: 8,
      cooldown: 0.5,
      range: 80.0,
    },
  ],
]);