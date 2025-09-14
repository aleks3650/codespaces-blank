import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '../socket/socket';
import { useInputContext } from '../context/InputContext';
import { useCharacterActionStore, useRefStore, useSocketStore } from '../state/Store';

import { useAbilityStore } from '../state/Store';
import { abilityData } from '../constants/classes';
import { useNotificationStore } from '../state/NotificationStore';

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const newPlayerRotation = new THREE.Quaternion();

const cameraOffset = new THREE.Vector3(0, 0.08, 0.4);

const idealCameraPosition = new THREE.Vector3();
const finalCameraPosition = new THREE.Vector3();
const rayFromPlayer = new THREE.Vector3();
const screenCenter = new THREE.Vector2(0, 0);

export const PlayerControls = () => {
    const { camera } = useThree();
    const sendTimer = useRef(0);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const [isLocked, setIsLocked] = useState(false);
    const inputRef = useInputContext();
    const playerRef = useRefStore((state) => state.playerRef);
    const environmentRef = useRefStore((state) => state.environmentRef);
    const triggerCast = useCharacterActionStore((state) => state.triggerCast);

    const { selectedAbilityId, isAbilityOnCooldown, startCooldown } = useAbilityStore();

        const addNotification = useNotificationStore((state) => state.addNotification);

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            const localPlayerStatus = useSocketStore.getState().players[socket.id!]?.status;
            if (!isLocked || event.button !== 0 || localPlayerStatus === 'dead' || !playerRef?.current) {
                return;
            }

            if (!selectedAbilityId) {
                console.warn("No ability selected to use.");
                return;
            }

            if (isAbilityOnCooldown(selectedAbilityId)) {
                console.log(`Ability ${selectedAbilityId} is on cooldown.`);
                addNotification(`${selectedAbilityId} is not ready!`, 'error')
                return;
            }

            const abilityDef = abilityData.get(selectedAbilityId);
            if (!abilityDef) {
                console.error(`Ability definition for ${selectedAbilityId} not found on client.`);
                return;
            }

            raycaster.setFromCamera(screenCenter, camera);
            const sceneObjects = environmentRef?.current?.children ?? [];
            const intersects = raycaster.intersectObjects(sceneObjects, true);

            let targetPoint = new THREE.Vector3();
            if (intersects.length > 0) {
                targetPoint = intersects[0].point;
            } else {
                targetPoint = raycaster.ray.at(100, targetPoint);
            }

            const spellOrigin = new THREE.Vector3();
            playerRef.current.getWorldPosition(spellOrigin);
            spellOrigin.y += 0.03;

            const correctedDirection = targetPoint.sub(spellOrigin).normalize();

            socket.emit("player-action", {
                actionType: "useAbility", 
                payload: {
                    abilityId: selectedAbilityId, 
                    direction: [correctedDirection.x, correctedDirection.y, correctedDirection.z],
                }
            });

            startCooldown(selectedAbilityId, abilityDef.cooldown);

            triggerCast(socket.id!, selectedAbilityId);
        };

        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [camera, playerRef, environmentRef, triggerCast, isLocked, raycaster, selectedAbilityId, isAbilityOnCooldown, startCooldown, addNotification]); // Dodajemy nowe zależności do hooka


    useFrame((_state, delta) => {
        const localPlayerStatus = useSocketStore.getState().players[socket.id!]?.status;
        if (!playerRef?.current || !environmentRef?.current || !inputRef.current || localPlayerStatus === 'dead') {
            return;
        }

        euler.setFromQuaternion(camera.quaternion);
        euler.x = 0;
        euler.z = 0;
        newPlayerRotation.setFromEuler(euler);
        playerRef.current.quaternion.copy(newPlayerRotation);

        const playerPosition = playerRef.current.position;
        const rotatedOffset = cameraOffset.clone().applyQuaternion(camera.quaternion);
        idealCameraPosition.copy(playerPosition).add(rotatedOffset);

        rayFromPlayer.copy(playerPosition).add(new THREE.Vector3(0, 0.03, 0));

        const rayDirection = idealCameraPosition.clone().sub(rayFromPlayer).normalize();
        const rayLength = idealCameraPosition.distanceTo(rayFromPlayer);
        raycaster.set(rayFromPlayer, rayDirection);
        const intersects = raycaster.intersectObjects(environmentRef.current.children, true);

        const firstHit = intersects[0];
        if (firstHit && firstHit.distance < rayLength) {
            finalCameraPosition.copy(rayFromPlayer).add(rayDirection.multiplyScalar(firstHit.distance * 0.9));
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

    return (
        <PointerLockControls
            onLock={() => setIsLocked(true)}
            onUnlock={() => setIsLocked(false)}
        />
    );
};