import * as THREE from 'three';
import type { ActionName, AnimationStore } from '../models/Character';
import type { WeaponConfig } from '../config/weaponConfig';
import type { AnimationState } from '../state/Store';

interface UseCharacterAnimationsParams {
  actions: AnimationStore;
  activeAction: React.MutableRefObject<ActionName>;
  playerRef: React.RefObject<THREE.Group>;
  lastAction: { timestamp: number; actionId: string } | undefined;
  config: WeaponConfig;
  status: 'alive' | 'dead';
  animationState: AnimationState;
}

export const useCharacterAnimations = ({
  actions,
  activeAction,
  playerRef,
  lastAction,
  config,
  status,
  animationState,
}: UseCharacterAnimationsParams) => {
  let targetAction: ActionName;

  if (lastAction && playerRef.current && lastAction.timestamp > (playerRef.current as any)._lastProcessedAction) {
    const { actionId } = lastAction;

    let animName = config.abilityAnimations[actionId];
    if (!animName) {
      animName = config.genericAnimations[actionId];
    }

    targetAction = (animName || config.attackAnimation) as ActionName;

    (playerRef.current as any)._lastProcessedAction = lastAction.timestamp;
  } else {
    const currentActionAnimation = actions[activeAction.current];
    if (currentActionAnimation?.isRunning() && (activeAction.current.includes('attack') || activeAction.current.includes('interact'))) {
      targetAction = activeAction.current;
    } else {
      const serverState = status === 'dead' ? 'die' : animationState;
      targetAction = serverState.toLowerCase() as ActionName;
    }
  }

  if (activeAction.current !== targetAction) {
    const oldAction = actions[activeAction.current];
    const newAction = actions[targetAction];

    if (!newAction) {
      console.warn(`Animacja o nazwie "${targetAction}" nie została znaleziona!`);
      return;
    }

    oldAction?.fadeOut(0.2);
    newAction.reset().fadeIn(0.2).play();

    if (targetAction === 'die' || targetAction.includes('attack') || targetAction.includes('interact') || targetAction.includes('emote')) {
      newAction.setLoop(THREE.LoopOnce, 1);
      newAction.clampWhenFinished = true;
    } else {
      newAction.setLoop(THREE.LoopRepeat, Infinity);
    }

    activeAction.current = targetAction;
  }
};