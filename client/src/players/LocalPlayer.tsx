import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

import { useCharacterActionStore, useRefStore, useSocketStore } from '../state/Store';
import { socket } from '../socket/socket';
import { CharacterModel } from '../models/Character';
import type { GLTFResult } from '../models/Character';
import { useInputContext } from '../context/InputContext';

const targetPosition = new THREE.Vector3();
const LERP_FACTOR = 0.2;

type PlayerAction = 'idle' | 'walk' | 'sprint';
type ActionName = PlayerAction | 'die' | 'interact-right';

const PLAYER_HEIGHT_OFFSET = -0.2;

const LocalPlayer = () => {
  const localPlayerState = useSocketStore((state) => state.players[socket.id!]);
  const inputRef = useInputContext();
  const playerRef = useRef<THREE.Group>(null!);
  const setPlayerRef = useRefStore((state) => state.setPlayerRef);
  const lastActionTimestamp = useCharacterActionStore((state) => state.lastActionTimestamp);

  const { scene, animations } = useGLTF('/character.glb') as unknown as GLTFResult;
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;
  const { actions, mixer } = useAnimations(animations, playerRef);

  const currentAction = useRef<ActionName>('idle');

  useFrame(() => {
    if (!localPlayerState || !playerRef.current || !inputRef.current) return;

    targetPosition.set(
      localPlayerState.position.x,
      localPlayerState.position.y,
      localPlayerState.position.z,
    );
    playerRef.current.position.lerp(targetPosition, LERP_FACTOR);

    let targetActionName: ActionName;
    const spellCastAction = actions['interact-right'];

    if (localPlayerState.status === 'dead') {
      targetActionName = 'die';
    } else if (spellCastAction?.isRunning()) {
      targetActionName = 'interact-right';
    } else {
      const { forward, backward, left, right, sprint } = inputRef.current;
      if (forward || backward || left || right) {
        targetActionName = sprint ? 'sprint' : 'walk';
      } else {
        targetActionName = 'idle';
      }
    }

    if (currentAction.current !== targetActionName) {
      const oldAction = actions[currentAction.current];
      const newAction = actions[targetActionName];

      oldAction?.fadeOut(0.2);

      if (newAction) {
        newAction.reset().fadeIn(0.2).play();

        if (targetActionName === 'die' || targetActionName === 'interact-right') {
          newAction.setLoop(THREE.LoopOnce, 1);
          newAction.clampWhenFinished = true;
        } else {
          newAction.setLoop(THREE.LoopRepeat, Infinity);
        }
      }

      currentAction.current = targetActionName;
    }
  });

  useMemo(() => {
    if (!lastActionTimestamp) return;

    const action = actions['interact-right'];
    if (action) {
      action.reset().play();
    }
  }, [lastActionTimestamp, actions, mixer]);

  useEffect(() => {
    setPlayerRef(playerRef);
    actions.idle?.play(); 
    return () => setPlayerRef(null!);
  }, [setPlayerRef, actions.idle]);

  useGLTF.preload('/character.glb');

  if (!localPlayerState) return null;

  return (
    <group ref={playerRef}>
      <group position-y={PLAYER_HEIGHT_OFFSET}>
        <CharacterModel nodes={nodes} materials={materials} />
      </group>
    </group>
  );
};

export default LocalPlayer;