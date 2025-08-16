import * as THREE from 'three';
import { useMemo, useRef, useEffect } from 'react';
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

const PLAYER_HEIGHT_OFFSET = -0.2;

const LocalPlayer = () => {
  const localPlayerState = useSocketStore((state) => state.players[socket.id!]);
  const inputRef = useInputContext();

  const playerRef = useRef<THREE.Group>(null!);

  const setPlayerRef = useRefStore((state) => state.setPlayerRef);

  useEffect(() => {
    setPlayerRef(playerRef);
    return () => setPlayerRef(null!);
  }, [setPlayerRef]);

  const { scene, animations } = useGLTF('/character.glb') as unknown as GLTFResult;
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;

  const currentAction = useRef<PlayerAction>('idle');
  const { actions, mixer } = useAnimations(animations, playerRef);

  const lastActionTimestamp = useCharacterActionStore((state) => state.lastActionTimestamp);


  useEffect(() => {
    if (!lastActionTimestamp) return;

    const action = actions['interact-right'];
    if (!action) return;

    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;

    const currentMovementAction = actions[currentAction.current];
    if (currentMovementAction) {
      currentMovementAction.fadeOut(0.2);
    }
    action.fadeIn(0.1).play();

    const onFinished = () => {
      action.fadeOut(0.2);
      const nextMovementAction = actions[currentAction.current];
      if (nextMovementAction) {
        nextMovementAction.reset().fadeIn(0.2).play();
      }
      mixer.removeEventListener('finished', onFinished);
    };
    mixer.addEventListener('finished', onFinished);
  }, [lastActionTimestamp, actions, mixer]);

  useFrame(() => {
    if (!localPlayerState || !playerRef.current || !inputRef.current) return;

    const { forward, backward, left, right, sprint } = inputRef.current;
    let newAction: PlayerAction = 'idle';
    if (forward || backward || left || right) {
      newAction = sprint ? 'sprint' : 'walk';
    }

    if (currentAction.current !== newAction) {
      const oldAction = actions[currentAction.current];
      const nextAction = actions[newAction];
      oldAction?.fadeOut(0.2);
      nextAction?.reset().fadeIn(0.2).play();
      currentAction.current = newAction;
    }

    targetPosition.set(
      localPlayerState.position.x,
      localPlayerState.position.y,
      localPlayerState.position.z,
    );
    playerRef.current.position.lerp(targetPosition, LERP_FACTOR);
  });

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