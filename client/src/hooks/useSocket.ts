import { useEffect } from "react";
import { socket } from "../socket/socket";
import { useSocketStore } from "../state/Store";

export function useSocketConnect() {
  const { setTick, setTime } = useSocketStore();

  useEffect(() => {
    function onConnect() {
      console.log("Hook: Połączono, ID:", socket.id);
    }

    function onDisconnect() {
      console.log("Hook: Rozłączono");
    }

    function onGameState(value: { tick: number; time: string; }) {
      setTick(value.tick);
      setTime(value.time)
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("gameState", onGameState); 


    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("gameState", onGameState); 
    };
  }, [setTick, setTime]); 

  return {};
}