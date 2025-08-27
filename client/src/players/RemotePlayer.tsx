import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

import { useCharacterActionStore, type PlayerState } from '../state/Store';
import { CharacterModel, type GLTFResult } from '../models/Character';
import { WEAPON_CONFIG } from '../config/weaponConfig';

type ActionName = GLTFResult['animations'][number]['name'];

const targetPosition = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();
const LERP_FACTOR = 0.2;

type RemotePlayerProps = PlayerState & {
    id: string;
};

const RemotePlayer = ({ id, position, rotation, status, animationState, class: characterClass }: RemotePlayerProps) => {
    const groupRef = useRef<THREE.Group>(null!);
    
    const activeAction = useRef<ActionName>('idle');

    const { scene, animations } = useGLTF('/character.glb') as unknown as GLTFResult;
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;
    const { actions } = useAnimations(animations, groupRef);

    const lastAttackTimestamp = useCharacterActionStore((state) => state.actionTimestamps[id]);

    useFrame(() => {
        if (!characterClass || !actions) return;

        const attackAnimationName = WEAPON_CONFIG[characterClass]?.attackAnimation as ActionName;
        const attackAction = actions[attackAnimationName];

        let targetAction: ActionName;

        if (attackAction?.isRunning() && activeAction.current === attackAnimationName) {
            targetAction = attackAnimationName;
        } else {
            const serverState = status === 'dead' ? 'die' : animationState.toLowerCase();
            targetAction = serverState as ActionName;
        }
        
        if (lastAttackTimestamp > (groupRef.current as any)._lastProcessedAttack) {
            targetAction = attackAnimationName;
            (groupRef.current as any)._lastProcessedAttack = lastAttackTimestamp;
        }

        if (activeAction.current !== targetAction) {
            const oldAction = actions[activeAction.current];
            const newAction = actions[targetAction];
            
            if (!newAction) return; 

            oldAction?.fadeOut(0.2);
            newAction.reset().fadeIn(0.2).play();

            if (targetAction === 'die' || targetAction === attackAnimationName) {
                newAction.setLoop(THREE.LoopOnce, 1);
                newAction.clampWhenFinished = true;
            } else {
                newAction.setLoop(THREE.LoopRepeat, Infinity);
            }

            activeAction.current = targetAction;
        }
        
        if (position && rotation) {
            targetPosition.set(position.x, position.y, position.z);
            targetQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
            groupRef.current.position.lerp(targetPosition, LERP_FACTOR);
            groupRef.current.quaternion.slerp(targetQuaternion, LERP_FACTOR);
        }
    });

    useEffect(() => {
        if(groupRef.current) {
            (groupRef.current as any)._lastProcessedAttack = 0;
        }
    }, [])

    useGLTF.preload('/character.glb');

    if (!characterClass) {
        return null;
    }

    return (
        <group ref={groupRef} dispose={null}>
            <group position-y={-0.2}>
                <CharacterModel
                    nodes={nodes}
                    materials={materials}
                    characterClass={characterClass}
                    scale={0.1}
                />
            </group>
        </group>
    );
};

export default RemotePlayer;