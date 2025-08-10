import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { socket } from "../socket/socket";

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const newPlayerRotation = new THREE.Quaternion();

const cameraOffset = new THREE.Vector3(0, 0.15, 0.5); 
const targetCameraPosition = new THREE.Vector3();


export const PlayerControls = ({ playerRef }: { playerRef: React.RefObject<THREE.Group> }) => {
    const { camera } = useThree();

    useFrame((_state, delta) => {
        if (!playerRef.current) return;

        euler.setFromQuaternion(camera.quaternion);
        euler.x = 0; 
        euler.z = 0;
        newPlayerRotation.setFromEuler(euler);

        playerRef.current.quaternion.slerp(newPlayerRotation, 0.2);

        socket.emit("player-rotation", newPlayerRotation);

        const playerPosition = playerRef.current.position;
        targetCameraPosition.copy(playerPosition);
        const rotatedOffset = cameraOffset.clone().applyQuaternion(camera.quaternion);
        targetCameraPosition.add(rotatedOffset);

        camera.position.lerp(targetCameraPosition, 20 * delta);
    });

    return <PointerLockControls />;
};