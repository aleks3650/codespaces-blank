import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSocketStore } from "../state/Store";
import { socket } from "../socket/socket";
import { forwardRef } from "react";

const targetPosition = new THREE.Vector3();

const LocalPlayer = forwardRef<THREE.Group>((_props, ref) => {
    const localPlayerState = useSocketStore((state) =>
        state.players[socket.id!]
    );

    useFrame(() => {
        if (!localPlayerState || !ref || !("current" in ref) || !ref.current) return;

        targetPosition.set(
            localPlayerState.position.x,
            localPlayerState.position.y,
            localPlayerState.position.z,
        );
        ref.current.position.lerp(targetPosition, 0.2);
    });

    if (!localPlayerState) return null;

    return (
        <group ref={ref}>
            <mesh castShadow>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color="orange" />
            </mesh>
        </group>
    );
});

export default LocalPlayer;