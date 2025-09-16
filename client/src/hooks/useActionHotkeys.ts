import { useEffect } from 'react';
import { useSocketStore, useActionStore } from '../state/Store'; 
import { classData } from '../constants/classes';
import { socket } from '../socket/socket';

export const useActionHotkeys = () => {
    const localPlayer = useSocketStore((state) => state.players[socket.id!]);
    const { selectAction } = useActionStore(); 
    const inventory = useSocketStore((state) => state.players[socket.id!]?.inventory ?? []);

    useEffect(() => {
        if (localPlayer?.class) {
            const playerAbilities = classData.get(localPlayer.class)?.abilities;
            if (playerAbilities && playerAbilities.length > 0) {
                selectAction({ type: 'ability', id: playerAbilities[0] });
            }
        }
    }, [localPlayer?.class, selectAction]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat || !localPlayer?.class) return;

            const playerAbilities = classData.get(localPlayer.class)?.abilities ?? [];
            let abilityIndex = -1;
            if (e.code === 'Digit1') abilityIndex = 0;
            if (e.code === 'Digit2') abilityIndex = 1;
            if (abilityIndex !== -1 && playerAbilities[abilityIndex]) {
                selectAction({ type: 'ability', id: playerAbilities[abilityIndex] });
                return;
            }

            let itemSlotIndex = -1;
            if (e.code === 'Digit5') itemSlotIndex = 0;
            if (e.code === 'Digit6') itemSlotIndex = 1;

            if (itemSlotIndex !== -1 && inventory[itemSlotIndex]) {
                selectAction({ 
                    type: 'item', 
                    id: inventory[itemSlotIndex].itemId, 
                    inventorySlot: itemSlotIndex 
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [localPlayer, inventory, selectAction]);
};
