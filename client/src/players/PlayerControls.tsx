import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import React, { useMemo, useRef } from 'react';
import { socket } from '../socket/socket';
import { useInputContext } from '../context/InputContext'; 
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const newPlayerRotation = new THREE.Quaternion();

const cameraOffset = new THREE.Vector3(0, 0.0, 0.5);
const idealCameraPosition = new THREE.Vector3();
const finalCameraPosition = new THREE.Vector3();
const rayFromPlayer = new THREE.Vector3();

export const PlayerControls = ({ environmentRef, playerRef }: {
    environmentRef: React.RefObject<THREE.Group>;
    playerRef: React.RefObject<THREE.Group>;
}) => {
    const { camera } = useThree();
    const sendTimer = useRef(0);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    
    const inputRef = useInputContext();

    useFrame((_state, delta) => {
        if (!playerRef.current || !environmentRef.current || !inputRef.current) return;

        euler.setFromQuaternion(camera.quaternion);
        euler.x = 0;
        euler.z = 0;
        newPlayerRotation.setFromEuler(euler);
        playerRef.current.quaternion.copy(newPlayerRotation);
        
        const playerPosition = playerRef.current.position;
        const rotatedOffset = cameraOffset.clone().applyQuaternion(camera.quaternion);
        idealCameraPosition.copy(playerPosition).add(rotatedOffset);

        rayFromPlayer.copy(playerPosition).add(new THREE.Vector3(0, 0.3, 0));
        const rayDirection = idealCameraPosition.clone().sub(rayFromPlayer).normalize();
        const rayLength = idealCameraPosition.distanceTo(rayFromPlayer);

        raycaster.set(rayFromPlayer, rayDirection);
        const intersects = raycaster.intersectObjects(environmentRef.current.children, true);

        const firstHit = intersects[0];
        if (firstHit && firstHit.distance < rayLength) {
            finalCameraPosition.copy(rayFromPlayer).add(rayDirection.multiplyScalar(firstHit.distance * 0.95));
        } else {
            finalCameraPosition.copy(idealCameraPosition);
        }
        camera.position.lerp(finalCameraPosition, 20 * delta);

        sendTimer.current += delta;
        if (sendTimer.current >= 1 / 60) {
            sendTimer.current = 0;
            const q = playerRef.current.quaternion;
            socket.emit("player-inputs", {
                rotation: [q.x, q.y, q.z, q.w],
                inputs: { ...inputRef.current },
            });
        }
    });

    return <PointerLockControls />;
};