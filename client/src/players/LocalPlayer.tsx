// src/players/LocalPlayer.tsx

import * as THREE from 'three';
import React, { forwardRef, useMemo, useRef, useEffect } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

import { useSocketStore } from '../state/Store';
import { socket } from '../socket/socket';
import { CharacterModel } from '../models/Character';
import type { GLTFResult } from '../models/Character';
import { useInputContext } from '../context/InputContext';

const targetPosition = new THREE.Vector3();
const LERP_FACTOR = 0.2;

type PlayerAction = 'idle' | 'walk' | 'sprint';

// ===== ROZWIĄZANIE PROBLEMU 1: Wysokość postaci =====
// Ta stała MUSI być równa połowie wysokości kapsuły zdefiniowanej w PlayerController.ts na serwerze.
// `RAPIER.ColliderDesc.capsule(0.15, 0.05)` -> halfHeight = 0.15
const PLAYER_HEIGHT_OFFSET = -0.2;

const LocalPlayer = forwardRef<THREE.Group>((_props, ref) => {
  const localPlayerState = useSocketStore((state) => state.players[socket.id!]);
  const inputRef = useInputContext();

  const { scene, animations } = useGLTF('/character.glb') as unknown as GLTFResult;
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;

  const currentAction = useRef<PlayerAction>('idle');
  const { actions } = useAnimations(animations, ref as React.RefObject<THREE.Group>);

  // ===== ROZWIĄZANIE PROBLEMU 2: Zatrzymane animacje =====
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Gdy wracamy do karty, zresetuj i odtwórz bieżącą animację,
        // aby upewnić się, że nie utknęła.
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
  }, [actions]); // Zależność od `actions`, aby mieć pewność, że są załadowane.

  useFrame(() => {
    if (!localPlayerState || !ref || !('current' in ref) || !ref.current || !inputRef.current) return;

    // --- Logika animacji (bez zmian) ---
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

    // --- Interpolacja pozycji (bez zmian) ---
    targetPosition.set(
      localPlayerState.position.x,
      localPlayerState.position.y,
      localPlayerState.position.z,
    );
    ref.current.position.lerp(targetPosition, LERP_FACTOR);
  });

  useGLTF.preload('/character.glb');

  if (!localPlayerState) return null;

  return (
    // Zmieniamy strukturę: zewnętrzna grupa `ref` jest pozycjonowana przez serwer,
    // a wewnętrzna grupa kompensuje wysokość.
    <group ref={ref}>
      <group position-y={PLAYER_HEIGHT_OFFSET}> 
        <CharacterModel nodes={nodes} materials={materials} />
      </group>
    </group>
  );
});

export default LocalPlayer;