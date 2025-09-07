import { create } from "zustand";
import * as THREE from 'three'
import type { RefObject } from "react";

export interface PlayerState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  animationState: AnimationState;
  health?: number;
  mana?: number;
  class?: string;
  status: 'alive' | 'dead';
  respawnAt: number | null;
  activeStatusEffects: ActiveStatusEffect[];

}

export interface GameStateFromServer {
  players: { [id: string]: PlayerState };
}

export type AnimationState = 'idle' | 'walk' | 'sprint' | 'fall';

interface SocketStore {
  players: { [id: string]: PlayerState };

  setGameState: (newState: GameStateFromServer) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  players: {},

  setGameState: (newState) => set({
    players: newState.players
  }),
}));

interface RefStore {
  playerRef: RefObject<THREE.Group> | null;
  environmentRef: RefObject<THREE.Group> | null;
  setPlayerRef: (ref: RefObject<THREE.Group>) => void;
  setEnvironmentRef: (ref: RefObject<THREE.Group>) => void;
}

export const useRefStore = create<RefStore>((set) => ({
  playerRef: null,
  environmentRef: null,

  setPlayerRef: (ref) => set({ playerRef: ref }),
  setEnvironmentRef: (ref) => set({ environmentRef: ref }),
}));

interface ActionState {
  actions: Record<string, { timestamp: number; abilityId: string }>;
}

interface ActionMethods {
  triggerCast: (playerId: string, abilityId: string) => void;
}

export const useCharacterActionStore = create<ActionState & ActionMethods>((set) => ({
  actions: {},
  triggerCast: (playerId, abilityId) => set((state) => ({
    actions: {
      ...state.actions,
      [playerId]: { timestamp: Date.now(), abilityId: abilityId },
    }
  })),
}));

interface Effect {
  id: string;
  position: THREE.Vector3;
  type: 'impact' | 'shockwave'; 
}

interface EffectState {
  effects: Effect[];
  addEffect: (position: { x: number; y: number; z: number }, type?: Effect['type']) => void;
  removeEffect: (id: string) => void;
}

export const useEffectStore = create<EffectState>((set) => ({
  effects: [],
  addEffect: (position, type = 'impact') => {
    const id = THREE.MathUtils.generateUUID();
    const newEffect = { id, position: new THREE.Vector3(position.x, position.y, position.z), type };
    set((state) => ({ effects: [...state.effects, newEffect] }));
  },
  removeEffect: (id) => {
    set((state) => ({ effects: state.effects.filter((effect) => effect.id !== id) }));
  },
}));


export interface ActiveStatusEffect {
  effectId: string;
  expiresAt: number;
  casterId: string;
}

interface LoadingState {
  isSceneReady: boolean;
  setSceneReady: (isReady: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isSceneReady: false,
  setSceneReady: (isReady) => set({ isSceneReady: isReady }),
}));

interface AbilityState {
  selectedAbilityId: string | null;
  cooldowns: Map<string, number>;
  selectAbility: (abilityId: string) => void;
  startCooldown: (abilityId: string, durationSeconds: number) => void;
  isAbilityOnCooldown: (abilityId: string) => boolean;
}

export const useAbilityStore = create<AbilityState>((set, get) => ({
  selectedAbilityId: null,
  cooldowns: new Map(),

  selectAbility: (abilityId) => {
    if (!get().isAbilityOnCooldown(abilityId)) {
        set({ selectedAbilityId: abilityId });
    }
  },

  startCooldown: (abilityId, durationSeconds) => {
    const newCooldowns = new Map(get().cooldowns);
    newCooldowns.set(abilityId, Date.now() + durationSeconds * 1000);
    set({ cooldowns: newCooldowns });
  },

  isAbilityOnCooldown: (abilityId) => {
    const endTime = get().cooldowns.get(abilityId);
    return endTime ? Date.now() < endTime : false;
  },
}));
