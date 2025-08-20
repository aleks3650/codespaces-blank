import { create } from 'zustand';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

export interface FloatingTextData {
  id: string;
  text: string;
  position: THREE.Vector3;
  color?: string;
  fontSize?: number;
}

interface FloatingTextState {
  texts: FloatingTextData[];
  addText: (data: Omit<FloatingTextData, 'id'>) => void;
  removeText: (id: string) => void;
}

export const useFloatingTextStore = create<FloatingTextState>((set) => ({
  texts: [],
  addText: (data) => {
    const newText: FloatingTextData = {
      id: uuidv4(),
      ...data,
    };
    set((state) => ({ texts: [...state.texts, newText] }));
  },
  removeText: (id: string) => {
    set((state) => ({ texts: state.texts.filter((t) => t.id !== id) }));
  },
}));