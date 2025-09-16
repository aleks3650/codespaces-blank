import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { useCharacterActionStore, type PlayerState } from '../state/Store';
import { CharacterModel, type GLTFResult, type ActionName } from '../models/Character';
import { WEAPON_CONFIG } from '../config/weaponConfig';
import { useCharacterAnimations } from '../hooks/useCharacterAnimations'; 
const targetPosition = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();
const LERP_FACTOR = 0.2;
type RemotePlayerProps = PlayerState & { id: string };

const RemotePlayer = ({ id, position, rotation, status, animationState, class: characterClass }: RemotePlayerProps) => {
    const groupRef = useRef<THREE.Group>(null!);
    const activeAction = useRef<ActionName>('idle');

    const { scene, animations } = useGLTF('/character.glb') as unknown as GLTFResult;
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;
    const { actions } = useAnimations(animations, groupRef);

    const lastAction = useCharacterActionStore((state) => state.actions[id]);

    useEffect(() => {
        actions.idle?.play();
        if (groupRef.current) {
            (groupRef.current as any)._lastProcessedAction = 0;
        }
    }, [actions.idle]);

    useFrame(() => {
        if (!characterClass || !actions || !position || !rotation) return;
        useCharacterAnimations({
            actions,
            activeAction,
            playerRef: groupRef,
            lastAction,
            config: WEAPON_CONFIG[characterClass],
            status,
            animationState,
        });

        targetPosition.set(position.x, position.y, position.z);
        targetQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        groupRef.current.position.lerp(targetPosition, LERP_FACTOR);
        groupRef.current.quaternion.slerp(targetQuaternion, LERP_FACTOR);
    });

    useGLTF.preload('/character.glb');
    if (!characterClass) return null;

    return (
        <group ref={groupRef} dispose={null}>
            <group position-y={-0.045}>
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