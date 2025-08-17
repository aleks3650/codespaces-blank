export interface StatusEffectDefinition {
  id: string;
  duration: number;
  damagePerSecond?: number;
}

export const statusEffectData = new Map<string, StatusEffectDefinition>([
  [
    "burn",
    {
      id: "burn",
      duration: 5, 
      damagePerSecond: 2,
    },
  ],
]);