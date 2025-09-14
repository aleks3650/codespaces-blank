import RAPIER from "npm:@dimforge/rapier3d-compat";

export interface PlayerInput {
  playerId: string;
  rotation: [number, number, number, number];
  inputs: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
    sprint: boolean;
  };
}

// deno-lint-ignore no-empty-interface
export interface ResetPlayerPayload {}

export type PlayerClass = "Mage" | "Warrior";

export interface PlayerState {
  id: string;
  class: PlayerClass;
  health: number;
  mana: number;
  spellCooldowns: Map<string, number>;
  status: "alive" | "dead";
  respawnAt: number | null;
  resetCooldownEndsAt?: number;
  activeStatusEffects: ActiveStatusEffect[];
  accumulatedDotDamage?: number;
  lastDotFlushTime?: number;
  animationState: AnimationState
}

export interface UseAbilityPayload {
  abilityId: string;
  direction: [number, number, number, number];
}

export interface PlayerAction {
  actionType: "useAbility" | "resetPlayer";
  payload: UseAbilityPayload | ResetPlayerPayload;
}

export type RaycastHitResult =
  | { type: "player"; playerId: string; point: RAPIER.Vector }
  | { type: "world"; point: RAPIER.Vector }
  | { type: "miss" };

export interface LivePlayerState {
  position: RAPIER.Vector;
  rotation: RAPIER.Quaternion;
  health: number;
  mana: number;
  class: PlayerClass;
  status: "alive" | "dead";
  respawnAt: number | null;
  animationState: AnimationState
}

export interface ActiveStatusEffect {
  effectId: string;
  expiresAt: number;
  casterId: string;
}

export type AnimationState = "idle" | "walk" | "sprint" | "fall";

