import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { PlayerState } from "../state/Store";

const targetPosition = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();

const RemotePlayer = ({ position, rotation }: PlayerState) => {
    const ref = useRef<THREE.Group>(null!);

    useFrame(() => {
        targetPosition.set(position.x, position.y, position.z);
        targetQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

        ref.current.position.lerp(targetPosition, 0.2);
        ref.current.quaternion.slerp(targetQuaternion, 0.2);
    });

    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color="royalblue" />
            </mesh>
        </group>
    );
};

export default RemotePlayer;