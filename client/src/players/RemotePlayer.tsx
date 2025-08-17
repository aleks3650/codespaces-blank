import { useFrame, useGraph } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import type { AnimationState, PlayerState } from "../state/Store";
import { CharacterModel, type GLTFResult } from "../models/Character"; 

const targetPosition = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();

const PLAYER_HEIGHT_OFFSET = -0.2; 

const RemotePlayer = ({ position, rotation, animationState }: PlayerState) => {
    const groupRef = useRef<THREE.Group>(null!);
    const currentAction = useRef<AnimationState>('idle');

    const { scene, animations } = useGLTF('/character.glb') as unknown as GLTFResult;
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;

    const { actions } = useAnimations(animations, groupRef);

    useEffect(() => {
        actions.idle?.fadeIn(0.2).play();
        return () => {
            Object.values(actions).forEach(action => action?.fadeOut(0.2));
        };
    }, [actions]);

    useEffect(() => {
        const newAction = animationState;
        
        if (currentAction.current !== newAction) {
            const oldAction = actions[currentAction.current];
            const nextAction = actions[newAction];
            
            oldAction?.fadeOut(0.2);
            nextAction?.reset().fadeIn(0.2).play();
            
            currentAction.current = newAction;
        }
    }, [animationState, actions]);


    useFrame(() => {
        if (!position || !rotation) return;
        
        targetPosition.set(position.x, position.y, position.z);
        targetQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

        groupRef.current.position.lerp(targetPosition, 0.2);
        groupRef.current.quaternion.slerp(targetQuaternion, 0.2);
    });

    return (
        <group ref={groupRef}>
            <group position-y={PLAYER_HEIGHT_OFFSET}>
                <CharacterModel nodes={nodes} materials={materials} />
            </group>
        </group>
    );
};

export default RemotePlayer;