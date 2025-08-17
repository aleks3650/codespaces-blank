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

export type AnimationState = 'idle' | 'walk' | 'sprint';

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
  lastActionTimestamp: number | null;
}

interface ActionMethods {
  triggerCast: () => void;
}

export const useCharacterActionStore = create<ActionState & ActionMethods>((set) => ({
  lastActionTimestamp: null,
  triggerCast: () => set({ lastActionTimestamp: Date.now() }), 
}))

interface Effect {
  id: string;
  position: THREE.Vector3;
}

interface EffectState {
  effects: Effect[];
  addEffect: (position: { x: number; y: number; z: number }) => void;
  removeEffect: (id: string) => void;
}

export const useEffectStore = create<EffectState>((set) => ({
  effects: [],
  addEffect: (position) => {
    const id = THREE.MathUtils.generateUUID();
    const newEffect = { id, position: new THREE.Vector3(position.x, position.y, position.z) };
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