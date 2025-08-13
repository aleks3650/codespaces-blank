import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { socket } from "../socket/socket";
import { useInputControls } from "../hooks/useInputControls";
import React from "react";

const euler = new THREE.Euler(0, 0, 0, "YXZ");
const newPlayerRotation = new THREE.Quaternion();

const cameraOffset = new THREE.Vector3(0, 0.15, 0.5);
const targetCameraPosition = new THREE.Vector3();

export const PlayerControls = (
    { playerRef }: { playerRef: React.RefObject<THREE.Group> },
) => {
    const { camera } = useThree();
    const inputs = useInputControls();
    const sendTimer = React.useRef(0);

    useFrame((_state, delta) => {
        if (!playerRef.current) return;
        euler.setFromQuaternion(camera.quaternion);
        euler.x = 0;
        euler.z = 0;
        newPlayerRotation.setFromEuler(euler);

        playerRef.current.quaternion.copy(newPlayerRotation);

        const playerPosition = playerRef.current.position;
        targetCameraPosition.copy(playerPosition);
        const rotatedOffset = cameraOffset.clone().applyQuaternion(
            camera.quaternion,
        );
        targetCameraPosition.add(rotatedOffset);

        camera.position.lerp(targetCameraPosition, 20 * delta);

        sendTimer.current += delta;
        if (sendTimer.current >= 1 / 60) {
            sendTimer.current = 0;
            const q = playerRef.current.quaternion;
            socket.emit("player-inputs", {
                rotation: [q.x, q.y, q.z, q.w],
                inputs: { ...inputs.current }, 
            });
        }
    });

    return <PointerLockControls />;
};
