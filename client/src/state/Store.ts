import { create } from "zustand";
import type { Vector, Quaternion } from "@dimforge/rapier3d-compat";
import * as THREE from 'three'
import type { RefObject } from "react";

export interface PlayerState {
    position: Vector;
    rotation: Quaternion;
}

export interface GameStateFromServer {
    players: { [id: string]: PlayerState };
}

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