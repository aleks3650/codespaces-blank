import { create } from "zustand";
import type { Vector, Quaternion } from "@dimforge/rapier3d-compat";

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