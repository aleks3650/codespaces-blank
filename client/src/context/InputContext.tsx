
import React, { createContext, useContext } from "react";
import { useInputControls as useOriginalInputControls } from "../hooks/useInputControls";
import type { InputAction } from "../hooks/useInputControls";

type InputState = Record<InputAction, boolean>;

// Tworzymy kontekst z wartością domyślną null
const InputContext = createContext<React.RefObject<InputState> | null>(null);

// Komponent Provider, który będzie zarządzał stanem inputu
export const InputControlsProvider = ({ children }: { children: React.ReactNode }) => {
  // Wywołujemy Twój hook w jednym, centralnym miejscu
  const inputRef = useOriginalInputControls();
  
  return (
    <InputContext.Provider value={inputRef}>
      {children}
    </InputContext.Provider>
  );
};

// Własny hook do wygodnego konsumowania kontekstu
export const useInputContext = () => {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error("useInputContext must be used within an InputControlsProvider");
  }
  return context;
};