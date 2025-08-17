import { useFrame, useGraph } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import type { AnimationState, PlayerState } from "../state/Store";
import { CharacterModel, type GLTFResult } from "../models/Character";

const targetPosition = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();
const PLAYER_HEIGHT_OFFSET = -0.2;

type ActionName = AnimationState | 'die';

const RemotePlayer = ({ position, rotation, status }: PlayerState) => {
    const groupRef = useRef<THREE.Group>(null!);
    const currentAction = useRef<ActionName>('idle');

    const { scene, animations } = useGLTF('/character.glb') as unknown as GLTFResult;
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;
    const { actions } = useAnimations(animations, groupRef);

    const [derivedAnimationState, setDerivedAnimationState] = useState<AnimationState>('idle');
    const lastPosition = useRef(new THREE.Vector3());

    useEffect(() => {
        const targetActionName: ActionName = status === 'dead' ? 'die' : derivedAnimationState;

        if (currentAction.current === targetActionName) return;

        const oldAction = actions[currentAction.current];
        const newAction = actions[targetActionName];

        oldAction?.fadeOut(0.2);

        if (newAction) {
            newAction.reset().fadeIn(0.2).play();

            if (targetActionName === 'die') {
                newAction.setLoop(THREE.LoopOnce, 1);
                newAction.clampWhenFinished = true;
            } else {
                newAction.setLoop(THREE.LoopRepeat, Infinity);
            }
        }

        currentAction.current = targetActionName;
    }, [derivedAnimationState, status, actions]);


    useFrame(() => {
        if (!position) return;
        const currentPositionVec = new THREE.Vector3(position.x, position.y, position.z);
        if (status === 'alive') {
            if (lastPosition.current.length() === 0) {
                lastPosition.current.copy(currentPositionVec);
            }
            const distance = currentPositionVec.distanceTo(lastPosition.current);
            const newAnimState: AnimationState = distance > 0.001 ? 'walk' : 'idle';

            if (derivedAnimationState !== newAnimState) {
                setDerivedAnimationState(newAnimState);
            }

            lastPosition.current.copy(currentPositionVec);
        } else {
            lastPosition.current.set(0, 0, 0);
        }

        if (status === 'alive' && rotation) {
            targetPosition.set(position.x, position.y, position.z);
            targetQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

            groupRef.current.position.lerp(targetPosition, 0.2);
            groupRef.current.quaternion.slerp(targetQuaternion, 0.2);
        }
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