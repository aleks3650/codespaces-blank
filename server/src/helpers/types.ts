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
interface InventorySlot {
  itemId: string;
  quantity: number;
}

// deno-lint-ignore no-empty-interface
export interface ResetPlayerPayload { }

export type PlayerClass = "Mage" | "Warrior";

export interface UseItemPayload {
    inventorySlot: number; 
}

export interface PlayerState {
  id: string;
  class: PlayerClass;
  health: number;
  mana: number;
  spellCooldowns: Map<string, number>;
  status: "alive" | "dead";
  respawnAt: number | null;
  inventory: InventorySlot[];
  consumableCooldownEndsAt?: number;
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
  actionType: "useAbility" | "resetPlayer" | "useItem";
  payload: UseAbilityPayload | ResetPlayerPayload | UseItemPayload;
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
  animationState: AnimationState;
  inventory: InventorySlot[];
}

export interface ActiveStatusEffect {
  effectId: string;
  expiresAt: number;
  casterId: string;
}

export type AnimationState = "idle" | "walk" | "sprint" | "fall";

