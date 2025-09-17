import { useEffect } from "react";
import { socket } from "../socket/socket";
import * as THREE from 'three';
import {
  type GameStateFromServer,
  useCharacterActionStore,
  useEffectStore,
  useSocketStore,
} from "../state/Store";
import { useFloatingTextStore } from "../state/FloatingTextStore";
import { useNotificationStore } from "../state/NotificationStore";

interface GameEvent {
  type: string;
  payload: any;
}

export function useSocketConnect(selectedClass: string) {

  const setGameState = useSocketStore((state) => state.setGameState);
  const addEffect = useEffectStore((state) => state.addEffect);
  const addFloatingText = useFloatingTextStore((state) => state.addText);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const triggerAction = useCharacterActionStore((state) => state.triggerAction);

  useEffect(() => {
    socket.auth = { playerClass: selectedClass };

    socket.connect();

    const showDamageNumber = (payload: any) => {
      if (!payload.position) return;
      const basePosition = new THREE.Vector3(payload.position.x, payload.position.y, payload.position.z);
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.1) * 0.25,
        0,
        (Math.random() - 0.1) * 0.25
      );
      const finalPosition = basePosition.add(randomOffset);
      addFloatingText({
        position: finalPosition,
        text: payload.damage.toString(),
        color: 'red',
        fontSize: Math.min(Math.max(payload.damage * 0.005, 0.03), 0.06)
      });
    };

    const onGameEvents = (events: GameEvent[]) => {
      for (const event of events) {
        switch (event.type) {
          case 'area-effect-triggered':
            if (event.payload.effectId === 'groundSlam') {
              addEffect(event.payload.position, 'shockwave');
            } else if (event.payload.effectId === 'spellImpact') {
              addEffect(event.payload.position, 'impact');
            }
            break;

          case 'player-damaged':
            showDamageNumber(event.payload);
            break;

          case 'player-cast-spell':
            triggerAction(event.payload.casterId, event.payload.spellId);
            break;

          case 'action-on-cooldown':
            if (event.payload.actionType === 'resetPlayer') {
              const seconds = Math.ceil(event.payload.remainingMs / 1000);
              addNotification(`Reset is on cooldown (${seconds}s left)`, 'error');
            }
            if (event.payload.actionType === 'consumable') {
              const seconds = Math.ceil(event.payload.remainingMs / 1000);
              addNotification(`Items are on cooldown (${seconds}s left)`, 'error');
            }
            break;

          case 'spell-on-cooldown':
            addNotification("Ability is not ready!", 'error');
            break;

          case 'player-reset-started':
            if (event.payload.playerId === socket.id) {
              addNotification("Restarting in 3 seconds...", 'info');
            }
            break;

          case 'spell-cast-failed':
            if (event.payload.reason === 'not_enough_mana') {
              addNotification("Not enough mana", 'info');
            }
            break;

          case 'status-effect-gained':
            if (event.payload.targetId === socket.id) {
              addNotification(`Affected by: ${event.payload.effectId}`, 'info');
            }
            break;
        }
      }
    };

    const onGameState = (data: GameStateFromServer) => setGameState(data);
    const onConnect = () => console.log("Hook: Connected, ID:", socket.id);
    const onDisconnect = () => console.log("Hook: Disconnected");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("gameState", onGameState);
    socket.on("game-events", onGameEvents);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("gameState", onGameState);
      socket.off("game-events", onGameEvents);
      socket.disconnect();
    };
  }, [setGameState, addEffect, addFloatingText, addNotification, triggerAction]);

  return {};
}