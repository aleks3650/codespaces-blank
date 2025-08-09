import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { PlayerState } from "../state/Store";

const targetPosition = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();

const Player = (props: PlayerState) => {
    const ref = useRef<THREE.Group>(null!);

    useFrame((_state, _delta) => {
        targetPosition.set(props.position.x, props.position.y, props.position.z);
        targetQuaternion.set(props.rotation.x, props.rotation.y, props.rotation.z, props.rotation.w);

        ref.current.position.lerp(targetPosition, 0.2);
        ref.current.quaternion.slerp(targetQuaternion, 0.2);
    });

    return (
        <group ref={ref}>
            <mesh>
                <capsuleGeometry args={[0.1, 0.25]} />
                <meshStandardMaterial color="royalblue" />
            </mesh>
        </group>
    );
};

export default Player;