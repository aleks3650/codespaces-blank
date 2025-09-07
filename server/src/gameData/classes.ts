export const classData = new Map<string, { baseHealth: number; baseMana: number; abilities: string[] }>([
  ["Mage", { baseHealth: 100, baseMana: 150, abilities: ["fireball", "arcaneMissile"] }],
  ["Warrior", { baseHealth: 150, baseMana: 50, abilities: ["groundSlam", "battleShout"] }],
]);