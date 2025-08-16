
import React, { createContext, useContext } from "react";
import { useInputControls as useOriginalInputControls } from "../hooks/useInputControls";
import type { InputAction } from "../hooks/useInputControls";

type InputState = Record<InputAction, boolean>;

const InputContext = createContext<React.RefObject<InputState> | null>(null);

export const InputControlsProvider = ({ children }: { children: React.ReactNode }) => {
  const inputRef = useOriginalInputControls();
  
  return (
    <InputContext.Provider value={inputRef}>
      {children}
    </InputContext.Provider>
  );
};

export const useInputContext = () => {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error("useInputContext must be used within an InputControlsProvider");
  }
  return context;
};