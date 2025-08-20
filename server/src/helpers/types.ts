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

export type PlayerClass = "Mage" | "Warrior";

export interface PlayerState {
  id: string;
  class: PlayerClass;
  health: number;
  mana: number;
  spellCooldowns: Map<string, number>;
  status: "alive" | "dead";
  respawnAt: number | null;
  activeStatusEffects: ActiveStatusEffect[];
  accumulatedDotDamage?: number;
  lastDotFlushTime?: number;
}

export interface CastSpellPayload {
  spellId: string;
  direction: [number, number, number, number];
}

export interface PlayerAction {
  actionType: "castSpell";
  payload: CastSpellPayload;
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
}

export interface ActiveStatusEffect {
  effectId: string;
  expiresAt: number;
  casterId: string;
}