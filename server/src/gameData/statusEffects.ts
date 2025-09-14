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
  ["strengthen", {
    id: "strengthen",
    duration: 10,
    // statModifiers: { damageMultiplier: 1.2 }
  }],
  ["well_fed", {
    id: "well_fed",
    duration: 30, 
  }],
]);

