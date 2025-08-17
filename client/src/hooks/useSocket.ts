import { useEffect } from "react";
import { socket } from "../socket/socket";
import { type GameStateFromServer, useSocketStore } from "../state/Store";

export function useSocketConnect() {
  const setGameState = useSocketStore((state) => state.setGameState);

  useEffect(() => {
    function onConnect() {
      console.log("Hook: Connected, ID:", socket.id);
    }

    function onDisconnect() {
      console.log("Hook: Rozłączono");
    }

    const onGameState = (data: GameStateFromServer) => {
      if (data.players[socket.id!]?.status === 'dead') {
        console.log("Received game state for dead player:", data.players[socket.id!]);
      }
      setGameState(data);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("gameState", onGameState);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("gameState", onGameState);
    };
  }, [setGameState]);

  return {};
}
