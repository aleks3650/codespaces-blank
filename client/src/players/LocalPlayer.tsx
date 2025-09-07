import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

import { useCharacterActionStore, useRefStore, useSocketStore } from '../state/Store';
import { socket } from '../socket/socket';
import { CharacterModel, type GLTFResult } from '../models/Character';
import { WEAPON_CONFIG } from '../config/weaponConfig';

type ActionName = GLTFResult['animations'][number]['name'];

const targetPosition = new THREE.Vector3();
const LERP_FACTOR = 0.2;

const selectLocalPlayer = (state: ReturnType<typeof useSocketStore.getState>) => {
    return state.players[socket.id!];
};

const LocalPlayer = () => {
    const localPlayerState = useSocketStore(selectLocalPlayer);
    const playerRef = useRef<THREE.Group>(null!);
    const setPlayerRef = useRefStore((state) => state.setPlayerRef);
    const activeAction = useRef<ActionName>('idle');

    const { scene, animations } = useGLTF('/character.glb') as unknown as GLTFResult;
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;
    const { actions } = useAnimations(animations, playerRef);

    const lastAction = useCharacterActionStore((state) => state.actions[socket.id!]);

    useEffect(() => {
        setPlayerRef(playerRef);
        actions.idle?.play();
        return () => setPlayerRef(null!);
    }, [setPlayerRef, actions.idle]);

    useFrame(() => {
        if (!localPlayerState?.class || !actions) return;

        const { status, animationState } = localPlayerState;
        const config = WEAPON_CONFIG[localPlayerState.class];
        let targetAction: ActionName;

        if (lastAction && lastAction.timestamp > (playerRef.current as any)._lastProcessedAttack) {
            const specificAnimation = config.abilityAnimations[lastAction.abilityId];
            targetAction = (specificAnimation || config.attackAnimation) as ActionName;

            (playerRef.current as any)._lastProcessedAttack = lastAction.timestamp;
        } else {
            const currentAttackAnimation = actions[activeAction.current];
            if (currentAttackAnimation?.isRunning() && activeAction.current.includes('attack')) {
                targetAction = activeAction.current;
            } else {
                const serverState = status === 'dead' ? 'die' : animationState.toLowerCase();
                targetAction = serverState as ActionName;
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

        targetPosition.set(localPlayerState.position.x, localPlayerState.position.y, localPlayerState.position.z);
        playerRef.current.position.lerp(targetPosition, LERP_FACTOR);
    });
    
    useEffect(() => {
        if(playerRef.current) {
            (playerRef.current as any)._lastProcessedAttack = 0;
        }
    }, []);

    useGLTF.preload('/character.glb');

    if (!localPlayerState?.class) return null;

    return (
        <group ref={playerRef} dispose={null}>
            <group position-y={-0.045}>
                <CharacterModel
                    nodes={nodes}
                    materials={materials}
                    characterClass={localPlayerState.class}
                    scale={0.1}
                />
            </group>
        </group>
    );
};

export default LocalPlayer;