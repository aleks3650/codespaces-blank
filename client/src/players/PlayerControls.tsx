import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '../socket/socket';
import { useInputContext } from '../context/InputContext';
import { useActionStore, useCharacterActionStore, useRefStore, useSocketStore } from '../state/Store';
import { abilityData } from '../constants/classes';
import { itemData } from '../constants/items';
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
    const triggerAction = useCharacterActionStore((state) => state.triggerAction);

    const {
        selectedAction,
        isAbilityOnCooldown,
        startAbilityCooldown,
        consumableCooldownEndsAt,
        startConsumableCooldown,
    } = useActionStore();
    const addNotification = useNotificationStore((state) => state.addNotification);

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            const localPlayerStatus = useSocketStore.getState().players[socket.id!]?.status;
            if (!isLocked || event.button !== 0 || localPlayerStatus === 'dead' || !playerRef?.current || !selectedAction) {
                return;
            }

            switch (selectedAction.type) {
                case 'ability': {
                    const { id: abilityId } = selectedAction;
                    if (isAbilityOnCooldown(abilityId)) {
                        addNotification(`${abilityId} is not ready!`, 'error');
                        return;
                    }
                    const abilityDef = abilityData.get(abilityId);
                    if (!abilityDef) return;

                    raycaster.setFromCamera(screenCenter, camera);
                    const sceneObjects = environmentRef?.current?.children ?? [];
                    const intersects = raycaster.intersectObjects(sceneObjects, true);

                    let targetPoint = new THREE.Vector3();
                    targetPoint = intersects.length > 0 ? intersects[0].point : raycaster.ray.at(100, targetPoint);
                    
                    const spellOrigin = new THREE.Vector3();
                    playerRef.current.getWorldPosition(spellOrigin);
                    spellOrigin.y += 0.03;

                    const correctedDirection = targetPoint.sub(spellOrigin).normalize();
                    
                    socket.emit("player-action", {
                        actionType: "useAbility", 
                        payload: { abilityId, direction: [correctedDirection.x, correctedDirection.y, correctedDirection.z] }
                    });

                    startAbilityCooldown(abilityId, abilityDef.cooldown);
                    triggerAction(socket.id!, abilityId);
                    break;
                }

                case 'item': {
                    if (Date.now() < consumableCooldownEndsAt) {
                        const remaining = Math.ceil((consumableCooldownEndsAt - Date.now()) / 1000);
                        addNotification(`Items are on cooldown (${remaining}s left)`, 'error');
                        return;
                    }
                    const itemDef = itemData.get(selectedAction.id);
                    if (!itemDef) return;

                    socket.emit("player-action", {
                        actionType: "useItem",
                        payload: { inventorySlot: selectedAction.inventorySlot }
                    });

                    startConsumableCooldown(itemDef.cooldownMs);
                    triggerAction(socket.id!, 'use_item');
                    break;
                }
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [
        camera, playerRef, environmentRef, triggerAction, isLocked, raycaster,
        selectedAction, isAbilityOnCooldown, startAbilityCooldown,
        consumableCooldownEndsAt, startConsumableCooldown, addNotification
    ]);

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
        const firstHit = intersects.find(hit => hit.object.uuid !== playerRef.current?.uuid);

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