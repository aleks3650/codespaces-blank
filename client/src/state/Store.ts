import { create } from "zustand";
import * as THREE from 'three'
import type { RefObject } from "react";

export type SelectedAction =
  | { type: 'ability'; id: string }
  | { type: 'item'; id: string; inventorySlot: number };

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

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
  inventory?: InventorySlot[];
}

export interface GameStateFromServer {
  players: { [id: string]: PlayerState };
}

export type AnimationState = 'idle' | 'walk' | 'sprint' | 'fall';

export interface ActiveStatusEffect {
  effectId: string;
  expiresAt: number;
  casterId: string;
}

// --- STORE'Y ZUSTAND ---

// Przechowuje stan gry otrzymywany z serwera
export interface SocketStore {
  players: { [id: string]: PlayerState };
  setGameState: (newState: GameStateFromServer) => void;
}
export const useSocketStore = create<SocketStore>((set) => ({
  players: {},
  setGameState: (newState) => set({ players: newState.players }),
}));


// Przechowuje referencje do obiektów 3D w scenie
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


// Uruchamia animacje akcji (ataku, użycia przedmiotu)
interface CharacterActionState {
  actions: Record<string, { timestamp: number; abilityId: string }>;
  triggerCast: (playerId: string, abilityId: string) => void;
}
export const useCharacterActionStore = create<CharacterActionState>((set) => ({
  actions: {},
  triggerCast: (playerId, abilityId) => set((state) => ({
    actions: { ...state.actions, [playerId]: { timestamp: Date.now(), abilityId } },
  })),
}));


// Zarządza efektami wizualnymi (np. eksplozje)
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
    const newEffect = { id: THREE.MathUtils.generateUUID(), position: new THREE.Vector3(position.x, position.y, position.z), type };
    set((state) => ({ effects: [...state.effects, newEffect] }));
  },
  removeEffect: (id) => set((state) => ({ effects: state.effects.filter((effect) => effect.id !== id) })),
}));


// Zarządza stanem ładowania sceny
interface LoadingState {
  isSceneReady: boolean;
  setSceneReady: (isReady: boolean) => void;
}
export const useLoadingStore = create<LoadingState>((set) => ({
  isSceneReady: false,
  setSceneReady: (isReady) => set({ isSceneReady: isReady }),
}));


// NOWY, ZUNIFIKOWANY STORE DO ZARZĄDZANIA AKCJAMI I COOLDOWNAMI
interface ActionStore {
  selectedAction: SelectedAction | null;
  abilityCooldowns: Map<string, number>;
  consumableCooldownEndsAt: number;
  
  selectAction: (action: SelectedAction | null) => void;
  startAbilityCooldown: (abilityId: string, durationSeconds: number) => void;
  startConsumableCooldown: (durationMs: number) => void;
  isAbilityOnCooldown: (abilityId: string) => boolean;
}

export const useActionStore = create<ActionStore>((set, get) => ({
  selectedAction: null,
  abilityCooldowns: new Map(),
  consumableCooldownEndsAt: 0,

  selectAction: (action) => {
    // if (action?.type === 'ability' && get().isAbilityOnCooldown(action.id)) {
    //   // Opcjonalnie: powiadomienie, że nie można wybrać, bo jest na cooldownie
    //   return;
    // }
    set({ selectedAction: action });
  },

  startAbilityCooldown: (abilityId, durationSeconds) => {
    const newCooldowns = new Map(get().abilityCooldowns);
    newCooldowns.set(abilityId, Date.now() + durationSeconds * 1000);
    set({ abilityCooldowns: newCooldowns });
  },

  startConsumableCooldown: (durationMs) => {
    set({ consumableCooldownEndsAt: Date.now() + durationMs });
  },

  isAbilityOnCooldown: (abilityId) => {
    const endTime = get().abilityCooldowns.get(abilityId);
    return endTime ? Date.now() < endTime : false;
  },
}));