import * as THREE from 'three';
import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

import { useRefStore, useSocketStore } from '../state/Store'; 
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
  const { actions } = useAnimations(animations, playerRef);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const action = actions[currentAction.current];
        if (action) {
          action.reset().fadeIn(0.2).play();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [actions]); 

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