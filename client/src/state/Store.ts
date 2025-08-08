import { create } from "zustand";

interface SocketState {
  tick: number | null;
  time: string | null;
  setTick: (tick: number) => void;
  setTime: (time: string) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  tick: null,
  time: null,
  setTick: (tick) => set({ tick: tick }),
  setTime: (time) => set({ time: time }),
}));