export type AbilityType = 'projectile' | 'melee' | 'self_buff';

export interface BaseAbilityDefinition {
  id: string;
  name: string;
  manaCost: number;
  cooldown: number; 
}

export interface ProjectileAbilityDefinition extends BaseAbilityDefinition {
  type: 'projectile';
  damage: number;
  range: number;
  appliesEffectId?: string;
}

export interface MeleeAbilityDefinition extends BaseAbilityDefinition {
  type: 'melee';
  damage: number;
  shape: { type: 'cone', angle: number, range: number } | { type: 'box', width: number, depth: number };
  appliesEffectId?: string;
}

export interface SelfBuffAbilityDefinition extends BaseAbilityDefinition {
  type: 'self_buff';
  appliesEffectId: string;
}

export interface RadialAoEAbilityDefinition extends BaseAbilityDefinition {
  type: 'radial_aoe'; 
  damage: number;
  radius: number;
  appliesEffectId?: string;
}

export type AbilityDefinition = ProjectileAbilityDefinition | MeleeAbilityDefinition | SelfBuffAbilityDefinition | RadialAoEAbilityDefinition;

export const abilityData = new Map<string, AbilityDefinition>([
  [
    "fireball",
    {
      id: "fireball",
      name: "Kula Ognia",
      type: 'projectile',
      manaCost: 10,
      damage: 15,
      cooldown: 2,
      range: 100.0,
      appliesEffectId: "burn",
    },
  ],
  [
    "groundSlam", 
    {
      id: "groundSlam",
      name: "Uderzenie w Ziemię",
      type: 'radial_aoe', 
      manaCost: 20,
      damage: 15,
      cooldown: 8,
      radius: 3.0 
    }
  ],
  [
    "battleShout",
    {
      id: "battleShout",
      name: "Okrzyk Bojowy",
      type: 'self_buff',
      manaCost: 15,
      cooldown: 20,
      appliesEffectId: "strengthen" 
    }
  ]
]);

