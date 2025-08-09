import { create } from "zustand";

export interface PlayerState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
}

export interface GameState {
  tick: number;
  time: string;
  players: Record<string, PlayerState>;
}

interface SocketStore {
  gameState: GameState;
  setGameState: (newState: GameState) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  gameState: {
    tick: 0,
    time: new Date().toISOString(),
    players: {}, 
  },
  setGameState: (newState) => set({ gameState: newState }),
}));