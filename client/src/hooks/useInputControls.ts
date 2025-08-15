import { useEffect, useRef } from "react";

export type InputAction =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "jump"
  | "sprint"  
  | "cameraFlip";

type InputState = Record<InputAction, boolean>;

type KeyCode =
  | "KeyW"
  | "KeyS"
  | "KeyA"
  | "KeyD"
  | "Space"
  | "ShiftLeft"
  | "ShiftRight"
  | "KeyC";

const keyActionMap = {
  KeyW: "forward",
  KeyS: "backward",
  KeyA: "left",
  KeyD: "right",
  Space: "jump",
  ShiftLeft: "sprint",
  ShiftRight: "sprint",
  KeyC: "cameraFlip",
} as const satisfies Record<KeyCode, InputAction>;

export const useInputControls = () => {
  const inputRef = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    cameraFlip: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = keyActionMap[e.code as KeyCode];
      if (!action) return;
      if (!e.repeat) inputRef.current[action] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const action = keyActionMap[e.code as KeyCode];
      if (!action) return;
      inputRef.current[action] = false;
    };

    const handleBlur = () => {
      (Object.keys(inputRef.current) as InputAction[]).forEach((k) => {
        inputRef.current[k] = false;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return inputRef; 
};
